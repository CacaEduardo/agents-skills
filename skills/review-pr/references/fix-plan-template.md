# Template do plano de correção

O plano é lido por **outra IA**, sem acesso a esta conversa nem à review no GitHub. Ele precisa ser autossuficiente: contexto, regras do projeto, cada ajuste com local exato, o que fazer, como validar e o que **não** fazer.

Regras de escrita:

- Um item por achado 🔴/🟠. Sugestões 🟡 vão numa seção opcional separada.
- Ordene por dependência e severidade (bloqueantes primeiro; se um ajuste depende de outro, venha depois).
- Cite caminhos relativos à raiz do repo e linhas da versão da PR.
- Descreva o resultado esperado, não só "refatore". Inclua trechos de código quando ajudarem.
- Inclua os comandos de validação do projeto (lint, typecheck, testes) tirados de AGENTS/CLAUDE.md, `package.json` ou CI.

---

```markdown
# Plano de correção — PR #<n>: <título>

> Gerado pela revisão de <data>. Entregue este arquivo a uma IA de código para aplicar os ajustes na branch `<head>`.

## Contexto

- **Repositório:** <owner/repo>
- **Branch da PR:** `<head>` → base `<base>`
- **Link:** <url>
- **Objetivo da PR:** <1–2 frases sobre o problema que a PR resolve>
- **Resumo da revisão:** <n> bloqueantes, <n> importantes, <n> sugestões.

## Instruções para a IA

1. Faça checkout da branch `<head>` e leia as diretrizes listadas abaixo antes de editar.
2. Aplique **somente** os ajustes deste plano, na ordem. Não refatore código fora do escopo.
3. Após cada ajuste, rode a validação indicada no item.
4. Ao final, rode a validação completa e faça commit com uma mensagem descritiva por ajuste (ou um commit agrupado, se o projeto preferir).
5. Se algum ajuste se mostrar incorreto ou impossível, não force: registre o motivo no final deste arquivo e siga para o próximo.

## Diretrizes do projeto relevantes

- <regra> — fonte: `<arquivo>:<linha>`
- ...

## Ajustes obrigatórios

### 1. 🔴 <título curto> — <dimensão>

- **Local:** `<arquivo>:<linha>` (e consumidores: `<arquivo>:<linha>`)
- **Problema:** <o que está errado>
- **Por que importa:** <impacto concreto: o que quebra / qual regra viola / qual custo>
- **O que fazer:**
  1. <passo concreto>
  2. <passo concreto>
- **Exemplo (opcional):**
  ```<lang>
  <código sugerido>
  ```
- **Não fazer:** <armadilhas, alternativas descartadas>
- **Critério de aceite:** <como saber que está resolvido>
- **Validação:** `<comando>`

### 2. 🟠 <título curto> — <dimensão>

...

## Sugestões opcionais (não bloqueiam)

- 🟡 `<arquivo>:<linha>` — <sugestão em uma linha>

## Validação final

```bash
<lint>
<typecheck>
<testes>
```

## Histórico de revisões

- <data> — rodada 1: <n> achados.
```
