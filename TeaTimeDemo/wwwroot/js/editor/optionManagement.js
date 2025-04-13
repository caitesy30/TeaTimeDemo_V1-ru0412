/**
 * 檔名：optionManagement.js
 * 功能：管理選項的添加、刪除和重新索引
 * 創造日期：2024/11/29
 * 作者：忠訓
 */

// 新增選項的函數
function addOption(questionIndex) {
    if (!window.optionsIndices[questionIndex]) {
        window.optionsIndices[questionIndex] = 0;
    }
    var optionIndex = window.optionsIndices[questionIndex];
    var optionHtml = `
        <div class="mb-2 option-container" id="option-${questionIndex}-${optionIndex}">
            <input type="hidden" name="QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].QuestionOption.Id" value="0" />
            <label class="form-label">選項 ${optionIndex + 1}</label>
            <input name="QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].QuestionOption.OptionText" class="form-control" oninput="updateMceContent()" />
            <button type="button" class="btn btn-danger" onclick="removeOption(${questionIndex}, ${optionIndex}, 0)">刪除選項</button>
            <div class="mb-3">
                <label class="form-label">上傳選項圖片</label>
                <div id="option-image-upload-container-${questionIndex}-${optionIndex}">
                    <!-- 初始不顯示圖片上傳欄位 -->
                </div>
                <button type="button" class="btn btn-primary" onclick="addOptionImageUploadField(${questionIndex}, ${optionIndex})">新增圖片+</button>
                <span class="text-danger"></span>
            </div>
            <!-- 選項圖片預覽區域 -->
            <div class="mb-3 option-image-preview" id="option-image-preview-${questionIndex}-${optionIndex}">
                <!-- 新增的選項圖片會在這裡預覽 -->
            </div>

            <!-- 填空相關功能 -->
            <div class="mb-3">
                <label class="form-label">填空</label>
                <div id="fill-in-blanks-${questionIndex}-${optionIndex}">
                    <!-- 填空項目會在這裡新增 -->
                </div>
                <button type="button" class="btn btn-secondary" onclick="addFillInBlank(${questionIndex}, ${optionIndex})">新增填空+</button>
            </div>
            
        </div>`;
    $(`#options-${questionIndex}`).append(optionHtml);
    window.optionsIndices[questionIndex]++;
    updateMceContent();
}

// 刪除選項的函數
function removeOption(questionIndex, optionIndex, optionId) {
    if (optionId) {
        $.ajax({
            url: '/admin/survey/removeoption',
            type: 'POST',
            data: { id: optionId },
            success: function (response) {
                if (response.success) {
                    $(`#option-${questionIndex}-${optionIndex}`).remove();
                    toastr.success(response.message);
                    reindexOptions(questionIndex);
                    updateMceContent();
                } else {
                    toastr.error(response.message);
                }
            },
            error: function () {
                toastr.error('刪除選項時發生錯誤');
            }
        });
    } else {
        $(`#option-${questionIndex}-${optionIndex}`).remove();
        reindexOptions(questionIndex);
        updateMceContent();
    }
}

// 重新整理選項索引的函數
function reindexOptions(questionIndex) {
    var optionContainers = $(`#options-${questionIndex} .option-container`);
    optionContainers.each(function (index) {
        $(this).attr('id', `option-${questionIndex}-${index}`);
        $(this).find('.form-label').text(`選項 ${index + 1}`);
        $(this).find('input, select, textarea').each(function () {
            var name = $(this).attr('name');
            if (name) {
                name = name.replace(/QuestionOptionVMs\[\d+\]/, `QuestionOptionVMs[${index}]`);
                $(this).attr('name', name);
            }
        });
        var optionId = $(this).find('input[type="hidden"]').val();
        $(this).find('.btn-danger').attr('onclick', `removeOption(${questionIndex}, ${index}, ${optionId})`);
        reindexFillInBlanks(questionIndex, index);
    });
    window.optionsIndices[questionIndex] = optionContainers.length;
}

// 將選項管理函數暴露給全局作用域
window.addOption = addOption;
window.removeOption = removeOption;
window.reindexOptions = reindexOptions;
