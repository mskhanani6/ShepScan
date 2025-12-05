/**
 * ShepScan - AI-Native Secret Detection
 * 
 * @packageDocumentation
 * @module shepscan
 */

export { scanDirectory, scanSingleFile } from './scanner.js';
export type { DetectedSecret, ScanResult, ScanOptions } from './scanner.js';
export { SECRET_PATTERNS, SKIP_EXTENSIONS, SKIP_DIRECTORIES } from './patterns.js';
export type { SecretPattern } from './patterns.js';
