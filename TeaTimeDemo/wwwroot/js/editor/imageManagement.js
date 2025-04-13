/**
 * 檔名：imageManagement.js
 * 功能：處理圖片上傳、預覽和尺寸調整
 * 創造日期：2024/11/29
 * 作者：忠訓
 */

// 初始化 TinyMCE 編輯器
function initializeTinyMCE() {
    tinymce.init({
        selector: '#editor',
        api_key: 'bd4kr41e6ze0pbf2aykxdz4hsbpnedbrhpjj227b6za85wou', // 替換為您的 API 金鑰
        plugins: 'advlist autolink lists link image charmap preview anchor code table',
        toolbar: 'undo redo | formatselect | bold italic backcolor | code | table | image | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
        height: '100%', // 設置編輯器高度為 100%
        image_dimensions: true, // 啟用圖片尺寸調整
        image_advtab: true, // 啟用進階圖片選項
        extended_valid_elements: 'img[src|alt|data-image-id|width|height|style|class]', // 允許 img 標籤包含 data-image-id 屬性
        valid_styles: {
            'img': 'width,height'
        },
        setup: function (editor) {
            // 當編輯器初始化時設定內容
            editor.on('init', function () {
                var initialContent = $('#MceHtml').val();
                editor.setContent(initialContent);

                // 如果初始內容為空，從表單欄位生成內容並設置到編輯器
                if (initialContent.trim() === "") {
                    updateMceContent();
                } else {
                    // 更新編輯器中的圖片，添加 data-image-id 屬性
                    updateEditorImages();
                }
            });

            // 當內容改變時，同步更新隱藏的 MceHtml 欄位
            editor.on('change keyup', function () {
                tinymce.triggerSave();
                $('#MceHtml').val(editor.getContent());
            });

            // 當圖片被調整大小時，更新左側表單的寬度和高度
            editor.on('ObjectResized', function (e) {
                var img = e.target;
                if (img.tagName.toLowerCase() === 'img') {
                    var imageId = img.getAttribute('data-image-id');
                    var width = e.width;   // 取得調整後的寬度（數字）
                    var height = e.height; // 取得調整後的高度（數字）

                    // 更新左邊表單的輸入欄位
                    updateImageDimensionsInForm(imageId, width, height);
                }
            });
        },
        content_style: "body { font-size:14px; }", // 根據需要調整編輯器內的字體大小
        image_class_list: [
            { title: 'None', value: '' },
            { title: 'Responsive', value: 'img-responsive' }
        ],
        image_title: true,
        automatic_uploads: true,

        // 自訂圖片上傳處理器，返回 Promise
        images_upload_handler: function (blobInfo) {
            return new Promise(function (resolve, reject) {
                // 建立 FormData 物件
                var formData = new FormData();
                formData.append('image', blobInfo.blob(), blobInfo.filename());

                // 發送 AJAX 請求至圖片上傳的 API
                $.ajax({
                    url: '/admin/survey/uploadimage',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        if (response.success) {
                            // 使用後端返回的圖片 URL
                            resolve(response.imageUrl);
                        } else {
                            reject(response.message || '圖片上傳失敗。');
                        }
                    },
                    error: function () {
                        reject('圖片上傳失敗。');
                    }
                });
            });
        }
    });
}

// 更新編輯器中的圖片，添加 data-image-id 屬性
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

// 輔助方法：正規化圖片 URL，只保留相對路徑部分
function normalizeImageUrl(url) {
    var link = document.createElement('a');
    link.href = url;
    return link.pathname;
}

// 更新圖片尺寸並同步到編輯器
function updateImageSize(imageInput) {
    var imageGroup = $(imageInput).closest('.image-upload-group');
    var imgElement = imageGroup.find('img');
    var imageId = imgElement.attr('data-image-id');

    // 假設第一個數字輸入欄位是寬度，第二個是高度
    var widthInput = imageGroup.find('input[type="number"]').eq(0);
    var heightInput = imageGroup.find('input[type="number"]').eq(1);

    var newWidth = widthInput.val();
    var newHeight = heightInput.val();


    // 更新圖片預覽的尺寸
    imgElement.css({
        'width': newWidth + 'px',
        'height': newHeight + 'px'
    });

    // 同步更新 TinyMCE 編輯器中的圖片尺寸
    updateImageSizeInEditor(imageId, newWidth, newHeight);
}

// 更新 TinyMCE 編輯器中的圖片尺寸
function updateImageSizeInEditor(imageId, newWidth, newHeight) {
    var editor = tinymce.get('editor');

    // 使用 console.log 來監視變數的值
    console.log('imageId: ' + imageId + '\nnewWidth: ' + newWidth + '\nnewHeight: ' + newHeight);

    // 使用 data-image-id 選取圖片
    var img = editor.dom.select('img[data-image-id="' + imageId + '"]')[0];

    if (img) {
        if (newWidth !== null && newWidth !== undefined && newWidth !== '') {
            img.style.width = newWidth + 'px';
        }
        if (newHeight !== null && newHeight !== undefined && newHeight !== '') {
            img.style.height = newHeight + 'px';
        }

        // 通知編輯器內容已更改
        editor.nodeChanged();

        // 同步更新隱藏的 MceHtml 欄位
        $('#MceHtml').val(editor.getContent());
    } else {
        console.log('TinyMCE 編輯器中未找到 ID 為 ' + imageId + ' 的圖片。');
    }
}

// 將圖片管理函數暴露給全局作用域
window.initializeTinyMCE = initializeTinyMCE;
window.updateEditorImages = updateEditorImages;
window.normalizeImageUrl = normalizeImageUrl;
window.updateImageSize = updateImageSize;
window.updateImageSizeInEditor = updateImageSizeInEditor;
