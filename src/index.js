import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, isConfigured } from './config.js';
import {
  listInvoices,
  getInvoice,
  createInvoice,
  deleteInvoice,
  sendInvoice,
  listPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listBankAccounts,
  getBankAccount,
  createBankAccount,
  getOrganization,
  listCurrencies
} from './api.js';

const program = new Command();

// ============================================================
// Helpers
// ============================================================

function printSuccess(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

function printError(message) {
  console.error(chalk.red('✗') + ' ' + message);
}

function printTable(data, columns) {
  if (!data || data.length === 0) {
    console.log(chalk.yellow('No results found.'));
    return;
  }

  const widths = {};
  columns.forEach(col => {
    widths[col.key] = col.label.length;
    data.forEach(row => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      if (val.length > widths[col.key]) widths[col.key] = val.length;
    });
    widths[col.key] = Math.min(widths[col.key], 40);
  });

  const header = columns.map(col => col.label.padEnd(widths[col.key])).join('  ');
  console.log(chalk.bold(chalk.cyan(header)));
  console.log(chalk.dim('─'.repeat(header.length)));

  data.forEach(row => {
    const line = columns.map(col => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      return val.substring(0, widths[col.key]).padEnd(widths[col.key]);
    }).join('  ');
    console.log(line);
  });

  console.log(chalk.dim(`\n${data.length} result(s)`));
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.stop();
    return result;
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

function requireAuth() {
  if (!isConfigured()) {
    printError('Billingo API key not configured.');
    console.log('\nRun the following to configure:');
    console.log(chalk.cyan('  billingohu config set --api-key <key>'));
    process.exit(1);
  }
}

// ============================================================
// Program metadata
// ============================================================

program
  .name('billingohu')
  .description(chalk.bold('Billingo CLI') + ' - Hungarian invoicing and accounting from your terminal')
  .version('1.0.0');

// ============================================================
// CONFIG
// ============================================================

const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration values')
  .option('--api-key <key>', 'Billingo API Key')
  .action((options) => {
    if (options.apiKey) {
      setConfig('apiKey', options.apiKey);
      printSuccess(`API Key set`);
    } else {
      printError('No API key provided. Use --api-key');
    }
  });

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const apiKey = getConfig('apiKey');

    console.log(chalk.bold('\nBillingo CLI Configuration\n'));
    console.log('API Key: ', apiKey ? chalk.green('*'.repeat(8)) : chalk.red('not set'));
    console.log('');
  });

// ============================================================
// INVOICES
// ============================================================

const invoicesCmd = program.command('invoices').description('Manage invoices');

invoicesCmd
  .command('list')
  .description('List invoices')
  .option('--page <n>', 'Page number', '1')
  .option('--per-page <n>', 'Items per page', '25')
  .option('--type <type>', 'Filter by type (invoice, draft, proforma, etc.)')
  .option('--payment-method <method>', 'Filter by payment method')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const invoices = await withSpinner('Fetching invoices...', () =>
        listInvoices({
          page: parseInt(options.page),
          per_page: parseInt(options.perPage),
          type: options.type,
          payment_method: options.paymentMethod
        })
      );

      if (options.json) {
        printJson(invoices);
        return;
      }

      printTable(invoices, [
        { key: 'id', label: 'ID' },
        { key: 'invoice_number', label: 'Number' },
        { key: 'partner_name', label: 'Partner' },
        { key: 'type', label: 'Type' },
        { key: 'total_gross', label: 'Total', format: (v) => v?.toFixed(2) || '0.00' },
        { key: 'currency', label: 'Currency' },
        { key: 'payment_status', label: 'Payment Status' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

invoicesCmd
  .command('get <invoice-id>')
  .description('Get invoice details')
  .option('--json', 'Output as JSON')
  .action(async (invoiceId, options) => {
    requireAuth();
    try {
      const invoice = await withSpinner('Fetching invoice...', () => getInvoice(invoiceId));

      if (options.json) {
        printJson(invoice);
        return;
      }

      console.log(chalk.bold('\nInvoice Details\n'));
      console.log('ID:             ', chalk.cyan(invoice.id || invoiceId));
      console.log('Invoice Number: ', invoice.invoice_number || 'N/A');
      console.log('Type:           ', invoice.type || 'N/A');
      console.log('Partner:        ', invoice.partner?.name || 'N/A');
      console.log('Total Gross:    ', chalk.bold((invoice.total_gross || 0).toFixed(2)), invoice.currency || '');
      console.log('Payment Status: ', invoice.payment_status || 'N/A');
      console.log('Due Date:       ', invoice.due_date || 'N/A');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

invoicesCmd
  .command('create')
  .description('Create invoice')
  .requiredOption('--data <json>', 'Invoice data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    let invoiceData;
    try {
      invoiceData = JSON.parse(options.data);
    } catch {
      printError('Invalid JSON for --data');
      process.exit(1);
    }

    try {
      const invoice = await withSpinner('Creating invoice...', () => createInvoice(invoiceData));

      if (options.json) {
        printJson(invoice);
        return;
      }

      printSuccess(`Invoice created: ${chalk.bold(invoice.id || 'N/A')}`);
      console.log('Invoice Number: ', invoice.invoice_number || 'N/A');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

invoicesCmd
  .command('delete <invoice-id>')
  .description('Delete invoice')
  .action(async (invoiceId) => {
    requireAuth();
    try {
      await withSpinner('Deleting invoice...', () => deleteInvoice(invoiceId));
      printSuccess('Invoice deleted');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

invoicesCmd
  .command('send <invoice-id>')
  .description('Send invoice via email')
  .requiredOption('--emails <emails>', 'Comma-separated email addresses')
  .action(async (invoiceId, options) => {
    requireAuth();
    const emails = options.emails.split(',').map(e => e.trim());
    try {
      await withSpinner('Sending invoice...', () => sendInvoice(invoiceId, { emails }));
      printSuccess(`Invoice sent to ${emails.join(', ')}`);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// PARTNERS
// ============================================================

const partnersCmd = program.command('partners').description('Manage partners (customers)');

partnersCmd
  .command('list')
  .description('List partners')
  .option('--page <n>', 'Page number', '1')
  .option('--per-page <n>', 'Items per page', '25')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const partners = await withSpinner('Fetching partners...', () =>
        listPartners({
          page: parseInt(options.page),
          per_page: parseInt(options.perPage)
        })
      );

      if (options.json) {
        printJson(partners);
        return;
      }

      printTable(partners, [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'taxcode', label: 'Tax Code' },
        { key: 'city', label: 'City' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

partnersCmd
  .command('get <partner-id>')
  .description('Get partner details')
  .option('--json', 'Output as JSON')
  .action(async (partnerId, options) => {
    requireAuth();
    try {
      const partner = await withSpinner('Fetching partner...', () => getPartner(partnerId));

      if (options.json) {
        printJson(partner);
        return;
      }

      console.log(chalk.bold('\nPartner Details\n'));
      console.log('ID:       ', chalk.cyan(partner.id || partnerId));
      console.log('Name:     ', chalk.bold(partner.name || 'N/A'));
      console.log('Email:    ', partner.email || 'N/A');
      console.log('Tax Code: ', partner.taxcode || 'N/A');
      console.log('Address:  ', partner.address || 'N/A');
      console.log('City:     ', partner.city || 'N/A');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

partnersCmd
  .command('create')
  .description('Create partner')
  .requiredOption('--data <json>', 'Partner data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    let partnerData;
    try {
      partnerData = JSON.parse(options.data);
    } catch {
      printError('Invalid JSON for --data');
      process.exit(1);
    }

    try {
      const partner = await withSpinner('Creating partner...', () => createPartner(partnerData));

      if (options.json) {
        printJson(partner);
        return;
      }

      printSuccess(`Partner created: ${chalk.bold(partner.name || partner.id || 'N/A')}`);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

partnersCmd
  .command('update <partner-id>')
  .description('Update partner')
  .requiredOption('--data <json>', 'Partner data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (partnerId, options) => {
    requireAuth();
    let partnerData;
    try {
      partnerData = JSON.parse(options.data);
    } catch {
      printError('Invalid JSON for --data');
      process.exit(1);
    }

    try {
      const partner = await withSpinner('Updating partner...', () => updatePartner(partnerId, partnerData));

      if (options.json) {
        printJson(partner);
        return;
      }

      printSuccess('Partner updated');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

partnersCmd
  .command('delete <partner-id>')
  .description('Delete partner')
  .action(async (partnerId) => {
    requireAuth();
    try {
      await withSpinner('Deleting partner...', () => deletePartner(partnerId));
      printSuccess('Partner deleted');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// PRODUCTS
// ============================================================

const productsCmd = program.command('products').description('Manage products');

productsCmd
  .command('list')
  .description('List products')
  .option('--page <n>', 'Page number', '1')
  .option('--per-page <n>', 'Items per page', '25')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const products = await withSpinner('Fetching products...', () =>
        listProducts({
          page: parseInt(options.page),
          per_page: parseInt(options.perPage)
        })
      );

      if (options.json) {
        printJson(products);
        return;
      }

      printTable(products, [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'net_unit_price', label: 'Net Price', format: (v) => v?.toFixed(2) || '0.00' },
        { key: 'gross_unit_price', label: 'Gross Price', format: (v) => v?.toFixed(2) || '0.00' },
        { key: 'currency', label: 'Currency' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

productsCmd
  .command('get <product-id>')
  .description('Get product details')
  .option('--json', 'Output as JSON')
  .action(async (productId, options) => {
    requireAuth();
    try {
      const product = await withSpinner('Fetching product...', () => getProduct(productId));

      if (options.json) {
        printJson(product);
        return;
      }

      console.log(chalk.bold('\nProduct Details\n'));
      console.log('ID:          ', chalk.cyan(product.id || productId));
      console.log('Name:        ', chalk.bold(product.name || 'N/A'));
      console.log('Net Price:   ', (product.net_unit_price || 0).toFixed(2), product.currency || '');
      console.log('Gross Price: ', (product.gross_unit_price || 0).toFixed(2), product.currency || '');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

productsCmd
  .command('create')
  .description('Create product')
  .requiredOption('--data <json>', 'Product data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    let productData;
    try {
      productData = JSON.parse(options.data);
    } catch {
      printError('Invalid JSON for --data');
      process.exit(1);
    }

    try {
      const product = await withSpinner('Creating product...', () => createProduct(productData));

      if (options.json) {
        printJson(product);
        return;
      }

      printSuccess(`Product created: ${chalk.bold(product.name || product.id || 'N/A')}`);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

productsCmd
  .command('update <product-id>')
  .description('Update product')
  .requiredOption('--data <json>', 'Product data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (productId, options) => {
    requireAuth();
    let productData;
    try {
      productData = JSON.parse(options.data);
    } catch {
      printError('Invalid JSON for --data');
      process.exit(1);
    }

    try {
      const product = await withSpinner('Updating product...', () => updateProduct(productId, productData));

      if (options.json) {
        printJson(product);
        return;
      }

      printSuccess('Product updated');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

productsCmd
  .command('delete <product-id>')
  .description('Delete product')
  .action(async (productId) => {
    requireAuth();
    try {
      await withSpinner('Deleting product...', () => deleteProduct(productId));
      printSuccess('Product deleted');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// BANK ACCOUNTS
// ============================================================

const bankCmd = program.command('bank-accounts').description('Manage bank accounts');

bankCmd
  .command('list')
  .description('List bank accounts')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const accounts = await withSpinner('Fetching bank accounts...', () => listBankAccounts());

      if (options.json) {
        printJson(accounts);
        return;
      }

      printTable(accounts, [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'account_number', label: 'Account Number' },
        { key: 'currency', label: 'Currency' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

bankCmd
  .command('get <account-id>')
  .description('Get bank account details')
  .option('--json', 'Output as JSON')
  .action(async (accountId, options) => {
    requireAuth();
    try {
      const account = await withSpinner('Fetching bank account...', () => getBankAccount(accountId));

      if (options.json) {
        printJson(account);
        return;
      }

      console.log(chalk.bold('\nBank Account Details\n'));
      console.log('ID:             ', chalk.cyan(account.id || accountId));
      console.log('Name:           ', account.name || 'N/A');
      console.log('Account Number: ', account.account_number || 'N/A');
      console.log('Currency:       ', account.currency || 'N/A');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

bankCmd
  .command('create')
  .description('Create bank account')
  .requiredOption('--data <json>', 'Bank account data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    let accountData;
    try {
      accountData = JSON.parse(options.data);
    } catch {
      printError('Invalid JSON for --data');
      process.exit(1);
    }

    try {
      const account = await withSpinner('Creating bank account...', () => createBankAccount(accountData));

      if (options.json) {
        printJson(account);
        return;
      }

      printSuccess(`Bank account created: ${chalk.bold(account.name || account.id || 'N/A')}`);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// ORGANIZATION
// ============================================================

const orgCmd = program.command('organization').description('Organization information');

orgCmd
  .command('show')
  .description('Show organization details')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const org = await withSpinner('Fetching organization...', () => getOrganization());

      if (options.json) {
        printJson(org);
        return;
      }

      console.log(chalk.bold('\nOrganization Details\n'));
      console.log('ID:   ', chalk.cyan(org.id || 'N/A'));
      console.log('Name: ', chalk.bold(org.name || 'N/A'));
      console.log('Tax:  ', org.tax_number || 'N/A');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

orgCmd
  .command('currencies')
  .description('List supported currencies')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const currencies = await withSpinner('Fetching currencies...', () => listCurrencies());

      if (options.json) {
        printJson(currencies);
        return;
      }

      console.log(chalk.bold('\nSupported Currencies\n'));
      currencies.forEach(curr => {
        console.log(`• ${curr}`);
      });
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// Parse
// ============================================================

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.help();
}
