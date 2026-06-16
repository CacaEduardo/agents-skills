---
name: write-a-skill
description: Cria novas agent skills com estrutura adequada, revelação progressiva e recursos agrupados. Use quando o usuário quiser criar, escrever ou construir uma nova skill.
---

# Writing Skills

## Processo

1. **Reúna requisitos** - pergunte ao usuário sobre:
   - Qual tarefa/domínio a skill cobre?
   - Quais casos de uso específicos ela deve lidar?
   - Precisa de scripts executáveis ou apenas instruções?
   - Materiais de referência a incluir?

2. **Rascunhe a skill** - crie:
   - SKILL.md com instruções concisas
   - Arquivos de referência adicionais se o conteúdo exceder 500 linhas
   - Scripts de utilidade se operações determinísticas forem necessárias

3. **Revise com o usuário** - apresente o rascunho e pergunte:
   - Isto cobre seus casos de uso?
   - Algo está faltando ou não está claro?
   - Alguma seção deveria ser mais/menos detalhada?

## Estrutura da Skill

```
nome-da-skill/
├── SKILL.md           # Instruções principais (obrigatório)
├── REFERENCE.md       # Docs detalhados (se necessário)
├── EXAMPLES.md        # Exemplos de uso (se necessário)
└── scripts/           # Scripts de utilidade (se necessário)
    └── helper.js
```

## Template SKILL.md

```md
---
name: nome-da-skill
description: Breve descrição da capacidade. Use quando [triggers específicos].
---

# Nome da Skill

## Quick start

[Exemplo funcional mínimo]

## Workflows

[Processos passo a passo com checklists para tarefas complexas]

## Advanced features

[Link para arquivos separados: See [REFERENCE.md](REFERENCE.md)]
```

## Requisitos da Descrição

A descrição é **a única coisa que seu agente vê** ao decidir qual skill carregar. É surfada no prompt de sistema ao lado de todas as outras skills instaladas. Seu agente lê estas descrições e escolhe a skill relevante com base na solicitação do usuário.

**Objetivo**: Dê ao seu agente informação suficiente para saber:

1. Que capacidade esta skill fornece
2. Quando/por que acioná-la (keywords específicas, contextos, tipos de arquivo)

**Formato**:

- Máx. 1024 caracteres
- Escreva em terceira pessoa
- Primeira frase: o que faz
- Segunda frase: "Use quando [triggers específicos]"

**Bom exemplo**:

```
Extrai texto e tabelas de arquivos PDF, preenche formulários, mescla documentos. Use ao trabalhar com arquivos PDF ou quando o usuário menciona PDFs, formulários ou extração de documentos.
```

**Mau exemplo**:

```
Ajuda com documentos.
```

O mau exemplo não dá ao seu agente forma de distinguir isto de outras skills de documentos.

## Quando Adicionar Scripts

Adicione scripts de utilidade quando:

- Operação é determinística (validação, formatação)
- Mesmo código seria gerado repetidamente
- Erros precisam de tratamento explícito

Scripts economizam tokens e melhoram confiabilidade vs código gerado.

## Quando Dividir Arquivos

Divida em arquivos separados quando:

- SKILL.md excede 100 linhas
- Conteúdo tem domínios distintos (finance vs sales schemas)
- Features avançadas são raramente necessárias

## Checklist de Revisão

Após rascunhar, verifique:

- [ ] Descrição inclui triggers ("Use quando...")
- [ ] SKILL.md menos de 100 linhas
- [ ] Nenhuma informação time-sensitive
- [ ] Terminologia consistente
- [ ] Exemplos concretos incluídos
- [ ] Referências um nível profundo
