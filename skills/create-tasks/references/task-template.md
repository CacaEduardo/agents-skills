# Template de Arquivo de Tarefa

Use esta estrutura para todo arquivo individual de tarefa. O arquivo deve começar com frontmatter YAML contendo os metadados parseáveis.

```markdown
---
status: pending
title: [Título da tarefa]
type: [um de frontend, backend, docs, test, infra, refactor, chore, bugfix, ou um override de [tasks].types específico do projeto]
complexity: [low, medium, high, critical]
dependencies:
  - task_01
  - task_02
---

# Task N: [Título]

## Overview
[2-3 frases: o que a tarefa realiza e por que importa no contexto do projeto.]

<critical>
- SEMPRE LEIA o PRD e o TechSpec antes de começar
- REFERENCIE O TECHSPEC para detalhes de implementação — não duplique aqui
- FOQUE NO "QUÊ" — descreva o que precisa ser realizado, não como
- MINIMIZE CÓDIGO — mostre código apenas para ilustrar a estrutura atual ou áreas problemáticas
- TESTES OBRIGATÓRIOS — toda tarefa DEVE incluir testes nos deliverables
</critical>

<requirements>
- [Requisito 1 — requisito técnico específico]
- [Requisito 2 — ex.: "DEVE autenticar usuários via tokens JWT"]
- [Requisito 3]
</requirements>

## Subtasks
- [ ] N.1 [Descrição da subtarefa — O QUÊ realizar]
- [ ] N.2 [Descrição da subtarefa]
- [ ] N.3 [Descrição da subtarefa]

## Implementation Details
[Caminhos de arquivos a criar ou modificar, pontos de integração e dependências.
Referencie a seção de implementação do TechSpec para padrões de código e designs de interface.]

### Relevant Files
- `path/to/file` — [motivo breve pelo qual este arquivo é relevante]

### Dependent Files
- `path/to/dependency` — [motivo breve pelo qual este arquivo é afetado]

### Related ADRs
- [ADR-NNN: Título](../adrs/adr-NNN.md) — Relevância para esta tarefa

## Deliverables
- [Saída concreta 1]
- [Saída concreta 2]
- Testes unitários com 80%+ de cobertura **(OBRIGATÓRIO)**
- Testes de integração para [feature] **(OBRIGATÓRIO)**

## Tests
- Testes unitários:
  - [ ] [Caso de teste 1 — ex.: "Caminho feliz: entrada válida retorna a saída esperada"]
  - [ ] [Caso de teste 2 — ex.: "Caminho de erro: entrada inválida retorna erro descritivo"]
  - [ ] [Casos de borda e condições-limite]
- Testes de integração:
  - [ ] [Caso de teste — ex.: "Fluxo ponta a ponta da requisição à resposta"]
- Meta de cobertura de testes: >=80%
- Todos os testes devem passar

## Success Criteria
- Todos os testes passando
- Cobertura de testes >=80%
- [Resultado mensurável 1]
- [Resultado mensurável 2]
```

## Diretrizes

- Toda tarefa deve ser implementável de forma independente quando suas dependências forem atendidas.
- Toda tarefa DEVE incluir uma seção Tests e itens de teste em Deliverables.
- Nunca crie tarefas separadas dedicadas exclusivamente a testes.
- As subtarefas descrevem O QUÊ precisa acontecer, não COMO implementar.
- Minimize código nas tarefas. Mostre código apenas para ilustrar a estrutura atual ou áreas problemáticas.
- Os detalhes de implementação devem referenciar o TechSpec para os padrões, em vez de duplicá-los.
