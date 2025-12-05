/**
 * ShepScan Secret Detection Patterns
 * 
 * Each pattern includes:
 * - name: Human-readable identifier
 * - regex: Detection pattern
 * - severity: critical | high | medium | low
 * - description: What this secret type is used for
 */

export interface SecretPattern {
  name: string;
  regex: RegExp;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

export const SECRET_PATTERNS: SecretPattern[] = [
  // AWS
  {
    name: 'AWS Access Key ID',
    regex: /\b(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}\b/g,
    severity: 'critical',
    description: 'AWS Access Key ID - provides access to AWS services',
  },
  {
    name: 'AWS Secret Access Key',
    regex: /\b[A-Za-z0-9\/+=]{40}\b/g,
    severity: 'critical',
    description: 'AWS Secret Access Key - paired with Access Key ID for AWS authentication',
  },

  // GitHub
  {
    name: 'GitHub Token',
    regex: /\b(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}|gho_[a-zA-Z0-9]{36}|ghu_[a-zA-Z0-9]{36}|ghs_[a-zA-Z0-9]{36}|ghr_[a-zA-Z0-9]{36})\b/g,
    severity: 'critical',
    description: 'GitHub Personal Access Token or OAuth token',
  },

  // Stripe
  {
    name: 'Stripe Secret Key',
    regex: /\b(sk_live_[a-zA-Z0-9]{24,}|sk_test_[a-zA-Z0-9]{24,}|rk_live_[a-zA-Z0-9]{24,}|rk_test_[a-zA-Z0-9]{24,})\b/g,
    severity: 'critical',
    description: 'Stripe API Secret Key - enables payment processing',
  },

  // Database URLs
  {
    name: 'Database Connection String',
    regex: /\b(mongodb(\+srv)?|postgres(ql)?|mysql|redis|amqp):\/\/[^\s'"]+/gi,
    severity: 'critical',
    description: 'Database connection string with credentials',
  },

  // Google
  {
    name: 'Google API Key',
    regex: /\bAIza[0-9A-Za-z\-_]{35}\b/g,
    severity: 'high',
    description: 'Google Cloud API Key',
  },

  // Slack
  {
    name: 'Slack Token',
    regex: /\b(xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*)\b/g,
    severity: 'high',
    description: 'Slack Bot or User Token',
  },

  // Discord
  {
    name: 'Discord Token',
    regex: /\b[MN][A-Za-z\d]{23,}\.[\w-]{6}\.[\w-]{27}\b/g,
    severity: 'high',
    description: 'Discord Bot or User Token',
  },

  // OpenAI
  {
    name: 'OpenAI API Key',
    regex: /\bsk-[a-zA-Z0-9]{20}T3BlbkFJ[a-zA-Z0-9]{20}\b/g,
    severity: 'high',
    description: 'OpenAI API Key for GPT and other services',
  },

  // Private Keys
  {
    name: 'Private Key',
    regex: /-----BEGIN (RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY( BLOCK)?-----/g,
    severity: 'critical',
    description: 'Private cryptographic key',
  },

  // JWT
  {
    name: 'JWT Secret',
    regex: /\b(jwt[_-]?secret|JWT[_-]?SECRET)\s*[=:]\s*['"]?[a-zA-Z0-9\-_=+\/]{16,}['"]?/gi,
    severity: 'high',
    description: 'JSON Web Token signing secret',
  },

  // Generic API Keys
  {
    name: 'Generic API Key',
    regex: /\b(api[_-]?key|apikey|API[_-]?KEY)\s*[=:]\s*['"]?[a-zA-Z0-9\-_=+\/]{16,}['"]?/gi,
    severity: 'medium',
    description: 'Generic API key pattern',
  },

  // Generic Secrets
  {
    name: 'Generic Secret',
    regex: /\b(secret|SECRET|password|PASSWORD|passwd|PASSWD)\s*[=:]\s*['"]?[^\s'"]{8,}['"]?/g,
    severity: 'medium',
    description: 'Generic secret or password',
  },
];

// File extensions to skip
export const SKIP_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp3', '.mp4', '.wav', '.avi', '.mov',
  '.zip', '.tar', '.gz', '.rar', '.7z',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.exe', '.dll', '.so', '.dylib',
  '.lock', '.min.js', '.min.css',
]);

// Directories to skip
export const SKIP_DIRECTORIES = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage',
  '.next', '.nuxt', '__pycache__', 'venv', '.venv',
  'vendor', 'packages', '.idea', '.vscode',
]);
