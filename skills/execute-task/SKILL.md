---
name: execute-task
description: Executa uma tarefa de PRD de ponta a ponta usando um arquivo de tarefa fornecido, o diretório do PRD, os caminhos dos arquivos de tracking e o modo de auto-commit. Use quando um prompt incluir uma especificação de tarefa que precisa ser implementada, validada e refletida nos arquivos de tracking de tarefas. Não use para lotes de revisão de PR, tarefas genéricas de código sem um arquivo de tarefa de PRD, ou trabalho que seja apenas de verificação isolada.
---

# Execute PRD Task

Execute uma tarefa de PRD, da exploração às atualizações de tracking.

## Entradas Necessárias

- Markdown da especificação da tarefa.
- Caminho do diretório do PRD.
- Caminho do arquivo da tarefa.
- Caminho do arquivo mestre de tarefas.
- Modo de auto-commit.
- Opcional: caminho do diretório de memória de workflow.
- Opcional: caminho da memória de workflow compartilhada.
- Opcional: caminho da memória da tarefa atual.

## Fluxo de Trabalho

1. Fundamente-se no contexto do repositório e do PRD.
   - Leia a especificação de tarefa fornecida.
   - Leia os arquivos de orientação do repositório indicados pelo chamador.
   - Leia os documentos do PRD no diretório fornecido, especialmente `_techspec.md` e `_tasks.md`.
   - Leia os ADRs do subdiretório `adrs/` do diretório do PRD para entender o contexto das decisões arquiteturais desta tarefa.
   - Após ler todas as fontes, verifique conflitos entre a especificação da tarefa, o techspec e os ADRs. Se algum requisito contradisser outro, pare e reporte o conflito em vez de adivinhar — não prossiga para o passo 2.
   - Se o chamador fornecer caminhos de memória de workflow, use a skill instalada `workflow-memory` antes de editar código.
   - Reconcilie o estado atual do workspace antes de novas edições.

2. Monte o checklist de execução.
   - Extraia os deliverables, os critérios de aceitação e cada item explícito de `Validation`, `Test Plan` ou `Testing` para um checklist de trabalho numerado.
   - Imprima o checklist completo antes de iniciar a implementação para que fique visível e rastreável.
   - Capture o sinal concreto pré-mudança que prova que a tarefa ainda não está concluída.
   - Use este checklist como portão: marque cada item como feito conforme a evidência é produzida durante a implementação, e não prossiga para a validação até que cada item do checklist tenha sido tratado.

3. Implemente a tarefa.
   - Mantenha o escopo restrito à especificação da tarefa.
   - Siga os padrões do repositório e as APIs reais das dependências.
   - Registre trabalho fora de escopo significativo como notas de acompanhamento, em vez de expandir a tarefa silenciosamente.

4. Valide e faça auto-revisão.
   - Execute cada comando de teste e validação listado na especificação da tarefa — não apenas a verificação ampla do repositório.
   - Use a skill instalada `final-verify`. Este passo é obrigatório independentemente do modo de auto-commit — sempre verifique antes de afirmar conclusão.
   - Faça uma auto-revisão após a verificação e resolva cada problema bloqueante antes de prosseguir.

5. Atualize o tracking da tarefa.
   - Se caminhos de memória de workflow foram fornecidos, atualize os arquivos de memória primeiro — registre decisões, aprendizados e superfícies tocadas antes de atualizar o status de tracking.
   - Use o caminho do arquivo de tarefa e o caminho do arquivo mestre de tarefas fornecidos pelo chamador.
   - Marque subtarefas como concluídas apenas quando a implementação e a evidência estiverem de fato completas.
   - Mude o status da tarefa para completed apenas após verificação limpa e auto-revisão.
   - Leia `references/tracking-checklist.md` ao aplicar atualizações de status, checklist ou commit.
   - Sequência: atualização de memória (se aplicável) -> checkboxes do arquivo de tarefa -> status da tarefa -> arquivo mestre de tarefas -> commit (se aplicável).

6. Trate o comportamento de commit.
   - Se o auto-commit estiver habilitado, crie um único commit local após verificação limpa, auto-revisão e atualizações de tracking.
   - Se o auto-commit estiver desabilitado, deixe o diff pronto para revisão e commit manuais.
   - Nunca faça push automaticamente.

## Idioma

Todas as saídas geradas, comentários de código e atualizações de tracking DEVEM ser escritos em **Português do Brasil (pt-BR)**.

## Tratamento de Erros

- Se o sinal pré-mudança não puder ser reproduzido diretamente, capture o sinal de baseline mais forte disponível e declare a limitação.
- Se a validação falhar, mantenha o status da tarefa inalterado até a falha ser resolvida.
- Se arquivos de tracking estiverem ausentes, pare e reporte o caminho ausente antes de marcar a conclusão.
