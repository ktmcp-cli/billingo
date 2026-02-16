/**
 * Document Commands
 *
 * Manage invoices and other financial documents
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { get, post, put, del, downloadFile, formatOutput } from '../lib/api.js';
import { readFileSync, writeFileSync } from 'fs';

export function registerDocumentCommands(program) {
  const documents = new Command('documents')
    .alias('docs')
    .description('Manage documents (invoices)');

  documents
    .command('list')
    .description('List all documents')
    .option('-p, --page <number>', 'Page number', '1')
    .option('--per-page <number>', 'Results per page', '25')
    .option('--block-id <id>', 'Filter by document block ID')
    .option('--partner-id <id>', 'Filter by partner ID')
    .option('--payment-method <method>', 'Filter by payment method')
    .option('--payment-status <status>', 'Filter by payment status')
    .option('--start-date <date>', 'Filter by start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'Filter by end date (YYYY-MM-DD)')
    .option('--start-number <number>', 'Filter by start document number')
    .option('--end-number <number>', 'Filter by end document number')
    .option('--start-year <year>', 'Filter by start year')
    .option('--end-year <year>', 'Filter by end year')
    .option('-f, --format <format>', 'Output format (json, pretty)', 'pretty')
    .action(async (options) => {
      const spinner = ora('Fetching documents...').start();
      try {
        const params = {
          page: options.page,
          per_page: options.perPage,
        };

        // Add optional filters
        if (options.blockId) params.block_id = options.blockId;
        if (options.partnerId) params.partner_id = options.partnerId;
        if (options.paymentMethod) params.payment_method = options.paymentMethod;
        if (options.paymentStatus) params.payment_status = options.paymentStatus;
        if (options.startDate) params.start_date = options.startDate;
        if (options.endDate) params.end_date = options.endDate;
        if (options.startNumber) params.start_number = options.startNumber;
        if (options.endNumber) params.end_number = options.endNumber;
        if (options.startYear) params.start_year = options.startYear;
        if (options.endYear) params.end_year = options.endYear;

        const data = await get('/documents', params);
        spinner.succeed('Documents retrieved');
        console.log(formatOutput(data, options.format));
      } catch (error) {
        spinner.fail('Failed to fetch documents');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  documents
    .command('get <id>')
    .description('Get document by ID')
    .option('-f, --format <format>', 'Output format (json, pretty)', 'pretty')
    .action(async (id, options) => {
      const spinner = ora(`Fetching document ${id}...`).start();
      try {
        const data = await get(`/documents/${id}`);
        spinner.succeed('Document retrieved');
        console.log(formatOutput(data, options.format));
      } catch (error) {
        spinner.fail('Failed to fetch document');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  documents
    .command('create')
    .description('Create a new document')
    .option('-f, --file <path>', 'JSON file with document data')
    .option('-d, --data <json>', 'JSON string with document data')
    .action(async (options) => {
      const spinner = ora('Creating document...').start();
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

        const result = await post('/documents', data);
        spinner.succeed('Document created');
        console.log(formatOutput(result, 'pretty'));
      } catch (error) {
        spinner.fail('Failed to create document');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  documents
    .command('cancel <id>')
    .description('Cancel a document')
    .action(async (id) => {
      const spinner = ora(`Canceling document ${id}...`).start();
      try {
        const result = await post(`/documents/${id}/cancel`);
        spinner.succeed('Document canceled');
        console.log(formatOutput(result, 'pretty'));
      } catch (error) {
        spinner.fail('Failed to cancel document');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  documents
    .command('download <id>')
    .description('Download document as PDF')
    .option('-o, --output <path>', 'Output file path', 'document.pdf')
    .action(async (id, options) => {
      const spinner = ora(`Downloading document ${id}...`).start();
      try {
        const buffer = await downloadFile(`/documents/${id}/download`);
        writeFileSync(options.output, buffer);
        spinner.succeed(`Document saved to ${options.output}`);
      } catch (error) {
        spinner.fail('Failed to download document');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  documents
    .command('send <id>')
    .description('Send document via email')
    .option('-e, --emails <emails>', 'Comma-separated email addresses')
    .option('-s, --subject <subject>', 'Email subject')
    .option('-m, --message <message>', 'Email message')
    .action(async (id, options) => {
      const spinner = ora(`Sending document ${id}...`).start();
      try {
        const data = {};
        if (options.emails) data.emails = options.emails.split(',');
        if (options.subject) data.subject = options.subject;
        if (options.message) data.message = options.message;

        const result = await post(`/documents/${id}/send`, data);
        spinner.succeed('Document sent');
        console.log(formatOutput(result, 'pretty'));
      } catch (error) {
        spinner.fail('Failed to send document');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  documents
    .command('public-url <id>')
    .description('Get public download URL for document')
    .option('-f, --format <format>', 'Output format (json, pretty)', 'pretty')
    .action(async (id, options) => {
      const spinner = ora(`Getting public URL for document ${id}...`).start();
      try {
        const data = await get(`/documents/${id}/public-url`);
        spinner.succeed('Public URL retrieved');
        console.log(formatOutput(data, options.format));
      } catch (error) {
        spinner.fail('Failed to get public URL');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  documents
    .command('payments <id>')
    .description('Get payment history for document')
    .option('-f, --format <format>', 'Output format (json, pretty)', 'pretty')
    .action(async (id, options) => {
      const spinner = ora(`Fetching payments for document ${id}...`).start();
      try {
        const data = await get(`/documents/${id}/payments`);
        spinner.succeed('Payments retrieved');
        console.log(formatOutput(data, options.format));
      } catch (error) {
        spinner.fail('Failed to fetch payments');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  documents
    .command('update-payments <id>')
    .description('Update payment history for document')
    .option('-f, --file <path>', 'JSON file with payment data')
    .option('-d, --data <json>', 'JSON string with payment data')
    .action(async (id, options) => {
      const spinner = ora(`Updating payments for document ${id}...`).start();
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

        const result = await put(`/documents/${id}/payments`, data);
        spinner.succeed('Payments updated');
        console.log(formatOutput(result, 'pretty'));
      } catch (error) {
        spinner.fail('Failed to update payments');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  documents
    .command('online-szamla <id>')
    .description('Check Online Számla status')
    .option('-f, --format <format>', 'Output format (json, pretty)', 'pretty')
    .action(async (id, options) => {
      const spinner = ora(`Checking Online Számla status for document ${id}...`).start();
      try {
        const data = await get(`/documents/${id}/online-szamla`);
        spinner.succeed('Status retrieved');
        console.log(formatOutput(data, options.format));
      } catch (error) {
        spinner.fail('Failed to check status');
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  program.addCommand(documents);
}
