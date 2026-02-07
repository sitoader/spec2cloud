namespace BookTracker.Core.Exceptions;

/// <summary>
/// Exception thrown when a user attempts to add a book with a duplicate title.
/// </summary>
public class DuplicateBookException : Exception
{
    public DuplicateBookException()
        : base("A book with this title already exists in your library.")
    {
    }

    public DuplicateBookException(string message)
        : base(message)
    {
    }

    public DuplicateBookException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
