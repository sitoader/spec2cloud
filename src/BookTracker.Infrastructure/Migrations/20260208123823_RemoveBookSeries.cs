using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveBookSeries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookSeriesEntries");

            migrationBuilder.DropTable(
                name: "BookSeries");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BookSeries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExpectedBookCount = table.Column<int>(type: "integer", nullable: true),
                    RegisteredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SeriesTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Synopsis = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookSeries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BookSeriesEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BookId = table.Column<Guid>(type: "uuid", nullable: false),
                    SeriesId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookSeriesEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BookSeriesEntries_BookSeries_SeriesId",
                        column: x => x.SeriesId,
                        principalTable: "BookSeries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BookSeriesEntries_Books_BookId",
                        column: x => x.BookId,
                        principalTable: "Books",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookSeriesEntries_BookId",
                table: "BookSeriesEntries",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_BookSeriesEntries_SeriesId_BookId",
                table: "BookSeriesEntries",
                columns: new[] { "SeriesId", "BookId" },
                unique: true);
        }
    }
}
