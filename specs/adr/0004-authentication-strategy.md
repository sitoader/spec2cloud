# ADR-0004: Authentication Strategy

**Date**: 2025-11-11  
**Status**: Proposed

## Context

We need to implement user authentication and authorization for the book tracking application. Users must be able to register, log in, reset passwords, and maintain secure sessions to access their personal book libraries.

**Requirements** (from FRD-005):
- User registration with email and password
- Secure login with session persistence
- Password reset functionality
- Session management (30-day persistence with "Remember me")
- Account management (update profile, change password)
- Secure password storage (bcrypt or Argon2)
- Protection against common attacks (brute force, CSRF, XSS)

**Constraints**:
- Web-first application (Next.js frontend, ASP.NET Core backend from ADR-0001, ADR-0002)
- Simplicity-first approach (avoid over-engineering for MVP)
- Azure deployment (leverage Azure services where beneficial)
- Privacy-critical (user reading data is personal)
- Performance: Login/registration <3 seconds

## Decision Drivers

- **Security**: Industry-standard practices, protection against common vulnerabilities
- **User experience**: Simple registration/login flow, reliable session persistence
- **Development velocity**: Time to implement, testing complexity
- **Azure integration**: Native Azure services vs. custom implementation
- **Flexibility**: Ability to add social login (Google, Microsoft) later
- **Cost**: Minimize additional service costs for MVP
- **Compliance**: GDPR considerations (data export, deletion)
- **Maintenance**: Ongoing security updates, password policy management

## Considered Options

### Option 1: ASP.NET Core Identity with JWT Tokens

**Description**: Use ASP.NET Core Identity for user management with JWT (JSON Web Tokens) for stateless authentication.

**Pros**:
- **Built into ASP.NET Core**: No additional services or costs
- **Full control**: Complete customization of user model, password policies, email templates
- **Well-documented**: Extensive Microsoft documentation, large community
- **Type-safe**: C# models for users, roles, claims
- **Password security**: Built-in password hashing (PBKDF2 by default, can switch to bcrypt)
- **JWT stateless**: Tokens don't require server-side session storage
- **Extensible**: Easy to add social login providers later (Google, Microsoft, GitHub)
- **Azure AD ready**: Can integrate with Azure AD B2C when ready for enterprise features

**Cons**:
- **JWT token management**: Need to handle token refresh, expiration, revocation
- **No built-in UI**: Need to build registration/login pages (though Next.js provides this)
- **Session persistence complexity**: JWTs require additional logic for "Remember me" (long-lived refresh tokens)
- **Token storage**: Need secure client-side storage (httpOnly cookies recommended)
- **Token revocation**: Stateless tokens difficult to revoke (need blacklist or short expiration)

### Option 2: Azure AD B2C (Business to Consumer)

**Description**: Fully managed identity service from Azure for consumer-facing applications.

**Pros**:
- **Fully managed**: Microsoft handles all user management, security, scaling
- **Enterprise-grade security**: MFA, threat detection, anomaly detection built-in
- **Social login**: Pre-built integrations with Google, Facebook, Microsoft, GitHub
- **Custom branding**: Can customize login/registration pages with company branding
- **Compliance**: Built-in GDPR compliance, audit logs
- **Scalability**: Handles millions of users without configuration
- **Password policies**: Configurable complexity rules, expiration, history
- **Self-service**: Built-in password reset, profile management

**Cons**:
- **Cost**: Monthly active users pricing ($0.00325/MAU for first 50k users)
- **Complexity**: Steeper learning curve, more configuration required
- **Customization limits**: Less flexible than custom Identity implementation
- **Overkill for MVP**: Social login and MFA not needed initially
- **Vendor lock-in**: Tightly coupled to Azure AD B2C (migration effort if needed)
- **UI customization**: Limited compared to fully custom implementation

### Option 3: Third-Party Auth (Auth0, Firebase Auth, Supabase Auth)

**Description**: Use a third-party authentication-as-a-service provider.

**Pros**:
- **Quick setup**: Pre-built authentication flows, minimal code
- **Social login**: Easy integration with multiple providers
- **Free tiers**: Auth0, Firebase, Supabase offer generous free tiers
- **Managed security**: Service handles vulnerabilities, updates
- **Multi-platform**: SDKs for web, mobile, backend
- **Features**: Passwordless, MFA, anomaly detection

**Cons**:
- **External dependency**: Reliance on third-party service availability
- **Cost**: Can become expensive as users grow (Auth0: $240+/month after free tier)
- **Vendor lock-in**: Migration difficult if switching providers
- **Data sovereignty**: User data stored with third party (privacy concerns)
- **Integration complexity**: Additional service to integrate with ASP.NET Core backend
- **Less Azure-native**: Doesn't leverage Azure ecosystem

## Decision Outcome

**Chosen Option**: ASP.NET Core Identity with JWT Tokens (Option 1)

**Rationale**:

1. **Simplicity-first alignment**: ASP.NET Core Identity provides:
   - Built-in user management (no additional service costs or complexity)
   - Standard authentication patterns well-understood by .NET developers
   - Full control without third-party dependencies
   - No external API calls for auth (faster, more reliable)

2. **Perfect fit with backend stack**: 
   - Native integration with ASP.NET Core (chosen in ADR-0002)
   - Entity Framework Core for user storage (aligned with ADR-0003 Azure SQL)
   - Strongly-typed C# user models
   - Middleware for authentication/authorization built-in

3. **Security best practices**:
   - Password hashing with PBKDF2 (can upgrade to bcrypt/Argon2 if needed)
   - Protection against CSRF, XSS, SQL injection
   - Secure cookie-based JWT storage (httpOnly, secure flags)
   - Account lockout after failed login attempts
   - Clear guidance on security configurations

4. **Cost optimization**:
   - **Zero additional service costs** for MVP
   - No per-user pricing or monthly fees
   - Infrastructure costs covered by existing backend/database

5. **Flexibility for future**:
   - Can add social login providers (Google, Microsoft) using external login providers
   - Can migrate to Azure AD B2C if enterprise features needed (Identity compatible)
   - Can add custom claims, roles, policies as requirements evolve

6. **Developer productivity**:
   - Scaffolding tools generate registration/login code
   - Well-documented patterns and examples
   - Visual Studio templates for Identity setup
   - Extensive testing libraries and examples

**JWT Token Approach**:
- **Access tokens**: Short-lived (15 minutes), stored in httpOnly cookie
- **Refresh tokens**: Long-lived (30 days with "Remember me"), stored securely
- **Token refresh flow**: Background refresh before expiration for seamless UX

**Why not Azure AD B2C**:
- Too complex and expensive for MVP ($0.00325/MAU adds up)
- Social login not required initially
- MFA not needed for v1
- Can migrate later if enterprise features become necessary

**Why not third-party**:
- External dependency adds failure point
- Data sovereignty concerns (user reading data is sensitive)
- Cost grows with users
- Less integration with Azure ecosystem

## Consequences

### Positive

- **Zero additional cost**: No authentication service fees
- **Full control**: Customize every aspect of user experience
- **Fast performance**: No external API calls for login/session validation
- **Privacy**: User data stays in our Azure SQL database
- **Type-safe**: Strongly-typed user models in C#
- **Flexible**: Can extend with custom claims, roles, external providers
- **Well-tested**: Mature framework used by millions of applications

### Negative

- **Implementation effort**: Need to build registration/login UI in Next.js
- **Security responsibility**: Must stay current with security best practices
- **Token management**: Need to implement refresh token logic
- **No built-in MFA**: Would need to add separately if required later

### Neutral

- **Password policies**: Configurable but require manual setup
- **Email verification**: Optional for v1, can add using SendGrid or similar
- **Audit logging**: Need to implement separately (can use Application Insights)

## Implementation Notes

1. **ASP.NET Core Setup**:
   - Install `Microsoft.AspNetCore.Identity.EntityFrameworkCore` NuGet package
   - Configure Identity in `Program.cs`
   - Create `ApplicationUser : IdentityUser` custom user class
   - Add Identity tables to database via EF Core migration

2. **JWT Configuration**:
   - Install `Microsoft.AspNetCore.Authentication.JwtBearer`
   - Generate JWT secret (store in Azure Key Vault)
   - Configure token expiration: 15 minutes (access), 30 days (refresh)
   - Use httpOnly cookies for token storage (CSRF protection)

3. **Password Requirements** (from FRD-005):
   ```csharp
   options.Password.RequireDigit = true;
   options.Password.RequiredLength = 8;
   options.Password.RequireNonAlphanumeric = false; // Optional for simplicity
   options.Password.RequireUppercase = false; // Optional for simplicity
   options.Password.RequireLowercase = true;
   ```

4. **Account Lockout**:
   ```csharp
   options.Lockout.MaxFailedAccessAttempts = 5;
   options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
   ```

5. **API Endpoints**:
   - `POST /api/auth/register` - User registration
   - `POST /api/auth/login` - User login (returns JWT)
   - `POST /api/auth/refresh` - Refresh JWT
   - `POST /api/auth/logout` - Invalidate refresh token
   - `POST /api/auth/forgot-password` - Request password reset
   - `POST /api/auth/reset-password` - Complete password reset
   - `GET /api/auth/user` - Get current user profile
   - `PUT /api/auth/user` - Update user profile

6. **Next.js Integration**:
   - Create login/registration forms
   - Store JWT in httpOnly cookie via backend Set-Cookie
   - Use Next.js middleware to protect routes
   - Automatically refresh token before expiration

7. **Security Measures**:
   - Enable HTTPS only (no HTTP)
   - Set secure cookie flags (httpOnly, secure, sameSite)
   - Implement CORS properly (whitelist Next.js origin)
   - Use anti-forgery tokens for state-changing operations
   - Rate limit login attempts (use ASP.NET Core rate limiting middleware)

8. **Future Enhancements** (post-MVP):
   - Email verification (using Azure Communication Services or SendGrid)
   - Social login (Google, Microsoft using external providers)
   - Two-factor authentication (TOTP using authenticator apps)
   - Azure AD B2C migration if enterprise features needed

## References

- FRD-005: `specs/features/user-authentication.md` - Complete authentication requirements
- ADR-0002: `specs/adr/0002-backend-framework.md` - ASP.NET Core backend
- ADR-0003: `specs/adr/0003-database-selection.md` - Azure SQL for user storage
- ASP.NET Core Identity: https://learn.microsoft.com/aspnet/core/security/authentication/identity
- JWT Authentication: https://learn.microsoft.com/aspnet/core/security/authentication/jwt-authn
- Security Best Practices: https://learn.microsoft.com/aspnet/core/security/
