using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookTracker.Core.Entities;

/// <summary>
/// Represents a book in the user's collection.
/// </summary>
public class Book
{
    public Guid Id { get; set; }
    public required string UserId { get; set; }
    public required string Title { get; set; }
    public required string Author { get; set; }
    public string? Isbn { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Description { get; set; }
    public string? Genres { get; set; }
    public DateTime? PublicationDate { get; set; }
    public required BookStatus Status { get; set; }
    public DateTime AddedDate { get; set; }
    /// <summary>
    /// The date when the book was marked as completed. Null if not yet completed.
    /// </summary>
    public DateTime? CompletedDate { get; set; }
    public int? PageCount { get; set; }
    public string? Source { get; set; }
    
    // Navigation properties
    public ApplicationUser? User { get; set; }
    public Rating? Rating { get; set; }
}
