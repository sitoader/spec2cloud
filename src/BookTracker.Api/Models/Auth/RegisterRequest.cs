using System.ComponentModel.DataAnnotations;

namespace BookTracker.Api.Models.Auth;

/// <summary>
/// Request model for user registration.
/// </summary>
public record RegisterRequest
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
    [MinLength(8)]
    public required string Password { get; init; }

    /// <summary>
    /// Gets the user's optional display name.
    /// </summary>
    [MaxLength(100)]
    public string? DisplayName { get; init; }
}
