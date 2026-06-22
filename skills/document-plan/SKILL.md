---
name: document-plan
description: Cria e mantém um plano de implementação híbrido em .plans/<feature>.md. Une a descoberta rigorosa do BDS com a estrutura de tarefas e validação do CDT. Sem --update faz perguntas de descoberta e gera o plano. Com --update relê o código e atualiza status e checklists.
argument-hint: "<feature-name> [--update]"
---

# Document Plan (Híbrido)

Cria e mantém `.plans/<feature>.md` — a única fonte de verdade para o plano de implementação, combinando agilidade técnica e rigor de validação.

## Quick start

```
/document-plan <feature-name>           # modo interativo: perguntas → gera o plano
/document-plan <feature-name> --update  # atualiza status, checklists e progress log com evidências do código
```

---

## Workflow 1 — Criar plano (sem --update)

### Passo 1 — Descoberta Rigorosa
Faça as perguntas abaixo **uma de cada vez**, esperando a resposta antes de continuar.

1. **Propósito:** O que esta feature faz e qual problema resolve? (1–3 frases)
2. **Fases:** Como o trabalho se divide? Liste as etapas e o objetivo de cada uma.
3. **Invariants:** O que nunca pode quebrar? (APIs, contratos, dados críticos)
4. **Codebase:** Quais áreas são afetadas? (Paths e subprojetos)
5. **Discovery:** Existe algum comando útil para mapear o estado atual?
6. **Branch:** Qual a estratégia de branch? (feature, stacked, trunk)

Se o usuário já forneceu contexto suficiente na conversa, **pule as perguntas já respondidas** e confirme apenas o que ficou ambíguo.

### Passo 2 — Gerar `.plans/<feature>.md`
Use `templates/PLAN_TEMPLATE.md` como base. Regras de preenchimento:

- **Resume Point:** Inicialmente aponta para a Task 01.
- **Master Task List:** Transforme as fases em tarefas numeradas. Cada tarefa **deve** ter um critério de validação claro ("Como testar?").
- **Checklists:** Gere checklists detalhados por fase abaixo da Master Task List.
- **Progress log:** Inicie com a linha `| 0 | — | — | Plano criado |`.

### Passo 3 — Confirmar e Salvar
Mostre o conteúdo, aguarde aprovação e salve em `.plans/<feature>.md`.

---

## Workflow 2 — Atualizar plano (--update)

1. **Leitura:** Ler `.plans/<feature>.md`.
2. **Verificação de Evidências:** Para cada task pendente, buscar no código arquivos, exports ou rotas que comprovem a implementação.
3. **Atualização de Status:**
   - `[ ]` (pendente) → `[~]` (em progresso) → `[x]` (concluído).
   - Atualizar o **Resume Point** no header para a próxima tarefa pendente.
4. **Progress Log:** Se houver novos commits ou branches merged, adicionar uma nova entrada detalhada (não remover as antigas).
5. **Bloqueios:** Registrar qualquer impedimento encontrado em **Deferred / blocked**.

---

## Regras Gerais

- **Arquivo Único:** `.plans/<feature>.md` é a única fonte de verdade.
- **Validação:** Nenhuma tarefa é marcada como concluída sem evidência de que o critério de validação foi atendido.
- **Idioma:** Português (pt-BR), exceto termos técnicos e comandos.
- **Sequencial:** Perguntas de descoberta sempre uma por uma.
