using BookTracker.Core.Entities;
using BookTracker.Core.Exceptions;
using BookTracker.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace BookTracker.Core.Services;

/// <summary>
/// Orchestrates reading session, progress, and streak operations with ownership validation.
/// </summary>
public class ReadingProgressService : IReadingProgressService
{
    private readonly IBookRepository _bookRepo;
    private readonly IReadingSessionRepository _sessionRepo;
    private readonly IReadingProgressRepository _progressRepo;
    private readonly IReadingStreakRepository _streakRepo;
    private readonly ILogger<ReadingProgressService> _logger;

    public ReadingProgressService(
        IBookRepository bookRepo,
        IReadingSessionRepository sessionRepo,
        IReadingProgressRepository progressRepo,
        IReadingStreakRepository streakRepo,
        ILogger<ReadingProgressService> logger)
    {
        _bookRepo = bookRepo;
        _sessionRepo = sessionRepo;
        _progressRepo = progressRepo;
        _streakRepo = streakRepo;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<ReadingSession> RecordSessionAsync(
        string ownerId, Guid bookId, DateTime sessionStart, DateTime? sessionEnd,
        int? pageCount, int? pageReached, string? sessionNotes)
    {
        var book = await _bookRepo.GetByIdAsync(bookId);
        if (book is null)
            throw new BookNotFoundException();

        if (book.UserId != ownerId)
            throw new BookAccessDeniedException();

        var session = new ReadingSession
        {
            Id = Guid.NewGuid(),
            UserId = ownerId,
            BookId = bookId,
            SessionStart = sessionStart,
            SessionEnd = sessionEnd,
            PageCount = pageCount,
            PageReached = pageReached,
            SessionNotes = sessionNotes,
            RecordedAt = DateTime.UtcNow
        };

        await _sessionRepo.PersistAsync(session);
        await UpdateStreakInternalAsync(ownerId);

        _logger.LogInformation("Reading session recorded for book {BookId} by owner {OwnerId}", bookId, ownerId);
        return session;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<ReadingSession>> ListSessionsAsync(
        string ownerId, Guid? bookId, DateTime? from, DateTime? until)
    {
        if (bookId.HasValue)
        {
            var book = await _bookRepo.GetByIdAsync(bookId.Value);
            if (book is null)
                throw new BookNotFoundException();

            if (book.UserId != ownerId)
                throw new BookAccessDeniedException();

            return await _sessionRepo.FetchByOwnerAndBookAsync(ownerId, bookId.Value);
        }

        return await _sessionRepo.FetchByOwnerAsync(ownerId, from, until);
    }

    /// <inheritdoc />
    public async Task<ReadingProgress?> FetchProgressAsync(string ownerId, Guid bookId)
    {
        var book = await _bookRepo.GetByIdAsync(bookId);
        if (book is null)
            throw new BookNotFoundException();

        if (book.UserId != ownerId)
            throw new BookAccessDeniedException();

        return await _progressRepo.FindByOwnerAndBookAsync(ownerId, bookId);
    }

    /// <inheritdoc />
    public async Task<ReadingProgress> SaveProgressAsync(
        string ownerId, Guid bookId, int pageNumber, int? bookTotalPages)
    {
        var book = await _bookRepo.GetByIdAsync(bookId);
        if (book is null)
            throw new BookNotFoundException();

        if (book.UserId != ownerId)
            throw new BookAccessDeniedException();

        var existing = await _progressRepo.FindByOwnerAndBookAsync(ownerId, bookId);
        if (existing is not null)
        {
            existing.PageNumber = pageNumber;
            existing.BookTotalPages = bookTotalPages;
            existing.CompletionPercent = ComputeCompletionPercent(pageNumber, bookTotalPages);
            existing.ProjectedFinishDate = ProjectFinishDate(pageNumber, bookTotalPages);
            existing.ModifiedAt = DateTime.UtcNow;
            await _progressRepo.ModifyAsync(existing);
            _logger.LogInformation("Reading progress updated for book {BookId} by owner {OwnerId}", bookId, ownerId);
            return existing;
        }

        var progress = new ReadingProgress
        {
            Id = Guid.NewGuid(),
            UserId = ownerId,
            BookId = bookId,
            PageNumber = pageNumber,
            BookTotalPages = bookTotalPages,
            CompletionPercent = ComputeCompletionPercent(pageNumber, bookTotalPages),
            ProjectedFinishDate = ProjectFinishDate(pageNumber, bookTotalPages),
            ModifiedAt = DateTime.UtcNow
        };

        await _progressRepo.PersistAsync(progress);
        _logger.LogInformation("Reading progress created for book {BookId} by owner {OwnerId}", bookId, ownerId);
        return progress;
    }

    /// <inheritdoc />
    public async Task<ReadingStreak> FetchStreakAsync(string ownerId)
    {
        var streak = await _streakRepo.FindByOwnerAsync(ownerId);
        if (streak is not null)
            return streak;

        var newStreak = new ReadingStreak
        {
            Id = Guid.NewGuid(),
            UserId = ownerId,
            ActiveStreakDays = 0,
            BestStreakDays = 0,
            MostRecentReadDate = null,
            TrackedSince = DateTime.UtcNow,
            ModifiedAt = DateTime.UtcNow
        };

        await _streakRepo.PersistAsync(newStreak);
        return newStreak;
    }

    private async Task UpdateStreakInternalAsync(string ownerId)
    {
        var streak = await _streakRepo.FindByOwnerAsync(ownerId);
        var today = DateTime.UtcNow.Date;

        if (streak is null)
        {
            var newStreak = new ReadingStreak
            {
                Id = Guid.NewGuid(),
                UserId = ownerId,
                ActiveStreakDays = 1,
                BestStreakDays = 1,
                MostRecentReadDate = today,
                TrackedSince = DateTime.UtcNow,
                ModifiedAt = DateTime.UtcNow
            };
            await _streakRepo.PersistAsync(newStreak);
            return;
        }

        if (streak.MostRecentReadDate?.Date == today)
            return;

        if (streak.MostRecentReadDate?.Date == today.AddDays(-1))
        {
            streak.ActiveStreakDays++;
        }
        else
        {
            streak.ActiveStreakDays = 1;
        }

        if (streak.ActiveStreakDays > streak.BestStreakDays)
            streak.BestStreakDays = streak.ActiveStreakDays;

        streak.MostRecentReadDate = today;
        streak.ModifiedAt = DateTime.UtcNow;
        await _streakRepo.ModifyAsync(streak);
    }

    private static decimal ComputeCompletionPercent(int currentPage, int? totalPages)
    {
        if (totalPages is null or <= 0)
            return 0m;

        return Math.Min(Math.Round((decimal)currentPage / totalPages.Value * 100, 2), 100m);
    }

    private static DateTime? ProjectFinishDate(int currentPage, int? totalPages)
    {
        if (totalPages is null or <= 0)
            return null;

        var remaining = totalPages.Value - currentPage;
        if (remaining <= 0)
            return DateTime.UtcNow;

        const int pagesPerDay = 30;
        var daysRemaining = (int)Math.Ceiling((double)remaining / pagesPerDay);
        return DateTime.UtcNow.AddDays(daysRemaining);
    }
}
