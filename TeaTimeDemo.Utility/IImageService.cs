using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace TeaTimeDemo.Utility
{
    /// <summary>
    /// 圖片服務介面，定義圖片的儲存與刪除方法
    /// </summary>
    public interface IImageService
    {
        /// <summary>
        /// 儲存圖片並返回圖片的相對路徑
        /// </summary>
        /// <param name="image">上傳的圖片文件</param>
        /// <param name="category">圖片類別（如 survey, question, option）</param>
        /// <returns>圖片的相對路徑</returns>
        string SaveImage(IFormFile image, string category);

        /// <summary>
        /// 刪除指定路徑的圖片
        /// </summary>
        /// <param name="imageUrl">圖片的相對路徑</param>
        /// <returns>刪除是否成功</returns>
        bool DeleteImage(string imageUrl);
    }
}
