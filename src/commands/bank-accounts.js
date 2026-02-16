/**
 * Bank Account Commands
 *
 * Manage bank accounts for invoicing
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { get, post, put, del, formatOutput } from '../lib/api.js';
import { readFileSync } from 'fs';

export function registerBankAccountCommands(program) {
  const bankAccounts = new Command('bank-accounts')
    .alias('banks')
    .description('Manage bank accounts');

  bankAccounts
    .command('list')
    .description('List all bank accounts')
    .option('-p, --page <number>', 'Page number', '1')
    .option('--per-page <number>', 'Results per page', '25')
    .option('-f, --format <format>', 'Output format (json, pretty)', 'pretty')
    .action(async (options) => {
      const spinner = ora('Fetching bank accounts...').start();
      try {
        const data = await get('/bank-accounts', {
          page: options.page,
          per_page: options.perPage,
        });
        spinner.succeed('Bank accounts retrieved');
        console.log(formatOutput(data, options.format));
      } catch (error) {
        spinner.fail('Failed to fetch bank accounts');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  bankAccounts
    .command('get <id>')
    .description('Get bank account by ID')
    .option('-f, --format <format>', 'Output format (json, pretty)', 'pretty')
    .action(async (id, options) => {
      const spinner = ora(`Fetching bank account ${id}...`).start();
      try {
        const data = await get(`/bank-accounts/${id}`);
        spinner.succeed('Bank account retrieved');
        console.log(formatOutput(data, options.format));
      } catch (error) {
        spinner.fail('Failed to fetch bank account');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  bankAccounts
    .command('create')
    .description('Create a new bank account')
    .option('-f, --file <path>', 'JSON file with bank account data')
    .option('-d, --data <json>', 'JSON string with bank account data')
    .action(async (options) => {
      const spinner = ora('Creating bank account...').start();
      try {
        let data;
        if (options.file) {
          data = JSON.parse(readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          data = JSON.parse(options.data);
        } else {
          spinner.fail('No data provided');
          console.error(chalk.red('Error: Provide data with --file or --data'));
          process.exit(1);
        }

        const result = await post('/bank-accounts', data);
        spinner.succeed('Bank account created');
        console.log(formatOutput(result, 'pretty'));
      } catch (error) {
        spinner.fail('Failed to create bank account');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  bankAccounts
    .command('update <id>')
    .description('Update a bank account')
    .option('-f, --file <path>', 'JSON file with bank account data')
    .option('-d, --data <json>', 'JSON string with bank account data')
    .action(async (id, options) => {
      const spinner = ora(`Updating bank account ${id}...`).start();
      try {
        let data;
        if (options.file) {
          data = JSON.parse(readFileSync(options.file, 'utf-8'));
        } else if (options.data) {
          data = JSON.parse(options.data);
        } else {
          spinner.fail('No data provided');
          console.error(chalk.red('Error: Provide data with --file or --data'));
          process.exit(1);
        }

        const result = await put(`/bank-accounts/${id}`, data);
        spinner.succeed('Bank account updated');
        console.log(formatOutput(result, 'pretty'));
      } catch (error) {
        spinner.fail('Failed to update bank account');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  bankAccounts
    .command('delete <id>')
    .description('Delete a bank account')
    .action(async (id) => {
      const spinner = ora(`Deleting bank account ${id}...`).start();
      try {
        await del(`/bank-accounts/${id}`);
        spinner.succeed('Bank account deleted');
      } catch (error) {
        spinner.fail('Failed to delete bank account');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  program.addCommand(bankAccounts);
}
