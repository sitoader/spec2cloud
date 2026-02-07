namespace BookTracker.Core.Entities;

/// <summary>
/// Represents the reading status of a book.
/// </summary>
public enum BookStatus
{
    /// <summary>
    /// Book is on the to-read list.
    /// </summary>
    ToRead = 0,

    /// <summary>
    /// Book is currently being read.
    /// </summary>
    Reading = 1,

    /// <summary>
    /// Book has been completed.
    /// </summary>
    Completed = 2
}
