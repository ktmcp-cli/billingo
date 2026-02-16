/**
 * Currency Commands
 *
 * Get currency conversion rates
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { get, formatOutput } from '../lib/api.js';

export function registerCurrencyCommands(program) {
  const currencies = new Command('currencies')
    .alias('currency')
    .description('Get currency conversion rates');

  currencies
    .command('convert')
    .description('Get conversion rate between currencies')
    .requiredOption('--from <currency>', 'Source currency code (e.g., HUF)')
    .requiredOption('--to <currency>', 'Target currency code (e.g., EUR)')
    .option('-f, --format <format>', 'Output format (json, pretty)', 'pretty')
    .action(async (options) => {
      const spinner = ora(`Getting conversion rate ${options.from} → ${options.to}...`).start();
      try {
        const data = await get('/currencies', {
          from: options.from,
          to: options.to,
        });
        spinner.succeed('Conversion rate retrieved');
        console.log(formatOutput(data, options.format));
      } catch (error) {
        spinner.fail('Failed to get conversion rate');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  program.addCommand(currencies);
}
