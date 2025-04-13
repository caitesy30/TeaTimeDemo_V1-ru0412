//================== 模塊 [ 開啟 ] 管理 ==================
class ModuleBlockEditMgr {


    static OpenModuleBlock_Checkbox(TargetModuleBlock, bool) {


        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return;
        }


        const checkbox = ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(TargetModuleBlock);



        if (bool) {
            console.log("開");
            checkbox.style.display = '';
        } else {
            checkbox.style.display = 'none';
            console.log("關");
        }
    }

    //--------------------------------------------------------

    static closeModuleBlockTable(TargetModuleBlock) {

        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return;
        }

        const OnceTable = ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(TargetModuleBlock);
        const TableGrid = ModuleDataFetcherMgr.GetTargetModuleBlock_TableGrid(TargetModuleBlock);

        OnceTable.style.display = 'none';

        if (TableGrid) {

            TableGrid.style.display = 'none';
        }
    }


    static SetModuleBlock_OnceTableDragStyle(TargetModuleBlock, bool) {

        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {

            console.error("SetModuleBlock_OnceTableDragStyle   " + bool);
            return;
        }

        const OnceTable = ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(TargetModuleBlock);
        var TableField = OnceTable.querySelector("." + ModuleBlockElementMgr.TableFieldName);
        if (bool) {

            TableField.style.paddingBottom = "20px";
            //TableField.style.backgroundColor = "red"
            TableField.style.backgroundColor = "#e6f5eb";
            TableField.style.border = '1px dashed #51bdb4';
            TableField.style.borderTop = "";
            TableField.style.borderTopLeftRadius = "0px";
            TableField.style.borderTopRightRadius = "0px";
        } else {
            //return;
            TableField.style.padding = "";
            TableField.style.backgroundColor = "";
            TableField.style.border = '';
            TableField.style.outline = ""; // 清除 outline
            //TableField.style.borderRadius = ''; // 清除圓角樣式

        }
    }

    static OpenModuleBlock_OnceTable(TargetModuleBlock, bool) {
        // 先隱藏一次
        ModuleBlockEditMgr.closeModuleBlockTable(TargetModuleBlock);
        const OnceTable = ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(TargetModuleBlock);

        if (!OnceTable) {
            console.warn("未找到 OnceTable 元素");
            return;
        }


        if (bool) {
            //console.log("開");
            OnceTable.style.display = '';
        } else {
            //console.log("關");
            OnceTable.style.display = 'none';
        }
    }

    static OpenModuleBlock_TableGrid(TargetModuleBlock, bool) {



        ModuleBlockEditMgr.closeModuleBlockTable(TargetModuleBlock);
        const TableGrid = ModuleDataFetcherMgr.GetTargetModuleBlock_TableGrid(TargetModuleBlock);

        if (TableGrid) {

            if (bool) {
                //console.log("開");
                //TableGrid.style.display = '';
                TableGrid.style.display = 'table';
            } else {
                //console.log("關");
                TableGrid.style.display = 'none';
            }
        }
        else {


            if (bool) {
                ModuleBlock_GridSetMgr.initGridTable_Table(TargetModuleBlock);
                ModuleBlockEditMgr.OpenModuleBlock_TableGrid(TargetModuleBlock, bool);
            } else {
                //設定為關 不用新增
            }

        }




    }


    //--------------------------------------------------------


    static IsModuleBlock_TableGrid_Open(TargetModuleBlock) {


        const table = ModuleDataFetcherMgr.GetTargetModuleBlock_TableGrid(TargetModuleBlock);
        if (table) {
            if (table.style.display === "none") {

                return false;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }

    }

    static IsModuleBlock_OnceTable_Open(TargetModuleBlock) {

        const table = ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(TargetModuleBlock);
        if (table.style.display === "none") {
            return false;
        }
        else {
            return true;
        }

    }




    ////////////////////////////////////////////////////////////

    static setAllCollapseIconAction() {

        document.querySelectorAll(`.Survey`).forEach(
            (Survey) => {

               ModuleBlockEditMgr.setAllCollapseIconAction_Survey(survey);
            }
        );
    }

    static setAllCollapseIconAction_Survey(survey) {

        survey.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(
            (TargetModuleBlock) => {

                const textBox = ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(TargetModuleBlock);
                if (!textBox) { return };

                let collapseIcon = textBox.querySelector(":scope > .collapse-icon");

                if (collapseIcon) {

                    collapseIcon.removeEventListener("click", ModuleBlockEditMgr.CollapseIconAction);

                    collapseIcon.addEventListener("click", ModuleBlockEditMgr.CollapseIconAction);
                }
            }
        );
    }


    

    static CollapseIconAction(event) {

        event.stopPropagation();

        var TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);

        ModuleBlockEditMgr.toggleCollapse(TargetModuleBlock);
    }

    static toggleCollapse(TargetModuleBlock) {
        // 讀取目前折疊狀態，預設為展開（"false"）
        const isCollapsed = (TargetModuleBlock.dataset.collapsed === "true");

        ModuleBlockEditMgr.setCollapse(TargetModuleBlock, !isCollapsed);

    }

    ////////////////////////////////////////////////////////////
    static setAllCollapseType(bool) {

        document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(
            (TargetModuleBlock) => {

                if (ModuleDataFetcherMgr.getAllChilds(TargetModuleBlock).length <= 0 && bool) {
                    return;
                }

                ModuleBlockEditMgr.setCollapse(TargetModuleBlock, bool);
            }
        );
    }
    static setCollapseType_Survey(survey,bool) {

        survey.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(
            (TargetModuleBlock) => {

                if (ModuleDataFetcherMgr.getAllChilds(TargetModuleBlock).length <= 0 && bool) {
                    return;
                }

                ModuleBlockEditMgr.setCollapse(TargetModuleBlock, bool);
            }
        );
    }




    static setCollapseType_survey(survey,bool) {

        survey.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(
            (TargetModuleBlock) => {

                if (ModuleDataFetcherMgr.getAllChilds(TargetModuleBlock).length <= 0 && bool) {
                    return;
                }

                ModuleBlockEditMgr.setCollapse(TargetModuleBlock, bool);
            }
        );
    }


    static setCollapse(TargetModuleBlock, setCollapsed) {

        if (!TargetModuleBlock) {
            return;
        }

        // 以 TargetModuleBlock.dataset.GridMode 判斷是否為 grid 模式（注意：確保此屬性已正確設定為 "true" 或 "false"）
        const isGrid = (TargetModuleBlock.dataset.GridMode === "true");


        //console.log("toggleCollapse " + setCollapsed);


        ModuleBlockEditMgr.updateLabelCollapseIcon(TargetModuleBlock, setCollapsed);
        //設定為摺疊
        if (setCollapsed) {

            //(將相關表格的 display 設為 "none")
            if (isGrid) {
                ModuleBlockEditMgr.OpenModuleBlock_TableGrid(TargetModuleBlock, false);
            } else {
                ModuleBlockEditMgr.OpenModuleBlock_OnceTable(TargetModuleBlock, false);
            }


        } else {

            ModuleBlockEditMgr.OpenModuleBlock_TableGrid(TargetModuleBlock, false);
            ModuleBlockEditMgr.OpenModuleBlock_OnceTable(TargetModuleBlock, false);

            //設定為展開
            if (isGrid) {
                ModuleBlockEditMgr.OpenModuleBlock_TableGrid(TargetModuleBlock, true);


            } else {

                //如果列表裡面有東西
                if (
                    ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(TargetModuleBlock).querySelector("." + ModuleBlockElementMgr.ModuleBlockName)
                ) {

                    ModuleBlockEditMgr.OpenModuleBlock_OnceTable(TargetModuleBlock, true);
                }
                else {

                    const textBox = ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(TargetModuleBlock);
                    if (!textBox) { return };
                    let collapseIcon = textBox.querySelector(":scope > .collapse-icon");
                    if (collapseIcon) {
                        //collapseIcon.style.backgroundColor = "cyan";
                        collapseIcon.remove();
                    }

                }

            }
        }

    }

    static updateLabelCollapseIcon(TargetModuleBlock, collapsed) {
        // 取得該模塊內 textBox 的 label 元素
        TargetModuleBlock.dataset.collapsed = collapsed;
        var textBox = ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(TargetModuleBlock);

    
        if (textBox) {
            var chevron = textBox.querySelector(".bi-chevron-up,.bi-chevron-down");
            
            if (chevron) {
                //console.warn("chevron----------------------------");
                chevron.classList.remove("bi-chevron-up", "bi-chevron-down");
               
                 if (collapsed ) {
                     chevron.classList.add("bi-chevron-down");
                 }
                 else {
                 
                     chevron.classList.add("bi-chevron-up");
                 }
                
            }
        }
       

       // const textBox = ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(TargetModuleBlock);
        if (!textBox) return;

        let collapseIcon = textBox.querySelector(":scope > .collapse-icon");
        // 若折疊狀態：若沒有圖示則新增
        if (!collapseIcon) {
            collapseIcon = document.createElement("span");
            collapseIcon.classList.add("collapse-icon");
            collapseIcon.style.cursor = "pointer";
            // 設定絕對定位，置於右側並置中垂直
            collapseIcon.style.fontSize = "8px";
            
            if (collapsed) {
                collapseIcon.innerHTML = `<i class="bi bi-chevron-down"></i>`;
            }
            else {
                collapseIcon.innerHTML = `<i class="bi bi-chevron-up"></i>`;
                //chevron.classList.add("bi-chevron-up");
            }


            textBox.appendChild(collapseIcon);
            // 點擊圖示也能切換（模擬下方按鈕點擊）
            collapseIcon.addEventListener("click", ModuleBlockEditMgr.CollapseIconAction);
            textBox.appendChild(collapseIcon);
        } 

        if (collapsed) {

            if (
                !ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(TargetModuleBlock).querySelector("." + ModuleBlockElementMgr.ModuleBlockName)
                &&
                TargetModuleBlock.dataset.GridMode != "true")  //表格沒開
            {
                return;
            }

            collapseIcon.innerHTML = `<i class="bi bi-chevron-down"></i>`;

        } else {

            var _labelElement = textBox.querySelector("label");

            if (_labelElement) {
                if (_labelElement.style.fontSize == "0px") {
                    collapseIcon.innerHTML = ``;
                    //collapseIcon.innerHTML = `<i class="bi bi-backpack2"></i>`;
                }
                else {

                    collapseIcon.innerHTML = `<i class="bi bi-chevron-up"></i>`;
                }
            }
          
        }
    }
}










//================== 模塊 [ 表格編輯器 ] 管理 ==================
class ModuleBlock_GridSetMgr {

    static InGridCanRemoveModuleBlockName = "InGridCanRemoveModuleBlockName"

    static init() {
        var editModalEl = document.getElementById('editTextModal');
        var editModal = bootstrap.Modal.getInstance(editModalEl);


        document.addEventListener("input", function (e) {
            if (e.target.tagName === "TEXTAREA") {
                let lineHeight = 10; // 單行高度
                let paddingOffset = 5; // 額外增加的高度
                e.target.style.height = "auto"; // 先重設高度，避免縮小
                let scrollHeight = e.target.scrollHeight;
                //console.log("原始 scrollHeight:", scrollHeight);

                // 讓 newHeight 取最接近的 lineHeight 倍數
                let newHeight = Math.round(scrollHeight / lineHeight) * lineHeight;

                // 確保 newHeight 至少為一行高度，並加上 paddingOffset
                newHeight = Math.max(lineHeight, newHeight) + paddingOffset;

                //console.log("調整後 newHeight:", newHeight);
                e.target.style.height = newHeight + "px";
            }
        });

        let lineHeight = 10; // 單行高度
        let paddingOffset = 5; // 額外增加的高度

        document.querySelectorAll("textarea").forEach((textarea) => {
            const height = textarea.clientHeight - paddingOffset;
            const adjustedHeight = Math.max(lineHeight, Math.round(height / lineHeight) * lineHeight) + paddingOffset;
            textarea.style.height = `${adjustedHeight}px`;
        });




        // 監聽 Modal 關閉事件
        editModalEl.addEventListener('hidden.bs.modal', function () {
            ModuleBlock_GridSetMgr.ReMoveCanRemoveClass();
        });
    };

    static LabelTextEdit(labelElement) {
        // 將當前 label 元素存到全域變數
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

        } else {
            console.error("labelElement 為空或未定義");
        }
    }

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
                //console.log("設定內容:", HtmlText.trim());
                tempDiv.innerHTML = HtmlText.trim();
                LabelTextEditMgr_labelElement.style.fontSize = "";
            } else {
                // 若無效，顯示提示文字
                //_labelElement.innerText = "請編輯文字";
                tempDiv.innerHTML = "";
                LabelTextEditMgr_labelElement.style.fontSize = "3px";
            }

            // 將處理後的 tempDiv 再次加入 label 中
            LabelTextEditMgr_labelElement.appendChild(tempDiv);

        } catch (error) {
            console.error("設定 divElement.innerHTML 時發生錯誤:", error);
        }
    }

    //------------------------------------------------------------------------
    static creatGridTable_Table() {
        var TableGrid = document.createElement("table");
        TableGrid.classList.add(ModuleBlockElementMgr.TableGridName);
        // 添加兩行空的 <td> 元素
        for (var i = 0; i < 2; i++) {
            var tr = document.createElement("tr");
            for (var j = 0; j < 2; j++) {
                var _Field = this.createTableField_Div();

                ModuleBlockCreatMgr.ReSet_Table_Field_EventAction(_Field);
                var td = document.createElement("td");



                td.appendChild(_Field);
                _Field.appendChild(ModuleBlock_GridSetMgr.createTextAreaModuleBlock());
                tr.appendChild(td);
            }
            TableGrid.appendChild(tr);
        }
        return TableGrid;
    }        //創建 GridTable 外殼
    //------------------------------------------------------------------------
    static ReMoveCanRemoveClass() {
        console.log(" ReMoveCanRemoveClass ");

        document.querySelectorAll('.' + ModuleBlock_GridSetMgr.InGridCanRemoveModuleBlockName).forEach(element => {
            element.classList.remove(ModuleBlock_GridSetMgr.InGridCanRemoveModuleBlockName);
        });
    }

    //------------------------------------------------------------------------

    static SetTextArea(targetModuleBlock) {
        var TextBoxBlock_Label = ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(targetModuleBlock).querySelector("label");

        // 假設這是一些針對標籤的編輯處理
        ModuleBlock_GridSetMgr.LabelTextEdit(TextBoxBlock_Label);

        // 動態插入 textarea 並設定其屬性
        ModuleBlock_GridSetMgr.setDivElementInnerHTML(`
         <textarea id="${targetModuleBlock.id}_textarea" rows="1";
             style="width: 100%; resize: none; overflow-y: hidden;"
             oninput="ModuleBlock_GridSetMgr.adjustHeight(this)">
         </textarea>
         `);


        var textarea = document.querySelector(`#${targetModuleBlock.id}_textarea`);



        let lineHeight = 10; // 單行高度
        let paddingOffset = 5; // 額外增加的高度
        textarea.style.height = "auto"; // 先重設高度，避免縮小
        let scrollHeight = textarea.scrollHeight;
        //console.log("原始 scrollHeight:", scrollHeight);

        // 讓 newHeight 取最接近的 lineHeight 倍數
        let newHeight = Math.round(scrollHeight / lineHeight) * lineHeight;

        // 確保 newHeight 至少為一行高度，並加上 paddingOffset
        newHeight = Math.max(lineHeight, newHeight) + paddingOffset;

        //console.log("調整後 newHeight:", newHeight);
        textarea.style.height = newHeight + "px";


    }

    static adjustHeight(textarea) {
        textarea.style.height = 'auto';  // 重設高度
        textarea.style.height = (textarea.scrollHeight) + 'px';  // 根據內容調整高度
    }
    static createTableField_Div() { return ModuleBlockCreatMgr.createTableField_Div(); }
    static initGridTable_Table(targetModuleBlock) {

        ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(targetModuleBlock).
            parentNode.insertBefore(ModuleBlock_GridSetMgr.creatGridTable_Table(),
                ModuleDataFetcherMgr.GetTargetModuleBlock_OnceTable(targetModuleBlock).nextSibling);
    }
    static createTextAreaModuleBlock() {

        const NewModuleBlock = ModuleBlockCreatMgr.addModuleBlock();
        NewModuleBlock.classList.add(ModuleBlock_GridSetMgr.InGridCanRemoveModuleBlockName);
        ModuleBlock_GridSetMgr.SetTextArea(NewModuleBlock);



        return NewModuleBlock;
    }


    //SetModuleBlockSGrid

    static TableGridName = ModuleBlockElementMgr.TableGridName;
    static OnceTableName = ModuleBlockElementMgr.OnceTableName;
    static createTableField_Div() { return ModuleBlockCreatMgr.createTableField_Div(); }




    static SetModuleBlockSGrid(targetId, AddOrRemove, RowOrColumn, HeadOrFeet) {
        // 获取目标模块块
        const moduleBlock = document.getElementById(targetId);

        let HeadOrFeetStr = HeadOrFeet === "Head" ? "由頭" : "由尾";
        let AddOrRemoveStr = AddOrRemove !== "Remove" ? "新增" : "刪除";
        let RowOrColumnStr = RowOrColumn === "Row" ? "行" : "列";

        let resultMessage = `${HeadOrFeetStr} ${AddOrRemoveStr} ${RowOrColumnStr} 成功`;  // 用來儲存結果訊息
        let success = true;      // 成功與否的標誌，默認為成功

        if (!moduleBlock) {
            resultMessage = "無法找到目標模塊" + targetId;
            success = false;
            return { success, resultMessage };
        }

        if (!ModuleDataFetcherMgr.GetTargetModuleBlock_TableGrid(moduleBlock)) {
            ModuleBlock_GridSetMgr.initGridTable_Table(moduleBlock);
        }


        // 获取该模块块中的表格元素
        const table = ModuleDataFetcherMgr.GetTargetModuleBlock_TableGrid(moduleBlock);
        console.log("SetModuleBlockSGrid  " + targetId);



        if (!table) {
            resultMessage = "目標模塊中沒有表格";
            success = false;
            return { success, resultMessage };
        }

        if (!ModuleBlockEditMgr.IsModuleBlock_TableGrid_Open(moduleBlock)) {

            resultMessage = "目標模塊尚未啟用表格 無法設定";
            success = false;
            return { success, resultMessage };
        }

        const rowCount = table.rows.length;
        const colCount = table.rows.length > 0 ? table.rows[0].cells.length : 0;

        // 检查表格是否小于 2x2，防止删除后表格变得过小
        if (AddOrRemove === "Remove") {
            // 检查删除列操作时，表格是否只剩下1列
            if (RowOrColumn === "Column" && colCount <= 1) {
                resultMessage = "無法删除，表格必须至少保留1列";
                success = false;
                return { success, resultMessage };
            }

            // 检查删除行操作时，表格是否只剩下1行
            if (RowOrColumn === "Row" && rowCount <= 1) {
                resultMessage = "無法删除，表格必须至少保留1行";
                success = false;
                return { success, resultMessage };
            }

            // 如果删除后表格小于 2x2（即行数和列数都小于2），不允许删除
            if ((rowCount <= 1 && colCount <= 2 && RowOrColumn === "Column") ||
                (colCount <= 1 && rowCount <= 2 && RowOrColumn === "Row")) {
                resultMessage = "無法删除，表格必须至少保留1行或一列";
                success = false;
                return { success, resultMessage };
            }
        }

        // 添加或移除行
        if (RowOrColumn === "Row") {
            if (AddOrRemove === "Add") {
                const newRow = table.insertRow(HeadOrFeet === "Head" ? 0 : table.rows.length); // 插入行（头部或尾部）

                // 动态生成单元格，确保与现有列数一致
                for (let i = 0; i < colCount; i++) {
                    const newCell = newRow.insertCell();
                    var _Field = ModuleBlock_GridSetMgr.createTableField_Div();
                    ModuleBlockCreatMgr.ReSet_Table_Field_EventAction(_Field);

                    _Field.appendChild(ModuleBlock_GridSetMgr.createTextAreaModuleBlock());


                    newCell.appendChild(_Field);
                }
            } else if (AddOrRemove === "Remove" && table.rows.length > 0) {
                const targetRowIndex = HeadOrFeet === "Head" ? 0 : table.rows.length - 1;
                let canRemoveRow = true;

                // 检查该行中的所有格子是否有包含指定 class 的格子
                for (let i = 0; i < table.rows[targetRowIndex].cells.length; i++) {
                    const targetCells = table.rows[targetRowIndex].cells[i].querySelectorAll("." + ModuleBlockCreatMgr.ModuleBlockName);

                    if (targetCells.length > 0) {
                        let canDelete = true;  // 用來標記是否所有格子都可以刪除

                        // 檢查每個 targetCell 是否包含 'canRemove' 類別
                        for (let targetCell of targetCells) {
                            if (!targetCell.classList.contains(ModuleBlock_GridSetMgr.InGridCanRemoveModuleBlockName)) {
                                canDelete = false;
                                break; // 跳出迴圈
                            }
                        }

                        // 如果沒有任何 targetCell 包含 'canRemove' 類別，則不能刪除
                        if (!canDelete) {
                            resultMessage = "無法删除，該行包含有其他模塊";
                            canRemoveRow = false;
                            break;  // 如果發現有格子沒有 'canRemove' 類別，就停止檢查並跳出循環
                        }
                    }
                }


                // 如果该行中的格子都没有包含指定的 class，就执行删除操作
                if (canRemoveRow) {
                    table.deleteRow(targetRowIndex); // 删除行（头部或尾部）
                } else {
                    resultMessage = "指定刪除欄位中含有其他模塊";
                    success = false;
                }
            }
        }

        // 添加或移除列
        if (RowOrColumn === "Column") {
            if (AddOrRemove === "Add") {
                for (let i = 0; i < table.rows.length; i++) {
                    const newCell = table.rows[i].insertCell(HeadOrFeet === "Head" ? 0 : table.rows[i].cells.length); // 插入列（头部或尾部）
                    var _Field = ModuleBlock_GridSetMgr.createTableField_Div();
                    ModuleBlockCreatMgr.ReSet_Table_Field_EventAction(_Field);

                    _Field.appendChild(ModuleBlock_GridSetMgr.createTextAreaModuleBlock());

                    newCell.appendChild(_Field);
                }
            } else if (AddOrRemove === "Remove" && table.rows.length > 0 && table.rows[0].cells.length > 0) {
                let canRemoveColumn = true;
                const columnIndex = HeadOrFeet === "Head" ? 0 : table.rows[0].cells.length - 1;  // 要删除的列的索引

                //for (let i = 0; i < table.rows.length; i++) {
                //    const targetCell = table.rows[i].cells[columnIndex];  // 取每一行中對應列的單元格
                //    if (targetCell && targetCell.querySelector("." + ModuleBlockCreatMgr.ModuleBlockName)) {
                //        rresultMessage = "無法删除，該列包含有其他模塊";
                //        canRemoveColumn = false;
                //        break;  // 發現有格子含有指定的 class 時，停止檢查並跳出循環
                //    }
                //}
                for (let i = 0; i < table.rows.length; i++) {
                    const targetCells = table.rows[i].cells[columnIndex]?.querySelectorAll("." + ModuleBlockCreatMgr.ModuleBlockName);

                    if (targetCells && targetCells.length > 0) {
                        let canDelete = true;  // 用來標記是否所有格子都可以刪除

                        // 檢查每個 targetCell 是否包含 'canRemove' 類別
                        for (let targetCell of targetCells) {
                            if (!targetCell.classList.contains(ModuleBlock_GridSetMgr.InGridCanRemoveModuleBlockName)) {
                                canDelete = false;
                                break; // 跳出迴圈
                            }
                        }

                        // 如果沒有任何 targetCell 包含 'canRemove' 類別，則不能刪除
                        if (!canDelete) {
                            resultMessage = "無法删除，該列包含有其他模塊";
                            canRemoveColumn = false;
                            break;  // 如果發現有格子沒有 'canRemove' 類別，就停止檢查並跳出循環
                        }
                    }
                }


                // 检查该行中的所有格子是否有包含指定 class 的格子


                // 如果該列中的格子都沒有包含指定的 class，就執行刪除操作
                if (canRemoveColumn) {
                    for (let i = 0; i < table.rows.length; i++) {
                        table.rows[i].deleteCell(columnIndex); // 删除列（头部或尾部）
                    }
                } else {
                    resultMessage = "指定刪除欄位中含有其他模塊";
                    success = false;
                }


            }
        }

        // 返回結果
        return { success, resultMessage };
    }

}























