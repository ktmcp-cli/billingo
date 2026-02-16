/**
 * Product Commands
 *
 * Manage products for invoicing
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { get, post, put, del, formatOutput } from '../lib/api.js';
import { readFileSync } from 'fs';

export function registerProductCommands(program) {
  const products = new Command('products')
    .description('Manage products');

  products
    .command('list')
    .description('List all products')
    .option('-p, --page <number>', 'Page number', '1')
    .option('--per-page <number>', 'Results per page', '25')
    .option('-f, --format <format>', 'Output format (json, pretty)', 'pretty')
    .action(async (options) => {
      const spinner = ora('Fetching products...').start();
      try {
        const data = await get('/products', {
          page: options.page,
          per_page: options.perPage,
        });
        spinner.succeed('Products retrieved');
        console.log(formatOutput(data, options.format));
      } catch (error) {
        spinner.fail('Failed to fetch products');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  products
    .command('get <id>')
    .description('Get product by ID')
    .option('-f, --format <format>', 'Output format (json, pretty)', 'pretty')
    .action(async (id, options) => {
      const spinner = ora(`Fetching product ${id}...`).start();
      try {
        const data = await get(`/products/${id}`);
        spinner.succeed('Product retrieved');
        console.log(formatOutput(data, options.format));
      } catch (error) {
        spinner.fail('Failed to fetch product');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  products
    .command('create')
    .description('Create a new product')
    .option('-f, --file <path>', 'JSON file with product data')
    .option('-d, --data <json>', 'JSON string with product data')
    .action(async (options) => {
      const spinner = ora('Creating product...').start();
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

        const result = await post('/products', data);
        spinner.succeed('Product created');
        console.log(formatOutput(result, 'pretty'));
      } catch (error) {
        spinner.fail('Failed to create product');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  products
    .command('update <id>')
    .description('Update a product')
    .option('-f, --file <path>', 'JSON file with product data')
    .option('-d, --data <json>', 'JSON string with product data')
    .action(async (id, options) => {
      const spinner = ora(`Updating product ${id}...`).start();
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

        const result = await put(`/products/${id}`, data);
        spinner.succeed('Product updated');
        console.log(formatOutput(result, 'pretty'));
      } catch (error) {
        spinner.fail('Failed to update product');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  products
    .command('delete <id>')
    .description('Delete a product')
    .action(async (id) => {
      const spinner = ora(`Deleting product ${id}...`).start();
      try {
        await del(`/products/${id}`);
        spinner.succeed('Product deleted');
      } catch (error) {
        spinner.fail('Failed to delete product');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  program.addCommand(products);
}
