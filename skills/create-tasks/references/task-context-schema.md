# Schema do Frontmatter de Tarefa

Os metadados da tarefa ficam no frontmatter YAML no topo de cada arquivo `task_NN.md`.

## Campos Obrigatórios

- `status`: Estado do ciclo de vida da tarefa.
- `title`: Título legível da tarefa. Deve coincidir com o primeiro H1 no corpo da tarefa.
- `type`: Slug do tipo de trabalho permitido. Use `[tasks].types` de `.specs/config.toml` quando configurado; caso contrário, use os padrões embutidos: `frontend`, `backend`, `mobile`, `docs`, `test`, `infra`, `refactor`, `chore`, `bugfix`.
- `complexity`: Classificação de dificuldade. Deve ser uma de: `low`, `medium`, `high`, `critical`.
- `dependencies`: Lista YAML de nomes de arquivos de tarefa que devem ser concluídos antes desta tarefa. Use `[]` quando não houver dependências.

## Valores de Status

Valores válidos de `status`:

- `pending` — a tarefa não foi iniciada.
- `in_progress` — a tarefa está sendo trabalhada no momento.
- `completed` — a tarefa está finalizada e verificada.
- `done` — tratado como completed.
- `finished` — tratado como completed.

## Nomenclatura de Arquivos

Os arquivos de tarefa devem corresponder ao padrão `task_\d+\.md` com números preenchidos por zeros à esquerda:
- `task_01.md`, `task_02.md`, `task_10.md`, `task_99.md`

O prefixo de underscore inicial é reservado para documentos meta:
- `_prd.md` — Documento de Requisitos de Produto
- `_techspec.md` — Especificação Técnica
- `_tasks.md` — Lista mestra de tarefas

## Convenções

- Use `task_NN.md` (sem underscore inicial nos arquivos de tarefa). O antigo prefixo `_task_` está descontinuado.
- Todo arquivo de tarefa DEVE começar com frontmatter YAML válido para que agentes e ferramentas possam ler os metadados de forma confiável.
- Mantenha o `title` do frontmatter alinhado ao cabeçalho H1 no corpo markdown.
