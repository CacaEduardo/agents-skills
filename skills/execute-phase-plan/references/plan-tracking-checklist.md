# Checklist de Tracking — Fase de Plano

Aplique ao atualizar `.plans/<plan-slug>.md` após executar uma fase. O plano é a **única fonte de verdade** do progresso; os ADRs, das decisões.

## Ordem obrigatória

1. **Checklist da Fase** — marque `[x]` cada item com evidência de implementação **e** validação. Item não validado continua `[ ]`.
2. **Master Task List** — atualize a coluna `Status` das tasks desta fase:
   - `[x]` apenas quando o comando da coluna `Validação` foi executado e deu o sinal esperado.
   - `[~]` quando o código existe mas a validação falhou, não rodou ou é manual.
   - `[!]` quando bloqueada — exige entrada correspondente em **Deferred / Blocked**.
3. **Phase Outline** — coluna `Status` da fase:
   - `✅` somente com **todas** as tasks da fase em `[x]` e o Definition of Done atendido.
   - `🔄` se alguma task ficou `[~]`.
   - `⚠️` se alguma ficou `[!]`.
4. **Progress Log** — nova entrada, append-only:
   ```md
   ### Iteração <N> — Fase <M> <concluída|parcial>
   - **Branch:** `<branch>` (a partir de `<base_branch>` em `<git_root>`)
   - **Resumo:** <o que foi feito, decisões tomadas, divergências em relação ao texto original das tasks>
   - **Arquivos:** `<paths tocados>`
   - **Validação:** `<comando>` → <resultado real, com números quando houver>
   ```
   Nunca remova, reescreva ou compacte entradas anteriores.
5. **Deferred / Blocked** — o que ficou fora, com motivo e por quem/o quê está bloqueado. Inclui validação manual pendente.
6. **Architecture Decision Records** — decisão nova ou trocada durante a implementação:
   - Crie **novo** ADR em `.plans/<plan-slug>/adrs/adr-NNN.md` (3 dígitos, próximo número livre).
   - ADR substituído: mude o Status do antigo para `Substituído por ADR-NNN`. **Não reescreva o corpo dele.**
   - Acrescente a linha na tabela Architecture Decision Records do plano.
7. **Header**:
   - `Status` — `In-Progress`, `Blocked` ou `Done` (só `Done` com todas as fases `✅`).
   - `Current Phase` — próxima fase pendente.
   - `Last Updated` — data de hoje.
   - `Resume Point` — reescrito do zero, autossuficiente: próxima task, o que já está verde (com o comando que prova), o que falta, pré-requisitos manuais.

## Regras invioláveis

- **Sem evidência, sem `[x]`.** Relato não substitui comando executado ou símbolo verificável no código.
- **Progress Log é append-only.**
- **ADR nunca é reescrito** — é substituído.
- **`Done` no header exige todas as fases `✅`.**
- **Divergência plano × código:** atualize o texto da task para refletir o que existe e registre a divergência no Progress Log. Se a divergência contraria um Invariant, pare e reporte antes de marcar qualquer coisa.
- **Higiene:** fase não fecha `✅` com código morto pendente (símbolos, testes órfãos, imports não usados deixados pela mudança).

## Commit

- Siga o modo de commit do chamador.
- Inclua no commit apenas arquivos versionados no `git_root` da fase. `.plans/` pode viver fora desse repositório — não force o plano para dentro de um commit de código sem regra explícita do projeto.
- Nunca faça push.
