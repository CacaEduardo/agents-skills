# Plan: <Feature Name>

**Status:** [Planning | In-Progress | Paused | Blocked | Done]
**Current Phase:** Phase 1 — <Nome>
**Last Updated:** YYYY-MM-DD
**Resume Point:** Comece pela **Task 01** (Contexto: <o que já está pronto, o que falta, pré-requisitos manuais>)

---

## 🎯 Propósito

<1-3 parágrafos: qual é o comportamento atual, qual é o desejado e por que isso importa. Cite os caminhos e sintomas reais encontrados na descoberta.>

**Resultado observável:** <o sinal concreto que prova que o plano inteiro terminou>

---

## 🛡️ Invariants
*Regras de ouro que não podem ser quebradas durante a implementação.*

1. **<Título curto>** — <restrição concreta, com o caminho/contrato afetado>
2. **Sem código morto** — ao substituir uma implementação, remover no mesmo passo tudo que ficou sem uso (símbolos, arquivos, testes órfãos, imports).

---

## 🗺️ Repository Map & Discovery
| Área | Caminho | Git root | Comando de Análise / Observação |
| :--- | :--- | :--- | :--- |
| <área> | `<path real>` | `<git_root>` | `grep -rn "<símbolo>" <path>` ou nota técnica |

**Comandos de discovery:**
```bash
# comandos reais usados para mapear o estado atual
```

---

## 🚀 Phase Outline
| Fase | Objetivo | Depende de | Git root | Critério de Conclusão (Definition of Done) | Status |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **1 — <Nome>** | <objetivo> | — | `<git_root>` | <critério observável e verificável> | ⏳ |
| **2 — <Nome>** | <objetivo> | 1 | `<git_root>` | <critério observável e verificável> | ⏳ |
| **3 — <Nome>** | <objetivo> | 1 | `<git_root>` | <critério observável e verificável> | ⏳ |

*Status: ⏳ não iniciada · 🔄 em progresso · ✅ concluída · ⚠️ bloqueada*

> `Depende de` e `Git root` são o contrato com o `plan-orchestrator`: fases sem dependência mútua e em `git_root` distintos podem rodar em paralelo. Nunca deixe essas colunas vazias.

---

## 📋 Master Task List
| # | Fase | Task | Status | Cx | Deps | Validação (Como testar?) |
| :-- | :---: | :--- | :---: | :---: | :---: | :--- |
| 01 | 1 | <Título da task, citando o arquivo real> | [ ] | S | — | `<comando exato>` → <sinal esperado> |
| 02 | 1 | <Título da task> | [ ] | M | 01 | `<comando exato>` → <sinal esperado> |
| 03 | 2 | <Título da task> | [ ] | L | 02 | `<comando exato>` → <sinal esperado> |

*Status: `[ ]` pendente · `[~]` em progresso · `[x]` concluída · `[!]` bloqueada · Cx: S/M/L*

---

## 🧭 Architecture Decision Records
| ADR | Título | Resumo |
| :--- | :--- | :--- |
| [ADR-001](<plan-slug>/adrs/adr-001.md) | <Título> | <uma linha: o que foi decidido e o que foi rejeitado> |

---

## 📓 Progress Log
*(Append-only: adicionar uma entrada a cada iteração ou fase concluída. Nunca remover nem reescrever as anteriores.)*

### Iteração 0 — Setup
- **Branch:** `—`
- **Resumo:** Plano criado. Decisões fechadas com o usuário: <lista curta>.
- **Arquivos:** `.plans/<plan-slug>/README.md`, `.plans/<plan-slug>/adrs/adr-001.md`
- **Validação:** —

---

## ⚠️ Deferred / Blocked
| Item | Motivo | Bloqueado por |
| :--- | :--- | :--- |
| — | — | — |

---

## ✅ Checklists por Fase

### Fase 1 — <Nome>
- [ ] <step detalhado, com caminho real>
- [ ] <step detalhado>
- [ ] Validação da fase: `<comando>` → <sinal esperado>
- [ ] Sem código morto: busca por `<símbolo removido>` no código sem resultados

### Fase 2 — <Nome>
- [ ] <step detalhado>
- [ ] Validação da fase: `<comando>` → <sinal esperado>

---

## 📝 Notes for Future Agents
- <Pegadinha do código, convenção local do módulo, comando que não funciona neste ambiente, credencial necessária>
- <Arquivos de convenção a ler antes de editar cada área tocada: `AGENTS.md` / `CLAUDE.md` / `CONTRIBUTING.md` da raiz e do módulo>
- <Comandos de setup/execução que o agente vai precisar e não são óbvios>

---

## 🔧 Comandos do Projeto
*(Preencher com os comandos reais deste repositório; é o que os executores vão rodar.)*

| Ação | Comando |
| :--- | :--- |
| Testes | `<comando>` |
| Lint | `<comando>` |
| Type/build check | `<comando>` |
| Subir o app | `<comando>` |
