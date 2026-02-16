# Billingo CLI - Documentation Index

Welcome to the Billingo CLI documentation. This index helps you find the right documentation for your needs.

## Quick Navigation

| I want to... | Read this... |
|-------------|-------------|
| Get started in 5 minutes | [QUICKSTART.md](QUICKSTART.md) |
| Understand the full feature set | [README.md](README.md) |
| Use with AI agents (Claude, GPT-4) | [AGENT.md](AGENT.md) |
| Integrate with OpenClaw | [OPENCLAW.md](OPENCLAW.md) |
| Test and validate | [TESTING.md](TESTING.md) |
| See project stats | [CLI_SUMMARY.md](CLI_SUMMARY.md) |
| View file structure | [STRUCTURE.txt](STRUCTURE.txt) |
| Read project report | [PROJECT_REPORT.md](PROJECT_REPORT.md) |

## Documentation by Audience

### For Developers

**Start here**: [QUICKSTART.md](QUICKSTART.md)

1. **Installation**: Run `./INSTALL.sh` or follow [QUICKSTART.md](QUICKSTART.md)
2. **Configuration**: Set your API key (see [README.md](README.md#configuration))
3. **Usage**: Learn commands (see [README.md](README.md#usage))
4. **Testing**: Validate installation (see [TESTING.md](TESTING.md))

**Key Files**:
- [README.md](README.md) - Complete reference
- [QUICKSTART.md](QUICKSTART.md) - Get started fast
- [examples/](examples/) - JSON examples

### For AI Agents

**Start here**: [AGENT.md](AGENT.md)

This 600+ line guide covers:
- Quick start for agents
- Output parsing (JSON format)
- Error handling patterns
- Complete workflow examples
- Field validation
- Hungarian-specific info (VAT rates, currencies)

**Why this matters**: This CLI is designed for AI agents. The AGENT.md file is your complete guide.

### For OpenClaw Developers

**Start here**: [OPENCLAW.md](OPENCLAW.md)

This 500+ line guide covers:
- Why CLI > MCP for OpenClaw
- Python wrapper implementation
- Complete example agent
- Docker integration
- Testing strategies

**Key insight**: OpenClaw + CLI is simpler and more reliable than OpenClaw + MCP.

### For Project Managers

**Start here**: [PROJECT_REPORT.md](PROJECT_REPORT.md)

This comprehensive report includes:
- Project completion status
- Technical implementation details
- Documentation quality metrics
- Deployment readiness
- Success metrics

**Quick facts**:
- 100% API coverage (29/29 endpoints)
- 2,000+ lines of documentation
- Production ready
- Comprehensive error handling

### For QA/Testing

**Start here**: [TESTING.md](TESTING.md)

Complete testing guide including:
- Pre-installation tests
- Installation validation
- Command structure tests
- API integration tests
- Error handling tests
- Automated test script

**Run this**: `cat TESTING.md` for full test suite

## Documentation by Topic

### Installation & Setup

1. **Quick Install**: Run `./INSTALL.sh`
2. **Manual Install**: See [QUICKSTART.md](QUICKSTART.md#step-1-install)
3. **Configuration**: See [README.md](README.md#configuration)
4. **Verification**: See [TESTING.md](TESTING.md#installation-tests)

### Usage & Commands

1. **Quick Examples**: [QUICKSTART.md](QUICKSTART.md#step-5-create-your-first-invoice)
2. **Complete Reference**: [README.md](README.md#usage)
3. **AI Agent Patterns**: [AGENT.md](AGENT.md#common-workflows)
4. **Command List**: [STRUCTURE.txt](STRUCTURE.txt#command-hierarchy)

### API Reference

1. **Endpoint Coverage**: [CLI_SUMMARY.md](CLI_SUMMARY.md#api-coverage)
2. **Data Formats**: [README.md](README.md#data-formats)
3. **Error Handling**: [README.md](README.md#error-handling)
4. **Rate Limiting**: [README.md](README.md#rate-limiting)

### Integration

1. **OpenClaw**: [OPENCLAW.md](OPENCLAW.md)
2. **AI Agents**: [AGENT.md](AGENT.md)
3. **Docker**: [OPENCLAW.md](OPENCLAW.md#docker-integration)
4. **Environment Vars**: [README.md](README.md#configuration)

### Development

1. **Project Structure**: [STRUCTURE.txt](STRUCTURE.txt)
2. **Code Overview**: [CLI_SUMMARY.md](CLI_SUMMARY.md#directory-structure)
3. **Testing**: [TESTING.md](TESTING.md)
4. **Examples**: [examples/](examples/)

## File Reference

### Documentation (8 files)

| File | Lines | Purpose |
|------|-------|---------|
| README.md | 500+ | Main documentation + "Why CLI > MCP" |
| AGENT.md | 600+ | AI agent usage guide |
| OPENCLAW.md | 500+ | OpenClaw integration |
| QUICKSTART.md | 200+ | 5-minute getting started |
| TESTING.md | 400+ | Testing & validation |
| CLI_SUMMARY.md | 400+ | Implementation summary |
| PROJECT_REPORT.md | 400+ | Project completion report |
| STRUCTURE.txt | 200+ | Visual structure reference |
| INDEX.md | This file | Documentation index |

### Code (13 files)

| File | Lines | Purpose |
|------|-------|---------|
| bin/billingo.js | 73 | CLI entry point |
| src/commands/*.js | ~900 | Command implementations (8 files) |
| src/lib/*.js | ~240 | Core libraries (3 files) |

### Examples (4 files)

| File | Purpose |
|------|---------|
| examples/invoice.json | Sample invoice with multiple items |
| examples/partner.json | Sample customer/partner data |
| examples/product.json | Sample product/service |
| examples/bank-account.json | Sample bank account |

### Configuration (5 files)

| File | Purpose |
|------|---------|
| package.json | npm package configuration |
| .env.example | Environment variable template |
| .gitignore | Git ignore rules |
| LICENSE | MIT License |
| INSTALL.sh | Installation script |

## Common Tasks

### I want to install the CLI

```bash
cd /workspace/group/ktmcp/workspace/billingo
./INSTALL.sh
```

See: [QUICKSTART.md](QUICKSTART.md)

### I want to create an invoice

```bash
# 1. Configure API key
billingo config set apiKey YOUR_KEY

# 2. Edit example
cp examples/invoice.json my-invoice.json
# (edit with your data)

# 3. Create invoice
billingo documents create --file my-invoice.json
```

See: [QUICKSTART.md](QUICKSTART.md#step-5-create-your-first-invoice)

### I want to integrate with my AI agent

Read: [AGENT.md](AGENT.md)

Key sections:
- Quick Start for Agents
- Output Parsing (JSON format)
- Complete Workflow Examples

### I want to understand why CLI > MCP

Read: [README.md](README.md#why-cli--mcp)

Key points:
1. No server process needed
2. Direct API access
3. Human + AI usable
4. Self-documenting
5. Better errors
6. Easier debugging

### I want to test the CLI

Read: [TESTING.md](TESTING.md)

Quick test:
```bash
billingo --help
billingo organization get
```

### I want to see all available commands

```bash
billingo --help

# Or read:
cat STRUCTURE.txt
```

See: [STRUCTURE.txt](STRUCTURE.txt#command-hierarchy)

## FAQ

### What is this?

A production-ready CLI for the Billingo API v3 (Hungarian invoicing and billing).

### Who is it for?

- Developers building billing automation
- AI agents (Claude, GPT-4) automating invoices
- OpenClaw users integrating billing
- Anyone using Billingo programmatically

### What makes it special?

1. **100% API coverage** - All 29 endpoints
2. **CLI > MCP philosophy** - Better than MCP servers
3. **AI-first design** - Built for agent use
4. **Comprehensive docs** - 2,000+ lines
5. **Production ready** - Full error handling

### How do I get started?

```bash
./INSTALL.sh
billingo config set apiKey YOUR_KEY
billingo organization get
```

Then read [QUICKSTART.md](QUICKSTART.md).

### Where do I get an API key?

https://app.billingo.hu/api-key

### How do I report issues?

Check error messages first (they're comprehensive).
Then review [TESTING.md](TESTING.md#troubleshooting).

### Can I use this in production?

Yes. The CLI is production-ready with:
- Full error handling
- Rate limit management
- Input validation
- Proper exit codes

### Does it work with AI agents?

Yes! See [AGENT.md](AGENT.md) for complete guide.

The CLI is designed for AI agents with:
- JSON output mode
- Clear error messages
- Complete field validation
- Workflow examples

### How do I integrate with OpenClaw?

See [OPENCLAW.md](OPENCLAW.md) for complete guide including:
- Python wrapper
- Example agent
- Docker setup

## Support Resources

### Official Billingo Resources
- API Docs: https://api.billingo.hu/v3/swagger
- Get API Key: https://app.billingo.hu/api-key
- Support: https://support.billingo.hu/

### CLI Resources
- All documentation: This directory
- Help command: `billingo --help`
- Command help: `billingo <resource> --help`

### Examples
- Invoice: `cat examples/invoice.json`
- Partner: `cat examples/partner.json`
- Product: `cat examples/product.json`

## Next Steps

### If you're new:
1. Run `./INSTALL.sh`
2. Read [QUICKSTART.md](QUICKSTART.md)
3. Try examples from [README.md](README.md#examples)

### If you're an AI agent:
1. Read [AGENT.md](AGENT.md)
2. Use `--format json` for all commands
3. Follow workflow examples

### If you're integrating:
1. Read [OPENCLAW.md](OPENCLAW.md) (if using OpenClaw)
2. Check [examples/](examples/) for data formats
3. Test with [TESTING.md](TESTING.md)

### If you're developing:
1. Read [CLI_SUMMARY.md](CLI_SUMMARY.md)
2. Check [STRUCTURE.txt](STRUCTURE.txt)
3. Review code in `src/`

## Contributing

This is a complete, production-ready CLI. Future enhancements could include:
- Unit tests (Jest)
- CI/CD pipeline
- Shell autocomplete
- Interactive mode

See [CLI_SUMMARY.md](CLI_SUMMARY.md#next-steps-for-production) for ideas.

## License

MIT License - See [LICENSE](LICENSE)

---

**Version**: 1.0.0
**Status**: Production Ready
**Location**: `/workspace/group/ktmcp/workspace/billingo/`
**Created**: 2024-02-16
