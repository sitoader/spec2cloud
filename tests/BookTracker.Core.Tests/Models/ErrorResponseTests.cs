using BookTracker.Core.Models;

namespace BookTracker.Core.Tests.Models;

/// <summary>
/// Unit tests for ErrorResponse model.
/// </summary>
public class ErrorResponseTests
{
    [Fact]
    public void ErrorResponse_CanBeCreated_WithRequiredProperties()
    {
        // Arrange & Act
        var errorResponse = new ErrorResponse
        {
            Message = "Test error message",
            TraceId = "test-trace-id"
        };

        // Assert
        Assert.Equal("Test error message", errorResponse.Message);
        Assert.Equal("test-trace-id", errorResponse.TraceId);
        Assert.Null(errorResponse.Errors);
    }

    [Fact]
    public void ErrorResponse_CanBeCreated_WithErrors()
    {
        // Arrange & Act
        var errorResponse = new ErrorResponse
        {
            Message = "Validation failed",
            Errors = new List<string> { "Field1 is required", "Field2 is invalid" },
            TraceId = "test-trace-id"
        };

        // Assert
        Assert.Equal("Validation failed", errorResponse.Message);
        Assert.NotNull(errorResponse.Errors);
        Assert.Equal(2, errorResponse.Errors.Count);
        Assert.Contains("Field1 is required", errorResponse.Errors);
    }

    [Fact]
    public void ErrorResponse_IsImmutable()
    {
        // Arrange
        var errorResponse = new ErrorResponse
        {
            Message = "Original message",
            TraceId = "original-trace"
        };

        // Act & Assert
        // Record types are immutable by default
        // The following should not compile if uncommented:
        // errorResponse.Message = "Changed message";
        
        Assert.Equal("Original message", errorResponse.Message);
    }

    [Fact]
    public void ErrorResponse_SupportsWithExpression()
    {
        // Arrange
        var original = new ErrorResponse
        {
            Message = "Original message",
            TraceId = "original-trace"
        };

        // Act
        var modified = original with { Message = "Modified message" };

        // Assert
        Assert.Equal("Original message", original.Message);
        Assert.Equal("Modified message", modified.Message);
        Assert.Equal("original-trace", modified.TraceId);
    }
}
