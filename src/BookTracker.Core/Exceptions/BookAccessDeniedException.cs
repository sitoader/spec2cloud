namespace BookTracker.Core.Exceptions;

/// <summary>
/// Exception thrown when a user attempts to access a book they do not own.
/// </summary>
public class BookAccessDeniedException : Exception
{
    public BookAccessDeniedException()
        : base("You do not have permission to access this book.")
    {
    }

    public BookAccessDeniedException(string message)
        : base(message)
    {
    }

    public BookAccessDeniedException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
