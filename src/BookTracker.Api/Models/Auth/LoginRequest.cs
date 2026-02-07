using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Auth;

/// <summary>
/// Request model for user login.
/// </summary>
public record LoginRequest
{
    /// <summary>
    /// Gets the user's email address.
    /// </summary>
    [Required]
    [EmailAddress]
    public required string Email { get; init; }

    /// <summary>
    /// Gets the user's password.
    /// </summary>
    [Required]
    public required string Password { get; init; }

    /// <summary>
    /// Gets whether to extend the session duration.
    /// </summary>
    public bool RememberMe { get; init; }
}
