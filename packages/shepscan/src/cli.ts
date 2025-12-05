#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { simpleGit } from 'simple-git';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { scanDirectory, type ScanResult, type DetectedSecret } from './scanner.js';

const VERSION = '0.1.0';

const severityColors = {
  critical: chalk.red.bold,
  high: chalk.red,
  medium: chalk.yellow,
  low: chalk.blue,
  none: chalk.green,
};

const severityEmoji = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🔵',
  none: '🟢',
};

function formatResult(result: ScanResult, verbose: boolean): void {
  console.log('\n' + chalk.bold('━'.repeat(60)));
  console.log(chalk.bold('📊 Scan Results'));
  console.log(chalk.bold('━'.repeat(60)));
  
  console.log(`\n  ${chalk.dim('Files scanned:')}  ${result.totalFiles}`);
  console.log(`  ${chalk.dim('Scan duration:')}  ${result.scanDurationMs}ms`);
  console.log(`  ${chalk.dim('Secrets found:')}  ${severityColors[result.overallSeverity](result.totalSecrets)}`);
  console.log(`  ${chalk.dim('Severity:')}       ${severityEmoji[result.overallSeverity]} ${severityColors[result.overallSeverity](result.overallSeverity.toUpperCase())}`);
  
  if (result.secrets.length > 0) {
    console.log('\n' + chalk.bold('🔍 Detected Secrets:'));
    console.log(chalk.dim('─'.repeat(60)));
    
    // Group by file
    const byFile = new Map<string, DetectedSecret[]>();
    for (const secret of result.secrets) {
      const existing = byFile.get(secret.filePath) || [];
      existing.push(secret);
      byFile.set(secret.filePath, existing);
    }
    
    for (const [filePath, secrets] of byFile) {
      console.log(`\n  ${chalk.cyan.bold(filePath)}`);
      
      for (const secret of secrets) {
        const color = severityColors[secret.severity];
        console.log(`    ${severityEmoji[secret.severity]} Line ${chalk.yellow(secret.lineNumber)}: ${color(secret.secretType)}`);
        if (verbose) {
          console.log(`       ${chalk.dim(secret.snippet)}`);
          console.log(`       ${chalk.dim.italic(secret.description)}`);
        }
      }
    }
  } else {
    console.log('\n  ' + chalk.green('✨ No secrets detected!'));
  }
  
  console.log('\n' + chalk.bold('━'.repeat(60)) + '\n');
}

async function scanRepo(repoUrl: string, options: { verbose: boolean; output?: string }): Promise<void> {
  const spinner = ora('Cloning repository...').start();
  
  const tempDir = path.join(os.tmpdir(), `shepscan-${Date.now()}`);
  
  try {
    // Clone the repo
    const git = simpleGit();
    await git.clone(repoUrl, tempDir, ['--depth', '1']);
    spinner.succeed('Repository cloned');
    
    // Scan
    spinner.start('Scanning for secrets...');
    const result = scanDirectory(tempDir);
    spinner.succeed(`Scan complete - found ${result.totalSecrets} potential secrets`);
    
    // Output results
    if (options.output) {
      fs.writeFileSync(options.output, JSON.stringify(result, null, 2));
      console.log(chalk.green(`\n✅ Results saved to ${options.output}`));
    }
    
    formatResult(result, options.verbose);
    
    // Set exit code based on findings
    if (result.overallSeverity === 'critical' || result.overallSeverity === 'high') {
      process.exitCode = 1;
    }
    
  } catch (error) {
    spinner.fail('Scan failed');
    console.error(chalk.red(`\nError: ${(error as Error).message}`));
    process.exit(1);
  } finally {
    // Cleanup
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}

async function scanLocal(dirPath: string, options: { verbose: boolean; output?: string }): Promise<void> {
  const spinner = ora('Scanning for secrets...').start();
  
  try {
    const absolutePath = path.resolve(dirPath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Directory not found: ${absolutePath}`);
    }
    
    const result = scanDirectory(absolutePath);
    spinner.succeed(`Scan complete - found ${result.totalSecrets} potential secrets`);
    
    // Output results
    if (options.output) {
      fs.writeFileSync(options.output, JSON.stringify(result, null, 2));
      console.log(chalk.green(`\n✅ Results saved to ${options.output}`));
    }
    
    formatResult(result, options.verbose);
    
    // Set exit code based on findings
    if (result.overallSeverity === 'critical' || result.overallSeverity === 'high') {
      process.exitCode = 1;
    }
    
  } catch (error) {
    spinner.fail('Scan failed');
    console.error(chalk.red(`\nError: ${(error as Error).message}`));
    process.exit(1);
  }
}

// CLI Setup
const program = new Command();

program
  .name('shepscan')
  .description('🛡️ AI-native secret detection for your repositories')
  .version(VERSION);

program
  .command('scan')
  .description('Scan a local directory for secrets')
  .argument('<path>', 'Path to directory to scan')
  .option('-v, --verbose', 'Show detailed output with snippets', false)
  .option('-o, --output <file>', 'Save results to JSON file')
  .action(async (dirPath, options) => {
    console.log(chalk.bold('\n🛡️ ShepScan v' + VERSION));
    console.log(chalk.dim('AI-native secret detection\n'));
    await scanLocal(dirPath, options);
  });

program
  .command('repo')
  .description('Scan a GitHub repository for secrets')
  .argument('<url>', 'GitHub repository URL')
  .option('-v, --verbose', 'Show detailed output with snippets', false)
  .option('-o, --output <file>', 'Save results to JSON file')
  .action(async (repoUrl, options) => {
    console.log(chalk.bold('\n🛡️ ShepScan v' + VERSION));
    console.log(chalk.dim('AI-native secret detection\n'));
    await scanRepo(repoUrl, options);
  });

program
  .command('patterns')
  .description('List all detection patterns')
  .action(() => {
    console.log(chalk.bold('\n🔍 ShepScan Detection Patterns\n'));
    
    const { SECRET_PATTERNS } = require('./patterns.js');
    
    const bySeverity = {
      critical: [] as string[],
      high: [] as string[],
      medium: [] as string[],
      low: [] as string[],
    };
    
    for (const pattern of SECRET_PATTERNS) {
      bySeverity[pattern.severity as keyof typeof bySeverity].push(pattern.name);
    }
    
    for (const [severity, patterns] of Object.entries(bySeverity)) {
      if (patterns.length > 0) {
        console.log(severityColors[severity as keyof typeof severityColors](`\n${severity.toUpperCase()}:`));
        for (const name of patterns) {
          console.log(`  • ${name}`);
        }
      }
    }
    
    console.log('\n');
  });

// Default command - scan current directory
program
  .argument('[path]', 'Path to scan (default: current directory)')
  .option('-v, --verbose', 'Show detailed output with snippets', false)
  .option('-o, --output <file>', 'Save results to JSON file')
  .action(async (dirPath, options) => {
    if (!dirPath) {
      dirPath = '.';
    }
    console.log(chalk.bold('\n🛡️ ShepScan v' + VERSION));
    console.log(chalk.dim('AI-native secret detection\n'));
    await scanLocal(dirPath, options);
  });

program.parse();
