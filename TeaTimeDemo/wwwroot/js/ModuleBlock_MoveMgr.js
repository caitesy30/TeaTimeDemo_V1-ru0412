


$(document).ready(function () {


    document.addEventListener("keydown", (event) => {

        if (event.altKey && !event.ctrlKey) {
            switch (event.key) {
                case "2":
                   ModuleBlock_MoveMgr.canMoveNow = !ModuleBlock_MoveMgr.canMoveNow;
                   
                    break;

               
                default:
            }
        }

    }
    );

}
);



//================== 模塊 [ 移動 ] 管理 ==================
class ModuleBlock_MoveMgr {

    static #CanMoveNow = false;
    //static ForceMoveNow = false;
    static #IsMoveNow = false;


    static get canMoveNow() {
        return ModuleBlock_MoveMgr.#CanMoveNow;
    }
    static set canMoveNow(value) {
        if (typeof value === 'boolean') {

            ModuleBlock_MoveMgr.#CanMoveNow = value;

            if (value) {
                ModuleBlock_MoveMgr.showMoveMouseoverTarget();
            }
            else {
                ModuleBlock_MoveMgr.unshowMoveMouseoverTarget();
                ModuleBlock_MoveMgr.ForceMoveNow = false;
                ModuleBlock_MoveMgr.CloseHoldBox();
               
            }

        } else {
            throw new TypeError('canMoveNow must be a boolean');
        }
    }
    //---------------------------

    static get isMoveNow() {
        return ModuleBlock_MoveMgr.#CanMoveNow;
    }
    static set isMoveNow(value) {
        if (typeof value === 'boolean') {

            ModuleBlock_MoveMgr.#IsMoveNow = value;

        } else {
            throw new TypeError('canMoveNow must be a boolean');
        }
    }


    //---------------------------

    static SixPointMoveBarName = "SixPointMoveBar";
    static MoveHoldTargetTopValue = 0;
    static MoveHoldTargetBottomValue = 20;
    //---------------------------
    static HoldBoxName = "HoldBox";
    static HoldBoxInnerName = "HoldBoxInner";
    static HoldBox = null;
    static HoldBoxInnerTargetModuleBlock = null;

    //=== [ 移動模塊 初始化 ] ===
    static init() {
        console.log("移動模塊 初始化");
        this.InitHoldBox();
        this.InitAction();
    }


    

    //=== [ HoldBox 初始化 ] ===
    static InitHoldBox() {
        console.log("InitHoldBox...");
        if (this.HoldBox) {
            this.HoldBox.remove();
        }

        this.HoldBox = document.createElement("div");

        this.HoldBox.classList.add(this.HoldBoxName);  // 為占位符設置樣式
        var HoldBoxInner = document.createElement("div");
        HoldBoxInner.classList.add(this.HoldBoxInnerName);

        HoldBoxInner.style.height = "25px";
        var plusIconDiv = document.createElement("div");
        plusIconDiv.classList.add("bi");
        plusIconDiv.classList.add("bi-plus-square");

        HoldBoxInner.appendChild(plusIconDiv);
        this.HoldBox.appendChild(HoldBoxInner);
        document.getElementById("AutoScreen").appendChild(this.HoldBox);



        // this.ReSet_Action_HoldBox_BlockMove();
        this.HoldBox.dataset.CanSwap = true;
        ModuleBlock_MoveMgr.CloseHoldBox();
    }

    static ResetHoldBoxDragStart(TargetModuleBlock) {
        //將HoldBox移動到目標模塊後面
        ModuleBlock_MoveMgr.SetHoldBoxAfter(TargetModuleBlock);

        //設定成合規
        ModuleBlock_MoveMgr.ShowHoldBox_Valid();

        //開啟佔位框
        ModuleBlock_MoveMgr.OpenHoldBox();
    }

    // 開啟佔位框
    static OpenHoldBox() {

        if (!ModuleBlock_MoveMgr.canMoveNow) { return; }


        if (!this.CheckHoldBoxIsShow()) { // 檢查當前狀態是否為 'flex'
            this.HoldBox.style.display = '';
            //console.log("HoldBox 已打開。");
        } else {
            //console.log("HoldBox 已經是打開狀態，無需重複操作。");
        }
        AutoScreen_js.resetAutoScreenBlockSize();
    }
    // 關閉佔位框
    static CloseHoldBox() {

        if (this.CheckHoldBoxIsShow()) {
            this.HoldBox.style.display = 'none';
            //console.log("HoldBox 已關閉。");
        } else {
            //console.log("HoldBox 已經是關閉狀態，無需重複操作。");
        }
        AutoScreen_js.resetAutoScreenBlockSize();
    }
    // 確認HoldBox是否開啟
    static CheckHoldBoxIsShow() {
        return !(this.HoldBox.style.display === 'none');
    }

    //=== [ 模塊設定 初始化 ] ================================================================================


    static InitAction() {

        document.addEventListener("mouseover", ModuleBlock_MoveMgr.setMoveMouseover_EventAction);


        document.addEventListener("mouseout", ModuleBlock_MoveMgr.setMoveMouseout_EventAction);
                                                                    

        //-----------------------------------------------------------------

        document.addEventListener("dragstart", this.DragStart_EventAction);

        //-----------------------------------------------------------------
        
        document.addEventListener("dragend", this.DragEnd_EventAction);

        //=================================================================
          //return;
          document.addEventListener("dragenter", this.DragEnter_EventAction);
          document.addEventListener("dragover", this.DragOver_EventAction);
          document.addEventListener("dragleave", this.DragLeave_EventAction);
          document.addEventListener("drop", this.Drop_EventAction);
    }

    static MoveMouseoverTarget_TextBox;
    static setMoveMouseoverTarget(TextBox) {

        if (ModuleBlock_MoveMgr.IsMoveNow) {
            return;
        }

        if (TextBox == ModuleBlock_MoveMgr.MoveMouseoverTarget_TextBox) {
            ModuleBlock_MoveMgr.showMoveMouseoverTarget();
            return;
        }
        else {
            ModuleBlock_MoveMgr.unshowMoveMouseoverTarget();


            ModuleBlock_MoveMgr.MoveMouseoverTarget_TextBox = TextBox;

            //----------------------------------------

            ModuleBlock_MoveMgr.showMoveMouseoverTarget();

        }

    }
    static showMoveMouseoverTarget() {
        if (ModuleBlock_MoveMgr.IsMoveNow) {
            return;
        }
        if (!ModuleBlock_MoveMgr.#CanMoveNow) {
            return;
        }


        var TextBox = ModuleBlock_MoveMgr.MoveMouseoverTarget_TextBox;

        if (TextBox) {
            TextBox.style.backgroundColor = "#94dee3";

            TextBox.draggable = true;
            TextBox.style.cursor = "move";

            var Label = TextBox.querySelector(".ModuleBlock label , .ModuleBlock.fakeLabels");

            if (Label) {
                Label.style.cursor = "move";
                Label.style.backgroundColor = "#94dee3";
            }
        }

    }

    static removeMoveMouseoverTarget(TextBox) {

        ModuleBlock_MoveMgr.unshowMoveMouseoverTarget();
        if (TextBox == ModuleBlock_MoveMgr.MoveMouseoverTarget_TextBox) {

        }
        else {

            ModuleBlock_MoveMgr.MoveMouseoverTarget_TextBox = null;
        }
    }

    static unshowMoveMouseoverTarget() {

        var TextBox= ModuleBlock_MoveMgr.MoveMouseoverTarget_TextBox

        if (TextBox) {
            TextBox.style.backgroundColor = "";
            TextBox.draggable = false;
            TextBox.style.cursor = "";
            var Label = TextBox.querySelector(".ModuleBlock label , .ModuleBlock.fakeLabels");

            if (Label) {
                Label.style.cursor = "";
                Label.style.backgroundColor = "";

            }
        }
     
    }

    
    //撈出最近的
    static setMoveMouseover_EventAction(event) {

      

        //console.log("setMoveMouseover");
        const target = event.target;

        var TextBox = target.closest("." + ModuleBlockElementMgr.TextBoxName);

        if (TextBox) {

            ModuleBlock_MoveMgr.setMoveMouseoverTarget(TextBox);
        }

    }
    static setMoveMouseout_EventAction(event) {
        if (!ModuleBlock_MoveMgr.canMoveNow) {
            return;
        }
        //console.log("setMoveMouseout");
        const target = event.target;

        var TextBox = target.closest("." + ModuleBlockElementMgr.TextBoxName);

        if (TextBox) {
            ModuleBlock_MoveMgr.removeMoveMouseoverTarget(TextBox);
        }

    }

    //--Drag--
    static DragStart_EventAction(event) {

            ModuleBlock_MoveMgr.IsMoveNow = true;

            const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);

            if (TargetModuleBlock) {
                ModuleBlock_MoveMgr.SetDraggedBlock(TargetModuleBlock);
            } else {
                return;
            }
   
            const emptyImage = new Image();
            emptyImage.src = ""; // 使用空白图像
            event.dataTransfer.setDragImage(emptyImage, 0, 0);
        setTimeout(() => {

                  //------------------------------------------------------------------
                  ModuleBlock_MoveMgr.ResetHoldBoxDragStart(TargetModuleBlock);
                  //    return;
                  //------------------------------------------------------------------
                  //    ModuleBlock_MoveMgr.ReSetAll_Action_ModuleBlock_BlockMove();
                  //    ModuleBlock_MoveMgr.ReSetAll_Action_TableField_BlockMove();
                  //    
                  //    //------------------------------------------------------------------
                  //    
                  //    //取消目標模塊內部的ModuleBlock可DragAction
                  //    TargetModuleBlock.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(_ModuleBlock => {
                  //        ModuleBlock_MoveMgr.Remove_ModuleBlock_Action_SeriesDrag(_ModuleBlock);
                  //    });
                  //    
                  //    //------------------------------------------------------------------
                  //    //取消目標模塊內部的TableField可DragAction
                  //    TargetModuleBlock.querySelectorAll(`.${ModuleBlockElementMgr.TableFieldName}`).forEach(_TableField => {
                  //        ModuleBlock_MoveMgr.Remove_Action_TableField_BlockMove(_TableField);
                  //    });


            }, 0);
        

    }  //抓取
    static DragEnd_EventAction(event) {

            ModuleBlock_MoveMgr.IsMoveNow = false;
            //ModuleBlock_MoveMgr.ReSetAll_Action_ModuleBlock_BlockMove();
            //ModuleBlock_MoveMgr.ReSetAll_Action_TableField_BlockMove();

            //------------------------------------------------------------------

            ModuleBlock_MoveMgr.closeHoldBoxParentNodeTextBoxColor();

            //------------------------------------------------------------------
            ModuleBlock_MoveMgr.ReSetDraggedBlock();
            ModuleBlock_MoveMgr.CloseHoldBox();
            console.log("拖曳結束時 刪除所有上下bar");
            //拖曳結束時 刪除所有上下bar
            ModuleBlock_MoveMgr.ReMoveAll_ModuleBlock_MoveHoldTargetBar();
            ModuleBlock_MoveMgr.ReMoveAll_ModuleBlock_SpacingBar();
            //------------------------------------------------------------------
            AutoScreen_js.resetAutoScreenBlockSize();

    }


    //--dragenter---------------------------------------------------------------------------------------------
    static DragEnter_EventAction(event) {
        //console.error("DragEnter");
        if (!ModuleBlock_MoveMgr.canMoveNow) {
            return;
        }

        if (ModuleBlock_MoveMgr.DraggedBlock == ModuleDataFetcherMgr.GetTargetModuleBlock(event.target)) {
            console.log("DragEnter-isDraggedBlock");
            return;
        }

        var target = event.target.closest(
            `   .${ModuleBlock_MoveMgr.HoldBoxName},
                .${ModuleBlockElementMgr.ModuleBlockName}
            `);

        if (!target)
        {
            return;
        }

        if (target.classList.contains(ModuleBlock_MoveMgr.HoldBoxName )) {
            ModuleBlock_MoveMgr.HoldBox_DragEnter(target);
        }
        else if (target.classList.contains(ModuleBlockElementMgr.ModuleBlockName))
        {
            ModuleBlock_MoveMgr.ModuleBlock_DragEnter(target);
        }
       
    }

    static HoldBox_DragEnter(HoldBox) {}
    static ModuleBlock_DragEnter(TargetModuleBlock) {
     
        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') {
            return;
        }

        //還沒結束
        //!(如果hold沒有打開 || 這個就是被移動的模塊 ModuleBlock_MoveMgr.DraggedBlock)
        ModuleBlock_MoveMgr.ReMoveAll_ModuleBlock_MoveHoldTargetBarExceptDescendants(TargetModuleBlock);


        //如果不是正在被抓取的模塊 就打開列表
        if (TargetModuleBlock !== ModuleBlock_MoveMgr.DraggedBlock && !ModuleBlock_MoveMgr.DraggedBlock.contains(TargetModuleBlock)) {
            

            console.log("關閉顏色");
            ModuleBlock_MoveMgr.ReSet_MoveHoldTargetBar(TargetModuleBlock);

            if (
                !ModuleBlockEditMgr.IsModuleBlock_TableGrid_Open(TargetModuleBlock)
            ) {
                console.log("打開列表");
                ModuleBlockEditMgr.OpenModuleBlock_OnceTable(TargetModuleBlock, true);
            }

            ModuleBlock_MoveMgr.setHoldBoxParentNodeTextBoxColor();
        }

    }
  
    //--dragover---------------------------------------------------------------------------------------------
    static DragOver_EventAction(event) {
        //console.error("Dragover");
        //HoldBoxIn
        if (!ModuleBlock_MoveMgr.canMoveNow) {
            return;
        }

        if (ModuleBlock_MoveMgr.DraggedBlock == ModuleDataFetcherMgr.GetTargetModuleBlock(event.target)) {
            console.log("Dragover-isDraggedBlock");
            return;
        }


        var target = event.target.closest(
            `   .${ModuleBlock_MoveMgr.HoldBoxName},
                .${ModuleBlockElementMgr.TableFieldName},
                .${ModuleBlockElementMgr.ModuleBlockName}
            `);

        if (!target) {
            return;
        }
        event.preventDefault();

        if (target.classList.contains(ModuleBlock_MoveMgr.HoldBoxName)) {
         
        }
        else if (target.classList.contains(ModuleBlockElementMgr.TableFieldName)) {
            console.log("Dragover-TableField");
            //this.#TableField_DragOver_EventAction
            ModuleBlock_MoveMgr.ModuleBlock_TableField_DragOver(target);
        }
        else if (target.classList.contains(ModuleBlockElementMgr.ModuleBlockName)) {
            console.log("Dragover-ModuleBlock");
            //this.#ModuleBlock_DragOver_EventAction
            ModuleBlock_MoveMgr.ModuleBlock_DragOver(event,target);
        }
        
    }

    static ModuleBlock_TableField_DragOver(TargetModuleBlock_TableField) {
        //ModuleBlock_MoveMgr.#TableField_DragOver_EventAction
        //console.warn("塞在  ableField_ " + ModuleDataFetcherMgr.GetTargetModuleBlock(TargetModuleBlock_TableField).id);
        ModuleBlock_MoveMgr.TrySetHoldBoxIn(TargetModuleBlock_TableField);
    }
    static ModuleBlock_DragOver(event, TargetModuleBlock) {
       
        //ModuleBlock_MoveMgr.#ModuleBlock_DragOver_EventAction
        ModuleBlock_MoveMgr.SetHoldBoxInByTrackMousePosition_ModuleBlock(event, TargetModuleBlock);
    }

    //--dragleave---------------------------------------------------------------------------------------------
    static DragLeave_EventAction(event) {

        if (!ModuleBlock_MoveMgr.canMoveNow) {
            return;
        }

        //console.error("DragLeave");
        if (ModuleBlock_MoveMgr.DraggedBlock == ModuleDataFetcherMgr.GetTargetModuleBlock(event.target)) {
            console.log("DragLeave-isDraggedBlock");
            return;
        }
        var target = event.target.closest(
            `
                .${ModuleBlockElementMgr.TableFieldName},
                .${ModuleBlockElementMgr.ModuleBlockName}
            `);

        if (!target) {
            return;
        }

        if (target.classList.contains(ModuleBlockElementMgr.TableFieldName)) {
            console.log("DragLeave-TableField");
            //this.#TableField_DragLeave_EventAction
            ModuleBlock_MoveMgr.ModuleBlock_TableField_DragLeave(target);
        }
        else if (target.classList.contains(ModuleBlockElementMgr.ModuleBlockName)) {
            console.log("DragLeave-ModuleBlock");
            //this.#ModuleBlock_DragLeave_EventAction
            ModuleBlock_MoveMgr.ModuleBlock_DragLeave(target);
        }
    }

    static ModuleBlock_TableField_DragLeave(TargetModuleBlock_TableField) {
       // ModuleBlock_MoveMgr.#TableField_DragLeave_EventAction << 空的
       // return;
    }
    static ModuleBlock_DragLeave(TargetModuleBlock) {
        //ModuleBlock_MoveMgr.#ModuleBlock_DragLeave_EventAction << 空的
        //return;
    }
  
    //--drop---------------------------------------------------------------------------------------------
    static Drop_EventAction(event) {

        if (!ModuleBlock_MoveMgr.canMoveNow) {
            return;
        }
        //console.error("Drop");
        if (ModuleBlock_MoveMgr.DraggedBlock == ModuleDataFetcherMgr.GetTargetModuleBlock(event.target)) {
            console.log("Drop-isDraggedBlock");
            return;
        }
        var target = event.target.closest(
            `   .${ModuleBlock_MoveMgr.HoldBoxName},
                .${ModuleBlockElementMgr.TableFieldName},
                .${ModuleBlockElementMgr.ModuleBlockName}
            `);

        if (!target) {
            return;
        }


        if (target.classList.contains(ModuleBlock_MoveMgr.HoldBoxName)) {
            ModuleBlock_MoveMgr.#holdBox_Drop();
        }
        else if (target.classList.contains(ModuleBlockElementMgr.TableFieldName)) {
            console.log("Drop-TableField");
            //this.HoldBox_Drop
            ModuleBlock_MoveMgr.ModuleBlock_TableField_Drop(target);
        }
        else if (target.classList.contains(ModuleBlockElementMgr.ModuleBlockName)) {
            ////this.#ModuleBlock_Drop_EventAction
            console.log("Drop-ModuleBlock");
            ModuleBlock_MoveMgr.ModuleBlock_Drop(target);
        }


    }

    static ModuleBlock_TableField_Drop(TargetModuleBlock_TableField) {

        ModuleBlock_MoveMgr.#holdBox_Drop();
    }

    static ModuleBlock_Drop(TargetModuleBlock) {
        //ModuleBlock_MoveMgr.#ModuleBlock_Drop_EventAction(); V
        //ModuleBlock_MoveMgr.closeHoldBoxParentNodeTextBoxColor();
        ModuleBlock_MoveMgr.#holdBox_Drop();
    }


    //=== [ 設定拖曳目標 ] ===

    static DraggedBlock = null;
    static SetDraggedBlock(target) {
        if (ModuleBlockElementMgr.checkIsModuleBlock(target)) {
            this.ReSetDraggedBlock();
            this.DraggedBlock = target;

            this.DraggedBlock.style.opacity = 0.3;

            // 禁止滑鼠互動
            //this.DraggedBlock.style.pointerEvents = 'none';
        }
    }
    static ReSetDraggedBlock() {

        if (this.DraggedBlock) {
            //this.DraggedBlock.style.visibility = 'visible';
            this.DraggedBlock.style.opacity = 1;
            // 恢復滑鼠互動
            //this.DraggedBlock.style.pointerEvents = 'auto';
            this.DraggedBlock = null
        }
    }

    //----------------------------------------------------------------------------------


    // 將新增框設置在目標元素城之內
    static SetHoldBoxIn(Target, IsBefore) {


        if (!Target || !this.HoldBox) {
            return;
        }

        if (!this.CheckHoldBoxIsShow()) {
            return;
        }

        //Target.style.backgroundColor = "#f1948a"

        // 防止將節點插入到自身內部或祖先節點
        if (this.HoldBox.contains(Target)) {
            return;
        }

        // 確保 HoldBox 不在 Target 中，將其添加為最後一個子元素
        if (!Target.contains(this.HoldBox)) {

            if (IsBefore) {
                Target.insertBefore(this.HoldBox, Target.firstChild);
            }
            else {
                Target.appendChild(this.HoldBox);
            }

            console.warn("===== [ 將新增框設置在目標元素城之內 ] =====");
        }
        // 如果 HoldBox 已經在 Target 中，但不是最後一個子元素，將其移動到最後
        else if (Target.lastElementChild !== this.HoldBox) {

            if (IsBefore) {
                Target.insertBefore(this.HoldBox, Target.firstChild);
            }
            else {
                Target.appendChild(this.HoldBox);
            }

            console.warn("===== [ 將新增框設置在目標元素城之內 ] =====");
        }
    }
    // 將新增框設置在目標元素之前
    static HoldBoxIsBefore(Target) {
        //ModuleBlock_MoveMgr.OpenHoldBox();
        if (Target.parentNode && Target.previousSibling !== this.HoldBox /*&& Target.previousSibling !== DraggedBlock*/) { // 检查 AddBox 是否在目标之前

            return false;
        } else {
            console.log("AddBox 已经在目标位置之前。");
            return true;
        }
    }
    static SetHoldBoxBefore(Target) {
        if (!this.HoldBoxIsBefore(Target)) { // 检查 AddBox 是否在目标之前

            Target.parentNode.insertBefore(this.HoldBox, Target);
        }
        this.setHoldBoxParentNodeTextBoxColor();
        this.setHoldBoxShowValidOrError();
        AutoScreen_js.resetAutoScreenBlockSize();
    }
    // 將新增框設置在目標元素之後
    static HoldBoxIsAfter(Target) {
        //ModuleBlock_MoveMgr.OpenHoldBox();
        if (Target.parentNode && Target.nextSibling !== this.HoldBox /*&& Target.nextSibling !== DraggedBlock*/) { // 检查 AddBox 是否在目标之后

            return false;

        } else {

            return true;
        }
    }
    static SetHoldBoxAfter(Target) {
        if (!this.HoldBoxIsAfter(Target)) { // 检查 AddBox 是否在目标之后

            Target.parentNode.insertBefore(this.HoldBox, Target.nextSibling);
        }
        this.setHoldBoxParentNodeTextBoxColor();
        this.setHoldBoxShowValidOrError();
        AutoScreen_js.resetAutoScreenBlockSize();
    }


    //----------------------------------------------------------------------------------
    //exclamation-triangle
    static setHoldBoxShowValidOrError() {

        return;
        const HoldBox_Checker = this.HoldBox.parentNode;
        const DraggedBlock_Checker = this.DraggedBlock.parentNode;


        if (this.DraggedBlock.dataset.QuestionMode == "true") {



            let parentNodeModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(HoldBox_Checker);

            if (parentNodeModuleBlock) {
                var IsInOption = false;

                let _Parent_ParentNodeModuleBlock = parentNodeModuleBlock;


                while (_Parent_ParentNodeModuleBlock) {

                    let name = ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(_Parent_ParentNodeModuleBlock).name;
                    if (this.DraggedBlock.id == name) {

                        IsInOption = true;

                        _Parent_ParentNodeModuleBlock = null;
                    }
                    else {

                        _Parent_ParentNodeModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(_Parent_ParentNodeModuleBlock.parentNode);
                    }
                }


            }

            if (IsInOption) {
                this.ShowHoldBox_Error();
                return;
            }

        }
        //如果是選項
        else if (this.DraggedBlock.dataset.OptionMode == "true") {

            let parentNodeModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(HoldBox_Checker);

            if (parentNodeModuleBlock) {
                const Option_ParentNodeId = ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(this.DraggedBlock).name;
                //var TargetModuleBlock = DraggedBlock_Checker.closest("." + ModuleBlockElementMgr.ModuleBlockName);

                if (parentNodeModuleBlock.id == Option_ParentNodeId) {
                    this.ShowHoldBox_Valid();
                    console.log("在目標底下");
                    return;
                }
                else if (parentNodeModuleBlock.dataset.GridMode == "true") {

                    let _ParentNodeModuleBlock = parentNodeModuleBlock;
                    let _Parent_ParentNodeModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(_ParentNodeModuleBlock.parentNode)

                    while ((_Parent_ParentNodeModuleBlock) && _Parent_ParentNodeModuleBlock.dataset.GridMode == "true") {
                        _ParentNodeModuleBlock = _Parent_ParentNodeModuleBlock;
                        _Parent_ParentNodeModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(_ParentNodeModuleBlock.parentNode)

                        if (_Parent_ParentNodeModuleBlock) {

                        }
                    }

                    if (_Parent_ParentNodeModuleBlock) { }
                    else { _Parent_ParentNodeModuleBlock = _ParentNodeModuleBlock; }


                    if (_Parent_ParentNodeModuleBlock.id == Option_ParentNodeId) {
                        this.ShowHoldBox_Valid();
                        console.log("在目標問題表格底下");
                        return;
                    }
                    else {
                        var Root = document.querySelector(`#${_Parent_ParentNodeModuleBlock.id}`);
                        var Parent = document.querySelector(`#${Option_ParentNodeId}`);
                        if (ModuleDataFetcherMgr.GetTargetModuleBlock(Parent.parentNode).contains(HoldBox_Checker)) {
                            if (Root && Parent) {
                                // 使用 contains() 確認 Parent 是否是 Root 的後代
                                if (Root.contains(Parent)) {
                                    this.ShowHoldBox_Valid();
                                    console.log("Parent 是 Root 的後代節點。");
                                    return;
                                } else {
                                    console.log("Parent 不在 Root 裡面。");
                                }
                            } else {
                                console.error("Root 或 Parent 無法找到！");
                            }
                        }

                    }


                }
                else if (true) {

                }
                console.log("不在目標底下");
                //不能在其他選項底下
                //在表格底下
            }

            this.ShowHoldBox_Error();
            return;
        }



        //確認目前 HoldBox 位置是在表格裡面還是一般列表裡面

        //如果在列表裡面 確認是不是在原始parentNode

        //是選項的模塊

        //if (ModuleDataFetcherMgr.GetTargetModuleBlock(HoldBox_Checker) === ModuleDataFetcherMgr.GetTargetModuleBlock(DraggedBlock_Checker)) {

        //    this.ShowHoldBox_Valid();
        //}
        //else {

        //    this.ShowHoldBox_Error();
        //}
        this.ShowHoldBox_Valid();

    }

    static setHoldBoxParentNodeTextBoxColor() {

        this.closeHoldBoxParentNodeTextBoxColor();

        this.HoldBoxInnerTargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(this.HoldBox.parentNode);

        if (this.HoldBoxInnerTargetModuleBlock) {

            console.log(" 有 HoldBoxInnerTargetModuleBlock " + this.HoldBoxInnerTargetModuleBlock.id)

            ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(this.HoldBoxInnerTargetModuleBlock).style.backgroundColor = "#92e8b0";


            var TargetModuleBlock_SixPointMoveBar = ModuleDataFetcherMgr.GetTargetModuleBlock_SixPointMoveBar(this.HoldBoxInnerTargetModuleBlock);
            if (TargetModuleBlock_SixPointMoveBar) {
                //  TargetModuleBlock_SixPointMoveBar.style.backgroundColor = "#9be8bb";
                TargetModuleBlock_SixPointMoveBar.style.backgroundColor = "#7cde9e";
            }

            var TargetListTableField = ModuleDataFetcherMgr.GetTargetModuleBlock_ListTableField(this.HoldBoxInnerTargetModuleBlock);
            if (TargetListTableField) {

                //設定顏色
                //TargetListTableField.style.backgroundColor = "#ffddd6";
                TargetListTableField.style.backgroundColor = "#b8fccf";
                console.log(" 有 TargetListTableField")
            }
        }
    }
    static closeHoldBoxParentNodeTextBoxColor() {



        if (this.HoldBoxInnerTargetModuleBlock) {
            ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(this.HoldBoxInnerTargetModuleBlock).style.backgroundColor = "";

            var TargetModuleBlock_SixPointMoveBar = ModuleDataFetcherMgr.GetTargetModuleBlock_SixPointMoveBar(this.HoldBoxInnerTargetModuleBlock);
            if (TargetModuleBlock_SixPointMoveBar) {
                TargetModuleBlock_SixPointMoveBar.style.backgroundColor = "";
            }

            var TargetListTableField = ModuleDataFetcherMgr.GetTargetModuleBlock_ListTableField(this.HoldBoxInnerTargetModuleBlock);
            if (TargetListTableField) {
                //關閉顏色
                TargetListTableField.style.backgroundColor = "#e6f5eb";
            }


        }
    }

    static ShowHoldBox_Valid() {
        this.HoldBox.dataset.CanSwap = true;
        var HoldBoxInner = this.HoldBox.querySelector("." + this.HoldBoxInnerName);
        HoldBoxInner.style.backgroundColor = "";

        var IconDiv = this.HoldBox.querySelector(".bi");
        if (IconDiv) { // 確保目標元素存在
            IconDiv.classList.remove("bi-plus-square", "bi-exclamation-triangle-fill", "bi-x-octagon-fill"); // 移除指定的 class
            IconDiv.style.color = ""

            IconDiv.classList.add("bi-plus-square");
        }
    }

    static ShowHoldBox_Error() {
        this.HoldBox.dataset.CanSwap = false;
        console.log("ShowHoldBox_Error");
        var HoldBoxInner = this.HoldBox.querySelector("." + this.HoldBoxInnerName);
        HoldBoxInner.style.backgroundColor = "#ff867d";

        var IconDiv = this.HoldBox.querySelector(".bi");
        if (IconDiv) { // 確保目標元素存在
            IconDiv.classList.remove("bi-plus-square", "bi-exclamation-triangle-fill", "bi-x-octagon-fill"); // 移除指定的 class

            IconDiv.style.color = "white";
            //IconDiv.classList.add("bi-x-octagon-fill");
            IconDiv.classList.add("bi-exclamation-triangle-fill");
        }


    }
    //-------------------------------
    static TrySetHoldBoxIn(target, IsBefore) {

        console.log(" IsBefore=> " + IsBefore)
        this.SetHoldBoxIn(target, IsBefore);

        this.setHoldBoxParentNodeTextBoxColor();
        this.setHoldBoxShowValidOrError();
        AutoScreen_js.resetAutoScreenBlockSize();
    }
    //-------------------------------
    static HoldBox_Drop(event) {
        ModuleBlock_MoveMgr.closeHoldBoxParentNodeTextBoxColor();
        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_Drop(event)) {
            ModuleBlock_MoveMgr.#holdBox_Drop();
        }
    }
    static #holdBox_Drop() {
        console.log("交換位置");
        //event.stopPropagation();

        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') { // 检查当前状态是否为 'none'

            console.log("AddBox 已关闭。");
            //this.ReSetDraggedBlock();
            //return;
        }

        var DraggedBlockCheckBox = ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(ModuleBlock_MoveMgr.DraggedBlock);

        //撈取原始的問題目標
        console.log("來自問題[" + DraggedBlockCheckBox.name + "]");
        var locQuestionBlock = null;
        if (typeof id === 'string' && id.trim() !== '' && !/[^\w\-]/.test(DraggedBlockCheckBox.name)) {
            locQuestionBlock = document.querySelector(`#${DraggedBlockCheckBox.name}`);
            if (locQuestionBlock) {
                console.log("✅ 找到元素", locQuestionBlock);
            } else {
                console.warn("⚠️ 元素不存在");
            }
        } 

        if (this.HoldBox.dataset.CanSwap == "true") {

            console.log("交換位置" + this.HoldBox.dataset.CanSwap + typeof (this.HoldBox.dataset.CanSwap));

            SwapMgr.swapDomObj(this.HoldBox, this.DraggedBlock);

            var parentModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(this.DraggedBlock.parentNode);

            if (parentModuleBlock &&
                parentModuleBlock.dataset.QuestionMode == "true" &&
                this.DraggedBlock.dataset.OptionMode == "true"
            ) {
                DraggedBlockCheckBox.name = parentModuleBlock.id;

                ModuleOptionEditor.checkHasOption(parentModuleBlock);

                ModuleOptionEditor.ResetAllOptionBecome_TargetCheckboxType(parentModuleBlock);
            }

        }

        if (locQuestionBlock) {
            ModuleOptionEditor.checkHasOption(locQuestionBlock);
        }


        console.log("交換位置");


        this.ReSetDraggedBlock();
    }


    //=== [ 移動目標設置 ] ===========================================================================================
    static ReMoveAll_ModuleBlock_MoveHoldTargetBar() {
        document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(ModuleBlock => {

            this.ReMove_MoveHoldTargetBar(ModuleBlock);
        });
    }
    static ReMoveAll_ModuleBlock_MoveHoldTargetBarExceptDescendants(target) {
        document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(ModuleBlock => {
            if (!target.contains(ModuleBlock)) { // 排除掉子孙元素


                this.ReMove_MoveHoldTargetBar(ModuleBlock);
            }
        });
    }


    static ReMoveAll_ModuleBlock_SpacingBar() {
        document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(ModuleBlock => {
            this.ReMove_SpacingBar(ModuleBlock);
        });
    }
    static ReMove_SpacingBar(TargetModuleBlock) {

        //return;
        if (ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {

            ModuleBlockEditMgr.SetModuleBlock_OnceTableDragStyle(TargetModuleBlock, false);


        }
    }
    static ReSet_MoveHoldTargetBar(TargetModuleBlock) {

        if (ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {


            console.log(" 設定 關閉 風格 003");
            this.ReMove_MoveHoldTargetBar(TargetModuleBlock);

            this.#ShowMoveHoldTargetBar(TargetModuleBlock);
        }
    }
    //解除放置狀態
    static ReMove_MoveHoldTargetBar(TargetModuleBlock) {

        //return;
        if (ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            //console.log("======  關閉  ============");

            const ModuleBlock_inner = TargetModuleBlock.querySelector(`.${ModuleBlockElementMgr.ModuleBlock_innerName}`);
            if (!ModuleBlock_inner) {
                return;
            }


            if (
                !ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(TargetModuleBlock).querySelector("." + ModuleBlockElementMgr.ModuleBlockName)  //表格沒開 沒有其他模塊
                &&
                !ModuleBlockEditMgr.IsModuleBlock_TableGrid_Open(TargetModuleBlock)  //表格沒開
            ) {

                ModuleBlockEditMgr.OpenModuleBlock_OnceTable(TargetModuleBlock, false);
            }
            console.log(" 設定 關閉 風格 ");
            ModuleBlockEditMgr.SetModuleBlock_OnceTableDragStyle(TargetModuleBlock, false);

            ModuleBlock_inner.style.paddingTop = '';
            ModuleBlock_inner.style.paddingBottom = '';

        }

    }
    static #ShowMoveHoldTargetBar(TargetModuleBlock) {
        if (ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            const ModuleBlock_inner = TargetModuleBlock.querySelector(`.${ModuleBlockElementMgr.ModuleBlock_innerName}`);
            if (!ModuleBlock_inner) {
                return;
            }

            //-------------------------------------------------------------------------------
            ModuleBlock_inner.style.paddingTop = this.MoveHoldTargetTopValue + "px";
            ModuleBlock_inner.style.paddingBottom = this.MoveHoldTargetBottomValue + "px";


            //確認模塊類別
            if (ModuleBlockEditMgr.IsModuleBlock_TableGrid_Open(TargetModuleBlock)) {
                // ModuleBlockEditMgr.OpenModuleBlock_OnceTable(targetDiv, false);
            }
            else  /* if (!ModuleBlockEditMgr.IsModuleBlock_OnceTable_Open(TargetModuleBlock))*/ {
                //ModuleBlockEditMgr.OpenModuleBlock_OnceTable(TargetModuleBlock, true);
                ModuleBlockEditMgr.SetModuleBlock_OnceTableDragStyle(TargetModuleBlock, true);
            }

        }
    }
    //確認滑鼠在上在下

    static SetHoldBoxInByTrackMousePosition_ModuleBlock(event, targetDiv) {
        
        console.log("Set HoldBox In By TrackMousePosition _ ModuleBlock");


        if (ModuleBlock_MoveMgr.DraggedBlock === targetDiv) {
            console.log("DraggedBlock === targetDiv");

            return;
        }

        if (!ModuleBlockElementMgr.checkIsModuleBlock(targetDiv)) {
            console.log("checkIsModuleBlock");
            return;
        }

        console.log("確認位置");
        const rect = targetDiv.getBoundingClientRect(); // 获取目标DIV的位置信息

        const OnceTable = ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(targetDiv);
        const TableGrid = ModuleDataFetcherMgr.GetTargetModuleBlock_TableGrid(targetDiv);

        let TopScope = rect.top;
        let DownScope = rect.top + rect.height - (ModuleBlock_MoveMgr.MoveHoldTargetBottomValue); //下面範圍
        if (OnceTable && OnceTable.style.display !== "none") {
            const OnceTableRect = OnceTable.getBoundingClientRect(); // 获取目标DIV的位置信息
            if (TopScope < OnceTableRect.top) {
                TopScope = OnceTableRect.top;
            }

           
        }
        if (TableGrid && TableGrid.style.display !== "none") {
            const TableGridRect = TableGrid.getBoundingClientRect(); // 获取目标DIV的位置信息
            if (TopScope < TableGridRect.top) {
                TopScope = TableGridRect.top;
            }

        }
        let mouseY = event.clientY;

        TopScope = (TopScope + rect.top) / 2;


        if (mouseY < TopScope) {
            ModuleBlock_MoveMgr.SetHoldBoxBefore(targetDiv);

        }
        else if (mouseY > DownScope) {
            ModuleBlock_MoveMgr.SetHoldBoxAfter(targetDiv);
          
        }
        else {
         
        }


    }


    ///=== [ 模塊移動用 Event確認 ] ===========================================================================================

    static CheckEventisEnd_BlockMove_MouseEnter(event) {

        let IsEnd = event.BlockMove_MouseEnter_Isend;
        event.BlockMove_MouseEnter_Isend = true;
        this.EventLogTag(event, "MouseEnter-" + IsEnd);

        if (!ModuleBlock_MoveMgr.canMoveNow) {
            IsEnd = true;
        }


        return IsEnd;
    }   //滑鼠移入

    static CheckEventisEnd_BlockMove_MouseLeave(event) {

        this.EventLogTag(event, "MouseLeave");
        let IsEnd = event.BlockMove_MouseLeave_Isend;
        event.BlockMove_MouseLeave_Isend = true;
        if (!ModuleBlock_MoveMgr.canMoveNow) {
            IsEnd = true;
        }
        return IsEnd;
    }   //滑鼠移出

    static CheckEventisEnd_BlockMove_DragStart(event) {
        this.EventLogTag(event, "DragStart");
        let IsEnd = event.BlockMove_DragStart_Isend;
        event.BlockMove_DragStart_Isend = true;
        if (!ModuleBlock_MoveMgr.canMoveNow) {
            IsEnd = true;
        }
        return IsEnd;
    }   //抓取-開始

    static CheckEventisEnd_BlockMove_DragEnd(event) {
        this.EventLogTag(event, "DragEnd");
        let IsEnd = event.BlockMove_DragEnd_Isend;
        event.BlockMove_DragEnd_Isend = true;

        return IsEnd;
    }   // 抓取-結束

    //---------------------------------------------------------------

    static CheckEventisEnd_BlockMove_DragEnter(event) {
        this.EventLogTag(event, "DragEnter");
        let IsEnd = event.BlockMove_DragEnter_Isend;
        event.BlockMove_DragEnter_Isend = true;
        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') {
            IsEnd = true;
        }
        const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);
        if (TargetModuleBlock === ModuleBlock_MoveMgr.DraggedBlock) {
            IsEnd = true;
        }
        return IsEnd;
    }   // 拖曳-進來

    static CheckEventisEnd_BlockMove_DragLeave(event) {
        this.EventLogTag(event, "DragLeave");
        let IsEnd = event.BlockMove_DragLeave_Isend;
        event.BlockMove_DragLeave_Isend = true;
        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') {
            IsEnd = true;
        }
        const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);
        if (TargetModuleBlock === ModuleBlock_MoveMgr.DraggedBlock) {
            IsEnd = true;
        }
        return IsEnd;
    }   // 拖曳-離開

    static CheckEventisEnd_BlockMove_Drop(event) {
        this.EventLogTag(event, "Drop");
        let IsEnd = event.BlockMove_Drop_Isend;
        event.BlockMove_Drop_Isend = true;
        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') {
            IsEnd = true;
        }
        const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);
        if (TargetModuleBlock === ModuleBlock_MoveMgr.DraggedBlock) {
            IsEnd = true;
        }
        return IsEnd;
    }   // 拖曳-放置

    //---------------------------------------------------------------
    static CheckEventisEnd_BlockMove_DragOver(event) {

        //this.EventLogTag(event, "DragOver");
        let IsEnd = event.BlockMove_DragOver_Isend;

        //if (!IsEnd) {
        //    this.EventLogTag(event, "DragOver_調用");
        //}
        //else {
        //    //this.EventLogTag(event, "DragOver_非調用");
        //}
        this.EventLogTag(event, "DragOver");

        event.BlockMove_DragOver_Isend = true;
        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') {
            IsEnd = true;
        }
        const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);
        if (TargetModuleBlock === ModuleBlock_MoveMgr.DraggedBlock) {
            IsEnd = true;
        }
        return IsEnd;
    }   // 拖曳-移動中
    static CheckEventisEnd_BlockMove_DragOver_SetHoldBoxIn(event) {
        this.EventLogTag(event, "DragMoveBlock DragOver_SetHoldBoxIn");
        let IsEnd = event.BlockMove_DragMoveBlock_SetHoldBoxIn_Isend;

        event.BlockMove_DragMoveBlock_SetHoldBoxIn_Isend = true;
        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') {
            //event.BlockMove_DragMoveBlock_SetHoldBoxIn_Isend = true;
            IsEnd = true;
        }
        const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);
        if (TargetModuleBlock === ModuleBlock_MoveMgr.DraggedBlock) {
            //event.BlockMove_DragMoveBlock_SetHoldBoxIn_Isend = true;
            IsEnd = true;
        }
        return IsEnd;
    }   // 拖曳-移動--特殊
    static CheckEventisEnd_BlockMove_DragOver_SetInnerMoveBar(event) {
        this.EventLogTag(event, "DragMoveBlock DragOver_SetInnerMoveBar");
        let IsEnd = event.BlockMove_DragMoveBlock_SetInnerMoveBar_Isend;

        event.BlockMove_DragMoveBlock_SetInnerMoveBar_Isend = true;
        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') {
            IsEnd = true;
        }
        const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);
        if (TargetModuleBlock === ModuleBlock_MoveMgr.DraggedBlock) {
            IsEnd = true;
        }
        return IsEnd;
    }   // 拖曳-移動--特殊
    static CheckEventisEnd_BlockMove_DragOver_SetSpacing(event) {
        this.EventLogTag(event, "DragMoveBlock");
        let IsEnd = event.BlockMove_DragMoveBlock_SetSpacing_Isend;

        event.BlockMove_DragMoveBlock_SetSpacing_Isend = true;
        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') {
            IsEnd = true;
        }
        const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);
        if (TargetModuleBlock === ModuleBlock_MoveMgr.DraggedBlock) {
            IsEnd = true;
        }


        return IsEnd;
    }   // 拖曳-移動--特殊
    //---------------------------------------------------------------
    static EventLogTag(event, type) {
        const tagName = event.currentTarget.className;
        return;
        console.log(`tagName: ${tagName} - ${type}`); // 輸出目標的標籤名稱（例如：BUTTON, INPUT, P）
    }


    ///##### [ 設定 HoldBox 移動邏輯] ##### ==============================================================================
    static ReSet_Action_HoldBox_BlockMove() {
        // 重新設定 BlockMover 事件，處理拖曳進入邏輯
        this.Remove_Action_HoldBox_BlockMove();
        this.#Set_Action_HoldBox_BlockMove();

    }   //重置HoldBox移動邏輯
    static Remove_Action_HoldBox_BlockMove() {
        this.#Remove_HoldBox_Action_SeriesDrag();
    }
    static #Set_Action_HoldBox_BlockMove() {

        this.#Set_HoldBox_Action_SeriesDrag()
    }
    //===[ Drag ]===
    static #Remove_HoldBox_Action_SeriesDrag() {

        // 刪除設定 DragEnter 事件，處理拖曳進入邏輯
        this.HoldBox.removeEventListener("dragenter", this.#HoldBox_DragEnter_EventAction);

        // 刪除設定 DragOver 事件，處理拖曳移動
        this.HoldBox.removeEventListener("dragover", this.#HoldBox_DragOver_EventAction);

        // 刪除設定 drop 事件，處理放置邏輯
        this.HoldBox.removeEventListener("drop", this.#HoldBox_Drop_EventAction);
    }
    static #Set_HoldBox_Action_SeriesDrag() {
        // 設定 DragEnter 事件，處理拖曳進入邏輯
        this.HoldBox.addEventListener("dragenter", this.#HoldBox_DragEnter_EventAction);

        // 設定 DragOver 事件，處理拖曳移動
        this.HoldBox.addEventListener("dragover", this.#HoldBox_DragOver_EventAction);

        // 設定 drop 事件，處理放置邏輯
        this.HoldBox.addEventListener("drop", this.#HoldBox_Drop_EventAction);
    }
    //---EventAction
    static #HoldBox_DragEnter_EventAction(event) {

        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragEnter(event)) {

        }
    }   //移動邏輯[拖曳-進來]

    static #HoldBox_DragOver_EventAction(event) {
        event.preventDefault();  // 必須調用 preventDefault 來允許放置
        //console.log("HoldBox_DragOver_EventAction");
        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragOver_SetInnerMoveBar(event)) {
        }
        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragOver_SetSpacing(event)) {
        }
        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragOver_SetHoldBoxIn(event)) {

        }
    }   //移動邏輯[拖曳-移動中]

    static #HoldBox_Drop_EventAction(event) {
        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_Drop(event)) {

            ModuleBlock_MoveMgr.#holdBox_Drop();
        }
    }   //移動邏輯[拖曳-放置]



    ///##### [ 設定 ModuleBlock 移動邏輯] ##### ==============================================================================


    static SetStopPropagation_Action_ModuleBlock_BlockMove(targetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(targetModuleBlock)) {
            return;
        }
        console.log("阻止模塊冒泡");
        //this.Remove_ModuleBlock_Action_SeriesDrag(targetModuleBlock);
        ////-----------------------------------------------------------------
        //targetModuleBlock.removeEventListener('dragenter', this.CheckEventisEnd_BlockMove_DragEnter);
        ////-----------------------------------------------------------------
        //targetModuleBlock.removeEventListener('dragover', (event => { ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragOver(event) }));
        ////-----------------------------------------------------------------
        //targetModuleBlock.removeEventListener('dragleave', this.CheckEventisEnd_BlockMove_DragLeave);
        //-----------------------------------------------------------------
        //targetModuleBlock.removeEventListener('drop', this.CheckEventisEnd_BlockMove_DragEnd);
    }


    static ReSetAll_Action_ModuleBlock_BlockMove() {
        //this.ReSetAll_ModuleBlock_Action_SeriesMouse();
        this.ReSetAll_ModuleBlock_Action_SeriesDrag();
    }
    static RemoveAll_Action_ModuleBlock_BlockMove() {
        //this.RemoveAll_ModuleBlock_Action_SeriesMouse();
        this.RemoveAll_ModuleBlock_Action_SeriesDrag();
    }
    static ReSet_Action_ModuleBlock_BlockMove(targetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(targetModuleBlock)) {
            return;
        }
        //this.ReSet_ModuleBlock_Action_SeriesMouse(targetModuleBlock);
        this.ReSet_ModuleBlock_Action_SeriesDrag(targetModuleBlock);
    }



    //===[ Drag ]===
    static RemoveAll_ModuleBlock_Action_SeriesDrag() {

        document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(ModuleBlock => {
            this.Remove_ModuleBlock_Action_SeriesDrag(ModuleBlock);
        });
    }
    static ReSetAll_ModuleBlock_Action_SeriesDrag() {

        document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(ModuleBlock => {
            this.ReSet_ModuleBlock_Action_SeriesDrag(ModuleBlock);
        });
    }
    //----------------------------------------------------------
    static ReSet_ModuleBlock_Action_SeriesDrag(targetModuleBlock) {
        this.Remove_ModuleBlock_Action_SeriesDrag(targetModuleBlock);
        this.#Set_ModuleBlock_Action_SeriesDrag(targetModuleBlock);

    }
    static Remove_ModuleBlock_Action_SeriesDrag(targetModuleBlock) {

        if (!ModuleBlockElementMgr.checkIsModuleBlock(targetModuleBlock)) { return; }
        //-----------------------------------------------------------------
        targetModuleBlock.removeEventListener('dragenter', this.#ModuleBlock_DragEnter_EventAction);
        //-----------------------------------------------------------------
        targetModuleBlock.removeEventListener('dragover', this.#ModuleBlock_DragOver_EventAction);
        //-----------------------------------------------------------------
        targetModuleBlock.removeEventListener('dragleave', this.#ModuleBlock_DragLeave_EventAction);
        //-----------------------------------------------------------------
        targetModuleBlock.removeEventListener('drop', this.#ModuleBlock_Drop_EventAction);
        //-----------------------------------------------------------------
        var InnerBlock = ModuleDataFetcherMgr.GetTargetModuleBlock_Inner(targetModuleBlock);
        if (!InnerBlock) { return; }
        //-----------------------------------------------------------------
        InnerBlock.removeEventListener('dragenter', this.#InnerBlock_DragEnter_EventAction);
        //-----------------------------------------------------------------
        InnerBlock.removeEventListener('dragover', this.#InnerBlock_DragOver_EventAction);
        //-----------------------------------------------------------------
        InnerBlock.removeEventListener('dragleave', this.#InnerBlock_DragLeave_EventAction);
        //-----------------------------------------------------------------
        InnerBlock.removeEventListener('drop', this.#InnerBlock_Drop_EventAction);

    }
    static #Set_ModuleBlock_Action_SeriesDrag(targetModuleBlock) {

        if (!ModuleBlockElementMgr.checkIsModuleBlock(targetModuleBlock)) { return; }
        //-----------------------------------------------------------------
        targetModuleBlock.addEventListener('dragenter', this.#ModuleBlock_DragEnter_EventAction);
        //-----------------------------------------------------------------
        targetModuleBlock.addEventListener('dragover', this.#ModuleBlock_DragOver_EventAction);
        //-----------------------------------------------------------------
        targetModuleBlock.addEventListener('dragleave', this.#ModuleBlock_DragLeave_EventAction);
        //-----------------------------------------------------------------
        targetModuleBlock.addEventListener('drop', this.#ModuleBlock_Drop_EventAction);
        //-----------------------------------------------------------------
        var InnerBlock = ModuleDataFetcherMgr.GetTargetModuleBlock_Inner(targetModuleBlock);
        if (!InnerBlock) { return; }
        //-----------------------------------------------------------------
        //InnerBlock.addEventListener('dragenter', this.#InnerBlock_DragEnter_EventAction);
        //-----------------------------------------------------------------
        InnerBlock.addEventListener('dragover', this.#InnerBlock_DragOver_EventAction);
        //-----------------------------------------------------------------
        InnerBlock.addEventListener('dragleave', this.#InnerBlock_DragLeave_EventAction);
        //-----------------------------------------------------------------
        InnerBlock.addEventListener('drop', this.#InnerBlock_Drop_EventAction);
    }
    //---EventAction
    static #ModuleBlock_DragEnter_EventAction(event) {

        if (ModuleBlock_MoveMgr.HoldBox.style.display === 'none') {
            return;
        }

        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragEnter(event)) {

            ModuleBlock_MoveMgr.ReMoveAll_ModuleBlock_MoveHoldTargetBarExceptDescendants(event.currentTarget);
        }

        const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.currentTarget);
        if (TargetModuleBlock !== ModuleBlock_MoveMgr.DraggedBlock) {
            const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.currentTarget);

            console.log("關閉顏色");
            ModuleBlock_MoveMgr.ReSet_MoveHoldTargetBar(TargetModuleBlock);

            if (
                !ModuleBlockEditMgr.IsModuleBlock_TableGrid_Open(TargetModuleBlock)
            ) {
                console.log("打開列表");
                ModuleBlockEditMgr.OpenModuleBlock_OnceTable(TargetModuleBlock, true);
            }

            ModuleBlock_MoveMgr.setHoldBoxParentNodeTextBoxColor();
        }

    }

    static #ModuleBlock_DragOver_EventAction(event) {

        event.preventDefault();


        //根據上下 設定 HoldBox 上下  會被攔截
        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragOver_SetHoldBoxIn(event)) {
            //console.log("CheckEventisEnd_BlockMove_DragOver_SetHoldBoxIn");
            ModuleBlock_MoveMgr.SetHoldBoxInByTrackMousePosition_ModuleBlock(event, event.currentTarget);
        }

    }

    static #ModuleBlock_DragLeave_EventAction(event) {

        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragLeave(event)) {


        }
    }

    static #ModuleBlock_Drop_EventAction(event)//////////////////////////////////////////////////////////////////////////////////////////////////////////  好像可以加在AUTO SCREAM
    {


        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_Drop(event)) {

            ModuleBlock_MoveMgr.#holdBox_Drop(event);
        }

        console.log("ModuleBlock_Drop");
    }

    //---EventAction---[ InnerBlock ]



    static #InnerBlock_DragEnter_EventAction(event) { }

    static #InnerBlock_DragOver_EventAction(event) {

        event.preventDefault();
        console.log("InnerBlock_DragOver_EventAction");

    }

    static #InnerBlock_DragLeave_EventAction(event) { }

    static #InnerBlock_Drop_EventAction(event) { }



    ///##### [ 設定 TableField 移動邏輯] ##### ==============================================================================

    static ReSetAll_Action_TableField_BlockMove() {

        document.querySelectorAll(`.${ModuleBlockElementMgr.TableFieldName}`).forEach(_TableField => {
            ModuleBlock_MoveMgr.ReSet_Action_TableField_BlockMove(_TableField);
        });
    }
    static RemoveAll_Action_TableField_BlockMove() {

        document.querySelectorAll(`.${ModuleBlockElementMgr.TableFieldName}`).forEach(_TableField => {
            ModuleBlock_MoveMgr.Remove_Action_TableField_BlockMove(_TableField);
        });
    }
    //----------------------------------------------------------

    static ReSet_Action_TableField_BlockMove(targetTableField) {
        if (!ModuleBlockElementMgr.checkIsTableField(targetTableField)) {
            return;
        }
        this.ReSet_TableField_Action_SeriesDrag(targetTableField);
    }
    //Remove_TableField_Action_SeriesDrag(targetTableField) 
    static Remove_Action_TableField_BlockMove(targetTableField) {
        if (!ModuleBlockElementMgr.checkIsTableField(targetTableField)) {
            return;
        }
        this.Remove_TableField_Action_SeriesDrag(targetTableField);
    }
    //===[ Drag ]===
    static ReSetAll_TableField_Drag() {

        document.querySelectorAll(`.${ModuleBlockElementMgr.TableFieldName}`).forEach(_TableField => {
            this.ReSet_TableField_Action_SeriesDrag(_TableField);
        });

    }

    //----------------------------------------------------------
    static ReSet_TableField_Action_SeriesDrag(targetTableField) {

        if (!ModuleBlockElementMgr.checkIsTableField(targetTableField)) {
            return;
        }

        //-----------------------------------------------------------------
        this.Remove_TableField_Action_SeriesDrag(targetTableField);
        this.#Set_TableField_Action_SeriesDrag(targetTableField);
        //-----------------------------------------------------------------

    }
    static Remove_TableField_Action_SeriesDrag(targetTableField) {

        if (!ModuleBlockElementMgr.checkIsTableField(targetTableField)) {
            return;
        }

        //-----------------------------------------------------------------
        targetTableField.removeEventListener("dragenter", this.#TableField_DragEnter_EventAction);
        //-----------------------------------------------------------------
        targetTableField.removeEventListener("dragleave", this.#TableField_DragLeave_EventAction);
        //-----------------------------------------------------------------
        targetTableField.removeEventListener("dragover", this.#TableField_DragOver_EventAction);
        //-----------------------------------------------------------------
        targetTableField.removeEventListener("drop", ModuleBlock_MoveMgr.HoldBox_Drop);

    }
    static #Set_TableField_Action_SeriesDrag(targetTableField) {

        if (!ModuleBlockElementMgr.checkIsTableField(targetTableField)) {
            return;
        }
        //-----------------------------------------------------------------
        targetTableField.addEventListener("dragenter", this.#TableField_DragEnter_EventAction);
        //-----------------------------------------------------------------
        targetTableField.addEventListener("dragleave", this.#TableField_DragLeave_EventAction);
        //-----------------------------------------------------------------
        targetTableField.addEventListener("dragover", this.#TableField_DragOver_EventAction);
        //-----------------------------------------------------------------
        targetTableField.addEventListener("drop", ModuleBlock_MoveMgr.HoldBox_Drop);

    }

    //---EventAction
    static #TableField_DragEnter_EventAction(event) {

        //event.stopPropagation();
        //if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragEnter(event)) {

        //}
    }
    static #TableField_DragLeave_EventAction(event) {

        //if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragLeave(event)) {

        //}
    }
    static #TableField_DragOver_EventAction(event) {

        //console.log("TableField_DragOver_EventAction");
        event.preventDefault();  // 阻止默认行为，允许放置


        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragOver_SetSpacing(event)) {


        }
        if (!ModuleBlock_MoveMgr.CheckEventisEnd_BlockMove_DragOver_SetHoldBoxIn(event)) {
            console.warn("塞在  ableField_ " + ModuleDataFetcherMgr.GetTargetModuleBlock(event.currentTarget).id);
            ModuleBlock_MoveMgr.TrySetHoldBoxIn(event.currentTarget);
        }

    }


}
