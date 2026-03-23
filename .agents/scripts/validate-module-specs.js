const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Script EX-CI-007: QA Gate for 04_modules Documentation
// This script validates that any modified specification file inside docs/04_modules
// has its corresponding CHANGELOG.md updated and contains the automation marker.

// Path centralizado (.agents/paths.json)
const pathsConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../paths.json'), 'utf8'));
const MODULES_DIR = pathsConfig.paths.modules.replace(/\/$/, '');
const AUTOMATION_MARKER = 'ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.';

function getChangedFiles() {
  try {
    // Get staged files or files changed against main/master
    // For simplicity in a local pre-commit hook, we check staged files
    const output = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
    return output.split('\n').map(l => l.trim()).filter(Boolean);
  } catch (error) {
    console.warn('⚠️ Could not execute git diff. Ensure this is run in a git repository.');
    return [];
  }
}

function validateFile(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    return true; // File was deleted, nothing to validate
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');

  // Rule 1: Must contain the automation marker
  if (!content.includes(AUTOMATION_MARKER)) {
    console.error(`❌ ERRO (EX-CI-007): O arquivo ${filePath} não contém a marca d'água de automação.`);
    console.error(`   A edição manual de arquivos em ${MODULES_DIR} é PROIBIDA.`);
    console.error(`   Use a skill 'update-specification' para alterar este arquivo.`);
    return false;
  }

  // Rule 2: Must have a valid Version / Changelog table at the top
  const versionRegex = /\|\s*Versão\s*\|\s*Data\s*\|\s*Responsável\s*\|\s*Status\/Integração\s*\|/i;
  if (!versionRegex.test(content)) {
    console.error(`❌ ERRO (EX-CI-007): O arquivo ${filePath} não contém a tabela de versão obrigatória.`);
    return false;
  }

  return true;
}

function checkChangelogUpdated(changedFiles, moduleDir) {
  const changelogPath = moduleDir + '/CHANGELOG.md';
  const isChangelogChanged = changedFiles.some(f => f.replace(/\\/g, '/').endsWith('CHANGELOG.md') && f.includes(moduleDir));

  // To handle git root vs process root, we just look for 'docs/04_modules' and slice from there to get the relative path
  const normalizedChangelogPath = changelogPath.replace(/\\/g, '/');
  const relativeChangelogPath = normalizedChangelogPath.substring(normalizedChangelogPath.indexOf(MODULES_DIR));
  const absPath = path.resolve(process.cwd(), relativeChangelogPath);
  console.log("DEBUG: isChangelogChanged=", isChangelogChanged, "absPath=", absPath, "exists=", fs.existsSync(absPath));

  if (!isChangelogChanged && fs.existsSync(absPath)) {
    console.error(`❌ ERRO (EX-CI-007): Arquivos no módulo ${relativeChangelogPath.replace('/CHANGELOG.md', '')} foram alterados, mas o CHANGELOG.md não foi modificado.`);
    console.error(`   A evolução de documentos exige registro no Changelog do módulo.`);
    return false;
  }
  return true;
}

function run() {
  const changedFiles = getChangedFiles();
  // Git diff might return paths from the project root. We just need to check if it includes the modules dir.
  const moduleFiles = changedFiles.filter(f => f.replace(/\\/g, '/').includes(`/${MODULES_DIR}/`) || f.replace(/\\/g, '/').startsWith(`${MODULES_DIR}/`));

  if (moduleFiles.length === 0) {
    console.log('✅ EX-CI-007: Nenhuma alteração de módulo detectada.');
    process.exit(0);
  }

  console.log(`🔍 EX-CI-007: Validando ${moduleFiles.length} arquivo(s) modificado(s) em ${MODULES_DIR}...`);

  let hasErrors = false;
  const changedModules = new Set();

  for (const file of moduleFiles) {
    const parts = file.replace(/\\/g, '/').split('/');
    // Find the index of "04_modules"
    const modsIndex = parts.indexOf('04_modules');
    if (modsIndex !== -1 && parts.length > modsIndex + 1) {
      // The module dir is everything up to the module folder name
      const moduleDir = parts.slice(0, modsIndex + 2).join('/');
      changedModules.add(moduleDir);
    }

    // Only validate markdown files that are not the changelog or the module manifest (<dirname>.md)
    const normalFile = file.replace(/\\/g, '/');
    const fName = normalFile.split('/').pop();
    const pDir = normalFile.split('/').slice(-2, -1)[0] || '';
    if (file.endsWith('.md') && !file.endsWith('CHANGELOG.md') && fName !== pDir + '.md') {
      if (!validateFile(file)) {
        hasErrors = true;
      }
    }
  }

  console.log("DEBUG changedModules:", Array.from(changedModules));
  // Rule 3: If a module had files changed, its CHANGELOG must be updated
  for (const modDir of changedModules) {
    // Only enforce if the changes were not just creating the module directory initially
    // For a robust CI, we check if the changelog was touched
    if (!checkChangelogUpdated(changedFiles, modDir)) {
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error('\n🚫 EX-CI-007: Falha na validação de Governança de Módulos.');
    console.error('Por favor, reverta suas alterações manuais e utilize a automação adequada (skills).');
    process.exit(1);
  }

  console.log('✅ EX-CI-007: Todas as validações documentais passaram com sucesso.');
  process.exit(0);
}

run();
