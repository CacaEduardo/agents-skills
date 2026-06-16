---
name: setup-pre-commit
description: Configura hooks pre-commit do Husky com lint-staged (Prettier), type checking e testes no repositório atual. Use quando o usuário quiser adicionar pre-commit hooks, configurar Husky, configurar lint-staged ou adicionar formatação/type-checking/testes no momento do commit.
---

# Setup Pre-Commit Hooks

## O que Isto Configura

- **Husky** pre-commit hook
- **lint-staged** rodando Prettier em todos os arquivos staged
- Configuração **Prettier** (se ausente)
- Scripts **typecheck** e **test** no pre-commit hook

## Passos

### 1. Detecte o gerenciador de pacotes

Procure por `package-lock.json` (npm), `pnpm-lock.yaml` (pnpm), `yarn.lock` (yarn), `bun.lockb` (bun). Use o que estiver presente. Padrão para npm se não estiver claro.

### 2. Instale dependências

Instale como devDependencies:

```
husky lint-staged prettier
```

### 3. Inicialize Husky

```bash
npx husky init
```

Isto cria diretório `.husky/` e adiciona `prepare: "husky"` ao package.json.

### 4. Crie `.husky/pre-commit`

Escreva este arquivo (nenhum shebang necessário para Husky v9+):

```
npx lint-staged
npm run typecheck
npm run test
```

**Adapte**: Substitua `npm` pelo gerenciador de pacotes detectado. Se o repositório não tem script `typecheck` ou `test` no package.json, omita essas linhas e diga ao usuário.

### 5. Crie `.lintstagedrc`

```json
{
  "*": "prettier --ignore-unknown --write"
}
```

### 6. Crie `.prettierrc` (se ausente)

Apenas crie se nenhuma config Prettier existir. Use estes padrões:

```json
{
  "useTabs": false,
  "tabWidth": 2,
  "printWidth": 80,
  "singleQuote": false,
  "trailingComma": "es5",
  "semi": true,
  "arrowParens": "always"
}
```

### 7. Verifique

- [ ] `.husky/pre-commit` existe e é executável
- [ ] `.lintstagedrc` existe
- [ ] Script `prepare` no package.json é `"husky"`
- [ ] Config `prettier` existe
- [ ] Rode `npx lint-staged` para verificar que funciona

### 8. Commit

Stage todos os arquivos alterados/criados e faça commit com mensagem: `Add pre-commit hooks (husky + lint-staged + prettier)`

Isto rodará através dos novos pre-commit hooks — um bom smoke test que tudo funciona.

## Notas

- Husky v9+ não precisa de shebangs em arquivos de hook
- `prettier --ignore-unknown` pula arquivos que Prettier não consegue parsear (imagens, etc.)
- O pre-commit roda lint-staged primeiro (rápido, apenas staged), depois typecheck e testes completos
