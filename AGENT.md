# AGENT.md — Billingo API CLI for AI Agents

This document explains how to use the Billingo API CLI as an AI agent.

## Overview

The `billingohu` CLI provides access to the Billingo invoicing and accounting API for Hungarian businesses. Use it to manage invoices, partners, products, and bank accounts.

## Prerequisites

The CLI must be configured with an API key before use:

```bash
billingohu config set --api-key <key>
```

## All Commands

### Config

```bash
billingohu config set --api-key <key>
billingohu config show
```

### Invoices

```bash
# List invoices
billingohu invoices list
billingohu invoices list --page 2 --per-page 50
billingohu invoices list --type invoice --payment-method transfer

# Get invoice
billingohu invoices get <invoice-id>

# Create invoice
billingohu invoices create --data '{...}'

# Send invoice
billingohu invoices send <invoice-id> --emails "client@example.com,billing@example.com"

# Delete invoice
billingohu invoices delete <invoice-id>
```

### Partners

```bash
# List partners
billingohu partners list
billingohu partners list --page 1 --per-page 25

# Get partner
billingohu partners get <partner-id>

# Create partner
billingohu partners create --data '{"name":"Company","email":"contact@example.com"}'

# Update partner
billingohu partners update <partner-id> --data '{...}'

# Delete partner
billingohu partners delete <partner-id>
```

### Products

```bash
# List products
billingohu products list

# Get product
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

# Get bank account
billingohu bank-accounts get <account-id>

# Create bank account
billingohu bank-accounts create --data '{...}'
```

### Organization

```bash
# Show organization
billingohu organization show

# List currencies
billingohu organization currencies
```

## JSON Output

All commands support `--json` for structured output. Always use `--json` when parsing results programmatically:

```bash
billingohu invoices list --json
billingohu partners get <id> --json
billingohu products list --json
```

## Example Workflows

### Create and send invoice

```bash
# Create partner first
PARTNER_ID=$(billingohu partners create \
  --data '{"name":"Client Name","email":"client@example.com"}' \
  --json | jq -r '.id')

# Create invoice
INVOICE_ID=$(billingohu invoices create \
  --data '{
    "partner_id": '$PARTNER_ID',
    "type": "invoice",
    "currency": "HUF",
    "items": [{"name":"Service","net_unit_price":50000,"quantity":1}]
  }' \
  --json | jq -r '.id')

# Send invoice
billingohu invoices send $INVOICE_ID --emails "client@example.com"
```

### List unpaid invoices

```bash
billingohu invoices list --json | jq '.[] | select(.payment_status != "paid")'
```

## Invoice Data Format

When creating invoices, use this structure:

```json
{
  "partner_id": 123,
  "type": "invoice",
  "currency": "HUF",
  "items": [
    {
      "name": "Product/Service Name",
      "net_unit_price": 10000,
      "quantity": 1,
      "unit": "db",
      "vat": "27%"
    }
  ]
}
```

## Tips for Agents

1. Always use `--json` when you need to extract specific fields
2. Partner must exist before creating invoice - create partner first if needed
3. Prices are in the smallest currency unit (e.g., HUF forints)
4. Invoice types: invoice, draft, proforma, receipt, etc.
5. Payment methods: transfer, cash, credit_card, etc.
6. Pagination is available for list commands with --page and --per-page
