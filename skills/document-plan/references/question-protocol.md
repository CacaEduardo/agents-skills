# Protocolo de Perguntas — Document Plan

Rodada de descoberta interativa para transformar um pedido em um plano faseado e executável. É o equivalente rápido do brainstorming de PRD + esclarecimento técnico de TechSpec, condensado em uma única rodada.

Diferença de foco em relação ao `create-prd`: aqui **pode** e **deve** perguntar COMO, ONDE e COM QUÊ. O plano é um artefato técnico.

## Fases da conversa

### 1. Enquadramento

Ancore o problema antes de qualquer proposta.

- Qual é o comportamento atual e qual é o comportamento desejado?
- Qual sinal observável prova que o trabalho terminou?
- O que já foi tentado e não funcionou?

Boa parte disso já sai da exploração do código-base. Não pergunte o que você pode ler no repositório — pergunte o que só o usuário sabe (intenção, prioridade, tolerância a risco).

### 2. Escopo

- O que fica **fora** desta rodada?
- Existe prazo, janela de deploy ou dependência de terceiros?
- Há trabalho relacionado em andamento que pode conflitar?

### 3. Faseamento

- Como o trabalho se divide em etapas com valor verificável isoladamente?
- Qual etapa precisa obrigatoriamente vir antes de qual, e por quê?
- Alguma etapa depende de ação manual (console, credencial, aprovação) que não dá para automatizar?

### 4. Invariants

- Que contratos não podem quebrar (API, formato de resposta, schema, permissões)?
- Que comportamento em produção precisa continuar idêntico?
- Existe feature flag, ambiente ou usuário específico que muda a resposta?

### 5. Validação

- Qual comando prova cada fase? (comando exato, não "rodar os testes")
- O que só pode ser validado manualmente, e como?
- Existe baseline a capturar antes da mudança?

### 6. Git, execução e paralelismo

- Qual `git_root` cada fase toca?
- Qual `base_branch`? Feature branch única, stacked branches ou trunk?
- Auto-commit ou diff para revisão manual?
- Quais fases poderiam rodar em paralelo sem colidir nos mesmos arquivos?

Essas respostas alimentam diretamente as colunas `Depende de` e `Git root` do Phase Outline, que o `plan-orchestrator` consome para montar as ondas.

### 7. Opções

- Apresente 2-3 abordagens de faseamento/estratégia, com trade-offs.
- Comece pela recomendada e explique por quê.
- Cada abordagem deve diferir em algo estrutural: ordem, granularidade, incremental vs. big-bang, migrar vs. reescrever, automatizar vs. manual.
- Aguarde a escolha antes de rascunhar.

## Regras

### Pergunta interativa obrigatória
- Toda pergunta usa a ferramenta interativa do runtime, que pausa até o usuário responder.
- Sem ferramenta desse tipo: a pergunta é a mensagem inteira e você para de gerar.
- Nunca responda à sua própria pergunta.

### Uma por mensagem
- Exatamente um ponto de interrogação por mensagem. Depois de perguntar, PARE.
- Antipadrão (PROIBIDO): "Quais fases você imagina? E qual seria a base branch?" — são duas perguntas, mande em duas mensagens.
- Precisa aprofundar? Faça o follow-up na próxima mensagem, depois da resposta.

### Múltipla escolha
- Obrigatória quando as opções puderem ser predeterminadas. Rotule A/B/C e inclua `D) Outro — descreva`.
- As opções devem vir da descoberta, com caminhos e nomes reais. `A) Alterar SearchRepository` é útil; `A) Alterar o backend` não é.
- Pergunta aberta só quando o espaço de resposta for genuinamente ilimitado.

### Não repergunte
- Se o usuário já respondeu na conversa, pule. Confirme só o que ficou ambíguo, e confirme em uma pergunta só.

### Portões de progressão
- Concluir a rodada inteira antes de apresentar abordagens.
- Ter clareza sobre invariants e validação antes de propor faseamento.
- Ter a abordagem aprovada antes de escrever ADR e plano.

### Volume
- 3 a 8 perguntas. Menos que 3 significa que você assumiu coisas demais; mais que 8 significa que você está perguntando o que poderia ter lido no código.

### YAGNI
- Toda fase proposta precisa se justificar pelo resultado observável.
- O que for "bom ter" vai para **Deferred / Blocked** com o motivo, não para uma fase.
