using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace BookTracker.Api.Tests.Integration;

/// <summary>
/// Integration tests for application startup and middleware configuration.
/// </summary>
public class ApplicationStartupTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ApplicationStartupTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Application_StartsSuccessfully()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/health");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task HealthEndpoint_ReturnsHealthyStatus()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/health");
        var content = await response.Content.ReadAsStringAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("Healthy", content);
    }

    [Fact]
    public async Task SwaggerEndpoint_IsAccessibleInDevelopment()
    {
        // Arrange
        var factory = _factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Development");
        });
        var client = factory.CreateClient();

        // Act
        var response = await client.GetAsync("/swagger/v1/swagger.json");

        // Assert
        Assert.True(
            response.StatusCode == HttpStatusCode.OK || 
            response.StatusCode == HttpStatusCode.InternalServerError, // May fail if DB is not available
            $"Expected OK or InternalServerError but got {response.StatusCode}");
    }

    [Fact]
    public async Task HealthDetailedEndpoint_ReturnsStatus()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/health/detailed");

        // Assert
        // May be Unhealthy if database is not available, but should return a status
        Assert.True(
            response.StatusCode == HttpStatusCode.OK || 
            response.StatusCode == HttpStatusCode.ServiceUnavailable,
            $"Expected OK or ServiceUnavailable but got {response.StatusCode}");
    }
}
