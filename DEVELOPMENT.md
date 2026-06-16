# Development Guide

## Estrutura do Repositório

```
claude-skills/
├── bin/
│   └── install.js          # CLI script de instalação
├── skills/                 # Todas as skills disponíveis
│   ├── create-prd/
│   ├── create-tasks/
│   └── ...
├── package.json            # Configuração npm
└── README.md              # Documentação principal
```

## Como Testar Localmente

### Opção 1: Link Local (recomendado para testes)

```bash
# No diretório do repositório
cd /Users/carlos.eduardo/dev/pessoais/claude-skills
npm link

# Em qualquer projeto
claude-skills
```

### Opção 2: Direto do repositório

```bash
# Do diretório do repositório
node bin/install.js
```

### Opção 3: Via npx (quando publicado)

```bash
# Usar versão publicada no npm
npx @carlos-eduardo/claude-skills
```

## Como Adicionar Novas Skills

1. **Crie um diretório** na pasta `skills/`:
```bash
mkdir skills/my-new-skill
```

2. **Adicione um arquivo `SKILL.md`** com a documentação

3. **Se houver referencias**, crie a pasta:
```bash
mkdir skills/my-new-skill/references
```

4. **Commit as mudanças**:
```bash
git add skills/my-new-skill
git commit -m "feat: add my-new-skill"
```

## Como Publicar no npm

### Primeira publicação:

```bash
# Atualizar versão
npm version patch  # ou minor/major

# Publicar
npm publish --access public
```

### Atualizações subsequentes:

```bash
# Atualizar versão
npm version patch

# Publicar
npm publish
```

## Scripts Úteis

```bash
# Listar skills disponíveis
ls -la skills/

# Ver o tamanho total
du -sh .

# Teste de instalação
npm link && cd /tmp && mkdir test-project && cd test-project && npm link @carlos-eduardo/claude-skills && node -e "require('@carlos-eduardo/claude-skills')"
```

## Troubleshooting

### Se o script não é executável:
```bash
chmod +x bin/install.js
```

### Se o npm link não funciona:
```bash
npm unlink -g @carlos-eduardo/claude-skills
npm link
```

### Para limpar node_modules e cache:
```bash
rm -rf node_modules
npm cache clean --force
npm install
```
