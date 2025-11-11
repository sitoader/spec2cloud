# Task 014: Azure Deployment Configuration and CI/CD Pipeline

**Feature**: Deployment & DevOps  
**Dependencies**: All feature tasks (001-013)  
**Estimated Complexity**: Medium

---

## Description

Configure Azure resources and GitHub Actions CI/CD pipeline for automated deployment of backend API and frontend web app to Azure.

---

## Technical Requirements

### Azure Resources

Create Azure resources:

#### **Resource Group**
- Name: `rg-booktracker-{environment}`
- Region: East US (or preferred region)

#### **Azure SQL Database**
- Server: `sql-booktracker-{environment}`
- Database: `BookTrackerDb`
- Tier: Serverless (General Purpose)
- Compute: 0.5-2 vCores
- Auto-pause: 60 minutes
- Max storage: 10 GB

#### **Azure App Service Plan**
- Name: `asp-booktracker-{environment}`
- Tier: Basic B1 (for production), Free F1 (for dev)
- OS: Linux

#### **Azure App Services** (2)
1. Backend API:
   - Name: `app-booktracker-api-{environment}`
   - Runtime: .NET 8
   - HTTPS only: Enabled
   
2. Frontend Web:
   - Name: `app-booktracker-web-{environment}`
   - Runtime: Node 20 LTS
   - HTTPS only: Enabled

#### **Azure OpenAI**
- Resource: `openai-booktracker-{environment}`
- Deployment: gpt-4o model
- Region: East US or available region

#### **Azure Key Vault**
- Name: `kv-booktracker-{environment}`
- Store secrets: SQL connection string, JWT secret, OpenAI API key
- Grant App Service managed identity access

#### **Application Insights**
- Name: `appi-booktracker-{environment}`
- Connected to both App Services
- Log Analytics workspace

### App Service Configuration

#### Backend App Settings:
```json
{
  "ConnectionStrings__DefaultConnection": "@Microsoft.KeyVault(SecretUri=...)",
  "JwtSettings__SecretKey": "@Microsoft.KeyVault(SecretUri=...)",
  "JwtSettings__Issuer": "https://app-booktracker-api-{environment}.azurewebsites.net",
  "JwtSettings__Audience": "BookTrackerApp",
  "AzureOpenAI__Endpoint": "https://openai-booktracker-{environment}.openai.azure.com/",
  "AzureOpenAI__ApiKey": "@Microsoft.KeyVault(SecretUri=...)",
  "AzureOpenAI__DeploymentName": "gpt-4o",
  "APPLICATIONINSIGHTS_CONNECTION_STRING": "{app-insights-connection-string}"
}
```

#### Frontend Environment Variables:
```
NEXT_PUBLIC_API_URL=https://app-booktracker-api-{environment}.azurewebsites.net
```

### GitHub Actions Workflows

Create `.github/workflows/`:

#### `backend-ci-cd.yml`
```yaml
name: Backend CI/CD

on:
  push:
    branches: [main]
    paths: ['src/BookTracker.Api/**', 'src/BookTracker.Core/**', 'src/BookTracker.Infrastructure/**']
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'
      - name: Restore
        run: dotnet restore
      - name: Build
        run: dotnet build --no-restore --configuration Release
      - name: Test
        run: dotnet test --no-build --configuration Release --collect:"XPlat Code Coverage"
      - name: Check Coverage
        run: |
          # Fail if coverage < 85%
      - name: Publish
        run: dotnet publish --configuration Release --output ./publish
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: backend-app
          path: ./publish
  
  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v3
      - name: Deploy to Azure App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'app-booktracker-api-prod'
          publish-profile: ${{ secrets.AZURE_BACKEND_PUBLISH_PROFILE }}
```

#### `frontend-ci-cd.yml`
```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main]
    paths: ['book-tracker-web/**']
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
        working-directory: ./book-tracker-web
      - name: Lint
        run: npm run lint
        working-directory: ./book-tracker-web
      - name: Test
        run: npm test -- --coverage
        working-directory: ./book-tracker-web
      - name: Build
        run: npm run build
        working-directory: ./book-tracker-web
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: frontend-app
          path: ./book-tracker-web/.next
  
  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Azure App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'app-booktracker-web-prod'
          publish-profile: ${{ secrets.AZURE_FRONTEND_PUBLISH_PROFILE }}
```

### Database Migrations

Options for applying migrations:
1. **During deployment** (dev/staging): Run migrations programmatically on app startup
2. **Manual scripts** (production): Generate SQL scripts, review, apply manually

### Quality Gates

Enforce in CI/CD:
- [ ] Build succeeds (zero warnings)
- [ ] All tests pass
- [ ] Code coverage ≥85%
- [ ] ESLint passes (frontend)
- [ ] No security vulnerabilities (npm audit, dotnet list package --vulnerable)

---

## Acceptance Criteria

### Azure Resources
- [ ] All Azure resources created in correct region
- [ ] Resource naming follows convention
- [ ] SQL Database configured as serverless
- [ ] App Services configured with correct runtimes
- [ ] Azure OpenAI deployment active
- [ ] Key Vault stores all secrets
- [ ] App Services granted Key Vault access
- [ ] Application Insights connected

### App Service Configuration
- [ ] Backend app settings configured
- [ ] Connection strings reference Key Vault
- [ ] HTTPS only enforced
- [ ] CORS configured for frontend origin
- [ ] Frontend environment variables set
- [ ] Custom domains configured (optional)

### CI/CD Pipeline
- [ ] GitHub Actions workflows created
- [ ] Workflows trigger on push to main
- [ ] Workflows trigger on PR creation
- [ ] Build steps execute successfully
- [ ] Test steps execute with coverage check
- [ ] Deployment steps publish to Azure
- [ ] Secrets stored in GitHub secrets
- [ ] Publish profiles configured

### Database Migrations
- [ ] Migrations applied to Azure SQL Database
- [ ] Schema matches EF Core model
- [ ] Data integrity maintained

### Monitoring
- [ ] Application Insights logs requests
- [ ] Custom metrics tracked
- [ ] Errors logged with stack traces
- [ ] Alerts configured for failures

---

## Testing Requirements

### Deployment Tests

**Test Cases**:

1. **Backend Deployment**:
   - API accessible at Azure URL
   - Health check endpoint returns 200
   - Swagger UI accessible
   - Database connection successful
   - Azure OpenAI integration works
   
2. **Frontend Deployment**:
   - Web app accessible at Azure URL
   - Home page loads
   - API calls reach backend
   - Authentication works
   
3. **End-to-End**:
   - Register user → Login → Add book → Rate → Get recommendations
   - All features functional in deployed environment

---

## Definition of Done

- [ ] All Azure resources created
- [ ] App Services deployed and running
- [ ] Database migrations applied
- [ ] CI/CD pipelines functional
- [ ] Quality gates enforced
- [ ] Monitoring configured
- [ ] End-to-end tests pass in production
- [ ] Documentation updated with deployment instructions
- [ ] Code reviewed and approved
