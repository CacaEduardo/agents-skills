---
name: setup-claude-md
description: Cria ou atualiza o CLAUDE.md do projeto para compatibilidade com Claude Code e provisiona skills locais em .claude/skills/ a partir de .agents/skills/, preservando arquivos auxiliares. Use quando quiser gerar ou atualizar o CLAUDE.md do projeto ou sincronizar skills para Claude Code. Não use para criar AGENTS.md ou cursor rules.
---

# Setup CLAUDE.md

Cria ou atualiza o `CLAUDE.md` do projeto atual para compatibilidade com Claude Code, a partir da estrutura existente de `AGENTS.md` e `.cursor/rules/`, além de provisionar skills em `.claude/skills/`.

## Estratégia

`CLAUDE.md` importa `AGENTS.md` via `@AGENTS.md` — Claude Code injeta o conteúdo inline sem duplicação. O `.cursor/rules/*.mdc` fica intacto para o Cursor. As únicas adições ao `CLAUDE.md` são contexto específico do Claude Code: ponteiros para `AGENTS.md` de subprojetos, e referências a cursor rules com conteúdo que não está no `AGENTS.md` raiz.

Skills no Claude Code devem ficar em `.claude/skills/<name>/SKILL.md` (local ao projeto) ou `~/.claude/skills/<name>/SKILL.md` (global). Ao migrar de `.agents/skills/`, copie a pasta inteira da skill para preservar arquivos auxiliares (`references/`, `prompt_template.md`, etc.). **Não listar skills no CLAUDE.md** — seria duplicação do que o harness já injeta.

## Workflow

### 1. Detectar estrutura (em paralelo)

- Verificar se `AGENTS.md` existe na raiz. Se não existir, parar: este comando requer um `AGENTS.md`.
- Listar todos os `AGENTS.md` de subdiretórios: `find . -mindepth 2 -maxdepth 3 -name "AGENTS.md"`.
- Listar e ler todos os arquivos `.cursor/rules/*.mdc`.
- Verificar se `CLAUDE.md` já existe (modo update vs. escrita nova).
- Se existir `.agents/skills/`, listar para provisionamento.
- Verificar se já existem skills em `.claude/skills/` (projeto).
- Verificar se já existem skills em `~/.claude/skills/` (global), para evitar duplicação local desnecessária.
- Se existir `.claude/commands/`, tratar como legado e registrar para possível migração.

### 2. Provisionar skills em `.claude/skills/` (se existir `.agents/skills/`)

Para cada pasta em `.agents/skills/*/SKILL.md`:
- Ler o `name:` do frontmatter.
- Se `name` estiver ausente, usar o nome da pasta da skill como fallback.
- Validar divergência entre nome da pasta e `name:`; em caso de diferença, registrar aviso e usar `name` como destino.
- Garantir que `.claude/` exista; se não existir, criar na raiz.
- Garantir que `.claude/skills/` exista; se não existir, criar.
- Verificar se `~/.claude/skills/<name>/SKILL.md` já existe (global):
  - Se existir globalmente: **não duplicar** — registrar como "global, sem ação".
- Caso não exista globalmente:
  - Se `.claude/skills/<name>/SKILL.md` já existir e estiver sincronizado com a origem, registrar como "já sincronizada".
  - Se não existir ou estiver divergente, copiar **recursivamente** `.agents/skills/<skill>/` para `.claude/skills/<name>/`, preservando todos os arquivos auxiliares.
- Se houver `.claude/commands/<name>.md` legado e não houver `.claude/skills/<name>/`, migrar para `.claude/skills/<name>/` e registrar como "migrada de legado".

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
- **Não incluir seção de skills** — Claude Code já lista as skills registradas em `~/.claude/skills/` e `.claude/skills/` via system-reminder; duplicá-las no CLAUDE.md é ruído.
- Subprojetos: derivar o resumo de uma linha a partir do `AGENTS.md` do subdir — listar apenas stack/tecnologias principais. Se não houver subdirs com `AGENTS.md`, omitir a seção.
- Cursor rules: incluir apenas as com conteúdo extra (passo 3). Escrever uma frase indicando quando consultar. Se não houver `.cursor/rules/`, omitir a seção.
- Escrever todo o conteúdo no mesmo idioma do `AGENTS.md` existente.

### 5. Escrever ou atualizar

- **Escrita nova:** criar `CLAUDE.md` na raiz do projeto.
- **Modo update:** mostrar o conteúdo proposto e pedir confirmação antes de sobrescrever.

### 6. Confirmar

Reportar ao usuário:
- Arquivos lidos (quantos AGENTS.md, .mdc).
- Skills provisionadas em `.claude/skills/` (incluindo quantidade de arquivos auxiliares copiados).
- Skills puladas por já existirem globalmente.
- Skills já sincronizadas no projeto (sem alterações).
- Skills migradas de `.claude/commands/` legado para `.claude/skills/` (se houver).
- Quais cursor rules foram incluídas vs. ignoradas (e por quê as ignoradas foram omitidas).
- Se há subdirs com convenções muito diferentes, sugerir criar `CLAUDE.md` individuais neles (cada um com `@AGENTS.md` local).

## Tratamento de erros

- Sem `AGENTS.md` na raiz: parar imediatamente e explicar o requisito.
- Sem `.cursor/rules/` e sem subdirs com `AGENTS.md`: o CLAUDE.md resultante é apenas `@AGENTS.md` — isso é válido.
- `CLAUDE.md` já existe e usuário recusa sobrescrita: exibir o arquivo atual e explicar o que mudaria.
- Skill sem `SKILL.md`: ignorar a pasta e reportar aviso.
- `name:` inválido no frontmatter (formato incompatível com nome de pasta): reportar e não provisionar até correção.
- Conflito entre `.claude/commands/<name>.md` e `.claude/skills/<name>/`: priorizar `.claude/skills/` e registrar orientação para limpeza do legado.
