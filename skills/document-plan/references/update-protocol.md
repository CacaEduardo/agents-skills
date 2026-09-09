# Protocolo de Atualização (`--update`)

Regras para atualizar `.plans/<plan-slug>.md` sem inventar progresso.

## Regra de ouro

> Status só avança com **evidência verificável no repositório**. Relato de agente, resumo de conversa e mensagem de commit não são evidência suficiente por si sós.

## Hierarquia de evidência

Da mais forte para a mais fraca:

1. **Comando de validação da task executado agora, com saída limpa.** O comando exato da coluna `Validação`, rodado neste momento, com o sinal esperado.
2. **Símbolo/arquivo existe e é referenciado.** Uma busca por texto no código mostra a definição **e** pelo menos um uso.
3. **Diff/commit atribuível à task.** `git -C <git_root> log --oneline` + `git show <sha> --stat`.
4. **Relato do usuário.** Aceitável apenas para validação manual (QA visual, ação em console externo) — registre no Progress Log que a evidência é relato, e de quem.

Sem nenhuma das quatro → a task continua `[ ]`.

## Mapa de status

| Marca | Significado | Requisito |
|-------|-------------|-----------|
| `[ ]` | Pendente | — |
| `[~]` | Em progresso | Código parcial existe, validação ainda falha ou não rodou |
| `[x]` | Concluído | Evidência de nível 1 ou 2 **e** o critério da coluna Validação atendido |
| `[!]` | Bloqueado | Entrada correspondente em **Deferred / Blocked** |

Status da fase no Phase Outline: `⏳` (não iniciada), `🔄` (em progresso), `✅` (todas as tasks `[x]`), `⚠️` (bloqueada).

## Sequência da atualização

1. Ler o plano inteiro e os ADRs em `.plans/<plan-slug>/adrs/`.
2. Para cada task não `[x]`, buscar evidência (hierarquia acima).
3. Atualizar as marcas da Master Task List.
4. Atualizar os checkboxes dos **Checklists por Fase** correspondentes.
5. Atualizar a coluna de status do **Phase Outline**.
6. Atualizar o header: `Status`, `Current Phase`, `Last Updated`, `Resume Point`.
7. Acrescentar entrada no **Progress Log**.
8. Registrar bloqueios em **Deferred / Blocked**.
9. Tratar ADRs (abaixo).

## Resume Point

Deve ser autossuficiente para um agente **sem histórico de conversa**. Inclua:

- Qual task é a próxima.
- O que já está pronto e verde (com o comando que prova).
- O que exatamente falta fazer.
- Qualquer pré-requisito manual pendente (credencial, acesso a console, aprovação).

Ruim: `Comece pela Task 05`.

Bom: `Comece pela **Task 05** (Contexto: Fase 1 concluída e verde — <comando de validação> exit 0. Task 05 = <mudança concreta> em <caminho real>; risco conhecido: <pegadinha>. Pré-requisito: <acesso/credencial pendente, se houver>).`

## Progress Log

- **Nunca** remova, reescreva ou compacte entradas anteriores. O log é append-only.
- Uma entrada por iteração/fase concluída, com: `Branch`, `Resumo`, `Arquivos`, `Validação` (comando + resultado).
- Divergências entre o plano e o que foi de fato implementado vão no `Resumo`, explicitamente.

## ADRs durante a execução

- Decisão nova tomada durante a implementação → **novo ADR** em `.plans/<plan-slug>/adrs/adr-NNN.md`, e nova linha na seção Architecture Decision Records do plano.
- Decisão antiga revertida ou trocada → **não edite o ADR original**. Crie o novo e mude o Status do antigo para `Substituído por ADR-NNN`.
- ADR que se provou errado sem substituto → Status `Descontinuado`, com uma linha de motivo no Contexto.

## Divergência plano × código

Quando o implementado não bate com o que a task descrevia:

1. Atualize o texto da task para descrever o que existe de fato.
2. Anote a divergência no Progress Log (o que mudou e por quê).
3. Se a divergência contraria um Invariant ou um ADR, **pare e reporte ao usuário** antes de marcar `[x]`.

## Higiene

- Higiene conta na atualização: se a implementação deixou código morto, isso é um item pendente — não marque a fase como `✅` com símbolos órfãos.
- Tasks que perderam sentido: mova para **Deferred / Blocked** com o motivo, não apague em silêncio.
