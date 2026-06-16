# Diretrizes de Workflow Memory

Use estas regras para manter a memória de workflow útil entre execuções repetidas de tarefas de PRD.

## Funções dos Arquivos

### Memória de workflow compartilhado: `MEMORY.md`

Use a memória de workflow compartilhado para contexto que deve sobreviver entre múltiplas tarefas e múltiplas execuções.

Mantenha:
- estado atual do workflow que afeta mais de uma tarefa
- decisões técnicas ou de produto duráveis
- aprendizados reutilizáveis que importarão novamente
- riscos abertos ou notas de entrega que mudam a execução futura

Evite:
- notas scratch passo a passo
- grandes trechos de código
- fatos que são já explícitos em `_prd.md`, `_techspec.md`, `_tasks.md` ou no próprio repositório

### Memória da tarefa atual: `memory/<task filename>`

Use a memória da tarefa para contexto que é específico da tarefa atual.

Mantenha:
- snapshot do objetivo atual
- decisões locais da tarefa importantes
- aprendizados locais e correções
- arquivos tocados ou superfícies que valem ser lembrados na próxima execução
- notas prontas para a próxima execução

Evite:
- resumos entre-tarefas que pertencem a `MEMORY.md`
- reafirmações repetidas da spec da tarefa
- transcripts de comando de baixo sinal

## Regras de Promoção

Promova um item da memória de tarefa para a memória de workflow compartilhado apenas quando ele for:
- durável entre execuções
- útil para outra tarefa
- provável de prevenir erros repetidos ou redescoberta

Deixe informação na memória de tarefa quando ela for:
- operacional apenas para a tarefa atual
- temporária
- detalhada demais para reuso em workflow-wide

## Regras de Compactação

Quando compactação é requerida:
- preserve estado atual, decisões duráveis, aprendizados reutilizáveis, riscos abertos e entregas
- remova repetição, notas obsoletas, transcripts longos e fatos deriváveis
- reescreva para clareza, não para completude
- prefira bullets factuais curtos sobre logs narrativos

## Limites de Seção Padrão

### `MEMORY.md`

- `## Current State`
- `## Shared Decisions`
- `## Shared Learnings`
- `## Open Risks`
- `## Handoffs`

### `memory/<task filename>`

- `## Objective Snapshot`
- `## Important Decisions`
- `## Learnings`
- `## Files / Surfaces`
- `## Errors / Corrections`
- `## Ready for Next Run`
