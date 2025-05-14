using System.IO;                   // 新增：StreamContent 需要
using System.Linq;                 // 新增：ToArray() 擴充方法
using System.Collections.Generic;  // IEnumerable<T>
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Line.Messaging;
using Line.Messaging.Webhooks;

namespace TeaTimeDemo.Controllers
{
    [ApiController]
    [Route("api/line/webhook")]
    [Consumes("application/json")]  // 明示只接受 JSON
    public class LineBotController : ControllerBase
    {
        private readonly LineMessagingClient _lineClient;
        private readonly string _channelSecret;

        // 改為透過 DI 注入 LineMessagingClient
        public LineBotController(LineMessagingClient lineClient, IConfiguration config)
        {
            _channelSecret = config["LineBot:ChannelSecret"];
            _lineClient = lineClient;  // 直接使用 DI 提供的 singleton
        }

        // 1. Health-check 用 GET（可選）
        [HttpGet]
        public IActionResult Get()
        {
            return Ok("LINE Webhook is running 👍");
        }

        // 2. Webhook 事件接收
        [HttpPost]
        public async Task<IActionResult> PostAsync()
        {
            // 2.1 將 ASP.NET Request 轉成 HttpRequestMessage（保留簽章標頭）
            var httpReq = new HttpRequestMessage(
                new HttpMethod(Request.Method),
                $"{Request.Scheme}://{Request.Host}{Request.Path}{Request.QueryString}"
            )
            {
                Content = new StreamContent(Request.Body)
            };
            foreach (var header in Request.Headers)
                httpReq.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());

            // 2.2 驗證 X-Line-Signature 並取出事件
            IEnumerable<WebhookEvent> events;
            try
            {
                events = await httpReq.GetWebhookEventsAsync(_channelSecret);
            }
            catch (InvalidSignatureException)
            {
                return BadRequest("Invalid signature");
            }

            // 2.3 處理事件
            foreach (var ev in events)
            {
                if (ev is MessageEvent msg && msg.Message is TextEventMessage txt)
                {
                    var replyText = txt.Text.ToLower() == "ping"
                        ? "pong 🎉"
                        : $"您說：{txt.Text}";
                    await _lineClient.ReplyMessageAsync(msg.ReplyToken, replyText);
                }
            }

            return Ok();
        }
    }
}
