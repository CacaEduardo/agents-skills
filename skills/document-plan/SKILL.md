---
name: document-plan
description: Documenta um plano de implementação em .documentation/<feature>/ criando README de contexto, runbook passo a passo com comandos, tasks.md com status checkável e progress.md para retomar sessões. Use quando o usuário quer documentar, rastrear ou revisitar um plano de implementação. Invoque com --update para retroalimentar o tracker com o estado atual do código.
argument-hint: "<feature-name> [--update]"
---

# Document Plan

Cria e mantém a documentação viva de um plano de implementação em `.documentation/<feature>/`.

## Quick start

```
/document-plan <feature-name>           # cria documentação do plano atual
/document-plan <feature-name> --update  # retroalimenta com o estado atual do código
```

## Workflows

### Criar documentação (sem --update)

1. **Ler o plano** — obter da conversação, do arquivo `.claude/plans/` ou do usuário.

2. **Criar `.documentation/<feature>/`** com quatro arquivos:

   - **`README.md`** — contexto, problema, arquitetura do fluxo, stack, decisões técnicas. Serve como ponto de entrada em qualquer sessão futura.
   - **`runbook.md`** — cada step tem: título, contexto em 1 linha, comandos exatos, critério de validação ("como saber que funcionou"), e referência à task (`→ task_XX`). Ordenado pela sequência de execução.
   - **`tasks.md`** — master task list com status `[ ]` pending / `[~]` in-progress / `[x]` done, agrupadas por fase, dependências explícitas, complexidade (low/medium/high/critical).
   - **`progress.md`** — estado inicial: todas as tasks pending, seção "Para retomar: comece pela task 01", seção "Desvios" vazia.

3. **Confirmar com o usuário** — mostrar estrutura criada antes de prosseguir com implementação.

### Retroalimentar (--update)

1. Ler `.documentation/<feature>/tasks.md` e `.documentation/<feature>/progress.md`.
2. Para cada task: verificar no código se os arquivos e mudanças esperados existem.
3. Atualizar status em `tasks.md`: `[ ]` → `[~]` → `[x]` conforme evidência encontrada.
4. Reescrever `progress.md`:
   - **Última task concluída** com data estimada
   - **Próxima task** com instrução clara de onde continuar
   - **Desvios do plano** (se houver — arquivos diferentes, abordagem alterada)
   - **Bloqueios** (se houver)

## Formato de tasks.md

```markdown
# <Feature> — Tasks

## Fase 1 — <Nome>

| # | Título | Status | Complexidade | Deps |
|---|--------|--------|-------------|------|
| 01 | Título da task | [ ] | low | — |
| 02 | Outra task | [ ] | medium | 01 |

## Fase 2 — <Nome>

| # | Título | Status | Complexidade | Deps |
|---|--------|--------|-------------|------|
| 03 | Mais uma task | [ ] | high | 01, 02 |
```

## Formato de progress.md

```markdown
# Progress — <Feature>

**Última atualização:** YYYY-MM-DD

## Estado atual

- Tasks concluídas: X/N
- Fase atual: Fase Y — <Nome>

## Para retomar

Comece pela **task XX — <Título>**.

<contexto específico: o que está pronto, o que falta, qualquer gotcha>

## Desvios do plano original

- Nenhum até o momento.

## Bloqueios

- Nenhum.
```

## Regras

- Nunca sobrescrever `tasks.md` completo em `--update` — apenas atualizar status das cells
- Ao criar: todas as tasks começam como `[ ]`
- Idioma: português (pt-BR)
- Cada runbook step deve ter validação — sem "como verificar", o step está incompleto
