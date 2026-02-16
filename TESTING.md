# Billingo CLI - Testing & Validation Guide

This guide helps you test and validate the Billingo CLI before deployment.

## Pre-Installation Tests

### 1. File Structure Validation

```bash
cd /workspace/group/ktmcp/workspace/billingo

# Verify all files exist
ls -la bin/billingo.js
ls -la src/lib/*.js
ls -la src/commands/*.js
ls -la examples/*.json

# Check executable permissions
test -x bin/billingo.js && echo "✓ CLI is executable" || echo "✗ CLI not executable"

# Verify package.json
cat package.json | grep -q '"name": "@ktmcp-cli/billingo"' && echo "✓ Package name correct"
```

### 2. Syntax Validation

```bash
# Check for syntax errors in all JS files
for file in bin/*.js src/**/*.js; do
  node --check "$file" && echo "✓ $file" || echo "✗ $file has syntax errors"
done
```

### 3. JSON Validation

```bash
# Validate all JSON files
for file in examples/*.json; do
  node -e "JSON.parse(require('fs').readFileSync('$file'))" && echo "✓ $file" || echo "✗ $file invalid"
done
```

## Installation Tests

### 1. Install Dependencies

```bash
cd /workspace/group/ktmcp/workspace/billingo
npm install
```

Expected output:
```
added X packages in Xs
```

### 2. Link CLI Globally

```bash
npm link
```

Expected output:
```
added 1 package
```

### 3. Verify Installation

```bash
which billingo
# Should show: /usr/local/bin/billingo or similar

billingo --version
# Should show: 1.0.0

billingo --help
# Should show full help text
```

## Configuration Tests

### 1. Config Management

```bash
# Test config set
billingo config set testKey testValue
billingo config get testKey
# Expected output: testValue

# Test config list
billingo config list
# Should show JSON with testKey

# Test config clear
billingo config clear
billingo config list
# Should show empty config
```

### 2. API Key Configuration

```bash
# Set API key (use a test key if available)
billingo config set apiKey YOUR_TEST_API_KEY

# Verify it's saved
billingo config get apiKey
# Should show your API key (first few chars visible)
```

### 3. Environment Variable Test

```bash
# Test with environment variable
export BILLINGO_API_KEY=test_key
billingo config get apiKey
# Should fall back to env var if not in config

unset BILLINGO_API_KEY
```

## Command Structure Tests

### 1. Help Text Validation

```bash
# Test main help
billingo --help | grep -q "Billingo API" && echo "✓ Main help works"

# Test resource help
billingo documents --help | grep -q "Manage documents" && echo "✓ Documents help works"
billingo partners --help | grep -q "Manage partners" && echo "✓ Partners help works"

# Test command help
billingo documents create --help | grep -q "Create a new document" && echo "✓ Command help works"
```

### 2. Alias Validation

```bash
# Test aliases work
billingo docs --help > /tmp/docs.txt
billingo documents --help > /tmp/documents.txt
diff /tmp/docs.txt /tmp/documents.txt && echo "✓ Alias 'docs' works"

billingo banks --help > /tmp/banks.txt
billingo bank-accounts --help > /tmp/bank-accounts.txt
diff /tmp/banks.txt /tmp/bank-accounts.txt && echo "✓ Alias 'banks' works"
```

## API Integration Tests

**NOTE**: These tests require a valid Billingo API key and will make real API calls.

### 1. Authentication Test

```bash
# This should work if API key is valid
billingo organization get

# Expected: JSON output with organization details
# If error: Check API key configuration
```

### 2. Read-Only Operations

```bash
# Test list operations (safe, read-only)
billingo document-blocks list --format json > /tmp/blocks.json
cat /tmp/blocks.json | grep -q '"data"' && echo "✓ Document blocks list works"

billingo partners list --page 1 --per-page 5 --format json > /tmp/partners.json
cat /tmp/partners.json | grep -q '"current_page"' && echo "✓ Partners list works"

billingo products list --format json > /tmp/products.json
cat /tmp/products.json | grep -q '"data"' && echo "✓ Products list works"

billingo bank-accounts list --format json > /tmp/accounts.json
cat /tmp/accounts.json | grep -q '"data"' && echo "✓ Bank accounts list works"
```

### 3. Currency Conversion Test

```bash
# Test currency endpoint
billingo currencies convert --from HUF --to EUR --format json > /tmp/currency.json
cat /tmp/currency.json | grep -q '"currency"' && echo "✓ Currency conversion works"
```

### 4. Pagination Test

```bash
# Test pagination parameters
billingo documents list --page 1 --per-page 10 --format json > /tmp/page1.json
cat /tmp/page1.json | grep -q '"current_page": 1' && echo "✓ Pagination works"
```

### 5. Filtering Test

```bash
# Test document filtering
billingo documents list \
  --payment-status paid \
  --start-date 2024-01-01 \
  --end-date 2024-12-31 \
  --format json > /tmp/filtered.json

cat /tmp/filtered.json | grep -q '"data"' && echo "✓ Filtering works"
```

## Output Format Tests

### 1. JSON Format

```bash
# Test JSON output is valid
billingo organization get --format json | node -e "JSON.parse(require('fs').readFileSync('/dev/stdin').toString())" && echo "✓ JSON format valid"
```

### 2. Pretty Format

```bash
# Test pretty format (default)
billingo organization get > /tmp/pretty.txt
test -s /tmp/pretty.txt && echo "✓ Pretty format produces output"
```

## Error Handling Tests

### 1. Missing API Key

```bash
# Temporarily clear API key
billingo config clear

# This should fail with clear error message
billingo organization get 2>&1 | grep -q "API key not configured" && echo "✓ Missing API key error handled"

# Restore API key
billingo config set apiKey YOUR_TEST_API_KEY
```

### 2. Invalid Resource ID

```bash
# Try to get non-existent resource
billingo documents get 999999999 2>&1 | grep -q "not found" && echo "✓ 404 error handled"
```

### 3. Invalid Data

```bash
# Try to create with invalid data
echo '{"invalid": "data"}' > /tmp/invalid.json
billingo documents create --file /tmp/invalid.json 2>&1 | grep -q "Error" && echo "✓ Validation error handled"
```

### 4. Missing Required Option

```bash
# Try currency convert without required params
billingo currencies convert 2>&1 | grep -q "required" && echo "✓ Missing required option handled"
```

## File Operations Tests

### 1. File Input Test

```bash
# Test creating from file
cp examples/partner.json /tmp/test-partner.json

# Note: This will create a real partner - use test account
# billingo partners create --file /tmp/test-partner.json --format json > /tmp/created-partner.json
# cat /tmp/created-partner.json | grep -q '"id"' && echo "✓ File input works"
```

### 2. File Download Test

```bash
# Note: Requires a valid document ID
# billingo documents download 123 --output /tmp/test-invoice.pdf
# test -f /tmp/test-invoice.pdf && echo "✓ File download works"
```

### 3. Inline JSON Test

```bash
# Test inline JSON input (less destructive)
# billingo partners create --data '{"name":"Test","emails":["test@example.com"]}' 2>&1
```

## Exit Code Tests

### 1. Success Exit Code

```bash
billingo organization get > /dev/null
test $? -eq 0 && echo "✓ Success returns exit code 0"
```

### 2. Error Exit Code

```bash
billingo documents get 999999999 > /dev/null 2>&1
test $? -eq 1 && echo "✓ Error returns exit code 1"
```

## Performance Tests

### 1. Response Time Test

```bash
# Test API call response time
time billingo organization get > /dev/null
# Should complete in < 2 seconds typically
```

### 2. Pagination Performance

```bash
# Test large page size
time billingo documents list --per-page 100 --format json > /dev/null
# Should handle large result sets
```

## Integration Tests (Safe)

### 1. Complete Read Workflow

```bash
# Test a complete read-only workflow
billingo organization get --format json > /tmp/org.json
billingo document-blocks list --format json > /tmp/blocks.json
billingo partners list --format json > /tmp/partners.json
billingo products list --format json > /tmp/products.json
billingo documents list --format json > /tmp/documents.json

# Verify all files created
test -f /tmp/org.json && \
test -f /tmp/blocks.json && \
test -f /tmp/partners.json && \
test -f /tmp/products.json && \
test -f /tmp/documents.json && \
echo "✓ Complete read workflow successful"
```

## AI Agent Tests

### 1. JSON Parsing Test

```bash
# Test that AI agents can parse output
node << 'EOF'
const { execSync } = require('child_process');
const output = execSync('billingo organization get --format json').toString();
const data = JSON.parse(output);
console.log(data.id ? '✓ AI can parse JSON output' : '✗ JSON parse failed');
EOF
```

### 2. Error Message Parsing

```bash
# Test that error messages are machine-readable
billingo documents get 999999999 2>&1 | grep -q "Error:" && echo "✓ Errors are prefixed correctly"
```

## Cleanup

```bash
# Clean up test files
rm -f /tmp/*.json /tmp/*.txt /tmp/*.pdf

# Optionally unlink CLI
# npm unlink -g @ktmcp-cli/billingo
```

## Test Summary Checklist

### Installation
- [ ] Files exist and have correct permissions
- [ ] No syntax errors in JavaScript files
- [ ] JSON examples are valid
- [ ] npm install succeeds
- [ ] npm link creates global command
- [ ] billingo --help shows documentation

### Configuration
- [ ] Config set/get/list/clear work
- [ ] API key storage works
- [ ] Environment variable fallback works

### Commands
- [ ] All commands have help text
- [ ] Aliases work correctly
- [ ] Required options are enforced
- [ ] Optional parameters work

### API Integration
- [ ] Authentication works
- [ ] Organization endpoint works
- [ ] List operations work
- [ ] Pagination works
- [ ] Filtering works
- [ ] Currency conversion works

### Output
- [ ] JSON format is valid JSON
- [ ] Pretty format is readable
- [ ] Errors go to stderr
- [ ] Success output goes to stdout

### Error Handling
- [ ] Missing API key shows clear error
- [ ] 404 errors are handled
- [ ] Validation errors are shown
- [ ] Rate limits are detected
- [ ] Network errors are handled

### Exit Codes
- [ ] Success returns 0
- [ ] Errors return 1

### Performance
- [ ] Reasonable response times
- [ ] Handles large result sets

## Automated Test Script

Save this as `test-cli.sh`:

```bash
#!/bin/bash

echo "Billingo CLI Test Suite"
echo "======================="
echo ""

PASS=0
FAIL=0

test_command() {
  if eval "$1" > /dev/null 2>&1; then
    echo "✓ $2"
    ((PASS++))
  else
    echo "✗ $2"
    ((FAIL++))
  fi
}

# Run tests
test_command "billingo --help | grep -q 'Billingo API'" "Help text"
test_command "billingo config set testKey testValue && billingo config get testKey | grep -q testValue" "Config management"
test_command "billingo --version | grep -q '1.0.0'" "Version output"

echo ""
echo "Results: $PASS passed, $FAIL failed"
exit $FAIL
```

Run with:
```bash
chmod +x test-cli.sh
./test-cli.sh
```

## Troubleshooting

### Command Not Found
```bash
# Reinstall
npm unlink -g
npm link
```

### Permission Denied
```bash
chmod +x bin/billingo.js
```

### Module Not Found
```bash
npm install
```

### API Errors
```bash
# Check API key
billingo config get apiKey

# Test connection
curl -H "X-API-KEY: YOUR_KEY" https://api.billingo.hu/v3/organization
```

## Next Steps

After all tests pass:
1. Commit to version control
2. Tag release v1.0.0
3. Publish to npm (if public)
4. Deploy to production
5. Monitor error logs
6. Gather user feedback

## Support

For issues found during testing, check:
- [README.md](./README.md) - Usage documentation
- [Billingo API Docs](https://api.billingo.hu/v3/swagger)
- Error logs in terminal output
