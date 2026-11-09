# Publicação no GitHub

Todos os comandos assumem `gh` autenticado e execução dentro do repositório da PR. `{owner}/{repo}` é resolvido automaticamente pelo `gh api`.

## Identificar o usuário e o autor

```bash
gh api user --jq .login
gh pr view <PR> --json author --jq .author.login
```

Se forem iguais, a review só pode ser `COMMENT` (o GitHub não permite aprovar/pedir mudanças na própria PR).

## Review com comentários inline (pedir mudanças)

Monte um JSON no scratchpad e envie em uma única chamada — assim o dev recebe uma notificação só.

```json
{
  "commit_id": "<headRefOid>",
  "event": "REQUEST_CHANGES",
  "body": "## Revisão\n\n**Veredito:** mudanças necessárias.\n\n| Sev. | Dimensão | Local | Resumo |\n|---|---|---|---|\n| 🔴 | Quebra | `src/x.ts:10` | ... |\n\n### Achados fora do diff\n- 🔴 `src/tela/Outra.tsx:42` — ...\n\nO plano de correção completo está no comentário abaixo.",
  "comments": [
    {
      "path": "src/utils/price.ts",
      "line": 18,
      "side": "RIGHT",
      "body": "🟠 **Duplicação** — ..."
    },
    {
      "path": "src/api/route.ts",
      "start_line": 30,
      "line": 42,
      "side": "RIGHT",
      "body": "🔴 **Quebra** — ..."
    }
  ]
}
```

```bash
gh api repos/{owner}/{repo}/pulls/<PR>/reviews --method POST --input <scratchpad>/review.json
```

Regras:

- `line` é a linha no arquivo **da versão da PR** (`side: RIGHT`). Para comentar linha removida use `side: LEFT` com a linha da base.
- A linha precisa fazer parte de um hunk do diff. Se a API responder `422` ("line must be part of the diff"), mova esse achado para a seção "Achados fora do diff" do `body` e reenvie.
- Use `commit_id` = `headRefOid` coletado na etapa 1. Se a PR recebeu push durante a revisão, avise o usuário antes de publicar.

## Comentário com o plano de correção

```bash
gh pr comment <PR> --body-file <scratchpad>/plan-comment.md
```

Formato do `plan-comment.md`:

````markdown
### 🤖 Plano de correção para IA

Copie o conteúdo abaixo e entregue para a IA de sua preferência (ou use o arquivo `.reviews/pr-<n>.md`).

<details>
<summary>Abrir plano</summary>

<conteúdo de .reviews/pr-<n>.md>

</details>
````

Limite do GitHub: 65.536 caracteres por comentário. Se passar, divida em partes numeradas.

## Aprovar

```bash
gh pr review <PR> --approve --body "<resumo do que foi verificado>"
```

Sugestões 🟡 não bloqueantes podem ir como comentários inline numa review `APPROVE` usando o mesmo JSON acima com `"event": "APPROVE"`.

## Merge e exclusão da branch

1. Confirme que pode mergear:

```bash
gh pr view <PR> --json mergeable,mergeStateStatus,isDraft
gh pr checks <PR>
```

`mergeStateStatus` deve ser `CLEAN` (ou `UNSTABLE` só se os checks que falham não forem obrigatórios — pergunte ao usuário). `BLOCKED`, `BEHIND`, `DIRTY` ou `DRAFT`: não faça merge, informe o motivo.

2. Descubra os métodos permitidos:

```bash
gh repo view --json squashMergeAllowed,mergeCommitAllowed,rebaseMergeAllowed,deleteBranchOnMerge
```

Prioridade padrão: `--squash` > `--merge` > `--rebase`, entre os permitidos. Informe o método escolhido na etapa de confirmação; o usuário pode trocar.

3. Mergear e excluir a branch:

```bash
gh pr merge <PR> --squash --delete-branch
```

- Se a branch vier de um fork, `--delete-branch` não remove a branch remota do fork; avise.
- Nunca use `--admin`.
- Se o repo usa merge queue, `gh pr merge` coloca na fila; informe que o merge ficará pendente.

## Limpeza local

```bash
git worktree remove <scratchpad>/pr-<PR> --force
git branch -D review/pr-<PR>
```
