namespace BookTracker.Core.Exceptions;

/// <summary>
/// Exception thrown when a requested collection does not exist.
/// </summary>
public class CollectionNotFoundException : Exception
{
    public CollectionNotFoundException()
        : base("The requested collection was not found.")
    {
    }

    public CollectionNotFoundException(string message)
        : base(message)
    {
    }

    public CollectionNotFoundException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
