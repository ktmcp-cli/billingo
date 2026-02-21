# Billingo API CLI

> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

A production-ready command-line interface for the Billingo API v3. Manage invoices, partners, products, and bank accounts for Hungarian businesses directly from your terminal.

> **Disclaimer**: This is an unofficial CLI tool and is not affiliated with, endorsed by, or supported by Billingo.

## Features

- **Invoices** — Create, list, send, and manage invoices
- **Partners** — Manage customers and suppliers
- **Products** — Maintain product catalog
- **Bank Accounts** — Manage payment accounts
- **Organization** — View organization details and supported currencies
- **JSON output** — All commands support `--json` for scripting

## Why CLI > MCP

MCP servers are complex, stateful, and require a running server process. A CLI is:

- **Simpler** — Just a binary you call directly
- **Composable** — Pipe output to `jq`, `grep`, `awk`, and other tools
- **Scriptable** — Use in shell scripts, CI/CD pipelines, cron jobs
- **Debuggable** — See exactly what's happening with `--json` flag
- **AI-friendly** — AI agents can call CLIs just as easily as MCPs, with less overhead

## Installation

```bash
npm install -g @ktmcp-cli/billingohu
```

## Authentication Setup

Configure your Billingo API key:

```bash
billingohu config set --api-key YOUR_API_KEY
```

Get your API key from [app.billingo.hu/api](https://app.billingo.hu/api)

## Commands

### Configuration

```bash
# Set API key
billingohu config set --api-key <key>

# Show current config
billingohu config show
```

### Invoices

```bash
# List invoices
billingohu invoices list
billingohu invoices list --type invoice --payment-method transfer

# Get invoice details
billingohu invoices get <invoice-id>

# Create invoice
billingohu invoices create --data '{...}'

# Send invoice via email
billingohu invoices send <invoice-id> --emails "client@example.com"

# Delete invoice
billingohu invoices delete <invoice-id>
```

### Partners (Customers/Suppliers)

```bash
# List partners
billingohu partners list

# Get partner details
billingohu partners get <partner-id>

# Create partner
billingohu partners create --data '{"name":"Acme Corp","email":"contact@acme.com"}'

# Update partner
billingohu partners update <partner-id> --data '{...}'

# Delete partner
billingohu partners delete <partner-id>
```

### Products

```bash
# List products
billingohu products list

# Get product details
billingohu products get <product-id>

# Create product
billingohu products create --data '{"name":"Service","net_unit_price":10000,"currency":"HUF"}'

# Update product
billingohu products update <product-id> --data '{...}'

# Delete product
billingohu products delete <product-id>
```

### Bank Accounts

```bash
# List bank accounts
billingohu bank-accounts list

# Get account details
billingohu bank-accounts get <account-id>

# Create bank account
billingohu bank-accounts create --data '{...}'
```

### Organization

```bash
# Show organization details
billingohu organization show

# List supported currencies
billingohu organization currencies
```

## JSON Output

All commands support `--json` for machine-readable output:

```bash
# List invoices as JSON
billingohu invoices list --json

# Pipe to jq for filtering
billingohu invoices list --json | jq '.[] | select(.payment_status == "paid")'

# Get partner details
billingohu partners get <id> --json
```

## Examples

### Create invoice workflow

```bash
# First, create a partner
PARTNER_ID=$(billingohu partners create \
  --data '{"name":"Acme Corp","email":"billing@acme.com","city":"Budapest"}' \
  --json | jq -r '.id')

# Create invoice
billingohu invoices create --data '{
  "partner_id": '$PARTNER_ID',
  "type": "invoice",
  "currency": "HUF",
  "items": [
    {
      "name": "Consulting Services",
      "net_unit_price": 100000,
      "quantity": 1
    }
  ]
}'

# Send invoice
billingohu invoices send <invoice-id> --emails "billing@acme.com"
```

### List unpaid invoices

```bash
billingohu invoices list --json | jq '.[] | select(.payment_status != "paid") | {id, invoice_number, partner_name, total_gross}'
```

## Contributing

Issues and pull requests are welcome at [github.com/ktmcp-cli/billingohu](https://github.com/ktmcp-cli/billingohu).

## License

MIT — see [LICENSE](LICENSE) for details.

---

Part of the [KTMCP CLI](https://killthemcp.com) project — replacing MCPs with simple, composable CLIs.

## Support This Project

If you find this CLI useful, we'd appreciate support across Reddit, Twitter, Hacker News, or Moltbook. Please be mindful - these are real community accounts. Contributors who can demonstrate their support helped advance KTMCP will have their PRs and feature requests prioritized.
