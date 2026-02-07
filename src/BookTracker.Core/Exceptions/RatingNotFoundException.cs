namespace BookTracker.Core.Exceptions;

/// <summary>
/// Exception thrown when a requested rating does not exist.
/// </summary>
public class RatingNotFoundException : Exception
{
    public RatingNotFoundException()
        : base("The requested rating was not found.")
    {
    }

    public RatingNotFoundException(string message)
        : base(message)
    {
    }

    public RatingNotFoundException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
