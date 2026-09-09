# Checklist de Tracking — Worker de Fase Orquestrada

Aplique ao concluir uma fase invocada pelo **plan-orchestrator**. Atualiza **somente** `report_phase_NN.md` (e os arquivos de corpo de ADR proposto). O plano e os ADRs numerados são do orquestrador.

## Antes de escrever qualquer coisa

1. Releia o `context_file` — objetivo, DoD, tasks, checklist, Invariants aplicáveis e ADRs vigentes.
2. Confirme que a validação de cada task foi de fato **executada**, não apenas presumida.
3. Confirme que o baseline pré-mudança foi capturado no passo 2 do fluxo.

## Preenchimento do report

4. **Tasks** — uma linha por task da fase:
   - `[x]` apenas com o comando da coluna `Validação` executado e o sinal esperado obtido. Cole o resultado real, com números quando houver.
   - `[~]` quando o código existe mas a validação falhou, não rodou ou é manual — e escreva o motivo.
   - Nunca marque `[x]` por inferência, por "deveria funcionar" ou por relato de outra fase.
5. **Checklist da fase** — todo item do `context_file` aparece no report, marcado ou com o motivo de não ter sido atendido.
6. **Definition of Done** — declare explicitamente `atendido` ou `não atendido`, com a evidência.
7. **Arquivos alterados** — caminho + o que mudou, um por linha.
8. **Código morto removido** — liste os símbolos/arquivos removidos e confirme, com uma busca por texto em todo o código, que não restam referências (incluindo re-exports em arquivos de índice/barrel). Se a mudança não gerou remoção, escreva `—`.
9. **ADRs propostos** — um bloco por decisão significativa tomada durante a implementação:
   - Sem número. Título com `ADR-XXX`. Nunca grave em `.plans/<plan-slug>/adrs/`.
   - Corpo completo em `.plans/<plan-slug>/report_phase_NN_adr_<K>.md`, no formato do template de ADR do `document-plan`.
   - Uma decisão é significativa se um agente futuro poderia razoavelmente questioná-la.
10. **Validação manual necessária** — o que o usuário precisa checar e como. Se vazio, escreva `—`.
11. **Divergências e notas** — o que foi implementado diferente do texto da task, e por quê. Divergência que contraria um Invariant não é nota: é `status: failed`.

## Status do report

| `report_status` | Condição |
|-----------------|----------|
| `completed` | Todas as tasks `[x]`, checklist inteiro marcado, DoD atendido |
| `partial` | Código válido e commitado, com task(s) `[~]` — tipicamente validação manual |
| `failed` | Validação falhou, contradição com Invariant/ADR, ou nenhum commit |

## Regras invioláveis

- **Não leia, não altere e não dependa de `.plans/<plan-slug>.md`.** O orquestrador atualiza o plano após o cherry-pick.
- **Não crie nem numere ADRs** em `adrs/`. Numeração em paralelo colide.
- **Sem evidência, sem `[x]`.**
- **Não invente resultado de validação manual.**
- Siga o modo de commit do chamador; não inclua arquivos de `.plans/` em commits de código.
- Nunca faça push nem altere a branch de orquestração.
