/********************************************/
/*LabelTextEdit.js                                  */
/* 負責初始化、事件繫結、全域變數宣告等     */
/********************************************/

$(document).ready(function () {
 
    //editorFunctionsMgr.LabelTextEditEvent




    // 初始化 TinyMCE 編輯器 (已註解範例)
    // initializeTinyMCE();
       
    fillFunctionsMgr.init();
    LabelTextEditMgr.Init();
    dialogTabEventsMgr.init();
    ModuleBlockSettingBarMgr.init();
});

// 宣告全域變數 (供其他函式使用)
var LabelTextEditMgr_labelElement;           // 當前編輯的 label 元素
var divElement;              // 當前 label 內部的 div
let currentEditingModuleId;  // 用於存儲當前編輯的模塊 ID
let currentEditingDivElement;// 用於存儲當前編輯的 div 元素


class LabelTextEditMgr{

    static Init() {
        // 綁定主按鈕事件 (保存、載入、插入填空等)
        document.getElementById('saveTextBtn').addEventListener('click', function () {
            // 調用保存文本的函式 (定義在 loadAndSaveFunctions.js)
            loadAndSaveFunctionsMgr.saveTextChanges();
        });

        document.getElementById('LoadTextBtn').addEventListener('click', function () {
            // 調用載入文本的函式 (定義在 loadAndSaveFunctions.js)
            loadAndSaveFunctionsMgr.loadTextContent();
        });

        document.getElementById('InsertFillBtn').addEventListener('click', function () {
            // 顯示插入填空表單 (定義在 fillFunctions.js)
            fillFunctionsMgr.toggleInsertFillSection(true);
        });

        document.getElementById('confirmInsertFillBtn').addEventListener('click', function () {
            // 執行插入填空欄位的函式 (定義在 fillFunctions.js)
            fillFunctionsMgr.updateOrInsertFillField()
        });

        document.getElementById('cancelInsertFillBtn').addEventListener('click', function () {
            // 隱藏插入填空表單 (定義在 fillFunctions.js)
            fillFunctionsMgr.toggleInsertFillSection(false);
        });

        // 綁定測試驗證按鈕事件
        document.getElementById('testRegexBtn').addEventListener('click', function () {
            // 測試驗證鈕 (定義在 fillFunctions.js)
            fillFunctionsMgr.testAllFillRegex();
        });

        document.getElementById('DivBtn').addEventListener('click', function () {
            // 顯示切換 (定義在 divFunctions.js)
            divFunctionsMgr.toggleDivWrap();
        });

    }
}














