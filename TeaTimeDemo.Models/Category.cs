using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TeaTimeDemo;

namespace TeaTimeDemo.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(30)]
        [DisplayName("類別名稱")]
        //[Display(Name="Name", ResourceType = typeof(TeaTimeDemo.Resources.SharedResource))]
        public string Name { get; set; }
        [DisplayName("顯示順序")]
        [Range(1,100,ErrorMessage="輸入範圍應該要1-100之間")]
        public int DisplayOrder { get; set; }

        public bool IsPublished { get; set; }

        public string ImageUrl { get; set; } // 圖片的 URL


        // 反向導航屬性
        public virtual ICollection<Survey> Surveys { get; set; } = new List<Survey>();
        public virtual ICollection<SurveyToGroup> PageGroups { get; set; } = new List<SurveyToGroup>();
    }
}
