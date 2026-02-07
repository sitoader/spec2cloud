using Microsoft.Extensions.Configuration;

namespace BookTracker.Api.Tests.Configuration;

/// <summary>
/// Tests for application configuration loading and precedence.
/// </summary>
public class ConfigurationTests
{
    [Fact]
    public void Configuration_LoadsFromAppSettings()
    {
        // Arrange
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .Build();

        // Act
        var allowedHosts = configuration["AllowedHosts"];

        // Assert
        Assert.NotNull(allowedHosts);
    }

    [Fact]
    public void Configuration_LoadsJwtSettings()
    {
        // Arrange
        var configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: true)
            .Build();

        // Act
        var jwtIssuer = configuration["JwtSettings:Issuer"];
        var jwtAudience = configuration["JwtSettings:Audience"];

        // Assert
        Assert.NotNull(jwtIssuer);
        Assert.NotNull(jwtAudience);
    }

    [Fact]
    public void Configuration_LoadsCorsSettings()
    {
        // Arrange
        var configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: true)
            .Build();

        // Act
        var corsOrigins = configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>();

        // Assert
        Assert.NotNull(corsOrigins);
        Assert.NotEmpty(corsOrigins);
    }

    [Fact]
    public void Configuration_DevelopmentOverridesBase()
    {
        // Arrange
        var baseConfig = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: true)
            .Build();

        var devConfig = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        // Act
        var baseConnectionString = baseConfig.GetConnectionString("DefaultConnection");
        var devConnectionString = devConfig.GetConnectionString("DefaultConnection");

        // Assert
        Assert.NotNull(baseConnectionString);
        Assert.NotNull(devConnectionString);
        // Development should override production connection string
        Assert.NotEqual(baseConnectionString, devConnectionString);
    }
}
