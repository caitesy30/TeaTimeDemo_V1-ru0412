// Models/UserPointBalance.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TeaTimeDemo.Models
{
    /// <summary>
    /// 使用者對應各類點數的餘額
    /// </summary>
    public class UserPointBalance
    {
        [Key]
        public int Id { get; set; }

        // 關聯到 AspNetUsers (ApplicationUser)
        [Required]
        public string ApplicationUserId { get; set; }

        [ForeignKey(nameof(ApplicationUserId))]
        public virtual ApplicationUser ApplicationUser { get; set; }

        // 關聯到 Point
        [Required]
        public int PointId { get; set; }

        [ForeignKey(nameof(PointId))]
        public virtual Point Point { get; set; }

        /// <summary>
        /// 餘額
        /// </summary>
        public int Balance { get; set; }
    }
}
