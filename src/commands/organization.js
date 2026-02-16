/**
 * Organization Commands
 *
 * Retrieve organization information
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { get, formatOutput } from '../lib/api.js';

export function registerOrganizationCommands(program) {
  const organization = new Command('organization')
    .alias('org')
    .description('Retrieve organization information');

  organization
    .command('get')
    .description('Get organization data')
    .option('-f, --format <format>', 'Output format (json, pretty)', 'pretty')
    .action(async (options) => {
      const spinner = ora('Fetching organization data...').start();
      try {
        const data = await get('/organization');
        spinner.succeed('Organization data retrieved');
        console.log(formatOutput(data, options.format));
      } catch (error) {
        spinner.fail('Failed to fetch organization data');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  program.addCommand(organization);
}
