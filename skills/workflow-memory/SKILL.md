---
name: workflow-memory
description: Mantém memória de tarefa com escopo de workflow usando arquivos .specs/<name>/memory/. Use quando um prompt de tarefa fornece caminhos de memória de workflow e exige que o agente leia, atualize, compacte e promova contexto durável entre execuções de tarefa de PRD. Não use para remediação de revisão de PR, preferências globais de usuário ou resumo programático de log de eventos.
---

# Workflow Memory

Mantenha os arquivos de memória de workflow fornecidos pelo chamador.

## Entradas Necessárias

- Caminho do diretório de memória de workflow (tipicamente `.specs/<slug>/memory/`).
- Caminho do arquivo de memória de workflow compartilhado.
- Caminho do arquivo de memória da tarefa atual.
- Opcional: sinal do chamador indicando se um dos arquivos deve ser compactado antes de prosseguir.

## Fluxo de Trabalho

1. Carregue o estado da memória antes de editar código.
   - Leia o arquivo de memória de workflow compartilhado e o arquivo de memória da tarefa atual antes de fazer qualquer mudança de código.
   - Trate estes arquivos como contexto obrigatório para a execução, não notas opcionais.
   - Se o chamador marcar um arquivo para compactação, leia `references/memory-guidelines.md` e compacte esse arquivo antes de prosseguir com a implementação.

2. Mantenha a memória atual enquanto a tarefa roda.
   - Atualize a memória da tarefa atual sempre que o objetivo muda, uma decisão não óbvia é feita, um aprendizado importante surge ou um erro muda o plano.
   - Promova apenas contexto durável entre tarefas para a memória de workflow compartilhada.
   - Mantenha detalhes de execução específicos da tarefa no arquivo de memória da tarefa atual.

3. Feche a execução de forma limpa.
   - Atualize a memória antes de qualquer afirmação de conclusão, entrega ou commit.
   - Registre apenas fatos que ajudem a próxima execução a começar mais rápido e com menos erros.
   - Releia `references/memory-guidelines.md` antes de compactar se o arquivo cresceu barulhento ou repetitivo.

## Regras Críticas

- Não invente histórico, decisões ou status que não aconteceram.
- Não copie grandes blocos de código, stack traces ou specs de tarefa para os arquivos de memória.
- Não duplique fatos que são óbvios do repositório, git diff, arquivo de tarefa ou documentos do PRD.
- Não leia arquivos de memória de tarefas não relacionadas a menos que a memória de workflow compartilhado ou o chamador explicitamente aponte para eles.
- Mantenha memória compartilhada durável e entre-tarefas. Mantenha memória de tarefa local e operacional.

## Teste de Decisão de Promoção

Antes de promover um item da memória de tarefa para a memória de workflow compartilhado, pergunte-se:

1. Outra tarefa precisará desta informação para evitar um erro ou redescoberta?
2. Este fato é durável entre múltiplas execuções, não apenas a execução atual?
3. Esta informação NÃO é já óbvia do PRD, techspec, arquivos de tarefa ou do repositório?

Os três devem ser "sim" para promover. Se algum for "não", o item fica na memória de tarefa.
