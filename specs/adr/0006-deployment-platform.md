# ADR-0006: Deployment Platform

**Status**: Proposed  
**Date**: 2025-11-11  
**Decision Makers**: Architect  
**Related ADRs**: ADR-0001 (Frontend), ADR-0002 (Backend)  
**Related Requirements**: PRD REQ-6, REQ-7, REQ-8, REQ-9, REQ-10; All FRDs

---

## Context and Problem Statement

We need to select an Azure deployment platform for hosting both the Next.js frontend (ADR-0001) and ASP.NET Core backend API (ADR-0002). The solution must support:

1. **Next.js SSR capabilities**: Support for server-side rendering and API routes
2. **ASP.NET Core API hosting**: Reliable, performant hosting for .NET 8 backend
3. **Integrated deployment**: Frontend and backend deployed together with minimal complexity
4. **Global distribution**: Static assets served from CDN for optimal performance
5. **Cost optimization**: Align with simplicity-first mandate and budget constraints
6. **Azure-native integration**: Seamless integration with Azure SQL Database (ADR-0003), Azure OpenAI (ADR-0005), and ASP.NET Core Identity (ADR-0004)

### Deployment Considerations from ADRs

- **Next.js (ADR-0001)**: Uses App Router with server-side rendering, requires Node.js runtime for SSR
- **ASP.NET Core (ADR-0002)**: .NET 8 minimal API pattern, requires .NET runtime
- **Azure SQL Database (ADR-0003)**: Serverless tier, requires network connectivity from both frontend and backend
- **Authentication (ADR-0004)**: JWT tokens issued by backend API, frontend validates via httpOnly cookies
- **Azure OpenAI (ADR-0005)**: Called from backend API, not directly from frontend

### Key Decision Factors

1. **Simplicity**: Minimize deployment complexity and maintenance overhead
2. **Cost**: Optimize for low-cost production deployment (small app, limited users initially)
3. **Performance**: Ensure fast page loads via CDN for static assets, low-latency API calls
4. **Developer Experience**: Easy local development, straightforward CI/CD pipeline
5. **Scalability**: Support growth from initial deployment to production scale
6. **Azure Integration**: Leverage Azure-native features for monitoring, security, networking

---

## Considered Options

### Option 1: Azure Static Web Apps (Hybrid Next.js) + Managed Backend

**Architecture**: 
- **Frontend**: Azure Static Web Apps with hybrid Next.js support (preview)
- **Backend**: Managed App Service instance automatically provisioned by Static Web Apps OR linked custom App Service (S1 or higher)
- **Static Assets**: Globally distributed via Static Web Apps CDN
- **SSR**: Next.js server-side rendering handled by managed or linked App Service backend

**How It Works**:
- Static Web Apps deploys Next.js application with full SSR support
- Static assets (.js, .css, images) served from global CDN
- Server-rendered pages and API routes (`/api/*`) executed on managed App Service backend
- ASP.NET Core API can be linked as separate backend or deployed alongside

**Pros**:
- **Unified deployment model**: Single Azure resource for frontend with optional linked backend
- **Global CDN**: Static assets automatically distributed globally for fast loads
- **Zero-config SSL**: Free SSL certificates automatically provisioned and renewed
- **GitHub integration**: Built-in CI/CD from GitHub repository
- **Free tier available**: Static Web Apps Free tier for development/testing
- **Next.js optimized**: Purpose-built for Next.js with all features supported (App Router, RSC, middleware)
- **Simplicity**: Minimal configuration, focused developer experience
- **Staging environments**: 3 free staging environments (Free tier) or 10 (Standard tier)

**Cons**:
- **Preview status**: Hybrid Next.js support is currently in preview (potential instability)
- **Linked backend required for ASP.NET Core**: Need separate App Service resource for .NET API (S1 tier minimum = ~$54/month)
- **Two-resource model**: Static Web App + App Service = more complex than single-resource option
- **Size limitations**: 250 MB max app size (hybrid Next.js with managed backend), requires standalone build optimization
- **Unsupported features in preview**: Cannot link Azure Container Apps/API Management/Functions to hybrid Next.js apps
- **Limited SSR control**: Managed backend has less configuration flexibility than self-hosted
- **Standard plan required**: Full features (custom domains, linked backends) require Standard tier (~$9/month for Static Web App + ~$54/month for S1 App Service)

**Cost Estimate**:
- Static Web Apps Standard: ~$9/month
- App Service S1 (for ASP.NET Core API): ~$54/month  
- Azure SQL Database Serverless: ~$5/month (from ADR-0003)
- Azure OpenAI Service: ~$330/month (from ADR-0005)
- **Total**: ~$398/month (~$68 excluding AI service)

**References**:
- [Deploy hybrid Next.js websites on Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/deploy-nextjs-hybrid)
- [API support with Azure App Service](https://learn.microsoft.com/en-us/azure/static-web-apps/apis-app-service)
- [Static Web Apps pricing](https://azure.microsoft.com/pricing/details/app-service/static/)

---

### Option 2: Separate Azure App Service for Frontend + Backend

**Architecture**:
- **Frontend**: Azure App Service (Linux) running Next.js with Node.js runtime
- **Backend**: Azure App Service (Linux/Windows) running ASP.NET Core .NET 8
- **Deployment**: Two separate App Service plans or shared plan with two apps

**How It Works**:
- Next.js app deployed as Node.js application on App Service
- ASP.NET Core API deployed to separate App Service instance
- Frontend calls backend API via CORS-enabled endpoints
- Both can share App Service Plan (Basic tier or higher) for cost optimization

**Pros**:
- **Mature service**: App Service is production-proven, no preview features
- **Full control**: Complete control over both frontend and backend environments
- **Flexible scaling**: Independent scaling for frontend and backend
- **Rich features**: Deployment slots, auto-scaling, monitoring, easy rollbacks
- **Shared plan option**: Can host both apps on single Basic B1 plan for cost savings (~$13/month)
- **Standard deployment model**: Well-documented, widely used pattern
- **No size limits**: Unlike Static Web Apps, no strict app size constraints
- **Integrated monitoring**: Application Insights, Azure Monitor built-in

**Cons**:
- **No global CDN**: Static assets served from single region unless using Azure CDN separately (~$0.081/GB + $0.008/10k requests)
- **More configuration**: Must configure CORS, custom domains, SSL certificates manually
- **Higher complexity**: Two resources to manage, configure, and monitor
- **No built-in staging**: Deployment slots require Standard tier or higher (~$97/month)
- **SSL certificate management**: Must configure and renew certificates (free via App Service managed certificates)
- **CI/CD setup**: Requires manual GitHub Actions workflow or Azure DevOps pipeline configuration
- **SSR overhead**: Next.js SSR adds compute overhead on App Service instance

**Cost Estimate**:
- App Service Plan B1 (shared for both apps): ~$13/month
- OR App Service Plan S1 (for staging slots): ~$54/month
- Azure SQL Database Serverless: ~$5/month
- Azure OpenAI Service: ~$330/month
- **Total (Basic)**: ~$348/month (~$18 excluding AI service)
- **Total (Standard)**: ~$389/month (~$59 excluding AI service)

**References**:
- [Deploy ASP.NET Core apps to Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/quickstart-dotnetcore)
- [Deploy Node.js apps to Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs)
- [App Service pricing](https://azure.microsoft.com/pricing/details/app-service/linux/)

---

### Option 3: Azure Container Apps (Frontend + Backend in Containers)

**Architecture**:
- **Frontend**: Next.js containerized application deployed to Azure Container Apps
- **Backend**: ASP.NET Core containerized application deployed to Azure Container Apps
- **Container Registry**: Azure Container Registry to store Docker images
- **Orchestration**: Managed by Azure Container Apps (Kubernetes-based)

**How It Works**:
- Build Docker images for Next.js and ASP.NET Core applications
- Push images to Azure Container Registry
- Deploy containers to Azure Container Apps environment
- Container Apps handles orchestration, scaling, ingress routing

**Pros**:
- **Modern deployment model**: Container-based, aligned with cloud-native practices
- **Unified platform**: Single Azure Container Apps environment hosts both frontend and backend
- **Flexible scaling**: Scale to zero, event-driven scaling, auto-scaling based on HTTP traffic
- **Kubernetes-lite**: Kubernetes benefits without cluster management complexity
- **Microservices-ready**: Easy to add more services (e.g., background jobs) later
- **Language agnostic**: Supports any containerized workload
- **Integrated networking**: Built-in service discovery, internal/external ingress
- **Rich monitoring**: Azure Monitor, Application Insights, Log Analytics integration

**Cons**:
- **Container complexity**: Requires Docker knowledge, Dockerfile maintenance, image building
- **No global CDN**: Static assets served from regional Container Apps unless using Azure CDN separately
- **Build pipeline overhead**: Must build container images in CI/CD pipeline (slower deployments)
- **Cost**: Container Apps consumption tier has minimums, dedicated environment costs (~$0.18/vCPU-hour + ~$0.02/GiB-hour)
- **Overkill for simple app**: Container orchestration adds unnecessary complexity for two-component app
- **Learning curve**: Requires understanding containers, registries, Container Apps concepts
- **Registry costs**: Azure Container Registry Basic (~$5/month) required for image storage
- **Cold starts**: Scale-to-zero can introduce latency on first request

**Cost Estimate**:
- Container Apps Consumption (2 apps, minimal load): ~$30/month
- OR Container Apps Workload Profiles (dedicated): ~$100+/month
- Azure Container Registry Basic: ~$5/month
- Azure SQL Database Serverless: ~$5/month
- Azure OpenAI Service: ~$330/month
- **Total (Consumption)**: ~$370/month (~$40 excluding AI service)
- **Total (Dedicated)**: ~$440+/month (~$110+ excluding AI service)

**References**:
- [Deploy to Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/quickstart-portal)
- [Comparing Container Apps with other options](https://learn.microsoft.com/en-us/azure/container-apps/compare-options)
- [Container Apps pricing](https://azure.microsoft.com/pricing/details/container-apps/)

---

## Decision

**Selected Option**: **Option 2: Separate Azure App Service for Frontend + Backend**

### Rationale

After evaluating all options against the project's requirements and constraints, **Option 2** best aligns with the **simplicity-first mandate** while providing a **mature, cost-effective deployment solution**.

#### Key Decision Factors

1. **Simplicity and Maturity**
   - App Service is a **proven, production-grade platform** with extensive documentation
   - No preview features (vs. Static Web Apps hybrid Next.js in preview)
   - No container complexity (vs. Container Apps requiring Docker expertise)
   - Standard deployment model familiar to most developers
   - Straightforward troubleshooting and support

2. **Cost Optimization**
   - **Basic B1 shared plan**: Both Next.js and ASP.NET Core apps can run on a single Basic B1 plan (~$13/month)
   - Significantly cheaper than Static Web Apps Standard + S1 App Service (~$63/month)
   - Lower than Container Apps consumption tier (~$35/month including registry)
   - Scales up to Standard tier (~$54/month) when staging slots or higher performance needed
   - **Total infrastructure cost (excluding AI)**: ~$18/month (Basic) or ~$59/month (Standard)

3. **Developer Experience**
   - **Familiar workflow**: Standard App Service deployment via GitHub Actions or Azure DevOps
   - Built-in deployment slots (Standard tier) for blue-green deployments
   - Easy local development: Run Next.js and ASP.NET Core locally without Docker
   - Rich tooling: VS Code Azure extension, Azure CLI, Azure portal
   - No Docker complexity: Deploy code directly without building/managing containers

4. **Production Readiness**
   - **No preview dependencies**: All features are GA (generally available)
   - Comprehensive monitoring: Application Insights, Azure Monitor, log streaming
   - Proven at scale: Used by thousands of production applications
   - Security features: Managed certificates, private endpoints (Standard+), VNET integration
   - High SLA: 99.95% uptime SLA (Standard tier and above)

5. **Trade-offs Accepted**
   - **No global CDN**: Static assets served from single region
     - Mitigation: Add Azure CDN later if global performance becomes priority (~$10-20/month)
     - Context: Initial user base likely regional, global CDN not critical for MVP
   - **Manual CORS configuration**: Must configure CORS for frontend-backend communication
     - Mitigation: One-time configuration, well-documented pattern
   - **No built-in staging (Basic tier)**: Basic B1 doesn't include deployment slots
     - Mitigation: Can deploy to separate "staging" app service initially, upgrade to Standard when needed

6. **Alignment with Architecture Decisions**
   - **Next.js (ADR-0001)**: App Service fully supports Next.js SSR via Node.js runtime
   - **ASP.NET Core (ADR-0002)**: App Service is the default, recommended platform for .NET apps
   - **Azure SQL (ADR-0003)**: Seamless connectivity from App Service with managed identity support
   - **Azure OpenAI (ADR-0005)**: Direct integration from App Service backend
   - **Authentication (ADR-0004)**: No special requirements, works identically on App Service

#### Why Not Option 1 (Static Web Apps Hybrid)?

- **Preview risk**: Hybrid Next.js is in preview, potential breaking changes or instability
- **Higher cost**: Standard tier (~$9/month) + S1 App Service (~$54/month) = ~$63/month vs. B1 (~$13/month)
- **Complexity of linking**: Requires configuring linked backend, managing two resources
- **Size limitations**: 250 MB limit requires careful optimization
- **Limited flexibility**: Cannot use linked Container Apps/Functions/API Management in preview
- **Benefit not justified**: Global CDN is main advantage, but not critical for initial user base

#### Why Not Option 3 (Container Apps)?

- **Unnecessary complexity**: Container orchestration adds overhead for simple two-component app
- **Docker expertise required**: Team must maintain Dockerfiles, build images, manage registry
- **Higher cost**: Consumption tier (~$35/month) more expensive than App Service B1 (~$13/month)
- **Slower deployments**: Container image builds add time to CI/CD pipeline
- **Overkill for MVP**: Microservices benefits not needed for monolithic frontend + backend
- **No global CDN**: Same limitation as App Service but with added complexity

---

## Consequences

### Positive

1. **Rapid Deployment**: Can deploy both apps to Azure App Service within hours using familiar tools
2. **Cost-Effective Start**: Basic B1 plan (~$13/month) keeps infrastructure costs minimal for MVP
3. **Production Proven**: No risk from preview features, mature platform with extensive support
4. **Easy Scaling Path**: Clear upgrade path from Basic → Standard → Premium as needs grow
5. **Integrated Monitoring**: Application Insights provides comprehensive observability out-of-box
6. **Security Features**: Managed certificates, HTTPS enforcement, authentication built-in
7. **Familiar Patterns**: Standard deployment model reduces learning curve for team
8. **Straightforward CI/CD**: GitHub Actions for App Service is well-documented and reliable

### Negative

1. **Regional Deployment**: Static assets served from single region, potential latency for distant users
   - **Mitigation**: Monitor performance, add Azure CDN if global users increase
2. **Manual CORS Setup**: Must configure CORS headers for frontend-backend communication
   - **Mitigation**: One-time configuration during initial setup, well-documented
3. **No Free Tier**: Minimum cost is Basic B1 (~$13/month), unlike Static Web Apps Free tier
   - **Context**: Free tier limitations (250 MB, 1 GB bandwidth/day) too restrictive for production
4. **Deployment Slot Limitation**: Basic tier lacks deployment slots, requires Standard for staging
   - **Mitigation**: Use separate staging App Service initially, upgrade to Standard when budget allows
5. **No Built-in Global Distribution**: Unlike Static Web Apps, doesn't include CDN by default
   - **Mitigation**: App Service + Azure CDN still cheaper than Static Web Apps Standard + S1 App Service

### Neutral

1. **Two Resources to Manage**: Frontend and backend are separate App Service apps
   - Provides flexibility to scale independently
   - Aligned with separation of concerns
2. **Node.js + .NET Runtimes**: App Service plan must support both runtime stacks
   - App Service supports multi-language hosting natively
   - No additional configuration required

---

## Implementation Notes

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Azure App Service Plan                  │
│                     (Basic B1 or Standard S1)               │
│                                                             │
│  ┌───────────────────────┐    ┌────────────────────────┐  │
│  │  Next.js Frontend     │    │  ASP.NET Core Backend  │  │
│  │  (Node.js runtime)    │    │  (.NET 8 runtime)      │  │
│  │                       │    │                        │  │
│  │  - Server-side        │───▶│  - REST API            │  │
│  │    rendering          │    │  - JWT authentication  │  │
│  │  - Static assets      │    │  - Azure OpenAI calls  │  │
│  │  - API routes         │    │  - EF Core + Azure SQL │  │
│  └───────────────────────┘    └────────────────────────┘  │
│                                           │                 │
└───────────────────────────────────────────┼─────────────────┘
                                            │
                    ┌───────────────────────┴────────────────────┐
                    │                                            │
                    ▼                                            ▼
        ┌─────────────────────┐               ┌──────────────────────────┐
        │  Azure SQL Database │               │  Azure OpenAI Service    │
        │  (Serverless)       │               │  (GPT-4o)                │
        └─────────────────────┘               └──────────────────────────┘
```

### App Service Configuration

**Frontend App (Next.js)**:
- **Name**: `booktracker-frontend` (example)
- **Runtime**: Node.js 20 LTS
- **OS**: Linux (recommended for Node.js)
- **Startup Command**: `node server.js` (Next.js standalone server)
- **App Settings**:
  - `NEXT_PUBLIC_API_URL`: URL of backend App Service
  - `NODE_ENV`: `production`
- **CORS**: Not required (Next.js SSR calls backend server-side)

**Backend App (ASP.NET Core)**:
- **Name**: `booktracker-api` (example)
- **Runtime**: .NET 8
- **OS**: Linux or Windows (Linux recommended for cost)
- **App Settings**:
  - `ConnectionStrings__DefaultConnection`: Azure SQL connection string (via Key Vault or App Settings)
  - `AzureOpenAI__Endpoint`: Azure OpenAI endpoint URL
  - `AzureOpenAI__ApiKey`: Azure OpenAI API key (via Key Vault)
  - `JwtSettings__SecretKey`: JWT signing key (via Key Vault)
  - `ASPNETCORE_ENVIRONMENT`: `Production`
- **CORS Configuration**: Allow origin from frontend App Service URL
- **Managed Identity**: Enable for Azure SQL and Key Vault access

### CI/CD Pipeline (GitHub Actions)

**Frontend Deployment**:
```yaml
name: Deploy Next.js Frontend

on:
  push:
    branches: [main]
    paths: ['frontend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
        working-directory: ./frontend
      - run: npm run build
        working-directory: ./frontend
      - uses: azure/webapps-deploy@v2
        with:
          app-name: 'booktracker-frontend'
          publish-profile: ${{ secrets.AZURE_FRONTEND_PUBLISH_PROFILE }}
          package: ./frontend/.next/standalone
```

**Backend Deployment**:
```yaml
name: Deploy ASP.NET Core Backend

on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.x'
      - run: dotnet build -c Release
        working-directory: ./backend
      - run: dotnet publish -c Release -o ./publish
        working-directory: ./backend
      - uses: azure/webapps-deploy@v2
        with:
          app-name: 'booktracker-api'
          publish-profile: ${{ secrets.AZURE_BACKEND_PUBLISH_PROFILE }}
          package: ./backend/publish
```

### Networking and Security

1. **HTTPS Only**: Enforce HTTPS on both frontend and backend App Services
2. **Managed Certificates**: Use App Service managed certificates for custom domains (free)
3. **CORS Configuration**: Backend API allows requests from frontend domain only
4. **Managed Identity**: Enable system-assigned managed identity for:
   - Azure SQL Database access (no connection string passwords)
   - Azure Key Vault access (for secrets)
   - Azure OpenAI Service access (optional, can use API key)
5. **Key Vault Integration**: Store sensitive configuration in Azure Key Vault:
   - Azure OpenAI API key
   - JWT signing key
   - Azure SQL connection string (if not using managed identity)

### Scaling Strategy

**Initial (MVP)**:
- **Plan**: Basic B1 (1 core, 1.75 GB RAM)
- **Cost**: ~$13/month
- **Capacity**: Sufficient for 100-500 concurrent users

**Growth Phase**:
- **Plan**: Standard S1 (1 core, 1.75 GB RAM)
- **Cost**: ~$54/month
- **Features Unlocked**:
  - 5 deployment slots (staging, testing, etc.)
  - Auto-scaling (scale out to 10 instances)
  - Daily backups
  - Custom domains with SNI SSL (unlimited)
- **Capacity**: 500-2000 concurrent users

**High Scale**:
- **Plan**: Premium P1V3 (2 cores, 8 GB RAM)
- **Cost**: ~$140/month
- **Features**: 
  - Up to 30 instances
  - Faster CPUs, more RAM
  - Private endpoints
  - Zone redundancy
- **Capacity**: 5000+ concurrent users

### Monitoring and Observability

1. **Application Insights**: Enable on both frontend and backend
   - Request tracking, dependency tracking, exceptions
   - Performance metrics, availability tests
2. **Azure Monitor**: Set up alerts for:
   - High CPU/memory usage
   - HTTP 5xx errors
   - Response time degradation
   - Azure SQL throttling
3. **Log Streaming**: Enable for real-time debugging
4. **Metrics Dashboard**: Create Azure Dashboard with:
   - Frontend response times
   - Backend API latency
   - Azure SQL performance
   - Azure OpenAI token usage

### Cost Optimization Tips

1. **Shared Plan**: Run both apps on same Basic B1 plan initially
2. **Auto-Shutdown**: Use Azure Automation to stop App Service during off-hours (dev/test environments)
3. **Monitoring**: Set up cost alerts to track spending
4. **Reserved Instances**: Consider 1-year or 3-year reservations for 40-60% savings (after proven demand)
5. **Right-Size**: Start with Basic, scale up only when metrics show resource constraints

---

## Alternatives Considered for Future

### Add Azure CDN (Optional Enhancement)

**When**: If global user base grows or performance monitoring shows high latency for distant users

**How**: 
- Create Azure CDN profile (Microsoft Standard tier)
- Configure CDN endpoint pointing to frontend App Service
- Update DNS to route traffic through CDN
- Configure caching rules for static assets

**Cost**: 
- Azure CDN Standard: ~$0.081/GB (North America/Europe)
- First 10 TB/month: ~$10-50/month depending on traffic

**Benefit**: 
- Global edge caching for static assets (.js, .css, images)
- 20-50% faster page loads for users outside primary region
- Reduced load on App Service frontend

### Migration to Azure Container Apps (Optional Future)

**When**: If app evolves to microservices architecture or requires event-driven scaling

**Why**: 
- Adds background job processing (e.g., scheduled recommendation generation)
- Enables scale-to-zero for cost savings on low-traffic services
- Provides Dapr integration for distributed app patterns

**Migration Path**:
- Containerize Next.js and ASP.NET Core applications
- Create Azure Container Registry
- Deploy containers to Container Apps environment
- Migrate DNS and configuration

**Cost Impact**: 
- Higher base cost (~$35-100/month vs. $13-54/month)
- Potential savings if scale-to-zero utilized effectively

---

## Related Decisions

- **ADR-0001**: Frontend Framework (Next.js) - Drives requirement for Node.js runtime support
- **ADR-0002**: Backend Framework (ASP.NET Core) - Drives requirement for .NET 8 runtime support
- **ADR-0003**: Database Selection (Azure SQL) - Requires network connectivity from App Service
- **ADR-0004**: Authentication Strategy (ASP.NET Core Identity + JWT) - No special hosting requirements
- **ADR-0005**: AI Service Selection (Azure OpenAI) - Called from backend, requires Azure connectivity

---

## Review and Update

This decision should be reviewed:
- **6 months after initial deployment**: Evaluate actual costs, performance, and scaling needs
- **When user base exceeds 1000 active users**: Assess if Basic/Standard tier is sufficient
- **If global user distribution increases**: Consider adding Azure CDN for static assets
- **If microservices architecture is needed**: Re-evaluate Container Apps or AKS

---

## References

### Azure App Service Documentation
- [App Service Overview](https://learn.microsoft.com/en-us/azure/app-service/overview)
- [Deploy ASP.NET Core to App Service](https://learn.microsoft.com/en-us/azure/app-service/quickstart-dotnetcore)
- [Deploy Node.js to App Service](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs)
- [App Service Pricing](https://azure.microsoft.com/pricing/details/app-service/linux/)
- [App Service Plans Overview](https://learn.microsoft.com/en-us/azure/app-service/overview-hosting-plans)

### Deployment Comparison
- [Comparing Container Apps with other Azure options](https://learn.microsoft.com/en-us/azure/container-apps/compare-options)
- [Azure hosting recommendations for ASP.NET Core](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/azure-hosting-recommendations-for-asp-net-web-apps)
- [Hosting applications on Azure](https://learn.microsoft.com/en-us/azure/developer/intro/hosting-apps-on-azure)

### CI/CD and DevOps
- [Deploy to App Service using GitHub Actions](https://learn.microsoft.com/en-us/azure/app-service/deploy-github-actions)
- [Continuous deployment to App Service](https://learn.microsoft.com/en-us/azure/app-service/deploy-continuous-deployment)

### Security and Networking
- [Configure TLS/SSL in App Service](https://learn.microsoft.com/en-us/azure/app-service/configure-ssl-bindings)
- [Use managed identity from App Service](https://learn.microsoft.com/en-us/azure/app-service/overview-managed-identity)
- [App Service Key Vault integration](https://learn.microsoft.com/en-us/azure/app-service/app-service-key-vault-references)

### Monitoring and Performance
- [Monitor App Service with Application Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/azure-web-apps)
- [Plan and manage costs for App Service](https://learn.microsoft.com/en-us/azure/app-service/overview-manage-costs)
