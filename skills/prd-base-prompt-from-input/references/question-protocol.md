# Protocolo de perguntas (prompt base)

A **mecânica** de perguntas desta skill é a mesma de `create-prd` e `create-techspec`: ferramenta interativa que bloqueia até resposta, **uma pergunta por mensagem** e **múltipla escolha** sempre que der para prever opções.

Referências canônicas neste repositório:

- [create-prd — SKILL.md](../../create-prd/SKILL.md)
- [create-prd — question-protocol](../../create-prd/references/question-protocol.md)
- [create-techspec — SKILL.md](../../create-techspec/SKILL.md)

## Ferramenta interativa obrigatória

Quando for pedir resposta ao usuário, use a **ferramenta de pergunta interativa** do runtime (a que apresenta a pergunta e **pausa** até o usuário responder). Não envie a pergunta como texto solto e continue gerando na mesma mensagem.

Se o runtime **não** tiver essa ferramenta: a mensagem deve conter **apenas** a pergunta (e opções) e você **para** — não responde pela pessoa nem avança sem input.

## Uma pergunta por mensagem (rigoroso)

- **Uma** pergunta por mensagem: no máximo **um** `?` no corpo da pergunta (o mesmo anti-pattern de `create-prd`: não combinar "Qual X? Além disso, qual Y?").
- Tópico extra vira **próxima** mensagem, depois da resposta.
- Enfileire mentalmente todas as lacunas; trate na ordem (impacto no `<goal>` / negócio primeiro, depois requisitos, depois contratos se aplicável).

## Múltipla escolha e sugestões

- Sempre que der para definir opções antecipadamente, use **múltipla escolha** com rótulos **A, B, C, …**
- Inclua sempre um **fallback** (ex.: **D) Outro — descreva**), como em PRD/TechSpec.
- **Sugestão do agente** não vai como afirmação: entra como **opção rotulada**, por exemplo:
  - **A)** Adotar sugestão: [resumo curto do texto proposto para a tag]
  - **B)** Não adotar; manter só o que está no input do usuário
  - **C)** Adotar parcialmente (o usuário descreve o ajuste na resposta “Outro” ou em campo livre conforme o runtime)
  - **D)** Outro — descreva
- Perguntas abertas só quando o espaço de resposta for **ilimitado** de verdade (ex.: “Qual problema principal você quer resolver com esta demanda?”).

## Foco (adaptado a este skill)

O artefato final inclui `<requirements>` (Negocio / Arquitetura / UI/UX) e opcionalmente `<api_contracts>`. Por isso o foco das perguntas **não** é idêntico ao PRD puro:

- **Estilo PRD** (o quê / por quê / para quê valor / quem / critérios de sucesso): para lacunas de negócio, persona, escopo, prioridade, métricas. Evite drift para stack ou biblioteca; isso é detalhe de implementação fora do prompt base, salvo se o usuário pediu explicitamente documentar no prompt.
- **Estilo TechSpec** (como no nível de **contrato**): quando faltar detalhe para `<api_contracts>` ou para bullets de **Arquitetura** que o próprio input já sugere (rotas, códigos de erro, integração). Uma dimensão por pergunta; opções A/B/C com fallback.

## YAGNI leve

Para enriquecimentos opcionais (critério extra, edge case): ofereça adotar ou não em múltipla escolha; não acumule escopo sem confirmação.
