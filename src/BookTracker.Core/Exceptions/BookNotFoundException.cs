namespace BookTracker.Core.Exceptions;

/// <summary>
/// Exception thrown when a requested book does not exist.
/// </summary>
public class BookNotFoundException : Exception
{
    public BookNotFoundException()
        : base("The requested book was not found.")
    {
    }

    public BookNotFoundException(string message)
        : base(message)
    {
    }

    public BookNotFoundException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
