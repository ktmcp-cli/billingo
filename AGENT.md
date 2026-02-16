# Billingo CLI - AI Agent Usage Guide

This guide is designed for AI agents (like Claude, GPT-4, etc.) to effectively use the Billingo CLI.

## Quick Start for Agents

### 1. Configuration Check

Before making any API calls, verify the API key is configured:

```bash
billingo config get apiKey
```

If not set, configure it:

```bash
billingo config set apiKey YOUR_API_KEY
```

### 2. Common Workflows

#### Create and Send an Invoice

```bash
# Step 1: Create invoice from JSON
billingo documents create --file invoice.json

# Step 2: Get the document ID from response (e.g., 789)

# Step 3: Download PDF
billingo documents download 789 --output invoice-789.pdf

# Step 4: Send to customer
billingo documents send 789 --emails "customer@example.com"
```

#### List Recent Unpaid Invoices

```bash
billingo documents list \
  --payment-status unpaid \
  --start-date 2024-01-01 \
  --per-page 50 \
  --format json
```

#### Create Partner and Product, Then Invoice

```bash
# Step 1: Create partner
billingo partners create --data '{
  "name": "New Customer Ltd.",
  "address": {
    "country_code": "HU",
    "post_code": "1234",
    "city": "Budapest",
    "address": "Main St 1"
  },
  "emails": ["customer@example.com"]
}'

# Step 2: Get partner ID from response (e.g., 456)

# Step 3: Create document with partner
billingo documents create --file invoice.json
# (invoice.json must include "partner_id": 456)
```

## Output Parsing

### JSON Format (Recommended for Agents)

Always use `--format json` when you need to parse the output programmatically:

```bash
billingo documents list --format json
```

This returns structured JSON that's easy to parse:

```json
{
  "data": [
    {
      "id": 123,
      "invoice_number": "INV-2024-001",
      "partner_name": "Customer Name",
      "total_gross": 127000,
      "currency": "HUF",
      "payment_status": "paid"
    }
  ],
  "current_page": 1,
  "total": 42
}
```

### Pretty Format (Human-Readable)

Default format is good for displaying to users:

```bash
billingo documents get 789
# Returns nicely formatted output for humans
```

## Data Input Methods

### Method 1: File-Based (Recommended for Complex Data)

```bash
# Save data to file
cat > invoice.json << 'EOF'
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
      "name": "Service",
      "unit_price": 50000,
      "quantity": 10,
      "unit": "hour",
      "vat": "27%"
    }
  ]
}
EOF

# Use the file
billingo documents create --file invoice.json
```

### Method 2: Inline JSON (For Simple Data)

```bash
billingo partners create --data '{"name":"Quick Partner","emails":["test@example.com"]}'
```

## Error Handling for Agents

### Check Exit Codes

The CLI uses standard exit codes:
- `0` - Success
- `1` - Error (check stderr for details)

Example in bash:

```bash
if billingo documents get 789 --format json > document.json; then
  echo "Success"
else
  echo "Failed with exit code $?"
fi
```

### Common Error Patterns

**API Key Not Configured:**
```
Error: API key not configured. Set it with: billingo config set apiKey <your-api-key>
```

**Resource Not Found:**
```
Error: Resource not found.
```

**Validation Error:**
```
Error: Validation error: {"field":"partner_id","message":"required"}
```

**Rate Limit:**
```
Error: Rate limit exceeded. Retry after 60 seconds.
```

### Handling Rate Limits

Monitor warnings in stderr:
```
Warning: Only 5/60 API calls remaining in this window
```

Implement exponential backoff:
1. Wait 1 second, retry
2. Wait 2 seconds, retry
3. Wait 4 seconds, retry
4. etc.

## Pagination Best Practices

When listing resources, handle pagination properly:

```bash
# Get first page
billingo documents list --page 1 --per-page 25 --format json > page1.json

# Check if more pages exist (look at "last_page" field)

# Get next page
billingo documents list --page 2 --per-page 25 --format json > page2.json
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "current_page": 1,
  "last_page": 5,
  "per_page": 25,
  "total": 120,
  "next_page_url": "...",
  "prev_page_url": null
}
```

## Resource ID Management

### Getting IDs from Create Operations

When you create a resource, the response includes its ID:

```bash
billingo partners create --file partner.json --format json
# Response: {"id": 456, "name": "...", ...}
```

Extract the ID (example with jq):
```bash
ID=$(billingo partners create --file partner.json --format json | jq -r '.id')
echo "Created partner with ID: $ID"
```

### Converting Legacy IDs

If you have IDs from Billingo API v2:

```bash
billingo utils convert-id 12345 --format json
```

## Complete Invoice Workflow Example

Here's a complete workflow an agent might execute:

```bash
# 1. Check organization setup
billingo organization get --format json > org.json

# 2. List available document blocks (invoice pads)
billingo document-blocks list --format json > blocks.json

# 3. Get or create partner
billingo partners list --format json > partners.json
# If partner doesn't exist, create:
billingo partners create --file new-partner.json --format json

# 4. Prepare invoice data with correct IDs
cat > invoice.json << 'EOF'
{
  "vendor_id": 1,
  "partner_id": 456,
  "block_id": 1,
  "type": "invoice",
  "fulfillment_date": "2024-01-15",
  "due_date": "2024-01-30",
  "payment_method": "transfer",
  "language": "hu",
  "currency": "HUF",
  "items": [
    {
      "name": "Web Development",
      "unit_price": 50000,
      "quantity": 10,
      "unit": "hour",
      "vat": "27%"
    }
  ]
}
EOF

# 5. Create invoice
billingo documents create --file invoice.json --format json > created-invoice.json

# 6. Get document ID
DOC_ID=$(jq -r '.id' created-invoice.json)

# 7. Download PDF
billingo documents download "$DOC_ID" --output "invoice-$DOC_ID.pdf"

# 8. Send to customer
billingo documents send "$DOC_ID" --emails "customer@example.com"

# 9. Get public URL for customer portal
billingo documents public-url "$DOC_ID" --format json
```

## Field Validation Tips

### Required Fields by Resource

**Partner (Minimum):**
- `name` (string)
- `address.country_code` (string, ISO 3166-1 alpha-2)
- `emails` (array of strings) OR `phone` (string)

**Document (Invoice):**
- `vendor_id` (integer) - Your organization ID
- `partner_id` (integer) - Customer ID
- `block_id` (integer) - Document block/pad ID
- `type` (string) - "invoice", "proforma", etc.
- `fulfillment_date` (date, YYYY-MM-DD)
- `due_date` (date, YYYY-MM-DD)
- `payment_method` (string) - "transfer", "cash", "card", etc.
- `language` (string) - "hu", "en", "de", etc.
- `currency` (string) - ISO 4217 code
- `items` (array) - At least one item

**Product:**
- `name` (string)
- `unit_price` (number)
- `unit` (string) - "piece", "hour", etc.
- `vat` (string) - "27%", "18%", "5%", "0%", "EU", "TAM", etc.

### Common Hungarian VAT Rates

- `27%` - Standard rate
- `18%` - Reduced rate (some foods, accommodation)
- `5%` - Super-reduced rate (medicines, books)
- `0%` - Zero-rated
- `EU` - Intra-EU supply
- `TAM` - Reverse charge (buyer pays VAT)
- `AAM` - Special case
- `FAD` - Agricultural products

### Date Formats

All dates must be in `YYYY-MM-DD` format:
- `2024-01-15` ✓
- `01/15/2024` ✗
- `15.01.2024` ✗

## Currency Support

Supported currencies (ISO 4217):
```
HUF, EUR, USD, GBP, CHF, AUD, CAD, DKK, NOK, SEK,
CZK, PLN, RON, BGN, HRK, RSD, RUB, UAH, CNY, JPY,
KRW, INR, BRL, MXN, ZAR, TRY, SGD, NZD, HKD, THB,
MYR, PHP, IDR, AED, SAR, ILS, EGP
```

Get conversion rates:
```bash
billingo currencies convert --from HUF --to EUR --format json
```

## Payment Methods

Common payment methods:
- `transfer` - Bank transfer
- `cash` - Cash payment
- `card` - Card payment
- `cheque` - Cheque
- `cod` - Cash on delivery
- `paypal` - PayPal
- `other` - Other method

## Document Types

- `invoice` - Regular invoice
- `proforma` - Proforma invoice
- `advance` - Advance invoice
- `draft` - Draft document

## Best Practices for Agents

1. **Always use JSON format for parsing**: Add `--format json` to commands when you need to process the output
2. **Handle errors gracefully**: Check exit codes and parse error messages
3. **Respect rate limits**: Monitor warnings and implement backoff strategies
4. **Validate data before creation**: Check required fields match the API spec
5. **Store IDs for reference**: Keep track of created resource IDs for subsequent operations
6. **Use file-based input for complex data**: It's more reliable than inline JSON for large payloads
7. **Test with list commands first**: Before creating resources, list existing ones to understand the data structure
8. **Download invoices after creation**: Always download PDFs and store them securely

## Debugging Tips

### Enable Verbose Output

For debugging, you can inspect the full API response:

```bash
billingo documents get 789 --format json | jq '.'
```

### Check Configuration

```bash
billingo config list
```

### Test API Connection

```bash
billingo organization get
```

If this works, your API key is valid and the connection is working.

## API Rate Limits

The Billingo API has rate limits (typically 60 requests per minute). The CLI:
- Shows warnings when you're close to the limit
- Includes rate limit info in response headers
- Provides clear error messages when rate limited

Monitor your usage and implement delays between batch operations.

## Security Notes

- Never log or expose API keys in plain text
- Store API keys securely using the config system or environment variables
- Don't commit API keys to version control
- Use read-only API keys when possible (if Billingo supports different permission levels)

## Getting Help

For any command, use `--help`:

```bash
billingo --help
billingo documents --help
billingo documents create --help
```

This provides up-to-date information about available options and usage.
