/**
 * �ɦW�GoptionManagement.js
 * �\��G�޲z�ﶵ���K�[�B�R���M���s����
 * �гy����G2024/11/29
 * �@�̡G���V
 */

// �s�W�ﶵ�����
function addOption(questionIndex) {
    if (!window.optionsIndices[questionIndex]) {
        window.optionsIndices[questionIndex] = 0;
    }
    var optionIndex = window.optionsIndices[questionIndex];
    var optionHtml = `
        <div class="mb-2 option-container" id="option-${questionIndex}-${optionIndex}">
            <input type="hidden" name="QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].QuestionOption.Id" value="0" />
            <label class="form-label">�ﶵ ${optionIndex + 1}</label>
            <input name="QuestionVMs[${questionIndex}].QuestionOptionVMs[${optionIndex}].QuestionOption.OptionText" class="form-control" oninput="updateMceContent()" />
            <button type="button" class="btn btn-danger" onclick="removeOption(${questionIndex}, ${optionIndex}, 0)">�R���ﶵ</button>
            <div class="mb-3">
                <label class="form-label">�W�ǿﶵ�Ϥ�</label>
                <div id="option-image-upload-container-${questionIndex}-${optionIndex}">
                    <!-- ��l����ܹϤ��W����� -->
                </div>
                <button type="button" class="btn btn-primary" onclick="addOptionImageUploadField(${questionIndex}, ${optionIndex})">�s�W�Ϥ�+</button>
                <span class="text-danger"></span>
            </div>
            <!-- �ﶵ�Ϥ��w���ϰ� -->
            <div class="mb-3 option-image-preview" id="option-image-preview-${questionIndex}-${optionIndex}">
                <!-- �s�W���ﶵ�Ϥ��|�b�o�̹w�� -->
            </div>

            <!-- ��Ŭ����\�� -->
            <div class="mb-3">
                <label class="form-label">���</label>
                <div id="fill-in-blanks-${questionIndex}-${optionIndex}">
                    <!-- ��Ŷ��ط|�b�o�̷s�W -->
                </div>
                <button type="button" class="btn btn-secondary" onclick="addFillInBlank(${questionIndex}, ${optionIndex})">�s�W���+</button>
            </div>
            
        </div>`;
    $(`#options-${questionIndex}`).append(optionHtml);
    window.optionsIndices[questionIndex]++;
    updateMceContent();
}

// �R���ﶵ�����
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
                toastr.error('�R���ﶵ�ɵo�Ϳ��~');
            }
        });
    } else {
        $(`#option-${questionIndex}-${optionIndex}`).remove();
        reindexOptions(questionIndex);
        updateMceContent();
    }
}

// ���s��z�ﶵ���ު����
function reindexOptions(questionIndex) {
    var optionContainers = $(`#options-${questionIndex} .option-container`);
    optionContainers.each(function (index) {
        $(this).attr('id', `option-${questionIndex}-${index}`);
        $(this).find('.form-label').text(`�ﶵ ${index + 1}`);
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

// �N�ﶵ�޲z��Ƽ��S�������@�ΰ�
window.addOption = addOption;
window.removeOption = removeOption;
window.reindexOptions = reindexOptions;
