namespace BookTracker.Api.Models.Auth;

/// <summary>
/// Response model for authentication operations.
/// </summary>
public record AuthResponse
{
    /// <summary>
    /// Gets the authenticated user's ID.
    /// </summary>
    public required string UserId { get; init; }

    /// <summary>
    /// Gets the authenticated user's email address.
    /// </summary>
    public required string Email { get; init; }

    /// <summary>
    /// Gets the authenticated user's display name.
    /// </summary>
    public string? DisplayName { get; init; }

    /// <summary>
    /// Gets the JWT authentication token.
    /// </summary>
    public required string Token { get; init; }

    /// <summary>
    /// Gets the token expiration date and time.
    /// </summary>
    public required DateTime ExpiresAt { get; init; }
}
