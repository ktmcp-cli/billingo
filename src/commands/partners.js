/**
 * Partner Commands
 *
 * Manage business partners (customers, suppliers)
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { get, post, put, del, formatOutput } from '../lib/api.js';
import { readFileSync } from 'fs';

export function registerPartnerCommands(program) {
  const partners = new Command('partners')
    .description('Manage partners (customers, suppliers)');

  partners
    .command('list')
    .description('List all partners')
    .option('-p, --page <number>', 'Page number', '1')
    .option('--per-page <number>', 'Results per page', '25')
    .option('-f, --format <format>', 'Output format (json, pretty)', 'pretty')
    .action(async (options) => {
      const spinner = ora('Fetching partners...').start();
      try {
        const data = await get('/partners', {
          page: options.page,
          per_page: options.perPage,
        });
        spinner.succeed('Partners retrieved');
        console.log(formatOutput(data, options.format));
      } catch (error) {
        spinner.fail('Failed to fetch partners');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  partners
    .command('get <id>')
    .description('Get partner by ID')
    .option('-f, --format <format>', 'Output format (json, pretty)', 'pretty')
    .action(async (id, options) => {
      const spinner = ora(`Fetching partner ${id}...`).start();
      try {
        const data = await get(`/partners/${id}`);
        spinner.succeed('Partner retrieved');
        console.log(formatOutput(data, options.format));
      } catch (error) {
        spinner.fail('Failed to fetch partner');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  partners
    .command('create')
    .description('Create a new partner')
    .option('-f, --file <path>', 'JSON file with partner data')
    .option('-d, --data <json>', 'JSON string with partner data')
    .action(async (options) => {
      const spinner = ora('Creating partner...').start();
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

        const result = await post('/partners', data);
        spinner.succeed('Partner created');
        console.log(formatOutput(result, 'pretty'));
      } catch (error) {
        spinner.fail('Failed to create partner');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  partners
    .command('update <id>')
    .description('Update a partner')
    .option('-f, --file <path>', 'JSON file with partner data')
    .option('-d, --data <json>', 'JSON string with partner data')
    .action(async (id, options) => {
      const spinner = ora(`Updating partner ${id}...`).start();
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

        const result = await put(`/partners/${id}`, data);
        spinner.succeed('Partner updated');
        console.log(formatOutput(result, 'pretty'));
      } catch (error) {
        spinner.fail('Failed to update partner');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  partners
    .command('delete <id>')
    .description('Delete a partner')
    .action(async (id) => {
      const spinner = ora(`Deleting partner ${id}...`).start();
      try {
        await del(`/partners/${id}`);
        spinner.succeed('Partner deleted');
      } catch (error) {
        spinner.fail('Failed to delete partner');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  program.addCommand(partners);
}
