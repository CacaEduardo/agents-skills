---
name: review-pr
description: Revisa uma Pull Request do GitHub de ponta a ponta — aderência às diretrizes do projeto (CLAUDE.md, AGENTS.md e afins), over-engineering, duplicação de código, risco de quebra em produção e em consumidores (telas, componentes, rotas de API) — e publica a revisão com comentários inline. Se estiver OK, aprova, faz merge e exclui a branch; se houver problemas, pede mudanças e gera um plano de correção .md pronto para o dev entregar a outra IA. Use quando o usuário pedir para revisar, analisar ou aprovar uma PR (número, URL ou branch). Não use para revisar mudanças locais não publicadas nem para corrigir o código da PR.
---

# Review PR

Revisão completa de uma PR, agnóstica de stack e de repositório. O revisor **não altera o código da PR** — ele avalia, comenta, decide e entrega um plano de correção.

## Entradas

- PR: número, URL ou nome da branch. Se nada for informado, use `gh pr view --json number` da branch atual; se não houver, liste `gh pr list` e pergunte.
- Opcional: foco extra pedido pelo usuário (ex.: "olhe só a parte de API").

## Pré-requisitos

- `gh` autenticado (`gh auth status`). Se falhar, pare e informe.
- Rodar a partir do repositório da PR. Em monorepo com vários repos git aninhados, entre no repo cujo remote corresponde à PR.

## Fluxo

Siga as etapas em ordem. Não publique nada no GitHub antes da etapa 7.

### 1. Coletar contexto da PR

```bash
gh pr view <PR> --json number,title,body,author,baseRefName,headRefName,headRefOid,isDraft,mergeable,mergeStateStatus,reviewDecision,files,additions,deletions,url,closingIssuesReferences
gh pr diff <PR>
gh pr checks <PR>
gh api repos/{owner}/{repo}/pulls/<PR>/comments   # comentários inline anteriores
gh pr view <PR> --comments                         # discussão anterior
```

- Leia título, descrição e issues vinculadas (`gh issue view`) para entender **qual problema a PR resolve**. Isso é a régua para avaliar over-engineering.
- Se a PR for draft, avise o usuário e pergunte se deve continuar.
- Se existir `.reviews/pr-<n>.md` ou revisão anterior sua na PR, esta é uma **re-revisão**: verifique primeiro se cada item anterior foi resolvido, depois procure problemas novos.

### 2. Preparar o código da PR sem mexer no working tree do usuário

```bash
git fetch origin pull/<PR>/head:review/pr-<PR> && git fetch origin <base>
git worktree add <scratchpad>/pr-<PR> review/pr-<PR>
```

- Use o diretório temporário da sessão (scratchpad) para o worktree. Analise o código **na versão da PR** e compare com a base (`git diff origin/<base>...review/pr-<PR>`).
- Se for preciso rodar lint/typecheck/testes e as dependências não estiverem instaladas, prefira confiar no `gh pr checks`; só instale se o usuário pedir.
- Ao final (etapa 9), remova o worktree e a branch local `review/pr-<PR>`.

### 3. Descobrir as diretrizes do projeto

Procure, na versão da PR, **na raiz e em cada diretório ancestral dos arquivos alterados**:

- `CLAUDE.md`, `AGENTS.md`, `.claude/CLAUDE.md` (ignore `CLAUDE.local.md`: é pessoal)
- `.cursor/rules/*.mdc`, `.cursorrules`, `.github/copilot-instructions.md`, `.windsurfrules`
- `CONTRIBUTING.md`, `docs/architecture*`, ADRs (`adrs/`, `docs/adr/`)
- Configs que codificam regras: ESLint, Prettier, tsconfig, editorconfig

Siga referências internas (`@arquivo.md`, links "leia X") um nível adiante. Monte uma lista curta das regras **aplicáveis aos arquivos alterados**, cada uma com a fonte (`arquivo:linha`). Se não houver nenhum arquivo de diretrizes, registre isso e use as convenções inferidas do código vizinho (como os arquivos irmãos fazem a mesma coisa).

### 4. Analisar as quatro dimensões obrigatórias

Detalhes, sinais e comandos de busca em [references/review-checklist.md](references/review-checklist.md). Resumo:

1. **Diretrizes do projeto** — a implementação foge de alguma regra da etapa 3 ou do padrão dos arquivos vizinhos? Cite a regra e a fonte.
2. **Over-engineering** — a solução é proporcional ao problema? Abstrações com uma única implementação, generalização especulativa, camadas pass-through, dependências novas para algo trivial, config/flags que ninguém pediu. Sempre proponha a versão mais simples.
3. **Duplicação / reinvenção** — para cada função, hook, componente, util, tipo, rota ou query **nova**, procure no repositório algo que já faça o mesmo (inclusive em libs já instaladas). Aponte o existente (`arquivo:linha`) e como reutilizá-lo.
4. **Risco de quebra** — para cada símbolo **alterado ou removido** (assinatura, props, tipo exportado, contrato de API, schema/migration, env var, rota, evento, chave de storage), encontre **todos os consumidores fora do diff** e verifique se continuam funcionando. Considere clientes já publicados (apps mobile antigos, integrações) e dados existentes em produção.

Além disso, registre bugs de correção, segurança e ausência de testes **quando encontrar** — mas o foco são as quatro dimensões acima.

Para PRs grandes (> ~30 arquivos ou > ~1500 linhas), é aceitável dividir as quatro dimensões entre subagentes em paralelo, cada um recebendo o diff, a lista de diretrizes e o caminho do worktree; consolide e deduplique os resultados.

### 5. Verificar cada achado antes de reportar

Para cada achado, confirme no código (não só no diff) que ele é real:

- Abra o arquivo na versão da PR e o trecho citado. Para "quebra", mostre o consumidor concreto e por que quebra. Para "duplicação", mostre o código existente. Para "diretriz", cite a regra literal.
- Descarte o que for preferência pessoal sem base em diretriz ou risco concreto, ou o que já é tratado em outro lugar.
- Classifique a severidade:
  - 🔴 **Bloqueante** — quebra produção/consumidores, bug, falha de segurança, perda de dados, viola regra explícita do projeto.
  - 🟠 **Importante** — over-engineering relevante, duplicação clara, desvio de padrão que vai custar manutenção. Também bloqueia a aprovação.
  - 🟡 **Sugestão** — melhoria opcional. **Não bloqueia.**

### 6. Decidir o veredito e mostrar ao usuário

- **Aprovar** se não houver 🔴 nem 🟠 **e** os checks de CI estiverem verdes (ou sem checks) **e** a PR estiver mergeável.
- **Pedir mudanças** caso contrário.
- Se não houver achados mas o CI estiver falhando ou houver conflito, o veredito é pedir mudanças citando isso.

Mostre ao usuário, antes de publicar:

1. Veredito e justificativa em 1–2 frases.
2. Tabela de achados: severidade, dimensão, `arquivo:linha`, resumo.
3. O que será feito no GitHub (review + comentários inline; ou aprovação + método de merge + exclusão da branch).
4. Caminho do plano de correção (se houver).

Peça confirmação explícita. O usuário pode remover/editar achados ou trocar o veredito; respeite.

### 7. Publicar no GitHub (após confirmação)

Comandos exatos em [references/github-publishing.md](references/github-publishing.md).

**Se houver problemas:**

1. Gere o plano de correção com o template [references/fix-plan-template.md](references/fix-plan-template.md) e salve em `.reviews/pr-<n>.md` na raiz do repositório. Garanta que `.reviews/` está em `.git/info/exclude` (não altere o `.gitignore` do projeto). Em re-revisão, sobrescreva o arquivo mantendo a seção de histórico.
2. Publique **uma única review** com `event=REQUEST_CHANGES` contendo: corpo-resumo + um comentário inline por achado (na linha exata do diff). Achados em linhas fora do diff (ex.: consumidor quebrado em arquivo não alterado) vão no corpo da review com `arquivo:linha`.
3. Publique o plano de correção como comentário da PR (dentro de `<details>`), para o dev copiar e entregar à IA dele.

**Se estiver OK:**

1. `gh pr review --approve` com um corpo curto (o que foi verificado; sugestões 🟡, se houver, ficam como comentários não bloqueantes).
2. Faça merge com o método permitido pelo repo e exclua a branch (ver referência). Se o merge for bloqueado (branch protection, checks pendentes, revisões obrigatórias), não force — informe o usuário.

Restrições:

- Não é possível aprovar nem pedir mudanças na **própria PR**: se `author` = usuário autenticado, publique como `COMMENT` e avise.
- Nunca use `--admin` nem bypass de proteção.
- Nunca inclua rodapé de atribuição de IA ("Generated with…", "Made with…") nos comentários.
- Escreva os comentários no idioma usado na PR/repo (padrão: português do Brasil), em tom respeitoso e direto, sempre com **o problema, o porquê e a correção sugerida**.

### 8. Formato dos comentários inline

```markdown
🟠 **Duplicação** — `formatCurrency` reimplementa `formatMoney` de `src/utils/money.ts:12`.

**Por quê:** duas fontes de verdade para formatação; já divergem no arredondamento.

**Sugestão:** remover esta função e usar `formatMoney(value, { cents: true })`.
```

Use bloco ` ```suggestion ` do GitHub quando a correção couber nas linhas comentadas.

### 9. Encerrar

- Remova o worktree e a branch local `review/pr-<PR>`.
- Responda ao usuário com: veredito, link da review, número de achados por severidade e o caminho absoluto do plano `.reviews/pr-<n>.md` (se gerado).
