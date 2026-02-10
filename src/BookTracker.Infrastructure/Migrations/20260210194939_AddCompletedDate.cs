using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompletedDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedDate",
                table: "Books",
                type: "timestamp with time zone",
                nullable: true);

            // Backfill CompletedDate for existing completed books using AddedDate
            // BookStatus.Completed == 2
            migrationBuilder.Sql(
                """UPDATE "Books" SET "CompletedDate" = "AddedDate" WHERE "Status" = 2 AND "CompletedDate" IS NULL""");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedDate",
                table: "Books");
        }
    }
}
