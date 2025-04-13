/********************************************/
/* fillFunctions.js                         */
/* 負責插入填空的相關函式                   */
/********************************************/

// fillFunctions.js

class fillFunctionsMgr{
static init() {
        const regexPresetMap = {
            "1": {
                pattern: "^[0-9]{5}$",
                example: "工號 (ex:22503)",
                defaultSize: 97      // 工號
            },
            "2": {
                pattern: "^[A-Z0-9]{6,10}$",
                example: "料號 (ex:A58G100)",
                defaultSize: 115     // 料號
            },
            "3": {
                pattern: "^\\d{4}\\-\\d{2}\\-\\d{2}$",
                example: "日期 (ex:2023-08-15)",
                defaultSize: 130     // 日期
            },
            "4": {
                pattern: "^[\\u4e00-\\u9fa5_a-zA-Z0-9]{2,}$",
                example: "姓名 (ex:至少2碼)",
                defaultSize: 105     // 姓名
            },
            "5": {
                pattern: "^[1-9]\\d*(\\.\\d+)?$",
                example: "漲縮 (ex:1.00015)",
                defaultSize: 105     // 漲縮
            },
            "6": {
                pattern: "^[\\u4e00-\\u9fa5]{2,}$",
                example: "顏色 (ex:紅色)",
                defaultSize: 80     // 顏色
            }
        };

        // 綁定下拉選單事件 (可放在 $(document).ready(...) 或適當位置)
        document.getElementById('predefinedRegexSelect').addEventListener('change', function () {
            const selectedPattern = this.value; // 下拉選到的「正則字串」
            if (selectedPattern) {
                // 從對應表中找出中文範例
                const exampleText = regexPresetMap[selectedPattern] || "";

                if (exampleText) {
                    // 帶入 fillRegex 與 fillPrompt 欄位
                    document.getElementById('fillRegex').value = exampleText.pattern;
                    document.getElementById('fillPrompt').value = exampleText.example;
                    document.getElementById('fillSize').value = exampleText.defaultSize;

                }
            }
        });
    }

/**
 * 插入填空欄位的核心函式
 */
static updateOrInsertFillField() {
    const regex = document.getElementById('fillRegex').value.trim();
    const prompt = document.getElementById('fillPrompt').value.trim();
    const size = document.getElementById('fillSize').value.trim();

    // (1) 從 fillPrompt 中抓到中文範例 (可能剛由下拉選)
    //     這裡假設 fillPrompt 就是「工號 (e.g. 22503)」等等
    //     也可改把中文範例另存在 dataExample 變數
    //     依您需求而定
    const dataExample = prompt;

    const editor = tinymce.get('textEditor');
    if (!editor) return;

    // 如果存在 currentClickedInput，代表要更新
    if (window.currentClickedInput) {
        const tinymceDom = editor.dom; // tinymce 的 dom API

        window.currentClickedInput.setAttribute('pattern', regex);
        window.currentClickedInput.setAttribute('placeholder', prompt);
        window.currentClickedInput.setAttribute('data-example', dataExample);

        tinymceDom.setStyle(window.currentClickedInput, 'width', size + 'px');
        tinymceDom.setStyle(window.currentClickedInput, 'height', '17px');

        //window.currentClickedInput.style.width = size + 'px';
        // 若需要高度，也可以:
        // window.currentClickedInput.style.height = '17px';

        window.currentClickedInput = null;
    } else {
        // 全新插入
        const newHtml = `<input type="text" 
                                pattern="${regex}" 
                                placeholder="${prompt}"
                                data-example="${dataExample}" 
                                style="width:${size}px;height:16px" />`;
        editor.execCommand('mceInsertContent', false, newHtml);
    }

    // 關閉插入面板
    fillFunctionsMgr.toggleInsertFillSection(false);
    document.getElementById('insertFillForm').reset();
}

/**
 * 切換插入填空表單的顯示與隱藏
 * @param {boolean} show - true代表顯示，false代表隱藏
 */
static toggleInsertFillSection(show) {
    var insertFillSection = document.querySelector('.insert-fill-section');
    var dialog = document.querySelector('.custom-modal-dialog');
    if (show) {
        // 顯示填空表單，並把對話框拉大
        insertFillSection.style.display = 'block';
        dialog.classList.add('enlarged');
    } else {
        // 隱藏填空表單，並把對話框還原
        insertFillSection.style.display = 'none';
        dialog.classList.remove('enlarged');

    }
}

/**
 * 檢查頁面上所有填空欄位的正則式是否符合
 */
static testAllFillRegex() {
    // 1. 找出所有 pattern 屬性的 <input type="text">
    let inputs = document.querySelectorAll('input[type="text"][pattern]');

    // 2. 逐一檢查
    let isAllValid = true;
    let errorMessages = [];
    inputs.forEach(function (input) {
        let patternStr = input.getAttribute('pattern'); // 取得正則字串
        let userValue = input.value.trim();            // 使用者輸入
        let dataExample = input.getAttribute('data-example') || "";
        // 例如： "工號 (e.g. 22503)"
        let regexObj;

        try {
            // 可能有特殊字元需轉義，也可直接 new RegExp(patternStr)
            regexObj = new RegExp(patternStr);
        } catch (e) {
            // 如果正則本身錯誤，直接視為不通過
            isAllValid = false;
            //errorMessages.push(`無效的正則：${patternStr}`);
            //errorMessages.push(`欄位內容「${userValue}」不符合正則：${patternStr}`);
            errorMessages.push(`無效的正則：${patternStr}\n範例：${dataExample}`);

            return;
        }

        // 檢查是否符合
        if (!regexObj.test(userValue)) {
            isAllValid = false;
            // 可加上提示：該輸入框的 placeholder 或周邊資訊
            errorMessages.push(
                `欄位內容「${userValue}」不符合正則：${patternStr}\n` +
                `範例：${dataExample}`
            );
        }
    });

    // 3. 若有錯誤，提示使用者
    if (!isAllValid) {
        alert("填空驗證失敗：\n" + errorMessages.join("\n"));
    } else {
        alert("恭喜，所有填空內容皆符合正則！");
    }
}

}



