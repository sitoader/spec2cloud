using Microsoft.AspNetCore.Identity;

namespace BookTracker.Core.Entities;

/// <summary>
/// Represents an application user with extended properties beyond IdentityUser.
/// </summary>
public class ApplicationUser : IdentityUser
{
    /// <summary>
    /// Gets or sets the display name for the user.
    /// </summary>
    public string? DisplayName { get; set; }

    /// <summary>
    /// Gets or sets the date when the user account was created.
    /// </summary>
    public DateTime CreatedDate { get; set; }

    /// <summary>
    /// Gets or sets the date when the user last logged in.
    /// </summary>
    public DateTime? LastLoginDate { get; set; }

    /// <summary>
    /// Gets or sets the collection of books owned by this user.
    /// </summary>
    public ICollection<Book> Books { get; set; } = new List<Book>();

    /// <summary>
    /// Gets or sets the user's preferences.
    /// </summary>
    public UserPreferences? Preferences { get; set; }
}
