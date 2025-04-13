/**
 * �ɦW�GeventHandlers.js
 * �\��G�B�z�ƥ�j�w�M�q�ι�Ψ��
 * �гy����G2024/11/29
 * �@�̡G���V
 */

// �R���w���Ϥ�
function removePreviewImage(button) {
    var imageId = $(button).siblings('img').attr('data-image-id');
    $(button).parent().remove();
    removeImage(imageId); // �R���Ϥ�
}

// �P�B�Ʊ�M�Ʀr��J�ت����
function syncInputAndRange(rangeInput) {
    var target = $(rangeInput).data('target'); // 'width' �� 'height'
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

// �N�ƥ�B�z����Ƽ��S�������@�ΰ�
window.removePreviewImage = removePreviewImage;
window.syncInputAndRange = syncInputAndRange;
