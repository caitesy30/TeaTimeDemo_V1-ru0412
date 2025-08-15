// Services/ChannelUserLinkService.cs
using Microsoft.EntityFrameworkCore;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.Services
{
    public class ChannelUserLinkService
    {
        private readonly ApplicationDbContext _db;
        public ChannelUserLinkService(ApplicationDbContext db) => _db = db;

        public async Task BindAsync(string channelId, string lineUserId, string globalUserId)
        {
            if (string.IsNullOrWhiteSpace(channelId) || string.IsNullOrWhiteSpace(lineUserId) || string.IsNullOrWhiteSpace(globalUserId))
                return;

            var row = await _db.LineChannelAccounts
                .FirstOrDefaultAsync(x => x.ChannelId == channelId && x.LineUserId == lineUserId);

            if (row == null)
            {
                _db.LineChannelAccounts.Add(new LineChannelAccount
                {
                    ChannelId = channelId,
                    LineUserId = lineUserId,
                    GlobalUserId = globalUserId
                });
            }
            else if (row.GlobalUserId != globalUserId)
            {
                row.GlobalUserId = globalUserId; // 以最新登入者為準（通常為同一人）
            }
            await _db.SaveChangesAsync();
        }

        public async Task<string?> ResolveGlobalAsync(string channelId, string lineUserId)
        {
            return await _db.LineChannelAccounts
                .Where(x => x.ChannelId == channelId && x.LineUserId == lineUserId)
                .Select(x => x.GlobalUserId)
                .FirstOrDefaultAsync();
        }
    }
}
