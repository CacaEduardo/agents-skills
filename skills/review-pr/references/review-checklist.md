# Checklist de revisão

Guia detalhado das quatro dimensões obrigatórias. Os comandos usam `rg` (ripgrep); se não existir, use `git grep -n`. Rode as buscas **no worktree da PR**.

---

## 1. Diretrizes do projeto

Objetivo: a PR segue as regras escritas do projeto e o padrão do código vizinho?

Verifique, para cada arquivo alterado:

- [ ] Estrutura de pastas e nomenclatura (arquivos, componentes, rotas, testes) conforme as diretrizes.
- [ ] Camadas respeitadas (ex.: componente de UI não chama API direto se a regra diz para usar `queries/`; rota não acessa o banco se existe camada de service).
- [ ] Bibliotecas/padrões obrigatórios usados (ex.: "use o atom `Icon`", "use `requireAuth`", "use zod para validação").
- [ ] Bibliotecas/padrões proibidos não usados.
- [ ] Convenções de testes (local, nome, idioma dos títulos, cobertura exigida).
- [ ] Checklist de qualidade do AGENTS/CLAUDE.md (lint, typecheck, testes) — confira o resultado em `gh pr checks`.
- [ ] Quando não há regra escrita: compare com 2–3 arquivos irmãos que fazem a mesma coisa. Divergência sem motivo é achado 🟡 (ou 🟠 se criar um segundo padrão concorrente).

Como reportar: cite a regra literalmente com a fonte (`AGENTS.md:42`) e mostre como o trecho deveria ficar.

---

## 2. Over-engineering

Objetivo: a solução é a mais simples que resolve o problema descrito na PR/issue?

Primeiro escreva, em uma frase, o problema que a PR resolve. Depois pergunte: "se eu fosse resolver só isso, quanto código escreveria?". Compare com o tamanho do diff.

Sinais:

- [ ] Interface/classe abstrata/factory/strategy com **uma única** implementação.
- [ ] Função genérica com parâmetros/opções que nenhum chamador usa.
- [ ] Camadas pass-through (wrapper que só repassa argumentos, service que só chama o repository).
- [ ] Config, feature flag, registry ou plugin system para um caso único.
- [ ] Cache, fila, retry, paginação, memoização ou concorrência sem evidência de necessidade (volume, latência medida, requisito).
- [ ] Nova dependência para algo que a stdlib ou uma lib já instalada resolve em poucas linhas.
- [ ] Hooks/contexts/stores globais para estado que é local de uma tela.
- [ ] Tipos excessivamente genéricos (generics aninhados, conditional types) onde um tipo concreto basta.
- [ ] Arquivos/pastas novas demais para pouca lógica.
- [ ] Código "para o futuro" (TODOs de extensão, branches mortos, parâmetros reservados).

Não é over-engineering: seguir um padrão que o projeto exige; tratamento de erro necessário; validação de entrada em borda de sistema; testes.

Como reportar: descreva a versão mais simples concreta (o que remover, o que inlinear) e o ganho (linhas, arquivos, conceitos a menos).

---

## 3. Duplicação / reinvenção

Objetivo: a PR não recria algo que já existe.

Liste todo símbolo **novo** do diff (funções, hooks, componentes, utils, constantes, tipos, rotas, queries, mutations, estilos, migrations).

Para cada um:

```bash
# pelo nome e variações
rg -n -i "<nome>|<sinônimo1>|<sinônimo2>" --glob '!node_modules' --glob '!dist'
# pelo comportamento (palavras-chave do corpo: regex, endpoint, chave, cálculo)
rg -n "<trecho característico>"
# em pastas típicas de utilitários
rg -n --files | rg -i "utils|helpers|lib|shared|common|hooks|components"
```

- [ ] Já existe util/hook/componente equivalente ou quase equivalente?
- [ ] Uma lib já instalada (`package.json`, `requirements.txt`, `go.mod`…) já faz isso (datas, formatação, validação, deep-equal, debounce…)?
- [ ] Existe endpoint/rota/query que já retorna esses dados?
- [ ] Há blocos copiados dentro do próprio diff (mesma lógica em 2+ lugares)?
- [ ] Tipo novo duplica um tipo gerado (Prisma, OpenAPI, GraphQL) ou já exportado?

Como reportar: aponte o existente com `arquivo:linha`, explique a diferença (se houver) e proponha a correção: reutilizar diretamente, estender o existente com um parâmetro, ou extrair para um lugar comum. Se o existente for pior, diga isso e sugira consolidar — não manter os dois.

---

## 4. Risco de quebra (produção e consumidores)

Objetivo: nada fora do diff deixa de funcionar.

Liste todo símbolo/contrato **alterado ou removido**:

- Exports: funções, componentes, props, hooks, tipos, constantes, enums.
- Contratos HTTP: rota, método, params, query, body, formato e códigos da resposta, autenticação.
- Banco: colunas, tipos, nullability, constraints, índices, migrations destrutivas, seeds.
- Config: env vars, feature flags, chaves de storage/cache, nomes de filas/eventos/jobs, permissões.
- Comportamento: valores default, ordenação, timezone, arredondamento, side effects.

Para cada um:

```bash
# consumidores fora do diff
rg -n "<símbolo>" --glob '!node_modules'
git diff --name-only origin/<base>...HEAD   # para separar quem está e quem não está no diff
# rotas: procure a string do path nos clientes
rg -n "/api/v1/<recurso>"
```

- [ ] Todos os consumidores foram atualizados? Abra cada um e confira o uso real (props novas obrigatórias? retorno mudou de formato?).
- [ ] Componente compartilhado mudou visual/comportamento para **outras telas** que o usam?
- [ ] Contrato de API mudou de forma incompatível? Clientes já publicados (app mobile em versões antigas, integrações, webhooks) continuam funcionando? Campo removido/renomeado/tornado obrigatório é quebra.
- [ ] Migration roda em tabela com dados existentes? (coluna NOT NULL sem default, rename, drop, backfill, lock em tabela grande).
- [ ] Ordem de deploy: o código novo depende de migration/env var/infra que ainda não existe em produção? O código antigo funciona com o schema novo durante o rollout?
- [ ] Env var nova está documentada (`.env.example`) e tem fallback?
- [ ] Tratamento de erro: caminhos nulos/vazios/timeout que antes eram tratados continuam?
- [ ] Testes que cobriam o comportamento antigo foram removidos ou ajustados para passar sem motivo?

Como reportar: mostre o consumidor concreto (`arquivo:linha`), o cenário que quebra (entrada → resultado errado) e a correção (manter compatibilidade, atualizar consumidor, versionar rota, migration em duas etapas).

---

## Extras (reportar quando encontrar)

- Bugs de lógica, condições de corrida, off-by-one, `await` faltando, erros engolidos.
- Segurança: input sem validação, autorização ausente em rota nova, SQL/HTML injection, segredos no código, dados sensíveis em logs.
- Testes: lógica nova relevante sem teste; teste que não testa nada.
- Código morto, logs de debug, arquivos esquecidos.
