# 🛡️ ShepScan

**AI-native secret detection CLI for scanning repositories**

[![npm version](https://img.shields.io/npm/v/shepscan.svg)](https://www.npmjs.com/package/shepscan)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Scan your code for leaked secrets before they reach production. ShepScan detects 13+ secret types including AWS keys, Stripe tokens, database URLs, and more.

## Installation

```bash
# Global installation
npm install -g shepscan

# Or use with npx
npx shepscan
```

## Usage

### Scan Current Directory

```bash
shepscan
```

### Scan a Specific Directory

```bash
shepscan scan ./my-project
```

### Scan a GitHub Repository

```bash
shepscan repo https://github.com/username/repo
```

### Options

```bash
shepscan [path] [options]

Options:
  -v, --verbose       Show detailed output with snippets
  -o, --output <file> Save results to JSON file
  -V, --version       Output version number
  -h, --help          Display help
```

### Examples

```bash
# Scan with verbose output
shepscan scan ./src --verbose

# Save results to JSON
shepscan scan ./src -o results.json

# Scan a public GitHub repo
shepscan repo https://github.com/streaak/keyhacks

# List all detection patterns
shepscan patterns
```

## Detected Secret Types

| Type | Severity |
|------|----------|
| AWS Access Key ID | Critical |
| AWS Secret Access Key | Critical |
| GitHub Token | Critical |
| Stripe Secret Key | Critical |
| Database Connection String | Critical |
| Private Keys | Critical |
| Google API Key | High |
| Slack Token | High |
| Discord Token | High |
| OpenAI API Key | High |
| JWT Secret | High |
| Generic API Key | Medium |
| Generic Secret/Password | Medium |

## Programmatic Usage

```typescript
import { scanDirectory, scanSingleFile } from 'shepscan';

// Scan a directory
const result = scanDirectory('./my-project');

console.log(`Found ${result.totalSecrets} secrets`);
console.log(`Overall severity: ${result.overallSeverity}`);

for (const secret of result.secrets) {
  console.log(`${secret.filePath}:${secret.lineNumber} - ${secret.secretType}`);
}

// Scan a single file
const fileResult = scanSingleFile('./config.js');
```

## Exit Codes

- `0` — No secrets found, or only low/medium severity
- `1` — Critical or high severity secrets found

Use in CI/CD:

```bash
shepscan scan . || echo "Secrets detected!"
```

## Contributing

See [CONTRIBUTING.md](https://github.com/Radix-Obsidian/ShepScan/blob/main/CONTRIBUTING.md) for guidelines.

## License

MIT © [Golden Sheep AI](https://github.com/Radix-Obsidian)

---

**Part of [ShepScan](https://github.com/Radix-Obsidian/ShepScan)** — AI-native secret detection platform
