---
name: plan-orchestrator
description: Orquestra as fases pendentes de um plano do document-plan (.plans/<plan-slug>.md) em ondas de dependência, com worktree por fase, workers isolados (context_phase_NN.md) e integração centralizada. Executa todas as ondas até zerar fases pendentes no plano. Genérico para qualquer layout Git (monorepo ou multi-repo). Workers usam execute-orchestrated-plan-phase. Use para executar um plano inteiro em paralelo. Não use para uma única fase — use execute-phase-plan.
argument-hint: "<caminho-do-plano> [--max-parallel N]"
---

# Plan Orchestrator

Executa automaticamente todas as fases pendentes de um plano do `document-plan` com paralelismo seguro.

- **Orquestrador:** gerencia subagents, Git (worktrees, cherry-pick) e o arquivo do plano.
- **Workers:** implementam e validam uma fase via `/execute-orchestrated-plan-phase`, gravando `report_phase_NN.md`.

## Uso

```bash
/plan-orchestrator .plans/<plan-slug>.md
/plan-orchestrator .plans/<plan-slug>.md --max-parallel 2
```

O argumento é o caminho do plano relativo à raiz do workspace.

## Divisão de responsabilidades

| Responsável | Artefato | O quê |
|-------------|----------|-------|
| **Worker** | `report_phase_NN.md` | Checklist da fase, evidência de validação, ADRs propostos — via `execute-orchestrated-plan-phase` |
| **Worker** | Código | Commits na branch `phase/<plan-slug>/phase_NN` no worktree |
| **Orquestrador** | `.plans/<plan-slug>.md` | **Único dono** — status, Progress Log e Resume Point somente após cherry-pick |
| **Orquestrador** | `.plans/<plan-slug>/adrs/` | **Único dono** — materializa os ADRs propostos pelos workers, numerando sem colisão |
| **Orquestrador** | Git | Worktrees, ondas, integração em `orchestrator/<plan-slug>`, cleanup |

Workers **nunca** escrevem o plano nem os ADRs. Numeração de ADR em paralelo colide — por isso é centralizada. Não use `execute-phase-plan` nos workers.

## Objetivo

- Respeitar as dependências declaradas na coluna `Depende de` do **Phase Outline**, em **ondas**.
- Isolar a implementação de cada fase via **git worktree** no `git_root` correto.
- Integrar código **somente no orquestrador** (cherry-pick).
- **Executar todas as ondas numa sessão**, sem parar entre elas.

## Regra de ouro

> **Uma onda integrada ≠ plano concluído.**
>
> Encerre somente quando o Phase Outline tiver **zero** fases em `⏳`, `🔄` ou `⚠️` elegíveis.
> Após integrar a onda N, inicie a onda N+1 na mesma sessão se houver elegíveis.
> Retorno de subagent ≠ fim do orquestrador.

### Após cada onda — checklist obrigatório

1. Reler `.plans/<plan-slug>.md` do disco.
2. Contar fases: `⏳` pendentes, `✅` concluídas, `⚠️` falhas/bloqueadas.
3. Se pendentes > 0 e há elegíveis → **Micro-relatório** e **Fase 4 imediata**.
4. Se pendentes > 0 sem elegíveis → corrigir o tracking ou marcar `⚠️`.
5. Só se pendentes = 0 → **Relatório Final**.

```md
## Plan Orchestrator — Onda <N> integrada

- Integradas: phase_01, phase_03
- Plano: <P> pendentes · <C> concluídas · <F> bloqueadas
- **Próxima ação:** iniciando onda <N+1> agora.
```

Máximo 6 linhas; **continue executando** sem esperar o usuário.

### O que NÃO fazer

- Não emitir "Concluído" com fases pendentes.
- Não perguntar "deseja continuar?" entre ondas.
- Não usar `execute-phase-plan` nos workers — use `execute-orchestrated-plan-phase`.
- Não deixar o worker escrever no plano ou criar ADR numerado.

## Isolamento de contexto

Cada worker = sessão nova (`Task`, `run_in_background: true`).

Persiste entre fases:

- Commits nas branches de fase
- `report_phase_NN.md` (worker)
- `.plans/<plan-slug>.md` e `adrs/` (orquestrador)
- Conjunto `integrated_phases`
- JSON de retorno

Passe aos workers apenas caminhos absolutos + `context_phase_NN.md` — sem histórico de conversa.

Após o JSON: deletar `context_phase_NN.md`; nunca reutilizar sessão.

## Inputs obrigatórios

- `plan_file` — `.plans/<plan-slug>.md`, gerado pelo `document-plan`, com **Phase Outline** contendo as colunas `Depende de` e `Git root`.

Se o plano não tiver essas colunas (formato antigo), **pare** e peça ao usuário para rodar `/document-plan <plan-slug> --update` antes, ou derive as dependências e **confirme-as explicitamente** na Fase 2 antes de executar.

---

## Fase 1 — Plano, Git e grafo

### 1.1 Plano e dependências

1. Ler `.plans/<plan-slug>.md`: Propósito, **Invariants**, Repository Map, **Phase Outline**, Master Task List, Progress Log, Deferred / Blocked, Notes for Future Agents.
2. Ler todos os ADRs em `.plans/<plan-slug>/adrs/`. ADR `Substituído por` / `Descontinuado` não vale como decisão vigente.
3. Do Phase Outline, montar: `phase_id → objetivo`, `phase_id → depends_on[]`, `phase_id → git_root`, `phase_id → DoD`, `phase_id → status`.
4. Da Master Task List, agrupar as tasks por fase (coluna `Fase`) — cada fase carrega suas tasks, validações e checklist.

Valide: ausência de ciclos, ids no formato `phase_01` (não `phase_1`), toda fase com `git_root` resolvível, toda task pertencendo a exatamente uma fase.

Defina:

- `plan_slug` = nome do arquivo do plano sem extensão
- `WORKSPACE_ROOT` = raiz do workspace (absoluto)
- `integrated_phases` = fases `✅` no plano **e** confirmadas por integração anterior (checkpoint)

**Elegível:** fase com status `⏳` e todas as `depends_on` ∈ `integrated_phases`.

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
| **monorepo** | `$WORKSPACE_ROOT/.worktrees/<plan-slug>/phase_NN` |
| **multi-repo** | `<git-root>/.worktrees/<plan-slug>/phase_NN` |
| **sem Git** | Parar na Fase 3 |

O plano pode ficar **fora** de qualquer Git (`.plans/` normalmente está).

### 1.3 Fase → git_root

Para cada fase pendente:

1. Use a coluna `Git root` do Phase Outline.
2. Se vazia, derive dos caminhos citados nas tasks daquela fase e no Repository Map.
3. Todas as tasks no mesmo root → OK.
4. Fase cruzando roots distintos → **quebrar em subfases por root** ou serializar; se nem isso resolver, marcar `⚠️` e reportar.
5. Ambíguo → perguntar na Fase 2.

---

## Fase 2 — Planejamento e confirmação

```md
## Plan Orchestrator — Roteiro de Execução

Modo: monorepo | multi-repo
Plano: <plan_file>
Workspace: <WORKSPACE_ROOT>

| Git root | Branch orquestração | Worktrees |
|----------|---------------------|-----------|
| <path>   | orchestrator/<plan-slug> | <git-root>/.worktrees/<plan-slug>/phase_NN |

| Git root | Branch atual detectada | Base branch selecionada |
|----------|------------------------|-------------------------|
| <path>   | <branch-atual>         | <base_branch>           |

Concorrência: 3 · Integração: cherry-pick · Worker skill: execute-orchestrated-plan-phase

| Onda | Fases | Tasks | Git roots | Aguarda |
|------|-------|-------|-----------|---------|
| 1    | phase_01, phase_03 | 01-04, 08-09 | ... | — |

Invariants em vigor: <lista curta do plano>
ADRs vigentes: <ADR-001, ADR-003 (ADR-002 substituído)>

Total: N fases · T tasks · M ondas
Já integradas: <lista>
```

Antes da Fase 3, a confirmação inicial é **obrigatória**:

1. Exibir o roteiro completo (ondas, estratégia de disparo, `base_branch` por `git_root`, invariants e ADRs vigentes).
2. Pedir confirmação única: `Posso iniciar a execução com este plano? (sim/não)`.
3. Se `sim`, seguir e executar todas as ondas sem novas confirmações.
4. Se `não`, parar sem criar worktrees e sem alterar branches.

Regra: não iniciar a Fase 3 sem essa confirmação explícita.

---

## Loop principal (Fases 4 → 5 → 6)

```
wave := 1
integrated_phases := { já confirmadas }

loop:
  pending := fases não ✅ no plano
  if pending == 0: goto FINAL_REPORT

  eligible := pending com depends_on ⊆ integrated_phases
  if eligible empty and pending > 0: goto HANDLE_BLOCKED

  run_wave(eligible, max_parallel=3)
  integrate_and_update_plan()
  write_checkpoint()
  emit MICRO_REPORT(wave)
  STOP_CHECK
  wave += 1
  goto loop

FINAL_REPORT
```

**STOP CHECK:** se `pending` > 0, **não encerre** — volte ao loop.

## Retomar execução

1. Ler `.plans/<plan-slug>/.orchestrator_checkpoint`, depois o plano.
2. Reconstruir `integrated_phases`.
3. `git checkout orchestrator/<plan-slug>` em cada `git_root` ativo.
4. Exibir o roteiro remanescente (ondas pendentes + `base_branch` atual por `git_root`) e pedir confirmação única (`sim/não`).
5. Se `sim`, entrar no loop sem novas confirmações por onda; se `não`, encerrar sem executar.

---

## Fase 3 — Preparação Git

Por `git_root` usado:

```bash
git -C "$GIT_ROOT" checkout -B "orchestrator/<plan-slug>" "$base_branch"
mkdir -p "$GIT_ROOT/.worktrees/<plan-slug>"
```

Convenções:

- Orquestração: `orchestrator/<plan-slug>`
- Fase: `phase/<plan-slug>/phase_NN`
- Worktree: `$GIT_ROOT/.worktrees/<plan-slug>/phase_NN`

### Ligar os diretórios de dependência

Um `git worktree` novo não tem as dependências instaladas, e rodar o instalador em cada fase é caro e sujeito a divergência de versão. Ligue (symlink) os diretórios de dependência já presentes no `git_root` para o worktree, **após** `git worktree add` e **antes** de disparar o worker.

1. Detecte o gerenciador pelo manifesto/lockfile presente no `git_root`.
2. Defina `DEP_DIRS` = os diretórios de dependência correspondentes (o nome varia por ecossistema; sempre inclua os que já existirem no `git_root` e estiverem ignorados pelo Git).
3. Para cada diretório de manifesto encontrado — inclusive os de sub-pacotes, em repositórios com múltiplos pacotes — crie o link espelhando o caminho relativo:

```bash
# DEP_DIRS: nomes dos diretórios de dependência detectados no passo 1
for name in $DEP_DIRS; do
  find "$GIT_ROOT" -type d -name "$name" -prune -not -path "*/.git/*" | while read -r src; do
    rel="${src#$GIT_ROOT/}"
    dst="$WT_PATH/$rel"
    mkdir -p "$(dirname "$dst")"
    [ ! -e "$dst" ] && ln -s "$src" "$dst"
  done
done
```

Registre os `DEP_DIRS` usados no checkpoint — o cleanup precisa remover exatamente esses links.

Workers **não** rodam instalador de dependências. Se o ecossistema não tolerar dependências por symlink, o modo degradado é rodar a instalação **no orquestrador**, uma vez por worktree, antes de disparar o worker.

---

## Fase 4 — Execução em ondas

Início de **cada** iteração: reler o plano do disco.

1. Onda = fases `⏳` elegíveis (`depends_on` ⊆ `integrated_phases`).
2. Máximo 3 por lote (fases são maiores que tasks; suba para 4 só com `--max-parallel`).
3. Mesmo `git_root` + mesmo módulo/arquivo → serializar; em dúvida, serializar.
4. `git_root` diferentes → paralelo.

### Por fase no lote

**a) Worktree**

```bash
git -C "$GIT_ROOT" worktree add \
  ".worktrees/<plan-slug>/phase_NN" \
  -b "phase/<plan-slug>/phase_NN" \
  "orchestrator/<plan-slug>"
```

**b) Ligar os diretórios de dependência** (se aplicável).

**c) Context Builder (orquestrador, inline)**

Gravar `.plans/<plan-slug>/context_phase_NN.md`:

```md
# Contexto — phase_NN: <Nome da fase>

## Objetivo e Definition of Done
<!-- linha do Phase Outline -->

## Tasks desta fase
<!-- linhas da Master Task List com Fase = NN, incluindo coluna Validação -->

## Checklist da fase
<!-- bloco "### Fase N" de Checklists por Fase -->

## Invariants aplicáveis
<!-- apenas os que tocam esta fase -->

## Repository Map relevante
<!-- apenas as linhas cujos caminhos esta fase toca -->

## Comandos do Projeto
<!-- seção "Comandos do Projeto" do plano; se ausente, os comandos reais que você descobriu no repositório -->

## Arquivos de convenção a ler
<!-- caminhos de AGENTS.md / CLAUDE.md / CONTRIBUTING.md da raiz, do git_root e do módulo tocado -->

## ADRs vigentes relevantes
<!-- resumo + caminho; nunca copiar ADR substituído/descontinuado -->

## Estado de dependências
<!-- fase integrada: phase_id + summary do JSON do worker anterior -->

## Notas para agentes
<!-- itens de Notes for Future Agents que se aplicam -->
```

Regra: o worker recebe **este arquivo**, não o plano inteiro.

**d) Worker** (`Task`, `run_in_background: true`)

```md
Você é um worker isolado para <phase_id>.
Não fale com o usuário. Sessão nova, sem histórico.

Use execute-orchestrated-plan-phase com:
- plan_slug: <plan-slug>
- phase_id: phase_NN
- context_file: .plans/<plan-slug>/context_phase_NN.md
- report_file: .plans/<plan-slug>/report_phase_NN.md
- worktree_path: <WT_PATH>
- git_root: <GIT_ROOT>
- auto_commit: true

Leia antes (se existirem):
- <WORKSPACE_ROOT>/AGENTS.md ou CLAUDE.md
- <GIT_ROOT>/AGENTS.md ou CLAUDE.md

Retorno (somente JSON):
{
  "phase_id": "phase_NN",
  "git_root": "<GIT_ROOT>",
  "status": "done|partial|failed",
  "branch": "phase/<plan-slug>/phase_NN",
  "commits": ["<sha>"],
  "report_status": "completed|partial|failed",
  "tasks_done": ["01", "02"],
  "tasks_pending": ["03"],
  "validation": "<comando> → <resultado real>",
  "proposed_adrs": [
    { "title": "<título>", "decision": "<1 linha>", "alternatives": "<1 linha>", "body_file": ".plans/<plan-slug>/report_phase_NN_adr_1.md" }
  ],
  "manual_validation_required": ["<o que o usuário precisa checar>"],
  "summary": "resumo pt-BR",
  "error": ""
}
```

**e)** Aguardar **todos** os workers da onda antes da Fase 5.

---

## Fase 5 — Integração e atualização do plano

Por worker com `status` `done` ou `partial`:

1. **Validar `report_phase_NN.md`**: checklist da fase preenchido + evidência de validação por task. Sem isso → `failed`, não integrar.
2. **Conferir contra o DoD** da fase no Phase Outline. DoD não atendido → integra apenas se `partial` e o usuário aceitar; caso contrário `⚠️`.
3. `git -C "$GIT_ROOT" checkout orchestrator/<plan-slug>`
4. Cherry-pick:
   ```bash
   git -C "$GIT_ROOT" cherry-pick <SHA1> <SHA2> ...
   ```
5. Se OK:
   - `integrated_phases` += `phase_id` (somente se `status: done`)
   - **Atualizar o plano (único escritor):**
     - Master Task List: `[x]` nas tasks de `tasks_done`, `[~]` nas de `tasks_pending`
     - Checklist da Fase: marcar conforme o report
     - Phase Outline: `✅` (done) · `🔄` (partial) · `⚠️` (failed)
     - Progress Log: **nova entrada append-only** por fase integrada (branch, resumo, arquivos, validação real)
     - Deferred / Blocked: `manual_validation_required` e o que ficou pendente
     - Header: `Status`, `Current Phase`, `Last Updated`, `Resume Point` reescrito
   - **Materializar `proposed_adrs`:** ler `.plans/<plan-slug>/adrs/` para o próximo número livre, gravar `adr-NNN.md` a partir do `body_file` no formato do template, e acrescentar a linha na tabela Architecture Decision Records. Numere **em série**, uma fase por vez, para evitar colisão.
   - Deletar `context_phase_NN.md`, `report_phase_NN.md` e os `body_file` já materializados
   - Cleanup do worktree
6. Conflito de cherry-pick → marcar `⚠️` e pausar aquele `git_root`; as outras fases da onda seguem.

**Nunca** marque uma fase como `✅` antes do cherry-pick bem-sucedido.

---

## Fase 6 — Revalidação

1. Reler o plano do disco.
2. Conferir JSON ↔ commits ↔ `report_phase_NN.md` ↔ plano.
3. Gravar `.plans/<plan-slug>/.orchestrator_checkpoint`:

```json
{
  "plan_file": ".plans/<plan-slug>.md",
  "plan_slug": "<plan-slug>",
  "last_wave": 2,
  "integrated_phases": ["phase_01", "phase_03"],
  "pending": 2,
  "blocked": [],
  "next_adr_number": 4,
  "git_roots": ["<absoluto>"],
  "dep_dirs": ["<nome-do-diretório-de-dependências>"]
}
```

4. Se pendentes > 0 → Micro-relatório + Fase 4.
5. Apagar o checkpoint quando pendentes = 0.

---

## Regras de paralelismo

| Situação | Comportamento |
|----------|---------------|
| Dep ∉ `integrated_phases` | Nunca iniciar |
| `git_root` diferentes | Paralelo |
| Mesmo `git_root`, mesmo módulo/arquivo | Serializar |
| Fase que altera contrato consumido por outra | Serializar, mesmo sem dep declarada |
| Fase com validação manual obrigatória | Serializar e reportar ao usuário |
| Lote > `max_parallel` (padrão 3) | Dividir |

---

## Tratamento de erros

| Erro | Ação |
|------|------|
| Sem Git | Parar na Fase 3 |
| Plano sem `Depende de` / `Git root` | Parar; pedir `/document-plan --update` |
| Ciclo de dependência entre fases | Parar; reportar o ciclo |
| `worktree_creation_failed` | Retentar / abortar |
| `worker_no_commit` | Falha; não integrar |
| `report_incomplete` | Não integrar; marcar `⚠️` |
| `cherry_pick_conflict` | Pausar o repo; marcar `⚠️` |
| Worker viola Invariant | Não integrar; registrar em Deferred / Blocked |
| Colisão de numeração de ADR | Impossível por construção — só o orquestrador numera |

## Cleanup

Remova primeiro os symlinks de dependência — senão `worktree remove` reclama de conteúdo não rastreado, e um `rm -rf` do worktree pode seguir o link e apagar as dependências do repositório real.

```bash
WT_ABS="$GIT_ROOT/.worktrees/<plan-slug>/phase_NN"
find "$WT_ABS" -type l -exec rm {} \;        # apenas links, nunca -delete em diretórios
git -C "$GIT_ROOT" worktree remove ".worktrees/<plan-slug>/phase_NN"
git -C "$GIT_ROOT" branch -D "phase/<plan-slug>/phase_NN"
```

Fases `⚠️`: manter o worktree para debug.

## Relatório final

```md
## Plan Orchestrator — Concluído

✅ fases: N/N · ❌ bloqueadas: F · 🌊 ondas: M
📋 tasks: T/T · 🧭 ADRs criados: A
Integração: <git-root> → orchestrator/<plan-slug>
📄 plano: .plans/<plan-slug>.md

Validação manual pendente:
- <item> (fase N)
```

## Guardrails

- Nunca encerrar com fases pendentes.
- Nunca marcar `✅` no plano antes do cherry-pick.
- Elegibilidade de onda via `integrated_phases`, não suposição.
- Workers usam **execute-orchestrated-plan-phase** — nunca `execute-phase-plan`.
- Workers nunca escrevem o plano nem numeram ADR.
- Progress Log é append-only, inclusive no orquestrador.
- STOP CHECK antes de qualquer mensagem de conclusão.
- Sem plano inteiro no worker — use `context_phase_NN.md`.
- Nunca fazer push.

## Modos degradados (confirmação explícita)

| Modo | Risco |
|------|-------|
| Sem worktree | Conflitos em edição paralela |
| Serial total | Mais lento |
| `--max-parallel 1` | Mais seguro |

## Skills relacionadas

| Skill | Quando |
|-------|--------|
| `document-plan` | Criar/atualizar o plano que esta skill executa |
| `execute-orchestrated-plan-phase` | Worker desta skill |
| `execute-phase-plan` | Execução manual de uma fase, fora do orquestrador |

## Idioma

pt-BR.
