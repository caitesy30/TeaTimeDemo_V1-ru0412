using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.Models.DBEntity;

namespace TeaTimeDemo.Services
{
    /// <summary>
    /// 專責管理 WRI（WalletRedemptionIntent）的生命週期：建立、查詢、核銷
    /// </summary>
    public class RedemptionIntentService
    {
        private readonly ApplicationDbContext _db;

        public RedemptionIntentService(ApplicationDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// 建立意圖，回 rid
        /// </summary>
        public async Task<Guid> CreateAsync(string mode, string token, string? sourceLiffId, string? sourceChannelId)
        {
            var entity = new WalletRedemptionIntent
            {
                Mode = mode ?? string.Empty,
                Token = token ?? string.Empty,
                SourceLiffId = sourceLiffId,
                SourceChannelId = sourceChannelId
            };
            _db.WalletRedemptionIntents.Add(entity);
            await _db.SaveChangesAsync();
            return entity.Id;
        }


        /// <summary>
        /// 以 rid 取得有效意圖（未核銷、未過期）
        /// </summary>
        public async Task<WalletRedemptionIntent?> GetValidAsync(Guid rid)
        {
            var now = DateTime.UtcNow;
            return await _db.WalletRedemptionIntents
                .FirstOrDefaultAsync(x => x.Id == rid && x.Status == 0 && x.ExpiresUtc > now);
        }

        /// <summary>
        /// 核銷（單次），同時綁定 LINE UserId，避免重放；回傳原始意圖
        /// </summary>
        public async Task<WalletRedemptionIntent?> ConsumeAsync(Guid rid, string lineUserId)
        {
            var intent = await GetValidAsync(rid);
            if (intent == null) return null;

            intent.Status = 1;
            intent.ConsumedUtc = DateTime.UtcNow;
            intent.LineUserId = lineUserId;
            await _db.SaveChangesAsync();
            return intent;
        }
    }
}
