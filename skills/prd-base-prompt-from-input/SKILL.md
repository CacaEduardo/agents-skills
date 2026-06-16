---
name: prd-base-prompt-from-input
description: Transforma texto livre do usuário em um prompt estruturado com tags
  (task, goal, requirements, api_contracts opcional, acceptance_criteria,
  constraints) alinhado ao modelo de `prompt_template.md` nesta skill. Refina coesão, regras de
  negócio e descrição da demanda. Esclarecimentos seguem a mesma mecânica que
  create-prd / create-techspec: uma pergunta por mensagem, múltipla
  escolha (A/B/C + fallback), ferramenta interativa quando existir.
  Use quando o usuário pedir prompt base para PRD, estruturar demanda no
  formato do prompt_template desta skill, preparar _idea ou entrada para create-prd,
  ou converter requisito informal em especificação inicial consistente.
  Ao concluir, grava o resultado em `prompts/<nome_feature>.md` na raiz do monorepo.
---

# Prompt base para PRD a partir do input

## Objetivo

Gerar o prompt base no formato de tags desta skill (ver [`prompt_template.md`](prompt_template.md) ao lado deste `SKILL.md` e [references/prompt-template-schema.md](references/prompt-template-schema.md)) e **persistir** em arquivo na raiz do repositório: `prompts/<nome_feature>.md`. O conteúdo alimenta fluxos de PRD (por exemplo `create-prd`) com escopo, negócio e critérios alinhados.

## Fazer perguntas

Quando esta skill mandar interagir com o usuário para esclarecer ou validar uma sugestão, use a **ferramenta de pergunta interativa** do runtime (a que apresenta a pergunta e **pausa** até haver resposta). Não misture pergunta com continuação do raciocínio ou com o rascunho final na mesma mensagem.

Se o runtime **não** oferecer essa ferramenta: envie **somente** a pergunta (no formato abaixo) como mensagem completa e **pare** — não antecipe respostas nem gere o prompt base até o usuário responder.

Detalhes, anti-padrões e foco negócio vs contrato: [references/question-protocol.md](references/question-protocol.md) (alinhado a `create-prd` / `create-techspec`).

## Regras duras

1. **Não inventar escopo:** o que não estiver no input e não for confirmado pelo usuário nas respostas não entra como fato — no máximo como "a definir" só se o usuário pedir explicitamente.
2. **Seções condicionais:** omitir tags ou subseções que não se aplicam (ex.: sem API externa e sem contrato novo → omitir `<api_contracts>` por completo).
3. **Perguntas antes de corrigir ou enriquecer:** lacuna, ambiguidade, conflito ou melhoria proposta → **parar** e perguntar no formato desta skill (uma pergunta, múltipla escolha quando possível, sugestão como **opção rotulada** — ver protocolo). Só depois de esgotar as lacunas necessárias montar o prompt final.
4. **Uma pergunta por mensagem:** o mesmo rigor de `create-prd`: **um** `?` por mensagem; várias lacunas viram **sequência** de perguntas, cada uma após a resposta anterior. Não listar 3–8 perguntas numeradas na mesma mensagem.
5. **Linguagem:** corpo do prompt em português, alinhado ao estilo do [`prompt_template.md`](prompt_template.md) (Negocio, Arquitetura, UI/UX nos requirements).
6. **Arquivo obrigatório ao finalizar:** após o prompt base estar completo e validado pelas respostas do usuário, **gravar em disco** o bloco de tags em `prompts/<nome_feature>.md` (raiz do monorepo). Ver passo 5 do fluxo para nome do arquivo e criação da pasta.

## Fluxo de trabalho

### 1. Ler contexto

- Abrir [`prompt_template.md`](prompt_template.md) nesta pasta da skill como referência de tom e estrutura (exemplo canônico).
- Se o usuário apontar outro arquivo ou pasta (ex.: feature existente), ler o mínimo necessário para coerência.

### 2. Extrair e normalizar mentalmente

- **Task:** nome curto da demanda.
- **Goal:** resultado e valor de negócio.
- **Requirements:** fatos do input separados em Negocio / Arquitetura / UI/UX quando couber.
- **APIs:** detectar se há integração externa ou necessidade de documentar rotas; se incerto, perguntar.
- **Critérios e constraints:** só o que for inferível com segurança; o resto vai para perguntas.

### 3. Checagem de lacunas (obrigatória antes do draft final)

Classificar cada ponto como **claro** ou **incerto / ausente**. Para cada item incerto ou **melhoria proposta** (texto mais coeso, regra extra, critério adicional, contrato suposto), **enfileirar** mentalmente, mas **perguntar um item por mensagem**, na ordem de impacto (negócio e goal → requirements → contratos se houver tag).

Formato obrigatório de cada pergunta (igual em espírito a `create-prd` / `create-techspec`):

- Frase curta com **um único** ponto de interrogação.
- **Múltipla escolha** com rótulos **A, B, C, …** quando as respostas puderem ser antecipadas; última opção típica: **Outro — descreva** (ex.: D).
- **Sugestão do agente:** incorporar como opção explícita (ex.: **A)** Adotar: «…»), nunca como texto afirmativo que o usuário não escolheu.

Exemplos de gatilho para perguntar (um tópico por vez):

- Integração externa mencionada de passagem sem URLs ou limites de erro.
- Público-alvo, permissões, papéis ou multi-tenant não definidos.
- Comportamento em erro, vazio, timeout ou retry.
- Escopo frontend vs backend ambíguo.
- Duas interpretações possíveis do mesmo requisito.

Se **nada** precisar de confirmação, declarar em uma linha: "Nenhuma lacuna crítica; seguindo com o prompt base." e ir ao passo 4.

### 4. Montar o prompt base

Saída **somente** com as tags necessárias, nesta ordem:

`<task>` → `<goal>` → `<requirements>` → (`<api_contracts>` se aplicável) → `<acceptance_criteria>` → `<constraints>`

Dentro de `<requirements>`, usar linhas em branco entre blocos **Negocio:**, **Arquitetura:**, **UI/UX:** conforme existam.

- Texto objetivo, bullets com `- ` onde fizer sentido.
- **Acceptance criteria** alinhados ao que foi confirmado.
- **Constraints** com prefixos `FAÇA:`, `NÃO FAÇA:`, `NUNCA:` quando houver conteúdo; se não houver constraints confirmados, omitir a tag ou incluir apenas bullets que o usuário validou na rodada anterior.

### 5. Entrega (arquivo em `prompts/`)

1. **Nome do arquivo (`nome_feature.md`):** derivar um slug a partir do texto de `<task>` (minúsculas, sem acentos, espaços e caracteres não seguros substituídos por `-`, colapsar `--`, sem `-` no início/fim). Ex.: task «Painel de clima» → `painel-de-clima.md`. Se o usuário pedir um nome explícito para o arquivo, usar esse nome **sanitizado** da mesma forma (só `.md`, basename sem path).
2. **Caminho:** `prompts/<nome_feature>.md` na **raiz do monorepo** (irmã de `admin/`, `api/`, `app/` e `.specs/`, não dentro delas). Criar a pasta `prompts/` se ainda não existir.
3. **Conteúdo do arquivo:** apenas o bloco final com as tags (mesmo conteúdo que seria a saída “limpa”); não é obrigatório cabeçalho YAML nem comentários, salvo se o usuário pedir.
4. **Mensagem ao usuário:** confirmar o path relativo à raiz do repo e sugerir o próximo passo (`create-prd` com esse arquivo como entrada).

Se o usuário quiser **também** copiar o mesmo conteúdo para `_idea.md` ou outro destino, fazer isso só **em adição** ao arquivo obrigatório em `prompts/`, não em substituição.

## O que não fazer

- Não substituir a fase de PRD completa: este skill só produz o **prompt base estruturado**.
- Não encerrar o fluxo da skill sem **gravar** `prompts/<nome_feature>.md` na raiz do monorepo (salvo bloqueio explícito do usuário, ex.: sem permissão de escrita — nesse caso informar e entregar só o bloco na conversa).
- Não agrupar várias perguntas na mesma mensagem (anti-pattern em relação a `create-prd` / `create-techspec`).
- Não listar bibliotecas ou padrões de código salvo pedido explícito do usuário nas respostas (manter foco em negócio, escopo e contratos quando existirem).
- Não duplicar parágrafos entre **goal** e **requirements**; **goal** = visão; **requirements** = detalhamento.

## Referência rápida

- Tags e quando omitir: [references/prompt-template-schema.md](references/prompt-template-schema.md).
- Perguntas e sugestões: [references/question-protocol.md](references/question-protocol.md).

## Princípios-chave

- **Uma pergunta por mensagem** — não sobrecarregar; o mesmo tópico profundo vira sequência de perguntas.
- **Múltipla escolha preferida** — A/B/C + fallback; aberta só se o espaço de resposta for ilimitado.
- **Sugestão como opção** — nunca gravar melhoria não escolhida no prompt base.
- **Persistência em `prompts/`** — ao concluir, o artefato final deve existir em disco em `prompts/<nome_feature>.md`, não só na mensagem do chat.
