# Billingo CLI - Quick Start Guide

Get started with the Billingo CLI in 5 minutes.

## Step 1: Install

```bash
cd billingo
npm install
npm link
```

## Step 2: Configure API Key

Get your API key from https://app.billingo.hu/api-key

```bash
billingo config set apiKey YOUR_API_KEY_HERE
```

## Step 3: Verify Setup

```bash
billingo organization get
```

You should see your organization details.

## Step 4: Explore Your Data

```bash
# List document blocks (invoice pads)
billingo document-blocks list

# List partners
billingo partners list

# List products
billingo products list

# List bank accounts
billingo bank-accounts list
```

## Step 5: Create Your First Invoice

### 5.1: Find or Create a Partner

```bash
# List existing partners
billingo partners list --format json

# Or create a new partner
billingo partners create --file examples/partner.json
```

Note the partner ID from the output.

### 5.2: Get Required IDs

```bash
# Get organization ID (vendor_id)
billingo organization get --format json | grep '"id"'

# Get document block ID (block_id)
billingo document-blocks list --format json
```

### 5.3: Prepare Invoice Data

Edit `examples/invoice.json` with the correct IDs:

```json
{
  "vendor_id": 1,           // Your organization ID
  "partner_id": 123,        // Customer ID from step 5.1
  "block_id": 1,            // Document block ID
  "type": "invoice",
  "fulfillment_date": "2024-01-15",
  "due_date": "2024-01-30",
  "payment_method": "transfer",
  "language": "en",
  "currency": "HUF",
  "items": [
    {
      "name": "Web Development Service",
      "unit_price": 50000,
      "unit_price_type": "gross",
      "quantity": 10,
      "unit": "hour",
      "vat": "27%"
    }
  ]
}
```

### 5.4: Create the Invoice

```bash
billingo documents create --file examples/invoice.json
```

Note the document ID from the output (e.g., 789).

### 5.5: Download and Send

```bash
# Download PDF
billingo documents download 789 --output invoice-789.pdf

# Send to customer
billingo documents send 789 --emails "customer@example.com"

# Get public URL
billingo documents public-url 789
```

## Common Tasks

### List Unpaid Invoices

```bash
billingo documents list --payment-status unpaid
```

### Filter Invoices by Date

```bash
billingo documents list \
  --start-date 2024-01-01 \
  --end-date 2024-12-31 \
  --format json
```

### Cancel an Invoice

```bash
billingo documents cancel 789
```

### Currency Conversion

```bash
billingo currencies convert --from HUF --to EUR
```

### Update Partner Details

```bash
# Get current partner data
billingo partners get 123 --format json > partner-123.json

# Edit partner-123.json

# Update
billingo partners update 123 --file partner-123.json
```

### Create Product for Reuse

```bash
billingo products create --file examples/product.json
```

## Tips

1. **Always use `--format json`** when you need to parse output programmatically
2. **Use files for complex data** instead of inline JSON
3. **Check `--help`** for any command to see all available options
4. **Store document IDs** after creation for later reference
5. **Download PDFs immediately** after creating invoices

## Troubleshooting

### API Key Not Working

```bash
# Check configuration
billingo config list

# Reset API key
billingo config set apiKey NEW_API_KEY

# Test
billingo organization get
```

### Rate Limit Hit

Wait for the time specified in the error message, then retry.

### Validation Error

Check the error message for which field is invalid. Compare your JSON with the examples in the `examples/` directory.

## Next Steps

- Read [README.md](./README.md) for complete documentation
- Read [AGENT.md](./AGENT.md) for AI agent integration patterns
- Read [OPENCLAW.md](./OPENCLAW.md) for OpenClaw integration
- Check the [official API docs](https://api.billingo.hu/v3/swagger)

## Need Help?

```bash
# Show all commands
billingo --help

# Show command-specific help
billingo documents --help
billingo documents create --help
```
