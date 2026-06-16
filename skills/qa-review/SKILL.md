---
name: qa-review
description: QA de feature em .specs/<slug>/ — gera execute_qa.md (playbook) e/ou executa revisão pós-implementação contra PRD/TechSpec/tasks, produzindo bugs.md (relatório, bugs, desvios), qa-screenshots/ para UI, e opcionalmente qa-tasks.md para execute-task. Use após tasks concluídas ou quando pedir execute_qa, rodada de QA ou revisão antes de entregar.
---

# QA Review

Uma skill para **planejar** e **executar** QA de features do 1Trainer. Artefatos ficam em `.specs/<slug>/`.

## Modos de uso

| Modo | Quando | Saída principal |
|------|--------|-----------------|
| **Playbook** | Usuário pede só `execute_qa`, prompt de QA ou preparar rodada | `execute_qa.md` |
| **Execução** | Implementação pronta, “rodar QA”, “revisar feature X” | `bugs.md` (+ `qa-screenshots/` se UI) |
| **Completo** | Pedido ambíguo | Gerar `execute_qa.md` se não existir, depois seguir e produzir `bugs.md` |

## Entrada obrigatória

- `.specs/<slug>/` com pelo menos `_prd.md`.
- Para execução: preferir `_techspec.md` e `_tasks.md` presentes; tasks concluídas ou usuário ciente de pendências.

## Artefatos de leitura

| Arquivo | Obrigatório | Uso |
|---------|-------------|-----|
| `_prd.md` | Sim | Requisitos e critérios de negócio |
| `_techspec.md` | Sim na execução | Contratos, rotas, testes |
| `_tasks.md` | Sim na execução | Escopo e status |
| `task_XX.md` | Condicional | Aceite detalhado por task |
| `adrs/*.md` | Opcional | Decisões verificáveis |
| `execute_qa.md` | Se existir | Seguir playbook já gerado |

## Saídas

### `execute_qa.md` (modo playbook)

Gerar em `.specs/<slug>/execute_qa.md` com:

1. Papel do QA — PRD + TechSpec + tasks como fonte de verdade.
2. **Limites** — `<critical>`: nesta rodada **não alterar código** da feature; documentar em `bugs.md` (e `qa-tasks.md` se necessário), salvo pedido explícito do usuário.
3. **Monorepo** — `admin/` (Next), `api/` (Express/Mongo), `app/` (Expo) conforme escopo.
4. Tabela de artefatos com paths reais.
5. **Ambiente** — `cd admin && npm run dev`, `cd api && npm run dev`, `cd app && npx expo start` quando aplicável; `.env` conforme `api/CLAUDE.md`.
6. Objetivos e **mapa requisito → verificação** (tabela do PRD).
7. **Rastreio implementação ↔ escopo** — cruzar tasks com arquivos no repo.
8. **Regras** — `admin/.cursor/rules/*.mdc` aplicáveis; `CLAUDE.md` raiz e dos subprojetos.
9. Etapas: docs → rastreio → ambiente → testes (MCP browser / manual) → API (`npm test` em `api/`) → lint (`npm run lint` em `admin/`) → `bugs.md`.
10. `qa-screenshots/` — convenção `NN-descricao-kebab.png`; N/A se só backend.
11. Checklist final e referência a skills `final-verify`, `execute-task` se houver correções.

**Esta skill no modo playbook** não altera `_prd.md`, `_techspec.md` nem tasks.

### `bugs.md` (modo execução)

Criar ou atualizar em `.specs/<slug>/bugs.md` em **pt-BR**, com subsecções:

1. Resumo da implementação verificada
2. Bugs encontrados (ID, severidade, passos, evidência)
3. Crítica e melhorias
4. Desvios do PRD/TechSpec/tasks
5. Conformidade com regras/skills

Ligar fluxos de UI a arquivos em `qa-screenshots/` (paths relativos à raiz do repo).

### `qa-screenshots/` (UI)

Obrigatório quando a feature tiver superfície admin/app: `.specs/<slug>/qa-screenshots/`.

### `qa-tasks.md` (opcional)

Se houver issues acionáveis: lista com critérios de aceite para **`execute-task`**. Omitir se QA passou limpo.

Não usar `_qa-report.md` — **`bugs.md`** é o relatório canônico.

## Workflow de execução

1. Ler contexto (PRD, TechSpec, tasks, ADRs).
2. Se não houver `execute_qa.md` e o escopo for grande, gerar playbook primeiro ou seguir estrutura acima inline.
3. Rastrear código implementado vs tasks (grep, paths da TechSpec).
4. Testar conforme escopo (API, admin UI, app).
5. Capturar screenshots por fluxo crítico de UI.
6. Preencher `bugs.md` com evidências reproduzíveis.
7. Usar **`final-verify`** antes de declarar “QA aprovado”.
8. Gerar `qa-tasks.md` apenas se houver correções pendentes.

## Princípios

- Aderência estrita ao PRD e TechSpec.
- Feedback acionável; não inventar credenciais.
- Não editar código-fonte da feature nesta rodada salvo pedido explícito.

## Verificação antes de concluir

- [ ] `.specs/<slug>/` e artefatos de entrada lidos
- [ ] `bugs.md` com todas as subsecções (modo execução)
- [ ] `execute_qa.md` criado se pedido (modo playbook)
- [ ] `qa-screenshots/` populada ou N/A documentado
- [ ] Rastreio implementação ↔ escopo feito
- [ ] Verificação (`final-verify`) com evidência quando declarar sucesso
