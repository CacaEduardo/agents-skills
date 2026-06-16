# Publicação no npm

Este guia explica como publicar o `@carlos-eduardo/claude-skills` no npm (se desejado).

## Pré-requisitos

1. **Conta npm**: Crie em https://www.npmjs.com/signup
2. **Autenticação**: Execute `npm login` e siga as instruções
3. **Escopo**: O package já está configurado com escopo `@carlos-eduardo`

## Passos para Publicação

### 1. Primeira Publicação

```bash
# Na raiz do repositório
cd /Users/carlos.eduardo/dev/pessoais/claude-skills

# Login no npm (primeira vez)
npm login

# Verificar versão
npm version minor

# Publicar
npm publish --access public
```

### 2. Atualizações Subsequentes

```bash
# Atualizar versão (patch, minor ou major)
npm version patch

# Publicar
npm publish
```

## Usando Após Publicação

Após publicado, qualquer pessoa pode instalar com:

```bash
# Instalação global
npm install -g @carlos-eduardo/claude-skills
claude-skills

# Ou diretamente com npx
npx @carlos-eduardo/claude-skills
```

## Versionamento Semântico

- **patch** (1.0.0 → 1.0.1): Bug fixes
- **minor** (1.0.0 → 1.1.0): Novas skills (backwards compatible)
- **major** (1.0.0 → 2.0.0): Breaking changes

## Verificando Publicação

```bash
# Ver informações do package
npm view @carlos-eduardo/claude-skills

# Ver versões publicadas
npm view @carlos-eduardo/claude-skills versions

# Instalar versão específica
npm install @carlos-eduardo/claude-skills@1.0.0
```

## Alternativa: GitHub Packages

Se preferir publicar no GitHub em vez do npm público:

```bash
# Configurar .npmrc com token GitHub
echo "@carlos-eduardo:registry=https://npm.pkg.github.com" >> .npmrc

# Publicar
npm publish
```

## Troubleshooting

### Erro: "You must be logged in"
```bash
npm logout
npm login
```

### Erro: "Package name already in use"
- Verifique se o nome existe em https://www.npmjs.com
- Considere mudar o escopo ou nome

### Desativar uma versão
```bash
npm unpublish @carlos-eduardo/claude-skills@1.0.0
```

## Links Úteis

- [npm Publishing Docs](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Escoped Packages](https://docs.npmjs.com/cli/v7/using-npm/scope)
- [Semantic Versioning](https://semver.org/)
