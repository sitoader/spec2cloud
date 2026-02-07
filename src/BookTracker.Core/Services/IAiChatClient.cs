namespace BookTracker.Core.Services;

/// <summary>
/// Abstraction for calling an AI chat completion API.
/// </summary>
public interface IAiChatClient
{
    /// <summary>Sends a system and user message to the AI and returns the assistant response.</summary>
    Task<AiChatResponse> GetCompletionAsync(string systemMessage, string userMessage, float temperature, int maxTokens);
}

/// <summary>
/// Represents the response from an AI chat completion call.
/// </summary>
public record AiChatResponse
{
    public required string Content { get; init; }
    public int PromptTokens { get; init; }
    public int CompletionTokens { get; init; }
}
