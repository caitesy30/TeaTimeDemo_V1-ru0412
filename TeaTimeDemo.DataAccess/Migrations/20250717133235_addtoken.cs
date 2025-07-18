using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeaTimeDemo.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class addtoken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NickName",
                table: "PendingCoin",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Token",
                table: "PendingCoin",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NickName",
                table: "PendingCoin");

            migrationBuilder.DropColumn(
                name: "Token",
                table: "PendingCoin");
        }
    }
}
