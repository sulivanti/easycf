const fs = require('fs');
const path = require('path');

const usDirs = [
    'd:/Dev/EasyCodeFramework/docs/04_modules/user-stories/epics',
    'd:/Dev/EasyCodeFramework/docs/04_modules/user-stories/features'
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Reset status_agil directly
    const replaced = content
        .replace(/\*\*Status Ágil:\*\*\s+`.+`/g, '**Status Ágil:** `DRAFT`')
        .replace(/- \*\*status_agil:\*\*\s+[A-Z]+/g, '- **status_agil:** DRAFT')
        .replace(/- \*\*status_agil:\*\*\s+`.+`/g, '- **status_agil:** DRAFT')
        // Clean metadata checklist
        .replace(/\[x\] /g, '[ ] ');

    if (replaced !== content) {
        fs.writeFileSync(filePath, replaced, 'utf8');
        console.log(`Reset: ${filePath}`);
    }
}

function processDirectory(directory) {
    if (!fs.existsSync(directory)) return;
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.md')) {
            processFile(fullPath);
        }
    }
}

usDirs.forEach(processDirectory);
console.log('Reset complete.');
