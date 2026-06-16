---
name: review-round
description: Realiza uma revisão completa de código de uma implementação de PRD e gera um diretório de rodada de revisão com arquivos de issue compatíveis com fix-reviews. Use ao revisar tarefas de PRD implementadas ou ao realizar auditoria de qualidade de mudanças de código. Não use para corrigir issues, executar tarefas de PRD ou editar código-fonte.
---

# Review Round

Realize uma revisão de código estruturada de uma implementação de PRD e produza um diretório de rodada de revisão que `fix-reviews` possa processar.

## Entradas Necessárias

- Feature slug identificando `.specs/<name>/`.
- Opcional: arquivos ou diretórios específicos para escopiar a revisão.

## Fluxo de Trabalho

1. Determine o diretório da rodada de revisão.
   - Derive o diretório spec a partir do slug da feature: `.specs/<name>/`.
   - Verifique se o diretório existe. Se não, pare e reporte o diretório ausente.
   - Liste os subdiretórios existentes `reviews-NNN/` para determinar o próximo número de rodada. Se nenhum existir, use rodada 1.
   - Se rodadas anteriores existem, leia seus arquivos de issue e apenas reporte NOVAS issues não já rastreadas (pending, valid, ou resolved).
   - Defina o caminho `.specs/<name>/reviews-NNN/` (rodada preenchida por zeros). NÃO crie até o passo 4 confirmar que há issues para escrever.

2. Identifique o escopo da revisão.
   - Leia `_prd.md`, `_techspec.md` e `_tasks.md` de `.specs/<name>/`.
   - Leia os ADRs de `.specs/<name>/adrs/` quando presentes.
   - Se `_prd.md` e `_techspec.md` ambos estão ausentes, avise e proceda com revisão focada em qualidade de código apenas.
   - Se o usuário forneceu caminhos, escopie para aqueles.
   - Caso contrário, rode `git diff main...HEAD --name-only`. Se vazio, peça ao usuário para especificar arquivos.
   - Explore imports e dependências dos arquivos em escopo.

3. Realize a revisão de código.
   - Leia `references/review-criteria.md` para severidade e áreas de avaliação.
   - Se o escopo tem mais de 15 arquivos, faça triagem: leia a fundo a implementação central primeiro; veja rapidamente testes e config.
   - Faça verificação cruzada da implementação contra PRD/TechSpec quando disponível.
   - Avalie contra Segurança, Correção, Concorrência, Desempenho, Tratamento de Erros, Manutenibilidade, Testes, Arquitetura, Operações.
   - Deduplicar: uma issue por problema distinto; liste outros arquivos afetados no comentário.
   - Verifique antes de sinalizar: respeite ADRs, comentários e testes existentes.
   - Rode linters para workspaces afetados antes de escrever issues (`npm run lint` em `admin/` quando UI mudou; testes/lint em `api/` ou `app/` conforme aplicável). Pule issues já detectadas por linters.
   - Prefira menos issues, mais sinais (limite medium/low se volume explodir).
   - Se nenhuma issue permanecer, reporte uma revisão limpa e pule passos 4–6.

4. Gere os arquivos de issue.
   - Crie o diretório da rodada de revisão.
   - Siga `references/issue-template.md` para cada `issue_NNN.md`.
   - Use o mesmo `round_created_at` (UTC RFC3339) em cada issue da rodada.
   - `severity` deve ser exatamente um de: `critical`, `high`, `medium`, `low`.

5. Resuma e apresente a revisão.
   - Recomendação de merge (bloqueante critical/high vs acompanhamentos vs limpo).
   - Contagem por severidade, caminho do diretório de revisão, nomes de arquivos de issue.
   - Registre aspectos bem implementados.
   - Sugira invocar `fix-reviews` com slug da feature, número da rodada e lista de issues.

6. Verifique antes de conclusão.
   - Use `final-verify` antes de afirmar que a rodada está completa.
   - Leia cada arquivo de issue novamente; confirme que o frontmatter é YAML válido e `round` / `round_created_at` consistentes.

## Regras Críticas

- Não corrija issues — apenas documente-as.
- Não crie rodadas de revisão vazias.
- Não modifique código-fonte.
- Arquivos de issue devem corresponder a `issue_NNN.md` sob `reviews-NNN/`.

## Tratamento de Erros

- Falta `.specs/<name>/` → pare.
- Nenhum arquivo revisável → peça ao usuário pelo escopo.
- PRD e TechSpec ausentes → avise, continue com foco em qualidade de código.
- Lint indisponível → registre no resumo, continue com revisão.
