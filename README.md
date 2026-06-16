# Agents Skills Installer

Um CLI interativo para instalar Agent skills em qualquer projeto.

## 🚀 Instalação Rápida

```bash
npx @carlos-eduardo/agents-skills
```

## 📋 Skills Disponíveis

- **create-prd** - Cria especificações de produto (PRD) estruturadas
- **create-techspec** - Gera documentações técnicas (TechSpec)
- **create-tasks** - Decompõe PRDs em tasks implementáveis
- **execute-task** - Executa tasks end-to-end com auto-commit
- **prd-base-prompt-from-input** - Transforma requisitos em prompt estruturado
- **document-plan** - Documenta planos de implementação
- **workflow-memory** - Mantém memória de workflow entre tasks
- **task-orchestrator** - Orquestra múltiplas tasks com dependências
- **review-round** - Executa rodadas de review estruturadas
- **fix-reviews** - Aplica correções de reviews
- **qa-review** - Realiza reviews de QA
- **final-verify** - Verifica mudanças antes de commits
- **setup-claude-md** - Configura arquivo CLAUDE.md do projeto
- **setup-pre-commit** - Configura hooks pre-commit
- **write-a-skill** - Ajuda a criar novas skills

## 💻 Como Usar

### Instalação Interativa

```bash
# Na raiz do seu projeto
npx @carlos-eduardo/agents-skills
```

Após executar, você verá:

1. **Lista de skills disponíveis** com números
2. **Prompt para seleção** - escolha por números separados por vírgula
3. **Confirmação e cópia** dos arquivos selecionados

### Exemplos de Seleção

```
Selecionar skills 1, 3 e 5:
1,3,5

Selecionar todas as skills:
(apenas pressione Enter)

Selecionar skills 1 a 3:
1,2,3
```

## 📁 Estrutura de Instalação

As skills são instaladas em:

```
seu-projeto/
├── .agents/
│   └── skills/
│       ├── create-prd/
│       ├── create-tasks/
│       └── ...
```

## 🔧 Requisitos

- Node.js >= 18.0.0
- npm/yarn/pnpm

## 📝 Notas

- Cada skill tem seu próprio `SKILL.md` com documentação completa
- As skills utilizam recursos do Claude Code e podem ter dependências específicas
- Consulte o `CLAUDE.md` do seu projeto para contextos específicos

## 🤝 Contribuindo

Para adicionar novas skills ao repositório:

1. Crie um novo diretório em `skills/`
2. Inclua um arquivo `SKILL.md` com a documentação
3. Adicione arquivos de `references/` se necessário

## 📄 Licença

MIT
