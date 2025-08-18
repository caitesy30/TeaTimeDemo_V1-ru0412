using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace TeaTimeDemo.Utility
{
    /// <summary>
    /// 將物件以 JSON 存到 Session，讀取時自動還原成型別
    /// </summary>
    public static class SessionExtensions
    {
        private static readonly JsonSerializerOptions _opts = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        public static void SetObject<T>(this ISession session, string key, T value)
        {
            var json = JsonSerializer.Serialize(value, _opts);
            session.SetString(key, json);
        }

        public static T? GetObject<T>(this ISession session, string key)
        {
            var json = session.GetString(key);
            if (string.IsNullOrEmpty(json)) return default;
            return JsonSerializer.Deserialize<T>(json, _opts);
        }
    }
}
