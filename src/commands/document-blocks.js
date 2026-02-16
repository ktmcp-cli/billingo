/**
 * Document Block Commands
 *
 * Manage document blocks (invoice pads)
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { get, formatOutput } from '../lib/api.js';

export function registerDocumentBlockCommands(program) {
  const documentBlocks = new Command('document-blocks')
    .alias('blocks')
    .description('Manage document blocks (invoice pads)');

  documentBlocks
    .command('list')
    .description('List all document blocks')
    .option('-p, --page <number>', 'Page number', '1')
    .option('--per-page <number>', 'Results per page', '25')
    .option('-f, --format <format>', 'Output format (json, pretty)', 'pretty')
    .action(async (options) => {
      const spinner = ora('Fetching document blocks...').start();
      try {
        const data = await get('/document-blocks', {
          page: options.page,
          per_page: options.perPage,
        });
        spinner.succeed('Document blocks retrieved');
        console.log(formatOutput(data, options.format));
      } catch (error) {
        spinner.fail('Failed to fetch document blocks');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  program.addCommand(documentBlocks);
}
