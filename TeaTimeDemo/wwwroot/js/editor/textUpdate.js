/**
 * 檔名：textUpdate.js
 * 功能：負責更新文本內容，如問題描述和選項文本
 * 創造日期：2024/11/29
 * 作者：忠訓
 */

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

// 更新選項描述中的填空標記
function updateOptionTextWithBlanks(questionIndex, optionIndex) {
    var optionContainer = $('#option-' + questionIndex + '-' + optionIndex);
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
        placeholders.push({ position: position, placeholder: '${填空' + blankNumber + '}$' });
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

// 更新問題描述中的填空標記
function updateQuestionTextWithBlanks(questionIndex) {
    var questionContainer = $('#question-' + questionIndex);
    var questionTextInput = questionContainer.find('input[name$=".Question.QuestionText"]');
    var questionText = questionTextInput.val();

    // **移除問題文本中已存在的填空佔位符**
    questionText = questionText.replace(/\$\{填空\d+\}\$/g, '');

    var fillInBlanks = questionContainer.find('#question-fill-in-blanks-' + questionIndex + ' .fill-in-blank');

    // 收集填空的插入位置和佔位符
    var placeholders = [];
    fillInBlanks.each(function () {
        // 檢查是否被標記為刪除
        if ($(this).find('input[name$=".IsDeleted"]').val() === 'true') {
            return; // 跳過已刪除的填空
        }
        var position = parseInt($(this).find('input[name$=".Position"]').val()) || 0;
        var blankNumber = $(this).find('h5').text().replace('填空 ', '');
        placeholders.push({ position: position, placeholder: '${填空' + blankNumber + '}$' });
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

// 將文本更新函數暴露給全局作用域
window.updateMceContent = updateMceContent;
window.generateMceContent = generateMceContent;
window.updateOptionTextWithBlanks = updateOptionTextWithBlanks;
window.updateQuestionTextWithBlanks = updateQuestionTextWithBlanks;
