# Checklist de Tracking — Worker Orquestrado

Aplique este checklist ao concluir uma task invocada pelo **task-orchestrator**. Atualiza **somente** o arquivo individual da task (`task_NN.md`).

1. Releia a especificação da task e o contexto (`context_task_NN.md`, se fornecido) antes de marcar qualquer item.
2. Atualize **todos** os checkboxes em `## Subtasks` que correspondem a subtarefas concluídas com evidência de implementação e validação.
3. Verifique deliverables e critérios de aceitação da task — cada um deve estar refletido nos checkboxes ou no corpo da task.
4. Mude o frontmatter YAML `status:` para `completed` **somente** após implementação, validação (`final-verify`) e auto-revisão completas.
5. **Não** leia, altere nem dependa de `_tasks.md` — o orquestrador atualiza o mestre após cherry-pick.
6. Siga o modo de commit do chamador; não inclua `_tasks.md` em commits do worktree.
