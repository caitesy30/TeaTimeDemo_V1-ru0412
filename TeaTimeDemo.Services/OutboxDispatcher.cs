using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TeaTimeDemo.DataAccess.Data;
using TeaTimeDemo.Models;

namespace TeaTimeDemo.Services
{
    public class OutboxDispatcher : BackgroundService
    {
        private readonly IServiceProvider _sp;
        public OutboxDispatcher(IServiceProvider sp) => _sp = sp;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var timer = new PeriodicTimer(TimeSpan.FromSeconds(10));
            while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
            {
                try
                {
                    using var scope = _sp.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                    var now = DateTime.UtcNow;
                    var batch = await db.OutboxMessages
                        .Where(x => x.ProcessedUtc == null && (x.NotBeforeUtc == null || x.NotBeforeUtc <= now))
                        .OrderBy(x => x.CreatedUtc)
                        .Take(20)
                        .ToListAsync(stoppingToken);

                    foreach (var msg in batch)
                    {
                        try
                        {
                            // TODO: 依 Type 分派（你可注入 LineMessagingClient 實作推播）
                            // 這裡先用 Console 代替
                            Console.WriteLine($"[Outbox] {msg.Type} {msg.PayloadJson}");

                            msg.ProcessedUtc = DateTime.UtcNow;
                            msg.LastError = null;
                        }
                        catch (Exception ex)
                        {
                            msg.Attempts += 1;
                            msg.LastError = ex.Message;
                            // 指數退避（最多 10 次）
                            var backoff = TimeSpan.FromSeconds(Math.Min(300, Math.Pow(2, msg.Attempts)));
                            msg.NotBeforeUtc = DateTime.UtcNow + backoff;
                        }
                    }
                    await db.SaveChangesAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Outbox] LoopError: {ex.Message}");
                }
            }
        }
    }
}
