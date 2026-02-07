namespace BookTracker.Core.Exceptions;

/// <summary>
/// Exception thrown when attempting to register with an email that already exists.
/// </summary>
public class UserAlreadyExistsException : Exception
{
    public UserAlreadyExistsException()
        : base("A user with this email address already exists.")
    {
    }

    public UserAlreadyExistsException(string message)
        : base(message)
    {
    }

    public UserAlreadyExistsException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
