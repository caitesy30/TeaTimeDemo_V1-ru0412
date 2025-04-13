// ImageService.cs
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;

namespace TeaTimeDemo.Utility
{
    /// <summary>
    /// 圖片服務實作，負責處理圖片的儲存與刪除
    /// </summary>
    public class ImageService : IImageService
    {
        private readonly IWebHostEnvironment _hostEnvironment;

        /// <summary>
        /// 建構子，注入 IWebHostEnvironment 以取得網站根目錄路徑
        /// </summary>
        /// <param name="hostEnvironment">網站宿主環境</param>
        public ImageService(IWebHostEnvironment hostEnvironment)
        {
            _hostEnvironment = hostEnvironment;
        }

        /// <summary>
        /// 儲存圖片並返回圖片的相對路徑
        /// </summary>
        /// <param name="image">上傳的圖片文件</param>
        /// <param name="category">圖片類別（如 survey, question, option）</param>
        /// <returns>圖片的相對路徑</returns>
        public string SaveImage(IFormFile image, string category)
        {
            if (image != null && image.Length > 0)
            {
                // 設定圖片儲存的資料夾路徑
                var imageFolder = Path.Combine(_hostEnvironment.WebRootPath, "images", category);
                // 生成唯一的圖片名稱
                var imageName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
                var imagePath = Path.Combine(imageFolder, imageName);

                // 確保目錄存在，不存在則創建
                if (!Directory.Exists(imageFolder))
                {
                    Directory.CreateDirectory(imageFolder);
                }

                // 將圖片寫入到伺服器上
                using (var fileStream = new FileStream(imagePath, FileMode.Create))
                {
                    image.CopyTo(fileStream);
                }

                // 返回圖片的相對路徑
                return "/images/" + category + "/" + imageName;
            }
            return null;
        }

        /// <summary>
        /// 刪除指定路徑的圖片
        /// </summary>
        /// <param name="imageUrl">圖片的相對路徑</param>
        /// <returns>刪除是否成功</returns>
        public bool DeleteImage(string imageUrl)
        {
            var imagePath = Path.Combine(_hostEnvironment.WebRootPath, imageUrl.TrimStart('/'));
            if (System.IO.File.Exists(imagePath))
            {
                System.IO.File.Delete(imagePath);
                return true;
            }
            return false;
        }
    }
}
