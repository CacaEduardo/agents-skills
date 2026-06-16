---
name: create-tasks
description: Decompõe PRDs e TechSpecs em arquivos de tarefa detalhados e implementáveis de forma independente, com enriquecimento a partir da exploração do código-base. Use quando existir um PRD ou TechSpec que precise ser quebrado em tarefas executáveis, ou quando arquivos de tarefa precisarem de enriquecimento com contexto de implementação. Não use para criação de PRD, geração de TechSpec ou execução direta de tarefas.
argument-hint: "[nome-da-feature] [arquivo-prd]"
---

# Create Tasks

Decomponha requisitos em arquivos de tarefa detalhados e acionáveis, com enriquecimento informado pelo código-base.

## Entradas Necessárias

- Nome da feature que identifica o diretório `.specs/<name>/`.
- No mínimo, `_prd.md` ou `_techspec.md` nesse diretório.

## Fluxo de Trabalho

1. Carregue o registro de tipos.
   - Leia `.specs/config.toml` se ele existir.
   - Se contiver `[tasks].types`, use essa lista como os valores de `type` permitidos.
   - Caso contrário, use os padrões embutidos: `frontend`, `backend`, `docs`, `test`, `infra`, `refactor`, `chore`, `bugfix`.

2. Carregue o contexto.
   - Leia `_prd.md` e `_techspec.md` de `.specs/<name>/`.
   - Leia os ADRs existentes em `.specs/<name>/adrs/` para entender o contexto de decisão por trás dos requisitos e das escolhas de design.
   - Se `_techspec.md` estiver ausente:
     - Avise o usuário de que as tarefas serão de nível mais alto, sem a orientação de implementação do TechSpec.
     - Derive as tarefas dos requisitos funcionais e histórias de usuário do PRD, em vez das seções de implementação do TechSpec.
     - Durante o enriquecimento, apoie-se mais fortemente na exploração do código-base para preencher `## Implementation Details`, `### Relevant Files` e `### Dependent Files`.
     - Marque `<requirements>` com requisitos comportamentais derivados do PRD, em vez de requisitos técnicos derivados do TechSpec.
     - Aponte explicitamente as lacunas de detalhe de implementação ausentes no corpo da tarefa, em vez de inventar especificidades.
   - Se tanto `_prd.md` quanto `_techspec.md` estiverem ausentes, pare e peça ao usuário para criar ao menos um primeiro.
   - Dispare uma chamada da ferramenta Agent para explorar o código-base em busca de arquivos a criar ou modificar, padrões de teste e convenções de código.

3. Quebre em tarefas.
   - Decomponha as seções de implementação do TechSpec em tarefas granulares e implementáveis de forma independente.
   - **Cada tarefa DEVE ser implementável de forma independente quando todas as suas dependências declaradas forem atendidas.** Nenhuma tarefa pode exigir trabalho não declarado de outra tarefa. Se duas tarefas tiverem acoplamento forte, ou as mescle ou extraia a parte compartilhada para uma tarefa de dependência.
   - **Sem dependências circulares.** Se a tarefa A depende da tarefa B, a tarefa B NÃO pode depender da tarefa A (direta ou transitivamente).
   - Cada tarefa deve ter: título, tipo, complexidade e dependências.
   - Atribua a complexidade usando estes critérios:
     - `low`: Mudança em um único arquivo, sem novas interfaces, sem concorrência, lógica direta.
     - `medium`: 2-4 arquivos, pode introduzir uma nova interface ou struct, pontos de integração limitados.
     - `high`: 5+ arquivos, novo subsistema ou refatoração significativa, múltiplos pontos de integração, concorrência envolvida.
     - `critical`: Mudança transversal afetando muitos pacotes, alto risco de regressão, exige coordenação com outras tarefas.
   - Quando uma tarefa implementa diretamente ou é restringida por um ADR específico, inclua a referência ao ADR na seção "Related ADRs" da tarefa, dentro de Implementation Details.
   - Embuta os requisitos de teste em cada tarefa. Nunca crie tarefas separadas dedicadas exclusivamente a testes.
   - Siga a estrutura definida em `references/task-template.md`.
   - Consulte `references/task-context-schema.md` para as definições dos campos de metadados.

4. Apresente a quebra de tarefas para aprovação interativa.
   - Mostre todas as tarefas com: títulos, descrições, classificações de complexidade e cadeias de dependência.
   - Aguarde o feedback do usuário antes de prosseguir.
   - Se o usuário solicitar mudanças, revise a quebra e apresente novamente.
   - Itere até o usuário aprovar explicitamente.

5. Gere os arquivos de tarefa.
   - Escreva `_tasks.md` como a lista mestra de tarefas usando exatamente este formato de tabela markdown:
     ```markdown
     # [Nome da Feature] — Lista de Tarefas

     ## Tasks

     | # | Title | Status | Complexity | Dependencies |
     |---|-------|--------|------------|--------------|
     | 01 | [Título da tarefa] | pending | [low/medium/high/critical] | [task_NN, ... ou —] |
     ```
   - Escreva os arquivos individuais de tarefa como `task_01.md`, `task_02.md`, até `task_N.md`.
   - Os arquivos de tarefa usam o prefixo `task_` sem underscore inicial.
   - Cada arquivo deve começar com frontmatter YAML contendo `status`, `title`, `type`, `complexity` e `dependencies`. Use `dependencies: []` quando não houver dependências — não omita o campo.
   - A numeração das tarefas deve ser sequencial e consistente entre `_tasks.md` e os arquivos individuais.

6. Enriqueça cada arquivo de tarefa.
   - Para cada arquivo de tarefa, verifique se ele já tem as seções `## Overview`, `## Deliverables` e `## Tests`. Se as três existirem, pule o enriquecimento desse arquivo.
   - Mapeie a tarefa aos requisitos do PRD e à orientação do TechSpec.
   - Dispare uma chamada da ferramenta Agent para descobrir arquivos relevantes, arquivos dependentes, pontos de integração e regras do projeto para esta tarefa específica.
   - Preencha TODAS as seções do template de `references/task-template.md`. Todo arquivo de tarefa DEVE conter cada uma das seções a seguir — omitir qualquer uma é uma falha:
     - `## Overview`: o que a tarefa realiza e por quê, em 2-3 frases.
     - Bloco `<critical>`: o bloco padrão de lembretes críticos (ler PRD/TechSpec, referenciar o TechSpec, focar no QUÊ, minimizar código, testes obrigatórios).
     - Bloco `<requirements>`: requisitos técnicos específicos e numerados, usando linguagem DEVE/DEVERIA.
     - `## Subtasks`: 3-7 itens de checklist descrevendo o QUÊ, não o COMO.
     - `## Implementation Details`: caminhos de arquivos a criar ou modificar, pontos de integração. Referencie o TechSpec para os padrões.
     - `### Relevant Files`: caminhos descobertos na exploração do código-base, com motivos breves.
     - `### Dependent Files`: arquivos que serão afetados por esta tarefa, com motivos breves.
     - `### Related ADRs`: links para ADRs relevantes, se existirem, ou omita a subseção se nenhum ADR se aplicar.
     - `## Deliverables`: saídas concretas com itens de teste obrigatórios e meta de cobertura de ao menos 80%.
     - `## Tests`: casos de teste específicos como checklists, divididos nas categorias de testes unitários e testes de integração.
     - `## Success Criteria`: resultados mensuráveis incluindo "Todos os testes passando" e "Cobertura de testes >=80%".
   - Reavalie a complexidade com base nos achados da exploração e atualize se houver mudança.
   - Atualize o arquivo de tarefa no lugar com o conteúdo enriquecido.
   - Se o enriquecimento falhar para uma tarefa, continue para a próxima e reporte todas as falhas ao final.

## Idioma

Todas as tarefas, descrições e saídas geradas DEVEM ser escritas em **Português do Brasil (pt-BR)**.

## Antipadrões

NÃO produza tarefas com estes defeitos:

- **Mega-tarefas.** Se uma tarefa toca mais de 7 arquivos ou tem mais de 7 subtarefas, ela é ampla demais. Divida-a em tarefas menores com dependências explícitas entre elas.
- **Duplicação do TechSpec.** NÃO copie definições de interface, trechos de código ou diagramas arquiteturais do TechSpec para os arquivos de tarefa. Referencie a seção do TechSpec pelo nome (ex.: "Veja a seção 'Core Interfaces' do TechSpec") em vez de reproduzir seu conteúdo.
- **Casos de teste vagos.** NÃO escreva descrições de teste como "testar o caminho feliz" ou "verificar o tratamento de erros". Cada caso de teste deve nomear a entrada, condição ou comportamento específico sendo verificado (ex.: "POST /job/done com ID de job desconhecido retorna 404").

## Tratamento de Erros

- Se tanto `_prd.md` quanto `_techspec.md` estiverem ausentes, pare e peça ao usuário para criar ao menos um primeiro.
- Se o usuário rejeitar a quebra de tarefas, incorpore todo o feedback antes de apresentar novamente.
- Se a exploração do código-base revelar limites de tarefa que não correspondem ao TechSpec, registre a discrepância e pergunte ao usuário como proceder.
- Se o diretório de destino não existir, crie-o.
- Se um arquivo de tarefa já existir e estiver totalmente enriquecido, pule-o e siga para o próximo.
