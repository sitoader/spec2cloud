using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookTracker.Infrastructure.Migrations
{
    /// <summary>
    /// Data-only migration to fix rating inconsistencies:
    /// 1. Backfills Rating rows from BookReviews that have no corresponding Rating entry
    /// 2. Syncs existing Ratings to match the most recent BookReview score for the same book
    /// Note: DB check constraint CK_Ratings_Score already prevents Score outside 1-5 range.
    /// </summary>
    public partial class SyncRatingData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: For each BookReview that has no matching Rating for that book,
            //         insert a new Rating row using the review's star value.
            //         If multiple reviews exist for the same book (different users),
            //         pick the most recent one.
            migrationBuilder.Sql(
                """
                INSERT INTO "Ratings" ("Id", "BookId", "Score", "Notes", "RatedDate")
                SELECT
                    gen_random_uuid(),
                    br."BookId",
                    br."Stars",
                    br."PlainTextBody",
                    br."WrittenAt"
                FROM "BookReviews" br
                INNER JOIN (
                    SELECT "BookId", MAX("WrittenAt") AS "LatestWrittenAt"
                    FROM "BookReviews"
                    GROUP BY "BookId"
                ) latest ON br."BookId" = latest."BookId" AND br."WrittenAt" = latest."LatestWrittenAt"
                WHERE NOT EXISTS (
                    SELECT 1 FROM "Ratings" r WHERE r."BookId" = br."BookId"
                );
                """);

            // Step 2: For existing Ratings where a BookReview exists with a different score,
            //         update the Rating to match the most recent review's stars.
            migrationBuilder.Sql(
                """
                UPDATE "Ratings" r
                SET
                    "Score" = br."Stars",
                    "Notes" = br."PlainTextBody",
                    "UpdatedDate" = NOW() AT TIME ZONE 'UTC'
                FROM "BookReviews" br
                INNER JOIN (
                    SELECT "BookId", MAX("WrittenAt") AS "LatestWrittenAt"
                    FROM "BookReviews"
                    GROUP BY "BookId"
                ) latest ON br."BookId" = latest."BookId" AND br."WrittenAt" = latest."LatestWrittenAt"
                WHERE r."BookId" = br."BookId"
                  AND r."Score" <> br."Stars";
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Data-only migration — no schema rollback needed.
            // The data changes cannot be precisely reversed.
        }
    }
}
