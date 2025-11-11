# Task 001: Backend API Project Scaffolding

**Feature**: Infrastructure  
**Dependencies**: None  
**Estimated Complexity**: Medium

---

## Description

Set up the foundational ASP.NET Core (.NET 8) backend API project structure with all necessary configuration, middleware, and infrastructure components. This provides the base for all backend features.

---

## Technical Requirements

### Project Structure

Create ASP.NET Core Web API project with:
- **Target Framework**: .NET 8 LTS
- **API Pattern**: Minimal API (as per ADR-0002)
- **Project Name**: `BookTracker.Api`
- **Folder Structure**:
  ```
  src/
    BookTracker.Api/
      Program.cs                    # Application entry point
      appsettings.json             # Configuration
      appsettings.Development.json # Dev config
    BookTracker.Core/
      Entities/                    # Domain entities
      Interfaces/                  # Service interfaces
      Services/                    # Business logic
    BookTracker.Infrastructure/
      Data/                        # EF Core context, migrations
      Repositories/                # Data access
  tests/
    BookTracker.Api.Tests/         # API integration tests
    BookTracker.Core.Tests/        # Unit tests
  ```

### Required NuGet Packages

Install core dependencies:
- `Microsoft.EntityFrameworkCore.SqlServer` (8.0+)
- `Microsoft.EntityFrameworkCore.Design` (8.0+)
- `Microsoft.AspNetCore.Authentication.JwtBearer` (8.0+)
- `Microsoft.AspNetCore.Identity.EntityFrameworkCore` (8.0+)
- `Azure.Identity` (latest)
- `Azure.Extensions.AspNetCore.Configuration.Secrets` (latest)
- `Swashbuckle.AspNetCore` (6.5+) - OpenAPI/Swagger
- `Serilog.AspNetCore` (latest) - Structured logging
- `Serilog.Sinks.ApplicationInsights` (latest)

### Core Middleware Configuration

Configure in `Program.cs`:
1. **CORS**: Allow Next.js frontend origin (configure for development and production)
2. **Authentication**: JWT Bearer token validation
3. **Authorization**: Policy-based authorization
4. **Exception Handling**: Global exception handler with structured error responses
5. **Logging**: Serilog with Application Insights sink
6. **Swagger/OpenAPI**: API documentation and client generation
7. **HTTPS Redirection**: Enforce HTTPS-only
8. **Health Checks**: `/health` endpoint for monitoring

### Configuration Sources

Set up configuration precedence:
1. `appsettings.json` (base configuration)
2. `appsettings.{Environment}.json` (environment-specific)
3. Environment variables (Azure App Service settings)
4. Azure Key Vault (secrets in production)

### Database Context Setup

Create `ApplicationDbContext` with:
- Entity configurations using Fluent API
- Connection string from configuration
- Migration support enabled
- Query filters for soft deletes (if needed)

### Dependency Injection

Register services:
- `DbContext` (scoped)
- Repository pattern interfaces and implementations (scoped)
- Business logic services (scoped)
- HttpClient factory for external APIs
- Azure SDK clients (singleton or scoped as appropriate)

### Error Response Models

Define standardized error response DTOs:
```csharp
public record ErrorResponse
{
    public required string Message { get; init; }
    public List<string>? Errors { get; init; }
    public string? TraceId { get; init; }
}
```

### OpenAPI Configuration

Configure Swagger with:
- API title, version, description
- JWT bearer authentication scheme
- XML documentation comments
- Generate TypeScript client option

---

## Acceptance Criteria

- [ ] ASP.NET Core 8 project created with clean architecture structure (Api, Core, Infrastructure layers)
- [ ] All required NuGet packages installed and versions documented
- [ ] `Program.cs` configured with all essential middleware (CORS, auth, logging, error handling, Swagger)
- [ ] CORS policy allows Next.js frontend localhost and production domains
- [ ] Global exception handler returns structured ErrorResponse with appropriate HTTP status codes
- [ ] Serilog configured with console sink (dev) and Application Insights sink (production)
- [ ] Swagger UI accessible at `/swagger` with JWT authentication support
- [ ] Health check endpoint `/health` returns 200 OK
- [ ] `appsettings.json` contains placeholder configurations (connection strings, JWT settings, Azure config)
- [ ] `ApplicationDbContext` class created (empty, ready for entity configurations)
- [ ] Dependency injection container configured with all infrastructure services
- [ ] Project builds successfully with zero warnings
- [ ] `.editorconfig` and `.gitignore` configured for .NET projects

---

## Testing Requirements

### Unit Tests (≥85% coverage)

**Test Project**: `BookTracker.Api.Tests`

**Test Cases**:
1. **Middleware Tests**:
   - Global exception handler returns 500 status with ErrorResponse for unhandled exceptions
   - Global exception handler returns 400 status for validation exceptions
   - CORS middleware allows configured origins
   
2. **Configuration Tests**:
   - Configuration loads correctly from appsettings.json
   - Environment-specific settings override base settings
   
3. **Health Check Tests**:
   - `/health` endpoint returns 200 OK when services are healthy

### Integration Tests

**Test Cases**:
1. **Application Startup**:
   - Application starts successfully with all middleware configured
   - Swagger documentation generates without errors
   - All registered services resolve from DI container

2. **OpenAPI Generation**:
   - Swagger JSON generated at `/swagger/v1/swagger.json`
   - TypeScript client can be generated from OpenAPI spec (manual verification)

---

## Implementation Notes

- Use `WebApplication.CreateBuilder(args)` pattern (modern .NET 8 approach)
- Configure services before building the app
- Add middleware in correct order (exception handler first, routing last)
- Use `app.MapGet("/health", () => Results.Ok())` for simple health check
- Connection string format: `Server=tcp:{server}.database.windows.net,1433;Database={database};`
- JWT settings: Issuer, Audience, SecretKey (use Key Vault in production)
- Enable nullable reference types in all projects (`<Nullable>enable</Nullable>`)
- Use `record` types for DTOs for immutability
- Document all public APIs with XML comments for Swagger

---

## Definition of Done

- [ ] Code builds with zero errors and zero warnings
- [ ] All unit tests pass with ≥85% code coverage
- [ ] All integration tests pass
- [ ] Code follows StyleCop rules and .NET conventions
- [ ] Swagger UI displays correctly and documents all infrastructure endpoints
- [ ] Application runs locally and responds to health check
- [ ] Configuration supports both local development and Azure deployment
- [ ] Code reviewed and approved
