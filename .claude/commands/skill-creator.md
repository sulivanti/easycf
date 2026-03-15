# Skill: skill-creator

Meta-skill para criar, avaliar e otimizar novas skills para o EasyCodeFramework.

## Argumento

$ARGUMENTS pode conter a descrição da skill desejada ou ação (ex: `"criar skill de validação de commits"` ou `"melhorar validate-drizzle"`). Se não fornecido, pergunte ao usuário.

## Processo de Criação

### 1. Capturar Intenção

Entenda o que o usuário quer:
- O que a skill deve habilitar o Claude a fazer?
- Quando deve ser ativada? (frases/contextos)
- Qual o formato de saída esperado?
- Devemos criar test cases para verificar?

### 2. Pesquisar e Entrevistar

- Pergunte sobre edge cases, formatos, critérios de sucesso
- Consulte comandos existentes em `.claude/commands/` para padrões
- Pesquise documentação relevante em `docs/01_normativos/`

### 3. Escrever Comando Claude Code

Crie o arquivo em `.claude/commands/{nome}.md` com:

- Título: `# Skill: nome-da-skill`
- Seção de argumento com `$ARGUMENTS`
- Corpo com: objetivo, gatilhos, parâmetros, passos de execução, formato de saída
- Sem frontmatter YAML (markdown puro)

### 5. Criar Test Cases

Desenvolva 2-3 prompts realistas com outputs esperados para validação.

### 6. Avaliar e Iterar

- Execute os test cases
- Avalie resultados qualitativamente e quantitativamente
- Use `.agents/skill-creator/eval-viewer/generate_review.py` para visualizar
- Reescreva baseado em feedback

### 7. Otimizar Description

Use `.agents/skill-creator/scripts/improve_description.py` para melhorar a precisão de triggering.

### 8. Empacotar

Use `.agents/skill-creator/scripts/package_skill.py` para distribuição.

## Scripts Disponíveis

| Script | Propósito |
|--------|-----------|
| `scripts/run_eval.py` | Roda avaliações com subagentes |
| `scripts/run_loop.py` | Loop iterativo de melhoria |
| `scripts/aggregate_benchmark.py` | Gera benchmark.json com estatísticas |
| `scripts/generate_report.py` | Relatório de performance |
| `scripts/improve_description.py` | Otimiza description para triggering |
| `scripts/quick_validate.py` | Validação rápida de SKILL.md |
| `scripts/package_skill.py` | Empacota skill para distribuição |
