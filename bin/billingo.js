#!/usr/bin/env node

/**
 * Billingo CLI - Main Entry Point
 *
 * Production-ready CLI for Billingo API v3
 * Hungarian invoicing and billing automation
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';

// Import command modules
import { registerBankAccountCommands } from '../src/commands/bank-accounts.js';
import { registerDocumentCommands } from '../src/commands/documents.js';
import { registerDocumentBlockCommands } from '../src/commands/document-blocks.js';
import { registerPartnerCommands } from '../src/commands/partners.js';
import { registerProductCommands } from '../src/commands/products.js';
import { registerCurrencyCommands } from '../src/commands/currencies.js';
import { registerOrganizationCommands } from '../src/commands/organization.js';
import { registerUtilityCommands } from '../src/commands/utilities.js';
import { registerConfigCommands } from '../src/commands/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load package.json
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

// Configure main program
program
  .name('billingo')
  .description(chalk.cyan('Billingo API v3 CLI - Hungarian invoicing and billing automation'))
  .version(packageJson.version, '-v, --version', 'output the current version')
  .addHelpText('after', `
${chalk.bold('Examples:')}
  $ billingo config set API_KEY <your-api-key>
  $ billingo documents list --page 1 --per-page 25
  $ billingo documents create -f invoice.json
  $ billingo partners list
  $ billingo bank-accounts list

${chalk.bold('API Documentation:')}
  ${chalk.blue('https://api.billingo.hu/v3/swagger')}

${chalk.bold('Get API Key:')}
  ${chalk.blue('https://app.billingo.hu/api-key')}
`);

// Register all command modules
registerConfigCommands(program);
registerBankAccountCommands(program);
registerDocumentCommands(program);
registerDocumentBlockCommands(program);
registerPartnerCommands(program);
registerProductCommands(program);
registerCurrencyCommands(program);
registerOrganizationCommands(program);
registerUtilityCommands(program);

// Global error handler
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('Unhandled error:'), error);
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);
