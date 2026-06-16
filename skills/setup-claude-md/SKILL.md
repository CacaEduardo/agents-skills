---
name: setup-claude-md
description: Cria ou atualiza o CLAUDE.md do projeto para compatibilidade com Claude Code, a partir de AGENTS.md e .cursor/rules/. Use quando quiser gerar ou atualizar o CLAUDE.md do projeto. Não use para criar AGENTS.md ou cursor rules.
---

# Setup CLAUDE.md

Cria ou atualiza o `CLAUDE.md` do projeto atual para compatibilidade com Claude Code, a partir da estrutura existente de `AGENTS.md` e `.cursor/rules/`.

## Estratégia

`CLAUDE.md` importa `AGENTS.md` via `@AGENTS.md` — Claude Code injeta o conteúdo inline sem duplicação. O `.cursor/rules/*.mdc` fica intacto para o Cursor. As únicas adições ao `CLAUDE.md` são contexto específico do Claude Code: ponteiros para `AGENTS.md` de subprojetos, e referências a cursor rules com conteúdo que não está no `AGENTS.md` raiz.

Skills são registradas nativamente via `.claude/commands/<name>.md` (local ao projeto) ou `~/.claude/commands/<name>.md` (global) — Claude Code já as exibe no system-reminder de cada conversa. **Não listar skills no CLAUDE.md** — seria duplicação do que o harness já injeta.

## Workflow

### 1. Detectar estrutura (em paralelo)

- Verificar se `AGENTS.md` existe na raiz. Se não existir, parar: este comando requer um `AGENTS.md`.
- Listar todos os `AGENTS.md` de subdiretórios: `find . -mindepth 2 -maxdepth 3 -name "AGENTS.md"`.
- Listar e ler todos os arquivos `.cursor/rules/*.mdc`.
- Verificar se `CLAUDE.md` já existe (modo update vs. escrita nova).
- Se existir `.agents/skills/` (convenção antiga), listar para migração.

### 2. Migrar skills de `.agents/skills/` (se existir)

Para cada pasta em `.agents/skills/*/SKILL.md`:
- Ler o `name:` do frontmatter.
- Verificar se `~/.claude/commands/<name>.md` já existe (global).
- Se já existe globalmente: **não duplicar** — registrar como "global, sem ação".
- Se não existe globalmente: copiar o `SKILL.md` para `.claude/commands/<name>.md` (criar pasta se necessário).

### 3. Identificar cursor rules com conteúdo extra

Comparar cada `.mdc` com o `AGENTS.md` raiz. Uma rule tem "conteúdo extra" se contiver detalhe significativo ausente do `AGENTS.md`: exemplos de código, padrões passo-a-passo, ou mais de ~30 linhas de conteúdo específico. Rules que apenas reiteram o `AGENTS.md` são ignoradas.

### 4. Construir o CLAUDE.md

Usar exatamente esta estrutura:

```
@AGENTS.md

## Contexto por subprojeto

Ao trabalhar dentro de um subprojeto, leia o `AGENTS.md` local:

- `[subdir]/AGENTS.md` — [resumo de uma linha: stack + tecnologias principais]
...

## [Tópico da rule] (detalhe completo)    ← um bloco por .mdc com conteúdo extra

O padrão completo está em `.cursor/rules/[arquivo].mdc`. Consulte ao [gatilho específico].
```

**Regras por seção:**
- `@AGENTS.md` é sempre a primeira linha, sem nada antes.
- **Não incluir seção de skills** — Claude Code já lista as skills registradas em `~/.claude/commands/` e `.claude/commands/` via system-reminder; duplicá-las no CLAUDE.md é ruído.
- Subprojetos: derivar o resumo de uma linha a partir do `AGENTS.md` do subdir — listar apenas stack/tecnologias principais. Se não houver subdirs com `AGENTS.md`, omitir a seção.
- Cursor rules: incluir apenas as com conteúdo extra (passo 3). Escrever uma frase indicando quando consultar. Se não houver `.cursor/rules/`, omitir a seção.
- Escrever todo o conteúdo no mesmo idioma do `AGENTS.md` existente.

### 5. Escrever ou atualizar

- **Escrita nova:** criar `CLAUDE.md` na raiz do projeto.
- **Modo update:** mostrar o conteúdo proposto e pedir confirmação antes de sobrescrever.

### 6. Confirmar

Reportar ao usuário:
- Arquivos lidos (quantos AGENTS.md, .mdc).
- Skills migradas de `.agents/skills/` vs. puladas por já existirem globalmente.
- Quais cursor rules foram incluídas vs. ignoradas (e por quê as ignoradas foram omitidas).
- Se há subdirs com convenções muito diferentes, sugerir criar `CLAUDE.md` individuais neles (cada um com `@AGENTS.md` local).

## Tratamento de erros

- Sem `AGENTS.md` na raiz: parar imediatamente e explicar o requisito.
- Sem `.cursor/rules/` e sem subdirs com `AGENTS.md`: o CLAUDE.md resultante é apenas `@AGENTS.md` — isso é válido.
- `CLAUDE.md` já existe e usuário recusa sobrescrita: exibir o arquivo atual e explicar o que mudaria.
