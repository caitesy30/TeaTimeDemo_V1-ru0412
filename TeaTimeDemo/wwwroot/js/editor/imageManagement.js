/**
 * �ɦW�GimageManagement.js
 * �\��G�B�z�Ϥ��W�ǡB�w���M�ؤo�վ�
 * �гy����G2024/11/29
 * �@�̡G���V
 */

// ��l�� TinyMCE �s�边
function initializeTinyMCE() {
    tinymce.init({
        selector: '#editor',
        api_key: 'bd4kr41e6ze0pbf2aykxdz4hsbpnedbrhpjj227b6za85wou', // �������z�� API ���_
        plugins: 'advlist autolink lists link image charmap preview anchor code table',
        toolbar: 'undo redo | formatselect | bold italic backcolor | code | table | image | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
        height: '100%', // �]�m�s�边���׬� 100%
        image_dimensions: true, // �ҥιϤ��ؤo�վ�
        image_advtab: true, // �ҥζi���Ϥ��ﶵ
        extended_valid_elements: 'img[src|alt|data-image-id|width|height|style|class]', // ���\ img ���ҥ]�t data-image-id �ݩ�
        valid_styles: {
            'img': 'width,height'
        },
        setup: function (editor) {
            // ��s�边��l�Ʈɳ]�w���e
            editor.on('init', function () {
                var initialContent = $('#MceHtml').val();
                editor.setContent(initialContent);

                // �p�G��l���e���šA�q������ͦ����e�ó]�m��s�边
                if (initialContent.trim() === "") {
                    updateMceContent();
                } else {
                    // ��s�s�边�����Ϥ��A�K�[ data-image-id �ݩ�
                    updateEditorImages();
                }
            });

            // ���e���ܮɡA�P�B��s���ê� MceHtml ���
            editor.on('change keyup', function () {
                tinymce.triggerSave();
                $('#MceHtml').val(editor.getContent());
            });

            // ��Ϥ��Q�վ�j�p�ɡA��s������檺�e�שM����
            editor.on('ObjectResized', function (e) {
                var img = e.target;
                if (img.tagName.toLowerCase() === 'img') {
                    var imageId = img.getAttribute('data-image-id');
                    var width = e.width;   // ���o�վ�᪺�e�ס]�Ʀr�^
                    var height = e.height; // ���o�վ�᪺���ס]�Ʀr�^

                    // ��s�����檺��J���
                    updateImageDimensionsInForm(imageId, width, height);
                }
            });
        },
        content_style: "body { font-size:14px; }", // �ھڻݭn�վ�s�边�����r��j�p
        image_class_list: [
            { title: 'None', value: '' },
            { title: 'Responsive', value: 'img-responsive' }
        ],
        image_title: true,
        automatic_uploads: true,

        // �ۭq�Ϥ��W�ǳB�z���A��^ Promise
        images_upload_handler: function (blobInfo) {
            return new Promise(function (resolve, reject) {
                // �إ� FormData ����
                var formData = new FormData();
                formData.append('image', blobInfo.blob(), blobInfo.filename());

                // �o�e AJAX �ШD�ܹϤ��W�Ǫ� API
                $.ajax({
                    url: '/admin/survey/uploadimage',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        if (response.success) {
                            // �ϥΫ�ݪ�^���Ϥ� URL
                            resolve(response.imageUrl);
                        } else {
                            reject(response.message || '�Ϥ��W�ǥ��ѡC');
                        }
                    },
                    error: function () {
                        reject('�Ϥ��W�ǥ��ѡC');
                    }
                });
            });
        }
    });
}

// ��s�s�边�����Ϥ��A�K�[ data-image-id �ݩ�
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

// ���U��k�G���W�ƹϤ� URL�A�u�O�d�۹���|����
function normalizeImageUrl(url) {
    var link = document.createElement('a');
    link.href = url;
    return link.pathname;
}

// ��s�Ϥ��ؤo�æP�B��s�边
function updateImageSize(imageInput) {
    var imageGroup = $(imageInput).closest('.image-upload-group');
    var imgElement = imageGroup.find('img');
    var imageId = imgElement.attr('data-image-id');

    // ���]�Ĥ@�ӼƦr��J���O�e�סA�ĤG�ӬO����
    var widthInput = imageGroup.find('input[type="number"]').eq(0);
    var heightInput = imageGroup.find('input[type="number"]').eq(1);

    var newWidth = widthInput.val();
    var newHeight = heightInput.val();


    // ��s�Ϥ��w�����ؤo
    imgElement.css({
        'width': newWidth + 'px',
        'height': newHeight + 'px'
    });

    // �P�B��s TinyMCE �s�边�����Ϥ��ؤo
    updateImageSizeInEditor(imageId, newWidth, newHeight);
}

// ��s TinyMCE �s�边�����Ϥ��ؤo
function updateImageSizeInEditor(imageId, newWidth, newHeight) {
    var editor = tinymce.get('editor');

    // �ϥ� console.log �Ӻʵ��ܼƪ���
    console.log('imageId: ' + imageId + '\nnewWidth: ' + newWidth + '\nnewHeight: ' + newHeight);

    // �ϥ� data-image-id ����Ϥ�
    var img = editor.dom.select('img[data-image-id="' + imageId + '"]')[0];

    if (img) {
        if (newWidth !== null && newWidth !== undefined && newWidth !== '') {
            img.style.width = newWidth + 'px';
        }
        if (newHeight !== null && newHeight !== undefined && newHeight !== '') {
            img.style.height = newHeight + 'px';
        }

        // �q���s�边���e�w���
        editor.nodeChanged();

        // �P�B��s���ê� MceHtml ���
        $('#MceHtml').val(editor.getContent());
    } else {
        console.log('TinyMCE �s�边������� ID �� ' + imageId + ' ���Ϥ��C');
    }
}

// �N�Ϥ��޲z��Ƽ��S�������@�ΰ�
window.initializeTinyMCE = initializeTinyMCE;
window.updateEditorImages = updateEditorImages;
window.normalizeImageUrl = normalizeImageUrl;
window.updateImageSize = updateImageSize;
window.updateImageSizeInEditor = updateImageSizeInEditor;
