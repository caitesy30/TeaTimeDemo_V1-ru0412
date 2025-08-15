using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaTimeDemo.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddLineChannelAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LineChannelAccounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChannelId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LineUserId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    GlobalUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LinkedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LineChannelAccounts", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LineChannelAccounts_ChannelId_LineUserId",
                table: "LineChannelAccounts",
                columns: new[] { "ChannelId", "LineUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LineChannelAccounts_GlobalUserId",
                table: "LineChannelAccounts",
                column: "GlobalUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LineChannelAccounts");
        }
    }
}
