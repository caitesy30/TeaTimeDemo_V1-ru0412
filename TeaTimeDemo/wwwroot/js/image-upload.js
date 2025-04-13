// wwwroot/js/image-upload.js

// 新增問卷圖片上傳欄位的函數
function addSurveyImageUploadField() {
    var uploadContainer = $('#survey-image-upload-container');
    var html = `
        <div class="mb-2">
            <input type="file" name="SurveyImageFiles" class="form-control" onchange="uploadSurveyImage(this)" />
        </div>`;
    uploadContainer.append(html);
}

// 上傳問卷圖片並顯示
function uploadSurveyImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            // 在即時預覽區域顯示上傳的圖片
            var imagePreviewHtml = `
                <div class="mb-3 survey-image-item">
                    <img src="${e.target.result}" alt="Survey Image" style="max-width: 200px;" />
                    <button type="button" class="btn btn-danger btn-sm" onclick="removeImage()">刪除</button>
                </div>`;
            $('#survey-images-display').append(imagePreviewHtml);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// 新增問題圖片上傳欄位的函數
function addQuestionImageUploadField(questionId) {
    var html = `
        <div class="mb-2">
            <input type="file" name="QuestionImageFiles" class="form-control" onchange="uploadQuestionImage(this, ${questionId})" />
        </div>`;
    $(`#question-image-upload-container-${questionId}`).append(html);
}

// 上傳問題圖片並顯示
function uploadQuestionImage(input, questionId) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var imagePreviewHtml = `
                <div class="mb-3 question-image-item">
                    <img src="${e.target.result}" alt="Question Image" style="max-width: 200px;" />
                    <button type="button" class="btn btn-danger btn-sm" onclick="removeImage()">刪除</button>
                </div>`;
            $(`#question-image-upload-container-${questionId}`).parent().find('.question-images-display').append(imagePreviewHtml);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// 新增選項圖片上傳欄位的函數
function addOptionImageUploadField(optionId) {
    var html = `
        <div class="mb-2">
            <input type="file" name="OptionImageFiles" class="form-control" onchange="uploadOptionImage(this, ${optionId})" />
        </div>`;
    $(`#option-image-upload-container-${optionId}`).append(html);
}

// 上傳選項圖片並顯示
function uploadOptionImage(input, optionId) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var imagePreviewHtml = `
                <div class="mb-3 option-image-item">
                    <img src="${e.target.result}" alt="Option Image" style="max-width: 150px;" />
                    <button type="button" class="btn btn-danger btn-sm" onclick="removeImage()">刪除</button>
                </div>`;
            $(`#option-image-upload-container-${optionId}`).parent().find('.option-images-display').append(imagePreviewHtml);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// 移除圖片函數
function removeImage(imageId) {
    $.ajax({
        url: '/admin/survey/removeimage',
        type: 'POST',
        data: { id: imageId },
        success: function (response) {
            if (response.success) {
                toastr.success(response.message);
                $(`[data-id="${imageId}"]`).remove();
            } else {
                toastr.error(response.message);
            }
        },
        error: function (xhr, status, error) {
            toastr.error('刪除圖片時發生錯誤');
        }
    });
}
