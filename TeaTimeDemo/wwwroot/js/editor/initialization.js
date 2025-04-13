/**
 * �ɦW�Ginitialization.js
 * �\��G��l�Ƭ�������ƩM�����ܶq
 * �гy����G2024/11/29
 * �@�̡G���V
 */

// ��l�ư��D�M�ﶵ������
function initializeQuestionIndices() {
    window.questionIndex = window.initialData.questionCount || 0;
    window.optionsIndices = window.initialData.optionsIndices || {};
}

// ��l�ƶ�ů���
function initializeFillInBlankIndices() {
    window.fillInBlankIndices = {};

    for (var i = 0; i < window.questionIndex; i++) {
        // ��l�ư��D�ŧO����ů���
        var questionFillInBlanks = $('#question-fill-in-blanks-' + i + ' .fill-in-blank').length;
        window.fillInBlankIndices[i] = {
            question: questionFillInBlanks,
            options: {}
        };

        // ��l�ƿﶵ�ŧO����ů���
        var optionContainers = $('#options-' + i + ' .option-container');
        optionContainers.each(function () {
            var j = $(this).attr('id').split('-')[2];
            var fillInBlankCount = $(this).find('.fill-in-blank').length;
            window.fillInBlankIndices[i].options[j] = fillInBlankCount;
        });
    }
}

// �N��l�ƨ�Ƽ��S�������@�ΰ�
window.initializeQuestionIndices = initializeQuestionIndices;
window.initializeFillInBlankIndices = initializeFillInBlankIndices;
