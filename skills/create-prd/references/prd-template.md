# Template de PRD

Use este template para estruturar todo Documento de Requisitos de Produto. Preencha cada seção com base nos resultados do brainstorming. Deixe orientações de placeholder nas seções onde a informação for insuficiente e registre-as em Questões em Aberto.

## Visão Geral

Visão geral de alto nível da feature ou produto. Descreva:
- Qual problema resolve
- Para quem é
- Por que é valioso

## Objetivos

Objetivos específicos e mensuráveis para esta feature ou produto:
- Métricas de sucesso e indicadores-chave de desempenho
- Objetivos de negócio e resultados esperados
- Prazos ou marcos-alvo

## Histórias de Usuário

Histórias de usuário organizadas por persona:
- Como [tipo de usuário], quero [ação] para que [benefício]
- Personas principais e seus fluxos principais
- Personas secundárias e casos de borda

## Features Principais

Principais features agrupadas por prioridade:
- Nome da feature: o que faz, por que é importante, comportamento de alto nível
- Requisitos funcionais de cada feature
- Interação entre features

## Experiência do Usuário

Jornada do usuário do primeiro contato ao uso regular:
- Personas-chave e seus objetivos
- Fluxos principais do usuário, passo a passo
- Considerações de UI/UX e requisitos de acessibilidade
- Onboarding e descoberta (discoverability)

## Restrições Técnicas de Alto Nível

Limites necessários que moldam o produto sem prescrever a implementação:
- Integrações necessárias com sistemas existentes
- Mandatos de compliance ou requisitos regulatórios
- Metas de desempenho da perspectiva do usuário
- Requisitos de privacidade de dados e segurança

NÃO inclua detalhes de implementação como bancos de dados específicos, frameworks, designs de API ou padrões de arquitetura.

## Não-Objetivos (Fora de Escopo)

Features e limites explicitamente excluídos:
- Features intencionalmente adiadas para fases futuras
- Problemas adjacentes que não serão tratados
- Limites deste esforço

## Plano de Lançamento em Fases

Plano de entrega incremental com critérios de sucesso por fase:

### MVP (Fase 1)
- Features principais incluídas
- Critérios de sucesso para avançar à Fase 2

### Fase 2
- Features adicionais
- Critérios de sucesso para avançar à Fase 3

### Fase 3
- Conjunto completo de features
- Critérios de sucesso de longo prazo

## Métricas de Sucesso

Medidas quantificáveis de sucesso:
- Métricas de engajamento do usuário
- Benchmarks de desempenho da perspectiva do usuário
- Indicadores de impacto de negócio
- Atributos de qualidade

## Riscos e Mitigações

Riscos não técnicos que podem afetar o produto:
- Riscos de adoção e estratégias de mitigação
- Riscos competitivos
- Restrições de prazo e recursos
- Riscos de dependência de fatores externos

NÃO inclua riscos técnicos como complexidade arquitetural ou dívida técnica.

## Architecture Decision Records

ADRs documentando decisões-chave tomadas durante o brainstorming:
- [ADR-NNN: Título](adrs/adr-NNN.md) — Resumo de uma linha da decisão

## Questões em Aberto

Itens remanescentes que precisam de esclarecimento:
- Requisitos pouco claros
- Casos de borda que exigem input de stakeholders
- Dependências de decisões ainda não tomadas
