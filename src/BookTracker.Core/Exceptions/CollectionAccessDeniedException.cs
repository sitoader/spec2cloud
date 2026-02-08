namespace BookTracker.Core.Exceptions;

/// <summary>
/// Exception thrown when access to a collection is denied.
/// </summary>
public class CollectionAccessDeniedException : Exception
{
    public CollectionAccessDeniedException()
        : base("Access to this collection is denied.")
    {
    }

    public CollectionAccessDeniedException(string message)
        : base(message)
    {
    }

    public CollectionAccessDeniedException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
