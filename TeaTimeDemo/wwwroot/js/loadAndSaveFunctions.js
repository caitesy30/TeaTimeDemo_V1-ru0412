/********************************************/
/* loadAndSaveFunctions.js                  */
/* 負責載入文本、保存文本等相關功能         */
/********************************************/



class loadAndSaveFunctionsMgr
{    

/**
 * 載入文本內容的函式 (需自行實作 AJAX / fetch 取得後端資料)
 */
    static loadTextContent() {
    // 範例：使用 alert 提示，目前尚未實作
    alert('載入功能尚未實作。');
    // 若要實作，可使用以下方式:
    // try {
    //     // 1. 用 fetch 或 $.ajax() 跟後端 API 取得內容
    //     // 2. 取得後，tinymce.get('textEditor').setContent(後端回傳內容)
    // } catch (error) {
    //     console.error("載入文本時發生錯誤:", error);
    //     alert("載入文本時發生錯誤，請稍後再試。");
    // }
    }


    /**
     * 使用全域替換方式，移除所有 <p> 與 </p> 標籤
     * @param {string} html - 原始 HTML 字串
     * @returns {string} - 移除所有 <p> 標籤之後的內容
     */
    static removePTags(html) {
        // 使用正規表示式將所有 <p> 標籤與其屬性移除，並去除前後空白
        return html.replace(/<\/?p[^>]*>/gi, '').trim();
    }

    static resetTags(html) {
        // 创建一个 DOMParser 实例
        const parser = new DOMParser();

        // 解析 HTML 字符串为文档对象
        const doc = parser.parseFromString(html, 'text/html');

        // 获取文档的最外层标签
        const rootElement = doc.body.firstElementChild;

        // 检查是否有最外层标签
        if (rootElement) {
            // 设置最外层标签的样式
            rootElement.style.width = '100%';
            rootElement.style.height = '100%';
        }

        // 返回修改后的 HTML 字符串
        return doc.body.innerHTML;
    }




/**
 * 保存文本編輯的變更
 */
static saveTextChanges() {
    // 從 tinymce 中獲取當前編輯的內容 
    let updatedText = tinymce.get('textEditor').getContent();

    // 呼叫函式去除首尾的 <p> 標籤
    updatedText = this.resetTags(updatedText);
    //console.log(updatedText);

    // 呼叫 setDivElementInnerHTML，將內容放回對應的 label 中
    editorFunctionsMgr.setDivElementInnerHTML(updatedText);

    // 若 tinymce 已初始化，則銷燬實例以釋放資源
    if (tinymce.get('textEditor')) {
        tinymce.get('textEditor').remove();
    }

    // 關閉模態視窗
    var editModalEl = document.getElementById('editTextModal');
    var editModal = bootstrap.Modal.getInstance(editModalEl);
    editModal.hide();

    /*
    // 範例：若要保存到後端，可使用 AJAX / fetch
    // try {
    //     $.ajax({
    //         url: '/Customer/SurveyEdit/UpdateModuleText',
    //         type: 'POST',
    //         data: {
    //             moduleId: currentEditingModuleId,
    //             textContent: updatedText
    //         },
    //         success: function (response) {
    //             alert("文本已保存。");
    //         },
    //         error: function (error) {
    //             alert("保存文本時發生錯誤。");
    //         }
    //     });
    // } catch (error) {
    //     console.error("保存文本時發生錯誤:", error);
    //     alert("保存文本時發生錯誤，請稍後再試。");
    // }
    */
    }
  }
