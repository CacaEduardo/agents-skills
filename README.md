# Agents Skills Installer

Um CLI interativo para instalar Agent skills em qualquer projeto.

## 🚀 Instalação Rápida

```bash
# Via GitHub (agora disponível)
npx github:CacaEduardo/agents-skills

# Via npm (quando publicado)
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

### Instalação Interativa com Checkboxes

```bash
# Na raiz do seu projeto
npx @carlos-eduardo/agents-skills
```

Após executar, você verá uma **interface interativa com checkboxes**:

```
🚀 Agents Skills Installer

? 📦 Select skills to install: (Press <space> to select, <a> to toggle all, <i> to invert selection)
❯◯ create-prd
 ◯ create-tasks
 ◯ create-techspec
 ◯ document-plan
 ◯ execute-task
 ◯ final-verify
 ◯ fix-reviews
 (Move up and down to reveal more choices)
```

### 🎮 Controles

| Tecla | Ação |
|-------|------|
| **↑ ↓** | Navegar entre skills |
| **ESPAÇO** | Marcar/desmarcar skill |
| **A** | Marcar/desmarcar todas |
| **I** | Inverter seleção |
| **ENTER** | Confirmar seleção |

### Exemplos de Uso

1. **Selecionar skills específicas:**
   - Navegue com ↑ ↓
   - Marque com ESPAÇO
   - Pressione ENTER

2. **Selecionar todas:**
   - Pressione **A**
   - Pressione ENTER

3. **Inverter seleção:**
   - Pressione **I**
   - Pressione ENTER

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
