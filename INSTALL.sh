#!/bin/bash
# Billingo CLI - Quick Install Script

set -e

echo "================================================"
echo "  Billingo CLI Installation"
echo "================================================"
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js version must be >= 18.0.0"
    echo "Current version: $(node -v)"
    exit 1
fi

echo "✓ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Link CLI globally
echo "Linking CLI globally..."
npm link
echo "✓ CLI linked globally"
echo ""

# Verify installation
echo "Verifying installation..."
if command -v billingo &> /dev/null; then
    echo "✓ billingo command available"
    echo ""
    
    echo "Installation successful!"
    echo ""
    echo "Next steps:"
    echo "1. Get your API key from https://app.billingo.hu/api-key"
    echo "2. Configure: billingo config set apiKey YOUR_API_KEY"
    echo "3. Test: billingo organization get"
    echo ""
    echo "Documentation:"
    echo "  - Quick start: cat QUICKSTART.md"
    echo "  - Full docs: cat README.md"
    echo "  - AI agents: cat AGENT.md"
    echo ""
else
    echo "✗ Installation failed"
    echo "Try running: npm link"
    exit 1
fi
