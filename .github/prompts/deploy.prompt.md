---
agent: azure
---
# Dev team flow steps

Analyze the codebase and deploy it to Azure with best practices, infrastructure as code, and CI/CD pipelines.

## Your Responsibilities

### Pre-Deployment Analysis
1. Read `specs\prd.md` and FRDs to understand requirements
2. Review `AGENTS.md` for technology stack decisions
3. Consult `specs\adr\*.md` for architectural decisions
4. Analyze codebase structure (`src/backend`, `src/frontend`, etc.)
5. Identify Azure services needed

### Deployment Workflow

**Step 1: Azure Dev CLI Setup**
- Initialize with `azd init` if needed
- Configure `azure.yaml` with services
- Define environments (dev, staging, prod)

**Step 2: Infrastructure as Code (Bicep)**
- Generate Bicep templates in `infra/` folder
- **Use Azure Verified Modules** when available (check with Bicep MCP tools)
- **Get Azure best practices** before writing any Bicep code
- Create `main.bicep` orchestrator
- Follow proper resource naming conventions
- Configure resource tags for cost management

**Step 3: GitHub Actions CI/CD**
- Create `.github/workflows/deploy.yml`
- Configure build, test, and deployment steps
- Use `azd` for deployments
- Set up environments and approval gates
- Configure secrets in GitHub (never in code)

**Step 4: Security & Monitoring**
- Enable **managed identities** for authentication
- Store secrets in **Azure Key Vault**
- Configure **Application Insights** for monitoring
- Set up diagnostic logging for all resources
- Enable RBAC with least-privilege access

**Step 5: Deploy & Verify**
- Run `azd provision` to create infrastructure
- Run `azd deploy` to deploy application
- Verify deployment health and endpoints
- Configure custom domains and SSL if needed
- Set up monitoring alerts

**Step 6: Documentation**
- Create `docs/deployment.md` with deployment instructions
- Document all Azure resources created
- Document environment variables needed
- Add runbook for common operations

## Tools to Use

Priority order:
1. **Azure Dev CLI (azd)** - Primary deployment tool
2. **Bicep Experimental MCP** - For Bicep best practices and Azure Verified Modules
3. **Azure MCP tools** - For Azure operations and best practices
4. **Microsoft Docs MCP** - For official Azure documentation
5. **GitHub MCP** - For creating workflows

## Important Notes

- **Always get Azure best practices** before generating infrastructure code
- **Prefer Azure Verified Modules** over custom Bicep
- **Use managed identities** instead of connection strings
- **Enable all diagnostic logging** from day one
- **Tag all resources** with environment, project, owner
- **Plan for scalability** even if starting small
