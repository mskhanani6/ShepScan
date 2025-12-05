"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GitService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let GitService = GitService_1 = class GitService {
    logger = new common_1.Logger(GitService_1.name);
    tempBaseDir = path.join(os.tmpdir(), 'shepscan-repos');
    constructor() {
        this.ensureTempDir();
    }
    async ensureTempDir() {
        try {
            await fs.mkdir(this.tempBaseDir, { recursive: true });
        }
        catch (error) {
            this.logger.error(`Failed to create temp directory: ${error.message}`);
        }
    }
    parseGitHubUrl(url) {
        let cleanUrl = url.split('?')[0].split('#')[0].trim();
        cleanUrl = cleanUrl.replace(/\/+$/, '');
        const patterns = [
            /^https?:\/\/github\.com\/([^\/]+)\/([^\/\.]+)(?:\.git)?(?:\/.*)?$/,
            /^git@github\.com:([^\/]+)\/([^\/\.]+)(?:\.git)?$/,
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
    async cloneRepo(repoUrl) {
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
            await execAsync(`git clone --depth 1 "${cloneUrl}" "${localPath}"`, {
                timeout: 120000,
                maxBuffer: 50 * 1024 * 1024,
            });
            this.logger.log(`Successfully cloned ${repo}`);
            return {
                success: true,
                localPath,
            };
        }
        catch (error) {
            this.logger.error(`Failed to clone ${repoUrl}: ${error.message}`);
            try {
                await fs.rm(localPath, { recursive: true, force: true });
            }
            catch {
            }
            return {
                success: false,
                localPath: '',
                error: this.parseGitError(error.message),
            };
        }
    }
    async cleanup(localPath) {
        try {
            await fs.rm(localPath, { recursive: true, force: true });
            this.logger.log(`Cleaned up ${localPath}`);
        }
        catch (error) {
            this.logger.warn(`Failed to cleanup ${localPath}: ${error.message}`);
        }
    }
    parseGitError(errorMessage) {
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
    async getRepoInfo(owner, repo) {
        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            return {
                name: data.full_name,
                description: data.description || '',
                defaultBranch: data.default_branch,
            };
        }
        catch {
            return null;
        }
    }
};
exports.GitService = GitService;
exports.GitService = GitService = GitService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GitService);
//# sourceMappingURL=git.service.js.map