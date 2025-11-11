# Task 004: User Authentication Backend - Registration and Login

**Feature**: User Authentication (FRD-005)  
**Dependencies**: Task 001 (Backend Scaffolding), Task 003 (Database Schema)  
**Estimated Complexity**: High

---

## Description

Implement user registration and login functionality using ASP.NET Core Identity with JWT token authentication. Enable secure user account creation, password validation, and session management.

---

## Technical Requirements

### Authentication Configuration

Configure ASP.NET Core Identity in `Program.cs`:
- Use `ApplicationUser` as user entity
- Configure password requirements (min 8 chars, requires letter and number)
- Configure account lockout (5 failed attempts, 15-minute lockout)
- Disable email confirmation for v1 (optional feature)
- Configure user manager and sign-in manager

Configure JWT authentication:
- Token expiration: 24 hours (default), 30 days with "Remember Me"
- Issuer and Audience from configuration
- Signing key from Azure Key Vault (configuration for v1)
- HttpOnly cookies for token storage
- Secure and SameSite=Strict flags

### DTOs (Data Transfer Objects)

Create in `BookTracker.Api/Models/Auth/`:

```csharp
public record RegisterRequest
{
    [Required]
    [EmailAddress]
    public required string Email { get; init; }
    
    [Required]
    [MinLength(8)]
    public required string Password { get; init; }
    
    public string? DisplayName { get; init; }
}

public record LoginRequest
{
    [Required]
    [EmailAddress]
    public required string Email { get; init; }
    
    [Required]
    public required string Password { get; init; }
    
    public bool RememberMe { get; init; }
}

public record AuthResponse
{
    public required string UserId { get; init; }
    public required string Email { get; init; }
    public string? DisplayName { get; init; }
    public required string Token { get; init; }
    public required DateTime ExpiresAt { get; init; }
}
```

### API Endpoints

Implement minimal API endpoints in `Program.cs` or separate `AuthEndpoints.cs`:

#### **POST /api/auth/register**
- Accepts `RegisterRequest`
- Validates email format and password strength
- Checks if email already exists
- Creates user with hashed password (bcrypt via Identity)
- Generates JWT token
- Sets HttpOnly cookie with token
- Returns `AuthResponse` with 201 Created
- Error cases: 400 (invalid data), 409 (email exists)

#### **POST /api/auth/login**
- Accepts `LoginRequest`
- Validates credentials
- Checks account lockout status
- Generates JWT token with appropriate expiration
- Sets HttpOnly cookie with token
- Updates last login date
- Returns `AuthResponse` with 200 OK
- Error cases: 401 (invalid credentials), 423 (account locked)

#### **POST /api/auth/logout**
- Requires authentication
- Clears authentication cookie
- Returns 204 No Content
- Error cases: 401 (not authenticated)

#### **GET /api/auth/me**
- Requires authentication
- Returns current user info (userId, email, displayName)
- Returns 200 OK with user data
- Error cases: 401 (not authenticated)

### JWT Token Service

Create `JwtTokenService` in `BookTracker.Core/Services/`:
- Generate JWT token with claims (userId, email, roles)
- Configure token expiration based on "Remember Me"
- Sign token with secret key from configuration
- Include standard claims (sub, email, jti, iat, exp)

### Authentication Service

Create `IAuthenticationService` interface and implementation:
- `RegisterAsync(RegisterRequest)`: Create user account
- `LoginAsync(LoginRequest)`: Authenticate and generate token
- `GetCurrentUserAsync(userId)`: Retrieve user details
- Handle Identity result errors and map to appropriate exceptions

### Cookie Configuration

Configure authentication cookie:
- Name: "auth_token"
- HttpOnly: true (prevent JavaScript access)
- Secure: true (HTTPS only)
- SameSite: Strict (CSRF protection)
- Expiration: Matches JWT token expiration
- Path: "/"

### Validation

Implement input validation:
- Email format validation (EmailAddress attribute)
- Password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one digit
  - At least one special character (optional for v1)
- Display name max length: 100 characters

### Error Handling

Define custom exceptions:
- `AuthenticationException`: Invalid credentials
- `UserAlreadyExistsException`: Email already registered
- `AccountLockedException`: Too many failed attempts

Map to HTTP status codes:
- 400: Validation errors
- 401: Authentication failed
- 409: User already exists
- 423: Account locked

---

## Acceptance Criteria

### Registration
- [ ] POST /api/auth/register accepts email, password, display name
- [ ] Password meets strength requirements (8+ chars, letter, number)
- [ ] Duplicate email returns 409 Conflict error
- [ ] Weak password returns 400 Bad Request with specific errors
- [ ] Successful registration creates user in database
- [ ] Password is hashed using bcrypt (never stored plain text)
- [ ] Successful registration returns AuthResponse with JWT token
- [ ] JWT token is set in HttpOnly cookie
- [ ] Response includes userId, email, displayName

### Login
- [ ] POST /api/auth/login accepts email and password
- [ ] Valid credentials return AuthResponse with token
- [ ] Invalid credentials return 401 Unauthorized
- [ ] Account locks after 5 failed login attempts
- [ ] Locked account returns 423 Locked status
- [ ] Lockout expires after 15 minutes
- [ ] "Remember Me" extends token expiration to 30 days
- [ ] Last login date updated in database
- [ ] JWT token set in HttpOnly cookie

### Logout
- [ ] POST /api/auth/logout clears authentication cookie
- [ ] Returns 204 No Content
- [ ] Requires authentication (401 if not logged in)

### Current User
- [ ] GET /api/auth/me returns current user details
- [ ] Requires valid JWT token in cookie
- [ ] Returns 401 if token missing or invalid
- [ ] Returns userId, email, displayName

### Token Management
- [ ] JWT token includes userId, email claims
- [ ] Token signed with secret key from configuration
- [ ] Token expiration matches cookie expiration
- [ ] Expired tokens return 401 Unauthorized
- [ ] Token validates issuer and audience

### Security
- [ ] All auth endpoints use HTTPS
- [ ] Passwords never logged or returned in responses
- [ ] Cookies are HttpOnly and Secure
- [ ] CORS configured to allow only frontend origin
- [ ] Rate limiting prevents brute force attacks (optional for v1)

---

## Testing Requirements

### Unit Tests (≥85% coverage)

**Test Project**: `BookTracker.Core.Tests`

**Test Cases**:

1. **JWT Token Service**:
   - Generates valid JWT token with correct claims
   - Token includes userId, email, expiration
   - Token expiration is 24 hours by default
   - Token expiration is 30 days with "Remember Me"
   - Token signature is valid
   
2. **Authentication Service**:
   - RegisterAsync creates user with hashed password
   - RegisterAsync throws UserAlreadyExistsException for duplicate email
   - RegisterAsync validates password requirements
   - LoginAsync returns token for valid credentials
   - LoginAsync throws AuthenticationException for invalid credentials
   - LoginAsync handles account lockout correctly
   - GetCurrentUserAsync returns user details

### Integration Tests

**Test Project**: `BookTracker.Api.Tests`

**Test Cases**:

1. **Registration Endpoint**:
   - POST /api/auth/register with valid data returns 201 Created
   - Response includes userId, email, displayName, token
   - Authentication cookie is set
   - User created in database with hashed password
   - Duplicate email returns 409 Conflict
   - Weak password returns 400 Bad Request
   - Invalid email format returns 400 Bad Request
   
2. **Login Endpoint**:
   - POST /api/auth/login with valid credentials returns 200 OK
   - Response includes token and user details
   - Authentication cookie is set
   - Invalid credentials return 401 Unauthorized
   - Account locks after 5 failed attempts
   - Locked account returns 423 Locked
   - "Remember Me" sets longer expiration
   - Last login date updated
   
3. **Logout Endpoint**:
   - POST /api/auth/logout clears cookie and returns 204
   - Unauthenticated request returns 401
   
4. **Current User Endpoint**:
   - GET /api/auth/me with valid token returns user details
   - GET /api/auth/me without token returns 401
   - GET /api/auth/me with expired token returns 401

---

## Implementation Notes

- Use ASP.NET Core Identity `UserManager<ApplicationUser>` for user management
- Use `SignInManager<ApplicationUser>` for authentication
- Store JWT secret in Azure Key Vault for production
- Use `System.IdentityModel.Tokens.Jwt` for JWT generation
- Configure CORS to allow credentials from frontend origin
- Implement middleware to extract JWT from cookie
- Use claims-based authorization for protected endpoints
- Log authentication events (login, logout, failed attempts) to Application Insights
- Consider adding email verification in future iteration
- Consider adding password reset functionality in separate task

### Example JWT Generation

```csharp
var claims = new[]
{
    new Claim(JwtRegisteredClaimNames.Sub, user.Id),
    new Claim(JwtRegisteredClaimNames.Email, user.Email!),
    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
};

var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

var token = new JwtSecurityToken(
    issuer: _jwtSettings.Issuer,
    audience: _jwtSettings.Audience,
    claims: claims,
    expires: DateTime.UtcNow.AddHours(expirationHours),
    signingCredentials: credentials
);

return new JwtSecurityTokenHandler().WriteToken(token);
```

---

## Definition of Done

- [ ] All authentication endpoints implemented and documented
- [ ] All unit tests pass with ≥85% coverage
- [ ] All integration tests pass
- [ ] Registration creates users with hashed passwords
- [ ] Login validates credentials and generates JWT tokens
- [ ] Tokens stored securely in HttpOnly cookies
- [ ] Account lockout works after 5 failed attempts
- [ ] Swagger documentation includes auth endpoints
- [ ] Code follows security best practices (OWASP)
- [ ] No passwords or tokens logged
- [ ] Code reviewed and approved
