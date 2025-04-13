/**
 * 檔名：eventHandlers.js
 * 功能：處理事件綁定和通用實用函數
 * 創造日期：2024/11/29
 * 作者：忠訓
 */

// 刪除預覽圖片
function removePreviewImage(button) {
    var imageId = $(button).siblings('img').attr('data-image-id');
    $(button).parent().remove();
    removeImage(imageId); // 刪除圖片
}

// 同步滑桿和數字輸入框的函數
function syncInputAndRange(rangeInput) {
    var target = $(rangeInput).data('target'); // 'width' 或 'height'
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

// 將事件處理器函數暴露給全局作用域
window.removePreviewImage = removePreviewImage;
window.syncInputAndRange = syncInputAndRange;
