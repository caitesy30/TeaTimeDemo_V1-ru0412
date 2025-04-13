/**
 * �ɦW�GquestionManagement.js
 * �\��G�޲z���D���K�[�B�R���M���s����
 * �гy����G2024/11/29
 * �@�̡G���V
 */

// �s�W���D�����
function addQuestion() {
    var questionHtml = `
        <div class="border p-2 my-3 question-container" id="question-${window.questionIndex}">
            <h4>���D ${window.questionIndex + 1}</h4>
            <input type="hidden" name="QuestionVMs[${window.questionIndex}].Question.Id" value="0" />
            <div class="mb-3">
                <label class="form-label">���D�y�z</label>
                <input name="QuestionVMs[${window.questionIndex}].Question.QuestionText" class="form-control" oninput="updateMceContent()" />
            </div>
            <div class="mb-3">
                <label class="form-label">���D����</label>
                <select name="QuestionVMs[${window.questionIndex}].Question.AnswerType" class="form-select" onchange="updateMceContent()">
                    ${generateQuestionTypeOptions()}
                </select>
            </div>

            <!-- �{�����D�Ϥ����� -->
            <div class="mb-3">
                <label class="form-label">�{�����D�Ϥ�</label>
            </div>

            <!-- ���D�Ϥ��w���ϰ� -->
            <div class="mb-3 question-image-preview" id="question-image-preview-${window.questionIndex}">
                <!-- �s�W�����D�Ϥ��|�b�o�̹w�� -->
            </div>
            <div class="mb-3">
                <label class="form-label">�W�ǰ��D�Ϥ�</label>
                <div id="question-image-upload-container-${window.questionIndex}">
                    <!-- ��l����ܹϤ��W����� -->
                </div>
                <button type="button" class="btn btn-primary" onclick="addQuestionImageUploadField(${window.questionIndex})">�s�W�Ϥ�+</button>
                <span class="text-danger"></span>
            </div>

            <!-- �{���ﶵ�Ϥ����� -->
            <div class="mb-3">
                <label class="form-label">�{���ﶵ�Ϥ�</label>
            </div>

            <!-- �ﶵ��ܰϰ� -->
            <div id="options-${window.questionIndex}">
                <!-- �w�]�S���ﶵ�A�ϥΪ̥i�H�I�����s�s�W -->
            </div>
            <button type="button" class="btn btn-primary" onclick="addOption(${window.questionIndex})">�s�W�ﶵ</button>
            <button type="button" class="btn btn-danger mt-2" onclick="removeQuestion(${window.questionIndex}, 0)">�R�����D</button>
        </div>`;
    $('#questions').append(questionHtml);
    window.questionIndex++;

    // ��l�ƿﶵ����
    window.optionsIndices[window.questionIndex - 1] = 0;

    // ��s TinyMCE �s�边�����e
    updateMceContent();
}

// �ͦ����D�������ﶵ HTML
function generateQuestionTypeOptions() {
    var questionTypeList = window.initialData.questionTypeList;
    var options = '';
    questionTypeList.forEach(function (type) {
        options += `<option value="${type.Value}">${type.Text}</option>`;
    });
    return options;
}

// �R�����D�����
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
                toastr.error('�R�����D�ɵo�Ϳ��~');
            }
        });
    } else {
        $('#question-' + index).remove();
        reindexQuestions();
        updateMceContent();
    }
}

// ���s��z���D���ު����
function reindexQuestions() {
    $('#questions .question-container').each(function (index) {
        $(this).attr('id', `question-${index}`);
        $(this).find('h4').text(`���D ${index + 1}`);
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

// �N���D�޲z��Ƽ��S�������@�ΰ�
window.addQuestion = addQuestion;
window.removeQuestion = removeQuestion;
window.reindexQuestions = reindexQuestions;
