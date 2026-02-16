# Billingo CLI

Production-ready command-line interface for the [Billingo API v3](https://www.billingo.hu/) - Hungarian invoicing and billing automation.

## Features

- Complete coverage of Billingo API v3 endpoints
- Simple, intuitive command structure
- JSON and pretty-print output formats
- File-based and inline data input
- Comprehensive error handling with rate limit management
- Persistent configuration storage
- Progress indicators for long-running operations

## Why CLI > MCP

### The MCP Problem

Model Context Protocol (MCP) servers introduce unnecessary complexity and failure points for API access:

1. **Extra Infrastructure Layer**: MCP requires running a separate server process that sits between your AI agent and the API
2. **Cognitive Overhead**: Agents must learn MCP-specific tool schemas on top of the actual API semantics
3. **Debugging Nightmare**: When things fail, you're debugging three layers (AI → MCP → API) instead of two (AI → API)
4. **Limited Flexibility**: MCP servers often implement a subset of API features, forcing you to extend or work around limitations
5. **Maintenance Burden**: Every API change requires updating both the MCP server and documentation

### The CLI Advantage

A well-designed CLI is the superior abstraction for AI agents:

1. **Zero Runtime Dependencies**: No server process to start, monitor, or crash
2. **Direct API Access**: One hop from agent to API with transparent HTTP calls
3. **Human + AI Usable**: Same tool works perfectly for both developers and agents
4. **Self-Documenting**: Built-in `--help` text provides complete usage information
5. **Composable**: Standard I/O allows piping, scripting, and integration with other tools
6. **Better Errors**: Direct error messages from the API without translation layers
7. **Instant Debugging**: `--format json` gives you the exact API response for inspection

**Example Complexity Comparison:**

MCP approach:
```
AI Agent → MCP Tool Schema → MCP Server → HTTP Request → API → Response Chain (reverse)
```

CLI approach:
```
AI Agent → Shell Command → HTTP Request → API → Direct Response
```

The CLI is simpler, faster, more reliable, and easier to debug.

## Installation

```bash
npm install -g @ktmcp-cli/billingo
```

Or install locally:

```bash
cd billingo
npm install
npm link
```

## Configuration

### Set API Key

Get your API key from https://app.billingo.hu/api-key

```bash
billingo config set apiKey YOUR_API_KEY_HERE
```

### Environment Variables

Alternatively, use environment variables:

```bash
export BILLINGO_API_KEY=your_api_key_here
export BILLINGO_BASE_URL=https://api.billingo.hu/v3  # Optional
```

### View Configuration

```bash
# Show all config
billingo config list

# Get specific value
billingo config get apiKey

# Clear all config
billingo config clear
```

## Usage

### General Syntax

```bash
billingo <resource> <action> [options]
```

### Available Resources

- `bank-accounts` (alias: `banks`) - Manage bank accounts
- `documents` (alias: `docs`) - Manage invoices and documents
- `document-blocks` (alias: `blocks`) - Manage invoice pads
- `partners` - Manage customers and suppliers
- `products` - Manage product catalog
- `currencies` (alias: `currency`) - Currency conversion
- `organization` (alias: `org`) - Organization information
- `utils` - Utility functions

### Global Options

- `-f, --format <format>` - Output format: `json` or `pretty` (default: pretty)
- `-h, --help` - Display help for command
- `-v, --version` - Output version number

## Examples

### Bank Accounts

```bash
# List all bank accounts
billingo bank-accounts list

# Get specific account
billingo bank-accounts get 123

# Create from JSON file
billingo bank-accounts create --file account.json

# Create from inline JSON
billingo bank-accounts create --data '{"name":"Main Account","account_number":"12345678"}'

# Update account
billingo bank-accounts update 123 --file updated-account.json

# Delete account
billingo bank-accounts delete 123
```

### Documents (Invoices)

```bash
# List all documents
billingo documents list --page 1 --per-page 25

# Filter documents
billingo documents list \
  --partner-id 456 \
  --payment-status paid \
  --start-date 2024-01-01 \
  --end-date 2024-12-31

# Get specific document
billingo documents get 789

# Create document
billingo documents create --file invoice.json

# Cancel document
billingo documents cancel 789

# Download PDF
billingo documents download 789 --output invoice-789.pdf

# Send via email
billingo documents send 789 --emails "customer@example.com,accounting@example.com"

# Get public download URL
billingo documents public-url 789

# Get payment history
billingo documents payments 789

# Update payment history
billingo documents update-payments 789 --file payments.json

# Check Online Számla status
billingo documents online-szamla 789
```

### Partners

```bash
# List partners
billingo partners list

# Get partner
billingo partners get 456

# Create partner
billingo partners create --file partner.json

# Update partner
billingo partners update 456 --data '{"name":"Updated Name"}'

# Delete partner
billingo partners delete 456
```

### Products

```bash
# List products
billingo products list

# Get product
billingo products get 321

# Create product
billingo products create --file product.json

# Update product
billingo products update 321 --file updated-product.json

# Delete product
billingo products delete 321
```

### Currency Conversion

```bash
# Get conversion rate
billingo currencies convert --from HUF --to EUR

# Get rate in JSON format
billingo currencies convert --from USD --to HUF --format json
```

### Organization

```bash
# Get organization data
billingo organization get

# JSON output
billingo organization get --format json
```

### Utilities

```bash
# Convert legacy API ID to v3
billingo utils convert-id 12345
```

### Document Blocks

```bash
# List invoice pads
billingo document-blocks list
```

## Data Formats

### Creating a Document (Invoice)

Example `invoice.json`:

```json
{
  "vendor_id": 1,
  "partner_id": 123,
  "block_id": 1,
  "type": "invoice",
  "fulfillment_date": "2024-01-15",
  "due_date": "2024-01-30",
  "payment_method": "transfer",
  "language": "hu",
  "currency": "HUF",
  "items": [
    {
      "name": "Web Development Service",
      "unit_price": 50000,
      "quantity": 10,
      "unit": "hour",
      "vat": "27%"
    }
  ]
}
```

### Creating a Partner

Example `partner.json`:

```json
{
  "name": "Example Company Ltd.",
  "address": {
    "country_code": "HU",
    "post_code": "1234",
    "city": "Budapest",
    "address": "Example Street 42"
  },
  "emails": ["contact@example.com"],
  "taxcode": "12345678-1-23"
}
```

### Creating a Bank Account

Example `account.json`:

```json
{
  "name": "Main Business Account",
  "account_number": "12345678-12345678",
  "account_number_iban": "HU42123456781234567812345678",
  "swift": "ABCDHUHB",
  "currency": "HUF",
  "need_qr": true
}
```

## Error Handling

The CLI provides clear error messages for common issues:

- **401 Unauthorized** - Check your API key
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource doesn't exist
- **422 Validation Error** - Invalid data format
- **429 Rate Limit** - Too many requests (shows retry time)
- **500 Server Error** - Billingo API issue

## Rate Limiting

The API includes rate limit headers in responses:
- `X-RateLimit-Limit` - Requests allowed per window
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - Reset timestamp

The CLI warns you when fewer than 10 requests remain.

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev -- documents list

# Run directly
node bin/billingo.js documents list
```

## API Documentation

- Official API Docs: https://api.billingo.hu/v3/swagger
- Support: https://support.billingo.hu/content/446136358
- Generate API Key: https://app.billingo.hu/api-key

## Supported Currencies

The API supports 37 currencies including:
HUF, EUR, USD, GBP, CHF, AUD, CAD, DKK, NOK, SEK, CZK, PLN, RON, BGN, HRK, RSD, and more.

## License

MIT

## Support

For issues and feature requests, please contact support or refer to the official Billingo documentation.
