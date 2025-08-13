using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaTimeDemo.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class WalletCPlan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IdempotencyKey",
                table: "UserCurrencyLogs",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Token",
                table: "PendingCoin",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClaimedByLineUserId",
                table: "PendingCoin",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ClaimedRid",
                table: "PendingCoin",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiresAt",
                table: "PendingCoin",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "RefundedAt",
                table: "PendingCoin",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "PendingCoin",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "PendingCoin",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "OutboxMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    PayloadJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NotBeforeUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Attempts = table.Column<int>(type: "int", nullable: false),
                    ProcessedUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastError = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OutboxMessages", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserCurrencyLogs_IdempotencyKey",
                table: "UserCurrencyLogs",
                column: "IdempotencyKey",
                unique: true,
                filter: "[IdempotencyKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PendingCoin_Token",
                table: "PendingCoin",
                column: "Token",
                unique: true,
                filter: "[Token] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_OutboxMessages_ProcessedUtc_NotBeforeUtc",
                table: "OutboxMessages",
                columns: new[] { "ProcessedUtc", "NotBeforeUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OutboxMessages");

            migrationBuilder.DropIndex(
                name: "IX_UserCurrencyLogs_IdempotencyKey",
                table: "UserCurrencyLogs");

            migrationBuilder.DropIndex(
                name: "IX_PendingCoin_Token",
                table: "PendingCoin");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "UserCurrencyLogs");

            migrationBuilder.DropColumn(
                name: "ClaimedByLineUserId",
                table: "PendingCoin");

            migrationBuilder.DropColumn(
                name: "ClaimedRid",
                table: "PendingCoin");

            migrationBuilder.DropColumn(
                name: "ExpiresAt",
                table: "PendingCoin");

            migrationBuilder.DropColumn(
                name: "RefundedAt",
                table: "PendingCoin");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "PendingCoin");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "PendingCoin");

            migrationBuilder.AlterColumn<string>(
                name: "Token",
                table: "PendingCoin",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);
        }
    }
}
