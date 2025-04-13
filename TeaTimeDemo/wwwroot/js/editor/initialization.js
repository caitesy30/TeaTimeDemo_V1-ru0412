/**
 * 檔名：initialization.js
 * 功能：初始化相關的函數和全局變量
 * 創造日期：2024/11/29
 * 作者：忠訓
 */

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
        });
    }
}

// 將初始化函數暴露給全局作用域
window.initializeQuestionIndices = initializeQuestionIndices;
window.initializeFillInBlankIndices = initializeFillInBlankIndices;
