// ===================== main.js =====================
// 此檔案負責初始化、事件處理、管理問題、選項、填空、圖片上傳、預覽和尺寸調整，並更新編輯器內容。

/* ===================== 1. 初始化相關的函數和全局變量 ===================== */

// 當文檔加載完成後執行初始化函數
$(document).ready(function () {
    initializeQuestionIndices(); // 初始化問題索引
    initializeFillInBlankIndices(); // 初始化填空索引
    initializeTinyMCE(); // 初始化 TinyMCE 編輯器
    updateMceContent(); // 更新編輯器內容
}

// 初始化問題和選項的索引
function initializeQuestionIndices() {
        window.questionIndex = window.initialData.questionCount || 0;
        window.optionsIndices = window.initialData.optionsIndices || {};
    }

// 初始化填空索引
function initializeFillInBlankIndices() {
        window.fillInBlankIndices = {};

        for (var i = 0; i < window.questionIndex; i++) {
            // 初始化問題級別的填空索引
            var questionFillInBlanks = $('#question-fill-in-blanks-' + i + ' .fill-in-blank').length;
            window.fillInBlankIndices[i] = {
                question: questionFillInBlanks,
                options: {}
            };

            // 初始化選項級別的填空索引
            var optionContainers = $('#options-' + i + ' .option-container');
            optionContainers.each(function () {
                var j = $(this).attr('id').split('-')[2];
                var fillInBlankCount = $(this).find('.fill-in-blank').length;
                window.fillInBlankIndices[i].options[j] = fillInBlankCount;

                // 在此處可以調用更新選項文本的函數，確保選項描述正確顯示填空占位符
                // updateOptionTextWithBlanks();
            });
            // 在這裡調用更新問題文本的函數
            // updateQuestionTextWithBlanks();
        }
    }

/* ===================== 2. 處理事件綁定和通用實用函數 ===================== */

// 初始化 TinyMCE 編輯器
function initializeTinyMCE() {
        tinymce.init({
            selector: '#editor',
            api_key: 'bd4kr41e6ze0pbf2aykxdz4hsbpnedbrhpjj227b6za85wou', // 替換為您的 API 金鑰
            plugins: 'advlist autolink lists link image charmap preview anchor code table',
            toolbar: 'undo redo | formatselect | bold italic backcolor | code | table | image | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
            height: '100%', // 設置編輯器高度為 100%
            image_dimensions: true, // 啟用圖片尺寸調整
            image_advtab: true, // 啟用進階圖片選項
            extended_valid_elements: 'img[src|alt|data-image-id|width|height|style|class]', // 允許 img 標籤包含 data-image-id 屬性
            valid_styles: {
                'img': 'width,height'
            },
            setup: function (editor) {
                // 當編輯器初始化時設定內容
                editor.on('init', function () {
                    var initialContent = $('#MceHtml').val();
                    editor.setContent(initialContent);

                    // 如果初始內容為空，從表單欄位生成內容並設置到編輯器
                    if (initialContent.trim() === "") {
                        updateMceContent();
                    } else {
                        // 更新編輯器中的圖片，添加 data-image-id 屬性
                        updateEditorImages();
                    }
                });

                // 當內容改變時，同步更新隱藏的 MceHtml 欄位
                editor.on('change keyup', function () {
                    tinymce.triggerSave();
                    $('#MceHtml').val(editor.getContent());
                });

                // 當圖片被調整大小時，更新左側表單的寬度和高度
                editor.on('ObjectResized', function (e) {
                    var img = e.target;
                    if (img.tagName.toLowerCase() === 'img') {
                        var imageId = img.getAttribute('data-image-id');
                        var width = e.width;   // 取得調整後的寬度（數字）
                        var height = e.height; // 取得調整後的高度（數字）

                        // 更新左邊表單的輸入欄位
                        updateImageDimensionsInForm(imageId, width, height);
                    }
                });
            },
            content_style: "body { font-size:14px; }", // 根據需要調整編輯器內的字體大小
            image_class_list: [
                { title: 'None', value: '' },
                { title: 'Responsive', value: 'img-responsive' }
            ],
            image_title: true,
            automatic_uploads: true,

            // 自訂圖片上傳處理器，返回 Promise
            images_upload_handler: function (blobInfo) {
                return new Promise(function (resolve, reject) {
                    // 建立 FormData 物件
                    var formData = new FormData();
                    formData.append('image', blobInfo.blob(), blobInfo.filename());

                    // 發送 AJAX 請求至圖片上傳的 API
                    $.ajax({
                        url: '/admin/survey/uploadimage',
                        type: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (response) {
                            if (response.success) {
                                // 使用後端返回的圖片 URL
                                resolve(response.imageUrl);
                            } else {
                                reject(response.message || '圖片上傳失敗。');
                            }
                        },
                        error: function () {
                            reject('圖片上傳失敗。');
                        }
                    });
                });
            }
        });
    }

// 更新編輯器中的圖片，添加 data-image-id 屬性
function updateEditorImages() {
        var editor = tinymce.get('editor');
        var imgs = editor.dom.select('img');
        imgs.forEach(function (img) {
            var src = img.getAttribute('src');
            var normalizedSrc = normalizeImageUrl(src);
            var imageId = window.initialData.imageMappings[normalizedSrc];
            if (imageId) {
                img.setAttribute('data-image-id', imageId);
            }
        });
    }

// 輔助方法：正規化圖片 URL，只保留相對路徑部分
function normalizeImageUrl(url) {
        var link = document.createElement('a');
        link.href = url;
        return link.pathname;
    }

/* ===================== 3. 管理問題的添加、刪除和重新索引 ===================== */

// 新增問題的函數
function addQuestion() {
        var questionHtml =
            `<div class="border p-2 my-3 question-container" id="question-${window.questionIndex}">
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

/* ===================== 4. 管理選項的添加、刪除和重新索引 ===================== */

// 新增選項的函數
function addOption(questionIndex) {
        if (!window.optionsIndices[questionIndex]) {
            window.optionsIndices[questionIndex] = 0;
        }
        var optionIndex = window.optionsIndices[questionIndex];
        var optionHtml =
            `<div class="mb-2 option-container" id="option-${questionIndex}-${optionIndex}">
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

/* ===================== 5. 管理填空的添加、刪除和重新索引 ===================== */

/* ===================== 填空相關功能 ===================== */

// 新增選項填空的函數
function addFillInBlank(questionIndex, optionIndex) {
        // 初始化填空索引
        if (!window.fillInBlankIndices[questionIndex]) {
            window.fillInBlankIndices[questionIndex] = { options: {} };
        }
        if (!window.fillInBlankIndices[questionIndex].options[optionIndex]) {
            window.fillInBlankIndices[questionIndex].options[optionIndex] = 0;
        }
        var fillInBlankIndex = window.fillInBlankIndices[questionIndex].options[optionIndex];

        // 建立新的填空 HTML 結構
        var html =
            `<div class="fill-in-blank" id="fill-in-blank-${questionIndex}-${optionIndex}-${fillInBlankIndex}">
            <h5>填空 ${fillInBlankIndex + 1}</h5>
            <input type="hidden" name="QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].FillInBlanks[${fillInBlankIndex}].Id" value="0" />
            <!-- 新增 IsDeleted 隱藏欄位，預設為 false -->
            <input type="hidden" name="QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].FillInBlanks[${fillInBlankIndex}].IsDeleted" value="false" />            
            <div class="mb-2">
                <label>正則表達式</label>
                <input type="text" name="QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].FillInBlanks[${fillInBlankIndex}].RegexPattern" class="form-control" />
            </div>
            <div class="mb-2">
                <label>長度</label>
                <input type="number" name="QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].FillInBlanks[${fillInBlankIndex}].Length" class="form-control" value="5" oninput="updateMceContent()" />
            </div>
            <div class="mb-2">
                <label>提示文字</label>
                <input type="text" name="QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].FillInBlanks[${fillInBlankIndex}].Placeholder" class="form-control" oninput="updateMceContent()" />
            </div>
            <div class="mb-2">
                <label>插入位置</label>
                <input type="number" name="QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].FillInBlanks[${fillInBlankIndex}].Position" class="form-control" oninput="updateOptionTextWithBlanks(${questionIndex}, ${optionIndex})" />
            </div>
            <button type="button" class="btn btn-danger" onclick="removeFillInBlank(${questionIndex}, ${optionIndex}, ${fillInBlankIndex}, 0)">刪除填空</button>
        </div>`;

        // 將新的填空元素添加到對應的容器中
        $(`#fill-in-blanks-${questionIndex}-${optionIndex}`).append(html);

        // 更新填空索引
        window.fillInBlankIndices[questionIndex].options[optionIndex]++;

        // 更新選項文本和編輯器內容
        updateOptionTextWithBlanks(questionIndex, optionIndex);
        updateMceContent();
    }

// 刪除填空的函數
function removeFillInBlank(questionIndex, optionIndex, fillInBlankIndex, fillInBlankId) {
        var fillInBlankContainer = $(`#fill-in-blank-${questionIndex}-${optionIndex}-${fillInBlankIndex}`);

        // 標記該填空為刪除狀態
        if (fillInBlankId > 0) {
            // 如果填空已存在於資料庫，標記為刪除
            fillInBlankContainer.find('input[name$=".IsDeleted"]').val('true');
        } else {
            // 如果是新添加的填空，直接從 DOM 中移除
            fillInBlankContainer.remove();
        }

        // 隱藏填空容器
        fillInBlankContainer.hide();

        // 更新選項描述，移除對應的填空標記
        updateOptionTextWithBlanks(questionIndex, optionIndex);
        updateMceContent();
    }

// 新增問題填空的函數
function addQuestionFillInBlank(questionIndex) {
        if (!window.fillInBlankIndices[questionIndex]) {
            window.fillInBlankIndices[questionIndex] = { question: 0 };
        }
        var fillInBlankIndex = window.fillInBlankIndices[questionIndex].question;

        var html =
            `<div class="fill-in-blank" id="question-fill-in-blank-${questionIndex}-${fillInBlankIndex}">
            <h5>填空 ${fillInBlankIndex + 1}</h5>
            <input type="hidden" name="QuestionVMs[${questionIndex}].FillInBlanks[${fillInBlankIndex}].Id" value="0" />
            <input type="hidden" name="QuestionVMs[${questionIndex}].FillInBlanks[${fillInBlankIndex}].IsDeleted" value="false" />
            <div class="mb-2">
                <label>正則表達式</label>
                <input type="text" name="QuestionVMs[${questionIndex}].FillInBlanks[${fillInBlankIndex}].RegexPattern" class="form-control" />
            </div>
            <div class="mb-2">
                <label>長度</label>
                <input type="number" name="QuestionVMs[${questionIndex}].FillInBlanks[${fillInBlankIndex}].Length" class="form-control" value="5" oninput="updateMceContent()" />
            </div>
            <div class="mb-2">
                <label>提示文字</label>
                <input type="text" name="QuestionVMs[${questionIndex}].FillInBlanks[${fillInBlankIndex}].Placeholder" class="form-control" oninput="updateMceContent()" />
            </div>
            <div class="mb-2">
                <label>插入位置</label>
                <input type="number" name="QuestionVMs[${questionIndex}].FillInBlanks[${fillInBlankIndex}].Position" class="form-control" oninput="updateQuestionTextWithBlanks(${questionIndex})" />
            </div>
            <button type="button" class="btn btn-danger" onclick="removeQuestionFillInBlank(${questionIndex}, ${fillInBlankIndex}, 0)">刪除填空</button>
        </div>`;
        // 將新的填空元素添加到對應的容器中
        $(`#question-fill-in-blanks-${questionIndex}`).append(html);

        // 更新填空索引
        window.fillInBlankIndices[questionIndex].question++;

        // 調用重新索引函數
        reindexQuestionFillInBlanks(questionIndex);
    }

// 刪除問題填空的函數
function removeQuestionFillInBlank(questionIndex, fillInBlankIndex, fillInBlankId) {
        var fillInBlankContainer = $(`#question-fill-in-blank-${questionIndex}-${fillInBlankIndex}`);

        // 標記該填空為刪除狀態
        if (fillInBlankId > 0) {
            // 如果填空已存在於資料庫，標記為刪除
            fillInBlankContainer.find('input[name$=".IsDeleted"]').val('true');
        } else {
            // 如果是新添加的填空，直接從 DOM 中移除
            fillInBlankContainer.remove();
        }

        // 隱藏填空容器
        fillInBlankContainer.hide();

        // 調用重新索引函數
        reindexQuestionFillInBlanks(questionIndex);
    }

/* ===================== 重新索引填空 ===================== */

// 重新整理選項填空索引的函數
function reindexFillInBlanks(questionIndex, optionIndex) {
        var fillInBlankContainers = $(`#fill-in-blanks-${questionIndex}-${optionIndex} .fill-in-blank`);
        var newIndex = 0; // 新的索引，用於命名

        fillInBlankContainers.each(function () {
            // 檢查是否被標記為刪除
            if ($(this).find('input[name$=".IsDeleted"]').val() === 'true') {
                return; // 跳過已刪除的填空
            }

            // 重新設定 ID 和標題
            $(this).attr('id', `fill-in-blank-${questionIndex}-${optionIndex}-${newIndex}`);
            $(this).find('h5').text(`填空 ${newIndex + 1}`);

            // 重新設定名稱屬性
            $(this).find('input, select, textarea').each(function () {
                var name = $(this).attr('name');
                if (name) {
                    name = name.replace(/FillInBlanks\[\d+\]/, `FillInBlanks[${newIndex}]`);
                    $(this).attr('name', name);
                }
            });

            // 更新刪除按鈕的 onclick 事件
            $(this).find('.btn-danger').attr('onclick', `removeFillInBlank(${questionIndex}, ${optionIndex}, ${newIndex}, 0)`);

            newIndex++;
        });
        window.fillInBlankIndices[questionIndex].options[optionIndex] = newIndex;
        updateOptionTextWithBlanks(questionIndex, optionIndex);
    }

// 重新整理問題填空索引的函數
function reindexQuestionFillInBlanks(questionIndex) {
        var fillInBlankContainers = $(`#question-fill-in-blanks-${questionIndex} .fill-in-blank`);
        var newIndex = 0; // 新的索引，用於命名

        fillInBlankContainers.each(function () {
            // 檢查是否被標記為刪除
            var isDeleted = $(this).find('input[name$=".IsDeleted"]').val() === 'true';
            if (isDeleted) {
                // 不重新索引被刪除的填空，但需要保留其名稱以傳遞 IsDeleted 值
                return;
            }

            // 重新設定 ID 和標題
            $(this).attr('id', `question-fill-in-blank-${questionIndex}-${newIndex}`);
            $(this).find('h5').text(`填空 ${newIndex + 1}`);

            // 重新設定名稱屬性，但跳過 IsDeleted 欄位
            $(this).find('input, select, textarea').each(function () {
                var name = $(this).attr('name');
                if (name) {
                    if (name.endsWith('.IsDeleted')) {
                        // 跳過 IsDeleted 欄位的重新命名
                        return;
                    }
                    name = name.replace(/FillInBlanks\[\d+\]/, `FillInBlanks[${newIndex}]`);
                    $(this).attr('name', name);
                }
            });

            // 更新刪除按鈕的 onclick 事件
            var fillInBlankId = $(this).find('input[name$=".Id"]').val() || 0;
            $(this).find('.btn-danger').attr('onclick', `removeQuestionFillInBlank(${questionIndex}, ${newIndex}, ${fillInBlankId})`);

            newIndex++;
        });

        // 更新填空索引
        window.fillInBlankIndices[questionIndex].question = newIndex;

        // 更新問題描述和編輯器內容
        updateQuestionTextWithBlanks(questionIndex);
    }

/* ===================== 6. 處理圖片上傳、預覽和尺寸調整 ===================== */

// 新增問卷圖片上傳欄位的函數
function addSurveyImageUploadField() {
        var index = $('#survey-image-upload-container .survey-image-upload-group').length;
        var html =
            `<div class="mb-2 survey-image-upload-group image-upload-group">
            <input type="file" name="SurveyImageFiles" class="form-control mb-1" onchange="previewAndSyncImage(this, 'survey')" />           
        </div>`;
        $('#survey-image-upload-container').append(html);
        updateMceContent(); // 更新編輯器內容
    }

// 新增問題圖片上傳欄位的函數
function addQuestionImageUploadField(questionIndex) {
        var index = $(`#question-image-upload-container-${questionIndex} .question-image-upload-group`).length;
        var html =
            `<div class="mb-2 question-image-upload-group image-upload-group">
            <input type="file" name="QuestionVMs[${questionIndex}].QuestionImageFiles" class="form-control mb-1" onchange="previewAndSyncImage(this, 'question', ${questionIndex})" />
        </div>`;
        $(`#question-image-upload-container-${questionIndex}`).append(html);
        updateMceContent(); // 更新編輯器內容
    }

// 新增選項圖片上傳欄位的函數
function addOptionImageUploadField(questionIndex, optionIndex) {
        var index = $(`#option-image-upload-container-${questionIndex}-${optionIndex} .option-image-upload-group`).length;
        var html =
            `<div class="mb-2 option-image-upload-group image-upload-group">
            <input type="file" name="QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].OptionImageFiles" class="form-control mb-1" onchange="previewAndSyncImage(this, 'option', ${questionIndex}, ${optionIndex})" />
        </div>`;
        $(`#option-image-upload-container-${questionIndex}-${optionIndex}`).append(html);
        updateMceContent(); // 更新編輯器內容
    }

// 當圖片上傳時，更新 TinyMCE 編輯器中的圖片內容
function previewAndSyncImage(input, type, questionIndex, optionIndex) {
        const maxSize = 5 * 1024 * 1024; // 最大5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        if (input.files && input.files[0]) {
            const file = input.files[0];

            // 檢查文件類型
            if (!allowedTypes.includes(file.type)) {
                toastr.error('僅允許上傳 JPG、PNG、WEBP 或 GIF 格式的圖片。');
                input.value = ''; // 清空選擇
                return;
            }

            // 檢查文件大小
            if (file.size > maxSize) {
                toastr.error('圖片大小不得超過 5MB。');
                input.value = '';
                return;
            }

            var reader = new FileReader();
            reader.onload = function (e) {
                // 確保每個新圖片有唯一的 imageId
                window.newImageIdCounter = window.newImageIdCounter || -1;
                var imageId = window.newImageIdCounter--;
                var defaultWidth = 200; // 預設寬度
                var defaultHeight = 200; // 預設高度

                // 插入圖片到編輯器，並添加 data-image-id
                var imgHtml = `<img src="${e.target.result}" alt="${type} Image" data-image-id="${imageId}" width="${defaultWidth}" height="${defaultHeight}" style="width:${defaultWidth}px; height:${defaultHeight}px;" />`;
                var editor = tinymce.get('editor');
                editor.insertContent(imgHtml);

                // 將圖片插入預覽區域，並添加 data-image-id
                var previewImage =
                    `<div class="mb-3 image-upload-group">
                    <img src="${e.target.result}" alt="${type} Image" data-image-id="${imageId}" style="width:${defaultWidth}px; height:${defaultHeight}px;" />
                    
                    <!-- 寬度和高度的輸入欄位及滑桿 -->
                    <div class="row">
                        <div class="col">
                            <label>寬度 (px)</label>
                            <input type="number" name="${getImageWidthInputName(type, questionIndex, optionIndex)}" class="form-control" value="${defaultWidth}" oninput="updateImageSize(this)" />
                            <input type="range" min="50" max="1000" value="${defaultWidth}" class="form-range" oninput="syncInputAndRange(this)" data-target="width" />
                        </div>
                        <div class="col">
                            <label>高度 (px)</label>
                            <input type="number" name="${getImageHeightInputName(type, questionIndex, optionIndex)}" class="form-control" value="${defaultHeight}" oninput="updateImageSize(this)" />
                            <input type="range" min="50" max="1000" value="${defaultHeight}" class="form-range" oninput="syncInputAndRange(this)" data-target="height" />
                        </div>
                    </div>
                    
                    <button type="button" class="btn btn-danger" onclick="removePreviewImage(this)">刪除</button>
                </div>`;

                // 根據類型將預覽圖片插入對應的位置
                if (type === 'survey') {
                    $('#survey-image-preview').append(previewImage);
                } else if (type === 'question') {
                    $(`#question-image-preview-${questionIndex}`).append(previewImage);
                } else if (type === 'option') {
                    $(`#option-image-preview-${questionIndex}-${optionIndex}`).append(previewImage);
                }

                updateMceContent(); // 更新 MceHtml
            }
            reader.readAsDataURL(file);
        }
    }

// 刪除預覽圖片
function removePreviewImage(button) {
        var imageId = $(button).siblings('img').attr('data-image-id');
        $(button).parent().remove();
        removeImage(imageId); // 刪除圖片
    }

// 更新圖片尺寸並同步到編輯器
function updateImageSize(imageInput) {
        var imageGroup = $(imageInput).closest('.image-upload-group');
        var imgElement = imageGroup.find('img');
        var imageId = imgElement.attr('data-image-id');

        // 假設第一個數字輸入欄位是寬度，第二個是高度
        var widthInput = imageGroup.find('input[type="number"]').eq(0);
        var heightInput = imageGroup.find('input[type="number"]').eq(1);

        var newWidth = widthInput.val();
        var newHeight = heightInput.val();

        // 更新圖片預覽的尺寸
        imgElement.css({
            'width': newWidth + 'px',
            'height': newHeight + 'px'
        });

        // 同步更新 TinyMCE 編輯器中的圖片尺寸
        updateImageSizeInEditor(imageId, newWidth, newHeight);
    }

// 同步滑桿和數字輸入框的函數
function syncInputAndRange(rangeInput) {
        var target = $(rangeInput).data('target'); // 'width' 或 'height'
        var value = $(rangeInput).val();

        var imageGroup = $(rangeInput).closest('.image-upload-group');
        var numberInput;

        if (target === 'width') {
            numberInput = imageGroup.find('input[type="number"]').eq(0);
        } else if (target === 'height') {
            numberInput = imageGroup.find('input[type="number"]').eq(1);
        }

        if (numberInput) {
            numberInput.val(value);
            updateImageSize(numberInput[0]);
        }
    }

// 更新 TinyMCE 編輯器中的圖片尺寸
function updateImageSizeInEditor(imageId, newWidth, newHeight) {
        var editor = tinymce.get('editor');

        // 使用 console.log 來監視變數的值
        console.log('imageId: ' + imageId + '\nnewWidth: ' + newWidth + '\nnewHeight: ' + newHeight);

        // 使用 data-image-id 選取圖片
        var img = editor.dom.select(`img[data-image-id="${imageId}"]`)[0];

        if (img) {
            if (newWidth !== null && newWidth !== undefined && newWidth !== '') {
                img.style.width = newWidth + 'px';
            }
            if (newHeight !== null && newHeight !== undefined && newHeight !== '') {
                img.style.height = newHeight + 'px';
            }

            // 通知編輯器內容已更改
            editor.nodeChanged();

            // 同步更新隱藏的 MceHtml 欄位
            $('#MceHtml').val(editor.getContent());
        } else {
            console.log(`TinyMCE 編輯器中未找到 ID 為 ${imageId} 的圖片。`);
        }
    }

// 輔助方法：根據圖片類型和索引，生成對應的寬度輸入欄位的名稱
function getImageWidthInputName(type, questionIndex, optionIndex) {
        if (type === 'survey') {
            return 'NewSurveyImageWidths[]';
        } else if (type === 'question') {
            return `QuestionVMs[${questionIndex}].NewQuestionImageWidths[]`;
        } else if (type === 'option') {
            return `QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].NewOptionImageWidths[]`;
        }
    }

// 輔助方法：根據圖片類型和索引，生成對應的高度輸入欄位的名稱
function getImageHeightInputName(type, questionIndex, optionIndex) {
        if (type === 'survey') {
            return 'NewSurveyImageHeights[]';
        } else if (type === 'question') {
            return `QuestionVMs[${questionIndex}].NewQuestionImageHeights[]`;
        } else if (type === 'option') {
            return `QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].NewOptionImageHeights[]`;
        }
    }

// 移除圖片的前端邏輯，通過 Ajax 請求後端刪除圖片
function removeImage(imageId) {
        $.ajax({
            url: '/admin/survey/removeimage',
            type: 'POST',
            data: { id: imageId },
            success: function (response) {
                if (response.success) {
                    toastr.success(response.message);
                    $(`img[data-image-id="${imageId}"]`).closest('.image-upload-group').remove();
                    tinymce.get('editor').setContent(tinymce.get('editor').getContent()); // 刷新編輯器內容
                    $('#MceHtml').val(tinymce.get('editor').getContent());
                    updateMceContent(); // 更新編輯器內容
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (xhr) {
                console.log(xhr.responseText);
                toastr.error('刪除圖片時發生錯誤');
            }
        });
    }

/* ===================== 7. 更新文本內容，如問題描述和選項文本 ===================== */

// 更新 TinyMCE 編輯器的內容
function updateMceContent() {
        var content = generateMceContent();
        $('#MceHtml').val(content);
        tinymce.get('editor').setContent(content);
    }

// 生成 TinyMCE 編輯器的內容
function generateMceContent() {
        var title = $('input[name="Survey.Title"]').val();
        var description = $('textarea[name="Survey.Description"]').val();
        var stationName = $('select[name="Survey.StationName"] option:selected').text();
        var questionNum = $('input[name="Survey.QuestionNum"]').val();

        var surveyImagesHtml = '';

        // 選取所有 survey 圖片預覽
        $('#survey-image-preview img').each(function () {
            var imgSrc = $(this).attr('src');
            var imageId = $(this).attr('data-image-id');
            var width = $(this).css('width').replace('px', '') || 200;
            var height = $(this).css('height').replace('px', '') || 200;
            surveyImagesHtml += `<img src="${imgSrc}" alt="問卷圖片" data-image-id="${imageId}" style="width:${width}px; height:${height}px;" /><br />`;
        });

        var questionsHtml = '';

        // 處理每個問題容器
        $('#questions .question-container').each(function () {
            var questionText = $(this).find('input[name$=".Question.QuestionText"]').val();
            var answerTypeValue = $(this).find('select[name$=".Question.AnswerType"]').val();
            var answerType = $(this).find('select[name$=".Question.AnswerType"] option:selected').text();
            var optionsHtml = '';

            var qIndex = $(this).attr('id').split('-')[1]; // 問題索引

            // 處理問題級別的填空標記
            var modifiedQuestionText = questionText;
            var fillInBlankIndex = 0;

            // 正則表達式匹配 ${填空X}$，X為數字
            var fillInBlankRegex = /\$\{填空(\d+)\}\$/g;

            // 填空配置
            var fillInBlankLengths = {};
            $(this).find(`#question-fill-in-blanks-${qIndex} .fill-in-blank`).each(function () {
                var blankNumber = $(this).find('h5').text().replace('填空 ', '');
                var length = parseInt($(this).find('input[name$=".Length"]').val()) || 5;
                var placeholder = $(this).find('input[name$=".Placeholder"]').val() || '';
                fillInBlankLengths[blankNumber] = { length: length, placeholder: placeholder };
            });

            modifiedQuestionText = modifiedQuestionText.replace(fillInBlankRegex, function (match, p1) {
                var blankNumber = p1;
                var inputName = `QuestionVMs[${qIndex}].FillInBlanks[${fillInBlankIndex}].AnswerText`;
                var lengthInfo = fillInBlankLengths[blankNumber] || { length: 5, placeholder: '' };
                var length = lengthInfo.length;
                var placeholder = lengthInfo.placeholder;

                // 設置輸入框的樣式與隱藏欄位
                var inputStyle = `width: ${length * 10}px;`;
                var hiddenLengthInput = `<input type="hidden" name="QuestionVMs[${qIndex}].FillInBlanks[${fillInBlankIndex}].Length" value="${length}" />`;

                fillInBlankIndex++;
                return `${hiddenLengthInput}<input type="text" name="${inputName}" placeholder="${placeholder}" class="form-control fill-in-blank-input" style="${inputStyle}" />`;
            });

            var optionsHtml = '';

            $(this).find('.option-container').each(function () {
                var optionText = $(this).find('input[name$=".QuestionOption.OptionText"]').val();
                var optionIdParts = $(this).attr('id').split('-');
                var optionIndex = optionIdParts[2];

                // 處理填空標記，將 ${填空1}$ 等替換為輸入框，並根據長度調整大小
                var modifiedOptionText = optionText;
                var fillInBlankIndex = 0;

                // 正則表達式匹配 ${填空X}$，X為數字
                var fillInBlankRegex = /\$\{填空(\d+)\}\$/g;

                // 獲取該選項的填空長度配置
                var fillInBlankLengths = {};
                var fillInBlanks = [];

                $(this).find('.fill-in-blank').each(function () {
                    var blankNumber = $(this).find('h5').text().replace('填空 ', '');
                    var length = parseInt($(this).find('input[name$=".Length"]').val()) || 5;
                    var position = parseInt($(this).find('input[name$=".Position"]').val()) || 0;
                    var placeholder = $(this).find('input[name$=".Placeholder"]').val() || '';
                    fillInBlankLengths[blankNumber] = { length: length, placeholder: placeholder };
                });

                modifiedOptionText = modifiedOptionText.replace(fillInBlankRegex, function (match, p1) {
                    var blankNumber = p1;
                    var inputName = `QuestionVMs[${qIndex}].QuestionOptionVMs[${optionIndex}].FillInBlanks[${fillInBlankIndex}].AnswerText`;
                    var lengthInfo = fillInBlankLengths[blankNumber] || { length: 5, placeholder: '' };
                    var length = lengthInfo.length;
                    var placeholder = lengthInfo.placeholder;

                    // 設置輸入框的大小，使用 style 屬性控制寬度
                    var inputStyle = `width: ${length * 10}px;`; // 每個字元約 10px，可根據需要調整

                    // 隱藏欄位，存儲長度值（如果需要在後端獲取）
                    var hiddenLengthInput = `<input type="hidden" name="QuestionVMs[${qIndex}].QuestionOptionVMs[${optionIndex}].FillInBlanks[${fillInBlankIndex}].Length" value="${length}" />`;

                    fillInBlankIndex++;
                    return `${hiddenLengthInput}<input type="text" name="${inputName}" placeholder="${placeholder}" class="form-control fill-in-blank-input" style="${inputStyle}" />`;
                });

                var optionHtml = '';

                switch (answerType.toLowerCase()) {
                    case '單選':
                    case 'radio':
                        var optionId = $(this).find('input[name$=".QuestionOption.Id"]').val();
                        optionHtml += `<input type="radio" name="Questions[${qIndex}].SelectedOption" value="${optionId}" id="option_${optionId}" required> ` +
                            `<label for="option_${optionId}">${modifiedOptionText}</label><br />`;
                        break;
                    case '多選':
                    case 'checkbox':
                        var optionId = $(this).find('input[name$=".QuestionOption.Id"]').val();
                        optionHtml += `<input type="checkbox" name="Questions[${qIndex}].SelectedOptions" value="${optionId}" id="option_${optionId}"> ` +
                            `<label for="option_${optionId}">${modifiedOptionText}</label><br />`;
                        break;
                    case '填空':
                    case 'text':
                        optionHtml += `<input type="text" name="Questions[${qIndex}].AnswerText" required class="form-control" /><br />`;
                        break;
                    case '填空框':
                    case 'textarea':
                        optionHtml += `<textarea name="Questions[${qIndex}].AnswerText" required class="form-control"></textarea><br />`;
                        break;
                    case '下拉選單':
                    case 'select':
                        optionHtml += `<select name="Questions[${qIndex}].AnswerText" class="form-select"><option>${optionText}</option></select><br />`;
                        break;
                    default:
                        optionHtml += `${modifiedOptionText}<br />`;
                        break;
                }

                // 直接在當前選項容器內尋找圖片
                var optionImagesHtml = '';
                $(this).find('.option-image-preview img').each(function () {
                    var imgSrc = $(this).attr('src');
                    var imageId = $(this).attr('data-image-id');
                    var width = $(this).css('width').replace('px', '') || 200;
                    var height = $(this).css('height').replace('px', '') || 200;
                    optionImagesHtml += `<img src="${imgSrc}" alt="選項圖片" data-image-id="${imageId}" style="width:${width}px; height:${height}px;" /><br />`;
                });

                if (optionImagesHtml) {
                    optionHtml += `<br />${optionImagesHtml}`;
                }

                optionsHtml += optionHtml;
            });

            // 直接在當前問題容器內尋找圖片
            var questionImagesHtml = '';
            $(this).find('.question-image-preview img').each(function () {
                var imgSrc = $(this).attr('src');
                var imageId = $(this).attr('data-image-id');
                var width = $(this).css('width').replace('px', '') || 200;
                var height = $(this).css('height').replace('px', '') || 200;
                questionImagesHtml += `<img src="${imgSrc}" alt="問題圖片" data-image-id="${imageId}" style="width:${width}px; height:${height}px;" /><br />`;
            });

            var questionHtml = `<h3>${modifiedQuestionText} (${answerType})</h3>`;
            if (questionImagesHtml) {
                questionHtml += `<div>${questionImagesHtml}</div>`;
            }
            if (optionsHtml) {
                questionHtml += `<div>${optionsHtml}</div>`;
            }
            questionsHtml += questionHtml;
        });

        var content = `<h1>${title}<span style="font-size: 0.7em; margin-left: 10px;">` +
            `站別: ${stationName} 頁數：${questionNum}` +
            `</span></h1>` +
            `<p>${description}</p>`;

        if (surveyImagesHtml) {
            content += `<div>${surveyImagesHtml}</div>`;
        }

        content += questionsHtml;

        return content;
    }

/* === 更新選項描述中的填空標記 === */
/**
 * 更新選項描述中的填空標記
 * @param {number} questionIndex - 問題的索引
 * @param {number} optionIndex - 選項的索引
 */
function updateOptionTextWithBlanks(questionIndex, optionIndex) {
        var optionContainer = $(`#option-${questionIndex}-${optionIndex}`);
        var optionTextInput = optionContainer.find('input[name$=".QuestionOption.OptionText"]');
        var originalOptionText = optionTextInput.data('original-text') || optionTextInput.val();

        // 保存原始的選項文本
        if (!optionTextInput.data('original-text')) {
            optionTextInput.data('original-text', originalOptionText);
        }

        var fillInBlanks = optionContainer.find('.fill-in-blank');
        var optionText = optionTextInput.data('original-text'); // 重置為原始文本

        // 收集填空的插入位置和佔位符
        var placeholders = [];
        fillInBlanks.each(function () {
            // 檢查是否被標記為刪除
            if ($(this).find('input[name$=".IsDeleted"]').val() === 'true') {
                return; // 跳過已刪除的填空
            }
            var position = parseInt($(this).find('input[name$=".Position"]').val()) || 0;
            var blankNumber = $(this).find('h5').text().replace('填空 ', '');
            placeholders.push({ position: position, placeholder: `${'${填空' + blankNumber + '}$'}` });
        });

        // 按插入位置從後往前排序，避免索引錯誤
        placeholders.sort(function (a, b) {
            return b.position - a.position;
        });

        // 將佔位符插入到選項文本中
        placeholders.forEach(function (item) {
            var pos = item.position;
            if (pos < 0) pos = 0;
            if (pos > optionText.length) pos = optionText.length;
            optionText = optionText.slice(0, pos) + item.placeholder + optionText.slice(pos);
        });

        optionTextInput.val(optionText);
        updateMceContent();
    }

/**
 * 更新問題描述中的填空標記
 * @param {number} questionIndex - 問題的索引
 */
function updateQuestionTextWithBlanks(questionIndex) {
        var questionContainer = $(`#question-${questionIndex}`);
        var questionTextInput = questionContainer.find('input[name$=".Question.QuestionText"]');
        var questionText = questionTextInput.val();

        // 移除問題文本中已存在的填空佔位符
        questionText = questionText.replace(/\$\{填空\d+\}\$/g, '');

        var fillInBlanks = $(`#question-fill-in-blanks-${questionIndex} .fill-in-blank`);

        // 收集填空的插入位置和佔位符
        var placeholders = [];
        fillInBlanks.each(function () {
            // 檢查是否被標記為刪除
            if ($(this).find('input[name$=".IsDeleted"]').val() === 'true') {
                return; // 跳過已刪除的填空
            }
            var position = parseInt($(this).find('input[name$=".Position"]').val()) || 0;
            var blankNumber = $(this).find('h5').text().replace('填空 ', '');
            placeholders.push({ position: position, placeholder: `${'${填空' + blankNumber + '}$'}` });
        });

        // 按插入位置從後往前排序，避免索引錯誤
        placeholders.sort(function (a, b) {
            return b.position - a.position;
        });

        // 將佔位符插入到問題文本中
        placeholders.forEach(function (item) {
            var pos = item.position;
            if (pos < 0) pos = 0;
            if (pos > questionText.length) pos = questionText.length;
            questionText = questionText.slice(0, pos) + item.placeholder + questionText.slice(pos);
        });

        questionTextInput.val(questionText);
        updateMceContent();
    }
