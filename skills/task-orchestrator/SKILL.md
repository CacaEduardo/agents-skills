---
name: task-orchestrator
description: Orquestra tasks pendentes de uma spec em ondas de dependência, com worktrees por task e integração centralizada. Suporta layout multi-repo (api/, admin/, app/ com Git separados e spec na raiz sem Git) e monorepo único. Use quando o usuário quiser executar uma spec inteira em paralelo sem conflito de arquivos. Não use para uma task isolada.
---

# Task Orchestrator

Execute automaticamente todas as tasks pendentes de uma spec com paralelismo seguro e tracking centralizado.

## Uso

```bash
/task-orchestrator .specs/<feature-name>/
```

O argumento é o caminho do diretório da spec relativo à raiz do workspace (ex.: `.specs/painel-admin-gestao-completa/`).

## Objetivo

- Respeitar o grafo de dependências em **ondas** (incluindo deps entre `[API]` e `[Admin]`).
- Isolar implementação por task via **git worktree** no repositório correto.
- Integrar código **somente no orquestrador** (cherry-pick ou merge na branch de orquestração de cada repo).
- Atualizar `<spec_dir>/_tasks.md` **somente no orquestrador** (sem concorrência).

## Inputs obrigatórios

- `spec_dir` — diretório da spec (contém `_tasks.md`, `_prd.md`, `task_NN.md`).

## Layout do repositório (detectar na Fase 1)

Antes de planejar ondas, detecte o modo de execução:

```bash
# Na raiz do workspace (pai de api/, admin/, spec/)
git rev-parse --is-inside-work-tree 2>/dev/null && echo monorepo-candidate

# Por subprojeto
for d in api admin app; do
  git -C "$d" rev-parse --is-inside-work-tree 2>/dev/null && echo "repo: $d"
done
```

| Modo | Condição | Onde criar worktrees / branches |
|------|----------|----------------------------------|
| **multi-repo** (padrão 1Trainer) | Raiz **sem** Git; `api/`, `admin/` e/ou `app/` **com** Git | Dentro de cada `<repo>/` usado pela task |
| **monorepo** | Raiz **com** Git | Na raiz: `.worktrees/<spec-slug>/task_XX` |

Se **nenhum** caminho tiver Git: pare na Fase 3 e informe o usuário (não há isolamento por worktree).

A spec (`.specs/...`) pode ficar **fora** de qualquer repositório Git — isso é esperado no layout multi-repo.

### Mapeamento task → repositório

Pelo prefixo do título em `_tasks.md`:

| Prefixo | `repo_key` | Diretório |
|---------|------------|-----------|
| `[API]` | `api` | `api/` |
| `[Admin]` | `admin` | `admin/` |
| `[App]` | `app` | `app/` |

Monte também: `task -> repo_key`, `task -> depends_on[]`.

**Dependências cross-repo:** uma task `[Admin]` que depende de `task_03` `[API]` só entra na onda quando `task_03` estiver `done` no `_tasks.md`, mesmo com worktrees em repositórios diferentes. Não há merge Git entre `api` e `admin` — o contrato é de API pronta + tracking atualizado.

## Fase 1 — Estudo da spec e grafo

1. `<spec_dir>/_tasks.md` — `id`, título, `status`, dependências; valide IDs e ausência de ciclos.
2. `<spec_dir>/_prd.md` e `<spec_dir>/_techspec.md`.
3. `<spec_dir>/task_NN.md` apenas para tasks `pending`.

Identifique tasks elegíveis: `pending` com todas as dependências `done`.

Defina `spec_slug` = nome do diretório da spec (ex.: `painel-admin-gestao-completa`).

Liste `active_repos` = conjunto de `repo_key` que aparecem em tasks ainda não `done`.

## Fase 2 — Planejamento e confirmação

Exiba o roteiro **antes** de executar:

```md
## Task Orchestrator — Roteiro de Execução

Modo: multi-repo | monorepo
Spec: <spec_dir> (sem Git | na raiz do repo)

| Repo   | Branch de orquestração              | Worktrees                          |
|--------|-------------------------------------|------------------------------------|
| api    | orchestrator/<spec-slug>            | api/.worktrees/<spec-slug>/task_XX |
| admin  | orchestrator/<spec-slug>            | admin/.worktrees/<spec-slug>/task_XX |

Concorrência máxima: 4 · Integração: cherry-pick · Cleanup em falha: manter worktree

| Onda | Tasks (paralelas)     | Repos envolvidos | Aguarda   |
|------|-------------------------|------------------|-----------|
| 1    | task_01, task_07        | api, admin       | —         |
| 2    | task_02, task_14        | api, admin       | onda 1    |

Total: N tasks · M ondas · Pico: X workers (máx. 4 por lote)
Tasks já concluídas: <lista ou "nenhuma">
```

Também informe, por repo ativo:

- branch atual detectado (`git -C <repo> branch --show-current`);
- se a branch de orquestração será **criada** a partir da atual ou se o usuário definiu outra base.

**Multi-repo:** tasks em repos diferentes na mesma onda podem rodar **em paralelo** (ex.: `task_01` + `task_07`).

Peça confirmação do usuário antes da Fase 3.

## Fase 3 — Preparação (por modo)

### Multi-repo

Para cada `repo_key` em `active_repos`:

1. `REPO_ROOT=<workspace>/<repo_key>/`
2. Confirmar Git: `git -C "$REPO_ROOT" rev-parse --is-inside-work-tree`
3. Registrar `base_branch` = branch atual (ou a que o usuário confirmou).
4. Criar branch de orquestração (se não existir):
   ```bash
   git -C "$REPO_ROOT" checkout -b orchestrator/<spec-slug> "$base_branch"
   ```
   Se já existir, fazer checkout nela.
5. Criar diretório de worktrees:
   ```bash
   mkdir -p "$REPO_ROOT/.worktrees/<spec-slug>"
   ```

Convenções **por repo** (mesmo `spec_slug`):

- Branch de orquestração: `orchestrator/<spec-slug>`
- Branch por task: `task/<spec-slug>/task_XX`
- Worktree: `<repo>/.worktrees/<spec-slug>/task_XX`

Regras:

- Nunca reutilizar a mesma worktree entre tasks.
- Nunca criar worktree de task `[API]` em `admin/` (ou vice-versa).
- O `/execute-task` cuida de atualizar `task_NN.md` e `_tasks.md` — a spec fica fora de qualquer Git, portanto não há conflito de worktree nessas escritas.

`<spec_dir>` usa caminho **absoluto** nos prompts (workers leem PRD/tasks fora do repo Git).

### Monorepo

1. `git rev-parse` na raiz do workspace.
2. Branch de orquestração: `orchestrator/<spec-slug>` na raiz.
3. Worktrees: `.worktrees/<spec-slug>/task_XX` na raiz.
4. Demais fases iguais, com um único `REPO_ROOT` = raiz.

## Fase 4 — Execução em ondas

Repita até não restarem tasks `pending`:

1. **Próxima onda:** tasks `pending` com dependências `done` (global, cross-repo).
2. **Limite:** máximo `max_parallel` (default `4`) por lote.
3. **Serialização defensiva:** no **mesmo** `repo_key`, serialize tasks `[API]` com risco em rotas compartilhadas ou mesmo módulo crítico; em dúvida, serialize.
4. **Paralelo entre repos:** no multi-repo, tasks de `api` e `admin` na mesma onda podem rodar juntas se dependências permitirem.

### Por task no lote

**a) Resolver `REPO_ROOT` e paths**

```
repo_key  = mapa da task ([API] -> api, etc.)
REPO_ROOT = <workspace>/<repo_key>/
WT_PATH   = REPO_ROOT/.worktrees/<spec-slug>/task_XX
BRANCH    = task/<spec-slug>/task_XX
```

**b) Criar branch e worktree** (no repo correto)

```bash
git -C "$REPO_ROOT" worktree add \
  ".worktrees/<spec-slug>/task_XX" \
  -b "task/<spec-slug>/task_XX" \
  "orchestrator/<spec-slug>"
```

Falha → `failed` / `worktree_creation_failed`; não avance a onda sem tratar.

**c) Worker em background** (`run_in_background: true`)

```md
Você é um agente de implementação isolado para <task_id>.

Use /execute-task para <spec_dir>/task_NN.md

O worktree já está em <WT_PATH> (branch task/<spec-slug>/task_XX).
Todo o código do subprojeto fica em <REPO_ROOT> — o execute-task deve trabalhar nesse caminho.

Retorno (somente JSON):
{
  "task_id": "task_XX",
  "repo_key": "api|admin|app",
  "status": "done|failed",
  "branch": "task/<spec-slug>/task_XX",
  "commits": ["<sha>"],
  "summary": "resumo curto",
  "error": ""
}
```

**d)** Aguarde **todos** os workers do lote antes da Fase 5.

## Fase 5 — Integração centralizada

Agrupe resultados por `repo_key`. Para cada worker com `status=done`:

1. `git -C "$REPO_ROOT" checkout orchestrator/<spec-slug>`
2. Verificar commits em `task/<spec-slug>/task_XX` vs orquestração.
3. Integrar (padrão):
   ```bash
   git -C "$REPO_ROOT" cherry-pick <SHA1> <SHA2> ...
   ```
   Alternativa: `merge --no-ff task/<spec-slug>/task_XX`.

4. Se OK → marcar task `done` em `<spec_dir>/_tasks.md` (único escritor).
5. Se conflito → marcar `failed` ou pausar; não iniciar próxima onda até decisão.

Ordem sugerida na mesma onda: integrar primeiro tasks do mesmo repo na ordem que evita conflitos de cherry-pick (geralmente ordem de conclusão dos workers).

**Cross-repo:** integrações em `api` e `admin` são independentes; o `_tasks.md` unifica o estado da feature.

## Fase 6 — Revalidação do tracking

Após cada onda:

1. Releia `<spec_dir>/_tasks.md`.
2. Confira: retorno JSON dos workers ↔ commits na branch de orquestração de cada repo ↔ status no tracking.
3. Divergência → pare e reporte.

## Regras de paralelismo

| Situação | Comportamento |
|----------|---------------|
| Dependência `pending` ou `failed` | Nunca iniciar a task |
| Tasks em `repo_key` diferentes | Paralelo (multi-repo) |
| Várias tasks `[API]` na mesma onda | Serializar defensivamente em `api/` |
| Várias tasks `[Admin]` em módulos distintos | Paralelo em `admin/` |
| Dúvida sobre conflito no mesmo repo | Serializar |
| Onda com mais de `max_parallel` tasks | Dividir em lotes |

Worktree isola edição simultânea; cherry-pick ainda pode conflitar na branch de orquestração.

## Tratamento de erros

Reporte: `task_id`, título, `repo_key`, etapa, impacto, próxima ação.

| Erro | Ação |
|------|------|
| Nenhum Git em raiz nem em subprojetos | Parar na Fase 3 |
| `worktree_creation_failed` | Pular / retentar / abortar |
| `worker_no_commit` | Falha — retentar / pular / abortar |
| `cherry_pick_conflict` | Pausar integração naquele repo |
| Inconsistência worker vs tracking | Parar onda |

## Cleanup

Por task integrada com sucesso:

```bash
git -C "$REPO_ROOT" worktree remove ".worktrees/<spec-slug>/task_XX"
git -C "$REPO_ROOT" branch -d "task/<spec-slug>/task_XX"
```

Tasks `failed`: manter worktree no repo correspondente para debug.

Ao encerrar (sem falhas pendentes): remover diretórios vazios em `*/.worktrees/<spec-slug>/`.

Branches `task/<spec-slug>/*` integradas podem ser apagadas; manter `orchestrator/<spec-slug>` até PR/merge manual em cada repo.

## Relatório final

```md
## Task Orchestrator — Concluído

Modo: multi-repo
✅ tasks concluídas: N/N
❌ tasks com falha: F
🌊 ondas: M

Integração por repo:
- api: orchestrator/<spec-slug> — N commits
- admin: orchestrator/<spec-slug> — N commits

⚠️ conflitos: <nenhum ou resumo por repo>
🧹 worktrees removidos: <qtd>
🧪 worktrees mantidos (debug): <paths>
📋 tracking: <spec_dir>/_tasks.md
```

## Guardrails

- Nunca iniciar task com dependência não `done`.
- Nunca avançar de onda sem reconciliar workers + integração + tracking.
- Nunca usar worktree de um repo para task de outro `repo_key`.
- Nunca declarar sucesso sem cherry-pick (ou merge) bem-sucedido no repo da task.

## Modos degradados (somente se o usuário confirmar)

| Modo | Quando | Risco |
|------|--------|-------|
| Sem worktree | Usuário aceita explicitamente | Conflitos em edição paralela no mesmo repo |
| Serial por repo | Um worker por vez em `api/`, depois `admin/` | Mais lento; ignora paralelo cross-repo |

O padrão recomendado para 1Trainer é **multi-repo + worktree por task**.

## Idioma

Todos os outputs, relatórios e mensagens em **Português do Brasil (pt-BR)**.
