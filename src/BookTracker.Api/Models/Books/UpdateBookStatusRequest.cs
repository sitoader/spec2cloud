using System.ComponentModel.DataAnnotations;
using BookTracker.Core.Entities;

namespace BookTracker.Api.Models.Books;

/// <summary>
/// Request model for updating only the status of a book.
/// </summary>
public record UpdateBookStatusRequest
{
    /// <summary>Gets the new reading status.</summary>
    [Required]
    public BookStatus Status { get; init; }
}
