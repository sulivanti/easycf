# CLAUDE.md — Regras do Projeto ECF

## Regras do Projeto

### Proibição de dados mock em código de produção
- NUNCA usar dados mock, dummy, faker ou hardcoded em código de produção
- Todos os dados exibidos na UI devem vir de endpoints reais da API
- Dados fictícios são permitidos APENAS em arquivos de teste (`*.test.ts`, `*.spec.ts`) e seed (`seed-*.ts`)

### Idioma
- Respostas e comunicação sempre em português brasileiro

### Alterações de código
- Todas as alterações devem passar por `/create-amendment` primeiro — nunca editar código diretamente sem contexto normativo
