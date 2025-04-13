// Mapping/AutoMapperProfile.cs

using AutoMapper;
using System.IO;
using TeaTimeDemo.DTOs;
using TeaTimeDemo.Models;
using TeaTimeDemo.Models.DTOs;
using TeaTimeDemo.Models.ViewModels;

namespace TeaTimeDemo.Mapping
{
    /// <summary>
    /// AutoMapper 配置檔，定義各模型之間的映射關係
    /// </summary>
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // ===========================================
            // 1. 問卷相關的映射配置
            // ===========================================

            // 1.1 Survey 到 SurveyDTO 的映射
            CreateMap<Survey, SurveyDTO>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
                .ForMember(dest => dest.IsPublished, opt => opt.MapFrom(src => src.IsPublished ? "是" : "否"))
                .ForMember(dest => dest.CreateTime, opt => opt.MapFrom(src => src.CreateTime.HasValue ? src.CreateTime.Value.ToString("yyyy/MM/dd HH:mm:ss") : string.Empty))
                .ForMember(dest => dest.CompleteTime, opt => opt.MapFrom(src => src.CompleteTime.HasValue ? src.CompleteTime.Value.ToString("yyyy/MM/dd HH:mm:ss") : "未完成"));

            // 1.2 Question 到 QuestionDTO 的映射
            CreateMap<Question, QuestionDTO>()
                .ForMember(dest => dest.SurveyTitle, opt => opt.MapFrom(src => src.Survey.Title))
                .ForMember(dest => dest.SortOrder, opt => opt.MapFrom(src => src.SortOrder));

            // 1.3 QuestionDTO 到 Question 的映射
            CreateMap<QuestionDTO, Question>()
                .ForMember(dest => dest.QuestionOptions, opt => opt.Ignore())
                .ForMember(dest => dest.QuestionImages, opt => opt.Ignore())
                .ForMember(dest => dest.SortOrder, opt => opt.MapFrom(src => src.SortOrder));

            // ===========================================
            // 2. 問題選項相關的映射配置
            // ===========================================

            // 2.1 QuestionOption 到 QuestionOptionDTO 的映射
            CreateMap<QuestionOption, QuestionOptionDTO>()
                .ForMember(dest => dest.QuestionText, opt => opt.MapFrom(src => src.Question != null ? src.Question.QuestionText : string.Empty))
                .ForMember(dest => dest.SurveyId, opt => opt.MapFrom(src => src.Question != null ? src.Question.SurveyId : 0))
                .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => src.IsDeleted))
                .ForMember(dest => dest.DeletedAt, opt => opt.MapFrom(src => src.DeletedAt))
                .ForMember(dest => dest.AnswerOptions, opt => opt.MapFrom(src => src.AnswerOptions))
                .ForMember(dest => dest.QuestionImages, opt => opt.MapFrom(src => src.QuestionImages))
                .ForMember(dest => dest.FillInBlanks, opt => opt.MapFrom(src => src.FillInBlanks));

            // 2.2 QuestionOptionDTO 到 QuestionOption 的映射
            CreateMap<QuestionOptionDTO, QuestionOption>()
                .ForMember(dest => dest.Question, opt => opt.Ignore())
                .ForMember(dest => dest.AnswerOptions, opt => opt.Ignore())
                .ForMember(dest => dest.QuestionImages, opt => opt.Ignore())
                .ForMember(dest => dest.FillInBlanks, opt => opt.Ignore());

            // 2.3 AnswerOption 到 AnswerOptionDTO 的映射
            CreateMap<AnswerOption, AnswerOptionDTO>()
                .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => src.IsDeleted))
                .ForMember(dest => dest.DeletedAt, opt => opt.MapFrom(src => src.DeletedAt));

            // 2.4 AnswerOptionDTO 到 AnswerOption 的映射
            CreateMap<AnswerOptionDTO, AnswerOption>()
                .ForMember(dest => dest.QuestionOption, opt => opt.Ignore());

            // 2.5 FillInBlank 到 FillInBlankDTO 的映射
            CreateMap<FillInBlank, FillInBlankDTO>()
                .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => src.IsDeleted))
                .ForMember(dest => dest.DeletedAt, opt => opt.MapFrom(src => src.DeletedAt));

            // 2.6 FillInBlankDTO 到 FillInBlank 的映射
            CreateMap<FillInBlankDTO, FillInBlank>()
                .ForMember(dest => dest.QuestionOption, opt => opt.Ignore());

            // 2.7 QuestionImage 到 QuestionImageDTO 的映射
            CreateMap<QuestionImage, QuestionImageDTO>()
                .ForMember(dest => dest.ImageExtension, opt => opt.MapFrom(src => Path.GetExtension(src.ImageUrl).ToLower()))
                .ForMember(dest => dest.ImageBase64Parts, opt => opt.Ignore()) // 忽略 ImageBase64Parts
                .ForMember(dest => dest.Width, opt => opt.MapFrom(src => src.Width))
                .ForMember(dest => dest.Height, opt => opt.MapFrom(src => src.Height));

            // ===========================================
            // 3. ViewModel 相關的映射配置
            // ===========================================

            // 3.1 Question 到 QuestionVM 的映射
            CreateMap<Question, QuestionVM>()
                .ForMember(dest => dest.SurveyTitle, opt => opt.MapFrom(src => src.Survey.Title))
                .ForMember(dest => dest.SortOrder, opt => opt.MapFrom(src => src.SortOrder))
                .ForMember(dest => dest.SurveyList, opt => opt.Ignore())
                .ForMember(dest => dest.QuestionImageFiles, opt => opt.Ignore())
                .ForMember(dest => dest.ExistingQuestionImageIds, opt => opt.Ignore())
                .ForMember(dest => dest.ExistingQuestionImageWidths, opt => opt.Ignore())
                .ForMember(dest => dest.ExistingQuestionImageHeights, opt => opt.Ignore())
                .ForMember(dest => dest.QuestionOptionVMs, opt => opt.MapFrom(src => src.QuestionOptions))
                .ForMember(dest => dest.AnswerTypeList, opt => opt.Ignore()); // 由控制器填充

            // 3.2 QuestionVM 到 Question 的映射
            CreateMap<QuestionVM, Question>()
                .ForMember(dest => dest.QuestionOptions, opt => opt.Ignore())
                .ForMember(dest => dest.QuestionImages, opt => opt.Ignore())
                .ForMember(dest => dest.SortOrder, opt => opt.MapFrom(src => src.SortOrder))
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore()) // 由軟刪除功能處理
                .ForMember(dest => dest.DeletedAt, opt => opt.Ignore()); // 由軟刪除功能處理

            // 3.3 QuestionOption 到 QuestionOptionVM 的映射（扁平化結構，避免循環引用）
            CreateMap<QuestionOption, QuestionOptionVM>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.OptionText, opt => opt.MapFrom(src => src.OptionText))
                .ForMember(dest => dest.IsCorrect, opt => opt.MapFrom(src => src.IsCorrect))
                .ForMember(dest => dest.IsOther, opt => opt.MapFrom(src => src.IsOther))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.SortOrder, opt => opt.MapFrom(src => src.SortOrder))
                .ForMember(dest => dest.QuestionId, opt => opt.MapFrom(src => src.QuestionId))
                .ForMember(dest => dest.QuestionText, opt => opt.MapFrom(src => src.Question != null ? src.Question.QuestionText : string.Empty))
                .ForMember(dest => dest.SurveyId, opt => opt.MapFrom(src => src.Question != null ? src.Question.SurveyId : 0))
                .ForMember(dest => dest.CreateTime, opt => opt.MapFrom(src => src.CreateTime))
                .ForMember(dest => dest.CompleteTime, opt => opt.MapFrom(src => src.CompleteTime))
                .ForMember(dest => dest.Remark, opt => opt.MapFrom(src => src.Remark))
                .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => src.IsDeleted))
                .ForMember(dest => dest.DeletedAt, opt => opt.MapFrom(src => src.DeletedAt))
                .ForMember(dest => dest.QuestionOptionImages, opt => opt.MapFrom(src => src.QuestionImages))
                .ForMember(dest => dest.QuestionList, opt => opt.Ignore()) // 問題清單在控制器中設定
                .ForMember(dest => dest.QuestionOptionList, opt => opt.Ignore()) // 問題選項清單在控制器中設定
                .ForMember(dest => dest.OptionImageFiles, opt => opt.Ignore()) // 圖片文件在控制器中處理
                .ForMember(dest => dest.ExistingOptionImageIds, opt => opt.Ignore()) // 現有圖片 ID 在控制器中處理
                .ForMember(dest => dest.ExistingOptionImageWidths, opt => opt.Ignore()) // 現有圖片寬度在控制器中處理
                .ForMember(dest => dest.ExistingOptionImageHeights, opt => opt.Ignore()) // 現有圖片高度在控制器中處理
                .ForMember(dest => dest.NewOptionImageWidths, opt => opt.Ignore()) // 新上傳圖片寬度在控制器中處理
                .ForMember(dest => dest.NewOptionImageHeights, opt => opt.Ignore()); // 新上傳圖片高度在控制器中處理

            // 3.4 QuestionOptionVM 到 QuestionOption 的映射
            CreateMap<QuestionOptionVM, QuestionOption>()
                .ForMember(dest => dest.QuestionImages, opt => opt.Ignore()) // 圖片在控制器中處理
                .ForMember(dest => dest.FillInBlanks, opt => opt.Ignore())
                .ForMember(dest => dest.Question, opt => opt.Ignore()) // 問題在控制器中處理
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.OptionText, opt => opt.MapFrom(src => src.OptionText))
                .ForMember(dest => dest.IsCorrect, opt => opt.MapFrom(src => src.IsCorrect))
                .ForMember(dest => dest.IsOther, opt => opt.MapFrom(src => src.IsOther))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.SortOrder, opt => opt.MapFrom(src => src.SortOrder))
                .ForMember(dest => dest.QuestionId, opt => opt.MapFrom(src => src.QuestionId))
                .ForMember(dest => dest.CreateTime, opt => opt.MapFrom(src => src.CreateTime))
                .ForMember(dest => dest.CompleteTime, opt => opt.MapFrom(src => src.CompleteTime))
                .ForMember(dest => dest.Remark, opt => opt.MapFrom(src => src.Remark))
                .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => src.IsDeleted))
                .ForMember(dest => dest.DeletedAt, opt => opt.MapFrom(src => src.DeletedAt));

            // ===========================================
            // 4. 其他映射配置（如有需要）
            // ===========================================

            // FillInBlank 到 FillInBlankVM 的映射
            CreateMap<FillInBlank, FillInBlankVM>();

            // FillInBlankVM 到 FillInBlank 的映射
            CreateMap<FillInBlankVM, FillInBlank>();

            // 如果您有其他需要的映射，可以在此處添加
            // 例如，Category 到 CategoryDTO 等
        }
    }
}
