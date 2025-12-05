<div align="center">
  <img src="apps/web/public/logo.png" alt="ShepScan Logo" width="120" height="120" />
  
  # ShepScan
  
  **AI-Native Secret Detection for Modern Development Teams**
  
  *Stop secrets from leaking before they hit your repository*

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![NestJS](https://img.shields.io/badge/NestJS-10.0-E0234E.svg)](https://nestjs.com/)
  [![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Radix-Obsidian/ShepScan/pulls)
  
  [Demo](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [Contributing](#-contributing) • [Roadmap](#-roadmap)

</div>

---

## 🎯 The Problem

**$4.45 million** — the average cost of a data breach in 2023. Many start with a single leaked secret.

Developers accidentally commit API keys, database credentials, and tokens to repositories every day. Traditional scanners catch these *after* the damage is done.

## 💡 The Solution

ShepScan is an **open-core AI-native security platform** that:

- 🔍 **Scans repositories** for 13+ secret types with regex + AI classification
- 🤖 **Eliminates false positives** using Claude/GPT-4 powered analysis  
- 💬 **Explains risks in plain English** — built for founders, not just security teams
- 📊 **Visualizes severity** with real-time heat maps

<div align="center">
  <img src="https://img.shields.io/badge/Pre--Seed-Bootstrapped-purple.svg" alt="Pre-Seed" />
  <img src="https://img.shields.io/badge/Status-MVP-green.svg" alt="MVP" />
  <img src="https://img.shields.io/badge/Open_Core-Self_Host_Free-blue.svg" alt="Open Core" />
</div>

---

## ✨ Features

### Core Detection Engine
| Feature | Description |
|---------|-------------|
| **13+ Secret Patterns** | AWS, Stripe, GitHub, Google, Slack, Discord, OpenAI, JWT, Private Keys, Database URLs |
| **Git Integration** | Clone any public GitHub repo and scan in seconds |
| **Line-Level Results** | Exact file path, line number, and redacted snippets |
| **Severity Scoring** | Critical, High, Medium, Low classifications |

### AI Intelligence Layer
| Feature | Description |
|---------|-------------|
| **Real vs False Positive** | AI classifies if detected patterns are actual secrets |
| **Confidence Scoring** | 0-100% confidence on each detection |
| **Founder Mode Explanations** | Plain-English risk, impact, and remediation steps |
| **Multi-Provider Support** | Works with OpenAI GPT-4 or Anthropic Claude |

### Dashboard & UX
| Feature | Description |
|---------|-------------|
| **Severity Heat Map** | Visual distribution of detected secrets |
| **Expandable Details** | Click any secret to see AI analysis |
| **Scan History** | Track previous scans and results |
| **GitHub OAuth** | Connect your account for personalized experience |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+**
- **Git** (for repo cloning)
- **Docker** (optional, for database)

### 1. Clone & Install

```bash
git clone https://github.com/Radix-Obsidian/ShepScan.git
cd ShepScan
```

### 2. Start Backend

```bash
cd apps/api
npm install
npm run start:dev
```

### 3. Start Frontend

```bash
cd apps/web
npm install
npm run dev
```

### 4. Open Dashboard

Navigate to **http://localhost:3000** and scan your first repo!

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│                    Next.js 15 + React                        │
│              TailwindCSS + shadcn/ui                         │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API
┌─────────────────────▼───────────────────────────────────────┐
│                        Backend                               │
│                      NestJS 10                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Scan Module │  │  AI Module  │  │    Auth Module      │  │
│  │ • Detection │  │ • Classify  │  │ • GitHub OAuth      │  │
│  │ • Git Clone │  │ • Explain   │  │ • JWT Sessions      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                     Infrastructure                           │
│        PostgreSQL (Prisma) • Redis • OpenAI/Anthropic        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Product Requirements (PRD)](.agent/workflow/PRD.md) | Vision, goals, and user stories |
| [System Design (SDD)](.agent/workflow/SDD.md) | Architecture and module breakdown |
| [Technical Design (TDD)](.agent/workflow/TDD.md) | Implementation details and APIs |

---

## 🔧 Configuration

Create `apps/api/.env`:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/shepscan"

# AI Provider (choose one)
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# JWT
JWT_SECRET=your-secure-secret-here
```

---

## 🗺️ Roadmap

### ✅ v0.1.0 — MVP (Current)
- [x] Secret detection engine (13 patterns)
- [x] GitHub repo scanning
- [x] AI classification (OpenAI/Anthropic)
- [x] Founder-friendly explanations
- [x] Severity heat map
- [x] GitHub OAuth

### 🔜 v0.2.0 — Prevention
- [ ] Pre-commit hooks
- [ ] GitHub App integration
- [ ] Real-time push protection
- [ ] Slack/Discord notifications

### 🔮 v0.3.0 — Enterprise
- [ ] Private repo scanning
- [ ] Team management
- [ ] Audit logs
- [ ] SSO/SAML

---

## 🤝 Contributing

We welcome contributions! ShepScan is an **open-core** project.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🐑 About Golden Sheep AI

ShepScan is built by **Golden Sheep AI**, a bootstrapped pre-seed startup focused on developer security tools.

**Our Philosophy:** *Build narrow. Test deep. Ship confidently.*

<div align="center">
  <br />
  <a href="https://github.com/Radix-Obsidian/ShepScan/discussions">💬 Discussions</a> •
  <a href="https://github.com/Radix-Obsidian/ShepScan/issues">🐛 Issues</a> •
  <a href="https://github.com/Radix-Obsidian/ShepScan/releases">📦 Releases</a>
  <br /><br />
  <sub>Made with 🤍 by developers, for developers</sub>
</div>
