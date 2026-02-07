using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BookTracker.Core.Services;

/// <summary>
/// Produces signed JWT bearer tokens used for BookTracker user sessions.
/// Reads key material and validation parameters from IConfiguration at startup.
/// </summary>
public class JwtTokenService
{
    /// <summary>Duration of a regular (non-persistent) session.</summary>
    public const int DefaultLifetimeHours = 24;

    /// <summary>Duration of a "remember me" session.</summary>
    public const int PersistentLifetimeDays = 30;

    private readonly byte[] _keyMaterial;
    private readonly string _tokenIssuer;
    private readonly string _tokenAudience;

    public JwtTokenService(IConfiguration cfg)
    {
        var jwtSection = cfg.GetSection("JwtSettings");
        var rawKey = jwtSection["SecretKey"]
            ?? throw new InvalidOperationException("Missing JwtSettings:SecretKey in configuration.");
        _keyMaterial = Encoding.UTF8.GetBytes(rawKey);
        _tokenIssuer = jwtSection["Issuer"] ?? "BookTrackerApp";
        _tokenAudience = jwtSection["Audience"] ?? "BookTrackerApp";
    }

    /// <summary>
    /// Creates a compact-serialized JWT carrying the supplied identity claims.
    /// </summary>
    /// <param name="subjectId">The user's unique identifier (becomes the "sub" claim).</param>
    /// <param name="emailAddress">Email embedded as the "email" claim.</param>
    /// <param name="usePersistentLifetime">If true the token lives for 30 days; otherwise 24 hours.</param>
    /// <returns>The encoded token string together with its UTC expiry.</returns>
    public (string Encoded, DateTime ExpiryUtc) CreateToken(
        string subjectId,
        string emailAddress,
        bool usePersistentLifetime = false)
    {
        var expiryUtc = usePersistentLifetime
            ? DateTime.UtcNow.AddDays(PersistentLifetimeDays)
            : DateTime.UtcNow.AddHours(DefaultLifetimeHours);

        var identity = new ClaimsIdentity(new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, subjectId),
            new Claim(JwtRegisteredClaimNames.Email, emailAddress),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
            new Claim(JwtRegisteredClaimNames.Iat,
                DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                ClaimValueTypes.Integer64),
        });

        var signingKey = new SymmetricSecurityKey(_keyMaterial);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = identity,
            Expires = expiryUtc,
            Issuer = _tokenIssuer,
            Audience = _tokenAudience,
            SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256),
        };

        var writer = new JwtSecurityTokenHandler();
        var rawToken = writer.CreateToken(tokenDescriptor);
        return (writer.WriteToken(rawToken), expiryUtc);
    }
}
