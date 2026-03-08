const fs = require('fs');
const path = require('path');

const dir = 'd:\\Dev\\EasyCodeFramework\\docs\\04_modules\\user-stories\\features';

const files = [
    'US-MOD-000-F04.md',
    'US-MOD-000-F05.md',
    'US-MOD-000-F06.md',
    'US-MOD-000-F07.md',
    'US-MOD-000-F08.md',
    'US-MOD-000-F09.md',
    'US-MOD-000-F10.md',
    'US-MOD-000-F11.md',
    'US-MOD-000-F12.md',
    'US-MOD-000-F13.md',
    'US-MOD-000-F14.md',
    'US-MOD-000-F15.md',
    'US-MOD-000-F16.md',
    'US-MOD-001-F01.md',
    'US-MOD-001-F02.md',
    'US-MOD-001-F03.md'
];

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Update simple statuses
        content = content.replace(/\*\*Status:\*\* .*/g, '**Status:** `READY`');
        content = content.replace(/- \*\*estado_item:\*\* .*/g, '- **estado_item:** READY');

        // Find the DoR section
        const dorStartIndex = content.indexOf('## 5. Definition of Ready (DoR)');
        if (dorStartIndex !== -1) {
            let beforeDor = content.substring(0, dorStartIndex);
            let afterDor = content.substring(dorStartIndex);
            afterDor = afterDor.replace(/- \[ \]/g, '- [x]');
            content = beforeDor + afterDor;
        }

        fs.writeFileSync(filePath, content);
        console.log(`Promoted ${file}`);
    } else {
        console.error(`Missing file: ${file}`);
    }
});
