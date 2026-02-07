namespace BookTracker.Core.Exceptions;

/// <summary>
/// Exception thrown when a user account is locked due to too many failed login attempts.
/// </summary>
public class AccountLockedException : Exception
{
    public AccountLockedException()
        : base("Account is locked due to too many failed login attempts. Please try again later.")
    {
    }

    public AccountLockedException(string message)
        : base(message)
    {
    }

    public AccountLockedException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
