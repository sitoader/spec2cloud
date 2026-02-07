using System.ClientModel;
using Azure.AI.OpenAI;
using Azure.Identity;
using BookTracker.Core.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenAI.Chat;

namespace BookTracker.Api;

/// <summary>
/// Azure OpenAI implementation of <see cref="IAiChatClient"/>.
/// </summary>
public class AzureOpenAiChatClient : IAiChatClient
{
    private readonly ChatClient _chatClient;
    private readonly ILogger<AzureOpenAiChatClient> _logger;
    private readonly TimeSpan _requestTimeout;

    public AzureOpenAiChatClient(IConfiguration configuration, ILogger<AzureOpenAiChatClient> logger)
    {
        _logger = logger;

        var endpoint = configuration["AzureOpenAI:Endpoint"]
            ?? throw new InvalidOperationException("AzureOpenAI:Endpoint not configured.");
        var deploymentName = configuration["AzureOpenAI:DeploymentName"] ?? "gpt-4o";
        var useEntraId = configuration.GetValue("AzureOpenAI:UseEntraId", true);

        var timeoutSeconds = configuration.GetValue("AzureOpenAI:TimeoutSeconds", 30);
        _requestTimeout = TimeSpan.FromSeconds(timeoutSeconds);

        AzureOpenAIClient client;
        if (useEntraId)
        {
            // Use Azure Entra ID (recommended for production)
            var credential = new DefaultAzureCredential();
            client = new AzureOpenAIClient(new Uri(endpoint), credential);
        }
        else
        {
            // Use API key (only if key auth is enabled)
            var apiKey = configuration["AzureOpenAI:ApiKey"]
                ?? throw new InvalidOperationException("AzureOpenAI:ApiKey not configured.");
            var credential = new ApiKeyCredential(apiKey);
            client = new AzureOpenAIClient(new Uri(endpoint), credential);
        }
        
        _chatClient = client.GetChatClient(deploymentName);
    }

    /// <inheritdoc />
    public async Task<AiChatResponse> GetCompletionAsync(string systemMessage, string userMessage, float temperature, int maxTokens)
    {
        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(systemMessage),
            new UserChatMessage(userMessage),
        };

        var options = new ChatCompletionOptions
        {
            Temperature = temperature,
            MaxOutputTokenCount = maxTokens,
        };

        using var cts = new CancellationTokenSource(_requestTimeout);

        try
        {
            var response = await _chatClient.CompleteChatAsync(messages, options, cts.Token);
            var result = response.Value;

            var content = result.Content.Count > 0 ? result.Content[0].Text : string.Empty;
            var promptTokens = result.Usage?.InputTokenCount ?? 0;
            var completionTokens = result.Usage?.OutputTokenCount ?? 0;

            _logger.LogInformation(
                "Azure OpenAI call completed. PromptTokens={PromptTokens}, CompletionTokens={CompletionTokens}",
                promptTokens, completionTokens);

            return new AiChatResponse
            {
                Content = content,
                PromptTokens = promptTokens,
                CompletionTokens = completionTokens,
            };
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Azure OpenAI request timed out after {TimeoutSeconds} seconds", _requestTimeout.TotalSeconds);
            throw;
        }
        catch (ClientResultException ex)
        {
            _logger.LogError(ex, "Azure OpenAI API error: {StatusCode}", ex.Status);
            throw;
        }
    }
}
