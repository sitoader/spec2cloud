using BookTracker.Core.Entities;
using BookTracker.Core.Repositories;
using BookTracker.Core.Services;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace BookTracker.Core.Tests.Services;

/// <summary>
/// Unit tests for <see cref="GoalsService"/>.
/// </summary>
public class GoalsServiceTests
{
    private readonly IReadingGoalRepository _goalRepo;
    private readonly IAchievementRepository _achievementRepo;
    private readonly GoalsService _svc;
    private const string UserId = "user-1";

    public GoalsServiceTests()
    {
        _goalRepo = Substitute.For<IReadingGoalRepository>();
        _achievementRepo = Substitute.For<IAchievementRepository>();
        var logger = Substitute.For<ILogger<GoalsService>>();
        _svc = new GoalsService(_goalRepo, _achievementRepo, logger);
    }

    [Fact]
    public async Task SetGoalAsync_CreatesNew_WhenNoneExists()
    {
        _goalRepo.GetByUserAndYearAsync(UserId, 2026).ReturnsNull();

        var result = await _svc.SetGoalAsync(UserId, 2026, 24);

        Assert.Equal(2026, result.Year);
        Assert.Equal(24, result.TargetBooksCount);
        Assert.Equal(0, result.CompletedBooksCount);
        await _goalRepo.Received(1).AddAsync(Arg.Any<ReadingGoal>());
    }

    [Fact]
    public async Task SetGoalAsync_UpdatesExisting()
    {
        var existing = new ReadingGoal { Id = Guid.NewGuid(), UserId = UserId, Year = 2026, TargetBooksCount = 12, CompletedBooksCount = 3, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        _goalRepo.GetByUserAndYearAsync(UserId, 2026).Returns(existing);

        var result = await _svc.SetGoalAsync(UserId, 2026, 30);

        Assert.Equal(30, result.TargetBooksCount);
        Assert.Equal(3, result.CompletedBooksCount);
        await _goalRepo.Received(1).UpdateAsync(Arg.Any<ReadingGoal>());
    }

    [Fact]
    public async Task SetGoalAsync_ThrowsArgException_WhenTargetLessThan1()
    {
        await Assert.ThrowsAsync<ArgumentException>(
            () => _svc.SetGoalAsync(UserId, 2026, 0));
    }

    [Fact]
    public async Task GetGoalAsync_ReturnsNull_WhenNoGoal()
    {
        _goalRepo.GetByUserAndYearAsync(UserId, 2026).ReturnsNull();

        var result = await _svc.GetGoalAsync(UserId, 2026);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetAllAchievementsAsync_ReturnsAll()
    {
        var achievements = new List<Achievement>
        {
            new() { Id = Guid.NewGuid(), Code = "first_book", Name = "First Book" },
            new() { Id = Guid.NewGuid(), Code = "bookworm", Name = "Bookworm" }
        };
        _achievementRepo.GetAllAsync().Returns(achievements);

        var result = await _svc.GetAllAchievementsAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetUserAchievementsAsync_ReturnsUserAchievements()
    {
        var userAchievements = new List<UserAchievement>
        {
            new() { Id = Guid.NewGuid(), UserId = UserId, AchievementId = Guid.NewGuid(), UnlockedAt = DateTime.UtcNow }
        };
        _achievementRepo.GetUserAchievementsAsync(UserId).Returns(userAchievements);

        var result = await _svc.GetUserAchievementsAsync(UserId);

        Assert.Single(result);
    }
}
