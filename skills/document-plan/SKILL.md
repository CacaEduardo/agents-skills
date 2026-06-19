---
name: document-plan
description: Cria e mantém um plano de implementação em .plans/<feature>.md. Sem --update faz perguntas de descoberta e gera o arquivo do zero seguindo o template. Com --update relê o código e atualiza o progress log e checklists do arquivo existente.
argument-hint: "<feature-name> [--update]"
---

# Document Plan

Cria e mantém `.plans/<feature>.md` — arquivo de plano vivo, auto-atualizável por iteração.

## Quick start

```
/document-plan <feature-name>           # modo interativo: perguntas → gera o plano
/document-plan <feature-name> --update  # atualiza progress log e checklists com estado atual do código
```

---

## Workflow 1 — Criar plano (sem --update)

### Passo 1 — Descoberta

Faça as perguntas abaixo **uma de cada vez**, esperando a resposta antes de continuar. Não agrupe todas em uma mensagem.

1. **Propósito:** O que esta feature/iniciativa faz? Qual problema resolve? (1–3 frases)
2. **Fases:** Como o trabalho se divide? Quais são as etapas em ordem, com nome e objetivo de cada uma?
3. **Invariants:** O que nunca pode quebrar durante a execução? (APIs críticas, contratos, dados em produção, etc.)
4. **Codebase:** Quais áreas e caminhos do repositório são afetados? Há múltiplos repos ou subprojetos?
5. **Discovery:** Existe algum comando útil para mapear o estado antes de agir? (grep patterns, find, scripts de análise)
6. **Branch:** Qual é a estratégia de branch? (feature único, stacked, trunk-based)

Se o usuário já forneceu contexto suficiente na conversa, pule as perguntas já respondidas.

### Passo 2 — Gerar `.plans/<feature>.md`

Use `templates/PLAN_TEMPLATE.md` como estrutura base. Preencha com as respostas coletadas seguindo estas regras:

- **Purpose:** 1–2 parágrafos com contexto e motivação, sem listar steps
- **Invariants:** apenas o que foi explicitamente mencionado como crítico
- **Repository map:** apenas áreas mencionadas pelo usuário — não inventar paths
- **Phase outline:** exatamente as fases descritas pelo usuário, com critério de conclusão observável
- **Discovery commands:** apenas comandos concretos fornecidos ou claramente deduzíveis do contexto
- **Progress log:** apenas a linha inicial `| 0 | — | — | Plano criado |`
- **Checklists:** uma seção por fase, com steps deduzidos do objetivo da fase; todos começam como `- [ ]`
- **Last updated:** data de hoje

### Passo 3 — Confirmar e salvar

Mostre o conteúdo completo do arquivo antes de salvar. Aguarde aprovação explícita do usuário. Salve em `.plans/<feature>.md`.

---

## Workflow 2 — Atualizar plano (--update)

1. Ler `.plans/<feature>.md`
2. Para cada item `- [ ]` nos checklists: verificar no código se a mudança correspondente existe (arquivos, exports, rotas, etc.)
3. Marcar `- [x]` apenas com evidência concreta encontrada no código
4. Se houver branch novo merged não registrado: adicionar linha no **Progress log**
5. Atualizar **Last updated** e **Current phase** no header
6. Registrar em **Deferred / blocked** qualquer item identificado como bloqueado

**Regra:** nunca remover linhas do Progress log — apenas acrescentar.

---

## Template

Ver `templates/PLAN_TEMPLATE.md` para a estrutura completa do arquivo gerado.

---

## Regras gerais

- `.plans/<feature>.md` é a única fonte de verdade — não criar arquivos adicionais
- Perguntas de descoberta sempre sequencialmente, nunca em bloco
- Idioma: português (pt-BR), exceto paths, nomes de arquivos e comandos shell
- Nunca sobrescrever o Progress log — apenas acrescentar linhas
