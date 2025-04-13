/********************************************/
/* divFunctions.js                         */
/* 負責顯示切換的相關函式                   */
/********************************************/


class divFunctionsMgr{
    /**
 * 切換是否在編輯器內容外層加上一個 <div></div>
 */
static toggleDivWrap() {
    // 取得 TinyMCE 實例
    let editor = tinymce.get('textEditor');
    if (!editor) return;

    // 取得目前編輯器內容
    let content = editor.getContent();

    // 建立判斷是否已被 <div>...</div> 包覆的正規表示式
    // ^<div>([\s\S]*?)<\/div>$ ：表示整個字串是由 <div> 開頭、</div> 結尾
    const divRegex = /^<div>([\s\S]*?)<\/div>$/;

    // 檢查內容是否匹配上 divRegex
    let match = content.match(divRegex);

    if (!match) {
        // 情況一：目前內容沒有被 <div>...</div> 包起來
        // -> 幫它包上一層 <div>
        content = `<div>${content}</div>`;
    } else {
        // 情況二：已經被 <div>...</div> 包起來
        // -> 將外層 <div> 和 </div> 移除 (保留中間內容)
        content = match[1]; // match[1] 即為 <div>...</div> 中間的內容
    }

    // 將更新後的內容重新放回編輯器
    editor.setContent(content);
}

}

