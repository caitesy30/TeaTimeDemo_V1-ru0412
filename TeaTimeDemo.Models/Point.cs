// Models/Point.cs
using System.ComponentModel.DataAnnotations;

namespace TeaTimeDemo.Models
{
    /// <summary>
    /// 點數類型表，如「公益鵝」、「善時點數」等等
    /// </summary>
    public class Point
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string PointName { get; set; }

        public string Description { get; set; }
    }
}
