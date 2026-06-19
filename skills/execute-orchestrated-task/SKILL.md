---
name: execute-orchestrated-task
description: Executa uma task de PRD dentro de um worker do task-orchestrator — implementação, validação, checklist completo em task_NN.md e commit no worktree. Não atualiza _tasks.md (responsabilidade do orquestrador). Use somente quando invocado por um subagent do task-orchestrator com worktree_path e context_file. Não use para execução manual de task isolada — use execute-task.
---

# Execute Orchestrated Task

Execute uma task de PRD como **worker isolado** do task-orchestrator: implementação, validação e conclusão completa do arquivo `task_NN.md`. O rastreio mestre (`_tasks.md`) é **exclusivo do orquestrador**.

> **Diff intencional vs `execute-task`:** este fluxo omite qualquer escrita em `_tasks.md`. Mantido em sync com `execute-task` nos passos 1–4 e 6.

## Entradas Necessárias

- Caminho do arquivo da task (`task_NN.md`).
- Caminho do diretório da spec (`spec_dir`).
- Caminho absoluto do worktree (`worktree_path`) — único local para alterações de código.
- Caminho absoluto do repositório Git (`git_root`).
- Modo de auto-commit (`auto_commit`).
- Opcional: `context_file` — `<spec_dir>/context_task_NN.md` curado pelo orquestrador (preferir sobre PRD/TechSpec inteiros).
- Opcional: caminhos de memória de workflow (mesmo contrato do `execute-task`).

**Não recebe** `tracking_file` — não há atualização de `_tasks.md`.

## Restrições do worker

- Não comunique com o usuário.
- Não altere `_tasks.md` nem leia seu status para decidir elegibilidade.
- Não execute `npm install`, `npm ci`, `yarn install` ou `pnpm install` — `node_modules` já está linkado no worktree.
- Edite código **somente** em `worktree_path`.

## Fluxo de Trabalho

1. Fundamente-se no contexto.
   - Leia a especificação da task (`task_NN.md`).
   - Leia os arquivos de orientação indicados pelo orquestrador (`AGENTS.md` / `CLAUDE.md` na raiz do workspace e em `git_root`).
   - Se `context_file` foi fornecido, leia-o **primeiro** como contexto curado; abra `_prd.md` e `_techspec.md` inteiros **somente** se a task ou o context file exigir trechos ausentes.
   - Leia ADRs em `<spec_dir>/adrs/` quando relevantes à task.
   - Verifique conflitos entre task, techspec e ADRs; se houver contradição, pare e reporte no JSON de retorno.
   - Se caminhos de memória de workflow foram fornecidos, use a skill `workflow-memory` antes de editar código.
   - Reconcilie o estado do worktree antes de novas edições.

2. Monte o checklist de execução.
   - Extraia deliverables, critérios de aceitação e itens de `Validation`, `Test Plan` ou `Testing` para um checklist numerado.
   - Imprima o checklist antes de implementar.
   - Capture sinal pré-mudança que prova que a task ainda não está concluída.
   - Marque cada item conforme a evidência é produzida; não prossiga para validação até tratar todos.

3. Implemente a task.
   - Escopo restrito à especificação da task.
   - Siga padrões do repositório e APIs reais.
   - Trabalhe em `worktree_path` para todo código.
   - Registre desvios significativos como notas, sem expandir escopo silenciosamente.

4. Valide e faça auto-revisão.
   - Execute cada comando de teste/validação listado na task.
   - Use a skill `final-verify` — obrigatório antes de afirmar conclusão.
   - Resolva problemas bloqueantes antes de atualizar tracking.

5. Atualize o tracking **da task** (somente `task_NN.md`).
   - Se caminhos de memória de workflow foram fornecidos, atualize memória primeiro.
   - Leia `references/tracking-checklist.md` e aplique **todos** os itens.
   - Marque **cada checkbox** em `## Subtasks` como concluído quando implementado e validado.
   - Atualize frontmatter YAML: `status: completed` somente após verificação limpa e auto-revisão.
   - **Não** abra, leia nem modifique `_tasks.md`.
   - Sequência: memória (se aplicável) → checkboxes → frontmatter da task.

6. Trate o commit.
   - Se `auto_commit` estiver habilitado, crie **um** commit local no worktree após verificação, auto-revisão e tracking da task.
   - Inclua no commit apenas arquivos de código no worktree; `task_NN.md` fica em `spec_dir` (fora do Git) — não force commit de tracking no repo salvo regra explícita do projeto.
   - Se `auto_commit` desabilitado, deixe diff pronto para o orquestrador.
   - Nunca faça push.

## Retorno ao orquestrador

Ao concluir (sucesso ou falha), retorne **somente JSON** — sem texto adicional:

```json
{
  "task_id": "task_NN",
  "git_root": "<absoluto>",
  "status": "done|failed",
  "branch": "task/<spec-slug>/task_NN",
  "commits": ["<sha>"],
  "task_file_status": "completed|unchanged|failed",
  "summary": "resumo curto pt-BR",
  "error": ""
}
```

## Idioma

Todas as saídas, comentários de código e atualizações de tracking em **Português do Brasil (pt-BR)**.

## Tratamento de Erros

- Se validação falhar, **não** marque `completed` no frontmatter nem checkboxes — mantenha task incompleta e retorne `status: failed`.
- Se arquivos de tracking da task estiverem ausentes, pare e reporte no JSON.
- Se sinal pré-mudança não puder ser reproduzido, documente a limitação no `summary`.
