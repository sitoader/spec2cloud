using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using BookTracker.Core.Services;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace BookTracker.Core.Tests.Services;

/// <summary>
/// Unit tests for <see cref="AuthorFollowService"/>.
/// </summary>
public class AuthorFollowServiceTests
{
    private readonly IFollowedAuthorRepository _followedAuthorRepo;
    private readonly AuthorFollowService _svc;
    private const string UserId = "user-1";

    public AuthorFollowServiceTests()
    {
        _followedAuthorRepo = Substitute.For<IFollowedAuthorRepository>();
        var logger = Substitute.For<ILogger<AuthorFollowService>>();
        _svc = new AuthorFollowService(_followedAuthorRepo, logger);
    }

    [Fact]
    public async Task FollowAuthorAsync_CreatesFollow()
    {
        _followedAuthorRepo.GetByUserAndAuthorAsync(UserId, "Brandon Sanderson").ReturnsNull();

        var result = await _svc.FollowAuthorAsync(UserId, "Brandon Sanderson", true);

        Assert.Equal("Brandon Sanderson", result.AuthorName);
        Assert.True(result.NotificationsEnabled);
        await _followedAuthorRepo.Received(1).AddAsync(Arg.Any<FollowedAuthor>());
    }

    [Fact]
    public async Task FollowAuthorAsync_ThrowsArgException_WhenAlreadyFollowing()
    {
        var existing = new FollowedAuthor { Id = Guid.NewGuid(), UserId = UserId, AuthorName = "Brandon Sanderson", FollowedAt = DateTime.UtcNow, NotificationsEnabled = true };
        _followedAuthorRepo.GetByUserAndAuthorAsync(UserId, "Brandon Sanderson").Returns(existing);

        await Assert.ThrowsAsync<ArgumentException>(
            () => _svc.FollowAuthorAsync(UserId, "Brandon Sanderson", true));
    }

    [Fact]
    public async Task FollowAuthorAsync_ThrowsArgException_WhenNameEmpty()
    {
        await Assert.ThrowsAsync<ArgumentException>(
            () => _svc.FollowAuthorAsync(UserId, "", true));
    }

    [Fact]
    public async Task UnfollowAuthorAsync_Unfollows()
    {
        var existing = new FollowedAuthor { Id = Guid.NewGuid(), UserId = UserId, AuthorName = "Brandon Sanderson", FollowedAt = DateTime.UtcNow, NotificationsEnabled = true };
        _followedAuthorRepo.GetByUserAndAuthorAsync(UserId, "Brandon Sanderson").Returns(existing);

        await _svc.UnfollowAuthorAsync(UserId, "Brandon Sanderson");

        await _followedAuthorRepo.Received(1).DeleteAsync(existing.Id);
    }

    [Fact]
    public async Task UnfollowAuthorAsync_ThrowsArgException_WhenNotFollowing()
    {
        _followedAuthorRepo.GetByUserAndAuthorAsync(UserId, "Unknown Author").ReturnsNull();

        await Assert.ThrowsAsync<ArgumentException>(
            () => _svc.UnfollowAuthorAsync(UserId, "Unknown Author"));
    }

    [Fact]
    public async Task GetFollowedAuthorsAsync_ReturnsAuthors()
    {
        var authors = new List<FollowedAuthor>
        {
            new() { Id = Guid.NewGuid(), UserId = UserId, AuthorName = "Author 1", FollowedAt = DateTime.UtcNow, NotificationsEnabled = true },
            new() { Id = Guid.NewGuid(), UserId = UserId, AuthorName = "Author 2", FollowedAt = DateTime.UtcNow, NotificationsEnabled = false }
        };
        _followedAuthorRepo.GetByUserIdAsync(UserId).Returns(authors);

        var result = await _svc.GetFollowedAuthorsAsync(UserId);

        Assert.Equal(2, result.Count());
    }
}
