---
name: task-orchestrator
description: Orquestra tasks pendentes de uma spec em ondas de dependência, com worktrees por task, workers isolados (context_task_XX.md) e integração centralizada. Executa todas as ondas até zerar pending em _tasks.md. Genérico para qualquer layout Git (monorepo ou multi-repo). Workers usam execute-orchestrated-task. Use para executar uma spec inteira em paralelo. Não use para uma task isolada.
---

# Task Orchestrator

Execute automaticamente todas as tasks pendentes de uma spec com paralelismo seguro.

- **Orquestrador:** gerencia subagents, Git (worktrees, cherry-pick) e `_tasks.md`.
- **Workers:** implementam e concluem `task_NN.md` via `/execute-orchestrated-task`.

## Uso

```bash
/task-orchestrator .specs/<feature-name>/
```

O argumento é o caminho do diretório da spec relativo à raiz do workspace.

## Divisão de responsabilidades

| Responsável | Artefato | O quê |
|-------------|----------|-------|
| **Worker** | `task_NN.md` | Checkboxes, frontmatter `completed`, validação — via `execute-orchestrated-task` |
| **Worker** | Código | Commits na branch `task/<spec-slug>/task_NN` no worktree |
| **Orquestrador** | `_tasks.md` | **Único dono** — `completed` somente após cherry-pick |
| **Orquestrador** | Git | Worktrees, ondas, integração em `orchestrator/<spec-slug>`, cleanup |

Workers **nunca** escrevem `_tasks.md`. O `execute-orchestrated-task` foi criado para isso — não use `execute-task` nos workers.

## Objetivo

- Respeitar dependências em **ondas** (cross-repo quando aplicável).
- Isolar implementação por task via **git worktree** no `git_root` correto.
- Integrar código **somente no orquestrador** (cherry-pick ou merge).
- **Executar todas as ondas numa sessão**, sem parar entre elas.

## Regra de ouro

> **Uma onda integrada ≠ spec concluída.**
>
> Encerre somente quando `_tasks.md` tiver **zero** linhas com status `pending`.
> Após integrar onda N, inicie onda N+1 na mesma sessão se houver elegíveis.
> Retorno de subagent ≠ fim do orchestrator.

### Após cada onda — checklist obrigatório

1. Ler `<spec_dir>/_tasks.md` do disco.
2. Contar: `pending`, `completed`, `failed`.
3. Se `pending` > 0 e há elegíveis → **Micro-relatório** e **Fase 4 imediata**.
4. Se `pending` > 0 sem elegíveis → corrigir tracking ou marcar `failed`.
5. Só se `pending` = 0 → **Relatório Final**.

```md
## Task Orchestrator — Onda <N> integrada

- Integradas: task_A, task_B
- Tracking: <P> pending · <C> completed · <F> failed
- **Próxima ação:** iniciando onda <N+1> agora.
```

Máximo 6 linhas; **continue executando** sem esperar o usuário.

### O que NÃO fazer

- Não emitir "Concluído" com `pending` > 0.
- Não pedir "deseja continuar?" entre ondas.
- Não usar `execute-task` nos workers — use `execute-orchestrated-task`.

## Isolamento de contexto

Cada worker = nova sessão (`Task`, `run_in_background: true`).

Persiste entre tasks:

- Commits nas branches de task
- `task_NN.md` (worker)
- `_tasks.md` (orquestrador)
- Conjunto `integrated_tasks`
- JSON de retorno

Passe aos workers apenas caminhos absolutos + `context_task_XX.md` — sem histórico de conversas.

Após JSON: deletar `context_task_XX.md`; nunca reutilizar sessão.

## Inputs obrigatórios

- `spec_dir` — contém `_tasks.md`, `_prd.md`, `_techspec.md`, `task_NN.md`.

## Fase 1 — Spec, Git e grafo

### 1.1 Spec e dependências

1. `<spec_dir>/_tasks.md` — tabela: `#` → `task_NN`, Status, Dependencies.
2. `<spec_dir>/_prd.md` e `<spec_dir>/_techspec.md`.
3. `<spec_dir>/task_NN.md` para tasks `pending`.

Valide IDs, ausência de ciclos, formato `task_01` (não `task_1`).

Defina:

- `spec_slug` = nome do diretório da spec
- `WORKSPACE_ROOT` = raiz do workspace (absoluto)
- `integrated_tasks` = tasks já `completed` no mestre **e** confirmadas por integração anterior

**Elegível:** status `pending` em `_tasks.md` e todas deps ∈ `integrated_tasks`.

### 1.2 Detecção Git (genérica)

```bash
WORKSPACE_ROOT="<absoluto>"

git -C "$WORKSPACE_ROOT" rev-parse --is-inside-work-tree 2>/dev/null && echo monorepo

for d in "$WORKSPACE_ROOT"/*/; do
  git -C "$d" rev-parse --is-inside-work-tree 2>/dev/null && echo "git-root: $d"
done
```

| Modo | Worktrees |
|------|-----------|
| **monorepo** | `$WORKSPACE_ROOT/.worktrees/<spec-slug>/task_NN` |
| **multi-repo** | `<git-root>/.worktrees/<spec-slug>/task_NN` |
| **sem Git** | Parar Fase 3 |

A spec pode ficar **fora** de qualquer Git.

### 1.3 Task → git_root

Para cada task `pending`:

1. Leia paths em `task_NN.md` (requirements, Relevant Files, Implementation Details).
2. Mapeie cada path ao `git_root` que o contém.
3. Todos no mesmo root → OK.
4. Paths cruzando roots distintos → serializar ou `failed`.
5. Sem paths → use único root; ambíguo → perguntar na Fase 2.

Monte: `task_id → git_root`, `task_id → depends_on[]`.

## Fase 2 — Planejamento e confirmação

```md
## Task Orchestrator — Roteiro de Execução

Modo: monorepo | multi-repo
Spec: <spec_dir>
Workspace: <WORKSPACE_ROOT>

| Git root | Branch orquestração | Worktrees |
|----------|---------------------|-----------|
| <path>   | orchestrator/<spec-slug> | <git-root>/.worktrees/<spec-slug>/task_NN |

Concorrência: 4 · Integração: cherry-pick · Worker skill: execute-orchestrated-task

| Onda | Tasks | Git roots | Aguarda |
|------|-------|-----------|---------|
| 1    | ...   | ...       | —       |

Total: N tasks · M ondas
Já integradas: <lista>
```

Informe branch atual por `git_root`. Confirmação **uma única vez** antes da Fase 3.

## Loop principal (Fases 4 → 5 → 6)

```
wave := 1
integrated_tasks := { já confirmadas }

loop:
  pending := count(_tasks.md, "pending")
  if pending == 0: goto FINAL_REPORT

  eligible := pending com deps ⊆ integrated_tasks
  if eligible empty and pending > 0: goto HANDLE_BLOCKED

  run_wave(eligible, max_parallel=4)
  integrate_and_update_master()
  write_checkpoint()
  emit MICRO_REPORT(wave)
  STOP_CHECK
  wave += 1
  goto loop

FINAL_REPORT
```

**STOP CHECK:** se `pending` > 0, **não encerre** — volte ao loop.

## Retomar execução

1. Ler `<spec_dir>/.orchestrator_checkpoint`, depois `_tasks.md`.
2. Reconstruir `integrated_tasks`.
3. `git checkout orchestrator/<spec-slug>` em cada `git_root` ativo.
4. Entrar no loop sem novo roteiro completo.

## Fase 3 — Preparação Git

Por `git_root` usado:

```bash
git -C "$GIT_ROOT" checkout -B "orchestrator/<spec-slug>" "$base_branch"
mkdir -p "$GIT_ROOT/.worktrees/<spec-slug>"
```

Convenções:

- Orquestração: `orchestrator/<spec-slug>`
- Task: `task/<spec-slug>/task_NN`
- Worktree: `$GIT_ROOT/.worktrees/<spec-slug>/task_NN`

### Symlink `node_modules` (macOS)

Após `git worktree add`, antes do worker:

```bash
find "$GIT_ROOT" -name package.json -not -path "*/node_modules/*" | while read -r pkg; do
  dir=$(dirname "$pkg")
  rel="${dir#$GIT_ROOT/}"
  [ "$rel" = "$dir" ] && rel="."
  src="$GIT_ROOT/$rel/node_modules"
  dst="$WT_PATH/$rel/node_modules"
  [ -d "$src" ] && [ ! -e "$dst" ] && ln -s "$src" "$dst"
done
```

Workers **não** rodam install.

## Fase 4 — Execução em ondas

Início de **cada** iteração: reler `_tasks.md`.

1. Onda = tasks `pending` elegíveis (deps ⊆ `integrated_tasks`).
2. Máximo 4 por lote.
3. Mesmo `git_root` + módulo compartilhado → serializar; em dúvida, serializar.
4. `git_root` diferentes → paralelo.

### Por task no lote

**a) Worktree**

```bash
git -C "$GIT_ROOT" worktree add \
  ".worktrees/<spec-slug>/task_NN" \
  -b "task/<spec-slug>/task_NN" \
  "orchestrator/<spec-slug>"
```

**b) Symlink node_modules** (se aplicável).

**c) Context Builder (orquestrador, inline)**

Gravar `<spec_dir>/context_task_NN.md`:

```md
# Contexto — task_NN

## Requisitos do PRD
<!-- seções extraídas -->

## Especificação Técnica
<!-- seções extraídas -->

## Estado de dependências
<!-- dep integrada: task_id + summary do JSON -->
```

**d) Worker** (`Task`, `run_in_background: true`)

```md
Você é um worker isolado para <task_id>.
Não fale com o usuário. Sessão nova, sem histórico.

Use execute-orchestrated-task com:
- task_file: <spec_dir>/task_NN.md
- spec_dir: <spec_dir>
- context_file: <spec_dir>/context_task_NN.md
- worktree_path: <WT_PATH>
- git_root: <GIT_ROOT>
- auto_commit: true

Leia antes (se existirem):
- <WORKSPACE_ROOT>/AGENTS.md ou CLAUDE.md
- <GIT_ROOT>/AGENTS.md ou CLAUDE.md

Retorno (somente JSON):
{
  "task_id": "task_NN",
  "git_root": "<GIT_ROOT>",
  "status": "done|failed",
  "branch": "task/<spec-slug>/task_NN",
  "commits": ["<sha>"],
  "task_file_status": "completed|unchanged|failed",
  "summary": "resumo pt-BR",
  "error": ""
}
```

**e)** Aguardar **todos** os workers antes da Fase 5.

## Fase 5 — Integração e `_tasks.md`

Por worker com `status=done`:

1. Validar `task_NN.md`: frontmatter `completed` + checkboxes. Incompleto → `failed`, não integrar.
2. `git -C "$GIT_ROOT" checkout orchestrator/<spec-slug>`
3. Cherry-pick:
   ```bash
   git -C "$GIT_ROOT" cherry-pick <SHA1> <SHA2> ...
   ```
4. Se OK:
   - `integrated_tasks` += task_id
   - `_tasks.md` → `completed` (**único escritor**)
   - Deletar `context_task_NN.md`
   - Cleanup worktree
5. Conflito → `failed` ou pausar.

## Fase 6 — Revalidação

1. Reler `_tasks.md`.
2. Conferir JSON ↔ commits ↔ `task_NN.md` ↔ mestre.
3. Gravar `.orchestrator_checkpoint`:

```json
{
  "spec_dir": "<spec_dir>",
  "spec_slug": "<spec-slug>",
  "last_wave": 2,
  "integrated_tasks": ["task_01"],
  "pending": 3,
  "failed": []
}
```

4. Se `pending` > 0 → Micro-relatório + Fase 4.
5. Apagar checkpoint quando `pending` = 0.

## Regras de paralelismo

| Situação | Comportamento |
|----------|---------------|
| Dep ∉ `integrated_tasks` | Nunca iniciar |
| `git_root` diferentes | Paralelo |
| Mesmo `git_root`, mesmo módulo | Serializar |
| Lote > 4 | Dividir |

## Tratamento de erros

| Erro | Ação |
|------|------|
| Sem Git | Parar Fase 3 |
| `worktree_creation_failed` | Retentar / abortar |
| `worker_no_commit` | Falha |
| `task_file_incomplete` | Não integrar |
| `cherry_pick_conflict` | Pausar repo |

## Cleanup (macOS)

```bash
WT_ABS="$GIT_ROOT/.worktrees/<spec-slug>/task_NN"
find "$WT_ABS" -name node_modules -type l -exec rm {} \;
git -C "$GIT_ROOT" worktree remove ".worktrees/<spec-slug>/task_NN"
git -C "$GIT_ROOT" branch -D "task/<spec-slug>/task_NN"
```

Tasks `failed`: manter worktree para debug.

## Relatório final

```md
## Task Orchestrator — Concluído

✅ tasks: N/N · ❌ falhas: F · 🌊 ondas: M
Integração: <git-root> → orchestrator/<spec-slug>
📋 tracking: <spec_dir>/_tasks.md
```

## Guardrails

- Nunca encerrar com `pending` > 0.
- Nunca marcar `completed` em `_tasks.md` antes do cherry-pick.
- Elegibilidade de onda via `integrated_tasks`, não suposições.
- Workers usam **execute-orchestrated-task** — nunca `execute-task`.
- Workers concluem `task_NN.md` por completo; orquestrador valida antes de integrar.
- STOP CHECK antes de mensagens de conclusão.
- Sem PRD/TechSpec inteiros no worker — use `context_task_XX.md`.

## Modos degradados (confirmação explícita)

| Modo | Risco |
|------|-------|
| Sem worktree | Conflitos em edição paralela |
| Serial total | Mais lento |
| `max_parallel=1` | Mais seguro |

## Idioma

pt-BR.
