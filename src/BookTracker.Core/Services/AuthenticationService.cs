using BookTracker.Core.Entities;
using BookTracker.Core.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates user lifecycle operations (sign-up, sign-in, profile lookup)
/// by coordinating between ASP.NET Identity stores and the JWT token service.
/// </summary>
public class AuthenticationService : IAuthenticationService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly JwtTokenService _tokens;
    private readonly ILogger<AuthenticationService> _logger;

    public AuthenticationService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        JwtTokenService tokens,
        ILogger<AuthenticationService> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokens = tokens;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<AuthResult> RegisterUserAsync(
        string email, string password, string? displayName)
    {
        // Reject if the address is already taken
        var existing = await _userManager.FindByEmailAsync(email);
        if (existing is not null)
        {
            _logger.LogWarning("Duplicate registration attempt for an existing email");
            throw new UserAlreadyExistsException();
        }

        var newAccount = new ApplicationUser
        {
            UserName = email,
            Email = email,
            DisplayName = displayName,
            CreatedDate = DateTime.UtcNow,
        };

        var createResult = await _userManager.CreateAsync(newAccount, password);
        if (!createResult.Succeeded)
        {
            var descriptions = createResult.Errors
                .Select(e => e.Description)
                .ToList();
            _logger.LogWarning(
                "Identity rejected new account: {Details}",
                string.Join("; ", descriptions));
            throw new ArgumentException(string.Join(" ", descriptions));
        }

        _logger.LogInformation("New account provisioned: {Id}", newAccount.Id);

        var (encoded, expiryUtc) = _tokens.CreateToken(newAccount.Id, email);

        return new AuthResult
        {
            UserId = newAccount.Id,
            Email = email,
            DisplayName = displayName,
            Token = encoded,
            ExpiresAtUtc = expiryUtc,
        };
    }

    /// <inheritdoc />
    public async Task<AuthResult> AuthenticateUserAsync(
        string email, string password, bool persistSession)
    {
        var target = await _userManager.FindByEmailAsync(email);
        if (target is null)
        {
            _logger.LogWarning("Sign-in attempted for unregistered email");
            throw new Exceptions.AuthenticationException();
        }

        // Surface lockout before even trying the password
        if (await _userManager.IsLockedOutAsync(target))
        {
            _logger.LogWarning("Locked account access attempt: {Id}", target.Id);
            throw new AccountLockedException();
        }

        var passwordCheck = await _signInManager.CheckPasswordSignInAsync(
            target, password, lockoutOnFailure: true);

        if (passwordCheck.IsLockedOut)
        {
            _logger.LogWarning(
                "Account {Id} transitioned to locked state", target.Id);
            throw new AccountLockedException();
        }

        if (!passwordCheck.Succeeded)
        {
            _logger.LogWarning("Bad password for account {Id}", target.Id);
            throw new Exceptions.AuthenticationException();
        }

        // Stamp last-login and persist it
        target.LastLoginDate = DateTime.UtcNow;
        await _userManager.UpdateAsync(target);

        var (encoded, expiryUtc) = _tokens.CreateToken(
            target.Id, email, usePersistentLifetime: persistSession);

        _logger.LogInformation("Sign-in succeeded for {Id}", target.Id);

        return new AuthResult
        {
            UserId = target.Id,
            Email = email,
            DisplayName = target.DisplayName,
            Token = encoded,
            ExpiresAtUtc = expiryUtc,
        };
    }

    /// <inheritdoc />
    public async Task<UserProfile> GetUserProfileAsync(string userId)
    {
        var target = await _userManager.FindByIdAsync(userId);
        if (target is null)
            throw new Exceptions.AuthenticationException("No account matches the given identifier.");

        return new UserProfile
        {
            UserId = target.Id,
            Email = target.Email!,
            DisplayName = target.DisplayName,
        };
    }
}
