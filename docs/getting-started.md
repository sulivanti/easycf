# Getting Started

## Instalando o framework

Você deve clonar o repositório base e usar o CLI local para preparar um novo servidor com governança pronta:

\`\`\`bash

# 1. Clone o repositório

git clone <https://github.com/sulivanti/EasyCodeFramework.git>
cd EasyCodeFramework

# 2. Instale as dependências do monorepo e gere o build do CLI

pnpm install
pnpm build

# 3. Execute o CLI apontando para o diretório de destino do seu novo projeto

npx tsx tooling/cli/src/index.ts init ../minha-api
\`\`\`
O wizard interativo criará o diretório `minha-api` com a fundação pronta contendo:

- Dependências resolvidas
- Pacote NPM abstrato `@easycf/core-api`
- Workflow de Inteligência Artificial (`.agents/skills`)
- Base Normativa arquitetural compilada na raiz.

## Estrutura do Projeto Gerado

Ao finalizar, seu projeto terá o entrypoint (Node/Fastify) apontando para a *factory* abstrata do ECF. Toda nova funcionalidade de negócio deverá residir em `src/modules`.

Para acelerar desenvolvimento de negócios padrões, você pode "O ejetar" módulos pré-fabricados para dentro do ecossistema:

\`\`\`bash
npx easycf add
\`\`\`
*(Selecione Módulo Auth, IAM ou Schemas base).*

## Deploy Packages NPM

Para compilar as features e publicar a suíte base, caso queira publicar no npmjs org `@easycf`:
\`\`\`bash
pnpm build
cd packages/core-api && npm publish --access public
cd tooling/cli && npm publish --access public
\`\`\`
