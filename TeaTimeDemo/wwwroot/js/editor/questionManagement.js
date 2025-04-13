/**
 * 檔名：questionManagement.js
 * 功能：管理問題的添加、刪除和重新索引
 * 創造日期：2024/11/29
 * 作者：忠訓
 */

// 新增問題的函數
function addQuestion() {
    var questionHtml = `
        <div class="border p-2 my-3 question-container" id="question-${window.questionIndex}">
            <h4>問題 ${window.questionIndex + 1}</h4>
            <input type="hidden" name="QuestionVMs[${window.questionIndex}].Question.Id" value="0" />
            <div class="mb-3">
                <label class="form-label">問題描述</label>
                <input name="QuestionVMs[${window.questionIndex}].Question.QuestionText" class="form-control" oninput="updateMceContent()" />
            </div>
            <div class="mb-3">
                <label class="form-label">問題類型</label>
                <select name="QuestionVMs[${window.questionIndex}].Question.AnswerType" class="form-select" onchange="updateMceContent()">
                    ${generateQuestionTypeOptions()}
                </select>
            </div>

            <!-- 現有問題圖片標籤 -->
            <div class="mb-3">
                <label class="form-label">現有問題圖片</label>
            </div>

            <!-- 問題圖片預覽區域 -->
            <div class="mb-3 question-image-preview" id="question-image-preview-${window.questionIndex}">
                <!-- 新增的問題圖片會在這裡預覽 -->
            </div>
            <div class="mb-3">
                <label class="form-label">上傳問題圖片</label>
                <div id="question-image-upload-container-${window.questionIndex}">
                    <!-- 初始不顯示圖片上傳欄位 -->
                </div>
                <button type="button" class="btn btn-primary" onclick="addQuestionImageUploadField(${window.questionIndex})">新增圖片+</button>
                <span class="text-danger"></span>
            </div>

            <!-- 現有選項圖片標籤 -->
            <div class="mb-3">
                <label class="form-label">現有選項圖片</label>
            </div>

            <!-- 選項顯示區域 -->
            <div id="options-${window.questionIndex}">
                <!-- 預設沒有選項，使用者可以點擊按鈕新增 -->
            </div>
            <button type="button" class="btn btn-primary" onclick="addOption(${window.questionIndex})">新增選項</button>
            <button type="button" class="btn btn-danger mt-2" onclick="removeQuestion(${window.questionIndex}, 0)">刪除問題</button>
        </div>`;
    $('#questions').append(questionHtml);
    window.questionIndex++;

    // 初始化選項索引
    window.optionsIndices[window.questionIndex - 1] = 0;

    // 更新 TinyMCE 編輯器的內容
    updateMceContent();
}

// 生成問題類型的選項 HTML
function generateQuestionTypeOptions() {
    var questionTypeList = window.initialData.questionTypeList;
    var options = '';
    questionTypeList.forEach(function (type) {
        options += `<option value="${type.Value}">${type.Text}</option>`;
    });
    return options;
}

// 刪除問題的函數
function removeQuestion(index, questionId) {
    if (questionId) {
        $.ajax({
            url: '/admin/survey/removequestion',
            type: 'POST',
            data: { id: questionId },
            success: function (response) {
                if (response.success) {
                    $('#question-' + index).remove();
                    toastr.success(response.message);
                    reindexQuestions();
                    updateMceContent();
                } else {
                    toastr.error(response.message);
                }
            },
            error: function () {
                toastr.error('刪除問題時發生錯誤');
            }
        });
    } else {
        $('#question-' + index).remove();
        reindexQuestions();
        updateMceContent();
    }
}

// 重新整理問題索引的函數
function reindexQuestions() {
    $('#questions .question-container').each(function (index) {
        $(this).attr('id', `question-${index}`);
        $(this).find('h4').text(`問題 ${index + 1}`);
        $(this).find('input, select, textarea').each(function () {
            var name = $(this).attr('name');
            if (name) {
                name = name.replace(/QuestionVMs\[\d+\]/, `QuestionVMs[${index}]`);
                $(this).attr('name', name);
            }
        });
        var questionId = $(this).find('input[type="hidden"]').val();
        $(this).find('.btn-danger').attr('onclick', `removeQuestion(${index}, ${questionId})`);
        reindexOptions(index);
    });
    window.questionIndex = $('#questions .question-container').length;
}

// 將問題管理函數暴露給全局作用域
window.addQuestion = addQuestion;
window.removeQuestion = removeQuestion;
window.reindexQuestions = reindexQuestions;
