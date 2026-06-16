---
name: fix-reviews
description: Executa remediação de revisão de PR usando arquivos de rodada de revisão existentes em .specs/<name>/reviews-NNN/. Use ao resolver issues de revisão em lote, atualizar arquivos markdown de issues, implementar fixes e verificar o resultado. Não use para execução de tarefas PRD ou código genérico sem arquivos de issue de revisão.
---

# Fix Reviews

Execute a remediação de revisão em uma sequência rigorosa. Os arquivos de revisão já existem e definem o escopo para a execução.

## Entradas Necessárias

Forneça explicitamente (na mensagem do usuário ou prompt da tarefa):

- **Feature slug** — resolve para `.specs/<slug>/`.
- **Rodada de revisão** — ex. `1` → diretório `reviews-001/`.
- **Arquivos de issue** — caminhos para `issue_NNN.md` nessa rodada, ou "todas as issues pendentes na rodada".
- **Escopo de código** — caminhos de arquivos permitidos para mudança, ou "arquivos de git diff vs main".
- **Auto-commit** — `enabled` ou `disabled` (padrão: disabled).

## Fluxo de Trabalho

1. Reúna o contexto da rodada.
   - Resolva `.specs/<slug>/reviews-NNN/` a partir do slug e número da rodada.
   - Leia cada frontmatter do arquivo de issue em escopo (`status`, `severity`, `file`, `line`, `round`, `round_created_at`). Se múltiplas issues estão em escopo, verifique que `round` e `round_created_at` são consistentes.
   - Confirme o contexto do PRD de `.specs/<slug>/_prd.md` e `_techspec.md` quando fixes precisarem de alinhamento com requisitos.

2. Leia e faça triagem dos arquivos de issue em escopo.
   - Leia cada arquivo de issue listado completamente antes de editar código.
   - Atualize cada frontmatter do arquivo de issue `status` de `pending` para `valid` ou `invalid`.
   - Registre justificativa técnica concreta em `## Triage`: por que a issue é válida ou inválida, causa-raiz se válida, abordagem de fix pretendida.

3. Corrija as issues válidas completamente.
   - Corrija em ordem de severidade: critical, high, medium, low.
   - Implemente fixes de qualidade de produção para cada issue `valid` em escopo.
   - Adicione ou atualize testes quando o comportamento muda ou regressões são possíveis.
   - Mantenha mudanças de código dentro do escopo de código declarado. Se um fix exigir um arquivo fora do escopo, use a mudança mínima e documente por que em `## Triage`.
   - Não faça refatoração de código não relacionado.

4. Feche os arquivos de issue corretamente.
   - Para uma issue `valid`, defina o frontmatter `status: resolved` apenas após código e verificação estarem prontos.
   - Para uma issue `invalid`, documente por que e defina `status: resolved` quando a análise estiver completa.

5. Verifique antes de conclusão.
   - Use `final-verify` antes de qualquer afirmação de conclusão ou commit.
   - Execute verificação real para cada workspace afetado (`admin/`, `api/`, `app/`) conforme a mudança.
   - Se a verificação falhar, corrija a causa-raiz no código mudado; não reverta fixes válidos para passar verificações.
   - Se todas as issues são inválidas e nenhum código mudou, pule commit; ainda rode verificação de smoke se razoável.
   - Commita apenas quando auto-commit estiver habilitado e verificação passou.

## Regras Críticas

- Não importe ou sincronize revisões de ferramentas externas dentro deste fluxo — use apenas os arquivos já em `reviews-NNN/`.
- Não modifique arquivos de issue fora do lote em escopo.
- Não marque uma issue como `resolved` antes que o trabalho e verificação estejam completos.
