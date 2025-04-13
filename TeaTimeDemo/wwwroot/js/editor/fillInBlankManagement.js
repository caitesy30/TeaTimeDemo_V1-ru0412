/**
 * 檔名：fillInBlankManagement.js
 * 功能：管理填空的添加、刪除和重新索引
 * 創造日期：2024/11/29
 * 作者：忠訓
 */

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
    var html = `
        <div class="fill-in-blank" id="fill-in-blank-${questionIndex}-${optionIndex}-${fillInBlankIndex}">
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
        </div>
    `;

    // 將新的填空元素添加到對應的容器中
    $('#fill-in-blanks-' + questionIndex + '-' + optionIndex).append(html);

    // 更新填空索引
    window.fillInBlankIndices[questionIndex].options[optionIndex]++;

    // **新增以下兩行，更新選項文本和編輯器內容**
    updateOptionTextWithBlanks(questionIndex, optionIndex);
    updateMceContent();
}

// 刪除填空的函數
function removeFillInBlank(questionIndex, optionIndex, fillInBlankIndex, fillInBlankId) {
    var fillInBlankContainer = $('#fill-in-blank-' + questionIndex + '-' + optionIndex + '-' + fillInBlankIndex);

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

    var html = `
        <div class="fill-in-blank" id="question-fill-in-blank-${questionIndex}-${fillInBlankIndex}">
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
        </div>
    `;
    // 將新的填空元素添加到對應的容器中
    $('#question-fill-in-blanks-' + questionIndex).append(html);

    // **調用重新索引函數**
    reindexQuestionFillInBlanks(questionIndex);
}

// 刪除問題填空的函數
function removeQuestionFillInBlank(questionIndex, fillInBlankIndex, fillInBlankId) {
    var fillInBlankContainer = $('#question-fill-in-blank-' + questionIndex + '-' + fillInBlankIndex);

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

// 重新整理填空索引的函數
function reindexFillInBlanks(questionIndex, optionIndex) {
    var fillInBlankContainers = $('#fill-in-blanks-' + questionIndex + '-' + optionIndex + ' .fill-in-blank');
    var newIndex = 0; // 新的索引，用於命名

    fillInBlankContainers.each(function () {
        // 檢查是否被標記為刪除
        if ($(this).find('input[name$=".IsDeleted"]').val() === 'true') {
            return; // 跳過已刪除的填空
        }

        // 重新設定 ID 和標題
        $(this).attr('id', 'fill-in-blank-' + questionIndex + '-' + optionIndex + '-' + newIndex);
        $(this).find('h5').text('填空 ' + (newIndex + 1));

        // 重新設定名稱屬性
        $(this).find('input, select, textarea').each(function () {
            var name = $(this).attr('name');
            if (name) {
                name = name.replace(/FillInBlanks\[\d+\]/, 'FillInBlanks[' + newIndex + ']');
                $(this).attr('name', name);
            }
        });

        // 更新刪除按鈕的 onclick 事件
        $(this).find('.btn-danger').attr('onclick', 'removeFillInBlank(' + questionIndex + ', ' + optionIndex + ', ' + newIndex + ', 0)');

        newIndex++;
    });
    window.fillInBlankIndices[questionIndex].options[optionIndex] = newIndex;
    updateOptionTextWithBlanks(questionIndex, optionIndex);
}


function reindexQuestionFillInBlanks(questionIndex) {
    var fillInBlankContainers = $('#question-fill-in-blanks-' + questionIndex + ' .fill-in-blank');
    var newIndex = 0; // 新的索引，用於命名

    fillInBlankContainers.each(function () {
        // 檢查是否被標記為刪除
        var isDeleted = $(this).find('input[name$=".IsDeleted"]').val() === 'true';
        if (isDeleted) {
            // 不重新索引被刪除的填空，但需要保留其名稱以傳遞 `IsDeleted` 值
            return;
        }

        // 重新設定 ID 和標題
        $(this).attr('id', 'question-fill-in-blank-' + questionIndex + '-' + newIndex);
        $(this).find('h5').text('填空 ' + (newIndex + 1));

        // 重新設定名稱屬性，但跳過 `IsDeleted` 欄位
        $(this).find('input, select, textarea').each(function () {
            var name = $(this).attr('name');
            if (name) {
                if (name.endsWith('.IsDeleted')) {
                    // 跳過 `IsDeleted` 欄位的重新命名
                    return;
                }
                name = name.replace(/FillInBlanks\[\d+\]/, 'FillInBlanks[' + newIndex + ']');
                $(this).attr('name', name);
            }
        });

        // 更新刪除按鈕的 onclick 事件
        var fillInBlankId = $(this).find('input[name$=".Id"]').val() || 0;
        $(this).find('.btn-danger').attr('onclick', 'removeQuestionFillInBlank(' + questionIndex + ', ' + newIndex + ', ' + fillInBlankId + ')');

        newIndex++;
    });

    // 更新填空索引
    window.fillInBlankIndices[questionIndex].question = newIndex;

    // 更新問題描述和編輯器內容
    updateQuestionTextWithBlanks(questionIndex);
}


/* ===================== 重新索引填空 ===================== */
function reindexFillInBlanks(questionIndex, optionIndex) {
    var fillInBlankContainers = $('#fill-in-blanks-' + questionIndex + '-' + optionIndex + ' .fill-in-blank');
    var newIndex = 0; // 新的索引，用於命名

    fillInBlankContainers.each(function (index) {
        // 檢查是否被標記為刪除
        if ($(this).find('input[name$=".IsDeleted"]').val() === 'true') {
            return; // 跳過已刪除的填空
        }

        // 重新設定 ID 和標題
        $(this).attr('id', 'fill-in-blank-' + questionIndex + '-' + optionIndex + '-' + newIndex);
        $(this).find('h5').text('填空 ' + (newIndex + 1));

        // 重新設定名稱屬性
        $(this).find('input, select, textarea').each(function () {
            var name = $(this).attr('name');
            if (name) {
                name = name.replace(/FillInBlanks\[\d+\]/, 'FillInBlanks[' + newIndex + ']');
                $(this).attr('name', name);
            }
        });

        // 更新刪除按鈕的 onclick 事件
        $(this).find('.btn-danger').attr('onclick', 'removeFillInBlank(' + questionIndex + ', ' + optionIndex + ', ' + newIndex + ', 0)');

        newIndex++;
    });
    window.fillInBlankIndices[questionIndex][optionIndex] = newIndex;
    updateOptionTextWithBlanks(questionIndex, optionIndex);
}


// 將填空管理函數暴露給全局作用域
window.addFillInBlank = addFillInBlank;
window.removeFillInBlank = removeFillInBlank;
window.addQuestionFillInBlank = addQuestionFillInBlank;
window.removeQuestionFillInBlank = removeQuestionFillInBlank;
window.reindexFillInBlanks = reindexFillInBlanks;
window.reindexQuestionFillInBlanks = reindexQuestionFillInBlanks;
