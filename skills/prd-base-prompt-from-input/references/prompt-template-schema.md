# Esquema do prompt base (tags)

Ordem canônica das seções no arquivo final. Cada bloco usa a tag de abertura e fechamento indicada.

## `<task>`

- Uma linha ou frase curta: nome da demanda ou feature.
- Sem detalhe técnico aqui.

## `<goal>`

- Parágrafo(s) com o resultado desejado e o **porquê** do negócio.
- Linguagem clara; evitar jargão desnecessário.

## `<requirements>`

Subseções (títulos em português, como no exemplo em `../prompt_template.md`):

- **Negocio:** regras de negócio, atores, fluxos, dados obrigatórios, exceções.
- **Arquitetura:** onde vive a mudança (frontend, backend, ambos), responsabilidades, integrações **se** existirem.
- **UI/UX:** telas, estados, feedback ao usuário, acessibilidade ou responsividade quando relevante.

Incluir apenas subseções que se aplicam. Se não houver UI (ex.: job só no backend), omitir **UI/UX** ou deixar explícito "N/A" só se o usuário confirmar que não há interface.

## `<api_contracts>`

Incluir **somente** quando houver:

- chamadas a APIs de terceiros, webhooks, filas documentadas como contrato; e/ou
- endpoints REST/GraphQL novos ou alterados que o PRD precise especificar.

Estrutura interna sugerida:

- **APIs externas:** URLs ou nomes de serviço, propósito, dados relevantes (sem inventar campos não mencionados).
- **APIs de backend:** método, rota, query/body, formato de sucesso, códigos de erro.

Se não houver integração externa nem contrato de API a definir, **omitir a tag inteira**.

## `<acceptance_criteria>`

- Critérios testáveis, preferencialmente estilo "Dado / Quando / Então" ou bullets inequívocos.
- Alinhados ao que está em **Negocio** e **UI/UX**, sem contradizer **constraints**.

## `<constraints>`

- **FAÇA:** obrigações explícitas.
- **NÃO FAÇA:** limites de escopo.
- **NUNCA:** regras rígidas (compliance, segurança, custo).

Se o input não trouxer constraints, não inventar: perguntar ao usuário na fase de esclarecimentos.

## Consistência

- Mesmo conceito com o mesmo nome em todas as seções.
- Nada em **acceptance_criteria** que não tenha base em **requirements** ou **goal**, salvo detalhe confirmado pelo usuário na rodada de perguntas.
