using BookTracker.Core.Entities;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates reading progress, sessions, and streak operations.
/// </summary>
public class ReadingProgressService : IReadingProgressService
{
    private readonly IReadingSessionRepository _sessionRepo;
    private readonly IReadingProgressRepository _progressRepo;
    private readonly IReadingStreakRepository _streakRepo;
    private readonly IBookRepository _bookRepo;
    private readonly ILogger<ReadingProgressService> _logger;

    public ReadingProgressService(
        IReadingSessionRepository sessionRepo,
        IReadingProgressRepository progressRepo,
        IReadingStreakRepository streakRepo,
        IBookRepository bookRepo,
        ILogger<ReadingProgressService> logger)
    {
        _sessionRepo = sessionRepo;
        _progressRepo = progressRepo;
        _streakRepo = streakRepo;
        _bookRepo = bookRepo;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<ReadingSession> LogSessionAsync(string userId, Guid bookId, DateTime startTime, DateTime? endTime, int? pagesRead, int? currentPage, string? notes)
    {
        var book = await _bookRepo.GetByIdAsync(bookId);
        if (book is null)
            throw new BookNotFoundException();
        if (book.UserId != userId)
            throw new BookAccessDeniedException();

        var session = new ReadingSession
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            BookId = bookId,
            StartTime = startTime,
            EndTime = endTime,
            PagesRead = pagesRead,
            CurrentPage = currentPage,
            Notes = notes,
            CreatedAt = DateTime.UtcNow
        };

        await _sessionRepo.AddAsync(session);

        // Update streak
        await UpdateStreakAsync(userId);

        _logger.LogInformation("Reading session logged for book {BookId} by user {UserId}", bookId, userId);
        return session;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<ReadingSession>> GetSessionsAsync(string userId, Guid? bookId, DateTime? startDate, DateTime? endDate)
    {
        if (bookId.HasValue)
            return await _sessionRepo.GetByBookIdAsync(userId, bookId.Value);

        return await _sessionRepo.GetByDateRangeAsync(userId, startDate, endDate);
    }

    /// <inheritdoc />
    public async Task<ReadingProgress?> GetProgressAsync(string userId, Guid bookId)
    {
        return await _progressRepo.GetByUserAndBookAsync(userId, bookId);
    }

    /// <inheritdoc />
    public async Task<ReadingProgress> UpdateProgressAsync(string userId, Guid bookId, int currentPage, int? totalPages)
    {
        var book = await _bookRepo.GetByIdAsync(bookId);
        if (book is null)
            throw new BookNotFoundException();
        if (book.UserId != userId)
            throw new BookAccessDeniedException();

        var progress = await _progressRepo.GetByUserAndBookAsync(userId, bookId);
        if (progress is null)
        {
            progress = new ReadingProgress
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                BookId = bookId,
                CurrentPage = currentPage,
                TotalPages = totalPages,
                ProgressPercentage = totalPages > 0 ? Math.Round((decimal)currentPage / totalPages.Value * 100, 2) : 0,
                LastUpdated = DateTime.UtcNow
            };
            await _progressRepo.AddAsync(progress);
        }
        else
        {
            progress.CurrentPage = currentPage;
            if (totalPages.HasValue) progress.TotalPages = totalPages;
            progress.ProgressPercentage = progress.TotalPages > 0
                ? Math.Round((decimal)currentPage / progress.TotalPages.Value * 100, 2)
                : 0;
            progress.LastUpdated = DateTime.UtcNow;
            await _progressRepo.UpdateAsync(progress);
        }

        _logger.LogInformation("Reading progress updated for book {BookId} by user {UserId}", bookId, userId);
        return progress;
    }

    /// <inheritdoc />
    public async Task<ReadingStreak> GetStreakAsync(string userId)
    {
        var streak = await _streakRepo.GetByUserIdAsync(userId);
        if (streak is null)
        {
            streak = new ReadingStreak
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CurrentStreak = 0,
                LongestStreak = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _streakRepo.AddAsync(streak);
        }
        return streak;
    }

    private async Task UpdateStreakAsync(string userId)
    {
        var streak = await _streakRepo.GetByUserIdAsync(userId);
        var today = DateTime.UtcNow.Date;

        if (streak is null)
        {
            streak = new ReadingStreak
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CurrentStreak = 1,
                LongestStreak = 1,
                LastReadDate = today,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _streakRepo.AddAsync(streak);
            return;
        }

        if (streak.LastReadDate == today) return;

        if (streak.LastReadDate == today.AddDays(-1))
        {
            streak.CurrentStreak++;
        }
        else
        {
            streak.CurrentStreak = 1;
        }

        if (streak.CurrentStreak > streak.LongestStreak)
            streak.LongestStreak = streak.CurrentStreak;

        streak.LastReadDate = today;
        streak.UpdatedAt = DateTime.UtcNow;
        await _streakRepo.UpdateAsync(streak);
    }
}
