import { Command } from 'commander';
import { input } from '@inquirer/prompts';
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.resolve(__dirname, '../../templates');

export function setupInitCommand(program: Command) {
    program
        .command('init')
        .description('Initialize a new EasyCodeFramework project')
        .argument('[project-directory]', 'Project directory name')
        .action(async (projectDirectory) => {
            console.log(chalk.bold.blue('Welcome to EasyCodeFramework 🚀'));

            const targetDir = projectDirectory || await input({
                message: 'What is your project name?',
                default: 'my-easycf-app'
            });

            const targetPath = path.resolve(process.cwd(), targetDir);

            if (fs.existsSync(targetPath) && fs.readdirSync(targetPath).length > 0) {
                console.error(chalk.red(`\nError: Directory "${targetDir}" is not empty.`));
                process.exit(1);
            }

            const spinner = ora('Scaffolding your project...').start();

            try {
                fs.mkdirSync(targetPath, { recursive: true });

                // 1. Copy normative docs with Handlebars rendering
                const docsTemplatePath = path.join(TEMPLATES_DIR, 'docs');
                if (fs.existsSync(docsTemplatePath)) {
                    copyAndRender(docsTemplatePath, targetPath, {
                        project_name: targetDir,
                    });
                }

                // 2. Copy Agent Skills to .agents
                // from dist/commands/init.js -> ../../ -> /tooling/cli -> ../../ -> / -> packages/agent-skills/skills
                const agentSkillsPath = path.resolve(__dirname, '../../../../packages/agent-skills/skills');
                const targetAgentsPath = path.join(targetPath, '.agents', 'skills');
                if (fs.existsSync(agentSkillsPath)) {
                    fs.mkdirSync(targetAgentsPath, { recursive: true });
                    copyFolderSync(agentSkillsPath, targetAgentsPath);
                }

                // 3. Generate initial package.json mapping
                const pkgJson = {
                    name: targetDir,
                    version: '0.1.0',
                    private: true,
                    scripts: {
                        dev: 'tsx watch src/index.ts',
                        start: 'node dist/index.js'
                    },
                    dependencies: {
                        '@easycf/core-api': '^0.1.0',
                        'fastify': '^4.26.0'
                    },
                    devDependencies: {
                        'tsx': '^4.21.0'
                    }
                };
                fs.writeFileSync(
                    path.join(targetPath, 'package.json'),
                    JSON.stringify(pkgJson, null, 2)
                );

                // 4. Create default src/index.ts
                const srcPath = path.join(targetPath, 'src');
                if (!fs.existsSync(srcPath)) fs.mkdirSync(srcPath, { recursive: true });
                const indexTsContent = `import { createApp } from '@easycf/core-api';

async function main() {
    const app = await createApp();
    try {
        await app.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server is running at http://localhost:3000');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

main();
`;
                fs.writeFileSync(path.join(srcPath, 'index.ts'), indexTsContent);

                // 5. Copy .cursorrules
                const cursorRulesPath = path.join(path.resolve(__dirname, '../../../../'), '.cursorrules');
                if (fs.existsSync(cursorRulesPath)) {
                    fs.copyFileSync(cursorRulesPath, path.join(targetPath, '.cursorrules'));
                }

                spinner.succeed(chalk.green('Project scaffolded successfully!'));

                console.log(`\nNext steps:`);
                console.log(chalk.cyan(`  cd ${targetDir}`));
                console.log(chalk.cyan(`  npx pnpm install  # (ou apenas pnpm install)`));
                console.log(chalk.cyan(`  npx pnpm dev      # (ou apenas pnpm dev)`));

            } catch (error: any) {
                spinner.fail(chalk.red('Failed to scaffold project'));
                console.error(error.message);
                process.exit(1);
            }
        });
}

function copyAndRender(src: string, dest: string, context: Record<string, any>) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        // Parametrize directory or file names safely
        let renderedName = entry.name;
        if (renderedName.includes('{{')) {
            renderedName = handlebars.compile(renderedName)(context);
        }

        const destPath = path.join(dest, renderedName);

        if (entry.isDirectory()) {
            copyAndRender(srcPath, destPath, context);
        } else {
            if (srcPath.endsWith('.md') || srcPath.endsWith('.ts') || srcPath.endsWith('.json')) {
                const content = fs.readFileSync(srcPath, 'utf8');
                try {
                    const template = handlebars.compile(content);
                    fs.writeFileSync(destPath, template(context));
                } catch {
                    // fallback if not a valid hbs string
                    fs.copyFileSync(srcPath, destPath);
                }
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
}

function copyFolderSync(from: string, to: string) {
    if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
    fs.readdirSync(from).forEach(element => {
        const itemSrc = path.join(from, element);
        const itemDest = path.join(to, element);
        if (fs.lstatSync(itemSrc).isFile()) {
            fs.copyFileSync(itemSrc, itemDest);
        } else {
            copyFolderSync(itemSrc, itemDest);
        }
    });
}
