# Skill: update-markdown-file-index

Atualiza uma seção de índice/tabela em um arquivo markdown com lista de arquivos de um diretório especificado.

## Argumento

$ARGUMENTS deve conter o arquivo alvo e o diretório a indexar (ex: `docs/INDEX.md docs/04_modules/`). Se não fornecido, pergunte ao usuário:

- **Arquivo alvo:** O markdown que receberá o índice
- **Pasta a indexar:** O diretório cujos arquivos serão listados

## Processo

1. **Scan**: Leia o arquivo markdown alvo para entender estrutura existente
2. **Discover**: Liste todos os arquivos na pasta especificada
3. **Analyze**: Identifique seção existente de tabela/índice ou crie nova
4. **Structure**: Gere formato apropriado baseado nos tipos de arquivo

## Para Cada Arquivo Descoberto

Extraia:
- **Nome**: Filename com ou sem extensão
- **Tipo**: Extensão e categoria
- **Descrição**: Primeiro heading ou linha de comentário

## Formatos de Saída

### Lista Simples
```markdown
- [filename.ext](path/to/filename.ext) - Descrição
```

### Tabela Detalhada
| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| [nome](caminho) | .md | Descrição |

### Seções Categorizadas
Agrupe por tipo/categoria com seções separadas.

## Estratégia

- Se seção de índice existir: atualize mantendo estrutura
- Se não existir: crie nova seção com melhor formato
- Preserve formatação markdown existente
- Use caminhos relativos para links
- Ordene alfabeticamente por padrão
