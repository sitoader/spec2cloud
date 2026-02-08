using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates author following operations.
/// </summary>
public class AuthorFollowService : IAuthorFollowService
{
    private readonly IFollowedAuthorRepository _followedAuthorRepo;
    private readonly ILogger<AuthorFollowService> _logger;

    public AuthorFollowService(IFollowedAuthorRepository followedAuthorRepo, ILogger<AuthorFollowService> logger)
    {
        _followedAuthorRepo = followedAuthorRepo;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<FollowedAuthor> FollowAuthorAsync(string userId, string authorName, bool notificationsEnabled)
    {
        if (string.IsNullOrWhiteSpace(authorName))
            throw new ArgumentException("Author name is required.");

        var existing = await _followedAuthorRepo.GetByUserAndAuthorAsync(userId, authorName);
        if (existing is not null)
            throw new ArgumentException("You are already following this author.");

        var followedAuthor = new FollowedAuthor
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AuthorName = authorName,
            FollowedAt = DateTime.UtcNow,
            NotificationsEnabled = notificationsEnabled
        };

        await _followedAuthorRepo.AddAsync(followedAuthor);
        _logger.LogInformation("User {UserId} followed author {AuthorName}", userId, authorName);
        return followedAuthor;
    }

    /// <inheritdoc />
    public async Task UnfollowAuthorAsync(string userId, string authorName)
    {
        var existing = await _followedAuthorRepo.GetByUserAndAuthorAsync(userId, authorName);
        if (existing is null)
            throw new ArgumentException("You are not following this author.");

        await _followedAuthorRepo.DeleteAsync(existing.Id);
        _logger.LogInformation("User {UserId} unfollowed author {AuthorName}", userId, authorName);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<FollowedAuthor>> GetFollowedAuthorsAsync(string userId)
    {
        return await _followedAuthorRepo.GetByUserIdAsync(userId);
    }
}
