const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv/dist/2020');
const ajv = new Ajv({ strict: false });

const schemaPath = path.resolve(__dirname, '../docs/05_manifests/schemas/screen-manifest.v1.schema.json');
let schema;
try {
    schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
} catch (e) {
    console.error('❌ Falha ao carregar o schema:', e.message);
    process.exit(1);
}
const validate = ajv.compile(schema);

const manifestsDir = path.resolve(__dirname, '../docs/05_manifests/screens');
let manifests = [];

try {
    const files = fs.readdirSync(manifestsDir);
    manifests = files
        .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
        .map(f => path.join(manifestsDir, f));
} catch (e) {
    console.error('❌ Diretório de manifestos não encontrado ou vazio:', e.message);
}

if (manifests.length === 0) {
    console.log('⚠️ Nenhum manifesto encontrado para validar.');
    process.exit(0);
}

let hasErrors = false;

for (const file of manifests) {
    try {
        const data = yaml.load(fs.readFileSync(file, 'utf8'));
        const valid = validate(data);
        if (!valid) {
            console.error(`\n❌ Falha na validação para ${path.basename(file)}:`);
            console.error(validate.errors);
            hasErrors = true;
        } else {
            console.log(`✅ ${path.basename(file)} é válido`);
        }
    } catch (e) {
        console.error(`\n💥 Erro ao processar ${path.basename(file)}:`, e.message);
        hasErrors = true;
    }
}

if (hasErrors) {
    process.exit(1);
} else {
    console.log('\n🎉 Todos os manifestos são válidos contra o schema v1.');
}
