import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

export interface CloneResult {
    success: boolean;
    localPath: string;
    error?: string;
}

@Injectable()
export class GitService {
    private readonly logger = new Logger(GitService.name);
    private readonly tempBaseDir = path.join(os.tmpdir(), 'shepscan-repos');

    constructor() {
        // Ensure temp directory exists
        this.ensureTempDir();
    }

    private async ensureTempDir(): Promise<void> {
        try {
            await fs.mkdir(this.tempBaseDir, { recursive: true });
        } catch (error) {
            this.logger.error(`Failed to create temp directory: ${error.message}`);
        }
    }

    /**
     * Parse and validate a GitHub URL
     */
    parseGitHubUrl(url: string): { owner: string; repo: string } | null {
        // Strip query params and fragments first
        let cleanUrl = url.split('?')[0].split('#')[0].trim();
        
        // Remove trailing slashes
        cleanUrl = cleanUrl.replace(/\/+$/, '');
        
        // Support various GitHub URL formats
        const patterns = [
            // https://github.com/owner/repo
            /^https?:\/\/github\.com\/([^\/]+)\/([^\/\.]+)(?:\.git)?(?:\/.*)?$/,
            // git@github.com:owner/repo.git
            /^git@github\.com:([^\/]+)\/([^\/\.]+)(?:\.git)?$/,
            // github.com/owner/repo
            /^github\.com\/([^\/]+)\/([^\/\.]+)(?:\.git)?(?:\/.*)?$/,
        ];

        for (const pattern of patterns) {
            const match = cleanUrl.match(pattern);
            if (match) {
                return {
                    owner: match[1],
                    repo: match[2].replace(/\.git$/, ''),
                };
            }
        }

        return null;
    }

    /**
     * Clone a public GitHub repository
     */
    async cloneRepo(repoUrl: string): Promise<CloneResult> {
        const parsed = this.parseGitHubUrl(repoUrl);

        if (!parsed) {
            return {
                success: false,
                localPath: '',
                error: 'Invalid GitHub URL format',
            };
        }

        const { owner, repo } = parsed;
        const cloneUrl = `https://github.com/${owner}/${repo}.git`;
        const localPath = path.join(this.tempBaseDir, `${owner}-${repo}-${Date.now()}`);

        this.logger.log(`Cloning ${cloneUrl} to ${localPath}`);

        try {
            // Shallow clone for speed (depth=1)
            await execAsync(`git clone --depth 1 "${cloneUrl}" "${localPath}"`, {
                timeout: 120000, // 2 minute timeout
                maxBuffer: 50 * 1024 * 1024, // 50MB buffer
            });

            this.logger.log(`Successfully cloned ${repo}`);

            return {
                success: true,
                localPath,
            };
        } catch (error) {
            this.logger.error(`Failed to clone ${repoUrl}: ${error.message}`);

            // Clean up partial clone if exists
            try {
                await fs.rm(localPath, { recursive: true, force: true });
            } catch {
                // Ignore cleanup errors
            }

            return {
                success: false,
                localPath: '',
                error: this.parseGitError(error.message),
            };
        }
    }

    /**
     * Clean up a cloned repository
     */
    async cleanup(localPath: string): Promise<void> {
        try {
            await fs.rm(localPath, { recursive: true, force: true });
            this.logger.log(`Cleaned up ${localPath}`);
        } catch (error) {
            this.logger.warn(`Failed to cleanup ${localPath}: ${error.message}`);
        }
    }

    /**
     * Parse git error messages into user-friendly messages
     */
    private parseGitError(errorMessage: string): string {
        if (errorMessage.includes('Repository not found')) {
            return 'Repository not found. Make sure it exists and is public.';
        }
        if (errorMessage.includes('Authentication failed')) {
            return 'Repository requires authentication. Only public repos are supported.';
        }
        if (errorMessage.includes('timeout')) {
            return 'Clone timed out. The repository may be too large.';
        }
        if (errorMessage.includes('not a git repository')) {
            return 'The URL does not point to a valid git repository.';
        }
        return 'Failed to clone repository. Please check the URL and try again.';
    }

    /**
     * Get repository info without cloning (uses GitHub API)
     */
    async getRepoInfo(
        owner: string,
        repo: string,
    ): Promise<{ name: string; description: string; defaultBranch: string } | null> {
        try {
            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}`,
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return {
                name: data.full_name,
                description: data.description || '',
                defaultBranch: data.default_branch,
            };
        } catch {
            return null;
        }
    }
}
