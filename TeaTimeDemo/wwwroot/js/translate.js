
///
//$('#myId');          // 選擇 ID 為 "myId" 的元素
//$('.myClass');       // 選擇類別為 "myClass" 的所有元素
//$('div');            // 選擇所有 <div> 元素
//$('input[type="text"]'); // 選擇所有 type 為 "text" 的 input 元素

import i18n from './i18n/i18n';
$(document).ready(function () {

    //初始顯示語言    
    i18n.on("loaded", () => {
        $('body').localize();
    });
    $('.language-option').on('click', function (e) {
        e.preventDefault();
        const lang = $(this).data('lang');
        i18next.changeLanguage(selectedLang, () => {
            $('body').localize();
        });
    });
});
