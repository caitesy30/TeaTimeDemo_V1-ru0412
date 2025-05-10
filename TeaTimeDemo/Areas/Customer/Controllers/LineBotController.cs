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
    public class LineBotController : ControllerBase
    {
        private readonly LineMessagingClient _lineClient;
        private readonly string _channelSecret;

        public LineBotController(IConfiguration config)
        {
            _channelSecret = config["LineBot:ChannelSecret"];
            var token = config["LineBot:ChannelAccessToken"];
            _lineClient = new LineMessagingClient(token);
        }

        // 1. Health-check 用 GET（可選）
        [HttpGet]
        public IActionResult Get()
        {
            // 回傳一句簡單文字，代表你的 Webhook endpoint 啟動正常
            return Ok("LINE Webhook is running 👍");
        }


        [HttpPost]
        public async Task<IActionResult> PostAsync()
        {
            // 1. 把 ASP.NET Core HttpRequest 轉成 HttpRequestMessage
            var httpReq = new HttpRequestMessage(new HttpMethod(Request.Method),
                $"{Request.Scheme}://{Request.Host}{Request.Path}{Request.QueryString}")
            {
                Content = new StreamContent(Request.Body)
            };
            // 複製所有標頭（包含 X-Line-Signature）
            foreach (var header in Request.Headers)
                httpReq.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());

            IEnumerable<WebhookEvent> events;
            try
            {
                // 2. 驗證簽章並解析所有事件
                events = await httpReq.GetWebhookEventsAsync(_channelSecret);
            }
            catch (InvalidSignatureException)
            {
                return BadRequest("Invalid signature");
            }

            // 3. 處理事件並回覆
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
