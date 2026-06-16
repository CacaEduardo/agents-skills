# Protocolo de Perguntas

Protocolo de brainstorming estruturado para criação de PRD. Siga estas fases e regras para guiar a conversa da ideia ao documento.

## Fases

### 1. Descoberta

Reúna o contexto inicial sobre a ideia ou o espaço do problema.
- Qual é o problema ou oportunidade central?
- Quem são os usuários afetados?
- O que motivou esta iniciativa?

### 2. Entendimento

Aprofunde o conhecimento sobre requisitos e restrições.
- QUAIS features específicas os usuários precisam?
- POR QUE isso traz valor de negócio?
- QUEM são os usuários-alvo e quais são seus fluxos de trabalho atuais?
- Quais são os critérios de sucesso?
- Quais são as restrições conhecidas (prazo, orçamento, compliance)?

### 3. Opções

Apresente abordagens de produto para o usuário avaliar.
- Ofereça 2-3 abordagens distintas com trade-offs claros.
- Comece pela abordagem recomendada e explique por quê.
- Cada abordagem deve diferir de forma significativa em escopo, faseamento ou estratégia.
- Aguarde o usuário selecionar antes de prosseguir.

### 4. Refinamento

Refine a abordagem selecionada com acompanhamentos direcionados.
- Esclareça os limites de escopo da abordagem escolhida.
- Confirme o faseamento e a prioridade das features.
- Valide os critérios de sucesso e as métricas.
- Resolva quaisquer questões em aberto remanescentes.

### 4b. Validação Incremental do Design

Apresente o design de produto seção por seção para aprovação do usuário.
- Dimensione cada seção à sua complexidade: breve para tópicos diretos, detalhada para os mais sutis.
- Apresente uma seção por vez; pergunte se está correta antes de avançar.
- Aplique YAGNI: questione cada feature quanto à necessidade no MVP.
- Esteja pronto para revisar qualquer seção antes de prosseguir para a próxima.

### 5. Criação

Gere o documento PRD usando o contexto coletado.
- Leia e preencha o template do PRD.
- Cada seção deve refletir decisões confirmadas.
- Itens não resolvidos vão para Questões em Aberto.

## Regras

### Exigência de Pergunta Interativa
- Toda pergunta DEVE ser feita usando a ferramenta interativa de perguntas dedicada do runtime — aquela que apresenta a pergunta e pausa a execução até o usuário responder.
- Não emita perguntas como texto comum e continue gerando.
- Se nenhuma ferramenta desse tipo estiver disponível, apresente a pergunta como sua mensagem completa e pare de gerar.

### Limites de Perguntas
- Faça apenas uma pergunta por mensagem. Se um tópico precisar de exploração mais profunda, divida-o em uma sequência de perguntas individuais.
- Prefira perguntas de múltipla escolha quando as opções puderem ser predeterminadas.
- Aguarde a resposta do usuário antes de fazer a próxima pergunta.

### Portões de Progressão
- Deve concluir ao menos uma rodada completa de Entendimento antes de apresentar Opções.
- Deve ter clareza sobre propósito, restrições e critérios de sucesso antes de apresentar abordagens.
- Deve ter aprovação do usuário sobre uma abordagem antes de entrar no Refinamento.

### Limites de Foco
- As perguntas devem focar em QUÊ, PORQUÊ e QUEM.
- Nunca pergunte COMO, ONDE ou QUAL em relação à implementação técnica.
- Tópicos proibidos: bancos de dados, APIs, estrutura de código, frameworks, estratégias de teste, padrões de arquitetura, infraestrutura de deploy.

### Princípio YAGNI
- Remova sem dó as features não essenciais durante o refinamento.
- Questione cada feature: o MVP precisa disto?
- Adie features "bom ter" para fases posteriores.
- Prefira escopo menor e bem definido em vez de amplitude ambiciosa.

### Antipadrão: Pular o Brainstorming Para Features "Simples"
Todo PRD passa pelo protocolo completo de perguntas, independentemente da simplicidade percebida. Features simples são onde premissas de negócio não examinadas causam o maior retrabalho. O brainstorming pode ser breve, mas deve acontecer.
