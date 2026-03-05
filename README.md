# EasyCodeFramework 🚀

O EasyCodeFramework (ECF) é a fundação para criação e gestão de APIs transacionais escaláveis com Node.js, empoderado por skills nativas de Inteligência Artificial usando Antigravity.

## Pilares

1. **@easycf/core-api:** Runtime de API configurado (Fastify, pino, RFC 9457).
2. **@easycf/cli e templates:** Orquestração declarativa e injeção do DOC-DEV-001 e arquiteturas base.
3. **@easycf/agent-skills:** Conjunto de workflows de IA que geram código aderente às regras de arquitetura automaticamente.

## Pré-requisitos

Certifique-se de ter o Node.js instalado (versão recomendada: >= 20.0.0).

Este projeto utiliza o `pnpm` como gerenciador de pacotes. Caso o comando `pnpm` não seja reconhecido no seu sistema (comum devido a restrições de permissão no Windows), você pode contornar ativando o binário via Corepack e usando o `npx`:

```bash
# Prepara e ativa a versão correta do pnpm para o projeto
corepack prepare pnpm@9.0.0 --activate
```

Após executar o comando acima, você pode rodar os comandos do pnpm através do `npx` de forma segura (sem exigir privilégios de administrador):

```bash
npx pnpm -v
```

## Inicializando novo projeto

\`\`\`bash

# 1. Clone o repositório base

git clone <https://github.com/sulivanti/EasyCodeFramework.git>
cd EasyCodeFramework

# 2. Instale as dependências e faça o build inicial do monorepo

npx pnpm install
npx pnpm build

# 3. Inicialize seu novo projeto no diretório desejado (ex: uma pasta acima)

npx tsx tooling/cli/src/index.ts init ../meu-super-app

# 4. Entre no seu novo projeto

cd ../meu-super-app
npx pnpm install
npx pnpm dev
\`\`\`

## Mais comandos

\`\`\`bash

# Para ejetar um módulo paramêtrico no seu projeto

npx easycf add

# (Seleciona entre Auth / IAM / Core-DB)

\`\`\`

Consulte `docs/getting-started.md` para um overview completo.
