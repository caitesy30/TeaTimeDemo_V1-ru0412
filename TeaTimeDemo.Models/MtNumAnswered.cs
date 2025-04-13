using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class MtNumAnswered
{
    [Key]
    public int Id { get; set; }

    [MaxLength(50)]
    [Required]
    public string MtNum { get; set; }          // 料號

    [Required]
    public int SurveyId { get; set; }          // 問卷id（參考 DocumentExport 的 id）

    [Required]
    public int Version { get; set; }           // 版本號

    [Column(TypeName = "NVARCHAR(MAX)")]
    [Required]
    public string AnsweredJson { get; set; }     // 答案 JSON 字串

    [Column(TypeName = "NVARCHAR(MAX)")]
    public string Images { get; set; }           // 圖片資料，可存放圖片路徑或Base64格式

    public DateTime LatestTime { get; set; }     // 建立時間

    [MaxLength(50)]
    public string CreatedById { get; set; }      // 工號

    [MaxLength(50)]
    public string CreatedByName { get; set; }    // 姓名

    public int Stage { get; set; }   //階段
}
