const { execSync } = require('child_process');
const readline = require('readline');

// Função para executar comandos no terminal e retornar a saída
function runCommand(command) {
    try {
        return execSync(command, { encoding: 'utf8' }).trim();
    } catch (error) {
        console.error(`Erro ao executar o comando: ${command}`);
        console.error(error.message);
        process.exit(1);
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const commitTypes = [
    { value: 'feat', description: 'Uma nova funcionalidade' },
    { value: 'fix', description: 'Uma correção de bug' },
    { value: 'docs', description: 'Mudanças na documentação apenas' },
    { value: 'style', description: 'Mudanças que não afetam o significado do código (espaços, formatação, etc)' },
    { value: 'refactor', description: 'Mudança de código que não corrige um bug nem adiciona uma nova funcionalidade' },
    { value: 'perf', description: 'Mudança de código que melhora a performance' },
    { value: 'test', description: 'Adição ou correção de testes' },
    { value: 'chore', description: 'Atualização de tarefas de build, gerenciador de pacotes, etc' },
];

console.log('--- Assistente de Commit (Semântico e em PT-BR) ---\n');

// 1. Mostrar as alterações atuais
const status = runCommand('git status --short');
if (!status) {
    console.log('Não há alterações para comitar.');
    process.exit(0);
}

console.log('Arquivos alterados:');
console.log(status);
console.log('\n');

// 2. Fazer o git add .
console.log('Adicionando todos os arquivos (git add .)...');
runCommand('git add .');

// 3. Solicitar informações do commit
console.log('Escolha o tipo de commit (digite o valor):');
commitTypes.forEach(t => console.log(`  ${t.value.padEnd(10)} - ${t.description}`));

rl.question('\nTipo: ', (typeAnswer) => {
    const typeObject = commitTypes.find(t => t.value === typeAnswer.trim());

    if (!typeObject) {
        console.error('Tipo inválido. Abortando.');
        process.exit(1);
    }

    const type = typeObject.value;

    rl.question('Escopo (opcional, pressione Enter para pular): ', (scopeAnswer) => {
        const scope = scopeAnswer.trim() ? `(${scopeAnswer.trim()})` : '';

        rl.question('Descrição curta e imperativa (em PT-BR): ', (descAnswer) => {
            const desc = descAnswer.trim();

            if (!desc) {
                console.error('A descrição é obrigatória. Abortando.');
                process.exit(1);
            }

            const commitMessage = `${type}${scope}: ${desc}`;

            console.log(`\nMensagem final: ${commitMessage}\n`);

            const commitCommand = `git commit -m "${commitMessage}"`;

            console.log('Executando commit...');
            const result = runCommand(commitCommand);
            console.log(result);

            console.log('\nCommit realizado com sucesso!');
            rl.close();
        });
    });
});
