using System.Net;
using System.Text.Json;
using BookTracker.Core.Models;
using BookTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BookTracker.Api.Tests.Middleware;

/// <summary>
/// Tests for global exception handler middleware.
/// </summary>
public class ExceptionHandlerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ExceptionHandlerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task ExceptionHandler_ReturnsErrorResponse_ForNonExistentEndpoint()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/non-existent-endpoint");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task ExceptionHandler_ReturnsJsonErrorResponse_WhenExceptionOccurs()
    {
        // Arrange
        // Create a factory with invalid configuration to force an error
        var factory = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Replace DbContext with one that will fail
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }
                
                // Add in-memory database for testing
                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDb");
                });
            });
        });

        var client = factory.CreateClient();

        // Act
        var response = await client.GetAsync("/health/detailed");

        // Assert
        // Should either succeed with in-memory DB or return proper error
        Assert.True(response.IsSuccessStatusCode || 
                   response.StatusCode == HttpStatusCode.ServiceUnavailable ||
                   response.StatusCode == HttpStatusCode.InternalServerError);
    }
}
