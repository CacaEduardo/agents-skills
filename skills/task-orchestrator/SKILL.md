---
name: task-orchestrator
description: Orquestra tasks pendentes de uma spec em ondas de dependência, com worktrees por task, workers em sessões isoladas (context_task_XX.md), junction/symlink de node_modules no Windows e integração centralizada. Executa TODAS as ondas até zerar pending em _tasks.md. Suporta multi-repo e monorepo. Use para executar uma spec inteira em paralelo. Não use para uma task isolada.
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
- **Executar todas as ondas planejadas numa única sessão**, sem devolver controle ao usuário entre ondas.

## Regra de ouro (leia antes de qualquer fase)

> **Uma onda concluída ≠ spec concluída.**
>
> O orquestrador só pode encerrar quando `_tasks.md` tiver **zero** linhas com status `pending`.
> Após integrar a onda N, a **próxima ação obrigatória** é reler `_tasks.md` e, se existir task `pending` elegível, iniciar a **onda N+1** na mesma resposta/sessão.
>
> Notificações de subagents (`task finished`, JSON de worker) **não** significam fim do orchestrator — são apenas input da Fase 5 da onda atual.

### O que NÃO fazer após cada onda

- Não emitir "Task Orchestrator — Concluído" com `pending` > 0.
- Não pedir ao usuário "deseja continuar?", "próxima onda?" ou "diga para seguir".
- Não listar "próximos passos" como se o trabalho tivesse acabado.
- Não encerrar com resumo longo sem iniciar a próxima onda.
- Não assumir que o roteiro da Fase 2 era só informativo — **execute todas as ondas**.

### O que fazer após cada onda (checklist obrigatório)

1. Ler `<spec_dir>/_tasks.md` (sempre de novo, do disco).
2. Contar: `pending`, `done`, `failed`.
3. Se `pending` > 0 e existe onda elegível → publicar **Micro-relatório de onda** (modelo abaixo) e **imediatamente** executar Fase 4 da próxima onda.
4. Se `pending` > 0 mas nenhuma elegível (deps) → corrigir tracking ou marcar `failed`; reavaliar.
5. Só se `pending` = 0 → emitir **Relatório Final**.

```md
## Task Orchestrator — Onda <N> integrada

- Integradas: task_A, task_B
- Tracking: <P> pending · <D> done · <F> failed
- **Próxima ação (OBRIGATÓRIA):** <P> tasks pending — iniciando onda <N+1> agora.

<!-- ORQUESTRADOR: não encerre aqui. Pending > 0 → execute Fase 4 imediatamente. -->
```

Este bloco substitui qualquer "conclusão parcial". Máximo 6 linhas; em seguida **continue executando** sem esperar resposta do usuário.

## Isolamento de Contexto

Cada worker é uma **nova sessão** (`Task` com `run_in_background: true`) sem acesso ao histórico do orquestrador ou de outros workers.

O único estado que persiste entre tasks:

- Código commitado nas branches de task
- `_tasks.md` (atualizado exclusivamente pelo orquestrador após integração)
- JSON de retorno `{ task_id, status, commits, summary, error }` (usado para integração e resumo em `context_task_XX.md` de deps)

O orquestrador **não** passa histórico de conversas nem resultados narrativos de ondas anteriores aos workers — apenas o JSON de tasks dependentes na seção "Estado relevante" de `context_task_XX.md`.

Após o retorno JSON de cada worker, o orquestrador:

1. Usa apenas `status`, `commits` e `summary` do JSON
2. Descarta artefatos fora do código commitado
3. Deleta `<spec_dir>/context_task_XX.md`

Nunca reutilize a sessão de um worker para outra task.

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
| **monorepo** | Raiz **com** Git | Na raiz: `.worktrees/<spec-slug>/task_XX_git` |

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

### Detecção de OS

Detecte o SO para adaptar setup/cleanup de `node_modules` e comandos de shell. Registre `OS_TYPE` no estado da sessão:

```bash
# Bash / Git Bash
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]] || \
   [[ "$(uname -s 2>/dev/null)" == *NT* ]] || \
   [[ -n "$WINDIR" ]]; then
  OS_TYPE="windows"
else
  OS_TYPE="unix"
fi
```

```powershell
# PowerShell nativo
if ($env:OS -eq "Windows_NT") { $OS_TYPE = "windows" } else { $OS_TYPE = "unix" }
```

Informe `OS_TYPE` no roteiro da Fase 2.

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

OS: windows | unix · Concorrência máxima: 4 · Integração: cherry-pick
Cleanup: junction/symlink de node_modules + worktree remove (OS-aware)
Contexto worker: context_task_XX.md (não PRD/TechSpec inteiros)

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

Peça confirmação do usuário **uma única vez** antes da Fase 3. Após o usuário confirmar, **não volte a pedir confirmação por onda** — execute o loop 4→5→6 até `pending` = 0.

## Loop principal (Fases 4 → 5 → 6)

Pseudo-código que o orquestrador **deve seguir** literalmente:

```
wave := 1
loop:
  pending := count_status(_tasks.md, "pending")
  if pending == 0:
    goto FINAL_REPORT

  eligible := tasks pending com todas deps "done"
  if eligible is empty and pending > 0:
    goto HANDLE_BLOCKED_OR_FAILED

  # Fase 4 (+ 4.5 context por task, link node_modules)
  run_wave(eligible, max_parallel=4)   # nova sessão por worker; aguardar todos

  # Fase 5
  for each worker done:
    cherry-pick + update _tasks.md + delete context_task_XX.md + cleanup worktree

  # Fase 6
  write .orchestrator_checkpoint
  emit MICRO_REPORT(wave)
  STOP_CHECK   # pending > 0 → não encerrar
  wave := wave + 1
  goto loop   # SEM parar; SEM perguntar ao usuário

FINAL_REPORT:
  emit "Task Orchestrator — Concluído"
```

**Proibido** sair do `loop` após `emit MICRO_REPORT` exceto em `FINAL_REPORT` ou `HANDLE_BLOCKED_OR_FAILED` (conflito/falha que exige decisão humana).

> **STOP CHECK (execute antes de qualquer resposta ao usuário):**
> Quantas tasks têm status `pending` em `_tasks.md`?
> Se a resposta for **> 0**, você **não** terminou — retorne ao topo do `loop` e execute a Fase 4 da próxima onda **agora**.

## Retomar execução (usuário pediu "continue")

Se a sessão anterior parou com tasks ainda `pending`:

1. Ler `<spec_dir>/.orchestrator_checkpoint` (se existir), depois `<spec_dir>/_tasks.md` — não repetir tasks já `done`.
2. `git -C <repo> checkout orchestrator/<spec-slug>` em cada repo ativo.
3. Calcular **próxima onda elegível** a partir do tracking atual (não reexecutar ondas passadas).
4. Entrar no `loop` acima **sem** novo roteiro completo, salvo mudança de escopo.
5. Não pedir confirmação novamente salvo se o usuário mudou `base_branch` ou cancelou algo.

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
- O orquestrador **nunca** delega escrita em `<spec_dir>/_tasks.md` aos workers.

`<spec_dir>` usa caminho **absoluto** nos prompts (workers leem PRD/tasks fora do repo Git).

### Monorepo

1. `git rev-parse` na raiz do workspace.
2. Branch de orquestração: `orchestrator/<spec-slug>` na raiz.
3. Worktrees: `.worktrees/<spec-slug>/task_XX_git` na raiz (sufixo `_git` evita ambiguidade com branches `task_XX` no Windows).
4. Demais fases iguais, com um único `REPO_ROOT` = raiz.

### Setup de `node_modules` no worktree (antes de cada worker)

Workers **não** devem executar `npm install`, `npm ci`, `yarn install` ou `pnpm install`. Linkar `node_modules` do repo principal para o worktree **após** `git worktree add` e **antes** de lançar o worker.

| `OS_TYPE` | Estratégia | Efeito no cleanup |
|-----------|------------|-------------------|
| `windows` | NTFS Junction (`mklink /J`) | `Remove-Item` remove só o link |
| `unix` | Symlink (`ln -s`) | `rm` do link preserva o original |

Subpastas típicas do monorepo MAAF: `backend/`, `frontend/` e raiz (`.`).

**Windows (PowerShell):**

```powershell
$wt = "<WT_PATH>"   # absoluto
$repo = "<REPO_ROOT>"
foreach ($sub in @("backend", "frontend", ".")) {
  $nm = Join-Path $wt $sub "node_modules"
  $src = Join-Path $repo $sub "node_modules"
  if ((Test-Path $src) -and !(Test-Path $nm)) {
    cmd /c mklink /J $nm $src | Out-Null
  }
}
```

**Unix (bash):**

```bash
WT_PATH="<WT_PATH>"
REPO_ROOT="<REPO_ROOT>"
for sub in backend frontend .; do
  NM="$WT_PATH/$sub/node_modules"
  SRC="$REPO_ROOT/$sub/node_modules"
  [ -d "$SRC" ] && [ ! -e "$NM" ] && ln -s "$SRC" "$NM"
done
```

Multi-repo: ajuste `$sub` conforme a estrutura do repo (ex.: só `node_modules` na raiz de `api/`).

## Fase 4 — Execução em ondas

> **CRITICAL — Você está dentro do `loop` principal. Parar aqui com `pending` > 0 é falha de orquestração.**

Início de **cada** iteração do loop (incluindo onda 2, 3, …):

```bash
# Sempre reler o tracking antes de escolher o lote
# (caminho absoluto de spec_dir)
```

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
WT_PATH   = REPO_ROOT/.worktrees/<spec-slug>/task_XX_git   # monorepo; multi-repo: .../task_XX (sem _git)
BRANCH    = task/<spec-slug>/task_XX
```

**b) Criar branch e worktree** (no repo correto)

Monorepo (diretório com sufixo `_git`):

```bash
git -C "$REPO_ROOT" worktree add \
  ".worktrees/<spec-slug>/task_XX_git" \
  -b "task/<spec-slug>/task_XX" \
  "orchestrator/<spec-slug>"
```

Multi-repo (sem sufixo `_git`):

```bash
git -C "$REPO_ROOT" worktree add \
  ".worktrees/<spec-slug>/task_XX" \
  -b "task/<spec-slug>/task_XX" \
  "orchestrator/<spec-slug>"
```

Falha → `failed` / `worktree_creation_failed`; não avance a onda sem tratar.

**c) Linkar `node_modules`** — executar a subseção "Setup de node_modules" (Fase 3) com `WT_PATH` absoluto.

**d) Fase 4.5 — Context Builder (inline no orquestrador, sem subagente)**

Antes de lançar o worker:

1. Ler `<spec_dir>/task_NN.md` — identificar referências a PRD/TechSpec (ex.: "PRD §3.2", "TechSpec §5.1") e dependências `done`.
2. Extrair **apenas** as seções mencionadas de `_prd.md` e `_techspec.md`.
3. Gravar `<spec_dir>/context_task_XX.md`:

```md
# Contexto — task_XX

## Requisitos do PRD
<!-- seções extraídas; não colar o documento inteiro -->

## Especificação Técnica
<!-- seções extraídas; não colar o documento inteiro -->

## Estado relevante do projeto
<!-- para cada dep "done": task_id, summary do JSON de retorno do worker -->
```

4. Se PRD/TechSpec não tiver marcadores claros, copiar só blocos que mencionem o domínio da task (título, módulos, endpoints citados em `task_NN.md`).

Este arquivo é **descartável** — deletar após integração da task (Fase 5).

**e) Worker em background** (`run_in_background: true` — **nova sessão** por task)

```md
Você é um agente de implementação isolado para <task_id>.

## ISOLAMENTO DE CONTEXTO
Esta é uma sessão nova. Você NÃO tem acesso ao histórico do orquestrador.
O único estado está nos arquivos listados abaixo.
NUNCA peça ao usuário informações adicionais — tudo está nos arquivos.

## Execução
- OS: <windows|unix>
- modo: <multi-repo|monorepo>
- workspace_root: <WORKSPACE_ROOT> (absoluto)
- repo_root: <REPO_ROOT> (absoluto)
- worktree_path: <WT_PATH> (absoluto)
- branch: task/<spec-slug>/task_XX
- spec_dir: <spec_dir> (absoluto; pode estar fora do Git)
- workspace_prefix: [API]|[Admin]|[App] — edite código SOMENTE em worktree_path

## Arquivos de entrada (leia nesta ordem)
1. <WORKSPACE_ROOT>/AGENTS.md — regras do monorepo
2. <REPO_ROOT>/AGENTS.md — regras do repo (se existir)
3. <spec_dir>/context_task_XX.md — contexto curado (NÃO abra _prd.md/_techspec.md inteiros salvo se a task exigir)
4. <spec_dir>/task_NN.md — especificação da task
5. <spec_dir>/adrs/ — decisões arquiteturais (se existir)

## Restrições críticas
- NUNCA execute npm install, npm ci, yarn install ou pnpm install.
  node_modules já está linkado (junction/symlink) no worktree.
- Edite código apenas em worktree_path.
- NÃO atualize <spec_dir>/_tasks.md.
- NÃO comunique com o usuário.
- Testes: cd <WT_PATH>/backend && npm test ou cd <WT_PATH>/frontend && npm test (conforme a task)

## Task a executar
Use o skill execute-task com:
- task_file: <spec_dir>/task_NN.md
- spec_dir: <spec_dir>
- tracking_file: <spec_dir>/_tasks.md
- auto_commit: true

## Retorno (somente JSON, sem texto adicional)
{
  "task_id": "task_XX",
  "repo_key": "api|admin|app|monorepo",
  "status": "done|failed",
  "branch": "task/<spec-slug>/task_XX",
  "commits": ["<sha>"],
  "summary": "resumo curto em pt-BR",
  "error": ""
}
```

**f)** Aguarde **todos** os workers do lote antes da Fase 5.

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
5. Se OK → deletar `<spec_dir>/context_task_XX.md` e executar **Cleanup** da task (secção abaixo; OS-aware).
6. Se conflito → marcar `failed` ou pausar; não iniciar próxima onda até decisão.

Ordem sugerida na mesma onda: integrar primeiro tasks do mesmo repo na ordem que evita conflitos de cherry-pick (geralmente ordem de conclusão dos workers).

**Cross-repo:** integrações em `api` e `admin` são independentes; o `_tasks.md` unifica o estado da feature.

## Fase 6 — Revalidação e continuação (não é fim de sessão)

Após cada onda:

1. Releia `<spec_dir>/_tasks.md` do disco (não confie em cache da conversa).
2. Confira: retorno JSON dos workers ↔ commits na branch de orquestração ↔ status no tracking.
3. Grave `<spec_dir>/.orchestrator_checkpoint` (ver secção **Checkpoint**).
4. Conte `pending`. Se `pending` > 0 → emitir **Micro-relatório de onda** e **voltar à Fase 4** na mesma sessão.
5. Divergência de tracking → `HANDLE_BLOCKED_OR_FAILED`; não avance onda seguinte até corrigir.
6. **Nunca** trate esta fase como despedida ao usuário.
7. Execute **STOP CHECK** antes de enviar qualquer mensagem ao usuário.

### Gatilhos que costumam causar parada indevida (ignore)

| Gatilho | Comportamento correto |
|---------|------------------------|
| Subagent retornou `status: done` | Só integra (Fase 5); depois próxima onda se `pending` > 0 |
| "Onda 1 concluída" no roteiro | Era plano; falta executar ondas 2…M |
| Muitos workers em paralelo | Aguarde todos; depois continue o loop |
| Resposta longa / limite de contexto | Priorize Micro-relatório + iniciar próxima onda; resuma menos |
| Usuário não respondeu | Não espere resposta entre ondas após confirmação inicial |

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

## Checkpoint

Após integrar cada onda, gravar `<spec_dir>/.orchestrator_checkpoint`:

```json
{
  "spec_dir": "<spec_dir>",
  "spec_slug": "<spec-slug>",
  "os_type": "windows|unix",
  "last_wave": 2,
  "pending": 3,
  "done": ["task_01", "task_02"],
  "failed": [],
  "next_eligible": ["task_03", "task_05"]
}
```

Ao **retomar** sessão, ler este arquivo **antes** de `_tasks.md`. Apagar o checkpoint quando `pending` = 0 (relatório final).

## Cleanup

Por task integrada com sucesso, usar a sequência **OS-aware** abaixo.

Com junctions/symlinks (Fase 3), **não** use `rm -rf` em `node_modules` do worktree — isso pode apagar o `node_modules` real do repo principal no Unix ou falhar no Windows.

### Pré-requisitos (Windows)

1. Parar `npm run dev` e qualquer processo `node` que use o worktree.
2. Fechar terminais/IDE com cwd dentro de `WT_PATH`.

### Paths do worktree

| Modo | `WT_REL` |
|------|----------|
| monorepo | `.worktrees/<spec-slug>/task_XX_git` |
| multi-repo | `.worktrees/<spec-slug>/task_XX` |

`WT_ABS` = `$REPO_ROOT/$WT_REL` (Unix) ou `Join-Path $REPO_ROOT $WT_REL` (Windows).

### Windows (`OS_TYPE=windows`)

```powershell
$WT_ABS = Join-Path "<REPO_ROOT>" "<WT_REL>"

# 1) Remover junctions (não apaga node_modules do repo principal)
foreach ($sub in @("backend", "frontend", ".")) {
  $junc = Join-Path $WT_ABS $sub "node_modules"
  if (Test-Path $junc) { Remove-Item $junc -Force }
}

# 2) Remover worktree
git -C "<REPO_ROOT>" worktree remove "<WT_REL>"
# Fallback se Unlink failed:
# git -C "<REPO_ROOT>" worktree remove --force "<WT_REL>"
# Remove-Item -Recurse -Force $WT_ABS
```

Se o worker criou `node_modules` real (sem junction) — ex.: ignorou a restrição — repetir `Remove-Item -Recurse -Force` só em `$WT_ABS\...\node_modules` do worktree antes do passo 2.

### Unix (`OS_TYPE=unix`)

```bash
WT_ABS="$REPO_ROOT/$WT_REL"

# 1) Remover symlinks (preserva o original)
for sub in backend frontend .; do
  nm="$WT_ABS/$sub/node_modules"
  [ -L "$nm" ] && rm "$nm"
done

# 2) Remover worktree
git -C "$REPO_ROOT" worktree remove "$WT_REL"
```

### Worktree corrompido ou `prunable`

Quando `git worktree list` mostra `prunable` ou *`.git` does not exist*:

```bash
git -C "$REPO_ROOT" worktree prune
# Windows: Remove-Item -Recurse -Force "$WT_ABS"
# Unix: rm -rf "$WT_ABS"
```

Não insistir em `worktree remove` se o metadado `.git` do worktree já foi apagado.

### Apagar branch da task

Após integração por cherry-pick/ondas, `-d` costuma falhar (*not fully merged*). Use:

```bash
git -C "$REPO_ROOT" branch -D "task/<spec-slug>/task_XX"
```

Tasks `failed`: manter worktree no repo correspondente para debug (não rodar cleanup).

Ao encerrar (sem falhas pendentes): `git worktree prune` e remover diretórios vazios em `*/.worktrees/<spec-slug>/`.

Branches `task/<spec-slug>/*` integradas podem ser apagadas com `-D`; manter `orchestrator/<spec-slug>` até PR/merge manual em cada repo.

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

- **Nunca encerrar a execução enquanto houver tasks `pending` em `_tasks.md` — releia o arquivo e continue para a próxima onda imediatamente.**
- **Nunca terminar a mensagem ao usuário após uma onda sem executar (ou iniciar) a próxima onda**, se ainda existir `pending` elegível.
- Nunca pedir ao usuário que diga "continue" ou "próxima onda" — isso é responsabilidade do orquestrador após a confirmação inicial.
- Nunca confundir "fim da onda" com "fim da spec" ou "fim do PRD".
- Nunca iniciar task com dependência não `done`.
- Nunca escrever `_tasks.md` em paralelo (só orquestrador, após integração).
- Nunca avançar de onda sem reconciliar workers + integração + tracking.
- Nunca usar worktree de um repo para task de outro `repo_key`.
- Nunca declarar sucesso sem cherry-pick (ou merge) bem-sucedido no repo da task.
- Nunca emitir o Relatório Final (secção "Task Orchestrator — Concluído") com tasks ainda `pending`.
- Se precisar pausar por conflito irrecuperável, diga explicitamente **quantas tasks `pending` restam** e **por que** o loop parou — não simule conclusão.
- Nunca enviar PRD/TechSpec inteiros no prompt do worker — use `context_task_XX.md` (Fase 4.5).
- Nunca permitir `npm install` no worktree — use junction/symlink (Fase 3).
- Execute **STOP CHECK** antes de qualquer mensagem que pareça conclusão parcial ou final.

## Modos degradados (somente se o usuário confirmar)

| Modo | Quando | Risco |
|------|--------|-------|
| Sem worktree | Usuário aceita explicitamente | Conflitos em edição paralela no mesmo repo |
| Serial por repo | Um worker por vez em `api/`, depois `admin/` | Mais lento; ignora paralelo cross-repo |

O padrão recomendado para 1Trainer é **multi-repo + worktree por task**.

## Idioma

Todos os outputs, relatórios e mensagens em **Português do Brasil (pt-BR)**.
