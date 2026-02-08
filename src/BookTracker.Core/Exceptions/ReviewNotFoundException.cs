namespace BookTracker.Core.Exceptions;

/// <summary>
/// Exception thrown when a requested review does not exist.
/// </summary>
public class ReviewNotFoundException : Exception
{
    public ReviewNotFoundException()
        : base("The requested review was not found.")
    {
    }

    public ReviewNotFoundException(string message)
        : base(message)
    {
    }

    public ReviewNotFoundException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
