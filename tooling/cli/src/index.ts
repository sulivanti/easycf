#!/usr/bin/env node

import { Command } from 'commander';
import { setupInitCommand } from './commands/init.js';
import { setupAddCommand } from './commands/add.js';

const program = new Command();

program
    .name('easycf')
    .description('EasyCodeFramework - Scaffolding para Projetos Institucionais')
    .version('0.1.0');

// Registra o comando de clone e inicialização
setupInitCommand(program);
setupAddCommand(program);

program.parse(process.argv);
