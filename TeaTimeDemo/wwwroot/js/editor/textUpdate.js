/**
 * �ɦW�GtextUpdate.js
 * �\��G�t�d��s�奻���e�A�p���D�y�z�M�ﶵ�奻
 * �гy����G2024/11/29
 * �@�̡G���V
 */

// ��s TinyMCE �s�边�����e
function updateMceContent() {
    var content = generateMceContent();
    $('#MceHtml').val(content);
    tinymce.get('editor').setContent(content);
}

// �ͦ� TinyMCE �s�边�����e
function generateMceContent() {
    var title = $('input[name="Survey.Title"]').val();
    var description = $('textarea[name="Survey.Description"]').val();
    var stationName = $('select[name="Survey.StationName"] option:selected').text();
    var questionNum = $('input[name="Survey.QuestionNum"]').val();

    var surveyImagesHtml = '';

    // ����Ҧ� survey �Ϥ��w��
    $('#survey-image-preview img').each(function () {
        var imgSrc = $(this).attr('src');
        var imageId = $(this).attr('data-image-id');
        var width = $(this).css('width').replace('px', '') || 200;
        var height = $(this).css('height').replace('px', '') || 200;
        surveyImagesHtml += `<img src="${imgSrc}" alt="�ݨ��Ϥ�" data-image-id="${imageId}" style="width:${width}px; height:${height}px;" /><br />`;
    });

    var questionsHtml = '';

    // �B�z�C�Ӱ��D�e��
    $('#questions .question-container').each(function () {
        var questionText = $(this).find('input[name$=".Question.QuestionText"]').val();
        var answerTypeValue = $(this).find('select[name$=".Question.AnswerType"]').val();
        var answerType = $(this).find('select[name$=".Question.AnswerType"] option:selected').text();
        var optionsHtml = '';

        var qIndex = $(this).attr('id').split('-')[1]; // ���D����

        // �B�z���D�ŧO����żаO
        var modifiedQuestionText = questionText;
        var fillInBlankIndex = 0;

        // ���h��F���ǰt ${���X}$�AX���Ʀr
        var fillInBlankRegex = /\$\{���(\d+)\}\$/g;

        // ��Űt�m
        var fillInBlankLengths = {};
        $(this).find(`#question-fill-in-blanks-${qIndex} .fill-in-blank`).each(function () {
            var blankNumber = $(this).find('h5').text().replace('��� ', '');
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

            // �]�m��J�ت��˦��P�������
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

            // �B�z��żаO�A�N ${���1}$ ����������J�ءA�îھڪ��׽վ�j�p
            var modifiedOptionText = optionText;
            var fillInBlankIndex = 0;

            // ���h��F���ǰt ${���X}$�AX���Ʀr
            var fillInBlankRegex = /\$\{���(\d+)\}\$/g;

            // ����ӿﶵ����Ū��װt�m
            var fillInBlankLengths = {};
            var fillInBlanks = [];

            $(this).find('.fill-in-blank').each(function () {
                var blankNumber = $(this).find('h5').text().replace('��� ', '');
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

                // �]�m��J�ت��j�p�A�ϥ� style �ݩʱ���e��
                var inputStyle = `width: ${length * 10}px;`; // �C�Ӧr���� 10px�A�i�ھڻݭn�վ�

                // �������A�s�x���׭ȡ]�p�G�ݭn�b�������^
                var hiddenLengthInput = `<input type="hidden" name="QuestionVMs[${qIndex}].QuestionOptionVMs[${optionIndex}].FillInBlanks[${fillInBlankIndex}].Length" value="${length}" />`;

                fillInBlankIndex++;
                return `${hiddenLengthInput}<input type="text" name="${inputName}" placeholder="${placeholder}" class="form-control fill-in-blank-input" style="${inputStyle}" />`;
            });

            var optionHtml = '';

            switch (answerType.toLowerCase()) {
                case '���':
                case 'radio':
                    var optionId = $(this).find('input[name$=".QuestionOption.Id"]').val();
                    optionHtml += `<input type="radio" name="Questions[${qIndex}].SelectedOption" value="${optionId}" id="option_${optionId}" required> ` +
                        `<label for="option_${optionId}">${modifiedOptionText}</label><br />`;
                    break;
                case '�h��':
                case 'checkbox':
                    var optionId = $(this).find('input[name$=".QuestionOption.Id"]').val();
                    optionHtml += `<input type="checkbox" name="Questions[${qIndex}].SelectedOptions" value="${optionId}" id="option_${optionId}"> ` +
                        `<label for="option_${optionId}">${modifiedOptionText}</label><br />`;
                    break;
                case '���':
                case 'text':
                    optionHtml += `<input type="text" name="Questions[${qIndex}].AnswerText" required class="form-control" /><br />`;
                    break;
                case '��Ů�':
                case 'textarea':
                    optionHtml += `<textarea name="Questions[${qIndex}].AnswerText" required class="form-control"></textarea><br />`;
                    break;
                case '�U�Կ��':
                case 'select':
                    optionHtml += `<select name="Questions[${qIndex}].AnswerText" class="form-select"><option>${optionText}</option></select><br />`;
                    break;
                default:
                    optionHtml += `${modifiedOptionText}<br />`;
                    break;
            }

            // �����b��e�ﶵ�e�����M��Ϥ�
            var optionImagesHtml = '';
            $(this).find('.option-image-preview img').each(function () {
                var imgSrc = $(this).attr('src');
                var imageId = $(this).attr('data-image-id');
                var width = $(this).css('width').replace('px', '') || 200;
                var height = $(this).css('height').replace('px', '') || 200;
                optionImagesHtml += `<img src="${imgSrc}" alt="�ﶵ�Ϥ�" data-image-id="${imageId}" style="width:${width}px; height:${height}px;" /><br />`;
            });

            if (optionImagesHtml) {
                optionHtml += `<br />${optionImagesHtml}`;
            }

            optionsHtml += optionHtml;
        });

        // �����b��e���D�e�����M��Ϥ�
        var questionImagesHtml = '';
        $(this).find('.question-image-preview img').each(function () {
            var imgSrc = $(this).attr('src');
            var imageId = $(this).attr('data-image-id');
            var width = $(this).css('width').replace('px', '') || 200;
            var height = $(this).css('height').replace('px', '') || 200;
            questionImagesHtml += `<img src="${imgSrc}" alt="���D�Ϥ�" data-image-id="${imageId}" style="width:${width}px; height:${height}px;" /><br />`;
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
        `���O: ${stationName} ���ơG${questionNum}` +
        `</span></h1>` +
        `<p>${description}</p>`;

    if (surveyImagesHtml) {
        content += `<div>${surveyImagesHtml}</div>`;
    }

    content += questionsHtml;

    return content;
}

// ��s�ﶵ�y�z������żаO
function updateOptionTextWithBlanks(questionIndex, optionIndex) {
    var optionContainer = $('#option-' + questionIndex + '-' + optionIndex);
    var optionTextInput = optionContainer.find('input[name$=".QuestionOption.OptionText"]');
    var originalOptionText = optionTextInput.data('original-text') || optionTextInput.val();

    // �O�s��l���ﶵ�奻
    if (!optionTextInput.data('original-text')) {
        optionTextInput.data('original-text', originalOptionText);
    }

    var fillInBlanks = optionContainer.find('.fill-in-blank');
    var optionText = optionTextInput.data('original-text'); // ���m����l�奻

    // ������Ū����J��m�M�����
    var placeholders = [];
    fillInBlanks.each(function () {
        // �ˬd�O�_�Q�аO���R��
        if ($(this).find('input[name$=".IsDeleted"]').val() === 'true') {
            return; // ���L�w�R�������
        }
        var position = parseInt($(this).find('input[name$=".Position"]').val()) || 0;
        var blankNumber = $(this).find('h5').text().replace('��� ', '');
        placeholders.push({ position: position, placeholder: '${���' + blankNumber + '}$' });
    });

    // �����J��m�q�᩹�e�ƧǡA�קK���޿��~
    placeholders.sort(function (a, b) {
        return b.position - a.position;
    });

    // �N����Ŵ��J��ﶵ�奻��
    placeholders.forEach(function (item) {
        var pos = item.position;
        if (pos < 0) pos = 0;
        if (pos > optionText.length) pos = optionText.length;
        optionText = optionText.slice(0, pos) + item.placeholder + optionText.slice(pos);
    });

    optionTextInput.val(optionText);
    updateMceContent();
}

// ��s���D�y�z������żаO
function updateQuestionTextWithBlanks(questionIndex) {
    var questionContainer = $('#question-' + questionIndex);
    var questionTextInput = questionContainer.find('input[name$=".Question.QuestionText"]');
    var questionText = questionTextInput.val();

    // **�������D�奻���w�s�b����Ŧ����**
    questionText = questionText.replace(/\$\{���\d+\}\$/g, '');

    var fillInBlanks = questionContainer.find('#question-fill-in-blanks-' + questionIndex + ' .fill-in-blank');

    // ������Ū����J��m�M�����
    var placeholders = [];
    fillInBlanks.each(function () {
        // �ˬd�O�_�Q�аO���R��
        if ($(this).find('input[name$=".IsDeleted"]').val() === 'true') {
            return; // ���L�w�R�������
        }
        var position = parseInt($(this).find('input[name$=".Position"]').val()) || 0;
        var blankNumber = $(this).find('h5').text().replace('��� ', '');
        placeholders.push({ position: position, placeholder: '${���' + blankNumber + '}$' });
    });

    // �����J��m�q�᩹�e�ƧǡA�קK���޿��~
    placeholders.sort(function (a, b) {
        return b.position - a.position;
    });

    // �N����Ŵ��J����D�奻��
    placeholders.forEach(function (item) {
        var pos = item.position;
        if (pos < 0) pos = 0;
        if (pos > questionText.length) pos = questionText.length;
        questionText = questionText.slice(0, pos) + item.placeholder + questionText.slice(pos);
    });

    questionTextInput.val(questionText);
    updateMceContent();
}

// �N�奻��s��Ƽ��S�������@�ΰ�
window.updateMceContent = updateMceContent;
window.generateMceContent = generateMceContent;
window.updateOptionTextWithBlanks = updateOptionTextWithBlanks;
window.updateQuestionTextWithBlanks = updateQuestionTextWithBlanks;
