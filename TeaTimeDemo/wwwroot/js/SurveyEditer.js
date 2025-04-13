
/**************************************************/
/* SurveyEditer.js                   
/**************************************************/

$(document).ready(function () {


    

    console.log("SurveyEditer.Js");
    Tab_EditTableMgr.UpdateTargetInner();
    ModuleBlock_Main.init();
    ModuleBlockCreatMgr.init();
    //ModuleBlock_MoveMgr.init();
    surveyEditer.initAllLabelTextClick();

    Tab_EditTableMgr.Tab_EditTableMgr_Init();

    ModuleBlock_GridSetMgr.init();
    ModuleBlock_SelectTargetMgr.init();

    setPrint_r5.init();

    // document.addEventListener("mousemove", (event) => { console.warn(event.clientY); })

    //console.log("======== [ GetTargetCololrHex ] ====================="+ModuleBlock_ColortMgr.#GetTargetCololrHex("2"));

    //ModuleBlock_ColortMgr.GetTargetCololrHex("2");

    document.addEventListener("keydown", (event) => {

            if (event.altKey && !event.ctrlKey) {
                switch (event.key) {
                    case "0":
                        console.log("數字鍵 0 被按下了！");
                        ModuleBlock_FakeGridCutSetMgr.ResetTargetStyle(ModuleBlock_Main.GetSelectTarget());

                        break;

                    case "1":
                        console.log("數字鍵 1 被按下了！");
                        ModuleBlock_FakeGridCutSetMgr.SetGridInnerStyle(ModuleBlock_Main.GetSelectTarget());
                        break;

                    case "2":
                        console.log("數字鍵 2 被按下了！");

                        //ModuleBlock_MoveMgr.SwitchSixPointMoveBar_Force();

                        break;
                    case "3":
                        
                        break;
                    default:
                    //console.log(`其他鍵被按下: ${event.key}`);
                }
            }

        }
    );

}
);


class surveyEditer {
    static resetAutoScreenBlockSize() {
        //console.log("resetAutoScreenBlockSize");
        AutoScreen_js.resetAutoScreenBlockSize();
    }


    static removeAllLabelTextClick() {
        const labels = $('.ModuleBlock label').toArray();

        // 預設啟用編輯功能
        //window.editingModalEnabled = true;

        // Loop through and attach the dblclick event
        labels.forEach(labelElement => {

            this.Remove_LabelText_Click(labelElement);
        });
    }

    static initAllLabelTextClick() {
        const labels = $('.ModuleBlock label').toArray();

        // 預設啟用編輯功能
        //window.editingModalEnabled = true;

        // Loop through and attach the dblclick event
        labels.forEach(labelElement => {


            this.Remove_LabelText_Click(labelElement);
            this.Set_LabelText_Click(labelElement);

        });
    }

    static LabelTextEditAction(event) {

        // 只有在全域變數 editingModalEnabled 為 true 時才呼叫編輯功能
        if (!window.editingModalEnabled) {
            return; // 如果編輯功能被關閉，雙擊無反應
        }
        editorFunctionsMgr.LabelTextEditEvent(event);
       
    }

    static Remove_LabelText_Click(labelElement) {
        window.editingModalEnabled = false;

        labelElement.style.cursor = "";



        //-----------------------------------------------------------------
        labelElement.removeEventListener('dblclick', this.LabelTextEditAction);
    }

    static Set_LabelText_Click(labelElement) {
        window.editingModalEnabled = true;

        //labelElement.style.cursor = "text";
        //-----------------------------------------------------------------


        labelElement.addEventListener("dblclick", this.LabelTextEditAction);
    }

}

class setPrint_r5 {
    static init() {
        window.addEventListener('beforeprint', () => {
            setPrint_r5.setStyle();
        }
        );


        window.addEventListener('afterprint', () => {
            setPrint_r5.removeStyle();
        }
        );


    }
    static setStyle() {

        var AllModuleBlock = document.querySelectorAll("." + ModuleBlockElementMgr.ModuleBlockName);

        AllModuleBlock.forEach(ModuleBlock => {

            if (ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(ModuleBlock).style.display === 'none') {
                //不是選項

                ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(ModuleBlock).style.backgroundColor = "";
            }
            else {
                //是選項
                ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(ModuleBlock).style.backgroundColor = "#e9f5ed";

            }
        }
        );
    }


    static removeStyle() {
        var AllModuleBlock = document.querySelectorAll("." + ModuleBlockElementMgr.ModuleBlockName);

        AllModuleBlock.forEach(ModuleBlock => {

            ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(ModuleBlock).style.backgroundColor = "";
        }
        );
    }

}


class mouseFollow {
    static update() {
        this.updateMousePos();
        this.updateFollowElementPos();
        this.DrawArrow();
    }

    // 更新滑鼠跟隨元素的位置
    static updateFollowElementPos() {

        this.SetFollowElementPos();

    }

    // 更新滑鼠位置
    static updateMousePos() {

        this.RealMouseX = this.mouseX;
        this.RealMouseY = this.mouseY + window.scrollY;
    }

    static arrow = document.getElementById("arrow");

    static DrawArrow() {
        this.arrow.setAttribute("x1", window.innerWidth);
        this.arrow.setAttribute("y1", window.innerHeight);
        this.arrow.setAttribute("x2", (this.RealMouseX));
        this.arrow.setAttribute("y2", (this.RealMouseY));
    }

    static RealMouseX = 0;
    static RealMouseY = 0;
    static mouseX = window.innerWidth / 2;
    static mouseY = window.innerHeight / 2;
    static followElement = document.getElementById('followMouse');

    static initSetMouseFollow() {
        //followElement = document.getElementById('followMouse');

        followElement.setAttribute("draggable", "false");

        // 當拖動開始時隱藏跟隨元素
        document.addEventListener('dragstart', (event) => {
            console.log("hidden");
            followElement.style.visibility = "hidden";

        }, true);


        document.addEventListener('scroll', () => {



        });

        // 當拖動進行時更新滑鼠位置並顯示跟隨元素
        document.addEventListener('drag', (event) => {


            if (event.clientX !== 0 && event.clientY !== 0) {

                //mouseX = event.pageX;
                //mouseY = event.pageY;
                mouseX = event.clientX;
                mouseY = event.clientY;
                followElement.style.visibility = "visible";

            }

        }, true);

        //// 監聽滑鼠移動事件
        document.addEventListener('mousemove', (event) => {
            //mouseX = event.pageX;
            //mouseY = event.pageY;

            mouseX = event.clientX;
            mouseY = event.clientY;

        }, true);
    }

    // 設置跟隨元素的文字內容
    static SetFollowElementStr(str) {
        followElement.innerText = str;
    }

    //設置跟隨元素的位置
    static SetFollowElementPos() {
        // 獲取視窗的寬度和高度
        //const viewportWidth = window.innerWidth;
        //const viewportHeight = window.innerHeight;
        const viewportWidth = document.documentElement.scrollWidth;
        const viewportHeight = document.documentElement.scrollHeight;


        // 獲取 followElement 的寬度和高度
        const elementWidth = followElement.offsetWidth;
        const elementHeight = followElement.offsetHeight;

        // 計算真正的 X 和 Y 位置
        let finalX = RealMouseX;
        let finalY = RealMouseY;

        // 如果 followElement 會超出右邊邊界，調整 X 位置
        if (RealMouseX + elementWidth > viewportWidth) {
            finalX = viewportWidth - elementWidth; // 修正右邊邊界
        }

        // 如果 followElement 會超出底部邊界，調整 Y 位置
        if (RealMouseY + elementHeight > viewportHeight) {
            finalY = viewportHeight - elementHeight; // 修正底部邊界
        }

        // 更新 followElement 的位置
        this.followElement.style.left = `${finalX}px`;
        this.followElement.style.top = `${finalY}px`;
    }

}

class ModuleBlock_Main {
    static init() { this.initSelectTargetID(); }
    static SelectTargetID = "";
    static SetSelectTargetID(TargetID) {
        ModuleBlock_Main.SelectTargetID = TargetID;
        //console.log(this.SelectTargetID);
    }
    static GetSelectTargetID() {

        //console.log(`GettSelectTargetID  ${ModuleBlock_Main.SelectTargetID}`);
        return ModuleBlock_Main.SelectTargetID;

    }
    static GetSelectTarget() {

        const Target = document.getElementById(ModuleBlock_Main.GetSelectTargetID());
        //console.warn(Target);
        return Target;

    }
    static initSelectTargetID() {
        const target = document.querySelector("." + ModuleBlockElementMgr.ModuleBlockName);
        ModuleBlock_SelectTargetMgr.SetModuleBlockSelectTarget(target);
        //console.log(`initSelectTargetID = ${this.SelectTargetID}`);
    }

}




//================== 頁面 [ 存檔 ] 管理 ==================

class SurveySaveMgr {


    //PCB類別
    static Category;

    //站別
    static Station;
    
    //頁數
    static PageNo;

    //後綴
    static Suffix;

    //文件編號
    static DocumentId;



}


//SetTable_Field  還沒完成
//================== 模塊 [ 建立 ] 管理 ==================
class ModuleBlockCreatMgr {


    static ModuleBlockId = 0;
    static init() { this.initModuleBlockId(); }

    static initModuleBlockId() {

        const targets = document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`);  // 使用类选择器

        targets.forEach(target => {
            const str = target.id;
            const numberStr = str.match(/\d+/)[0]; // 提取数字部分

            const number = Number(numberStr);
            if (number > this.ModuleBlockId) {
                this.ModuleBlockId = number;
            }
            target.setAttribute("draggable", "false");
        });
    }
    //##### [ 創建空的ModuleBlock主新增 ] #####

    static addModuleBlock(needSetTarget) {
        //console.log("addModuleBlockloc  " + needSetTarget);
        needSetTarget = Boolean(needSetTarget);
        //console.log("addModuleBlock  " + needSetTarget);

        this.ModuleBlockIdStart();

        //===  創建新的 ModuleBlock 元素 =============================

        var newModuleBlock = this.creatModuleBlock_Div();
        newModuleBlock.dataset.needAnswered = false;
        newModuleBlock.dataset.GridMode = false;
        var newModuleBlock_inner = this.creatModuleBlock_inner_Div();
        //===  創建 Setting 元素 =====================================

        var ModuleGear = this.creatModuleSettingGear_Div();
        //newModuleBlock_inner.appendChild(ModuleGear);

        //===  創建 textBox 元素 =====================================

        var textBox = this.creatModuleTextBox_Div();
        newModuleBlock_inner.appendChild(textBox);

        //===  創建 OnceTable 元素 ================================

        var OnceTable = this.creatOnceTable_Table();
        newModuleBlock_inner.appendChild(OnceTable);

        //===  創建 GridTable 元素 =====================================

        //var GridTable = this.creatGridTable_Table();

        //newModuleBlock_inner.appendChild(GridTable);

        newModuleBlock.appendChild(newModuleBlock_inner);



        var SelectTargetBlock = document.getElementById(ModuleBlock_Main.SelectTargetID);
        //如果有選擇目標
        if (SelectTargetBlock) {
            //加在目標底下
            newModuleBlock.dataset.ColorLayer = SelectTargetBlock.dataset.ColorLayer;
            SelectTargetBlock.parentNode.insertBefore(newModuleBlock, SelectTargetBlock.nextSibling);
        }
        else {
            // 將新的 ModuleBlock 添加到 AutoScreen 中
            document.getElementById("AutoScreen").appendChild(newModuleBlock);
            newModuleBlock.dataset.ColorLayer = "1";
        }


        //newModuleBlock.tabIndex = this.getModuleBlockId();
        newModuleBlock.tabIndex = 0;
        ModuleBlockEditMgr.closeModuleBlockTable(newModuleBlock);


        this.ReSet_ModuleBlock_EventAction(newModuleBlock);



        if (needSetTarget) {
            ModuleBlock_SelectTargetMgr.SetModuleBlockSelectTarget(newModuleBlock);
            this.ViewToTarget(newModuleBlock.id);
        }


        AutoScreen_js.resetAutoScreenBlockSize();

        return newModuleBlock;
        // 向表格添加一行表头
        //SetModuleBlockSGrid(newModuleBlock.id, "Add", "Row", "Head");

        // 向表格移除一列
        //SetModuleBlockSGrid(newModuleBlock.id,"Remove", "Column", "Feet");

    }  //創建空的ModuleBlock

    static creatModuleBlock_Div() {
        var newModuleBlock = document.createElement("div");
        newModuleBlock.id = `${ModuleBlockElementMgr.ModuleBlockName}_${this.getModuleBlockId()}`;

        newModuleBlock.classList.add(ModuleBlockElementMgr.ModuleBlockName);

        newModuleBlock.dataset.checkboxType = "radio"
        //使該元素無法被拖曳
        //newModuleBlock.setAttribute("draggable", "false");

        return newModuleBlock;
    }        //創建 newModuleBlock 外殼

    static creatModuleBlock_inner_Div() {
        var newModuleBlock_inner = document.createElement("div");
        //newModuleBlock_inner.id = this.getModuleBlockId();
        newModuleBlock_inner.classList.add(ModuleBlockElementMgr.ModuleBlock_innerName);
        //使該元素無法被拖曳
        //newModuleBlock_inner.setAttribute("draggable", "false");

        return newModuleBlock_inner;
    }        //創建 newModuleBlock_inner 外殼

    static creatModuleSettingGear_Div() {
        var ModuleSetting = document.createElement("div");
        ModuleSetting.classList.add("ModuleSetting");
        ModuleSetting.classList.add("bi");
        ModuleSetting.classList.add("bi-gear");

        // 隱藏元素 保留佔位
        //ModuleSetting.style.visibility = 'hidden';
        //ModuleSetting.style.visibility = 'visible';

        // 隱藏元素，並移除佔位
        ModuleSetting.style.display = 'none';
        //ModuleSetting.style.display = 'block';

        // 隱藏元素，使其完全透明 但是還能互動
        //ModuleSetting.style.opacity = 0.5;
        //ModuleSetting.style.opacity = '1';
        return ModuleSetting;
    }        //創建 SettingGear 外殼--(棄用)

    static creatModuleTextBox_Div() {
        var textBox = document.createElement("div");
        textBox.classList.add(ModuleBlockElementMgr.TextBoxName);
        //---  創建 checkbox ---------------------------------------
        var inputCheckbox = document.createElement("input");
        inputCheckbox.id = `Opt_${this.getModuleBlockId()}`;
        //inputCheckbox.name = `Q_測試模塊${this.getModuleBlockId()}`;
        inputCheckbox.type = "checkbox";
        inputCheckbox.classList.add(ModuleBlockElementMgr.optionCheckboxName);
        inputCheckbox.value = `${this.getModuleBlockId()}`;
        inputCheckbox.name = `Bool_${this.getModuleBlockId()}`;
        //這行代碼設置勾選框為必填項，表示用戶必須勾選該勾選框才能提交表單。
        //inputCheckbox.required = true;

        inputCheckbox.style.display = 'none';
        //---  創建 label ---------------------------------------

        var label = document.createElement("label");
        //label.id = `label_${getModuleBlockId()}`;

        label.setAttribute("for", `Opt_${this.getModuleBlockId()}`);

        var newDiv = document.createElement("div");

        newDiv.textContent = `文字模塊${this.getModuleBlockId()}`;
        //newDiv.style.width = '100%';
        //newDiv.style.height = '100%';
        label.appendChild(newDiv);
        //label.innerHTML = `測試<br><br><br>模塊${getModuleBlockId()}`;
        //label.style.display = 'none';
        // 將 checkbox 和 label 添加到 textBox 中

        //------------------------------------------------------

        textBox.appendChild(inputCheckbox);
        textBox.appendChild(label);

        //label.addEventListener("dblclick", editorFunctionsMgr.LabelTextEditEvent);
        //設定編輯
     
        if (window.editingModalEnabled || window.editingModalEnabled === undefined) {
            surveyEditer.Set_LabelText_Click(label);
        }
      


        return textBox;
    }        //創建 TextBox 外殼---(重點 重整)

    static creatOnceTable_Table() {
        var OnceTable = document.createElement("table");
        OnceTable.classList.add(ModuleBlockElementMgr.OnceTableName);
        var _tr = document.createElement("tr");

        var _td = document.createElement("td");
        var _Field = this.createTableField_Div();
        _tr.appendChild(_td);
        _td.appendChild(_Field);
        OnceTable.appendChild(_tr);
        this.ReSet_Table_Field_EventAction(_Field);
        return OnceTable;
    }        //創建 OnceTable 外殼



    static createTableField_Div() {
        let emptyDiv = document.createElement("div");
        emptyDiv.className = ModuleBlockElementMgr.TableFieldName;
        return emptyDiv;
    }        //創建 TableField 外殼---(重整)

    //創建模塊 ID 設置 Action
    static getModuleBlockId() {
        return this.ModuleBlockId;
    }
    static ModuleBlockIdStart() {
        this.ModuleBlockId++;
    }
    static ViewToTarget(targetId) {

        //console.log(`ViewToTarget  :  ${targetId}`);

        const target = document.getElementById(targetId);

        if (target) {
            target.scrollIntoView({
                behavior: "smooth",   // 平滑滾動
                block: "start"        // 滾動到頂部
            });
        }


    }
    
    //=== [ 模塊及部件 初始化  EventAction] ===
    static ReSetAll_ModuleBlock_EventAction() {
        console.log("ReSetAll_ModuleBlock_EventAction==========================================");
        surveyEditer.initAllLabelTextClick();

        const targetClassName = "ModuleBlock";  // 修改为目标类名
        const targets = document.querySelectorAll(`.${targetClassName}`);  // 使用类选择器

        targets.forEach(target => {
            this.ReSet_ModuleBlock_EventAction(target);
        });
    }
    static ReSet_ModuleBlock_EventAction(targetModuleBlock) {
        //const targetModuleBlock = document.getElementById(targetId);

        ModuleBlock_SelectTargetMgr.ReSet_Action_ModuleBlock_SelectTarget(targetModuleBlock);

        // ModuleBlock_MoveMgr.ReSet_Action_ModuleBlock_BlockMove(targetModuleBlock);


    }
    static ReSet_Table_Field_EventAction(emptyDiv) {
        // ModuleBlock_MoveMgr.ReSet_Action_TableField_BlockMove(emptyDiv);

    }


}

//================== 模塊 [ 選項 ] 管理 ==================
class ModuleOptionEditor {

    static SetAnswer(TargetModuleBlock, value) {
        if (typeof value === 'boolean') {

            if (TargetModuleBlock.dataset.OptionMode) {

                ModuleBlockEditMgr.OpenModuleBlock_Checkbox(ModuleBlock_Main.GetSelectTarget(), true);
                TargetModuleBlock.dataset.needAnswered = false;

                return true;
            }
            else /*if (TargetModuleBlock.dataset.QuestionMode)*/ {
                //let text = TargetModuleBlock.id;
                //let match = text.match(/(\d+)$/);
                //let number = match[1];


                ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(TargetModuleBlock).type = "checkbox";
                //ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(TargetModuleBlock).name = `needAnswered`;
                TargetModuleBlock.dataset.needAnswered = value;
                ModuleBlockEditMgr.OpenModuleBlock_Checkbox(ModuleBlock_Main.GetSelectTarget(), value);

                console.log('ans:' + TargetModuleBlock.dataset.needAnswered);
                return value;
            }

        }

    }

    //檢測有沒有選項 設定問題模式
    static checkHasOption(QuestionBlock) {

        if (document.querySelector(`input[name="${QuestionBlock.id}"]`)) {
            QuestionBlock.dataset.QuestionMode = "true";
           // console.error(ModuleDataFetcherMgr.GetTargetModuleBlock(document.querySelector(`input[name="${QuestionBlock.id}"]`)).id);


        }
        else {
            QuestionBlock.dataset.QuestionMode = "false"; // dataset 內的值會變成字串
          //  console.error("false");
        }
    
    }

    static AddModuleBlockIn(TargetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return null;
        }
        //阻止表格有選項--------------------------------------------------------------------------
        if (ModuleBlockEditMgr.IsModuleBlock_TableGrid_Open(TargetModuleBlock)) {
            return;
        }
        const NewModuleBlock = ModuleBlockCreatMgr.addModuleBlock();
        const colorLayerValue = Number(TargetModuleBlock.dataset.ColorLayer);
        if (!isNaN(colorLayerValue)) {
            NewModuleBlock.dataset.ColorLayer = colorLayerValue + 1;
        } else {
            console.error("ColorLayer is not a valid number:", TargetModuleBlock.dataset.ColorLayer);
        }

        if (!ModuleBlockEditMgr.IsModuleBlock_TableGrid_Open(TargetModuleBlock)) {

            ModuleBlockEditMgr.OpenModuleBlock_OnceTable(TargetModuleBlock, true);
            /* const table = ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(TargetModuleBlock);*/

            const TableField = ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(TargetModuleBlock).querySelector(`.${ModuleBlockElementMgr.TableFieldName}`);

            TableField.appendChild(NewModuleBlock);
        }

    }

    static createOption(TargetModuleBlock) {

        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return null;
        }
        //阻止表格有選項-表格不能有選項-------------------------------------------------------------------------
        if (TargetModuleBlock.dataset.GridMode == "true") {
            return;
        }




        //如果表格沒有打開
        if (TargetModuleBlock.dataset.GridMode != "true") {

            const NewModuleBlock = ModuleBlockCreatMgr.addModuleBlock();

            const colorLayerValue = Number(TargetModuleBlock.dataset.ColorLayer);
            if (!isNaN(colorLayerValue)) {
                NewModuleBlock.dataset.ColorLayer = colorLayerValue + 1;
            } else {
                console.error("ColorLayer is not a valid number:", TargetModuleBlock.dataset.ColorLayer);
            }

            ModuleBlockEditMgr.OpenModuleBlock_Checkbox(NewModuleBlock, true);

            ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(NewModuleBlock).name = `${TargetModuleBlock.id}`;

            //--------------------------------------------------------------------------------------
            ModuleBlockEditMgr.updateLabelCollapseIcon(TargetModuleBlock, false);
            ModuleBlockEditMgr.OpenModuleBlock_OnceTable(TargetModuleBlock, true);
            /* const table = ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(TargetModuleBlock);*/

            const TableField = ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(TargetModuleBlock).querySelector(`.${ModuleBlockElementMgr.TableFieldName}`);

            TableField.appendChild(NewModuleBlock);
            NewModuleBlock.dataset.OptionMode = true;
            TargetModuleBlock.dataset.QuestionMode = true;
            TargetModuleBlock.dataset.needAnswered = true;
        }



        if (TargetModuleBlock.dataset.checkboxType === "radio") {
            ModuleOptionEditor.SetAllOptionBecome_Radio(TargetModuleBlock);
        }
        else if (TargetModuleBlock.dataset.checkboxType === "checkbox") {
            ModuleOptionEditor.SetAllOptionBecome_CheckBox(TargetModuleBlock);
        }
        else {
            console.warn("SetAllOptionBecome_  " + TargetModuleBlock.dataset.checkboxType);
        }


        ModuleBlock_SelectTargetMgr.SetModuleBlockShowAssociation(TargetModuleBlock);
    }


    static ResetAllOptionBecome_TargetCheckboxType(ModuleBlock) {
        if (ModuleBlock.dataset.checkboxType === "radio") {
            ModuleOptionEditor.SetAllOptionBecome_Radio(ModuleBlock);
        }
        else if (ModuleBlock.dataset.checkboxType === "checkbox") {
            ModuleOptionEditor.SetAllOptionBecome_CheckBox(ModuleBlock);
        }
    }

    static SetAllOptionBecome_Radio(TargetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return null;
        }
        TargetModuleBlock.dataset.checkboxType = "radio";

        const inputs = document.querySelectorAll(`input[name=${TargetModuleBlock.id}]`);

        inputs.forEach(input => {
            input.type = 'radio';  // 将每个输入元素的类型设置为单选框
        });
    }

    static SetAllOptionBecome_CheckBox(TargetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return null;
        }
        TargetModuleBlock.dataset.checkboxType = "checkbox";
        const inputs = document.querySelectorAll(`input[name=${TargetModuleBlock.id}]`);

        inputs.forEach(input => {
            input.type = 'checkbox';  // 将每个输入元素的类型设置为复选框
        });
    }


    //////////////////////////////////////////////////////////////////
    static SetTargetQuestionMode(TargetId) {
        var optionCheckboxs = document.querySelectorAll(`.${TargetId}`);

        // 檢查是否有元素的 name 屬性等於 TargetId
        var hasTarget = Array.from(optionCheckboxs).some(checkbox => checkbox.name === TargetId);


        var TargetBlock = document.querySelector(`#${TargetId}`);
        if (hasTarget) {
            TargetBlock.dataset.QuestionMode = "true";
        }
        else {
            TargetBlock.dataset.QuestionMode = "false";

            if (TargetBlock.dataset.OptionMode != "true") {

                ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(TargetBlock).style.display = "none";
            }

        }

        return hasTarget;
    }


    static resetAllDataSet() {
        //console.log("resetAllDataSet");
        //---[ 重置 ]---
        //找出所有option
        //將所有有選項的模塊 都加上 question-mode = true
        //如果沒有 input cls option_checkbox  display: none; 就不是選項
        //data--question-mode
        //data--option-mode
        //data-need-answered   是問題 全部都要加上這個  如果沒有的 就要變成false


        document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(
            (ModuleBlock) => { ModuleBlock.dataset.QuestionMode = false; }
        );
        let questionNameList = new Set();

        document.querySelectorAll("." + ModuleBlockElementMgr.optionCheckboxName).forEach(
            (optionCheckbox) => {
                //不希望有選項的問題是自己
                var TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(optionCheckbox);
                if (optionCheckbox.name == TargetModuleBlock.id) {
                    //TargetModuleBlock.style.backgroundColor = "red";
                    optionCheckbox.removeAttribute("name");
                }
                else {
                    optionCheckbox.dataset.OptionMode = true;
                    questionNameList.add(optionCheckbox.name); // Set 會自動去除重複值
                }
            }
        );


        let uniqueQuestionNameList = Array.from(questionNameList);
        //console.log("uniqueQuestionNameList  " + uniqueQuestionNameList.length);

        uniqueQuestionNameList.forEach((name) => {
            // 檢查 name 是否為空、null 或 undefined
            if (!name) {
                return; // 跳過這個迴圈
            }

            // 使用 CSS.escape 確保 id 不會導致 querySelector 出錯
            var target = document.querySelector(`#${CSS.escape(name)}`);

            if (!target) {

                return;
            }

            // 修改 target 屬性
            target.style.backgroundColor = "Cyan";  //所有問題都會變成綠色
            target.dataset.QuestionMode = "true";
            target.dataset.needAnswered = "false";


            // 檢查 checkbox 是否存在
            let checkBox = ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(target);
            if (checkBox) {
                if (checkBox.style.display !== "none") {
                    target.dataset.needAnswered = "true";
                }
            } else {
                console.warn("Checkbox not found for", target);
            }
        });




    }


}






//================== 模塊 [ 移動 ] 管理 ==================

//class ModuleBlock_MoveMgr {

//    static #CanMoveNow = true;
//    static ForceMoveNow = false;

//    static get canMoveNow() {
//        return ModuleBlock_MoveMgr.#CanMoveNow;
//    }
//    static set canMoveNow(value) {
//        if (typeof value === 'boolean') {

//            ModuleBlock_MoveMgr.#CanMoveNow = value;

//            if (value) {

//            }
//            else {
//                ModuleBlock_MoveMgr.ForceMoveNow = false;
//                ModuleBlock_MoveMgr.CloseHoldBox();
//                ModuleBlock_MoveMgr.ReMove_AllModuleBlock_SixPointMoveBar();
//            }

//        } else {
//            throw new TypeError('canMoveNow must be a boolean');
//        }
//    }
//    //---------------------------

//    static SixPointMoveBarName = "SixPointMoveBar";
//    static MoveHoldTargetTopValue = 0;
//    static MoveHoldTargetBottomValue = 20;
//    //---------------------------
//    static HoldBoxName = "HoldBox";
//    static HoldBoxInnerName = "HoldBoxInner";
//    static HoldBox = null;
//    static HoldBoxInnerTargetModuleBlock = null;

//    //=== [ 移動模塊 初始化 ] ===
//    static init() {
//        this.InitHoldBox();
//    }

//    static SwitchSixPointMoveBar_Force() {


//        if (ModuleBlock_MoveMgr.canMoveNow && ModuleBlock_MoveMgr.ForceMoveNow) {
//            ModuleBlock_MoveMgr.ForceMoveNow = false;
//            ModuleBlock_MoveMgr.canMoveNow = false;
//            var AllModuleBlock = document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`);

//            AllModuleBlock.forEach((ModuleBlock) => {
//                ModuleBlock_MoveMgr.ReMoveSixPointMoveBar(ModuleBlock);
//            });
//        }
//        else {
//            ModuleBlock_MoveMgr.SetSixPointMoveBar_Force();
//        }



//        AutoScreen_js.resetAutoScreenBlockSize();
//    }

//    static SetSixPointMoveBar_Force() {
//        ModuleBlock_MoveMgr.canMoveNow = true;
//        ModuleBlock_MoveMgr.ForceMoveNow = true;
//        var AllModuleBlock = document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`);

//        AllModuleBlock.forEach((ModuleBlock) => {
//            ModuleBlock_MoveMgr.ReSetSixPointMoveBar(ModuleBlock);
//        });

//        AutoScreen_js.resetAutoScreenBlockSize();
//    }



//    //=== [ HoldBox 初始化 ] ===
//    static InitHoldBox() {

//        if (this.HoldBox) {
//            this.HoldBox.remove();
//        }

//        this.HoldBox = document.createElement("div");

//        this.HoldBox.classList.add(this.HoldBoxName);  // 為占位符設置樣式
//        var HoldBoxInner = document.createElement("div");
//        HoldBoxInner.classList.add(this.HoldBoxInnerName);

//        HoldBoxInner.style.height = "25px";
//        var plusIconDiv = document.createElement("div");
//        plusIconDiv.classList.add("bi");
//        plusIconDiv.classList.add("bi-plus-square");

//        HoldBoxInner.appendChild(plusIconDiv);
//        this.HoldBox.appendChild(HoldBoxInner);
//        document.getElementById("AutoScreen").appendChild(this.HoldBox);



//        this.ReSet_Action_HoldBox_BlockMove();
//        this.HoldBox.dataset.CanSwap = true;
//        ModuleBlock_MoveMgr.CloseHoldBox();
//    }

//    static ResetHoldBoxDragStart(TargetModuleBlock) {
//        ModuleBlock_MoveMgr.SetHoldBoxAfter(TargetModuleBlock);
//        ModuleBlock_MoveMgr.ShowHoldBox_Valid();
//        ModuleBlock_MoveMgr.OpenHoldBox();
//    }

//    // 開啟佔位框
//    static OpenHoldBox() {

//        if (!ModuleBlock_MoveMgr.canMoveNow) { return; }


//        if (!this.CheckHoldBoxIsShow()) { // 檢查當前狀態是否為 'flex'
//            this.HoldBox.style.display = '';
//            //console.log("HoldBox 已打開。");
//        } else {
//            //console.log("HoldBox 已經是打開狀態，無需重複操作。");
//        }
//        AutoScreen_js.resetAutoScreenBlockSize();
//    }
//    // 關閉佔位框
//    static CloseHoldBox() {

//        if (this.CheckHoldBoxIsShow()) {
//            this.HoldBox.style.display = 'none';
//            //console.log("HoldBox 已關閉。");
//        } else {
//            //console.log("HoldBox 已經是關閉狀態，無需重複操作。");
//        }
//        AutoScreen_js.resetAutoScreenBlockSize();
//    }
//    // 確認HoldBox是否開啟
//    static CheckHoldBoxIsShow() {

//        return !(this.HoldBox.style.display === 'none');
//    }


//    //=== [ 設定拖曳目標 ] ===
//    static DraggedBlock = null;
//    static SetDraggedBlock(target) {
//        if (ModuleBlockElementMgr.checkIsModuleBlock(target)) {
//            this.ReSetDraggedBlock();
//            this.DraggedBlock = target;

//            this.DraggedBlock.style.opacity = 0.3;

//            // 禁止滑鼠互動
//            //this.DraggedBlock.style.pointerEvents = 'none';
//        }
//    }
//    static ReSetDraggedBlock() {

//        if (this.DraggedBlock) {
//            //this.DraggedBlock.style.visibility = 'visible';
//            this.DraggedBlock.style.opacity = 1;
//            // 恢復滑鼠互動
//            //this.DraggedBlock.style.pointerEvents = 'auto';
//            this.DraggedBlock = null
//        }
//    }
//    // 將新增框設置在目標元素城之內
//    static SetHoldBoxIn(Target, IsBefore) {


//        if (!Target || !this.HoldBox) {
//            return;
//        }

//        if (!this.CheckHoldBoxIsShow()) {
//            return;
//        }

//        //Target.style.backgroundColor = "#f1948a"

//        // 防止將節點插入到自身內部或祖先節點
//        if (this.HoldBox.contains(Target)) {
//            return;
//        }

//        // 確保 HoldBox 不在 Target 中，將其添加為最後一個子元素
//        if (!Target.contains(this.HoldBox)) {

//            if (IsBefore) {
//                Target.insertBefore(this.HoldBox, Target.firstChild);
//            }
//            else {
//                Target.appendChild(this.HoldBox);
//            }

//            console.warn("===== [ 將新增框設置在目標元素城之內 ] =====");
//        }
//        // 如果 HoldBox 已經在 Target 中，但不是最後一個子元素，將其移動到最後
//        else if (Target.lastElementChild !== this.HoldBox) {

//            if (IsBefore) {
//                Target.insertBefore(this.HoldBox, Target.firstChild);
//            }
//            else {
//                Target.appendChild(this.HoldBox);
//            }

//            console.warn("===== [ 將新增框設置在目標元素城之內 ] =====");
//        }
//    }
//    // 將新增框設置在目標元素之前

//    static HoldBoxIsBefore(Target) {
//        //ModuleBlock_MoveMgr.OpenHoldBox();
//        if (Target.parentNode && Target.previousSibling !== this.HoldBox /*&& Target.previousSibling !== DraggedBlock*/) { // 检查 AddBox 是否在目标之前

//            return false;
//        } else {
//            console.log("AddBox 已经在目标位置之前。");
//            return true;
//        }
//    }
//    static SetHoldBoxBefore(Target) {
//        if (!this.HoldBoxIsBefore(Target)) { // 检查 AddBox 是否在目标之前

//            Target.parentNode.insertBefore(this.HoldBox, Target);
//        }
//        this.setHoldBoxParentNodeTextBoxColor();
//        this.setHoldBoxShowValidOrError();
//        AutoScreen_js.resetAutoScreenBlockSize();
//    }
//    // 將新增框設置在目標元素之後
//    static HoldBoxIsAfter(Target) {
//        //ModuleBlock_MoveMgr.OpenHoldBox();
//        if (Target.parentNode && Target.nextSibling !== this.HoldBox /*&& Target.nextSibling !== DraggedBlock*/) { // 检查 AddBox 是否在目标之后

//            return false;

//        } else {

//            return true;
//        }
//    }
//    static SetHoldBoxAfter(Target) {
//        if (!this.HoldBoxIsAfter(Target)) { // 检查 AddBox 是否在目标之后

//            Target.parentNode.insertBefore(this.HoldBox, Target.nextSibling);
//        }
//        this.setHoldBoxParentNodeTextBoxColor();
//        this.setHoldBoxShowValidOrError();
//        AutoScreen_js.resetAutoScreenBlockSize();
//    }
//    //-------------------------------
//    //exclamation-triangle
//    static setHoldBoxShowValidOrError() {

//        return;
//        const HoldBox_Checker = this.HoldBox.parentNode;
//        const DraggedBlock_Checker = this.DraggedBlock.parentNode;




//        if (this.DraggedBlock.dataset.QuestionMode == "true") {



//            let parentNodeModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(HoldBox_Checker);

//            if (parentNodeModuleBlock) {
//                var IsInOption = false;

//                let _Parent_ParentNodeModuleBlock = parentNodeModuleBlock;


//                while (_Parent_ParentNodeModuleBlock) {

//                    let name = ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(_Parent_ParentNodeModuleBlock).name;
//                    if (this.DraggedBlock.id == name) {

//                        IsInOption = true;

//                        _Parent_ParentNodeModuleBlock = null;
//                    }
//                    else {

//                        _Parent_ParentNodeModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(_Parent_ParentNodeModuleBlock.parentNode);
//                    }
//                }


//            }

//            if (IsInOption) {
//                this.ShowHoldBox_Error();
//                return;
//            }

//        }
//        //如果是選項
//        else if (this.DraggedBlock.dataset.OptionMode == "true") {

//            let parentNodeModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(HoldBox_Checker);

//            if (parentNodeModuleBlock) {
//                const Option_ParentNodeId = ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(this.DraggedBlock).name;
//                //var TargetModuleBlock = DraggedBlock_Checker.closest("." + ModuleBlockElementMgr.ModuleBlockName);

//                if (parentNodeModuleBlock.id == Option_ParentNodeId) {
//                    this.ShowHoldBox_Valid();
//                    console.log("在目標底下");
//                    return;
//                }
//                else if (parentNodeModuleBlock.dataset.GridMode == "true") {

//                    let _ParentNodeModuleBlock = parentNodeModuleBlock;
//                    let _Parent_ParentNodeModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(_ParentNodeModuleBlock.parentNode)

//                    while ((_Parent_ParentNodeModuleBlock) && _Parent_ParentNodeModuleBlock.dataset.GridMode == "true") {
//                        _ParentNodeModuleBlock = _Parent_ParentNodeModuleBlock;
//                        _Parent_ParentNodeModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(_ParentNodeModuleBlock.parentNode)

//                        if (_Parent_ParentNodeModuleBlock) {

//                        }
//                    }

//                    if (_Parent_ParentNodeModuleBlock) { }
//                    else { _Parent_ParentNodeModuleBlock = _ParentNodeModuleBlock; }


//                    if (_Parent_ParentNodeModuleBlock.id == Option_ParentNodeId) {
//                        this.ShowHoldBox_Valid();
//                        console.log("在目標問題表格底下");
//                        return;
//                    }
//                    else {
//                        var Root = document.querySelector(`#${_Parent_ParentNodeModuleBlock.id}`);
//                        var Parent = document.querySelector(`#${Option_ParentNodeId}`);
//                        if (ModuleDataFetcherMgr.GetTargetModuleBlock(Parent.parentNode).contains(HoldBox_Checker)) {
//                            if (Root && Parent) {
//                                // 使用 contains() 確認 Parent 是否是 Root 的後代
//                                if (Root.contains(Parent)) {
//                                    this.ShowHoldBox_Valid();
//                                    console.log("Parent 是 Root 的後代節點。");
//                                    return;
//                                } else {
//                                    console.log("Parent 不在 Root 裡面。");
//                                }
//                            } else {
//                                console.error("Root 或 Parent 無法找到！");
//                            }
//                        }

//                    }


//                }
//                else if (true) {

//                }
//                console.log("不在目標底下");
//                //不能在其他選項底下
//                //在表格底下
//            }

//            this.ShowHoldBox_Error();
//            return;
//        }



//        //確認目前 HoldBox 位置是在表格裡面還是一般列表裡面

//        //如果在列表裡面 確認是不是在原始parentNode

//        //是選項的模塊

//        //if (ModuleDataFetcherMgr.GetTargetModuleBlock(HoldBox_Checker) === ModuleDataFetcherMgr.GetTargetModuleBlock(DraggedBlock_Checker)) {

//        //    this.ShowHoldBox_Valid();
//        //}
//        //else {

//        //    this.ShowHoldBox_Error();
//        //}
//        this.ShowHoldBox_Valid();

//    }

//    static setHoldBoxParentNodeTextBoxColor() {

//        this.closeHoldBoxParentNodeTextBoxColor();

//        this.HoldBoxInnerTargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(this.HoldBox.parentNode);

//        if (this.HoldBoxInnerTargetModuleBlock) {

//            console.log(" 有 HoldBoxInnerTargetModuleBlock " + this.HoldBoxInnerTargetModuleBlock.id)

//            ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(this.HoldBoxInnerTargetModuleBlock).style.backgroundColor = "#92e8b0";


//            var TargetModuleBlock_SixPointMoveBar = ModuleDataFetcherMgr.GetTargetModuleBlock_SixPointMoveBar(this.HoldBoxInnerTargetModuleBlock);
//            if (TargetModuleBlock_SixPointMoveBar) {
//                //  TargetModuleBlock_SixPointMoveBar.style.backgroundColor = "#9be8bb";
//                TargetModuleBlock_SixPointMoveBar.style.backgroundColor = "#7cde9e";
//            }

//            var TargetListTableField = ModuleDataFetcherMgr.GetTargetModuleBlock_ListTableField(this.HoldBoxInnerTargetModuleBlock);
//            if (TargetListTableField) {

//                //設定顏色
//                //TargetListTableField.style.backgroundColor = "#ffddd6";
//                TargetListTableField.style.backgroundColor = "#b8fccf";
//                console.log(" 有 TargetListTableField")
//            }
//        }
//    }
//    static closeHoldBoxParentNodeTextBoxColor() {



//        if (this.HoldBoxInnerTargetModuleBlock) {
//            ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(this.HoldBoxInnerTargetModuleBlock).style.backgroundColor = "";

//            var TargetModuleBlock_SixPointMoveBar = ModuleDataFetcherMgr.GetTargetModuleBlock_SixPointMoveBar(this.HoldBoxInnerTargetModuleBlock);
//            if (TargetModuleBlock_SixPointMoveBar) {
//                TargetModuleBlock_SixPointMoveBar.style.backgroundColor = "";
//            }

//            var TargetListTableField = ModuleDataFetcherMgr.GetTargetModuleBlock_ListTableField(this.HoldBoxInnerTargetModuleBlock);
//            if (TargetListTableField) {
//                //關閉顏色
//                TargetListTableField.style.backgroundColor = "#e6f5eb";
//            }


//        }
//    }

//    static ShowHoldBox_Valid() {
//        this.HoldBox.dataset.CanSwap = true;
//        var HoldBoxInner = this.HoldBox.querySelector("." + this.HoldBoxInnerName);
//        HoldBoxInner.style.backgroundColor = "";

//        var IconDiv = this.HoldBox.querySelector(".bi");
//        if (IconDiv) { // 確保目標元素存在
//            IconDiv.classList.remove("bi-plus-square", "bi-exclamation-triangle-fill", "bi-x-octagon-fill"); // 移除指定的 class
//            IconDiv.style.color = ""

//            IconDiv.classList.add("bi-plus-square");
//        }
//    }

//    static ShowHoldBox_Error() {
//        this.HoldBox.dataset.CanSwap = false;
//        console.log("ShowHoldBox_Error");
//        var HoldBoxInner = this.HoldBox.querySelector("." + this.HoldBoxInnerName);
//        HoldBoxInner.style.backgroundColor = "#ff867d";

//        var IconDiv = this.HoldBox.querySelector(".bi");
//        if (IconDiv) { // 確保目標元素存在
//            IconDiv.classList.remove("bi-plus-square", "bi-exclamation-triangle-fill", "bi-x-octagon-fill"); // 移除指定的 class

//            IconDiv.style.color = "white";
//            //IconDiv.classList.add("bi-x-octagon-fill");
//            IconDiv.classList.add("bi-exclamation-triangle-fill");
//        }


//    }
//    //-------------------------------
//    static TrySetHoldBoxIn(target, IsBefore) {

//        console.log(" IsBefore=> " + IsBefore)
//        this.SetHoldBoxIn(target, IsBefore);

//        this.setHoldBoxParentNodeTextBoxColor();
//        this.setHoldBoxShowValidOrError();
//        AutoScreen_js.resetAutoScreenBlockSize();
//    }
//    //-------------------------------
//    static HoldBox_Drop(event) {
//        ModuleBlock_MoveMgr.closeHoldBoxParentNodeTextBoxColor();
//        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_Drop(event)) {
//            ModuleBlock_MoveMgr.#holdBox_Drop();
//        }
//    }
//    static #holdBox_Drop() {

//        //event.stopPropagation();

//        if (this.HoldBox.style.display === 'none') { // 检查当前状态是否为 'none'

//            console.log("AddBox 已关闭。");
//            //this.ReSetDraggedBlock();
//            //return;
//        }

//        var DraggedBlockCheckBox = ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(this.DraggedBlock);
//        var locQuestionBlock = document.querySelector(`#${DraggedBlockCheckBox.name}`);

//        if (this.HoldBox.dataset.CanSwap == "true") {

//            console.log("交換位置" + this.HoldBox.dataset.CanSwap + typeof (this.HoldBox.dataset.CanSwap));

//            SwapMgr.swapDomObj(this.HoldBox, this.DraggedBlock);

//            var parentModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(this.DraggedBlock.parentNode);

//            if (parentModuleBlock &&
//                parentModuleBlock.dataset.QuestionMode == "true" &&
//                this.DraggedBlock.dataset.OptionMode == "true"
//            ) {
//                DraggedBlockCheckBox.name = parentModuleBlock.id;

//                ModuleOptionEditor.checkHasOption(parentModuleBlock);

//                ModuleOptionEditor.ResetAllOptionBecome_TargetCheckboxType(parentModuleBlock);
//            }

//        }

//        if (locQuestionBlock) {
//            ModuleOptionEditor.checkHasOption(locQuestionBlock);
//        }


//        console.log("交換位置");


//        this.ReSetDraggedBlock();
//    }





//    //=== [ 建立六點移動條 ] ===
//    static ReMove_AllModuleBlock_SixPointMoveBar() {

//        document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(ModuleBlock => {
//            this.ReMoveSixPointMoveBar(ModuleBlock);
//        });
//    }
//    static ReSetSixPointMoveBar(TargetModuleBlock) {


//        if (ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {

//            this.ReMoveSixPointMoveBar(TargetModuleBlock);

//            this.#AddSixPointMoveBar(TargetModuleBlock);

//        }
//    }
//    static ReMoveSixPointMoveBar(TargetModuleBlock) {

//        if (ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
//            const existingSixPointMoveBars = TargetModuleBlock.querySelectorAll(`.${this.SixPointMoveBarName}`);
//            if (existingSixPointMoveBars.length > 0) {
//                //console.log(`發現 ${existingSixPointMoveBars.length} 個 SixPointMoveBar，正在刪除...`);
//                existingSixPointMoveBars.forEach(bar => bar.remove()); // 删除所有匹配的元素
//            }
//        }
//        AutoScreen_js.resetAutoScreenBlockSize();
//    }
//    static #AddSixPointMoveBar(TargetModuleBlock) {
//        if (ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {

//            let SixPointMoveBar = this.#creatSixPointMoveBar(TargetModuleBlock);
//            const ModuleBlock_inner = ModuleDataFetcherMgr.GetTargetModuleBlock_Inner(TargetModuleBlock);
//            if (!ModuleBlock_inner) {
//                return;
//            }
//            ModuleBlock_inner.insertBefore(SixPointMoveBar, ModuleBlock_inner.firstChild);
//        }
//        AutoScreen_js.resetAutoScreenBlockSize();
//    }
//    static #creatSixPointMoveBar(TargetModuleBlock) {
//        var newSixPointMoveBar = document.createElement("div");

//        if (ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {

//            newSixPointMoveBar.dataset.ModuleBlockId = TargetModuleBlock.id;
//        }
//        newSixPointMoveBar.classList.add(this.SixPointMoveBarName);

//        var newSixPointIcon = document.createElement("div");
//        newSixPointIcon.classList.add("bi");
//        newSixPointIcon.classList.add("bi-grip-horizontal");
//        newSixPointMoveBar.appendChild(newSixPointIcon);

//        //newSixPointMoveBar.style.backgroundColor = ` ${ModuleBlock_ColortMgr.GetTargetCololrHex_VereyLight(ModuleBlock_ColortMgr.getLayerNumHex(TargetModuleBlock.dataset.ColorLayer))}`;


//        //newSixPointMoveBar.style.marginTop = '15px';

//        ModuleBlock_MoveMgr.ReSet_Action_SixPointMoveBar_BlockMove(newSixPointMoveBar);
//        return newSixPointMoveBar;
//    }




//    //=== [ 移動目標設置 ] ===
//    static ReMoveAll_ModuleBlock_MoveHoldTargetBar() {
//        document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(ModuleBlock => {


//            this.ReMove_MoveHoldTargetBar(ModuleBlock);
//        });
//    }
//    static ReMoveAll_ModuleBlock_MoveHoldTargetBarExceptDescendants(target) {
//        document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(ModuleBlock => {
//            if (!target.contains(ModuleBlock)) { // 排除掉子孙元素


//                this.ReMove_MoveHoldTargetBar(ModuleBlock);
//            }
//        });
//    }


//    static ReMoveAll_ModuleBlock_SpacingBar() {
//        document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(ModuleBlock => {
//            this.ReMove_SpacingBar(ModuleBlock);
//        });
//    }
//    static ReMove_SpacingBar(TargetModuleBlock) {

//        //return;
//        if (ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {

//            ModuleBlockEditMgr.SetModuleBlock_OnceTableDragStyle(TargetModuleBlock, false);


//        }
//    }
//    static ReSet_MoveHoldTargetBar(TargetModuleBlock) {

//        if (ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {


//            console.log(" 設定 關閉 風格 003");
//            this.ReMove_MoveHoldTargetBar(TargetModuleBlock);

//            this.#ShowMoveHoldTargetBar(TargetModuleBlock);
//        }
//    }
//    //解除放置狀態
//    static ReMove_MoveHoldTargetBar(TargetModuleBlock) {

//        //return;
//        if (ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
//            //console.log("======  關閉  ============");

//            const ModuleBlock_inner = TargetModuleBlock.querySelector(`.${ModuleBlockElementMgr.ModuleBlock_innerName}`);
//            if (!ModuleBlock_inner) {
//                return;
//            }


//            if (
//                !ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(TargetModuleBlock).querySelector("." + ModuleBlockElementMgr.ModuleBlockName)  //表格沒開 沒有其他模塊
//                &&
//                !ModuleBlockEditMgr.IsModuleBlock_TableGrid_Open(TargetModuleBlock)  //表格沒開
//            ) {

//                ModuleBlockEditMgr.OpenModuleBlock_OnceTable(TargetModuleBlock, false);
//            }
//            console.log(" 設定 關閉 風格 ");
//            ModuleBlockEditMgr.SetModuleBlock_OnceTableDragStyle(TargetModuleBlock, false);

//            ModuleBlock_inner.style.paddingTop = '';
//            ModuleBlock_inner.style.paddingBottom = '';

//        }

//    }
//    static #ShowMoveHoldTargetBar(TargetModuleBlock) {
//        if (ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
//            const ModuleBlock_inner = TargetModuleBlock.querySelector(`.${ModuleBlockElementMgr.ModuleBlock_innerName}`);
//            if (!ModuleBlock_inner) {
//                return;
//            }

//            //-------------------------------------------------------------------------------
//            ModuleBlock_inner.style.paddingTop = this.MoveHoldTargetTopValue + "px";
//            ModuleBlock_inner.style.paddingBottom = this.MoveHoldTargetBottomValue + "px";


//            //確認模塊類別
//            if (ModuleBlockEditMgr.IsModuleBlock_TableGrid_Open(TargetModuleBlock)) {
//                // ModuleBlockEditMgr.OpenModuleBlock_OnceTable(targetDiv, false);
//            }
//            else  /* if (!ModuleBlockEditMgr.IsModuleBlock_OnceTable_Open(TargetModuleBlock))*/ {
//                //ModuleBlockEditMgr.OpenModuleBlock_OnceTable(TargetModuleBlock, true);
//                ModuleBlockEditMgr.SetModuleBlock_OnceTableDragStyle(TargetModuleBlock, true);
//            }

//        }
//    }
//    //確認滑鼠在上在下

//    static SetHoldBoxInByTrackMousePosition_ModuleBlock(event, targetDiv) {

//        if (ModuleBlock_MoveMgr.DraggedBlock === targetDiv) {
//            console.log("DraggedBlock === targetDiv");

//            return;
//        }

//        if (!ModuleBlockElementMgr.checkIsModuleBlock(targetDiv)) {

//            return;
//        }
//        const rect = targetDiv.getBoundingClientRect(); // 获取目标DIV的位置信息

//        const OnceTable = ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(targetDiv);
//        const TableGrid = ModuleDataFetcherMgr.GetTargetModuleBlock_TableGrid(targetDiv);

//        let TopScope = rect.top;
//        let DownScope = rect.top + rect.height - (ModuleBlock_MoveMgr.MoveHoldTargetBottomValue); //下面範圍
//        if (OnceTable && OnceTable.style.display !== "none") {
//            const OnceTableRect = OnceTable.getBoundingClientRect(); // 获取目标DIV的位置信息
//            if (TopScope < OnceTableRect.top) {
//                TopScope = OnceTableRect.top;
//            }

//            //if (DownScope > OnceTableRect.top + OnceTableRect.height) {
//            //    DownScope = OnceTableRect.top + OnceTableRect.height;
//            //    console.warn(`設定成 OnceTable 底下`);
//            //}
//        }
//        if (TableGrid && TableGrid.style.display !== "none") {
//            const TableGridRect = TableGrid.getBoundingClientRect(); // 获取目标DIV的位置信息
//            if (TopScope < TableGridRect.top) {
//                TopScope = TableGridRect.top;
//            }

//            //if (DownScope > TableGridRect.top + TableGridRect.height) {
//            //    DownScope = TableGridRect.top + TableGridRect.height;
//            //    console.warn(`設定成 TableGrid 底下`);
//            //}
//        }
//        let mouseY = event.clientY;

//        TopScope = (TopScope + rect.top) / 2;


//        if (mouseY < TopScope) {
//            this.SetHoldBoxBefore(targetDiv);


//        }
//        else if (mouseY > DownScope) {
//            this.SetHoldBoxAfter(targetDiv);
//        }



//    }


//    ///=== [ 模塊移動用 Event確認 ] ===========================================================================================

//    static CheckEventisEnd_BlockMove_MouseEnter(event) {
      
//        let IsEnd = event.BlockMove_MouseEnter_Isend;
//        event.BlockMove_MouseEnter_Isend = true;
//        this.EventLogTag(event, "MouseEnter-" + IsEnd);

//        if (!ModuleBlock_MoveMgr.canMoveNow) {
//            IsEnd = true;
//        }


//        return IsEnd;
//    }   //滑鼠移入

//    static CheckEventisEnd_BlockMove_MouseLeave(event) {
     
//        this.EventLogTag(event, "MouseLeave");
//        let IsEnd = event.BlockMove_MouseLeave_Isend;
//        event.BlockMove_MouseLeave_Isend = true;
//        if (!ModuleBlock_MoveMgr.canMoveNow) {
//            IsEnd = true;
//        }
//        return IsEnd;
//    }   //滑鼠移出

//    static CheckEventisEnd_BlockMove_DragStart(event) {
//        this.EventLogTag(event, "DragStart");
//        let IsEnd = event.BlockMove_DragStart_Isend;
//        event.BlockMove_DragStart_Isend = true;
//        if (!ModuleBlock_MoveMgr.canMoveNow) {
//            IsEnd = true;
//        }
//        return IsEnd;
//    }   //抓取-開始

//    static CheckEventisEnd_BlockMove_DragEnd(event) {
//        this.EventLogTag(event, "DragEnd");
//        let IsEnd = event.BlockMove_DragEnd_Isend;
//        event.BlockMove_DragEnd_Isend = true;

//        return IsEnd;
//    }   // 抓取-結束

//    //---------------------------------------------------------------

//    static CheckEventisEnd_BlockMove_DragEnter(event) {
//        this.EventLogTag(event, "DragEnter");
//        let IsEnd = event.BlockMove_DragEnter_Isend;
//        event.BlockMove_DragEnter_Isend = true;
//        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') {
//            IsEnd = true;
//        }
//        const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);
//        if (TargetModuleBlock === ModuleBlock_MoveMgr.DraggedBlock) {
//            IsEnd = true;
//        }
//        return IsEnd;
//    }   // 拖曳-進來

//    static CheckEventisEnd_BlockMove_DragLeave(event) {
//        this.EventLogTag(event, "DragLeave");
//        let IsEnd = event.BlockMove_DragLeave_Isend;
//        event.BlockMove_DragLeave_Isend = true;
//        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') {
//            IsEnd = true;
//        }
//        const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);
//        if (TargetModuleBlock === ModuleBlock_MoveMgr.DraggedBlock) {
//            IsEnd = true;
//        }
//        return IsEnd;
//    }   // 拖曳-離開

//    static CheckEventisEnd_BlockMove_Drop(event) {
//        this.EventLogTag(event, "Drop");
//        let IsEnd = event.BlockMove_Drop_Isend;
//        event.BlockMove_Drop_Isend = true;
//        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') {
//            IsEnd = true;
//        }
//        const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);
//        if (TargetModuleBlock === ModuleBlock_MoveMgr.DraggedBlock) {
//            IsEnd = true;
//        }
//        return IsEnd;
//    }   // 拖曳-放置

//    //---------------------------------------------------------------
//    static CheckEventisEnd_BlockMove_DragOver(event) {

//        //this.EventLogTag(event, "DragOver");
//        let IsEnd = event.BlockMove_DragOver_Isend;

//        //if (!IsEnd) {
//        //    this.EventLogTag(event, "DragOver_調用");
//        //}
//        //else {
//        //    //this.EventLogTag(event, "DragOver_非調用");
//        //}
//        this.EventLogTag(event, "DragOver");

//        event.BlockMove_DragOver_Isend = true;
//        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') {
//            IsEnd = true;
//        }
//        const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);
//        if (TargetModuleBlock === ModuleBlock_MoveMgr.DraggedBlock) {
//            IsEnd = true;
//        }
//        return IsEnd;
//    }   // 拖曳-移動中
//    static CheckEventisEnd_BlockMove_DragOver_SetHoldBoxIn(event) {
//        this.EventLogTag(event, "DragMoveBlock DragOver_SetHoldBoxIn");
//        let IsEnd = event.BlockMove_DragMoveBlock_SetHoldBoxIn_Isend;

//        event.BlockMove_DragMoveBlock_SetHoldBoxIn_Isend = true;
//        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') {
//            //event.BlockMove_DragMoveBlock_SetHoldBoxIn_Isend = true;
//            IsEnd = true;
//        }
//        const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);
//        if (TargetModuleBlock === ModuleBlock_MoveMgr.DraggedBlock) {
//            //event.BlockMove_DragMoveBlock_SetHoldBoxIn_Isend = true;
//            IsEnd = true;
//        }
//        return IsEnd;
//    }   // 拖曳-移動--特殊
//    static CheckEventisEnd_BlockMove_DragOver_SetInnerMoveBar(event) {
//        this.EventLogTag(event, "DragMoveBlock DragOver_SetInnerMoveBar");
//        let IsEnd = event.BlockMove_DragMoveBlock_SetInnerMoveBar_Isend;

//        event.BlockMove_DragMoveBlock_SetInnerMoveBar_Isend = true;
//        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') {
//            IsEnd = true;
//        }
//        const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);
//        if (TargetModuleBlock === ModuleBlock_MoveMgr.DraggedBlock) {
//            IsEnd = true;
//        }
//        return IsEnd;
//    }   // 拖曳-移動--特殊
//    static CheckEventisEnd_BlockMove_DragOver_SetSpacing(event) {
//        this.EventLogTag(event, "DragMoveBlock");
//        let IsEnd = event.BlockMove_DragMoveBlock_SetSpacing_Isend;

//        event.BlockMove_DragMoveBlock_SetSpacing_Isend = true;
//        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') {
//            IsEnd = true;
//        }
//        const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);
//        if (TargetModuleBlock === ModuleBlock_MoveMgr.DraggedBlock) {
//            IsEnd = true;
//        }


//        return IsEnd;
//    }   // 拖曳-移動--特殊
//    //---------------------------------------------------------------
//    static EventLogTag(event, type) {
//        const tagName = event.currentTarget.className;
//        return;
//        console.log(`tagName: ${tagName} - ${type}`); // 輸出目標的標籤名稱（例如：BUTTON, INPUT, P）
//    }


//    ///##### [ 設定 HoldBox 移動邏輯] #####
//    static ReSet_Action_HoldBox_BlockMove() {
//        // 重新設定 BlockMover 事件，處理拖曳進入邏輯
//        this.Remove_Action_HoldBox_BlockMove();
//        this.#Set_Action_HoldBox_BlockMove();

//    }   //重置HoldBox移動邏輯
//    static Remove_Action_HoldBox_BlockMove() {
//        this.#Remove_HoldBox_Action_SeriesDrag();
//    }
//    static #Set_Action_HoldBox_BlockMove() {

//        this.#Set_HoldBox_Action_SeriesDrag()
//    }
//    //===[ Drag ]===
//    static #Remove_HoldBox_Action_SeriesDrag() {

//        // 刪除設定 DragEnter 事件，處理拖曳進入邏輯
//        this.HoldBox.removeEventListener("dragenter", this.#HoldBox_DragEnter_EventAction);

//        // 刪除設定 DragOver 事件，處理拖曳移動
//        this.HoldBox.removeEventListener("dragover", this.#HoldBox_DragOver_EventAction);

//        // 刪除設定 drop 事件，處理放置邏輯
//        this.HoldBox.removeEventListener("drop", this.#HoldBox_Drop_EventAction);
//    }
//    static #Set_HoldBox_Action_SeriesDrag() {
//        // 設定 DragEnter 事件，處理拖曳進入邏輯
//        this.HoldBox.addEventListener("dragenter", this.#HoldBox_DragEnter_EventAction);

//        // 設定 DragOver 事件，處理拖曳移動
//        this.HoldBox.addEventListener("dragover", this.#HoldBox_DragOver_EventAction);

//        // 設定 drop 事件，處理放置邏輯
//        this.HoldBox.addEventListener("drop", this.#HoldBox_Drop_EventAction);
//    }
//    //---EventAction
//    static #HoldBox_DragEnter_EventAction(event) {

//        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragEnter(event)) {

//        }
//    }   //移動邏輯[拖曳-進來]

//    static #HoldBox_DragOver_EventAction(event) {
//        event.preventDefault();  // 必須調用 preventDefault 來允許放置
//        //console.log("HoldBox_DragOver_EventAction");
//        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragOver_SetInnerMoveBar(event)) {
//        }
//        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragOver_SetSpacing(event)) {
//        }
//        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragOver_SetHoldBoxIn(event)) {

//        }
//    }   //移動邏輯[拖曳-移動中]

//    static #HoldBox_Drop_EventAction(event) {
//        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_Drop(event)) {

//            ModuleBlock_MoveMgr.#holdBox_Drop();
//        }
//    }   //移動邏輯[拖曳-放置]


//    ///##### [ 設定 六點移動條 移動邏輯] #####

//    static checkIsSixPointMoveBar(targetSixPointMoveBar) {
//        if (targetSixPointMoveBar.nodeType !== 1) {
//            console.log("目標不是DOM元素");
//            return false;
//        }
//        // 检查是否包含某个 class
//        if (!targetSixPointMoveBar.classList.contains(this.SixPointMoveBarName)) {
//            console.log("目標不是SixPointMoveBar元素");
//            return false;
//        }

//        return true;
//    }

//    static ReSet_Action_SixPointMoveBar_BlockMove(targetSixPointMoveBar) {

//        if (!this.checkIsSixPointMoveBar(targetSixPointMoveBar)) { return; }

//        this.Remove_Action_SixPointMoveBar_BlockMove(targetSixPointMoveBar);
//        this.#Set_Action_SixPointMoveBar_BlockMove(targetSixPointMoveBar);

//    }

//    static Remove_Action_SixPointMoveBar_BlockMove(targetSixPointMoveBar) {

//        this.#Remove_SixPointMoveBar_Action_SeriesDrag(targetSixPointMoveBar);
//    }

//    static #Set_Action_SixPointMoveBar_BlockMove(targetSixPointMoveBar) {

//        this.#Set_SixPointMoveBar_Action_SeriesDrag(targetSixPointMoveBar)
//    }
//    //===[ Drag ]===
//    static #Remove_SixPointMoveBar_Action_SeriesDrag(targetSixPointMoveBar) {

//        if (!this.checkIsSixPointMoveBar(targetSixPointMoveBar)) { return; }
//        //使該元素可以被拖曳
//        targetSixPointMoveBar.setAttribute("draggable", "false");
//        //-----------------------------------------------------------------
//        targetSixPointMoveBar.removeEventListener("dragstart", this.#SixPointMoveBar_DragStart_EventAction);
//        //-----------------------------------------------------------------
//        targetSixPointMoveBar.removeEventListener("dragend", this.#SixPointMoveBar_DragEnd_EventAction);


//    }
//    static #Set_SixPointMoveBar_Action_SeriesDrag(targetSixPointMoveBar) {

//        if (!this.checkIsSixPointMoveBar(targetSixPointMoveBar)) { return; }

//        //使該元素可以被拖曳
//        targetSixPointMoveBar.setAttribute("draggable", "true");
//        //-----------------------------------------------------------------
//        targetSixPointMoveBar.addEventListener("dragstart", this.#SixPointMoveBar_DragStart_EventAction);
//        //-----------------------------------------------------------------
//        targetSixPointMoveBar.addEventListener("dragend", this.#SixPointMoveBar_DragEnd_EventAction);
//    }
//    //---EventAction
//    static #SixPointMoveBar_DragStart_EventAction(event) {

//        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragStart(event)) {

//            console.log("SixPointMoveBar_DragStartAction_" + event.currentTarget.dataset.ModuleBlockId);
//            const TargetModuleBlock = document.getElementById(event.currentTarget.dataset.ModuleBlockId);

//            if (TargetModuleBlock) {
//                ModuleBlock_MoveMgr.SetDraggedBlock(TargetModuleBlock);
//            } else { return; }

//            const emptyImage = new Image();
//            emptyImage.src = ""; // 使用空白图像
//            event.dataTransfer.setDragImage(emptyImage, 0, 0);
//            setTimeout(() => {
//                ModuleBlock_MoveMgr.ReSetAll_Action_ModuleBlock_BlockMove();
//                ModuleBlock_MoveMgr.ReSetAll_Action_TableField_BlockMove();
//                //------------------------------------------------------------------
//                ModuleBlock_MoveMgr.ResetHoldBoxDragStart(TargetModuleBlock);


//                //關閉所有模塊 六點移動條 檢測
//                ModuleBlock_MoveMgr.RemoveAll_ModuleBlock_Action_SeriesMouse();
//                //停止模塊 拖曳事件往上冒泡
//                console.log("停止模塊 拖曳事件往上冒泡");
//                ModuleBlock_MoveMgr.SetStopPropagation_Action_ModuleBlock_BlockMove(TargetModuleBlock);
//                //------------------------------------------------------------------

//                TargetModuleBlock.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(_ModuleBlock => {
//                    ModuleBlock_MoveMgr.Remove_ModuleBlock_Action_SeriesDrag(_ModuleBlock);
//                });

//                //------------------------------------------------------------------
//                TargetModuleBlock.querySelectorAll(`.${ModuleBlockElementMgr.TableFieldName}`).forEach(_TableField => {
//                    ModuleBlock_MoveMgr.Remove_Action_TableField_BlockMove(_TableField);
//                });


//            }, 0);
//        }

//    }  //抓取     <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<未完成還需要修改
//    static #SixPointMoveBar_DragEnd_EventAction(event) {


//        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragStart(event)) {

//            ModuleBlock_MoveMgr.ReSetAll_Action_ModuleBlock_BlockMove();
//            ModuleBlock_MoveMgr.ReSetAll_Action_TableField_BlockMove();

//            //------------------------------------------------------------------

//            ModuleBlock_MoveMgr.closeHoldBoxParentNodeTextBoxColor();

//            //------------------------------------------------------------------
//            ModuleBlock_MoveMgr.ReSetDraggedBlock();
//            ModuleBlock_MoveMgr.CloseHoldBox();
//            console.log("拖曳結束時 刪除所有上下bar");
//            //拖曳結束時 刪除所有上下bar
//            ModuleBlock_MoveMgr.ReMoveAll_ModuleBlock_MoveHoldTargetBar();
//            ModuleBlock_MoveMgr.ReMoveAll_ModuleBlock_SpacingBar();
//            //------------------------------------------------------------------
//            AutoScreen_js.resetAutoScreenBlockSize();

//        }
//    }


//    ///##### [ 設定 ModuleBlock 移動邏輯] #####


//    static SetStopPropagation_Action_ModuleBlock_BlockMove(targetModuleBlock) {
//        if (!ModuleBlockElementMgr.checkIsModuleBlock(targetModuleBlock)) {
//            return;
//        }
//        console.log("阻止模塊冒泡");
//        //this.Remove_ModuleBlock_Action_SeriesDrag(targetModuleBlock);
//        ////-----------------------------------------------------------------
//        //targetModuleBlock.removeEventListener('dragenter', this.CheckEventisEnd_BlockMove_DragEnter);
//        ////-----------------------------------------------------------------
//        //targetModuleBlock.removeEventListener('dragover', (event => { ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragOver(event) }));
//        ////-----------------------------------------------------------------
//        //targetModuleBlock.removeEventListener('dragleave', this.CheckEventisEnd_BlockMove_DragLeave);
//        //-----------------------------------------------------------------
//        //targetModuleBlock.removeEventListener('drop', this.CheckEventisEnd_BlockMove_DragEnd);
//    }


//    static ReSetAll_Action_ModuleBlock_BlockMove() {
//        this.ReSetAll_ModuleBlock_Action_SeriesMouse();
//        this.ReSetAll_ModuleBlock_Action_SeriesDrag();
//    }
//    static RemoveAll_Action_ModuleBlock_BlockMove() {
//        this.RemoveAll_ModuleBlock_Action_SeriesMouse();
//        this.RemoveAll_ModuleBlock_Action_SeriesDrag();
//    }
//    static ReSet_Action_ModuleBlock_BlockMove(targetModuleBlock) {
//        if (!ModuleBlockElementMgr.checkIsModuleBlock(targetModuleBlock)) {
//            return;
//        }
//        this.ReSet_ModuleBlock_Action_SeriesMouse(targetModuleBlock);
//        this.ReSet_ModuleBlock_Action_SeriesDrag(targetModuleBlock);
//    }

//    //===[ Mouse ]===
//    static RemoveAll_ModuleBlock_Action_SeriesMouse() {

//        document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(ModuleBlock => {
//            this.Remove_ModuleBlock_Action_SeriesMouse(ModuleBlock);
//        });
//    }
//    static ReSetAll_ModuleBlock_Action_SeriesMouse() {

//        document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(ModuleBlock => {
//            this.ReSet_ModuleBlock_Action_SeriesMouse(ModuleBlock);
//        });
//    }
//    //----------------------------------------------------------
//    static ReSet_ModuleBlock_Action_SeriesMouse(targetModuleBlock) {

//        this.Remove_ModuleBlock_Action_SeriesMouse(targetModuleBlock);
//        this.#Set_ModuleBlock_Action_SeriesMouse(targetModuleBlock);

//    }
//    static Remove_ModuleBlock_Action_SeriesMouse(targetModuleBlock) {

//        if (!ModuleBlockElementMgr.checkIsModuleBlock(targetModuleBlock)) { return; }
//        //-----------------------------------------------------------------
//        targetModuleBlock.removeEventListener('mouseenter', this.#ModuleBlock_MouseEnter_EventAction); //不冒泡
//        //-----------------------------------------------------------------
//        //targetModuleBlock.removeEventListener('mousemove',);
//        //-----------------------------------------------------------------
//        //targetModuleBlock.removeEventListener('mouseenter', this.ModuleBlock_MouseEnter); //不冒泡
//        //-----------------------------------------------------------------
//        targetModuleBlock.removeEventListener('mouseleave', this.#ModuleBlock_MouseLeave_EventAction); //不冒泡
//        //-----------------------------------------------------------------
//    }
//    static #Set_ModuleBlock_Action_SeriesMouse(targetModuleBlock) {

//        if (!ModuleBlockElementMgr.checkIsModuleBlock(targetModuleBlock)) { return; }
//        //-----------------------------------------------------------------
//        targetModuleBlock.addEventListener('mouseenter', this.#ModuleBlock_MouseEnter_EventAction);
//        //-----------------------------------------------------------------
//        //targetModuleBlock.addEventListener('mousemove', this.ModuleBlock_MouseLeave);
//        //-----------------------------------------------------------------
//        //targetModuleBlock.addEventListener('mouseenter', this.ModuleBlock_MouseEnter); //不冒泡
//        //-----------------------------------------------------------------
//        targetModuleBlock.addEventListener('mouseleave', this.#ModuleBlock_MouseLeave_EventAction); //不冒泡
//        //-----------------------------------------------------------------
//    }
//    //---EventAction
//    static #ModuleBlock_MouseEnter_EventAction(event) {
//        return;
//        if (ModuleBlock_MoveMgr.ForceMoveNow) {
//            return;
//        }

//        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_MouseEnter(event)) {
//            //console.log("ModuleBlock_MouseEnter" + (event.target == event.currentTarget) +"    " +event.currentTarget.id);
//            ModuleBlock_MoveMgr.ReMove_AllModuleBlock_SixPointMoveBar();
//            ModuleBlock_MoveMgr.ReSetSixPointMoveBar(event.currentTarget);
//        }
//    }
//    static #ModuleBlock_MouseLeave_EventAction(event) {
//        return;
//        if (ModuleBlock_MoveMgr.ForceMoveNow) {
//            return;
//        }
//        //console.log("離開" + event.currentTarget.id);
//        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_MouseLeave(event)) {
//            ModuleBlock_MoveMgr.ReMove_AllModuleBlock_SixPointMoveBar();
//            //console.log("ModuleBlock_MouseLeave" + (event.target == event.currentTarget) + "    " + event.currentTarget.id);
//            var currentTarget = ModuleDataFetcherMgr.GetTargetModuleBlock(event.currentTarget.parentNode);
//            if (currentTarget) {

//                ModuleBlock_MoveMgr.ReSetSixPointMoveBar(currentTarget);
//            }
//        }
//    }


//    //===[ Drag ]===
//    static RemoveAll_ModuleBlock_Action_SeriesDrag() {

//        document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(ModuleBlock => {
//            this.Remove_ModuleBlock_Action_SeriesDrag(ModuleBlock);
//        });
//    }
//    static ReSetAll_ModuleBlock_Action_SeriesDrag() {

//        document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(ModuleBlock => {
//            this.ReSet_ModuleBlock_Action_SeriesDrag(ModuleBlock);
//        });
//    }
//    //----------------------------------------------------------
//    static ReSet_ModuleBlock_Action_SeriesDrag(targetModuleBlock) {
//        this.Remove_ModuleBlock_Action_SeriesDrag(targetModuleBlock);
//        this.#Set_ModuleBlock_Action_SeriesDrag(targetModuleBlock);

//    }
//    static Remove_ModuleBlock_Action_SeriesDrag(targetModuleBlock) {

//        if (!ModuleBlockElementMgr.checkIsModuleBlock(targetModuleBlock)) { return; }
//        //-----------------------------------------------------------------
//        targetModuleBlock.removeEventListener('dragenter', this.#ModuleBlock_DragEnter_EventAction);
//        //-----------------------------------------------------------------
//        targetModuleBlock.removeEventListener('dragover', this.#ModuleBlock_DragOver_EventAction);
//        //-----------------------------------------------------------------
//        targetModuleBlock.removeEventListener('dragleave', this.#ModuleBlock_DragLeave_EventAction);
//        //-----------------------------------------------------------------
//        targetModuleBlock.removeEventListener('drop', this.#ModuleBlock_Drop_EventAction);
//        //-----------------------------------------------------------------
//        var InnerBlock = ModuleDataFetcherMgr.GetTargetModuleBlock_Inner(targetModuleBlock);
//        if (!InnerBlock) { return; }
//        //-----------------------------------------------------------------
//        InnerBlock.removeEventListener('dragenter', this.#InnerBlock_DragEnter_EventAction);
//        //-----------------------------------------------------------------
//        InnerBlock.removeEventListener('dragover', this.#InnerBlock_DragOver_EventAction);
//        //-----------------------------------------------------------------
//        InnerBlock.removeEventListener('dragleave', this.#InnerBlock_DragLeave_EventAction);
//        //-----------------------------------------------------------------
//        InnerBlock.removeEventListener('drop', this.#InnerBlock_Drop_EventAction);

//    }
//    static #Set_ModuleBlock_Action_SeriesDrag(targetModuleBlock) {

//        if (!ModuleBlockElementMgr.checkIsModuleBlock(targetModuleBlock)) { return; }
//        //-----------------------------------------------------------------
//        targetModuleBlock.addEventListener('dragenter', this.#ModuleBlock_DragEnter_EventAction);
//        //-----------------------------------------------------------------
//        targetModuleBlock.addEventListener('dragover', this.#ModuleBlock_DragOver_EventAction);
//        //-----------------------------------------------------------------
//        targetModuleBlock.addEventListener('dragleave', this.#ModuleBlock_DragLeave_EventAction);
//        //-----------------------------------------------------------------
//        targetModuleBlock.addEventListener('drop', this.#ModuleBlock_Drop_EventAction);
//        //-----------------------------------------------------------------
//        var InnerBlock = ModuleDataFetcherMgr.GetTargetModuleBlock_Inner(targetModuleBlock);
//        if (!InnerBlock) { return; }
//        //-----------------------------------------------------------------
//        InnerBlock.addEventListener('dragenter', this.#InnerBlock_DragEnter_EventAction);
//        //-----------------------------------------------------------------
//        InnerBlock.addEventListener('dragover', this.#InnerBlock_DragOver_EventAction);
//        //-----------------------------------------------------------------
//        InnerBlock.addEventListener('dragleave', this.#InnerBlock_DragLeave_EventAction);
//        //-----------------------------------------------------------------
//        InnerBlock.addEventListener('drop', this.#InnerBlock_Drop_EventAction);
//    }
//    //---EventAction
//    static #ModuleBlock_DragEnter_EventAction(event) {

//        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') {
//            return;
//        }

//        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragEnter(event)) {

//            ModuleBlock_MoveMgr.ReMoveAll_ModuleBlock_MoveHoldTargetBarExceptDescendants(event.currentTarget);
//        }

//        const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.currentTarget);
//        if (TargetModuleBlock !== ModuleBlock_MoveMgr.DraggedBlock) {
//            const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.currentTarget);

//            console.log("關閉顏色");
//            ModuleBlock_MoveMgr.ReSet_MoveHoldTargetBar(TargetModuleBlock);

//            if (
//                !ModuleBlockEditMgr.IsModuleBlock_TableGrid_Open(TargetModuleBlock)
//            ) {
//                console.log("打開列表");
//                ModuleBlockEditMgr.OpenModuleBlock_OnceTable(TargetModuleBlock, true);
//            }

//            ModuleBlock_MoveMgr.setHoldBoxParentNodeTextBoxColor();
//        }

//    }

//    static #ModuleBlock_DragOver_EventAction(event) {

//        event.preventDefault();


//        //根據上下 設定 HoldBox 上下  會被攔截
//        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragOver_SetHoldBoxIn(event)) {
//            //console.log("CheckEventisEnd_BlockMove_DragOver_SetHoldBoxIn");
//            ModuleBlock_MoveMgr.SetHoldBoxInByTrackMousePosition_ModuleBlock(event, event.currentTarget);
//        }

//    }

//    static #ModuleBlock_DragLeave_EventAction(event) {

//        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragLeave(event)) {


//        }
//    }

//    static #ModuleBlock_Drop_EventAction(event)//////////////////////////////////////////////////////////////////////////////////////////////////////////  好像可以加在AUTO SCREAM
//    {


//        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_Drop(event)) {

//            ModuleBlock_MoveMgr.#holdBox_Drop(event);
//        }

//        console.log("ModuleBlock_Drop");
//    }

//    //---EventAction---[ InnerBlock ]



//    static #InnerBlock_DragEnter_EventAction(event) { }

//    static #InnerBlock_DragOver_EventAction(event) {

//        event.preventDefault();
//        //console.log("InnerBlock_DragOver_EventAction");

//    }

//    static #InnerBlock_DragLeave_EventAction(event) { }

//    static #InnerBlock_Drop_EventAction(event) { }



//    ///=== [ 設定 TableField 移動邏輯] ==============================================================================

//    static ReSetAll_Action_TableField_BlockMove() {

//        document.querySelectorAll(`.${ModuleBlockElementMgr.TableFieldName}`).forEach(_TableField => {
//            ModuleBlock_MoveMgr.ReSet_Action_TableField_BlockMove(_TableField);
//        });
//    }
//    static RemoveAll_Action_TableField_BlockMove() {

//        document.querySelectorAll(`.${ModuleBlockElementMgr.TableFieldName}`).forEach(_TableField => {
//            ModuleBlock_MoveMgr.Remove_Action_TableField_BlockMove(_TableField);
//        });
//    }
//    //----------------------------------------------------------

//    static ReSet_Action_TableField_BlockMove(targetTableField) {
//        if (!ModuleBlockElementMgr.checkIsTableField(targetTableField)) {
//            return;
//        }
//        this.ReSet_TableField_Action_SeriesDrag(targetTableField);
//    }
//    //Remove_TableField_Action_SeriesDrag(targetTableField) 
//    static Remove_Action_TableField_BlockMove(targetTableField) {
//        if (!ModuleBlockElementMgr.checkIsTableField(targetTableField)) {
//            return;
//        }
//        this.Remove_TableField_Action_SeriesDrag(targetTableField);
//    }
//    //===[ Drag ]===
//    static ReSetAll_TableField_Drag() {

//        document.querySelectorAll(`.${ModuleBlockElementMgr.TableFieldName}`).forEach(_TableField => {
//            this.ReSet_TableField_Action_SeriesDrag(_TableField);
//        });

//    }

//    //----------------------------------------------------------
//    static ReSet_TableField_Action_SeriesDrag(targetTableField) {

//        if (!ModuleBlockElementMgr.checkIsTableField(targetTableField)) {
//            return;
//        }

//        //-----------------------------------------------------------------
//        this.Remove_TableField_Action_SeriesDrag(targetTableField);
//        this.#Set_TableField_Action_SeriesDrag(targetTableField);
//        //-----------------------------------------------------------------

//    }
//    static Remove_TableField_Action_SeriesDrag(targetTableField) {

//        if (!ModuleBlockElementMgr.checkIsTableField(targetTableField)) {
//            return;
//        }

//        //-----------------------------------------------------------------
//        targetTableField.removeEventListener("dragenter", this.#TableField_DragEnter_EventAction);
//        //-----------------------------------------------------------------
//        targetTableField.removeEventListener("dragleave", this.#TableField_DragLeave_EventAction);
//        //-----------------------------------------------------------------
//        targetTableField.removeEventListener("dragover", this.#TableField_DragOver_EventAction);
//        //-----------------------------------------------------------------
//        targetTableField.removeEventListener("drop", ModuleBlock_MoveMgr.HoldBox_Drop);

//    }
//    static #Set_TableField_Action_SeriesDrag(targetTableField) {

//        if (!ModuleBlockElementMgr.checkIsTableField(targetTableField)) {
//            return;
//        }
//        //-----------------------------------------------------------------
//        targetTableField.addEventListener("dragenter", this.#TableField_DragEnter_EventAction);
//        //-----------------------------------------------------------------
//        targetTableField.addEventListener("dragleave", this.#TableField_DragLeave_EventAction);
//        //-----------------------------------------------------------------
//        targetTableField.addEventListener("dragover", this.#TableField_DragOver_EventAction);
//        //-----------------------------------------------------------------
//        targetTableField.addEventListener("drop", ModuleBlock_MoveMgr.HoldBox_Drop);

//    }

//    //---EventAction
//    static #TableField_DragEnter_EventAction(event) {

//        //event.stopPropagation();
//        //if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragEnter(event)) {

//        //}
//    }
//    static #TableField_DragLeave_EventAction(event) {

//        //if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragLeave(event)) {

//        //}
//    }
//    static #TableField_DragOver_EventAction(event) {

//        //console.log("TableField_DragOver_EventAction");
//        event.preventDefault();  // 阻止默认行为，允许放置


//        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragOver_SetSpacing(event)) {


//        }
//        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragOver_SetHoldBoxIn(event)) {
//            console.warn("塞在  ableField_ " + ModuleDataFetcherMgr.GetTargetModuleBlock(event.currentTarget).id);
//            ModuleBlock_MoveMgr.TrySetHoldBoxIn(event.currentTarget);
//        }

//    }


//}


//================== 模塊 [ 選擇目標 ] 管理 ==================
class ModuleBlock_SelectTargetMgr {
    static #CanSelectTargetNow = true;
    static get CanSelectTargetNow() {
        return ModuleBlock_SelectTargetMgr.#CanSelectTargetNow;
    }
    static set CanSelectTargetNow(value) {
        if (typeof value === 'boolean') {

            ModuleBlock_SelectTargetMgr.#CanSelectTargetNow = value;
            console.log(`SetModuleBlockSelectTarget   ${value}`);

            if (value) {
                //console.log(`SetModuleBlockSelectTarget   ${value}    ${ModuleBlock_Main.GetSelectTarget().id }`);
                //ModuleBlock_SelectTargetMgr.SetModuleBlockSelectTarget(ModuleBlock_Main.GetSelectTarget());
                ModuleBlock_SelectTargetMgr.showModuleBlockSelectTarget();
            }
            else {

                ModuleBlock_SelectTargetMgr.RemoveModuleBlockSelectTarget();
                document.querySelectorAll(".UpSettingBar").forEach(bar => bar.remove());
                document.querySelectorAll(".DownSettingBar").forEach(bar => bar.remove());
            }

        } else {
            throw new TypeError('canMoveNow must be a boolean');
        }
    }
    //------------------------------------------
    static TargetTagWeight = "10";
    static TargetTagParentWeight = "3";
    static TargetTagPeerWeight = "7";
    static TargetTagSubWeight = "5";

    static init() {


        window.addEventListener('beforeprint', () => {
            ModuleBlock_SelectTargetMgr.RemoveModuleBlockSelectTarget();
        }
        );

        window.addEventListener('afterprint', () => {
            ModuleBlock_SelectTargetMgr.showModuleBlockSelectTarget();
        }
        );

        document.removeEventListener("click", this.#ModuleBlock_Click_Select);
        document.addEventListener("click", this.#ModuleBlock_Click_Select);
    }

    static #ModuleBlock_Click_Select(event) {

        var targetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);
        if (targetModuleBlock) {

            ModuleBlock_SelectTargetMgr.SetModuleBlockSelectTarget(targetModuleBlock);
            ModuleBlock_SelectTargetMgr.SetModuleBlockShowAssociation(targetModuleBlock);
        }
        else {

            if (event.target.closest(".floating-panel")) { return; }

            if (event.target.closest("#editTextModal")) { return; }

            ModuleBlock_SelectTargetMgr.RemoveModuleBlockSelectTarget();
        }

        if (!ModuleBlock_SelectTargetMgr.CanSelectTargetNow) {
            ModuleBlock_SelectTargetMgr.RemoveModuleBlockSelectTarget();
            document.querySelectorAll(".UpSettingBar").forEach(bar => bar.remove());
            document.querySelectorAll(".DownSettingBar").forEach(bar => bar.remove());
        }

    }

    ///=== [ 選擇目標用 Event確認 ] ===========================================================================================
    static CheckEventisEnd_SelectTarget_Click(event) {
        let IsEnd = event.SelectTarget_Click_Isend;
        event.SelectTarget_Click_Isend = true;
        return IsEnd;
    }   //抓取-開始

    ///=== [ 設定 ModuleBlock 選取目標邏輯 ] ===
    static ReSet_Action_ModuleBlock_SelectTarget(targetModuleBlock) {
        return;
        if (!ModuleBlockElementMgr.checkIsModuleBlock(targetModuleBlock)) {
            return;
        }

        this.#ReSet_ModuleBlock_Click(targetModuleBlock);
    }

    //===[ Click ]===
    static #ReSet_ModuleBlock_Click(targetModuleBlock) {

        this.#Remove_ModuleBlock_Click(targetModuleBlock);
        this.#Set_ModuleBlock_Click(targetModuleBlock);

    }

    static #Remove_ModuleBlock_Click(targetModuleBlock) {


        if (!ModuleBlockElementMgr.checkIsModuleBlock(targetModuleBlock)) { return; }

        targetModuleBlock.removeEventListener('click', this.#ModuleBlock_Click_EventAction);
    }
    static #Set_ModuleBlock_Click(targetModuleBlock) {

        if (!ModuleBlockElementMgr.checkIsModuleBlock(targetModuleBlock)) { return; }
        //-----------------------------------------------------------------
        targetModuleBlock.addEventListener("click", this.#ModuleBlock_Click_EventAction);
    }
    //----------------------------------------------------------
    static #ModuleBlock_Click_EventAction(event) {

        console.log("選擇模塊 : " + event.currentTarget.id + "==========" + event.target.className);
        if (!ModuleBlock_SelectTargetMgr.CheckEventisEnd_SelectTarget_Click(event)) {
            if (event.currentTarget.contains(event.target)) {
                ModuleBlock_SelectTargetMgr.SetModuleBlockSelectTarget(event.currentTarget);
                console.log("=== CheckEventisEnd_SelectTarget_Click ===");
                ModuleBlock_SelectTargetMgr.SetModuleBlockShowAssociation(event.currentTarget);

            }
        }
    }

    //--- [ 設定目標 ] ---
    static SetModuleBlockSelectTarget(targetModuleBlock) {

        if (!ModuleBlockElementMgr.checkIsModuleBlock(targetModuleBlock)) {

            return;
        }

        // 1) 先把所有 .ModuleBlock_inner 的左框清空
        ModuleBlock_SelectTargetMgr.RemoveModuleBlockSelectTarget();

        // 2) 更新全域選擇
        ModuleBlock_Main.SetSelectTargetID(targetModuleBlock.id);

        // 3) 幫目前點到的模組加上左框
        ModuleBlock_SelectTargetMgr.showModuleBlockSelectTarget();

        // =========== 下面是「顯示 UpSettingBar」的關鍵 ===========

        // 4) 先移除所有舊的工具列 (確保只有被選那個顯示)
        //document.querySelectorAll(".UpSettingBar").forEach(bar => bar.remove());
        // document.querySelectorAll(".DownSettingBar").forEach(bar => bar.remove());
        //document.querySelectorAll(".gear-menu-button").forEach(bar => bar.remove());
        document.querySelectorAll(".settingAreaContainer").forEach(bar => bar.remove());


        // 5) 為當前點選的這個 ModuleBlock 加一個 addSettingDownBar
        if (ModuleBlock_SelectTargetMgr.CanSelectTargetNow) {
            ModuleBlockSettingBarMgr.addSettingBar(targetModuleBlock);
        }
        //ModuleBlockSettingBarMgr.addSettingUpBar(targetModuleBlock);
        //ModuleBlockSettingBarMgr.addSettingDownBar(targetModuleBlock);
    }

    static showModuleBlockSelectTarget() {

        const targetModuleBlock = ModuleBlock_Main.GetSelectTarget();
        if (!targetModuleBlock) {
            return;
        }
        const firstModuleBlock_inner = ModuleDataFetcherMgr.GetTargetModuleBlock_Inner(targetModuleBlock);
        firstModuleBlock_inner.style.borderLeft = `${ModuleBlock_SelectTargetMgr.TargetTagWeight}px solid   ${ModuleBlock_ColortMgr.GetTargetCololrHex_Normal(ModuleBlock_ColortMgr.getLayerNumHex(targetModuleBlock.dataset.ColorLayer))}`;
    }
    static RemoveModuleBlockSelectTarget() {
        // 1) 先把所有 .ModuleBlock_inner 的左框清空
        const allInners = document.getElementsByClassName(ModuleBlockElementMgr.ModuleBlock_innerName);
        Array.from(allInners).forEach(MB_inner => {
            MB_inner.style.borderLeft = '';
        });
        //console.log("RemoveModuleBlockSelectTarget");
        //ModuleBlock_Main.SetSelectTargetID("");
    }
    static SetModuleBlockShowAssociation(targetModuleBlock) {

        if (!ModuleBlockElementMgr.checkIsModuleBlock(targetModuleBlock)) {
            return;
        }
        const parentId = ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(targetModuleBlock).name;


        const SetParentColor = (targetModuleBlock, LayerNum) => {

            const parentId = ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(targetModuleBlock).name;



            //設定父層
            if (parentId) {
                 const Parent = document.querySelector(`#${parentId}`);
                //獲取同層
                if (Parent) {

                    LayerNum++;
                    var AllCount = SetParentColor(Parent, (LayerNum));

                    var LerpNum = (1 / AllCount) * (LayerNum - 1);
                    LerpNum *= 1;
                    console.log(`設定顏色:    總共有[${AllCount}]層    目標為第[${LayerNum}]層   計算結果為[${LerpNum}]`)

                    const firstModuleBlock_inner = Parent.querySelector(`.${ModuleBlockElementMgr.ModuleBlock_innerName}`);
                    firstModuleBlock_inner.style.borderLeft =
                        // `${ModuleBlock_SelectTargetMgr.TargetTagPeerWeight}px solid ${ModuleBlock_ColortMgr.GetTargetCololrHex_Dark_Lerp(    ModuleBlock_ColortMgr.getLayerNumHex(Parent.dataset.ColorLayer)  ,  LerpNum )}`;
                        //`${ModuleBlock_SelectTargetMgr.TargetTagPeerWeight}px solid ${ModuleBlock_ColortMgr.GetTargetCololrHex_Light_Lerp(ModuleBlock_ColortMgr.getLayerNumHex(Parent.dataset.ColorLayer), LerpNum)}`;
                        `${ModuleBlock_SelectTargetMgr.TargetTagParentWeight}px solid 
                         ${ModuleBlock_ColortMgr.GetTargetCololrHex_Light_Lerp(ModuleBlock_ColortMgr.getLayerNumHex(Parent.dataset.ColorLayer), LerpNum)}`;

                    return LayerNum;
                }
                else {

                    return LayerNum;
                }
            }
            else {
                return LayerNum;
            }


        };


         SetParentColor(targetModuleBlock, 0);

        ////設定父層
        if (parentId) {
            const Parent = document.querySelector(`#${parentId}`);
            //獲取同層
            if (Parent) {
                const firstModuleBlock_inner = Parent.querySelector(`.${ModuleBlockElementMgr.ModuleBlock_innerName}`);
                firstModuleBlock_inner.style.borderLeft =
                    `${ModuleBlock_SelectTargetMgr.TargetTagParentWeight}px solid 
                     ${ModuleBlock_ColortMgr.GetTargetCololrHex_Dark(ModuleBlock_ColortMgr.getLayerNumHex(Parent.dataset.ColorLayer))}`;
                // firstModuleBlock_inner.style.borderLeft = `${ModuleBlock_SelectTargetMgr.TargetTagPeerWeight}px solid ${ModuleBlock_ColortMgr.GetTargetCololrHex_Dark(ModuleBlock_ColortMgr.getLayerNumHex(Parent.dataset.ColorLayer))}`;

            }
        }


        //GetTargetCololrHex_Dark_Lerp



        //設定同層

        if (parentId) {

            const Parent = document.querySelector(`#${parentId}`);

            if (Parent) { 

                const elements = document.querySelectorAll(`[name="${parentId}"]`);
                elements.forEach(element => {

                    // inputCheckbox.name = `Bool_${this.getModuleBlockId()}`;

                    const Peer = ModuleDataFetcherMgr.GetTargetModuleBlock(element);
                    if (Peer == targetModuleBlock) { return; }

                    if (Peer) {
                        //return;
                        const firstModuleBlock_inner = Peer.querySelector(`.${ModuleBlockElementMgr.ModuleBlock_innerName}`);
                        firstModuleBlock_inner.style.borderLeft =
                            `${ModuleBlock_SelectTargetMgr.TargetTagPeerWeight}px solid 
                         ${ModuleBlock_ColortMgr.GetTargetCololrHex_Normal(ModuleBlock_ColortMgr.getLayerNumHex(Peer.dataset.ColorLayer))}`;
                    }
                });
            }
        }
      


        //設定子層
        const SubElements = document.querySelectorAll(`[name="${targetModuleBlock.id}"]`);
        SubElements.forEach(element => {


            const Sub = ModuleDataFetcherMgr.GetTargetModuleBlock(element);
            if (Sub == targetModuleBlock) { return; }

            if (Sub) {

                const firstModuleBlock_inner = Sub.querySelector(`.${ModuleBlockElementMgr.ModuleBlock_innerName}`);
                firstModuleBlock_inner.style.borderLeft = `${ModuleBlock_SelectTargetMgr.TargetTagSubWeight}px solid ${ModuleBlock_ColortMgr.GetTargetCololrHex_Light(ModuleBlock_ColortMgr.getLayerNumHex(Sub.dataset.ColorLayer))}`;
            }
        });


    }

}

//================== 模塊 [ 顏色 ] 管理 ==================
class ModuleBlock_ColortMgr {


    static getLayerNumHex(NumStr) {

        const colorLayerValue = Number(NumStr);
        if (isNaN(colorLayerValue)) {
            throw new Error('isNaN');
        }

        //// 檢查 NumStr 是否在有效範圍內
        //if (colorLayerValue < 1 || colorLayerValue > 100) {
        //    throw new Error('NumStr must be between 1 and 100');
        //}

        // 顏色數組
        const colorsCount = 1;


        // 使用模數運算來確定顏色 // colorLayerValue - 1 將範圍調整為 0 到 (colorsCount - 1)。  // 加 1 使得範圍從 1 開始

        const index = (colorLayerValue - 1) % colorsCount + 1;

        return this.#GetTargetCololrHex(index);
    }

    static layerColor_01 = "#17bfb4";
    //static layerColor_01 = "magenta";
    //static layerColor_02 = "orange";
    //static layerColor_01 = "mediumseagreen";
    //static layerColor_01 = "#ff6600";
    //static layerColor_02 = "#42b1d6";
    static layerColor_02 = "#51bdb4";
    static layerColor_03 = "rebeccapurple";
    //static layerColor_04 = "#ef42ff";


    static GetTargetCololrHex_VereyLight(Hex) {
        var color_01 = this.hexToRgb(this.GetCololrHexByStr(Hex));
        var color_02 = this.hexToRgb(this.GetCololrHexByStr("white"));

        return this.rgbToHex(this.lerpColor(color_01, color_02, 0.7));
    }
    static GetTargetCololrHex_Light(Hex) {
        var color_01 = this.hexToRgb(this.GetCololrHexByStr(Hex));
        var color_02 = this.hexToRgb(this.GetCololrHexByStr("white"));

        return this.rgbToHex(this.lerpColor(color_01, color_02, 0.5));
    }
    static GetTargetCololrHex_Dark(Hex) {
        var color_01 = this.hexToRgb(this.GetCololrHexByStr(Hex));
        //var color_02 = this.hexToRgb(this.GetContrastColorHex("black"));
        var color_02 = this.hexToRgb(this.GetCololrHexByStr("black"));
        return this.rgbToHex(this.lerpColor(color_01, color_02, 0.5));
    }


    static GetTargetCololrHex_Normal(Hex) {
        var color_01 = this.hexToRgb(this.GetCololrHexByStr(Hex));
        var color_02 = this.hexToRgb(this.GetCololrHexByStr(Hex));

        return this.rgbToHex(this.lerpColor(color_01, color_02, 0));
    }

    static GetTargetCololrHex_Dark_Lerp(Hex, lerpNum) {
        var color_01 = this.hexToRgb(this.GetCololrHexByStr(Hex));
        var color_02 = this.hexToRgb(this.GetContrastColorHex("black"));
        return this.rgbToHex(this.lerpColor(color_01, color_02, lerpNum));
    }

    static GetTargetCololrHex_Light_Lerp(Hex, lerpNum) {
        var color_01 = this.hexToRgb(this.GetCololrHexByStr(Hex));
        var color_02 = this.hexToRgb(this.GetCololrHexByStr("lightgray"));
        return this.rgbToHex(this.lerpColor(color_01, color_02, lerpNum));
    }

    // 解析 HEX 顏色為 RGB
    static #GetTargetCololrHex(layerColorNum) {
        // 確保屬性是從 layerColor_01 到 layerColor_10 的格式
        var colorProperty = "layerColor_" + String(layerColorNum).padStart(2, "0");


        // 使用該屬性來獲取顏色
        var selectedColor = ModuleBlock_ColortMgr[colorProperty];

        return this.GetCololrHexByStr(selectedColor);
    }

    // 解析 HEX 顏色為 RGB
    static GetCololrHexByStr(selectedColor) {

        // 確保顏色存在
        if (selectedColor) {
            // 如果選擇的顏色是 HEX 格式，則直接返回
            if (/^#[0-9A-F]{6}$/i.test(selectedColor)) {
                return selectedColor;  // 直接返回 HEX 顏色
            }

            // 如果顏色是 RGB 格式，將其轉換為 HEX
            if (/^rgb/.test(selectedColor)) {
                return ModuleBlock_ColortMgr.rgbToHex(selectedColor);  // 使用自定義的 rgbToHex 函數進行轉換
            }

            // 如果是顏色名稱，將其轉換為 HEX
            if (typeof selectedColor === "string") {
                return ModuleBlock_ColortMgr.#colorNameToHex(selectedColor);  // 利用自定義的 colorNameToHex 函數轉換顏色名稱
            }

            // 其他顏色處理邏輯
            return selectedColor;  // 若顏色格式不符合預期，直接返回（可以擴展其他轉換邏輯）
        } else {
            return null;  // 若未找到對應顏色，返回 null
        }
    }

    static GetContrastColorHex(baseColor) {
        // 确保基础颜色存在
        if (baseColor) {
            let hexColor = "";

            // 检查输入是否是 HEX 格式
            if (/^#[0-9A-F]{6}$/i.test(baseColor)) {
                hexColor = baseColor;
            } else if (/^rgb/.test(baseColor)) {
                // 如果是 RGB 格式，转换为 HEX
                hexColor = ModuleBlock_ColortMgr.rgbToHex(baseColor);
            } else if (typeof baseColor === "string") {
                // 如果是颜色名称，转换为 HEX
                hexColor = ModuleBlock_ColortMgr.#colorNameToHex(baseColor);
            }

            // 如果无法解析为 HEX，直接返回 null
            if (!hexColor) return null;

            // 计算对比色
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);

            // 对比色公式：RGB 取反
            const contrastR = (255 - r).toString(16).padStart(2, "0");
            const contrastG = (255 - g).toString(16).padStart(2, "0");
            const contrastB = (255 - b).toString(16).padStart(2, "0");

            return `#${contrastR}${contrastG}${contrastB}`; // 返回对比色的 HEX 值
        } else {
            return null; // 如果未提供颜色，返回 null
        }
    }



    // 解析 HEX 顏色為 RGB
    static #colorNameToHex(colorName) {
        const element = document.createElement('div');
        element.style.color = colorName;
        document.body.appendChild(element);

        const computedColor = getComputedStyle(element).color;
        document.body.removeChild(element);

        // 解析 `rgb` 或 `rgba` 字符串為十六進制
        const rgb = computedColor.match(/^rgb(a?)\((\d+), (\d+), (\d+)(?:, (\d+\.?\d*))?\)$/);
        if (rgb) {
            const r = parseInt(rgb[2]);
            const g = parseInt(rgb[3]);
            const b = parseInt(rgb[4]);
            return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
        }
        return null;
    }

    // 解析 HEX 顏色為 RGB
    static hexToRgb(color) {
        // 先檢查是否為 HEX 格式
        if (color.charAt(0) === '#') {
            // 去掉 '#' 並解析 HEX 顏色
            color = color.slice(1);

            if (color.length === 6) {
                let r = parseInt(color.substr(0, 2), 16);
                let g = parseInt(color.substr(2, 2), 16);
                let b = parseInt(color.substr(4, 2), 16);

                return { r, g, b };
            } else {
                throw new Error('Invalid HEX color format');
            }
        }

        // 如果是顏色名稱，先使用 colorNameToHex 轉換為 HEX
        const hexColor = this.#colorNameToHex(color);

        // 如果無法解析顏色名稱為 HEX，則拋出錯誤
        if (!hexColor) {
            throw new Error('Invalid color name');
        }

        return this.hexToRgb(hexColor);


    }

    // 轉換 RGB 顏色為 HEX
    static rgbToHex(color) {
        return '#' + (1 << 24 | color.r << 16 | color.g << 8 | color.b).toString(16).slice(1).toUpperCase();
    }

    // 線性插值函數
    static lerpColor(color1, color2, t) {
        // 計算每個通道的插值
        const r = Math.round(color1.r + (color2.r - color1.r) * t);
        const g = Math.round(color1.g + (color2.g - color1.g) * t);
        const b = Math.round(color1.b + (color2.b - color1.b) * t);

        return { r, g, b };
    }




}


//================== 模塊 [ 假表格分割編輯器 ] 管理 ==================
class ModuleBlock_FakeGridCutSetMgr {

    static ReMoveAllStyle() {
        let allModuleBlock = document.querySelectorAll("." + ModuleBlockElementMgr.ModuleBlockName);

        allModuleBlock.forEach(
            (ModuleBlock) => {
                ModuleBlock_FakeGridCutSetMgr.ReMoveTargetStyle(ModuleBlock);
            }
        )
    }
    static ReMoveTargetStyle(ModuleBlock) {
        if (!ModuleBlock) {
            return;
        }

        ModuleBlock.style.backgroundColor = "";
        let Inner = ModuleDataFetcherMgr.GetTargetModuleBlock_Inner(ModuleBlock);
        if (Inner) {
            Inner.classList.remove("InnerStyle01");
        }

        let Grid = ModuleDataFetcherMgr.GetTargetModuleBlock_TableGrid(ModuleBlock);
        if (Grid) {
            Grid.classList.remove("tableStyle01");
        }

        let ModuleList = ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(ModuleBlock);
        if (ModuleList) {
            ModuleList.classList.remove("tableStyle_list_01");
        }

        let TextBox = ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(ModuleBlock);
        if (TextBox) {
            TextBox.classList.remove("TextBoxStyle01");

            let TextBoxLabel = TextBox.querySelector(`:scope > label`);
            let TextBoxDiv = TextBox.querySelector(`:scope > label > div`);
            TextBoxLabel.style.fontSize = "";
        }
    }
    static ResetTargetStyle(ModuleBlock) {
        ModuleBlock_FakeGridCutSetMgr.ReMoveTargetStyle(ModuleBlock);
        ModuleBlock_FakeGridCutSetMgr.SetTargetStyle(ModuleBlock);
    }
    static SetTargetStyle(ModuleBlock) {


        if ((ModuleBlock.dataset.SetStyle) && ModuleBlock.dataset.SetStyle == "true") {
            ModuleBlock.dataset.SetStyle = false;
        }
        else {
            ModuleBlock_FakeGridCutSetMgr.SetTargetStyle_Force(ModuleBlock);
        }
    }

    static SetTargetStyle_Force(ModuleBlock) {


        ModuleBlock.dataset.SetStyle = true;
        //ModuleBlock.style.backgroundColor = "red";
        //ModuleBlock.style.flex = "1";
        let Inner = ModuleDataFetcherMgr.GetTargetModuleBlock_Inner(ModuleBlock);
        if (Inner) {
            Inner.classList.add("InnerStyle01");
        }
        let Grid = ModuleDataFetcherMgr.GetTargetModuleBlock_TableGrid(ModuleBlock);
        if (Grid) {
            Grid.classList.add("tableStyle01");
        }

        let ModuleList = ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(ModuleBlock);
        if (ModuleList) {

            ModuleList.classList.add("tableStyle_list_01");


        }

        let TextBox = ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(ModuleBlock);
        if (TextBox) {
            TextBox.classList.add("TextBoxStyle01");

            let TextBoxLabel = TextBox.querySelector(`:scope > label`);
            let TextBoxDiv = TextBox.querySelector(`:scope > label > div`);
            if (TextBoxDiv.innerHTML.trim() !== "") {

            } else {
                TextBoxLabel.style.fontSize = "50px";
                //const isCollapsed = (ModuleBlock.dataset.collapsed === "true");
                //ModuleBlockSettingBarMgr.setCollapse(ModuleBlock, isCollapsed);
            }
        }
    }

    static SetGridInnerStyle(ModuleBlock) {

        var AllModuleBlock =
            ModuleDataFetcherMgr.GetTargetModuleBlock_TableGrid(ModuleBlock).
                querySelectorAll(`:scope > tbody > tr > td > .${ModuleBlockElementMgr.TableFieldName} >  .${ModuleBlockElementMgr.ModuleBlockName}
                                             ,:scope > tr > td > .${ModuleBlockElementMgr.TableFieldName} > .${ModuleBlockElementMgr.ModuleBlockName}`);


        if ((ModuleBlock.dataset.SetGridInnerStyle) && ModuleBlock.dataset.SetGridInnerStyle == "true") {
            ModuleBlock.dataset.SetGridInnerStyle = false;
            AllModuleBlock.forEach(
                (labelElement) => {
                    console.log("labelElement" + labelElement.id);
                    ModuleBlock_FakeGridCutSetMgr.ReMoveTargetStyle(labelElement);
                }
            )
        }
        else {
            ModuleBlock.dataset.SetGridInnerStyle = true;

            AllModuleBlock.forEach(
                (labelElement) => {
                    console.log("labelElement" + labelElement.id);
                    ModuleBlock_FakeGridCutSetMgr.SetTargetStyle_Force(labelElement);
                }
            )
        }

    }

}

///////////////////////////////////////////////////////////////

class SwapMgr {

    static checkCanSwap(DomObj_A, DomObj_B) {

        if (!DomObj_A || !DomObj_B) {
            console.log("無法找到其中一个元素");

            if (!DomObj_A) {
                console.log("無法找到元素：DomObj_A");

            }

            if (!DomObj_B) {
                console.log("無法找到元素：DomObj_B");

            }
            return false;
        }

        // 检查是否会引发循环嵌套
        if (DomObj_A.contains(DomObj_B) || DomObj_B.contains(DomObj_A)) {
            console.log("不能交换，其中一个元素是另一个元素的子節點");
            return false;
        }

        // 获取父节点
        const DomObj_A_Parent = DomObj_A.parentNode;
        const DomObj_B_Parent = DomObj_B.parentNode;

        if (!DomObj_A_Parent || !DomObj_B_Parent) {
            console.log("無法找到DOM元素的父節點");
            return false;
        }

        return true;
    }

    static swapDomObj(DomObj_A, DomObj_B) {
        if (!this.checkCanSwap(DomObj_A, DomObj_B)) {
            console.log("交換失敗");
            return;
        }

        const DomObj_A_Parent = DomObj_A.parentNode;
        const DomObj_B_Parent = DomObj_B.parentNode;

        if (!DomObj_A_Parent || !DomObj_B_Parent) {
            console.log("無法找到DOM元素的父節點");
            return;
        }

        // 克隆节点
        const placeholder_A = document.createElement("div");
        const placeholder_B = document.createElement("div");

        // 用占位符替代原位置
        DomObj_A_Parent.replaceChild(placeholder_A, DomObj_A);
        DomObj_B_Parent.replaceChild(placeholder_B, DomObj_B);

        // 交换位置
        DomObj_A_Parent.replaceChild(DomObj_B, placeholder_A);
        DomObj_B_Parent.replaceChild(DomObj_A, placeholder_B);

        console.log("交換位置 結束");
    }

    static swapDomObjById(id_A, id_B) {
        const DomObj_A = document.getElementById(id_A);
        const DomObj_B = document.getElementById(id_B);
        this.swapDomObj(DomObj_A, DomObj_B)
    }
}


///////////////////////////////////////////////////////////////

class checkImgblockMgrDemo {

    static init() {
        document.addEventListener("click", this.checkImgblock);
    }
    static checkImgblock(event) {

        var resizeWrapperS = document.querySelectorAll(".resize-wrapper");

        resizeWrapperS.forEach(resizeWrapper => {
            if (resizeWrapper.contains(event.target)) {
                resizeWrapper.childNodes.forEach(c => {
                    if (c.classList.contains('resize-handle')) {
                        c.style.display = 'inline-block';
                    }
                    if (c.nodeName == "img") {
                        c.style.border = '1px solid #4285f4';
                    }
                });
            }
            else {
                resizeWrapper.childNodes.forEach(c => {
                    if (c.classList.contains('resize-handle')) {
                        c.style.display = 'none';
                    }
                    if (c.nodeName == "img") {
                        c.style.border = '';
                    }
                });
            }

        })
            ;

    }
}

///////////////////////////////////////////////////////////////
class Tab_EditTableMgr {
    static OptionSwitch = null;

    static GridSwitch = null;


    //一開始的初始化
    static Tab_EditTableMgr_Init() {
        Tab_EditTableMgr.#Tab_EditTableMgr_Init();
        console.log("===== Tab_EditTableMgr_Init =====");
    }

    //每次開啟時的初始化
    static init() {
        Tab_EditTableMgr.UpdateTargetInner();
        Tab_EditTableMgr.initSettingBtn();
    }



    static initSettingBtn() {

        //  開啟/關閉 表格
        const GridSwitchCheckbox = Tab_EditTableMgr.GridSwitch.querySelector("input[type='checkbox']");

        const IsOpenUseTable = ModuleBlockEditMgr.IsModuleBlock_TableGrid_Open(ModuleBlock_Main.GetSelectTarget());
        GridSwitchCheckbox.checked = !IsOpenUseTable;
        document.querySelector("#Tab_EditTableMgr_GridSettingBox").style.display = IsOpenUseTable ? "" : "none";

        document.querySelector("#SetGridTableSpanText").textContent = "";

    }




    static #Tab_EditTableMgr_Init() {

        Tab_EditTableMgr.UpdateTargetInner();
        Tab_EditTableMgr.#SetTab_EditTableMgrBtn();
    }

    static #SetTab_EditTableMgrBtn() {
        const addTable = document.getElementById("add-table");

        // Create the main container div
        const testDiv = document.createElement("div");
        testDiv.id = "testDiv";

        // Helper function to create buttons
        const createButton = (text, classes, onClickHandler) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = classes;
            button.textContent = text;
            //button.setAttribute("onclick", onClickHandler);
            button.addEventListener("click", onClickHandler);
            return button;
        };

        const createSwitch = (beforeText, afterText) => {
            const div = document.createElement("span");

            const beforeTextBox = document.createElement("span");
            beforeTextBox.textContent = beforeText + " ";
            beforeTextBox.style.display = "inline-block"; // 為了可以控制寬高
            beforeTextBox.style.width = "80px";
            beforeTextBox.style.height = "30px";
            beforeTextBox.style.textAlign = "center"; // 水平置中
            beforeTextBox.style.lineHeight = "30px"; // 垂直置中，與高度相同
            beforeTextBox.style.backgroundColor = "#f0f0f0"; // 可視化效果
            div.appendChild(beforeTextBox);

            const SwitchBtn = SwitchBtnEditor.CreateSwitchBtn();
            div.appendChild(SwitchBtn);

            const afterTextBox = document.createElement("span");
            afterTextBox.textContent = " " + afterText;
            afterTextBox.style.display = "inline-block"; // 為了可以控制寬高
            afterTextBox.style.width = "80px";
            afterTextBox.style.height = "30px";
            afterTextBox.style.textAlign = "center"; // 水平置中
            afterTextBox.style.lineHeight = "30px"; // 垂直置中，與高度相同
            afterTextBox.style.backgroundColor = "#f0f0f0"; // 可視化效果
            div.appendChild(afterTextBox);


            div.style.padding = "5px";
            //button.type = "button";
            //button.className = classes;
            //button.textContent = text;
            //button.setAttribute("onclick", onClickHandler);
            return div;
        };
        //======================================================
        Tab_EditTableMgr.GridSwitch = createSwitch("啟用表格", "停用表格")

        const GridSwitchCheckbox = Tab_EditTableMgr.GridSwitch.querySelector("input[type='checkbox']");
        if (ModuleBlock_Main.GetSelectTarget()) {
            GridSwitchCheckbox.checked = ModuleBlock_Main.GetSelectTarget().dataset.GridMode;
        }

        // 添加事件监听器
        GridSwitchCheckbox.addEventListener("change", () => {
            //document.querySelector("#Tab_EditTableMgr_GridSettingBox").style.display = "";
            console.log("== change ==");
            if (GridSwitchCheckbox.checked) {
                //關閉

                let targetCells = ModuleBlock_Main.GetSelectTarget().querySelector("." + ModuleBlockElementMgr.TableGridName).querySelectorAll("." + ModuleBlockElementMgr.ModuleBlockName);

                let CanCloseTable = true;

                // 檢查每個 targetCell 是否包含 'canRemove' 類別
                for (let targetCell of targetCells) {
                    if (!targetCell.classList.contains(ModuleBlock_GridSetMgr.InGridCanRemoveModuleBlockName)) {
                        CanCloseTable = false;
                        break; // 跳出迴圈
                    }
                }



                if (!CanCloseTable) {

                    spanText.textContent = "表格內有其他模塊，禁止關閉";
                    spanText.style.color = "#ff8870"

                    GridSwitchCheckbox.checked = false;
                }
                else {

                    ModuleDataFetcherMgr.GetTargetModuleBlock_TableGrid(ModuleBlock_Main.GetSelectTarget()).remove();

                    document.querySelector("#Tab_EditTableMgr_GridSettingBox").style.display = "none";
                    spanText.textContent = "表格已關閉";
                    spanText.style.color = "#51bdb4";
                    ModuleBlock_Main.GetSelectTarget().dataset.GridMode = false;
                }

            } else {

                if (ModuleBlock_Main.GetSelectTarget().querySelector("." + ModuleBlockElementMgr.OnceTableName).querySelector("." + ModuleBlockElementMgr.ModuleBlockName)) {

                    spanText.textContent = "列表內有其他模塊，禁止開啟表格";
                    spanText.style.color = "#ff8870"

                    GridSwitchCheckbox.checked = true;
                }
                else {

                    document.querySelector("#Tab_EditTableMgr_GridSettingBox").style.display = "";
                    ModuleBlockEditMgr.OpenModuleBlock_TableGrid(ModuleBlock_Main.GetSelectTarget(), true);
                    spanText.textContent = "表格已開啟";
                    spanText.style.color = "#51bdb4";
                    ModuleBlock_Main.GetSelectTarget().dataset.GridMode = true;
                }

            }

            Tab_EditTableMgr.UpdateTargetInner();
            AutoScreen_js.resetAutoScreenBlockSize();

        });

        testDiv.appendChild(Tab_EditTableMgr.GridSwitch);

        const spanText = document.createElement("span");
        spanText.textContent = "";
        spanText.id = "SetGridTableSpanText"
        testDiv.appendChild(spanText);

        testDiv.appendChild(document.createElement("br"));
        testDiv.appendChild(document.createElement("br"));
        //======================================================

        const GridSettingBox = document.createElement("div");
        GridSettingBox.id = "Tab_EditTableMgr_GridSettingBox"
        GridSettingBox.style.border = "2px dashed #51bdb4"; // 设置虚线边框
        GridSettingBox.style.padding = "10px";

        //------------------------------------------------------------------------------------


        //新版本---表格編輯
        GridSettingBox.appendChild(this.#createTableSettingBtn(300, 100));

        //------------------------------------------------------------------------------------


        GridSettingBox.style.display = "none";
        if (ModuleBlock_Main.GetSelectTarget()) {
            ModuleBlockEditMgr.OpenModuleBlock_TableGrid(ModuleBlock_Main.GetSelectTarget(), false);
        }
        //-------

        GridSettingBox.appendChild(document.createElement("br"));
        const setRowOrColumnSwitch = createSwitch("設定橫排", "設定直排")
        GridSettingBox.appendChild(setRowOrColumnSwitch);

        const setAddOrRemoveSwitch = testDiv.appendChild(createSwitch("新增", "刪除"));
        GridSettingBox.appendChild(setAddOrRemoveSwitch);

        const setBeforeOrAfterSwitch = testDiv.appendChild(createSwitch("從頭開始", "從尾開始"));
        GridSettingBox.appendChild(setBeforeOrAfterSwitch);


        GridSettingBox.appendChild(document.createElement("br"));
        GridSettingBox.appendChild(document.createElement("br"));


        const setBtn = createButton("設定表格", "",
            () => {
                console.log("設定表格");


                const RowOrColumn = !setRowOrColumnSwitch.querySelector("input").checked ? "Row" : "Column";
                const AddOrRemove = !setAddOrRemoveSwitch.querySelector("input").checked ? "Add" : "Remove";
                const HeadOrFeet = !setBeforeOrAfterSwitch.querySelector("input").checked ? "Head" : "Feet";

                //setRowOrColumnSwitch.querySelector("input").disabled = true;
                //setAddOrRemoveSwitch.querySelector("input").disabled = true;
                //setAddOrRemoveSwitch.querySelector("input").disabled = true;
                //ModuleBlockEditMgr.OpenModuleBlock_TableGrid(ModuleBlock_Main.GetSelectTarget(), true);


                const Result = ModuleBlock_GridSetMgr.SetModuleBlockSGrid(ModuleBlock_Main.GetSelectTargetID(), AddOrRemove, RowOrColumn, HeadOrFeet);

                if (Result.success) {
                    spanText.textContent = Result.resultMessage;
                    spanText.style.color = "#51bdb4";
                }
                else {
                    spanText.textContent = Result.resultMessage;
                    spanText.style.color = "#ff8870";
                }

                console.log(`設定表格 結果 ${Result.success}  ${Result.resultMessage}`);

                Tab_EditTableMgr.UpdateTargetInner();
                AutoScreen_js.resetAutoScreenBlockSize();
            }
        )

        GridSettingBox.appendChild(setBtn);
        GridSettingBox.appendChild(document.createElement("br"));
        GridSettingBox.appendChild(document.createElement("br"));

        //const spanText = document.createElement("span")
        //spanText.textContent = "";
        //GridSettingBox.appendChild(spanText);

        testDiv.appendChild(GridSettingBox);
        testDiv.appendChild(document.createElement("br"));
        testDiv.appendChild(document.createElement("br"));
        //=====================================================
        // Insert the testDiv at the top of the addTable
        addTable.insertBefore(testDiv, addTable.firstChild);
    }

    static #createTableSettingBtn(TargetWidth, TargetHeight) {
        const setNineGrid = document.createElement("div");
        //setNineGrid.style.border = "1px solid #51bdb4"; // 设置虚线边框
        setNineGrid.style.display = "flex";
        setNineGrid.style.flexDirection = "column";
        setNineGrid.style.height = "300px";
        setNineGrid.style.width = "300px";

        const btnWidth = 50;

        const setTopTr = this.#createTableSetting_Tr(btnWidth, TargetWidth, btnWidth, btnWidth);

        const setMidTr = this.#createTableSetting_Tr(btnWidth, TargetWidth, btnWidth, TargetHeight);

        const setDownTr = this.#createTableSetting_Tr(btnWidth, TargetWidth, btnWidth, btnWidth);


        setNineGrid.append(setTopTr);
        setNineGrid.append(setMidTr);
        setNineGrid.append(setDownTr);

        return setNineGrid;
    }

    static #createTableSetting_Tr(L_w, Mid_w, R_w, hight) {

        const setTr = document.createElement("div");
        setTr.style.display = "flex";
        setTr.style.flexDirection = "row";

        const setTd_L = document.createElement("div");
        setTd_L.style.padding = "2px";
        setTd_L.style.border = "1px solid #51bdb4";
        setTd_L.style.width = `${L_w}px`;
        setTr.style.height = `${hight}px`;

        const setTd_Mid = document.createElement("div");
        setTd_Mid.style.padding = "2px";
        setTd_Mid.style.border = "1px solid #51bdb4";
        setTd_Mid.style.width = `${Mid_w}px`;
        setTr.style.height = `${hight}px`;


        const setTd_R = document.createElement("div");
        setTd_R.style.padding = "2px";
        setTd_R.style.border = "1px solid #51bdb4";
        setTd_R.style.width = `${R_w}px`;
        setTr.style.height = `${hight}px`;


        setTr.appendChild(setTd_L);
        setTr.appendChild(setTd_Mid);
        setTr.appendChild(setTd_R);

        return setTr;
    }

    static #createTableSetting_Btn(L_w, Mid_w, R_w, hight) {

        const BtnBar = document.createElement("div");
        setTr.style.display = "flex";
        setTr.style.flexDirection = "row";

        const setTd_L = document.createElement("div");


        const setTd_Mid = document.createElement("div");





        return setTr;
    }




    //更新畫面
    static UpdateTargetInner() {


        var addTable = document.getElementById("add-table");
        var ModuleBlockDemo = addTable.querySelector("#ModuleBlockDemo");

        if (!ModuleBlockDemo) {
            ModuleBlockDemo = Tab_EditTableMgr.Init_ModuleBlockDemo();
        }

        var ModuleBlockTarget = ModuleBlock_Main.GetSelectTarget();
        if (!ModuleBlockTarget) {
            return;
        }

        const targetStyle = getComputedStyle(ModuleBlockTarget);
        const targetWidth = targetStyle.width;
        const targetHeight = targetStyle.height;

        const clonedElement = ModuleBlockTarget.cloneNode(true);

        clonedElement.style.width = targetWidth;
        clonedElement.style.height = targetHeight;
        clonedElement.id = "ModuleBlockDemo";
        clonedElement.style.pointerEvents = 'none';

        // 禁止克隆元素内的所有子元素与鼠标互动
        const disablePointerEventsRecursively = (element) => {
            element.style.pointerEvents = 'none';
            //element.id = "";
            // 遍历所有子元素并递归设置 pointer-events
            Array.from(element.children).forEach(child => disablePointerEventsRecursively(child));
        };

        // 调用递归方法来禁用所有子元素的 pointerEvents
        disablePointerEventsRecursively(clonedElement);
        ModuleBlockDemo.replaceWith(clonedElement);

        //console.log("UpdateTargetInner============================================================")
    }

    static Init_ModuleBlockDemo() {
        var addTable = document.getElementById("add-table");
        var ModuleBlockDemo = addTable.querySelector("#ModuleBlockDemo");

        if (!ModuleBlockDemo) {
            ModuleBlockDemo = document.createElement("div");
            ModuleBlockDemo.id = "ModuleBlockDemo";
            // 使用 insertBefore 插入到第一个子元素之前
            addTable.insertBefore(ModuleBlockDemo, addTable.firstChild);
        }

        return ModuleBlockDemo;
    }


}


