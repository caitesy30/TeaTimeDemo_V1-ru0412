

$(document).ready(function () {

    console.log("ModuleBlock_MoveMgr.js 已載入中....");
    //移動模式管理
    $.getScript("/js/ModuleBlock_MoveMgr.js", function () {
        console.log("ModuleBlock_MoveMgr.js 已載入");

        ModuleBlock_MoveMgr.init();

    }).fail(function (jqxhr, settings, exception) {
        console.error("載入 ModuleBlock_MoveMgr.js 失敗:", exception);
    });

  


});


class SurveyEditorModeMgr {
    //預設模式


    //文字編輯模式 (點兩下進入編輯)




    //***範例***  設定模式開關==把Demo改成目標模式字樣==========================================================
    static #_IsDemoModeNow = false;
    static get DemoModeNow() {
        return SurveyEditorModeMgr.#_IsDemoModeNow;
    }
    static set #DemoModeNow(value) {
        SurveyEditorModeMgr.#_IsDemoModeNow = value;
    }
    static setDemoMode(IsOpen) {

        SurveyEditorModeMgr.#DemoModeNow(IsOpen);

        //開啟移動模式
        if (IsOpen) {
            //#關掉不要的其他模式
            //-關閉編輯模式
            SurveyEditorModeMgr.setDemoMode(false);
            /////////////////////

            SurveyEditorModeMgr.#openDemoModeProcess();
        }
        else {


            SurveyEditorModeMgr.#closeDemoModeProcess();
        }
    }

    //目標模式開啟流程
    static #openDemoModeProcess() {

    }
    //目標模式關閉流程
    static #closeDemoModeProcess() {

    }




    //設定移動模式開關============================================================
    static #_IsMoveModeNow = false;
    static get MoveModeNow() {
        return SurveyEditorModeMgr.#_IsMoveModeNow;
    }
    static set #MoveModeNow(value) {
        SurveyEditorModeMgr.#_IsMoveModeNow = value;
    }
    static setMoveMode(IsOpen) {

        SurveyEditorModeMgr.#MoveModeNow(IsOpen);

        //開啟移動模式
        if (IsOpen) {
            //#關掉不要的其他模式
            //-關閉編輯模式
            SurveyEditorModeMgr.setEditMode(false);
            /////////////////////

            SurveyEditorModeMgr.#openMoveModeProcess();
        }
        else {


            SurveyEditorModeMgr.#closeMoveModeProcess();
        }
    }

    //移動模式開啟流程
    static #openMoveModeProcess() {

    }
    //移動模式關閉流程
    static #closeMoveModeProcess() {

    }


    //設定編輯模式開關============================================================
  
    static #_IsEditModeNow = false;
    static get EditModeNow() {
        return SurveyEditorModeMgr.#_IsEditModeNow;
    }
    static set #EditModeNow(value) {
        SurveyEditorModeMgr.#_IsEditModeNow = value;
    }
    static setEditMode(IsOpen) {

        SurveyEditorModeMgr.#EditModeNow(IsOpen);

        //開啟移動模式
        if (IsOpen) {
            //#關掉不要的其他模式
            //-關閉編輯模式
            SurveyEditorModeMgr.setMoveMode(false);
            /////////////////////

            SurveyEditorModeMgr.#openEditModeProcess();
        }
        else {


            SurveyEditorModeMgr.#closeEditModeProcess();
        }
    }

    //編輯模式開啟流程
    static #openEditModeProcess() {

    }
    //編輯模式關閉流程
    static #closeEditModeProcess() {

    }

    //============================================================



}






//工具框拉出來  -- 不要影響排版

//調整表格  表格編輯模式   -表格合併   圖片

//****移動模式  --  不要有六點移動 盡量不要影響排版



//假表格分割編輯器  - 取消


//選取顯示模式

//摺疊功能









