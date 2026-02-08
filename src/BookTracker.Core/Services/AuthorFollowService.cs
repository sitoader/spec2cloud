using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates author follow and tracking operations.
/// </summary>
public class AuthorFollowService : IAuthorFollowService
{
    private readonly IFollowedAuthorRepository _followRepo;
    private readonly IBookRepository _bookRepo;
    private readonly ILogger<AuthorFollowService> _logger;

    public AuthorFollowService(IFollowedAuthorRepository followRepo, IBookRepository bookRepo, ILogger<AuthorFollowService> logger)
    {
        _followRepo = followRepo;
        _bookRepo = bookRepo;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<FollowedAuthor> StartFollowingAsync(string ownerId, string authorName, bool alertsEnabled)
    {
        if (string.IsNullOrWhiteSpace(authorName))
            throw new ArgumentException("Author name must not be empty.");

        var existing = await _followRepo.FindByOwnerAndAuthorAsync(ownerId, authorName);
        if (existing is not null)
            throw new ArgumentException($"Already following author '{authorName}'.");

        var follow = new FollowedAuthor
        {
            Id = Guid.NewGuid(),
            UserId = ownerId,
            AuthorName = authorName.Trim(),
            StartedFollowingAt = DateTime.UtcNow,
            AlertsEnabled = alertsEnabled
        };

        await _followRepo.PersistAsync(follow);
        _logger.LogInformation("Owner {OwnerId} started following author {AuthorName}", ownerId, authorName);
        return follow;
    }

    /// <inheritdoc />
    public async Task StopFollowingAsync(string ownerId, string authorName)
    {
        var existing = await _followRepo.FindByOwnerAndAuthorAsync(ownerId, authorName);
        if (existing is null)
            throw new KeyNotFoundException($"Not following author '{authorName}'.");

        await _followRepo.RemoveAsync(ownerId, authorName);
        _logger.LogInformation("Owner {OwnerId} stopped following author {AuthorName}", ownerId, authorName);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<FollowedAuthor>> ListFollowedAsync(string ownerId)
    {
        return await _followRepo.FetchByOwnerAsync(ownerId);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Book>> FetchAuthorLibraryAsync(string ownerId, string authorName)
    {
        var result = await _bookRepo.GetByUserIdAsync(ownerId, null, 0, int.MaxValue);
        return result.Books
            .Where(b => string.Equals(b.Author, authorName, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }
}
