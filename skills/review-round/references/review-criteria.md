# Critérios de Revisão

## Níveis de Severidade

### critical

Falhas de segurança, crashes, perda de dados, comportamento indefinido ou race conditions.
Issues que podem causar incidentes em produção ou comprometer dados de usuários.

Exemplos: bypass de autenticação, SQL/command injection, dereference de nil pointer em um hot path, vazamento ilimitado de goroutine, escrita de dados sensíveis em logs.

### high

Bugs afetando correção, gargalos de desempenho visíveis aos usuários ou antipadrões que prejudicam significativamente escalabilidade, confiabilidade ou usabilidade.
Estes precisam ser corrigidos antes do merge.

Exemplos: erro de lógica retornando resultados errados, loop O(n^2) sobre entrada ilimitada, rollback de transação faltante, erro silenciosamente engolido em um caminho crítico, validação de entrada faltante em limite de sistema.

### medium

Preocupações de manutenibilidade, code smells, lacunas de cobertura de teste ou padrões não idiomáticos que degradam a saúde de longo prazo. Não é bloqueante mas deve ser abordado.

Exemplos: lógica duplicada em pacotes, função excedendo 80 linhas com aninhamento profundo, teste faltante para um branch de erro, context.Background() usado fora de main, interface aceita mas apenas uma implementação existe.

### low

Melhorias menores, lacunas de documentação ou sugestões de nomeação. Enhancements opcionais que melhoram clareza.

Exemplos: nome de variável pouco claro, godoc faltante em função exportada, conversão de tipo redundante, comentário ligeiramente enganoso.

## Áreas de Avaliação

### 1. Segurança

- Falhas de autenticação e autorização.
- Lacunas de validação de entrada (injection, path traversal, XSS).
- Secrets, tokens ou credenciais hardcoded.
- Misuso de criptografia ou armazenamento inseguro.
- Exposição de dados sensíveis em logs ou mensagens de erro.

### 2. Correção

- Erros de lógica produzindo resultados errados.
- Bugs off-by-one e condições de limite.
- Dereferences de nil ou null pointer.
- Caminhos de erro não tratados levando a falhas silenciosas.
- Type assertions ou conversões incorretas.

### 3. Concorrência

- Race conditions e sincronização faltante.
- Vazamentos de goroutine (sem caminho de shutdown ou cancelamento de context).
- Potencial de deadlock da ordenação de locks.
- Misuso de canal (envio em fechado, bloqueio de não-buffered).
- Rastreamento faltante de `sync.WaitGroup` para goroutines spawned.

### 4. Desempenho e Escalabilidade

- Issues de complexidade algorítmica (O(n^2) onde O(n) basta).
- Vazamentos de recurso (file handles, HTTP bodies, conexões de banco de dados).
- Crescimento ilimitado em slices, maps ou channels.
- Caching faltante para operações caras repetidas.
- Blocking I/O em caminhos críticos sem timeout.

### 5. Tratamento de Erros

- Erros engolidos (atribuídos a `_` sem justificativa).
- Contexto de erro faltante (`fmt.Errorf("contexto: %w", err)`).
- `panic()` ou `log.Fatal()` em código de biblioteca ou handler.
- Tratamento de erro catch-all amplo mascarando falhas específicas.
- Uso incorreto de `errors.Is()` ou `errors.As()`.

### 6. Qualidade de Código e Manutenibilidade

- Issues de legibilidade (nomeação pouco clara, lógica profundamente aninhada).
- Duplicação de código entre funções ou pacotes.
- Funções excessivamente complexas que devem ser decompostas.
- Código morto ou exports não usados.
- Violações de convenções de codificação do projeto.

### 7. Testes

- Testes faltando para caminhos de código críticos.
- Testes que verificam mocks em vez de comportamento.
- Padrões de teste flaky (time-dependent, order-dependent).
- Cobertura inadequada de casos de borda e caminhos de erro.
- `t.Parallel()` faltando para subtestes independentes.

### 8. Arquitetura

- Dependências circulares entre pacotes.
- Violações de layer (ex.: pacote de CLI importando detalhes internos de runtime).
- Abstrações vazadas expondo detalhes de implementação.
- Acoplamento forte que impede testes independentes.
- Padrões inconsistentes na mesma área do código-base.

### 9. Operações

- Logging estruturado faltando ou insuficiente (`slog`).
- Contexto de erro faltando para debugging em produção.
- Valores de configuração hardcoded em vez de parametrizados.
- Tratamento de graceful shutdown faltando para processos de longa duração.
- Lacunas de observabilidade (sem métricas ou tracing em operações críticas).

## Abordagem de Revisão

- Leia o PRD e TechSpec antes de revisar código para entender a intenção.
- Revise em ordem de severidade: critical primeiro, low por último.
- Foque em issues que importam. Pule issues de estilo já detectadas por linters.
- Forneça sugestões acionáveis: declare o problema e como o fix se parece.
- Atribua severidade com base em impacto real, não preocupação teórica.
- Crie uma issue por arquivo por problema distinto.
- Se um problema abrange múltiplos arquivos, crie uma issue por arquivo afetado.
- Reconheça padrões bem implementados; não crie issues para eles.
