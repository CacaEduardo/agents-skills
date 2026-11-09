---
name: execute-orchestrated-plan-phase
description: Executa uma fase de plano dentro de um worker do plan-orchestrator — implementação, validação e report_phase_NN.md completo, com commit no worktree. Não escreve no plano nem cria ADRs numerados (responsabilidade do orquestrador). Use somente quando invocado por um subagent do plan-orchestrator com worktree_path, context_file e report_file. Não use para execução manual de uma fase — use execute-phase-plan.
---

# Execute Orchestrated Plan Phase

Executa uma fase de plano como **worker isolado** do `plan-orchestrator`: implementação, validação e preenchimento completo de `report_phase_NN.md`. O plano (`.plans/<plan-slug>/README.md`) e os ADRs numerados são **exclusivos do orquestrador**.

> **Diff intencional vs `execute-phase-plan`:** este fluxo omite qualquer escrita no plano e qualquer criação de `adrs/adr-NNN.md`. Os passos de contexto, checklist, implementação, validação e commit são mantidos em sync com `execute-phase-plan`.

## Entradas Necessárias

- `plan_slug` — identifica `.plans/<plan-slug>/`.
- `phase_id` — `phase_NN`.
- `context_file` — `.plans/<plan-slug>/context_phase_NN.md`, curado pelo orquestrador. **Fonte primária.**
- `report_file` — `.plans/<plan-slug>/report_phase_NN.md`, a criar.
- `worktree_path` — caminho absoluto; **único local** para alterações de código.
- `git_root` — caminho absoluto do repositório Git.
- `auto_commit` — modo de commit.

**Não recebe** o plano completo nem permissão de escrita nele.

## Restrições do worker

- Não comunique com o usuário. A saída é o JSON final.
- Não leia, altere nem dependa de `.plans/<plan-slug>/README.md` — o orquestrador é o único dono. Se o `context_file` não bastar, reporte no JSON em vez de abrir o plano.
- Não crie, renumere nem edite arquivos em `.plans/<plan-slug>/adrs/`. ADRs vão como `proposed_adrs` no JSON.
- Não execute instalação de dependências — o orquestrador já ligou os diretórios de dependência do repositório ao worktree. Se faltar alguma dependência, retorne `failed` em vez de instalar.
- Edite código **somente** em `worktree_path`.
- Não faça push. Não altere a branch de orquestração.

## Fluxo de Trabalho

### 1. Fundamente-se no contexto

- Leia o `context_file` **primeiro** e por inteiro: objetivo, DoD, tasks, checklist, Invariants aplicáveis, Repository Map, ADRs vigentes, estado de dependências e notas.
- Leia os arquivos de convenção indicados pelo orquestrador (`AGENTS.md` / `CLAUDE.md` / `CONTRIBUTING.md` na raiz do workspace, em `git_root` e no módulo que a fase toca). Regras locais têm precedência sobre as da raiz.
- Use os comandos declarados na seção **Comandos do Projeto** do `context_file`. Se ela não vier e a fase exigir um comando não declarado, descubra-o no repositório (arquivo de scripts, Makefile, config de CI) — nunca invente um comando.
- Verifique conflitos entre as tasks, os Invariants e os ADRs vigentes. Havendo contradição, **pare** e retorne `status: failed` com a contradição descrita em `error`.
- Se o `context_file` não contiver informação necessária (ex.: ADR referenciado mas não resumido), retorne `status: failed` com `error` apontando o que falta — não abra o plano por conta própria.
- Reconcilie o estado do worktree antes de editar.

### 2. Monte o checklist de execução

- Extraia todas as tasks da fase, na ordem de dependência, mais os itens do checklist da fase.
- Imprima o checklist numerado antes de implementar.
- **Capture o sinal pré-mudança**: rode os comandos de validação agora e registre a saída atual (o erro, o teste vermelho). Esse baseline entra no `report_file`.
- Marque cada item conforme a evidência é produzida; não prossiga para a validação final sem tratar todos.

### 3. Implemente a fase

- Escopo restrito à fase. Nada de tasks de outra fase, mesmo que pareçam triviais.
- Todo código em `worktree_path`.
- Siga os padrões do código ao redor e as APIs reais das dependências.
- Respeite os Invariants literalmente — eles vencem qualquer conveniência de implementação.
- **Sem código morto**: ao substituir uma implementação, remova no mesmo passo símbolos, arquivos, testes órfãos e imports sem uso. Antes de remover, confirme com uma busca por texto em todo o código que o símbolo não é mais referenciado, incluindo re-exports em arquivos de índice/barrel. Regra própria do repositório sobre isso prevalece.
- Desvios significativos viram notas no report, sem expandir escopo em silêncio.

### 4. Valide e faça auto-revisão

- Execute o comando de validação de **cada task** da fase, não apenas a verificação ampla.
- Execute o Definition of Done da fase.
- Use a skill `final-verify` — obrigatório antes de afirmar conclusão.
- Faça auto-revisão do diff e resolva problemas bloqueantes antes de escrever o report.
- Validação que só pode ser feita manualmente: **não invente resultado**. Liste em `manual_validation_required` e mantenha a task como pendente no report.

### 5. Escreva o `report_file`

Aplique `references/plan-tracking-checklist.md` na íntegra. Estrutura obrigatória:

```md
# Report — <phase_id>: <Nome da fase>

**Status:** completed | partial | failed
**Branch:** phase/<plan-slug>/phase_NN
**Git root:** <GIT_ROOT>

## Sinal pré-mudança (baseline)
`<comando>` → <saída original, o erro/teste vermelho>

## Tasks
| # | Status | Evidência de validação |
| :-- | :---: | :--- |
| 01 | [x] | `<comando>` → <resultado real> |
| 02 | [~] | <o que falta / por que não fechou> |

## Checklist da fase
- [x] <item>
- [ ] <item não atendido — motivo>

## Definition of Done
<atendido | não atendido> — <evidência>

## Arquivos alterados
- `<path>` — <o que mudou>

## Código morto removido
- `<símbolo/arquivo>` — confirmado sem referências

## ADRs propostos
<!-- um bloco por decisão; NÃO numerar, NÃO gravar em adrs/ -->
### Proposta 1 — <Título>
- **Decisão:** <1-2 linhas>
- **Alternativas rejeitadas:** <e por quê>
- **Consequências:** <trade-offs>
- **Corpo completo:** `.plans/<plan-slug>/report_phase_NN_adr_1.md`

## Validação manual necessária
- <o que o usuário precisa checar, e como>

## Divergências e notas
- <o que foi implementado diferente do descrito na task, e por quê>
```

Para cada ADR proposto, grave também o corpo completo em `.plans/<plan-slug>/report_phase_NN_adr_<K>.md`, seguindo o template de ADR do `document-plan` **sem número** (deixe `ADR-XXX` no título). O orquestrador numera e materializa.

### 6. Trate o commit

- Com `auto_commit` habilitado: **um** commit local no worktree, após validação, auto-revisão e escrita do report.
- Inclua apenas arquivos de código versionados no worktree. `report_file`, `context_file` e o plano vivem em `.plans/`, que pode estar fora deste repositório Git — não force tracking deles.
- Sem `auto_commit`: deixe o diff pronto para o orquestrador.
- **Nunca faça push.**

## Retorno ao orquestrador

Ao concluir (sucesso, parcial ou falha), retorne **somente JSON** — sem texto adicional:

```json
{
  "phase_id": "phase_NN",
  "git_root": "<absoluto>",
  "status": "done|partial|failed",
  "branch": "phase/<plan-slug>/phase_NN",
  "commits": ["<sha>"],
  "report_status": "completed|partial|failed",
  "tasks_done": ["01", "02"],
  "tasks_pending": ["03"],
  "validation": "<comando> → <resultado real>",
  "proposed_adrs": [
    {
      "title": "<título>",
      "decision": "<1 linha>",
      "alternatives": "<1 linha>",
      "body_file": ".plans/<plan-slug>/report_phase_NN_adr_1.md"
    }
  ],
  "manual_validation_required": ["<item>"],
  "summary": "resumo curto pt-BR",
  "error": ""
}
```

Semântica de `status`:

| Valor | Quando |
|-------|--------|
| `done` | Todas as tasks `[x]`, DoD atendido, validação verde, commit criado |
| `partial` | Código válido e commitado, mas alguma task ficou pendente (tipicamente validação manual) |
| `failed` | Validação falhou, contradição detectada, ou nenhum commit produzido |

## Idioma

Todas as saídas, comentários de código e conteúdo do report em **Português do Brasil (pt-BR)**.

## Tratamento de Erros

| Situação | Ação |
|----------|------|
| Validação falha | `status: failed`; **não** marque tasks como `[x]` no report; descreva a falha em `error` |
| Task contradiz Invariant ou ADR | Parar antes de implementar; `status: failed` com a contradição em `error` |
| `context_file` insuficiente | `status: failed` com o que falta em `error`; não abrir o plano |
| Sinal pré-mudança não reproduzível | Capturar o baseline mais forte disponível e declarar a limitação no report e no `summary` |
| Validação apenas manual | `status: partial`; task pendente; item em `manual_validation_required` |
| Fase revela trabalho não previsto | Implementar só o que a fase exige; registrar em "Divergências e notas" |
| Conflito no worktree | `status: failed`; não tentar resolver na branch de orquestração |
