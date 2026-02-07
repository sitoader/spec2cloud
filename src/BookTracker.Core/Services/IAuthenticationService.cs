namespace BookTracker.Core.Services;

/// <summary>
/// Contract for user authentication operations including registration, login, and profile retrieval.
/// </summary>
public interface IAuthenticationService
{
    /// <summary>
    /// Registers a new user account and returns identity details with a token.
    /// </summary>
    Task<AuthResult> RegisterUserAsync(string email, string password, string? displayName);

    /// <summary>
    /// Authenticates an existing user and returns identity details with a token.
    /// </summary>
    Task<AuthResult> AuthenticateUserAsync(string email, string password, bool persistSession);

    /// <summary>
    /// Retrieves user profile information for the given user ID.
    /// </summary>
    Task<UserProfile> GetUserProfileAsync(string userId);
}

/// <summary>
/// Encapsulates the result of a successful authentication or registration operation.
/// </summary>
public record AuthResult
{
    public required string UserId { get; init; }
    public required string Email { get; init; }
    public string? DisplayName { get; init; }
    public required string Token { get; init; }
    public required DateTime ExpiresAtUtc { get; init; }
}

/// <summary>
/// Represents basic user profile information returned by the /me endpoint.
/// </summary>
public record UserProfile
{
    public required string UserId { get; init; }
    public required string Email { get; init; }
    public string? DisplayName { get; init; }
}
