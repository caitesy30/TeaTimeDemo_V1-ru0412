/**
 * �ɦW�GfillInBlankManagement.js
 * �\��G�޲z��Ū��K�[�B�R���M���s����
 * �гy����G2024/11/29
 * �@�̡G���V
 */

/* ===================== ��Ŭ����\�� ===================== */

// �s�W�ﶵ��Ū����
function addFillInBlank(questionIndex, optionIndex) {
    // ��l�ƶ�ů���
    if (!window.fillInBlankIndices[questionIndex]) {
        window.fillInBlankIndices[questionIndex] = { options: {} };
    }
    if (!window.fillInBlankIndices[questionIndex].options[optionIndex]) {
        window.fillInBlankIndices[questionIndex].options[optionIndex] = 0;
    }
    var fillInBlankIndex = window.fillInBlankIndices[questionIndex].options[optionIndex];

    // �إ߷s����� HTML ���c
    var html = `
        <div class="fill-in-blank" id="fill-in-blank-${questionIndex}-${optionIndex}-${fillInBlankIndex}">
            <h5>��� ${fillInBlankIndex + 1}</h5>
            <input type="hidden" name="QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].FillInBlanks[${fillInBlankIndex}].Id" value="0" />
            <!-- �s�W IsDeleted �������A�w�]�� false -->
            <input type="hidden" name="QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].FillInBlanks[${fillInBlankIndex}].IsDeleted" value="false" />            
            <div class="mb-2">
                <label>���h��F��</label>
                <input type="text" name="QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].FillInBlanks[${fillInBlankIndex}].RegexPattern" class="form-control" />
            </div>
            <div class="mb-2">
                <label>����</label>
                <input type="number" name="QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].FillInBlanks[${fillInBlankIndex}].Length" class="form-control" value="5" oninput="updateMceContent()" />
            </div>
            <div class="mb-2">
                <label>���ܤ�r</label>
                <input type="text" name="QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].FillInBlanks[${fillInBlankIndex}].Placeholder" class="form-control" oninput="updateMceContent()" />
            </div>
            <div class="mb-2">
                <label>���J��m</label>
                <input type="number" name="QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].FillInBlanks[${fillInBlankIndex}].Position" class="form-control" oninput="updateOptionTextWithBlanks(${questionIndex}, ${optionIndex})" />
            </div>
            <button type="button" class="btn btn-danger" onclick="removeFillInBlank(${questionIndex}, ${optionIndex}, ${fillInBlankIndex}, 0)">�R�����</button>
        </div>
    `;

    // �N�s����Ť����K�[��������e����
    $('#fill-in-blanks-' + questionIndex + '-' + optionIndex).append(html);

    // ��s��ů���
    window.fillInBlankIndices[questionIndex].options[optionIndex]++;

    // **�s�W�H�U���A��s�ﶵ�奻�M�s�边���e**
    updateOptionTextWithBlanks(questionIndex, optionIndex);
    updateMceContent();
}

// �R����Ū����
function removeFillInBlank(questionIndex, optionIndex, fillInBlankIndex, fillInBlankId) {
    var fillInBlankContainer = $('#fill-in-blank-' + questionIndex + '-' + optionIndex + '-' + fillInBlankIndex);

    // �аO�Ӷ�Ŭ��R�����A
    if (fillInBlankId > 0) {
        // �p�G��Ťw�s�b���Ʈw�A�аO���R��
        fillInBlankContainer.find('input[name$=".IsDeleted"]').val('true');
    } else {
        // �p�G�O�s�K�[����šA�����q DOM ������
        fillInBlankContainer.remove();
    }

    // ���ö�Ůe��
    fillInBlankContainer.hide();

    // ��s�ﶵ�y�z�A������������żаO
    updateOptionTextWithBlanks(questionIndex, optionIndex);
    updateMceContent();
}

// �s�W���D��Ū����
function addQuestionFillInBlank(questionIndex) {
    if (!window.fillInBlankIndices[questionIndex]) {
        window.fillInBlankIndices[questionIndex] = { question: 0 };
    }
    var fillInBlankIndex = window.fillInBlankIndices[questionIndex].question;

    var html = `
        <div class="fill-in-blank" id="question-fill-in-blank-${questionIndex}-${fillInBlankIndex}">
            <h5>��� ${fillInBlankIndex + 1}</h5>
            <input type="hidden" name="QuestionVMs[${questionIndex}].FillInBlanks[${fillInBlankIndex}].Id" value="0" />
            <input type="hidden" name="QuestionVMs[${questionIndex}].FillInBlanks[${fillInBlankIndex}].IsDeleted" value="false" />
            <div class="mb-2">
                <label>���h��F��</label>
                <input type="text" name="QuestionVMs[${questionIndex}].FillInBlanks[${fillInBlankIndex}].RegexPattern" class="form-control" />
            </div>
            <div class="mb-2">
                <label>����</label>
                <input type="number" name="QuestionVMs[${questionIndex}].FillInBlanks[${fillInBlankIndex}].Length" class="form-control" value="5" oninput="updateMceContent()" />
            </div>
            <div class="mb-2">
                <label>���ܤ�r</label>
                <input type="text" name="QuestionVMs[${questionIndex}].FillInBlanks[${fillInBlankIndex}].Placeholder" class="form-control" oninput="updateMceContent()" />
            </div>
            <div class="mb-2">
                <label>���J��m</label>
                <input type="number" name="QuestionVMs[${questionIndex}].FillInBlanks[${fillInBlankIndex}].Position" class="form-control" oninput="updateQuestionTextWithBlanks(${questionIndex})" />
            </div>
            <button type="button" class="btn btn-danger" onclick="removeQuestionFillInBlank(${questionIndex}, ${fillInBlankIndex}, 0)">�R�����</button>
        </div>
    `;
    // �N�s����Ť����K�[��������e����
    $('#question-fill-in-blanks-' + questionIndex).append(html);

    // **�եέ��s���ި��**
    reindexQuestionFillInBlanks(questionIndex);
}

// �R�����D��Ū����
function removeQuestionFillInBlank(questionIndex, fillInBlankIndex, fillInBlankId) {
    var fillInBlankContainer = $('#question-fill-in-blank-' + questionIndex + '-' + fillInBlankIndex);

    // �аO�Ӷ�Ŭ��R�����A
    if (fillInBlankId > 0) {
        // �p�G��Ťw�s�b���Ʈw�A�аO���R��
        fillInBlankContainer.find('input[name$=".IsDeleted"]').val('true');
    } else {
        // �p�G�O�s�K�[����šA�����q DOM ������
        fillInBlankContainer.remove();
    }

    // ���ö�Ůe��
    fillInBlankContainer.hide();

    // �եέ��s���ި��
    reindexQuestionFillInBlanks(questionIndex);
}

// ���s��z��ů��ު����
function reindexFillInBlanks(questionIndex, optionIndex) {
    var fillInBlankContainers = $('#fill-in-blanks-' + questionIndex + '-' + optionIndex + ' .fill-in-blank');
    var newIndex = 0; // �s�����ޡA�Ω�R�W

    fillInBlankContainers.each(function () {
        // �ˬd�O�_�Q�аO���R��
        if ($(this).find('input[name$=".IsDeleted"]').val() === 'true') {
            return; // ���L�w�R�������
        }

        // ���s�]�w ID �M���D
        $(this).attr('id', 'fill-in-blank-' + questionIndex + '-' + optionIndex + '-' + newIndex);
        $(this).find('h5').text('��� ' + (newIndex + 1));

        // ���s�]�w�W���ݩ�
        $(this).find('input, select, textarea').each(function () {
            var name = $(this).attr('name');
            if (name) {
                name = name.replace(/FillInBlanks\[\d+\]/, 'FillInBlanks[' + newIndex + ']');
                $(this).attr('name', name);
            }
        });

        // ��s�R�����s�� onclick �ƥ�
        $(this).find('.btn-danger').attr('onclick', 'removeFillInBlank(' + questionIndex + ', ' + optionIndex + ', ' + newIndex + ', 0)');

        newIndex++;
    });
    window.fillInBlankIndices[questionIndex].options[optionIndex] = newIndex;
    updateOptionTextWithBlanks(questionIndex, optionIndex);
}


function reindexQuestionFillInBlanks(questionIndex) {
    var fillInBlankContainers = $('#question-fill-in-blanks-' + questionIndex + ' .fill-in-blank');
    var newIndex = 0; // �s�����ޡA�Ω�R�W

    fillInBlankContainers.each(function () {
        // �ˬd�O�_�Q�аO���R��
        var isDeleted = $(this).find('input[name$=".IsDeleted"]').val() === 'true';
        if (isDeleted) {
            // �����s���޳Q�R������šA���ݭn�O�d��W�٥H�ǻ� `IsDeleted` ��
            return;
        }

        // ���s�]�w ID �M���D
        $(this).attr('id', 'question-fill-in-blank-' + questionIndex + '-' + newIndex);
        $(this).find('h5').text('��� ' + (newIndex + 1));

        // ���s�]�w�W���ݩʡA�����L `IsDeleted` ���
        $(this).find('input, select, textarea').each(function () {
            var name = $(this).attr('name');
            if (name) {
                if (name.endsWith('.IsDeleted')) {
                    // ���L `IsDeleted` ��쪺���s�R�W
                    return;
                }
                name = name.replace(/FillInBlanks\[\d+\]/, 'FillInBlanks[' + newIndex + ']');
                $(this).attr('name', name);
            }
        });

        // ��s�R�����s�� onclick �ƥ�
        var fillInBlankId = $(this).find('input[name$=".Id"]').val() || 0;
        $(this).find('.btn-danger').attr('onclick', 'removeQuestionFillInBlank(' + questionIndex + ', ' + newIndex + ', ' + fillInBlankId + ')');

        newIndex++;
    });

    // ��s��ů���
    window.fillInBlankIndices[questionIndex].question = newIndex;

    // ��s���D�y�z�M�s�边���e
    updateQuestionTextWithBlanks(questionIndex);
}


/* ===================== ���s���޶�� ===================== */
function reindexFillInBlanks(questionIndex, optionIndex) {
    var fillInBlankContainers = $('#fill-in-blanks-' + questionIndex + '-' + optionIndex + ' .fill-in-blank');
    var newIndex = 0; // �s�����ޡA�Ω�R�W

    fillInBlankContainers.each(function (index) {
        // �ˬd�O�_�Q�аO���R��
        if ($(this).find('input[name$=".IsDeleted"]').val() === 'true') {
            return; // ���L�w�R�������
        }

        // ���s�]�w ID �M���D
        $(this).attr('id', 'fill-in-blank-' + questionIndex + '-' + optionIndex + '-' + newIndex);
        $(this).find('h5').text('��� ' + (newIndex + 1));

        // ���s�]�w�W���ݩ�
        $(this).find('input, select, textarea').each(function () {
            var name = $(this).attr('name');
            if (name) {
                name = name.replace(/FillInBlanks\[\d+\]/, 'FillInBlanks[' + newIndex + ']');
                $(this).attr('name', name);
            }
        });

        // ��s�R�����s�� onclick �ƥ�
        $(this).find('.btn-danger').attr('onclick', 'removeFillInBlank(' + questionIndex + ', ' + optionIndex + ', ' + newIndex + ', 0)');

        newIndex++;
    });
    window.fillInBlankIndices[questionIndex][optionIndex] = newIndex;
    updateOptionTextWithBlanks(questionIndex, optionIndex);
}


// �N��ź޲z��Ƽ��S�������@�ΰ�
window.addFillInBlank = addFillInBlank;
window.removeFillInBlank = removeFillInBlank;
window.addQuestionFillInBlank = addQuestionFillInBlank;
window.removeQuestionFillInBlank = removeQuestionFillInBlank;
window.reindexFillInBlanks = reindexFillInBlanks;
window.reindexQuestionFillInBlanks = reindexQuestionFillInBlanks;
