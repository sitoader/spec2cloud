namespace BookTracker.Core.Exceptions;

/// <summary>
/// Exception thrown when a requested series does not exist.
/// </summary>
public class SeriesNotFoundException : Exception
{
    public SeriesNotFoundException()
        : base("The requested series was not found.")
    {
    }

    public SeriesNotFoundException(string message)
        : base(message)
    {
    }

    public SeriesNotFoundException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
