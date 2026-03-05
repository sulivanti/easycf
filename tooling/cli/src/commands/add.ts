import { Command } from 'commander';
import { select } from '@inquirer/prompts';
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.resolve(__dirname, '../../templates');

export function setupAddCommand(program: Command) {
    program
        .command('add')
        .description('Eject a framework module into your project')
        .argument('[module-name]', 'Name of the module to eject (auth, iam)')
        .action(async (moduleNameArg) => {
            let targetModule = moduleNameArg;

            if (!targetModule) {
                targetModule = await select({
                    message: 'Select an EasyCodeFramework module to eject:',
                    choices: [
                        { name: 'Module: Auth (Authentication & Session)', value: 'auth' },
                        { name: 'Module: IAM (RBAC, Roles, Tenants)', value: 'iam' },
                        { name: 'Core DB: Schemas base (User, Tenant)', value: 'db-schemas' }
                    ]
                });
            }

            const moduleTemplatePath = path.join(TEMPLATES_DIR, 'modules', targetModule);

            if (!fs.existsSync(moduleTemplatePath)) {
                console.error(chalk.red(`\nError: Template for module "${targetModule}" not found in CLI templates.`));
                process.exit(1);
            }

            // Determine ejection target path
            let ejectionSrcTarget = path.join(process.cwd(), 'src', 'modules', targetModule);
            if (targetModule === 'db-schemas') {
                ejectionSrcTarget = path.join(process.cwd(), 'src', 'db', 'schemas');
            }

            const spinner = ora(`Ejecting ${targetModule} ...`).start();
            try {
                fs.mkdirSync(ejectionSrcTarget, { recursive: true });
                copyFolderSync(moduleTemplatePath, ejectionSrcTarget);
                spinner.succeed(chalk.green(`Module ${targetModule} ejected to ${ejectionSrcTarget}`));

                console.log(chalk.cyan(`Remember to run "pnpm i" if this module introduced new dependencies!`));
            } catch (error: any) {
                spinner.fail(chalk.red(`Failed to eject ${targetModule}`));
                console.error(error.message);
                process.exit(1);
            }
        });
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
