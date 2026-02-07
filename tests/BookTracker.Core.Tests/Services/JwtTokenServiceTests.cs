using System.IdentityModel.Tokens.Jwt;
using System.Text;
using BookTracker.Core.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BookTracker.Core.Tests.Services;

/// <summary>
/// Validates JWT creation, claim population, expiration logic,
/// and signature verification for the BookTracker token service.
/// </summary>
public class JwtTokenServiceTests
{
    private const string TestKey = "booktracker-unit-test-secret-that-is-long-enough-for-hmac256";
    private const string TestIssuer = "https://test-booktracker.example";
    private const string TestAudience = "https://test-booktracker-client.example";

    private static JwtTokenService BuildService()
    {
        var configData = new Dictionary<string, string?>
        {
            ["JwtSettings:SecretKey"] = TestKey,
            ["JwtSettings:Issuer"] = TestIssuer,
            ["JwtSettings:Audience"] = TestAudience,
        };
        var cfg = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();
        return new JwtTokenService(cfg);
    }

    [Fact]
    public void CreateToken_ReturnsNonEmptyEncodedString()
    {
        var svc = BuildService();
        var (encoded, _) = svc.CreateToken("user-42", "alice@example.com");
        Assert.False(string.IsNullOrWhiteSpace(encoded));
    }

    [Fact]
    public void CreateToken_EmbedSubAndEmailClaims()
    {
        var svc = BuildService();
        var (encoded, _) = svc.CreateToken("user-42", "alice@example.com");

        var reader = new JwtSecurityTokenHandler();
        var parsed = reader.ReadJwtToken(encoded);

        Assert.Equal("user-42", parsed.Subject);
        Assert.Contains(parsed.Claims,
            c => c.Type == JwtRegisteredClaimNames.Email && c.Value == "alice@example.com");
    }

    [Fact]
    public void CreateToken_IncludesJtiAndIatClaims()
    {
        var svc = BuildService();
        var (encoded, _) = svc.CreateToken("u1", "bob@example.com");

        var parsed = new JwtSecurityTokenHandler().ReadJwtToken(encoded);
        Assert.Contains(parsed.Claims, c => c.Type == JwtRegisteredClaimNames.Jti);
        Assert.Contains(parsed.Claims, c => c.Type == JwtRegisteredClaimNames.Iat);
    }

    [Fact]
    public void CreateToken_DefaultExpiry_IsAround24Hours()
    {
        var svc = BuildService();
        var beforeCall = DateTime.UtcNow;
        var (_, expiryUtc) = svc.CreateToken("u1", "test@example.com");

        var expectedMin = beforeCall.AddHours(JwtTokenService.DefaultLifetimeHours).AddSeconds(-5);
        var expectedMax = DateTime.UtcNow.AddHours(JwtTokenService.DefaultLifetimeHours).AddSeconds(5);

        Assert.InRange(expiryUtc, expectedMin, expectedMax);
    }

    [Fact]
    public void CreateToken_PersistentLifetime_IsAround30Days()
    {
        var svc = BuildService();
        var beforeCall = DateTime.UtcNow;
        var (_, expiryUtc) = svc.CreateToken("u1", "test@example.com", usePersistentLifetime: true);

        var expectedMin = beforeCall.AddDays(JwtTokenService.PersistentLifetimeDays).AddSeconds(-5);
        var expectedMax = DateTime.UtcNow.AddDays(JwtTokenService.PersistentLifetimeDays).AddSeconds(5);

        Assert.InRange(expiryUtc, expectedMin, expectedMax);
    }

    [Fact]
    public void CreateToken_SignatureIsVerifiable()
    {
        var svc = BuildService();
        var (encoded, _) = svc.CreateToken("u1", "verify@example.com");

        var validationParams = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestKey)),
            ValidateIssuer = true,
            ValidIssuer = TestIssuer,
            ValidateAudience = true,
            ValidAudience = TestAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
        };

        var handler = new JwtSecurityTokenHandler();
        var principal = handler.ValidateToken(encoded, validationParams, out var validatedToken);

        Assert.NotNull(principal);
        Assert.NotNull(validatedToken);
    }

    [Fact]
    public void Constructor_ThrowsWhenSecretKeyMissing()
    {
        var cfg = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        Assert.Throws<InvalidOperationException>(() => new JwtTokenService(cfg));
    }

    [Fact]
    public void CreateToken_PersistentFlag_ProducesLaterExpiryThanDefault()
    {
        var svc = BuildService();
        var (_, defaultExpiry) = svc.CreateToken("u1", "a@b.com");
        var (_, persistentExpiry) = svc.CreateToken("u1", "a@b.com", usePersistentLifetime: true);

        Assert.True(persistentExpiry > defaultExpiry);
    }
}
