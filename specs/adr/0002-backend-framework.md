# ADR-0002: Backend Framework Selection

**Date**: 2025-11-11  
**Status**: Proposed

## Context

We need to select a backend framework for building the API layer of the book tracking and AI-powered recommendation application. The backend will handle:

- **User authentication**: Registration, login, password reset, session management (FRD-005)
- **Data persistence**: Book library, ratings, notes, preferences storage (FRD-001, FRD-003)
- **External API integration**: Proxying requests to Google Books API, Open Library (FRD-002)
- **AI service integration**: Calling Azure OpenAI for book recommendations (FRD-004)
- **Business logic**: Recommendation filtering, data validation, error handling

From PRD and FRD requirements:
- Performance: API responses <1-3 seconds, recommendation generation <10 seconds
- Reliability: Graceful error handling, data persistence guarantees
- Security: Secure authentication, password hashing, session management
- Azure deployment: Must deploy efficiently to Azure (App Service, Container Apps, or Functions)
- Simplicity-first: Minimal complexity, avoid over-engineering

## Decision Drivers

- **Development velocity**: Time to MVP, learning curve, productivity
- **Performance**: Request throughput, latency, resource efficiency
- **Azure integration**: Native Azure SDK support, deployment options, monitoring
- **TypeScript alignment**: Consistency with Next.js frontend (if shared types desired)
- **External API integration**: HTTP client capabilities, async/await patterns
- **AI service integration**: Azure OpenAI SDK availability and maturity
- **Database support**: ORM/data access patterns, migration support
- **Security**: Built-in authentication, encryption, best practices
- **Ecosystem maturity**: Libraries for common needs (validation, logging, testing)
- **Team expertise**: Available skills, onboarding time
- **Operational simplicity**: Deployment, scaling, monitoring

## Considered Options

### Option 1: ASP.NET Core (.NET 8+)

**Description**: Microsoft's cross-platform framework for building modern web APIs with C#.

**Pros**:
- **Azure-native**: First-class Azure SDK support, seamless App Service deployment, built-in diagnostics
- **Performance**: One of the fastest web frameworks (benchmarks show high throughput/low latency)
- **Mature ecosystem**: Robust libraries for auth (Identity, JWT), data (Entity Framework Core), validation
- **Built-in features**: Dependency injection, configuration, logging, middleware out of the box
- **Type safety**: Strong typing with C#, compile-time error detection
- **Security**: Industry-standard auth patterns, automatic CSRF protection, secure defaults
- **OpenAPI/Swagger**: Built-in API documentation generation
- **Azure OpenAI SDK**: Official C# SDK with excellent support
- **Scalability**: Handles high concurrency well, efficient resource usage
- **Long-term support**: Microsoft-backed with regular LTS releases
- **Tooling**: Excellent Visual Studio/VS Code integration, debugging, profiling

**Cons**:
- **Language switch**: Different language from frontend (TypeScript vs C#), separate type definitions
- **Learning curve**: Team may need to learn C# and .NET ecosystem if unfamiliar
- **Less frontend synergy**: Can't share validation logic or types directly with Next.js (without code generation)
- **Heavier runtime**: Larger container/deployment size compared to Node.js
- **Community**: Smaller web developer community compared to Node.js ecosystem

### Option 2: Node.js with Express/Fastify

**Description**: JavaScript/TypeScript runtime with popular web frameworks (Express or Fastify).

**Pros**:
- **Language consistency**: Same TypeScript used in frontend, potential code sharing
- **Shared types**: Can share TypeScript interfaces between frontend and backend
- **Large ecosystem**: npm packages for virtually everything
- **Familiarity**: Likely higher developer familiarity with JavaScript/TypeScript
- **Lightweight**: Small deployment footprint, fast cold starts
- **Async-first**: Natural async/await for I/O-heavy operations
- **Azure support**: Good Azure SDK support (App Service, Functions, Container Apps)
- **OpenAI SDK**: Official Node.js SDK available
- **Development speed**: Rapid prototyping, hot reload, minimal boilerplate

**Cons**:
- **Performance**: Lower throughput than ASP.NET Core or alternative compiled languages
- **Less opinionated**: Need to assemble auth, validation, ORM separately (more decisions)
- **Type safety gaps**: Runtime is still dynamic JavaScript, potential for type errors at runtime
- **Security patterns**: Need to manually implement many security best practices
- **Immaturity for enterprise**: Less standardized patterns for large-scale APIs
- **Single-threaded**: CPU-intensive tasks can block event loop (though I/O-bound app mitigates this)
- **Dependency stability**: npm ecosystem can have more breaking changes, maintenance issues

### Option 3: Python with FastAPI

**Description**: Modern Python framework with automatic API documentation and type hints.

**Pros**:
- **AI/ML ecosystem**: Python is primary language for AI/ML, rich libraries
- **FastAPI performance**: Fast performance for Python (comparable to Node.js)
- **Type hints**: Strong typing through Pydantic models, automatic validation
- **Async support**: Built-in async/await, modern async patterns
- **Auto documentation**: Automatic OpenAPI/Swagger docs from type hints
- **Developer-friendly**: Clean, readable code, rapid development
- **Azure OpenAI SDK**: Python SDK well-supported, widely used
- **Data science tools**: Easy integration with pandas, numpy if needed for analytics

**Cons**:
- **Azure integration**: Less native than .NET, more manual setup required
- **Performance**: Slower than ASP.NET Core and Node.js for high-throughput scenarios
- **Deployment complexity**: Python environments, dependencies more complex than .NET or Node.js
- **Language switch**: Different from frontend TypeScript, no type sharing
- **ORM maturity**: SQLAlchemy/Tortoise less mature than EF Core or TypeORM
- **Less Azure-optimized**: Fewer Azure-specific optimizations and tooling
- **Team expertise**: May require team to learn Python if unfamiliar

## Decision Outcome

**Chosen Option**: ASP.NET Core (.NET 8+) (Option 1)

**Rationale**:

1. **Azure-first alignment**: This project will deploy to Azure, and ASP.NET Core provides:
   - Best-in-class Azure App Service integration
   - Native Azure SDK support for all services (SQL, OpenAI, Storage, etc.)
   - Built-in Application Insights integration for monitoring
   - Optimized deployment and performance on Azure infrastructure

2. **Performance requirements**: Our PRD specifies strict performance targets:
   - API responses <1-3 seconds (ASP.NET Core handles high throughput efficiently)
   - Library loads <2 seconds with 500 books (efficient serialization, async patterns)
   - Recommendation generation <10 seconds (won't bottleneck on HTTP client performance)

3. **Security and enterprise patterns**: Authentication and user data are critical:
   - ASP.NET Core Identity provides battle-tested auth patterns
   - Built-in HTTPS enforcement, CORS, anti-forgery protection
   - Secure password hashing (bcrypt) and session management
   - Clear guidance and patterns for Azure AD B2C integration (future enhancement)

4. **Simplicity through convention**: Despite being different language:
   - All necessary features built-in (DI, config, logging, middleware)
   - Less decision fatigue than assembling Node.js stack
   - Clear project templates and scaffolding
   - Standardized patterns reduce cognitive load

5. **Azure OpenAI integration**: Official C# SDK is mature:
   - Type-safe API clients
   - Streaming support for future enhancements
   - Well-documented patterns for Azure services

6. **Long-term maintainability**:
   - Strong typing catches errors at compile-time
   - Excellent refactoring tools
   - Enterprise-grade for scaling beyond MVP

**Trade-offs accepted**:
- Language split between frontend (TypeScript) and backend (C#)
  - *Mitigation*: Use OpenAPI/Swagger to generate TypeScript clients from C# API
  - *Acceptable*: Type sharing less critical than other benefits
- Potentially larger deployment size
  - *Acceptable*: Azure App Service handles .NET efficiently, not a constraint
- Learning curve if team less familiar with C#
  - *Mitigation*: C# and TypeScript have similar syntax, modern C# is quite approachable
  - *Acceptable*: Investment in .NET skills valuable for Azure development

## Consequences

### Positive

- **Best Azure experience**: Native integration with all Azure services
- **Robust security**: Industry-standard authentication and authorization patterns
- **High performance**: Excellent throughput and latency characteristics
- **Type safety**: Compile-time error detection reduces runtime bugs
- **Complete framework**: Less assembly required, more productivity
- **Scalability**: Proven at enterprise scale, handles growth well
- **Tooling excellence**: Visual Studio/Rider/VS Code provide excellent development experience
- **Long-term support**: Microsoft commitment to .NET platform

### Negative

- **Language barrier**: Frontend/backend use different languages (TypeScript vs C#)
- **No direct type sharing**: Cannot directly share type definitions without code generation
- **Larger runtime**: .NET runtime larger than Node.js (though optimized on Azure)
- **Different ecosystem**: Separate package manager (NuGet vs npm), different patterns

### Neutral

- **OpenAPI bridge**: Can generate TypeScript types from C# API, maintains type consistency
- **Team skills**: Investment in C# valuable for broader Azure ecosystem
- **Container deployment**: Works excellently with containers if needed later

## Implementation Notes

1. **Use .NET 8 LTS**: Latest long-term support version for stability
2. **Minimal API pattern**: Consider minimal APIs for simpler endpoint definitions (cleaner than controllers for simple CRUD)
3. **Entity Framework Core**: Use EF Core for data access with code-first migrations
4. **ASP.NET Core Identity**: Use for authentication infrastructure
5. **JWT authentication**: Implement JWT tokens for stateless API auth
6. **HttpClientFactory**: Use for external API calls (Google Books, Open Library) to avoid socket exhaustion
7. **Azure SDK**: Use official Azure SDKs for OpenAI, App Configuration, Key Vault
8. **Structured logging**: Use Serilog with Application Insights sink
9. **OpenAPI/Swagger**: Generate API documentation and TypeScript client
10. **Async all the way**: All I/O operations (DB, HTTP, AI calls) must be async

## References

- PRD: `specs/prd.md` - Section 6 (Constraints, Performance)
- FRD-001: `specs/features/book-library-management.md` - Data persistence requirements
- FRD-002: `specs/features/book-search-discovery.md` - External API integration
- FRD-004: `specs/features/ai-recommendations.md` - AI service integration
- FRD-005: `specs/features/user-authentication.md` - Authentication requirements
- ADR-0001: `specs/adr/0001-frontend-framework.md` - Next.js frontend decision
- ASP.NET Core Best Practices: https://learn.microsoft.com/aspnet/core/fundamentals/best-practices
- Azure hosting recommendations: https://learn.microsoft.com/dotnet/architecture/modern-web-apps-azure/azure-hosting-recommendations-for-asp-net-web-apps
