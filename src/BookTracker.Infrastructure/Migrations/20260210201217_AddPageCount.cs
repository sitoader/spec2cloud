using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPageCount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PageCount",
                table: "Books",
                type: "integer",
                nullable: true);

            // Seed page counts for existing books (real values from Open Library / Google Books APIs)
            migrationBuilder.Sql(@"
                UPDATE ""Books"" SET ""PageCount"" = CASE ""Title""
                    WHEN 'Dune' THEN 544
                    WHEN 'Neuromancer' THEN 271
                    WHEN 'Foundation' THEN 320
                    WHEN 'The Left Hand of Darkness' THEN 304
                    WHEN 'Snow Crash' THEN 480
                    WHEN 'Brave New World' THEN 315
                    WHEN 'Fahrenheit 451' THEN 256
                    WHEN 'Do Androids Dream of Electric Sheep?' THEN 256
                    WHEN 'Hyperion' THEN 512
                    WHEN 'Blindsight' THEN 384
                    WHEN 'Ancillary Justice' THEN 393
                    WHEN 'Children of Time' THEN 640
                    WHEN 'Project Hail Mary' THEN 496
                    WHEN 'The Three-Body Problem' THEN 416
                    WHEN '2001: A Space Odyssey' THEN 320
                    WHEN 'Rendezvous with Rama' THEN 288
                    WHEN 'The Dispossessed' THEN 400
                END
                WHERE ""PageCount"" IS NULL;
            ");
            // Handle titles with apostrophes stored without them in DB
            migrationBuilder.Sql(@"
                UPDATE ""Books"" SET ""PageCount"" = 324 WHERE ""Title"" LIKE 'Ender%Game' AND ""PageCount"" IS NULL;
                UPDATE ""Books"" SET ""PageCount"" = 309 WHERE ""Title"" LIKE 'The Hitchhiker%' AND ""PageCount"" IS NULL;
                UPDATE ""Books"" SET ""PageCount"" = 388 WHERE ""Title"" LIKE '%Martian' AND ""PageCount"" IS NULL;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PageCount",
                table: "Books");
        }
    }
}
