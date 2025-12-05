import * as fs from 'fs';
import * as path from 'path';
import { SECRET_PATTERNS, SKIP_EXTENSIONS, SKIP_DIRECTORIES, type SecretPattern } from './patterns.js';

export interface DetectedSecret {
  filePath: string;
  lineNumber: number;
  secretType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  snippet: string;
  match: string;
}

export interface ScanResult {
  totalFiles: number;
  totalSecrets: number;
  secrets: DetectedSecret[];
  scanDurationMs: number;
  overallSeverity: 'critical' | 'high' | 'medium' | 'low' | 'none';
}

export interface ScanOptions {
  patterns?: SecretPattern[];
  maxFileSize?: number; // in bytes
  excludePaths?: string[];
}

const DEFAULT_OPTIONS: Required<ScanOptions> = {
  patterns: SECRET_PATTERNS,
  maxFileSize: 1024 * 1024, // 1MB
  excludePaths: [],
};

/**
 * Redact a secret value, showing only first and last 4 characters
 */
function redactSecret(value: string): string {
  if (value.length <= 12) {
    return '*'.repeat(value.length);
  }
  return `${value.slice(0, 4)}${'*'.repeat(value.length - 8)}${value.slice(-4)}`;
}

/**
 * Get context around a match in a line
 */
function getSnippet(line: string, match: string, maxLength = 100): string {
  const redacted = line.replace(match, redactSecret(match));
  if (redacted.length <= maxLength) {
    return redacted.trim();
  }
  
  const matchIndex = line.indexOf(match);
  const start = Math.max(0, matchIndex - 20);
  const end = Math.min(line.length, matchIndex + match.length + 20);
  
  let snippet = line.slice(start, end);
  snippet = snippet.replace(match, redactSecret(match));
  
  if (start > 0) snippet = '...' + snippet;
  if (end < line.length) snippet = snippet + '...';
  
  return snippet.trim();
}

/**
 * Check if a file should be skipped
 */
function shouldSkipFile(filePath: string, options: Required<ScanOptions>): boolean {
  const ext = path.extname(filePath).toLowerCase();
  if (SKIP_EXTENSIONS.has(ext)) return true;
  
  const parts = filePath.split(path.sep);
  for (const part of parts) {
    if (SKIP_DIRECTORIES.has(part)) return true;
  }
  
  for (const exclude of options.excludePaths) {
    if (filePath.includes(exclude)) return true;
  }
  
  return false;
}

/**
 * Scan a single file for secrets
 */
function scanFile(filePath: string, options: Required<ScanOptions>): DetectedSecret[] {
  const secrets: DetectedSecret[] = [];
  
  try {
    const stats = fs.statSync(filePath);
    if (stats.size > options.maxFileSize) return secrets;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      
      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith('//') || line.trim().startsWith('#')) {
        continue;
      }
      
      for (const pattern of options.patterns) {
        // Reset regex lastIndex
        pattern.regex.lastIndex = 0;
        
        let match;
        while ((match = pattern.regex.exec(line)) !== null) {
          const matchValue = match[0];
          
          // Filter out obvious false positives
          if (matchValue.length < 10) continue;
          if (/^[a-z]+$/i.test(matchValue)) continue; // All letters, likely a word
          if (/^[0-9]+$/.test(matchValue)) continue; // All numbers
          if (matchValue.includes('example') || matchValue.includes('EXAMPLE')) continue;
          if (matchValue.includes('test') || matchValue.includes('TEST')) continue;
          if (matchValue.includes('fake') || matchValue.includes('FAKE')) continue;
          if (matchValue.includes('placeholder')) continue;
          
          secrets.push({
            filePath,
            lineNumber: lineNum + 1,
            secretType: pattern.name,
            severity: pattern.severity,
            description: pattern.description,
            snippet: getSnippet(line, matchValue),
            match: redactSecret(matchValue),
          });
        }
      }
    }
  } catch (error) {
    // Skip files that can't be read
  }
  
  return secrets;
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath: string, options: Required<ScanOptions>): string[] {
  const files: string[] = [];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!SKIP_DIRECTORIES.has(entry.name)) {
          files.push(...getAllFiles(fullPath, options));
        }
      } else if (entry.isFile()) {
        if (!shouldSkipFile(fullPath, options)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return files;
}

/**
 * Determine overall severity from list of secrets
 */
function getOverallSeverity(secrets: DetectedSecret[]): ScanResult['overallSeverity'] {
  if (secrets.length === 0) return 'none';
  
  const severityOrder = ['critical', 'high', 'medium', 'low'] as const;
  for (const severity of severityOrder) {
    if (secrets.some(s => s.severity === severity)) {
      return severity;
    }
  }
  return 'low';
}

/**
 * Scan a directory for secrets
 */
export function scanDirectory(dirPath: string, options: ScanOptions = {}): ScanResult {
  const startTime = Date.now();
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  const absolutePath = path.resolve(dirPath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Directory not found: ${absolutePath}`);
  }
  
  const files = getAllFiles(absolutePath, mergedOptions);
  const allSecrets: DetectedSecret[] = [];
  
  for (const file of files) {
    const relativePath = path.relative(absolutePath, file);
    const secrets = scanFile(file, mergedOptions);
    
    // Update file paths to be relative
    for (const secret of secrets) {
      secret.filePath = relativePath;
      allSecrets.push(secret);
    }
  }
  
  return {
    totalFiles: files.length,
    totalSecrets: allSecrets.length,
    secrets: allSecrets,
    scanDurationMs: Date.now() - startTime,
    overallSeverity: getOverallSeverity(allSecrets),
  };
}

/**
 * Scan a single file for secrets
 */
export function scanSingleFile(filePath: string, options: ScanOptions = {}): ScanResult {
  const startTime = Date.now();
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  const absolutePath = path.resolve(filePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }
  
  const secrets = scanFile(absolutePath, mergedOptions);
  
  return {
    totalFiles: 1,
    totalSecrets: secrets.length,
    secrets,
    scanDurationMs: Date.now() - startTime,
    overallSeverity: getOverallSeverity(secrets),
  };
}
