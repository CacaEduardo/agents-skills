---
name: reverse-requirements
description: Lê uma feature do repositório, pasta indicado (código, pastas, arquivos ou documentação) e extrai a regra de negócio em um documento de requisitos claro e independente de implementação, portável para outros sistemas. Use quando o usuário indicar uma feature, pasta, arquivo ou prompt e pedir para extrair, documentar ou organizar a regra de negócio, ou gerar requisitos a partir de código existente. Não use para criar PRD do zero, especificação técnica, quebra de tarefas ou implementação de código.
argument-hint: "[referência da feature: pasta, arquivos, doc ou descrição]"
---

# Reverse Requirements

Leia uma feature existente e produza um documento de **regra de negócio** sólido, claro e **independente de implementação**, pronto para ser consumido por outra IA em migração de feature.

<HARD-GATE>
NÃO escreva o documento final até concluir a leitura da fonte E uma rodada de esclarecimento com o usuário.
NUNCA inclua código, nomes de frameworks/bibliotecas, caminhos de arquivos, nomes de funções/variáveis, estrutura de pastas ou padrões específicos do lab.
O documento descreve apenas O QUÊ e o PORQUÊ do negócio — nunca o COMO técnico.
</HARD-GATE>

## Princípio Central: Destilar, Não Copiar

A fonte (código/docs) é evidência da regra de negócio, não o produto final. Seu trabalho é **inferir a intenção de negócio** por trás da implementação e reescrevê-la em linguagem de domínio neutra.

- ERRADO: "A função `calcDiscount` aplica desconto se `tier === 'gold'`."
- CERTO: "Clientes do nível Ouro recebem desconto sobre o valor base."
- ERRADO: "Há um `useEffect` que recarrega a tabela quando o filtro muda."
- CERTO: "Ao alterar o filtro, a listagem reflete imediatamente o novo critério."

Se uma informação só existe por causa da tecnologia (estado de UI, cache, formato de payload), ela **não** entra no documento, a menos que represente uma regra de negócio real.

## Contrato de Saída (obrigatório)

O documento final deve ser previsível e reaproveitável por outras IAs. Gere sempre em `pt-BR`, com seções fixas do template e os seguintes requisitos:

- Regras numeradas (`RN-NNN`) com racional explícito.
- Validações numeradas (`VAL-NNN`) e vinculadas a regras.
- Fluxos e estados referenciando IDs de regra.
- Seção de **Invariantes de Negócio** (o que nunca pode ser violado).
- Seção de **Critérios de Aceite** em formato verificável (estilo Given/When/Then em linguagem natural).
- Seção de **Decisões para Migração**: o que é obrigatório preservar, o que é configurável, e o que depende de contexto local.
- Seção de **Questões em Aberto** separada de fatos confirmados.

## Como Fazer Perguntas

Use a ferramenta interativa do runtime que **pausa até o usuário responder**. Uma pergunta por mensagem. Prefira múltipla escolha (A/B/C) com uma opção "Outro". Se não houver tal ferramenta, faça a pergunta como mensagem completa e pare.

## Entradas

O usuário indica a fonte via prompt, podendo referenciar: uma pasta/feature, arquivos específicos, documentação existente, ou apenas uma descrição. Aceite qualquer combinação e resolva para o conjunto relevante de evidências.

## Checklist

Crie uma tarefa para cada fase e conclua em ordem:

1. **Resolver a fonte** — identificar pasta/arquivos/docs indicados; derivar o slug da feature; criar `.specs/<slug>/` se não existir.
2. **Mapear a regra de negócio** — ler a fonte e extrair atores, regras, fluxos, estados, validações, cálculos, invariantes, decisões e casos de borda. Catalogar lacunas e ambiguidades.
3. **Esclarecer com o usuário** — fazer 3-6 perguntas (uma por vez) para resolver ambiguidades de negócio e confirmar intenção. Nunca perguntar sobre implementação.
4. **Rascunhar o documento** — preencher `references/document-template.md` com linguagem de domínio neutra.
5. **Executar quality gates** — validar completude, consistência interna e portabilidade (ver seção "Quality Gates").
6. **Revisar com o usuário** — apresentar o rascunho e iterar até aprovação.
7. **Salvar** — gravar em `.specs/<slug>/business-rules.md` e confirmar o caminho.

## Fluxo de Trabalho

1. **Resolver a fonte.** Identifique tudo que o usuário referenciou. Derive um slug curto (ex.: `price-quote`). Garanta `.specs/<slug>/`.

2. **Mapear a regra de negócio.** Leia a evidência e extraia, em rascunho interno:
   - **Atores e papéis** — quem usa e com qual objetivo.
   - **Regras de negócio** — afirmações verificáveis (condição → resultado), numeradas RN-001, RN-002…
   - **Fluxos** — sequências do ponto de vista do usuário/negócio.
   - **Estados e transições** — quando houver ciclo de vida (ex.: rascunho → aprovado → cancelado).
   - **Validações e restrições** — o que é exigido, proibido ou limitado, e o porquê.
   - **Cálculos e fórmulas** — descritos conceitualmente (entradas → saída → critério), sem código.
   - **Invariantes** — condições que devem ser sempre verdadeiras.
   - **Decisões de migração** — itens inegociáveis vs configuráveis.
   - **Casos de borda e exceções** — o que acontece nos limites e em falhas de negócio.
   Liste explicitamente toda lacuna ou ambiguidade encontrada para virar pergunta.

3. **Esclarecer.** Foque exclusivamente em intenção de negócio: por que a regra existe, quem é afetado, qual impacto, o que é esperado nos limites e o que é flexível na migração. Uma pergunta por mensagem. Não infira regras críticas a partir de detalhes técnicos sem confirmar.

4. **Rascunhar.** Leia `references/document-template.md` e preencha cada seção obrigatória. Inclua diagramas Mermaid para fluxos (`flowchart`) e ciclos de vida (`stateDiagram-v2`) quando agregarem clareza. Numere as regras (RN-NNN) e referencie-as nos fluxos, validações e critérios de aceite. Use tabelas para validações e estados. Idioma: pt-BR. Sem detalhes técnicos.

5. **Quality gates (obrigatório antes da revisão).**
   - **Completude:** existe ao menos 1 item preenchido em todas as seções aplicáveis.
   - **Consistência:** não há contradições entre regras, fluxos, estados e validações.
   - **Rastreabilidade:** cada fluxo/validação/caso de borda referencia RN-NNN.
   - **Testabilidade:** critérios de aceite são verificáveis sem detalhes técnicos.
   - **Portabilidade:** nenhum termo depende da stack original; há distinção entre obrigatório e configurável para migração.

6. **Revisar.** Apresente o rascunho completo e pergunte: A) Aprovar B) Ajustar seções (quais) C) Reescrever seção X D) Recomeçar. Itere conforme a resposta.

7. **Salvar.** Grave `.specs/<slug>/business-rules.md`. Confirme o caminho ao usuário.

## Filtro Anti-Implementação (aplicar antes de salvar)

Revise o documento e remova qualquer ocorrência de: nomes de arquivos/pastas, frameworks/bibliotecas, nomes de funções/variáveis/componentes, trechos de código, detalhes de UI que não sejam regra, estruturas de dados técnicas (schemas, tipos), e jargão de stack. Se um item descreve COMO e não O QUÊ, reescreva ou remova. Se existir palavra vaga ("normalmente", "idealmente", "rápido"), substitua por condição observável.

## Tratamento de Erros

- Fonte ambígua ou insuficiente: pergunte ao usuário; não invente regras.
- Regra inferida do código mas não confirmada: registre em "Premissas" ou "Questões em Aberto" em vez de afirmá-la como certa.
- Conflito entre código e descrição do usuário: aponte o conflito e peça decisão.
- Documento já existente: opere em modo de atualização, preservando seções não solicitadas.
- Falta de evidência para regra crítica: não promova a regra para fato; mantenha como hipótese explícita.

## Princípios-Chave

- **Destilar, não copiar** — a fonte é evidência; o produto é a regra de negócio em linguagem neutra.
- **Zero implementação** — nada de código, frameworks, arquivos ou padrões do lab.
- **Rastreável** — toda regra numerada (RN-NNN) e referenciada em fluxos/validações.
- **Verificável** — toda regra importante deve poder ser validada por critério de aceite.
- **Uma pergunta por vez** — esclareça intenção de negócio, nunca implementação.
- **Portável** — o documento deve ser aplicável em qualquer sistema, não só no lab.
- **Honestidade sobre lacunas** — o que não está claro vira premissa ou questão em aberto, não suposição silenciosa.
