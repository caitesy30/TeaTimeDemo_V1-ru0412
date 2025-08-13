using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace TeaTimeDemo.Services
{
    public class PendingRefundWorker : BackgroundService
    {
        private readonly IServiceProvider _sp;
        public PendingRefundWorker(IServiceProvider sp) => _sp = sp;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var timer = new PeriodicTimer(TimeSpan.FromMinutes(1)); // 每 1 分鐘掃一次
            while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
            {
                try
                {
                    using var scope = _sp.CreateScope();
                    var svc = scope.ServiceProvider.GetRequiredService<WalletCreditService>();
                    var n = await svc.RefundExpiredPendingsOnceAsync();
                    if (n > 0) Console.WriteLine($"[RefundWorker] Refunded {n} expired pendings.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[RefundWorker] Error: {ex.Message}");
                }
            }
        }
    }
}
