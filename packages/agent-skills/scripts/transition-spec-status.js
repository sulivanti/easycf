#!/usr/bin/env node

/**
 * Validador de Definition of Ready (DoR) e Promotor de Status
 * Uso: node transition-spec-status.js <caminho/para/arquivo.md> [status_alvo]
 * 
 * Este script lê uma especificação no formato do framework,
 * checa se as regras mínimas do DoR (Gherkin, Owner, etc) estão preenchidas,
 * e avança o metadado `estado_item` para REFINING ou READY.
 */

const fs = require('fs');
const path = require('path');

const targetFile = process.argv[2];
const targetStatus = process.argv[3] ? process.argv[3].toUpperCase() : 'READY'; // REFINING ou READY

if (!targetFile) {
    console.error('Uso: node transition-spec-status.js <caminho/para/arquivo.md> [status_alvo(REFINING|READY)]');
    process.exit(1);
}

const filePath = path.resolve(targetFile);

if (!fs.existsSync(filePath)) {
    console.error(`Erro: Arquivo não encontrado em ${filePath}`);
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf-8');

// Regras e Erros
const rules = [];
const missing = [];

// 1. Verificação de Owner
const hasOwner = /-\s*\*\*owner:\*\*\s*(.+)/i.exec(content) || /-\s*owner:\s*(.+)/i.exec(content);
const ownerVal = hasOwner ? hasOwner[1].trim() : '';
if (ownerVal && ownerVal !== '...' && ownerVal.toLowerCase() !== '<owner>' && ownerVal.toLowerCase() !== 'todo') {
    rules.push('Owner definido');
} else {
    missing.push('Owner não está definido ou possui um placeholder ("...").');
}

// 2. Verificação de Gherkin
// Para atingir READY, um arquivo de feature/business rule requer BDD.
if (content.includes('```gherkin')) {
    rules.push('Cenários em Gherkin encontrados');
} else {
    if (targetStatus === 'READY') {
        missing.push('Cenários de Critérios de Aceite em formato Gherkin estão ausentes.');
    }
}

// 3. Validação em Cascata (Épico precisa estar em READY para sub-histórias)
const fileName = path.basename(filePath);
// Regex para capturar sub-histórias, ex: US-MOD-000-F01.md
const featureMatch = fileName.match(/^(US-[A-Z0-9]+-[A-Z0-9]+)-F\d+\.md$/i);

if (featureMatch) {
    const epicName = featureMatch[1]; // Ex: US-MOD-000
    // Tentativa de achar o épico na pasta `epics` que fica no mesmo nível que a pasta `features`
    const epicPath = path.join(path.dirname(filePath), '..', 'epics', `${epicName}.md`);

    if (fs.existsSync(epicPath)) {
        const epicContent = fs.readFileSync(epicPath, 'utf-8');
        const epicStatusMatch = epicContent.match(/-\s*\*\*estado_item:\*\*\s*(READY|DRAFT.*|REFINING.*)/i) ||
            epicContent.match(/-\s*estado_item:\s*(READY|DRAFT.*|REFINING.*)/i);

        let isEpicReady = false;
        if (epicStatusMatch) {
            const epicStatus = epicStatusMatch[1].trim().split(' ')[0].toUpperCase();
            if (epicStatus === 'READY') {
                isEpicReady = true;
            }
        }

        if (isEpicReady) {
            rules.push(`Épico Pai (${epicName}) está em status READY`);
        } else {
            missing.push(`Aprovação em Cascata: O Épico pai (${epicName}) NÃO está em status READY. Ele precisa ser aprovado primeiro.`);
        }
    } else {
        // Se não encontrar o doc do épico, não bloqueia por padrão, mas poderia.
        rules.push(`Épico Pai (${epicName}) não encontrado (validação ignorada)`);
    }
}

// 4. Status atual
const currentStatusMatch = content.match(/-\s*\*\*estado_item:\*\*\s*(DRAFT|REFINING|READY|DRAFT.*|REFINING.*)/i) ||
    content.match(/-\s*estado_item:\s*(DRAFT|REFINING|READY|DRAFT.*|REFINING.*)/i);

let currentStatus = 'Não encontrado';
if (currentStatusMatch) {
    currentStatus = currentStatusMatch[1].trim().split(' ')[0].toUpperCase();
}

// 5. Bloqueio de DRAFT direto para READY (Regra DOC-DEV-001)
if (currentStatus === 'DRAFT' && targetStatus === 'READY') {
    missing.push('Transição Inválida (DoR): É proibido pular de DRAFT direto para READY. A feature deve transicionar primeiro para REFINING de modo que dependências e impactos sejam validados.');
}

console.log('================================================');
console.log('Validação de Definition of Ready (DoR)');
console.log(`Arquivo: ${targetFile}`);
console.log(`Status Atual: ${currentStatus}`);
console.log(`Status Alvo: ${targetStatus}`);
console.log('================================================\n');

if (currentStatus === targetStatus) {
    console.log(`ℹ O documento já se encontra no status ${targetStatus}.`);
    process.exit(0);
}

// Emissão de pendências
if (missing.length > 0) {
    console.log(`❌ O documento NÃO atende aos requisitos mínimos para avançar para ${targetStatus}.`);
    console.log('Pendências encontradas:');
    missing.forEach(m => console.log(`  - ${m}`));
    console.log('\nEdite o arquivo para resolver as lacunas e tente novamente.');
    process.exit(1);
} else {
    console.log(`✅ O documento cumpre as regras detectáveis para o status ${targetStatus}.`);

    let newContent = content;

    if (currentStatusMatch) {
        // Substitui com o novo status mantendo a formatação e as anotações posteriores
        newContent = newContent.replace(/(-\s*\*\*estado_item:\*\*\s*)(?:DRAFT|REFINING|READY)(.*)/gi, `$1${targetStatus}$2`);
        newContent = newContent.replace(/(-\s*estado_item:\s*)(?:DRAFT|REFINING|READY)(.*)/gi, `$1${targetStatus}$2`);

        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`\n💾 Status promovido para ${targetStatus} com sucesso!`);
    } else {
        console.log('\n⚠️ Nenhum campo "estado_item" (DRAFT ou REFINING) encontrado para substituir.');
    }
}
