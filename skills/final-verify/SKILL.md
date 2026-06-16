---
name: final-verify
description: Força evidência fresca de verificação antes de qualquer afirmação de conclusão, correção ou sucesso, e antes de commits ou criação de PR. Use quando um agente está prestes a reportar sucesso, entregar trabalho ou fazer commit de código. Não use para planejamento inicial, brainstorming ou tarefas que ainda não atingiram um passo concreto de verificação.
---

# Verificação Antes de Conclusão

## Visão Geral

Afirmar que o trabalho está concluído sem verificação é desonestidade, não eficiência.

**Princípio central:** Evidência antes de afirmações, sempre.

**Violar a letra desta regra é violar o espírito da regra.**

## A Lei de Ferro

```
NENHUMA AFIRMAÇÃO DE CONCLUSÃO SEM EVIDÊNCIA FRESCA DE VERIFICAÇÃO
```

Se o comando de verificação não foi executado na mensagem atual, o resultado não pode ser afirmado.

## A Função Portão

```
ANTES de afirmar qualquer status ou expressar satisfação:

1. IDENTIFICAR: Qual comando prova esta afirmação?
2. EXECUTAR: Rode o comando COMPLETO (fresco, completo)
3. LER: Saída completa, verificar código de saída, contar falhas
4. VERIFICAR: A saída confirma a afirmação?
   - Se NÃO: Declare o status real com evidência
   - Se SIM: Declare a afirmação COM evidência
5. SÓ ENTÃO: Faça a afirmação

Pular qualquer passo = mentir, não verificar
```

## Escopo da Verificação

Corresponda o escopo de verificação ao escopo da afirmação:

- **Afirmação restrita** (ex.: "este teste passa"): Execute o teste específico.
- **Afirmação ampla** (ex.: "tarefa concluída", "pronta para commit"): Execute o **pipeline completo de verificação** — formatação, lint, todos os testes e build. Se o projeto define um único comando gate (ex.: `make verify`), rode aquele.

Uma verificação restrita não suporta uma afirmação ampla. Rodar apenas `make test` não justifica "tarefa concluída". Rodar apenas o linter não justifica "pronto para commit". O escopo de verificação deve ser igual ou mais amplo que o escopo da afirmação.

**Se em dúvida, rode o pipeline completo.** Sobre-verificação desperdiça minutos. Sub-verificação desperdiça horas.

**Pipeline passando != requisitos atendidos.** Um build verde prova que o código compila, passa o lint e passa testes existentes. Não prova que a implementação corresponde aos requisitos. Para afirmações de "tarefa concluída" ou "requisitos atendidos", também verifique os deliverables contra a especificação original — linha por linha, não por suposição.

## Falhas Comuns

| Afirmação                 | Requer                        | Não é suficiente                 |
| --------------------- | ------------------------------- | ------------------------------ |
| Testes passam            | Saída do comando de teste: 0 falhas | Execução anterior, "deve passar"    |
| Linter limpo          | Saída do linter: 0 erros         | Verificação parcial, extrapolação   |
| Build sucede        | Comando de build: saída 0           | Linter passando, logs parecem bons |
| Bug corrigido             | Teste do sintoma original: passa   | Código mudou, assumido como corrigido    |
| Teste de regressão funciona | Ciclo red-green verificado        | Teste passou uma vez               |
| Agente completou       | Diff de VCS mostra mudanças          | Agente reporta "sucesso"                |
| Requisitos atendidos      | Checklist linha por linha          | Testes passando                  |

## Red Flags

- Usar "deve", "provavelmente" ou "parece que"
- Expressar satisfação antes de verificação
- Prestes a fazer commit, push ou abrir um PR sem verificação
- Confiar no relatório de sucesso de outro agente
- Depender de verificação parcial
- Pensar "apenas desta vez"
- Qualquer redação que implique sucesso sem evidência atual

## Prevenção de Racionalização

| Desculpa                                  | Realidade                |
| --------------------------------------- | ---------------------- |
| "Deve funcionar agora"                       | Rode a verificação   |
| "Tenho certeza"                         | Certeza ≠ evidência  |
| "Apenas desta vez"                        | Sem exceções          |
| "Linter passou"                         | Linter ≠ compilador      |
| "Agente disse sucesso"                    | Verifique independentemente   |
| "Estou cansado"                             | Exaustão ≠ desculpa    |
| "Verificação parcial é suficiente"               | Parcial prova nada |
| "Palavras diferentes para a regra não se aplicar" | Espírito acima da letra     |

## Quando Aplicar

Aplique esta skill antes de:

- qualquer afirmação de sucesso ou conclusão
- qualquer expressão de satisfação com o estado da implementação
- qualquer commit ou criação de PR
- qualquer entrega que implique correção
- passar para a próxima tarefa baseado em conclusão

## Portão Pré-Commit e Pré-PR

Commits e PRs são artefatos permanentes. Exigem o padrão de verificação mais alto.

**Antes de `git commit`:**
1. Rode o pipeline completo de verificação (ex.: `make verify`). Não um subconjunto. O pipeline completo.
2. Confirme zero erros, zero avisos, zero falhas de testes na saída.
3. Produza um Relatório de Verificação (veja template abaixo) com veredicto PASS.
4. Só então rode `git commit`.

**Antes de criar um PR:**
1. Tudo acima, mais:
2. Verifique que o diff corresponde às mudanças pretendidas (revisão de `git diff`).
3. Confirme que nenhum arquivo não relacionado está staged.

Se o pipeline completo não passou nesta sessão após a última mudança de código, o commit ou PR não deve proceder.

## Template de Relatório de Verificação

A verificação não está completa até o agente **citar a saída real do comando** em sua resposta. "Rodei e passou" não é evidência. Se a saída de verificação não for exibida, a verificação não aconteceu.

Toda verificação deve ser relatada usando esta estrutura. Não desvie.

```
RELATÓRIO DE VERIFICAÇÃO
-------------------
Afirmação: [O que está sendo afirmado — ex.: "testes passam", "build sucede", "tarefa concluída"]
Comando: [Comando exato executado — ex.: `make verify`]
Executado: [Timestamp ou "apenas agora, após todas as mudanças"]
Código de saída: [0 ou não-zero]
Resumo da saída: [Linhas-chave da saída — contagem de passes, contagem de erros, resultado de build]
Avisos: [Quaisquer avisos, ou "nenhum"]
Erros: [Quaisquer erros, ou "nenhum"]
Veredicto: PASS ou FAIL
```

Se o veredicto for FAIL, não use linguagem de conclusão. Declare o que falhou e o que permanece.

Se o veredicto for PASS, a afirmação pode proceder — mas apenas a afirmação específica suportada pela evidência. "Testes passam" não significa "build sucede".

## Quando a Verificação Falha

Falha de verificação não é um beco sem saída. É informação. Siga este protocolo:

1. **Leia a falha.** Identifique o erro exato: qual comando falhou, qual teste, qual regra de lint, qual erro de build. Cite as linhas relevantes da saída.
2. **Diagnostique a causa-raiz.** Não adivinhe. Leia a mensagem de erro. Rastreie-a para a origem. Se múltiplas coisas falharam, trate-as uma por uma começando pela primeira falha.
3. **Corrija a causa-raiz.** Aplique a mudança mínima que aborda o erro real. Não aplique workarounds, supressão de avisos ou pule verificações.
4. **Re-verifique do zero.** Rode o comando de verificação completo novamente. Não assuma que o fix funcionou. Não rode apenas o subconjunto que falhou anteriormente.
5. **Reporte com evidência.** Use o Template de Relatório de Verificação. Se passar agora, a afirmação pode proceder. Se falhar novamente, retorne ao passo 1.

**Nunca:**
- Afirme sucesso parcial ("3 de 4 verificações passam, basta assim")
- Pule re-verificação após um fix ("Corrigi o erro, então deve passar agora")
- Culpe a ferramenta ("o linter está errado") sem evidência de um falso positivo
- Passe para a próxima tarefa enquanto a verificação ainda está falhando

Se o comando de verificação correto não está claro, identifique-o antes de fazer qualquer afirmação de conclusão. Se apenas verificação parcial estiver disponível, declare essa limitação explicitamente e evite linguagem de conclusão.
