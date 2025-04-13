using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Net.Http.Headers;
using TeaTimeDemo.DataAccess.Repository.IRepository;
using TeaTimeDemo.Models;
using Newtonsoft.Json;

namespace TeaTimeDemo.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class QueryController : Controller
    {
        private readonly IMemoryCache _cache;
        private readonly IUnitOfWork _unitOfWork;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public QueryController(
            IMemoryCache cache,
            IUnitOfWork unitOfWork,
            IHttpClientFactory httpClientFactory,
            IConfiguration config)
        {
            _cache = cache;
            _unitOfWork = unitOfWork;
            _httpClient = httpClientFactory.CreateClient();
            _config = config;
        }

        [HttpPost]
        public async Task<JsonResult> GetExplanation([FromBody] QueryRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.QueryText))
                {
                    return Json(new { success = false, error = "查詢文字不可為空白" });
                }

                var queryText = request.QueryText.Trim();
                var cacheKey = $"Explain_{queryText}";

                // 1. 檢查快取
                if (_cache.TryGetValue(cacheKey, out string explanation))
                {
                    return Json(new { success = true, query = queryText, explanation, source = "cache" });
                }

                // 2. 查詢資料庫
                var knowledge = await _unitOfWork.KnowledgeEntry.GetFirstOrDefaultAsync(
                    k => k.Keyword == queryText,
                    orderBy: q => q.OrderByDescending(k => k.UpdatedAt));

                if (knowledge != null)
                {
                    _cache.Set(cacheKey, knowledge.Definition, TimeSpan.FromHours(1));
                    return Json(new { success = true, query = queryText, explanation = knowledge.Definition, source = "database" });
                }

                // 3. 調用 Deepseek API
                var apiKey = _config["Deepseek:ApiKey"];
                var apiUrl = _config["Deepseek:ApiUrl"] + "/chat/completions";

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

                var response = await _httpClient.PostAsJsonAsync(apiUrl, new
                {
                    model = "deepseek-chat",
                    messages = new[] { new { role = "user", content = $"用繁體中文詳細解釋: {queryText}" } },
                    temperature = 0.7
                });

                if (!response.IsSuccessStatusCode)
                {
                    return Json(new { success = false, error = $"API 錯誤: {response.StatusCode}" });
                }

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonConvert.DeserializeObject<DeepseekResponse>(content);
                explanation = result.Choices.First().Message.Content;

                // 保存到資料庫
                var newEntry = new KnowledgeEntry
                {
                    Keyword = queryText,
                    Definition = explanation,
                    Source = "API",
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                await _unitOfWork.KnowledgeEntry.AddAsync(newEntry);
                await _unitOfWork.SaveAsync();

                // 設置快取
                _cache.Set(cacheKey, explanation, TimeSpan.FromHours(1));

                return Json(new { success = true, query = queryText, explanation, source = "api" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = $"系統錯誤: {ex.Message}" });
            }
        }

        private class DeepseekResponse
        {
            public List<Choice> Choices { get; set; }

            public class Choice
            {
                public Message Message { get; set; }
            }

            public class Message
            {
                public string Content { get; set; }
            }
        }
    }

    public class QueryRequest
    {
        public string QueryText { get; set; }
    }
}