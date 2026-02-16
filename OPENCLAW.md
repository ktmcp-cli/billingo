# Billingo CLI - OpenClaw Integration Guide

This guide shows how to integrate the Billingo CLI with OpenClaw for AI-driven invoicing automation.

## What is OpenClaw?

OpenClaw is a framework for building AI agents with tool access. Instead of using MCP (Model Context Protocol), OpenClaw embraces the Unix philosophy: CLI tools are better than proprietary abstractions.

## Why This CLI Works Perfectly with OpenClaw

1. **Zero Configuration**: No server to run, no MCP gateway to configure
2. **Standard Interface**: Uses stdin/stdout/stderr like any Unix tool
3. **Structured Output**: JSON format for machine parsing, pretty format for humans
4. **Self-Documenting**: `--help` text provides complete API documentation
5. **Composable**: Works with pipes, scripts, and other CLI tools

## Installation for OpenClaw

```bash
# Install the CLI
npm install -g @ktmcp-cli/billingo

# Configure API key
billingo config set apiKey YOUR_API_KEY

# Verify installation
billingo organization get
```

## Tool Configuration

### Option 1: Direct Shell Access

If your OpenClaw agent has shell access, it can use the CLI directly:

```python
# In your OpenClaw agent
result = await shell.execute("billingo documents list --format json")
documents = json.loads(result.stdout)
```

### Option 2: Wrapped Tool

Create a Python wrapper for type-safe access:

```python
# tools/billingo.py
import json
import subprocess
from typing import List, Dict, Any, Optional

class BillingoTool:
    """Billingo API access via CLI"""

    def __init__(self, api_key: Optional[str] = None):
        if api_key:
            subprocess.run(["billingo", "config", "set", "apiKey", api_key])

    def _run(self, args: List[str], format: str = "json") -> Any:
        """Execute CLI command and return parsed result"""
        cmd = ["billingo"] + args + ["--format", format]
        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            raise Exception(f"Billingo CLI error: {result.stderr}")

        if format == "json":
            return json.loads(result.stdout)
        return result.stdout

    # Documents
    def list_documents(self, page: int = 1, per_page: int = 25, **filters) -> Dict:
        """List all documents with optional filters"""
        args = ["documents", "list", "--page", str(page), "--per-page", str(per_page)]

        # Add filters
        if "partner_id" in filters:
            args += ["--partner-id", str(filters["partner_id"])]
        if "payment_status" in filters:
            args += ["--payment-status", filters["payment_status"]]
        if "start_date" in filters:
            args += ["--start-date", filters["start_date"]]
        if "end_date" in filters:
            args += ["--end-date", filters["end_date"]]

        return self._run(args)

    def get_document(self, doc_id: int) -> Dict:
        """Get document by ID"""
        return self._run(["documents", "get", str(doc_id)])

    def create_document(self, data: Dict) -> Dict:
        """Create a new document"""
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(data, f)
            f.flush()
            result = self._run(["documents", "create", "--file", f.name])
        return result

    def cancel_document(self, doc_id: int) -> Dict:
        """Cancel a document"""
        return self._run(["documents", "cancel", str(doc_id)])

    def download_document(self, doc_id: int, output_path: str) -> str:
        """Download document PDF"""
        self._run(["documents", "download", str(doc_id), "--output", output_path], format="pretty")
        return output_path

    def send_document(self, doc_id: int, emails: List[str]) -> Dict:
        """Send document via email"""
        return self._run(["documents", "send", str(doc_id), "--emails", ",".join(emails)])

    # Partners
    def list_partners(self, page: int = 1, per_page: int = 25) -> Dict:
        """List all partners"""
        return self._run(["partners", "list", "--page", str(page), "--per-page", str(per_page)])

    def get_partner(self, partner_id: int) -> Dict:
        """Get partner by ID"""
        return self._run(["partners", "get", str(partner_id)])

    def create_partner(self, data: Dict) -> Dict:
        """Create a new partner"""
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(data, f)
            f.flush()
            result = self._run(["partners", "create", "--file", f.name])
        return result

    # Products
    def list_products(self, page: int = 1, per_page: int = 25) -> Dict:
        """List all products"""
        return self._run(["products", "list", "--page", str(page), "--per-page", str(per_page)])

    def create_product(self, data: Dict) -> Dict:
        """Create a new product"""
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(data, f)
            f.flush()
            result = self._run(["products", "create", "--file", f.name])
        return result

    # Bank Accounts
    def list_bank_accounts(self, page: int = 1, per_page: int = 25) -> Dict:
        """List all bank accounts"""
        return self._run(["bank-accounts", "list", "--page", str(page), "--per-page", str(per_page)])

    # Currencies
    def convert_currency(self, from_currency: str, to_currency: str) -> Dict:
        """Get currency conversion rate"""
        return self._run(["currencies", "convert", "--from", from_currency, "--to", to_currency])

    # Organization
    def get_organization(self) -> Dict:
        """Get organization data"""
        return self._run(["organization", "get"])
```

## Example OpenClaw Agent

Here's a complete example of an OpenClaw agent that handles invoicing:

```python
# agents/invoice_agent.py
from openclaw import Agent, tool
from tools.billingo import BillingoTool

class InvoiceAgent(Agent):
    """AI agent for managing invoices via Billingo"""

    def __init__(self):
        super().__init__()
        self.billingo = BillingoTool()

    @tool
    async def create_invoice(
        self,
        customer_name: str,
        customer_email: str,
        items: List[Dict],
        due_days: int = 15
    ) -> str:
        """
        Create and send an invoice to a customer.

        Args:
            customer_name: Customer company name
            customer_email: Customer email address
            items: List of invoice items [{"name": "...", "quantity": 1, "unit_price": 100, ...}]
            due_days: Days until payment is due (default: 15)

        Returns:
            Invoice ID and public URL
        """
        from datetime import datetime, timedelta

        # Find or create partner
        partners = self.billingo.list_partners(per_page=100)
        partner = None
        for p in partners.get("data", []):
            if p["name"] == customer_name:
                partner = p
                break

        if not partner:
            # Create new partner
            partner = self.billingo.create_partner({
                "name": customer_name,
                "emails": [customer_email],
                "address": {
                    "country_code": "HU",
                    "post_code": "1234",
                    "city": "Budapest",
                    "address": "Address TBD"
                }
            })

        # Get organization details for vendor_id
        org = self.billingo.get_organization()
        vendor_id = org["id"]

        # Get first document block
        blocks = self.billingo._run(["document-blocks", "list"])
        block_id = blocks["data"][0]["id"]

        # Prepare invoice data
        today = datetime.now().date()
        due_date = today + timedelta(days=due_days)

        invoice_data = {
            "vendor_id": vendor_id,
            "partner_id": partner["id"],
            "block_id": block_id,
            "type": "invoice",
            "fulfillment_date": today.isoformat(),
            "due_date": due_date.isoformat(),
            "payment_method": "transfer",
            "language": "en",
            "currency": "HUF",
            "items": items
        }

        # Create invoice
        invoice = self.billingo.create_document(invoice_data)
        invoice_id = invoice["id"]

        # Send to customer
        self.billingo.send_document(invoice_id, [customer_email])

        # Get public URL
        public_url = self.billingo._run(["documents", "public-url", str(invoice_id)])

        return f"Invoice {invoice_id} created and sent to {customer_email}. " \
               f"Public URL: {public_url['public_url']}"

    @tool
    async def list_unpaid_invoices(self) -> str:
        """List all unpaid invoices"""
        docs = self.billingo.list_documents(
            per_page=100,
            payment_status="unpaid"
        )

        if not docs.get("data"):
            return "No unpaid invoices found."

        result = "Unpaid Invoices:\n\n"
        for doc in docs["data"]:
            result += f"- Invoice {doc['invoice_number']}: {doc['partner_name']} - " \
                     f"{doc['total_gross']} {doc['currency']} (Due: {doc['due_date']})\n"

        return result

    @tool
    async def send_invoice_reminder(self, invoice_id: int) -> str:
        """Send a payment reminder for an invoice"""
        # Get invoice details
        doc = self.billingo.get_document(invoice_id)

        # Send reminder
        emails = [email for email in doc["partner"]["emails"]]
        self.billingo.send_document(invoice_id, emails)

        return f"Reminder sent for invoice {doc['invoice_number']} to {', '.join(emails)}"

    @tool
    async def get_invoice_status(self, invoice_number: str) -> str:
        """Get the status of an invoice by number"""
        # Search for invoice
        docs = self.billingo.list_documents(per_page=100)

        for doc in docs.get("data", []):
            if doc["invoice_number"] == invoice_number:
                return f"Invoice {invoice_number}:\n" \
                       f"Customer: {doc['partner_name']}\n" \
                       f"Amount: {doc['total_gross']} {doc['currency']}\n" \
                       f"Status: {doc['payment_status']}\n" \
                       f"Due: {doc['due_date']}"

        return f"Invoice {invoice_number} not found."
```

## Usage Example

```python
# main.py
from agents.invoice_agent import InvoiceAgent

async def main():
    agent = InvoiceAgent()

    # User request: "Create an invoice for Acme Corp"
    response = await agent.run(
        "Create an invoice for Acme Corp (acme@example.com) for 10 hours of consulting at 50000 HUF/hour with 27% VAT"
    )

    print(response)
    # Output: Invoice 123 created and sent to acme@example.com. Public URL: https://...

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

## Environment Variables

Set these for containerized deployments:

```bash
export BILLINGO_API_KEY=your_api_key_here
export BILLINGO_BASE_URL=https://api.billingo.hu/v3
```

The CLI will automatically use these if no config is set.

## Docker Integration

```dockerfile
FROM node:18-alpine

# Install CLI
RUN npm install -g @ktmcp-cli/billingo

# Install Python for OpenClaw
RUN apk add --no-cache python3 py3-pip

# Copy your OpenClaw agent
COPY . /app
WORKDIR /app

# Install Python dependencies
RUN pip3 install -r requirements.txt

# Set environment
ENV BILLINGO_API_KEY=${BILLINGO_API_KEY}

# Run your agent
CMD ["python3", "main.py"]
```

## Error Handling

The wrapper should handle CLI errors gracefully:

```python
def _run(self, args: List[str], format: str = "json") -> Any:
    """Execute CLI command with error handling"""
    cmd = ["billingo"] + args + ["--format", format]
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        error_msg = result.stderr

        # Parse specific errors
        if "API key not configured" in error_msg:
            raise ValueError("Billingo API key not configured")
        elif "Rate limit exceeded" in error_msg:
            raise RateLimitError("API rate limit exceeded")
        elif "Resource not found" in error_msg:
            raise NotFoundError("Resource not found")
        else:
            raise Exception(f"Billingo API error: {error_msg}")

    if format == "json":
        try:
            return json.loads(result.stdout)
        except json.JSONDecodeError:
            raise Exception(f"Invalid JSON response: {result.stdout}")

    return result.stdout
```

## Advanced: Streaming Output

For long-running operations, stream output to the user:

```python
import subprocess

def create_invoice_with_progress(data: Dict) -> Dict:
    """Create invoice with progress updates"""
    import tempfile

    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(data, f)
        f.flush()

        # Stream output line by line
        process = subprocess.Popen(
            ["billingo", "documents", "create", "--file", f.name],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        # Read stderr for progress (ora spinner output)
        for line in process.stderr:
            print(f"Progress: {line.strip()}")

        stdout, _ = process.communicate()

        if process.returncode != 0:
            raise Exception("Invoice creation failed")

        return json.loads(stdout)
```

## Testing

Test your integration without API calls:

```python
import unittest
from unittest.mock import patch, MagicMock

class TestBillingoTool(unittest.TestCase):
    @patch('subprocess.run')
    def test_list_documents(self, mock_run):
        # Mock CLI response
        mock_run.return_value = MagicMock(
            returncode=0,
            stdout='{"data":[{"id":123}]}'
        )

        tool = BillingoTool()
        result = tool.list_documents()

        self.assertEqual(result["data"][0]["id"], 123)
        mock_run.assert_called_once()
```

## Best Practices

1. **Cache Organization Data**: Call `get_organization()` once and cache the result
2. **Reuse Partner IDs**: Search for existing partners before creating new ones
3. **Handle Rate Limits**: Implement exponential backoff for batch operations
4. **Validate Before Creating**: Check data structure before calling create commands
5. **Store Invoice PDFs**: Download and archive PDFs for record-keeping
6. **Use Transactions**: Group related operations (create partner → create invoice → send)
7. **Log Everything**: Keep audit logs of all invoice operations

## Troubleshooting

### CLI Not Found

```bash
# Check installation
which billingo

# Reinstall if needed
npm install -g @ktmcp-cli/billingo
```

### API Key Issues

```bash
# Verify API key is set
billingo config get apiKey

# Test connection
billingo organization get
```

### Permission Errors

Make sure the OpenClaw agent has execute permissions:

```bash
chmod +x $(which billingo)
```

## Further Reading

- [README.md](./README.md) - General CLI usage
- [AGENT.md](./AGENT.md) - AI agent usage patterns
- [Billingo API Docs](https://api.billingo.hu/v3/swagger)

## Support

For issues specific to OpenClaw integration, please check the OpenClaw documentation or open an issue in the CLI repository.
