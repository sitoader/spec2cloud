```prompt
---
agent: architect
---
# Create Project Standards Structure

Your task is to create and populate the project standards structure based on Architecture Decision Records (ADRs) and project requirements.

## When to Use This Command

Use `/create-standards` when:
- Starting a new project after ADRs are created
- Technology stack has been decided (documented in ADRs)
- Before generating AGENTS.md (which synthesizes these standards)
- When adopting new technology domains (e.g., adding AI/ML to existing project)

## Input Requirements

Before creating standards, read and analyze:
1. **Architecture Decision Records** - `specs/adr/*.md` (all ADRs)
2. **Product Requirements** - `specs/prd.md`
3. **Feature Requirements** - `specs/features/*.md`

The ADRs will tell you:
- What technology stack was chosen
- Why those choices were made
- What constraints and principles guide development
- What quality gates and testing strategies apply

## Standards Folder Structure

Create the following structure:

```
standards/
├── general/          # Cross-cutting principles for all development
│   ├── principles.md
│   ├── security.md
│   ├── testing.md
│   ├── quality-gates.md
│   └── git-workflow.md
├── backend/          # Backend-specific guidelines (if applicable)
│   ├── api-design.md
│   ├── database.md
│   ├── authentication.md
│   └── error-handling.md
├── frontend/         # Frontend-specific guidelines (if applicable)
│   ├── components.md
│   ├── state-management.md
│   ├── styling.md
│   └── performance.md
├── data/             # Data engineering guidelines (if applicable)
│   ├── data-modeling.md
│   └── etl-patterns.md
├── ai/               # AI/ML guidelines (if applicable)
│   ├── prompt-engineering.md
│   ├── model-integration.md
│   └── ai-observability.md
└── deployment/       # Deployment and infrastructure guidelines
    ├── azure-resources.md
    ├── ci-cd.md
    └── monitoring.md
```

**Note**: Only create domain folders that are relevant to the project based on ADRs.

## Workflow Steps

### Step 1: Analyze ADRs
Read all ADRs to understand:
- What technologies were chosen (frontend, backend, database, cloud)
- What architectural patterns to follow (REST, microservices, serverless)
- What quality standards are required (testing, security, performance)
- What deployment approach is used (Azure services, IaC, CI/CD)

### Step 2: Determine Domain Folders
Based on ADRs, decide which domain folders to create:

**Always create**:
- ✅ `standards/general/` - Every project needs cross-cutting principles

**Create if backend exists**:
- ✅ `standards/backend/` - If ADRs mention backend framework (Node, Python, .NET, etc.)

**Create if frontend exists**:
- ✅ `standards/frontend/` - If ADRs mention frontend framework (React, Angular, Vue, etc.)

**Create if data-intensive**:
- ✅ `standards/data/` - If ADRs mention databases, data pipelines, ETL, analytics

**Create if AI/ML project**:
- ✅ `standards/ai/` - If ADRs mention OpenAI, ML models, embeddings, agents

**Create if cloud deployment**:
- ✅ `standards/deployment/` - If ADRs mention Azure, AWS, infrastructure

### Step 3: Research Best Practices
For each technology chosen in ADRs, research current best practices using:

**Context7**: For library-specific documentation
```
Example: If ADR chose Next.js, research Next.js best practices
```

**DeepWiki**: For reference implementations in similar projects
```
Example: Search for projects using similar stack
```

**Microsoft Docs MCP**: For Microsoft/Azure technologies
```
Example: If using Azure OpenAI, get official best practices
```

### Step 4: Create Standards Files

For each domain, create focused standards files:

#### General Standards (`standards/general/`)

**`principles.md`**:
```markdown
# Development Principles

## Guiding Principles
[Extract from ADRs and PRD]
- Simplicity first
- Security by design
- Performance-conscious
- etc.

## Code Quality
- Type safety requirements
- Code review standards
- Documentation requirements

## Error Handling
- Error handling patterns
- Logging standards
- Exception management
```

**`security.md`**:
```markdown
# Security Standards

## Authentication & Authorization
[Based on auth ADR]

## Input Validation
[Security requirements from ADRs]

## Data Protection
[Compliance and security requirements]

## Security Checklist
- [ ] Specific security requirements
```

**`testing.md`**:
```markdown
# Testing Standards

## Coverage Requirements
[From quality gates ADR]

## Test Types
- Unit tests
- Integration tests
- E2E tests (if applicable)

## Testing Frameworks
[From ADRs - Jest, Pytest, etc.]
```

**`quality-gates.md`**:
```markdown
# Quality Gates

## Code Quality
- Linting rules
- Code coverage thresholds
- Performance benchmarks

## Pre-merge Checklist
- [ ] All tests pass
- [ ] Code coverage ≥X%
- [ ] Security scan passes
```

**`git-workflow.md`**:
```markdown
# Git Workflow

## Branching Strategy
[Team workflow]

## Commit Messages
[Convention - Conventional Commits, etc.]

## Pull Request Process
[Review requirements]
```

#### Backend Standards (`standards/backend/`)

Create based on backend technology from ADRs:

**`api-design.md`**:
```markdown
# API Design Standards

## RESTful Conventions
[Based on API design ADR]

## Request/Response Format
[JSON structure, error formats]

## Versioning Strategy
[API versioning approach]

## Authentication
[How APIs are authenticated]
```

**`database.md`**:
```markdown
# Database Standards

## Schema Design
[Based on database ADR]

## Query Optimization
[Performance patterns]

## Migrations
[Migration strategy and tools]

## Data Access Patterns
[ORM usage, raw queries, etc.]
```

**`authentication.md`**:
```markdown
# Authentication Standards

## Strategy
[Based on auth ADR - JWT, OAuth, etc.]

## Token Management
[Token lifecycle, refresh, expiration]

## Password Security
[Hashing, salting, requirements]
```

**`error-handling.md`**:
```markdown
# Error Handling Standards

## Error Response Format
[Consistent error structure]

## HTTP Status Codes
[When to use each code]

## Logging
[What to log, log levels]
```

#### Frontend Standards (`standards/frontend/`)

Create based on frontend technology from ADRs:

**`components.md`**:
```markdown
# Component Standards

## Component Design
[Functional vs class, composition patterns]

## TypeScript Usage
[Type safety requirements]

## Props and State
[Best practices for data flow]

## File Organization
[Folder structure, naming conventions]
```

**`state-management.md`**:
```markdown
# State Management Standards

## Strategy
[Based on state management ADR - Context, Redux, Zustand]

## When to Use Global State
[Guidelines for state elevation]

## Data Fetching
[Patterns for API calls, caching]
```

**`styling.md`**:
```markdown
# Styling Standards

## Approach
[Based on styling ADR - Tailwind, CSS Modules, etc.]

## Responsive Design
[Breakpoints, mobile-first]

## Accessibility
[WCAG compliance level]

## Theme Management
[Colors, spacing, typography]
```

**`performance.md`**:
```markdown
# Frontend Performance Standards

## Code Splitting
[Lazy loading patterns]

## Image Optimization
[Image formats, lazy loading]

## Bundle Size
[Maximum bundle sizes]

## Lighthouse Scores
[Minimum acceptable scores]
```

#### AI Standards (`standards/ai/`)

Only create if AI/ML is in the project:

**`prompt-engineering.md`**:
```markdown
# Prompt Engineering Standards

## Prompt Structure
[How to structure prompts]

## Context Management
[Token limits, context windows]

## Response Parsing
[Handling AI responses]

## Error Handling
[Dealing with AI failures]
```

**`model-integration.md`**:
```markdown
# Model Integration Standards

## Azure OpenAI Configuration
[Based on AI ADR]

## Rate Limiting
[Handling API limits]

## Caching Strategy
[When to cache AI responses]

## Cost Management
[Token usage optimization]
```

#### Deployment Standards (`standards/deployment/`)

**`azure-resources.md`**:
```markdown
# Azure Resources Standards

## Resource Naming
[Naming conventions]

## Resource Organization
[Resource groups, tagging]

## Services Used
[Based on infrastructure ADR]
- App Service / Container Apps / Static Web Apps
- Database services
- etc.
```

**`ci-cd.md`**:
```markdown
# CI/CD Standards

## Pipeline Structure
[Based on deployment ADR]

## Environments
[dev, staging, production]

## Deployment Strategy
[Blue-green, canary, etc.]

## Secrets Management
[Key Vault, GitHub Secrets]
```

**`monitoring.md`**:
```markdown
# Monitoring and Observability

## Application Insights
[What to monitor]

## Logging Standards
[Log levels, structured logging]

## Alerts
[What triggers alerts]

## Dashboards
[Key metrics to track]
```

### Step 5: Populate with Technology-Specific Content

For each standards file:
1. **Extract principles from ADRs** - Use decisions and rationale
2. **Research best practices** - Use Context7, DeepWiki, Microsoft Docs
3. **Add concrete examples** - Show, don't just tell
4. **Include checklists** - Make standards actionable
5. **Reference ADRs** - Link back to architectural decisions

### Step 6: Validate Completeness

Ensure each standards file has:
- ✅ Clear purpose and scope
- ✅ Specific, actionable guidelines
- ✅ Code examples where helpful
- ✅ References to ADRs that informed the standards
- ✅ Checklists for compliance

### Step 7: Prepare for AGENTS.md Generation

Once standards are created:
- All domain folders populated with relevant standards
- Each file has concrete, actionable content
- Standards align with ADR decisions
- Ready to invoke `/generate-agents` to synthesize into AGENTS.md

## Quality Guidelines

### Must Have:
- ✅ Standards aligned with ADR decisions
- ✅ Technology-specific best practices researched
- ✅ Concrete examples, not just theory
- ✅ Actionable checklists
- ✅ Proper folder structure

### Should Have:
- ✅ References to ADRs
- ✅ Code snippets demonstrating patterns
- ✅ Links to official documentation
- ✅ Common pitfalls and how to avoid them

### Avoid:
- ❌ Creating domain folders not relevant to project
- ❌ Generic advice not specific to chosen technologies
- ❌ Duplicating ADR content (reference instead)
- ❌ Overly prescriptive rules that limit flexibility
- ❌ Standards that conflict with ADR decisions

## Example Workflow

```
User: "Create project standards based on ADRs"

Architect:
1. Reads all ADRs in specs/adr/
   - 0001-frontend-framework.md → Chose Next.js + React + TypeScript
   - 0002-backend-framework.md → Chose Node.js + Express
   - 0003-database.md → Chose PostgreSQL with Prisma
   - 0004-deployment.md → Chose Azure App Service
   - 0005-ai-integration.md → Chose Azure OpenAI

2. Determines domain folders needed:
   ✅ standards/general/ (always)
   ✅ standards/backend/ (Node.js + Express)
   ✅ standards/frontend/ (Next.js + React)
   ✅ standards/ai/ (Azure OpenAI)
   ✅ standards/deployment/ (Azure)
   ❌ standards/data/ (not data-intensive project)

3. Researches best practices:
   - Uses Context7 for Next.js, React, Express documentation
   - Uses Microsoft Docs for Azure OpenAI patterns
   - Uses DeepWiki for similar project implementations

4. Creates and populates all standards files

5. Validates completeness

6. Reports: "Standards structure created. Ready to generate AGENTS.md with /generate-agents"
```

## After Creating Standards

Once standards are created:
1. **Review completeness**: Ensure all technologies from ADRs are covered
2. **Invoke `/generate-agents`**: Synthesize standards into AGENTS.md
3. **Handoff to DevLead**: For validation against requirements
4. **Update as needed**: Standards are living documents

## Important Notes

- Standards should be **specific to your technology choices**, not generic
- **Extract from ADRs** - Don't invent new decisions, use what was already decided
- **Research deeply** - Use tools to get current best practices
- **Make actionable** - Include checklists, examples, patterns
- **Keep focused** - Each file should have a clear, narrow scope
- **Reference, don't duplicate** - Link to ADRs rather than repeating them
- Standards **evolve** - Update as implementation reveals better patterns
```
