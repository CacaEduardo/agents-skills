---
name: execute-phase-plan
description: Executa uma fase inteira de um plano gerado pelo document-plan (.plans/<plan-slug>/README.md) — implementa todas as tasks da fase, valida com os comandos declarados e atualiza o plano (status, checklists, Progress Log, Resume Point) ao final. Use quando houver um plano faseado e o pedido for executar uma fase. Não use para tasks de PRD em .specs/ (use execute-task) nem dentro de um worker do plan-orchestrator (use execute-orchestrated-plan-phase).
argument-hint: "<caminho-do-plano> <fase> [--no-commit]"
---

# Execute Phase Plan

Executa **uma fase completa** de um plano do `document-plan` e devolve o plano atualizado como fonte de verdade do progresso.

Unidade de trabalho = **fase**, não task. Todas as tasks da fase são implementadas e validadas antes de qualquer atualização de status.

## Uso

```bash
/execute-phase-plan .plans/<plan-slug>/README.md 2
/execute-phase-plan .plans/<plan-slug>/README.md 2 --no-commit
/execute-phase-plan .plans/<plan-slug>/README.md          # usa a fase do Resume Point
```

## Entradas Necessárias

- `plan_file` — caminho de `.plans/<plan-slug>/README.md`.
- `phase` — número ou nome da fase. Se omitido, derive do `Current Phase` / `Resume Point` do header.
- `auto_commit` — padrão **habilitado**; `--no-commit` desabilita.
- Derivados do plano (não peça ao usuário se estiverem no documento): `git_root` da fase, ADRs em `.plans/<plan-slug>/adrs/`.

## Fluxo de Trabalho

### 1. Fundamente-se no contexto

- Leia o `plan_file` **inteiro** — header, Propósito, Invariants, Repository Map, Phase Outline, Master Task List, Progress Log, Deferred / Blocked e Notes for Future Agents.
- Leia todos os ADRs em `.plans/<plan-slug>/adrs/`. ADR com Status `Substituído por` ou `Descontinuado` **não** vale como decisão vigente — siga o substituto.
- Leia os arquivos de convenção do repositório: `AGENTS.md` / `CLAUDE.md` / `CONTRIBUTING.md` da raiz do workspace **e** os de cada módulo ou diretório que a fase toca, quando existirem. Regras locais têm precedência sobre as da raiz.
- Anote os comandos reais do projeto a partir da seção **Comandos do Projeto** do plano. Se ela não existir, descubra-os no repositório (arquivo de scripts, Makefile, config de CI) antes de validar — nunca invente um comando.
- **Portão de dependência:** verifique a coluna `Depende de` da fase no Phase Outline. Se alguma fase predecessora não estiver `✅`, **pare** e reporte — não implemente fora de ordem.
- **Portão de conflito:** se a especificação de uma task contradisser um Invariant ou um ADR vigente, **pare e reporte a contradição**. Não adivinhe qual vence.
- Reconcilie o estado do workspace (branch atual, alterações não commitadas) antes de editar.

### 2. Monte o checklist de execução

- Extraia da Master Task List **todas** as tasks cuja coluna `Fase` é a fase alvo, na ordem de `Deps`.
- Some os itens do **Checklist da Fase** correspondente.
- Imprima o checklist numerado completo **antes** de implementar qualquer coisa — ele é o portão da fase.
- **Capture o sinal pré-mudança**: rode agora os comandos de validação da fase e registre a saída atual (a falha, o erro, o teste vermelho). Isso é o baseline que prova que a fase ainda não estava feita.
- Não prossiga para a validação final sem ter tratado cada item.

### 3. Implemente a fase

- Implemente as tasks na ordem de dependência, uma a uma.
- Escopo restrito à fase. Task de outra fase que "seria fácil aproveitar" **não** entra: registre como nota de acompanhamento.
- Siga os padrões do código ao redor e as APIs reais das dependências.
- Respeite os Invariants literalmente — eles têm precedência sobre conveniência de implementação.
- **Sem código morto**: ao substituir uma implementação, remova no mesmo passo símbolos, arquivos, testes órfãos e imports que ficaram sem uso. Antes de remover, confirme com uma busca por texto em todo o código que o símbolo não é mais referenciado, incluindo re-exports em arquivos de índice/barrel. Regra própria do repositório sobre isso prevalece.

### 4. Valide e faça auto-revisão

- Execute o comando de validação de **cada task** da fase — não apenas a verificação ampla do repositório.
- Execute o critério de Definition of Done da fase, do Phase Outline.
- Use a skill instalada `final-verify`. Obrigatório, independentemente do modo de commit.
- Faça auto-revisão do diff e resolva todo problema bloqueante antes de tocar no plano.
- Validação que só pode ser feita manualmente (QA visual, console externo, credencial): **não invente resultado**. Marque a task como `[~]`, descreva exatamente o que o usuário precisa checar e registre em **Deferred / Blocked**.

### 5. Atualize o plano

Aplique `references/plan-tracking-checklist.md` na íntegra. Sequência obrigatória:

1. Checkboxes do **Checklist da Fase**.
2. Coluna `Status` das tasks da fase na **Master Task List**.
3. Coluna `Status` da fase no **Phase Outline** (`✅` só com todas as tasks `[x]`).
4. **Progress Log** — nova entrada append-only com `Branch`, `Resumo`, `Arquivos`, `Validação` (comando + resultado real).
5. **Deferred / Blocked** — o que ficou pendente e por quê.
6. **ADRs** — decisão nova ou trocada durante a implementação vira **novo** ADR em `.plans/<plan-slug>/adrs/`; nunca reescreva um ADR existente. Atualize a tabela Architecture Decision Records do plano.
7. **Header** — `Status`, `Current Phase`, `Last Updated`, e `Resume Point` reescrito para a próxima fase pendente, autossuficiente para um agente sem histórico.

### 6. Trate o commit

- Com auto-commit: **um** commit local após validação limpa, auto-revisão e atualização do plano.
- O commit inclui o código no `git_root` da fase. `.plans/` pode estar fora do repositório Git em questão — só inclua o plano no commit se ele estiver de fato versionado ali.
- Sem auto-commit: deixe o diff pronto para revisão manual.
- **Nunca faça push.**

### 7. Relatório

```md
## Fase <N> — <Nome> · <concluída | parcial | bloqueada>

- Tasks: <X>/<Y> concluídas (<lista de ids>)
- Validação: `<comando>` → <resultado real>
- Pendente/manual: <lista ou "—">
- ADRs criados: <lista ou "—">
- Commit: `<sha>` em `<branch>` (ou "diff não commitado")
- **Próxima fase:** <N+1 — Nome> (ou "plano concluído")
```

## Regra de escopo

> **Uma fase por invocação.** Ao terminar a fase, pare e reporte. Não emende a fase seguinte por conta própria, mesmo que ela pareça trivial — o usuário decide se continua manualmente ou parte para o `plan-orchestrator`.

## Idioma

Todas as saídas, comentários de código e atualizações do plano em **Português do Brasil (pt-BR)**.

## Tratamento de Erros

| Situação | Ação |
|----------|------|
| Fase predecessora não `✅` | Parar e reportar; não implementar fora de ordem |
| Task contradiz Invariant ou ADR | Parar e reportar a contradição |
| Validação falha | Manter status inalterado; registrar a falha no Progress Log; não marcar `[x]` |
| Sinal pré-mudança não reproduzível | Capturar o baseline mais forte disponível e declarar a limitação |
| `plan_file` ausente ou sem a fase pedida | Parar e reportar o caminho/fase ausente |
| Validação só manual | `[~]` + instrução explícita ao usuário + entrada em Deferred / Blocked |
| Fase revela trabalho não previsto | Implementar só o que a fase exige; registrar o resto em Deferred / Blocked |

## Skills relacionadas

| Skill | Quando |
|-------|--------|
| `document-plan --update` | Só atualizar o plano a partir do código, sem implementar |
| `plan-orchestrator` | Executar o plano inteiro em ondas paralelas |
| `execute-orchestrated-plan-phase` | Variante desta skill para workers do orquestrador (não atualiza o plano) |
| `final-verify` | Obrigatória no passo 4 |
