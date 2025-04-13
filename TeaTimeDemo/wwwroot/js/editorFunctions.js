/********************************************/
/* editorFunctions.js                       */
/* 包含與標籤編輯、TinyMCE 初始化等功能     */
/********************************************/


//editorFunctionsMgr.LabelTextEditEvent

class editorFunctionsMgr{

    /**
    * 編輯標籤的核心函式
    * @param {HTMLElement} labelElement - 被雙擊的 label 元素
    */

    static LabelTextEditEvent(event) {

        var TargetModuleBlock =  ModuleDataFetcherMgr.GetTargetModuleBlock(event.target)

        var labelElement = ModuleDataFetcherMgr.GetTargetModuleBlock_TextBoxLabel(TargetModuleBlock);
      

        editorFunctionsMgr.LabelTextEdit(labelElement);
    }
    
    static LabelTextEdit(labelElement) {
        // 將當前 label 元素存到全域變數
        block.removeBox();
        LabelTextEditMgr_labelElement = labelElement;
        if (LabelTextEditMgr_labelElement) {
            // 檢查 <label> 內是否已包含 <div>
            divElement = LabelTextEditMgr_labelElement.querySelector("div");
            if (!divElement) {
                // 若無 <div>，則新增一個
                divElement = document.createElement("div");
                LabelTextEditMgr_labelElement.appendChild(divElement);
                divElement = LabelTextEditMgr_labelElement.querySelector("div");
            }
            // 呼叫開啟編輯模態視窗函式
            editorFunctionsMgr.openEditModal();
        } else {
            console.error("LabelTextEditMgr_labelElement 為空或未定義");
            }
        }
    
    
    /**
     * 將新的 HTML 內容設置到 divElement
     * @param {string} HtmlText - 要插入的 HTML
     */
    static setDivElementInnerHTML(HtmlText) {
    // 確保 divElement 與 _labelElement 存在
    if (!divElement || !LabelTextEditMgr_labelElement) {
        console.error("divElement 或 _labelElement 未定義");
        return;
    }

    try {
        // 先移除 divElement，避免清空時被影響
        var tempDiv = divElement;
        LabelTextEditMgr_labelElement.removeChild(divElement);
        //tempDiv.style.height = "100%";
        //tempDiv.style.width = "100%";
        // 將 label 的文字清空
        LabelTextEditMgr_labelElement.innerText = "";

        // 檢查傳入的 HtmlText 是否為有效字串
        if (HtmlText && typeof HtmlText === "string" && HtmlText.trim() !== "") {
            console.log("設定內容:", HtmlText.trim());
            tempDiv.innerHTML = HtmlText.trim();
            LabelTextEditMgr_labelElement.style.fontSize = "";
            

            // ModuleBlock_Main.GetSelectTarget().classList.remove(ModuleBlock_GridSetMgr.InGridCanRemoveModuleBlockName);

        } else {
            // 若無效，顯示提示文字
            //_labelElement.innerText = "請編輯文字";
            tempDiv.innerHTML = "";
            LabelTextEditMgr_labelElement.style.fontSize = "0px";
        }

        // 將處理後的 tempDiv 再次加入 label 中
        LabelTextEditMgr_labelElement.appendChild(tempDiv);

    } catch (error) {
        console.error("設定 divElement.innerHTML 時發生錯誤:", error);
    }
}
    
    /**
     * 開啟編輯模態視窗，並於顯示後初始化或載入 TinyMCE
     */
    static openEditModal() {
    // 取得當前 divElement 的內容
    var currentContent = divElement.innerHTML || "";
    //currentContent = `<div>${currentContent}</div>`
    // 顯示 Bootstrap 模態視窗
    var editModalEl = document.getElementById('editTextModal');
    //var editModal = new bootstrap.Modal(editModalEl,{
    //    keyboard: false
    //});
    var editModal = new bootstrap.Modal(editModalEl, {
        backdrop: false
    });
  
    editModal.show();
    dialogTabEventsMgr.resetToDefaultSize();
    dialogTabEventsMgr.openInit();
    // 等到模態視窗真的顯示後，再初始化 TinyMCE
    editModalEl.addEventListener('shown.bs.modal', function () {

        // 若 tinymce 尚未初始化，則初始化
        if (!tinymce.get('textEditor')) {
            tinymce.init({
                selector: '#textEditor',
                api_key: 'bd4kr41e6ze0pbf2aykxdz4hsbpnedbrhpjj227b6za85wou',
                plugins: 'advlist autolink lists link  charmap preview code image',
                toolbar: 'undo redo | bold italic backcolor  |  image |alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat|  code',
                height: 400,                // 設定編輯器高度           
                readonly: false,            // 設為可編輯
                file_picker_types: 'image', // 僅開啟圖片檔案挑選
                image_dimensions: true,     // 可調整圖片大小
                extended_valid_elements: 'img[src|alt|width|height|style|title]',
                content_style: "body { line-height: 1; }",
                // 設定僅允許 8pt、10pt、12pt 三個字體大小選項
                fontsize_formats: "8pt 10pt 12pt",
                forced_root_block: 'div', // 新增此行，將根元素設為無
                //force_br_newlines: true,    // 強制以 <br> 處理換行
                //force_p_newlines: false,    // 禁止自動產生 <p> 標籤
                setup: function (editor) {
                    editor.on('init', function () {
                        console.log('TinyMCE 初始化完成');
                        editor.setContent(currentContent);
                    });

                  

                    // ★★ 新增：監聽雙擊事件 ★★
                    editor.on('DblClick', function (e) {
                        let target = e.target;
                        // 檢查是否為 <input>，且帶有 pattern 屬性
                        if (target && target.nodeName === 'INPUT' && target.hasAttribute('pattern')) {
                            // 1. 取得該 <input> 的相關資訊
                            let pattern = target.getAttribute('pattern') || "";
                            let placeholder = target.getAttribute('placeholder') || "";
                            let styleAttr = target.getAttribute('style') || "";

                            // 2. 解析 style (寬度)
                            let match = styleAttr.match(/width\s*:\s*(\d+)px/i);
                            let fillSize = (match && match[1]) ? match[1] : "";

                            // 3. 記錄被點擊的 input
                            window.currentClickedInput = target;

                            // 4. 帶入「插入填空」表單
                            document.getElementById('fillRegex').value = pattern;
                            document.getElementById('fillPrompt').value = placeholder;
                            document.getElementById('fillSize').value = fillSize;

                            // 5. 顯示「插入填空」表單
                            fillFunctionsMgr.toggleInsertFillSection(true);
                        }
                    });
                },
                // 攔截圖片檔案上傳流程，轉成 Base64
                file_picker_callback: function (callback, value, meta) {
                    if (meta.filetype === 'image') {
                        var input = document.createElement('input');
                        input.setAttribute('type', 'file');
                        input.setAttribute('accept', 'image/*');

                        input.onchange = function () {
                            var file = this.files[0];
                            var reader = new FileReader();

                            // 檢查檔案格式
                            var allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                            if (!allowedTypes.includes(file.type)) {
                                alert('上傳失敗：只允許 .jpg, .png, .gif, .webp 圖片');
                                return;
                            }

                            // 檔案大小限制 5MB (可依需求調整)
                            var maxSizeInBytes = 5 * 1024 * 1024;
                            if (file.size > maxSizeInBytes) {
                                alert('上傳失敗：檔案過大，限制 5MB。');
                                return;
                            }

                            // 讀取檔案，轉成 Base64
                            reader.onload = function () {
                                var base64 = reader.result;
                                callback(base64, {
                                    title: file.name,
                                    alt: file.name
                                });
                            };
                            reader.readAsDataURL(file);
                        };
                        input.click();
                    }
                }
            });



        } else {
            // 如果已經初始化過 tinymce，直接更新內容
            tinymce.get('textEditor').setContent(currentContent);
        }
    }, { once: true });
}


}
