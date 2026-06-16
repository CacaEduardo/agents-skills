# Template de Arquivo de Issue

Use exatamente esta estrutura para cada arquivo de issue em `.specs/<feature>/reviews-NNN/`.

## Formato

```
---
status: pending
file: path/to/file.js
line: 42
severity: critical|high|medium|low
round: 1
round_created_at: 2026-05-31T12:00:00Z
pr:
---

# Issue NNN: <título conciso resumindo o problema>

## Review Comment

<descrição detalhada da issue, por que é um problema,
e um fix sugerido com um snippet de código conciso se útil>

## Triage

- Decision: `UNREVIEWED`
- Notes:
```

## Definições de Campo

- **NNN**: Número de issue preenchido com zeros de 3 dígitos (001, 002, ...).
- **status**: Começa como `pending`, depois move para `valid` ou `invalid`, e termina como `resolved`.
- **title**: Resumo de uma linha no H1. Máximo 72 caracteres.
- **file**: Caminho relativo da raiz do repositório para o arquivo de origem afetado. Use `unknown` apenas quando a issue é puramente arquitetural.
- **line**: Número da linha onde a issue é mais visível. Use `0` quando nenhuma linha específica se aplica.
- **severity**: Exatamente um de `critical`, `high`, `medium`, `low`. Veja `review-criteria.md`.
- **round**: Inteiro correspondendo ao diretório `reviews-NNN` (ex. `1` para `reviews-001`).
- **round_created_at**: Mesmo timestamp UTC RFC3339 em cada issue da rodada.
- **pr**: Opcional número de PR ou URL se o usuário forneceu; deixe vazio caso contrário.

## Regras

- Uma issue por arquivo. Não combine múltiplos problemas não relacionados.
- Nomes de arquivos de issue devem corresponder a `issue_NNN.md` (preenchido com zeros).
- O Review Comment deve ser acionável: declare o problema e sugira um fix concreto.
- Mantenha snippets de código em Review Comment em menos de 15 linhas.
