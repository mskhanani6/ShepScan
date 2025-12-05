# Contributing to ShepScan

First off, thank you for considering contributing to ShepScan! 🎉

ShepScan is an **open-core** project. The core scanning engine and dashboard are open source under MIT license.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

By participating in this project, you agree to maintain a welcoming, inclusive environment. Be respectful and constructive in all interactions.

## Getting Started

### Good First Issues

Look for issues labeled `good first issue` — these are specifically designed for new contributors.

### Types of Contributions

- 🐛 **Bug Fixes** — Found a bug? We'd love a fix!
- ✨ **Features** — Check the roadmap or propose new ideas
- 📚 **Documentation** — Help improve our docs
- 🧪 **Tests** — More test coverage is always welcome
- 🔍 **Secret Patterns** — Add detection for new secret types

## Development Setup

### Prerequisites

- Node.js 20+
- Git
- Docker (optional)

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ShepScan.git
cd ShepScan

# Install backend dependencies
cd apps/api
npm install

# Install frontend dependencies
cd ../web
npm install
```

### Running Locally

```bash
# Terminal 1 - Backend
cd apps/api
npm run start:dev

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

## Making Changes

### Branch Naming

- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation
- `refactor/` — Code refactoring

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Slack token detection pattern
fix: resolve false positive in JWT detection
docs: update API documentation
test: add e2e tests for scan endpoint
```

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch from `main`
3. **Make** your changes
4. **Test** your changes locally
5. **Push** to your fork
6. **Open** a Pull Request

### PR Checklist

- [ ] Code follows the style guidelines
- [ ] Tests pass locally
- [ ] New code has test coverage
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventions

## Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Prefer `interface` over `type` for object shapes
- Use meaningful variable names

### Backend (NestJS)

- Follow NestJS module structure
- Use dependency injection
- Add JSDoc comments for public methods
- Handle errors gracefully with proper HTTP status codes

### Frontend (Next.js)

- Use functional components with hooks
- Prefer shadcn/ui components
- Follow Tailwind CSS conventions
- Keep components small and focused

---

## Questions?

Open a [Discussion](https://github.com/Radix-Obsidian/ShepScan/discussions) for questions or ideas.

Thank you for contributing! 🐑
