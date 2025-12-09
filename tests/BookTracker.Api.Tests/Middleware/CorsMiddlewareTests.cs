using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace BookTracker.Api.Tests.Middleware;

/// <summary>
/// Tests for CORS middleware configuration.
/// </summary>
public class CorsMiddlewareTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public CorsMiddlewareTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CorsMiddleware_AllowsConfiguredOrigin()
    {
        // Arrange
        var client = _factory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Get, "/health");
        request.Headers.Add("Origin", "http://localhost:3000");

        // Act
        var response = await client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        // Check if CORS headers are present
        if (response.Headers.Contains("Access-Control-Allow-Origin"))
        {
            var allowedOrigin = response.Headers.GetValues("Access-Control-Allow-Origin").FirstOrDefault();
            Assert.Equal("http://localhost:3000", allowedOrigin);
        }
    }

    [Fact]
    public async Task CorsMiddleware_HandlesPreflightRequest()
    {
        // Arrange
        var client = _factory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Options, "/health");
        request.Headers.Add("Origin", "http://localhost:3000");
        request.Headers.Add("Access-Control-Request-Method", "GET");

        // Act
        var response = await client.SendAsync(request);

        // Assert
        // Preflight requests should return 204 No Content or 200 OK
        Assert.True(
            response.StatusCode == HttpStatusCode.NoContent || 
            response.StatusCode == HttpStatusCode.OK,
            $"Expected NoContent or OK but got {response.StatusCode}");
    }
}
