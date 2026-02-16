/**
 * Utility Commands
 *
 * Utility functions (ID conversion, etc.)
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { get, formatOutput } from '../lib/api.js';

export function registerUtilityCommands(program) {
  const utilities = new Command('utils')
    .description('Utility functions');

  utilities
    .command('convert-id <id>')
    .description('Convert legacy API ID to v3 ID')
    .option('-f, --format <format>', 'Output format (json, pretty)', 'pretty')
    .action(async (id, options) => {
      const spinner = ora(`Converting ID ${id}...`).start();
      try {
        const data = await get(`/utils/convert-legacy-id/${id}`);
        spinner.succeed('ID converted');
        console.log(formatOutput(data, options.format));
      } catch (error) {
        spinner.fail('Failed to convert ID');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  program.addCommand(utilities);
}
