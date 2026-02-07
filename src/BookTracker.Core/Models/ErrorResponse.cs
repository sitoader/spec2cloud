namespace BookTracker.Core.Models;

/// <summary>
/// Represents a standardized error response for API operations.
/// </summary>
public record ErrorResponse
{
    /// <summary>
    /// Gets the main error message.
    /// </summary>
    public required string Message { get; init; }

    /// <summary>
    /// Gets additional error details or validation errors, if any.
    /// </summary>
    public List<string>? Errors { get; init; }

    /// <summary>
    /// Gets the trace identifier for tracking this error in logs.
    /// </summary>
    public string? TraceId { get; init; }
}
