
# spec2cloud

**Spec2Cloud** is an AI-powered development workflow that transforms high-level product ideas into production-ready applications deployed on Azure—using specialized GitHub Copilot agents working together.

https://github.com/user-attachments/assets/f0529e70-f437-4a14-93bc-4ab5a0450540

## 🎯 Overview

This repository provides a preconfigured development environment and agent-driven workflow that takes you from product concept to deployed application through a structured, step-by-step process.

## 🚀 Quick Start

**New to Spec2Cloud? Start here:**

📖 **[Complete Getting Started Guide](./GETTING_STARTED.md)** - Step-by-step walkthrough from idea to deployed app

⚡ **[Workflow Cheat Sheet](./WORKFLOW_CHEAT_SHEET.md)** - Quick reference for commands and agents

### TL;DR - The 3-Minute Version
1. **Open in Dev Container** - Everything is preconfigured
2. **Chat with `@pm`** - Share your app idea, then type `/prd` and `/frd`
3. **Chat with `@dev`** - Type `/plan` then `/implement` or `/delegate`
4. **Chat with `@azure`** - Type `/deploy` to get your app on Azure

**That's it!** Each agent guides you through their part of the process.

## 🏗️ Architecture

### Development Environment

The `.devcontainer/` folder provides a **ready-to-use development container** with:
- Python 3.12




- Azure CLI & Azure Developer CLI (azd)
- TypeScript
- Docker-in-Docker
- VS Code extensions: GitHub Copilot Chat, Azure Pack, AI Studio

### MCP Servers

The `.vscode/mcp.json` configures **Model Context Protocol servers** that give agents access to:
- **context7** - Up-to-date library documentation
- **github** - Repository management and operations
- **microsoft.docs.mcp** - Official Microsoft/Azure documentation
- **playwright** - Browser automation capabilities
- **deepcontext** - Repository context and understanding for external repos

### AI Agents (Chat Modes)

Four specialized agents in `.github/chatmodes/`:

#### 1. **PM Agent** (`@pm`) - Product Manager
- **Model**: o3-mini
- **Tools**: Edit files, search, fetch web content
- **Purpose**: Translates ideas into structured PRDs and FRDs
- **Instructions**: Asks clarifying questions, identifies business goals, creates living documentation

#### 2. **Dev Lead Agent** (`@dev-lead`) - Technical Lead
- **Model**: Claude Sonnet 4
- **Tools**: Read files, search, semantic analysis
- **Purpose**: Reads all standards from `standards/` and generates comprehensive `AGENTS.md`
- **Instructions**: Analyzes engineering standards, creates unified agent guidelines, establishes coding patterns
- **Usage**: Run `/generate-agents` at project start (can defer until before `/plan` and `/implement`)

#### 3. **Dev Agent** (`@dev`) - Developer
- **Model**: Claude Sonnet 4
- **Tools**: Full development suite + Context7, GitHub, Microsoft Docs, Copilot Coding Agent, AI Toolkit
- **Purpose**: Breaks down features into tasks, implements code, or delegates to GitHub Copilot
- **Instructions**: Analyzes specs, writes modular code, follows architectural patterns, creates GitHub issues

#### 4. **Azure Agent** (`@azure`) - Cloud Architect
- **Model**: Claude Sonnet 4
- **Tools**: Azure resource management, Bicep, deployment tools, infrastructure best practices
- **Purpose**: Deploys applications to Azure with IaC and CI/CD pipelines
- **Instructions**: Analyzes codebase, generates Bicep templates, creates GitHub Actions, uses Azure Dev CLI

## 📋 Simple Workflow

```
💡 Your Idea → @pm → @dev → @azure → � Deployed App
```

**Detailed workflow:**
```mermaid
graph LR
    A[� App Idea] --> B[@pm /prd]
    B --> C[@pm /frd]
    C --> D[@dev /plan]
    D --> E{Choose}
    E --> F[@dev /implement]
    E --> G[@dev /delegate]
    F --> H[@azure /deploy]
    G --> H
    H --> I[🚀 Live App]
```

### Workflow Steps

1. **`/prd`** - Product Requirements Document
   - PM Agent engages in conversation to understand the product vision
   - Creates `specs/prd.md` with goals, scope, requirements, and user stories
   - Living document that evolves with feedback

2. **`/frd`** - Feature Requirements Documents
   - PM Agent decomposes the PRD into individual features
   - Creates files in `specs/features/` for each feature
   - Defines inputs, outputs, dependencies, and acceptance criteria

3. **`/generate-agents`** - Generate Agent Guidelines (Optional)
   - Dev Lead Agent reads all standards from `standards/` directory
   - Consolidates engineering standards into comprehensive `AGENTS.md`
   - Can be run at project start or deferred until before `/plan` and `/implement`
   - **Must be completed before planning and implementation begins**

4. **`/plan`** - Technical Planning
   - Dev Agent analyzes FRDs and creates technical task breakdowns
   - Creates files in `specs/tasks/` with implementation details
   - Identifies dependencies, estimates complexity, defines scaffolding needs

5. **`/implement`** OR **`/delegate`** - Implementation
   - **Option A (`/implement`)**: Dev Agent writes code directly in `src/backend` and `src/frontend`
   - **Option B (`/delegate`)**: Dev Agent creates GitHub Issues with full task descriptions and assigns to GitHub Copilot Coding Agent
   
6. **`/deploy`** - Azure Deployment
   - Azure Agent analyzes the codebase
   - Generates Bicep IaC templates
   - Creates GitHub Actions workflows for CI/CD
   - Deploys to Azure using Azure Dev CLI and MCP tools

## 📁 Documentation Structure

The workflow creates living documentation:

```
specs/
├── prd.md              # Product Requirements Document
├── features/           # Feature Requirements Documents
│   ├── feature-1.md
│   └── feature-2.md
└── tasks/              # Technical Task Specifications
    ├── task-1.md
    └── task-2.md

src/
├── backend/            # Backend implementation
└── frontend/           # Frontend implementation

standards/
├── general/            # General engineering standards
├── backend/            # Backend-specific standards
└── frontend/           # Frontend-specific standards

AGENTS.md               # Consolidated agent guidelines (generated)
mkdocs.yml              # MKdocs configuration for documentation site
docs/                   # MKdocs documentation source files
```

### Documentation with MKdocs

This repository is configured with **MKdocs** for generating beautiful project documentation:

- **Configuration**: `mkdocs.yml` contains site settings and navigation
- **Source Files**: Documentation markdown files in `docs/` directory
- **Standards**: Documentation practices defined in `standards/general/documentation-guidelines.md`
- **Build & Serve**: Use MKdocs commands to preview and deploy documentation

The documentation standards ensure consistency, accessibility, and maintainability across all project documentation.

## 🔧 Managing Standards with Git Subtrees

This repository uses **git subtrees** to integrate engineering standards from external repositories. The `standards/` folder contains subtrees from three separate guideline repositories.

### Technology-Specific Standards via Branches

Each standards repository uses **branches** to organize technology-specific rules:

- **Backend Standards**: Choose between `dotnet` or `python` branches
- **Frontend Standards**: Choose between `react`, `angular`, or other framework branches
- **General Standards**: Use `main` branch for universal guidelines

This approach allows you to pull only the standards relevant to your tech stack.

### Adding Subtrees (Initial Setup)

When setting up the repository, specify the appropriate branch for your tech stack:

```bash
# General standards (always use main)
git subtree add --prefix standards/general https://github.com/EmeaAppGbb/spec2cloud-guidelines.git main --squash

# Backend standards - choose your stack
git subtree add --prefix standards/backend https://github.com/EmeaAppGbb/spec2cloud-guidelines-backend.git dotnet --squash
# OR
git subtree add --prefix standards/backend https://github.com/EmeaAppGbb/spec2cloud-guidelines-backend.git python --squash

# Frontend standards - choose your framework
git subtree add --prefix standards/frontend https://github.com/EmeaAppGbb/spec2cloud-guidelines-frontend.git react --squash
# OR
git subtree add --prefix standards/frontend https://github.com/EmeaAppGbb/spec2cloud-guidelines-frontend.git angular --squash
```

### Updating Subtrees

To pull the latest changes from the upstream guideline repositories, use the same branch:

```bash
# Update general standards
git subtree pull --prefix standards/general https://github.com/EmeaAppGbb/spec2cloud-guidelines.git main --squash

# Update backend standards (use your chosen branch)
git subtree pull --prefix standards/backend https://github.com/EmeaAppGbb/spec2cloud-guidelines-backend.git dotnet --squash

# Update frontend standards (use your chosen branch)
git subtree pull --prefix standards/frontend https://github.com/EmeaAppGbb/spec2cloud-guidelines-frontend.git react --squash
```

> **Note**: The `--squash` flag combines all commits from the subtree repository into a single commit, keeping the history clean.

### Switching Technology Stacks

If you need to switch to a different tech stack (e.g., from React to Angular), remove the old subtree and add the new one:

```bash
# Remove old subtree
git rm -r standards/frontend
git commit -m "Remove React standards"

# Add new subtree
git subtree add --prefix standards/frontend https://github.com/EmeaAppGbb/spec2cloud-guidelines-frontend.git angular --squash
```

## 🎓 Example Usage

```bash
# Start with your product idea
"I want to create a smart AI agent for elderly care that tracks vitals and alerts caregivers"

# Step 1: Create the PRD
/prd

# Step 2: Break down into features
/frd

# Step 3: Generate agent guidelines from standards (optional, can defer)
/generate-agents

# Step 4: Create technical plans
/plan

# Step 5a: Implement locally
/implement

# OR Step 5b: Delegate to GitHub Copilot
/delegate

# Step 6: Deploy to Azure
/deploy
```

## 🔑 Key Benefits

- **Zero Setup** - Dev container has everything preconfigured
- **Structured Process** - Clear workflow from idea to production
- **AI-Powered** - Specialized agents handle different aspects
- **Best Practices** - Built-in architectural guidance via `AGENTS.md`
- **Flexible Implementation** - Choose local development or delegation
- **Azure-Ready** - Automated IaC and CI/CD generation

## 📖 Learn More

### 📚 Documentation & Guides
- **[Getting Started Guide](./GETTING_STARTED.md)** - Complete step-by-step walkthrough
- **[Workflow Cheat Sheet](./WORKFLOW_CHEAT_SHEET.md)** - Quick command reference
- **[Example Walkthrough](./EXAMPLE_WALKTHROUGH.md)** - See a full app built start to finish
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Solutions to common issues
- `AGENTS.md` - Comprehensive engineering guidelines (generated by dev lead)

### 🔧 Technical Details
- `.github/agents/` - Agent configurations and instructions
- `.github/prompts/` - Prompt templates for each workflow step
- `.vscode/mcp.json` - Model Context Protocol server configurations
- `.devcontainer/` - Development environment setup

## 🤝 Contributing

Contributions welcome! Extend with additional agents, prompts, or MCP servers.

---

**From idea to production in minutes, not months.** 🚀
