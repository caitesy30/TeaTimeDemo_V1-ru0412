/**************************************************/
/* ModuleBlockSettingBarMgr.js          BBT      
/* 負責在指定的 ModuleBlock 裡插入工具列 (下方列) */
/**************************************************/
class ModuleBlockSettingBarMgr {

    /**
     * [初始化]：在頁面點擊空白處時，自動移除所有工具列
     */
    static init() {
        // 使用純 JavaScript 來綁定點擊事件，避免依賴 jQuery
        document.addEventListener('click', function (e) {
            // 如果點擊的是 <select> 元素或其子元素，則不移除工具列
            if (e.target.tagName.toLowerCase() === 'select' || e.target.closest('select') !== null) {
                return;
            }

            // 延遲執行，以確保 <select> 的行為先執行
            setTimeout(() => {
                let isInsideModule = e.target.closest('.ModuleBlock') !== null;
                let isInsideUpToolBar = e.target.closest('.UpSettingBar') !== null;
                let isInsideDownToolBar = e.target.closest('.DownSettingBar') !== null;
                let isinsideArea = e.target.closest('.settingAreaContainer') !== null;
                let isInsideGear = e.target.closest('#gearButton') !== null; // ★ 新增

                // 若都不在 .ModuleBlock 或 .UpSettingBar/.DownSettingBar，就移除所有工具列
                if (!isInsideModule && !isInsideUpToolBar && !isInsideDownToolBar && !isinsideArea) {
                    //document.querySelectorAll('.UpSettingBar').forEach(bar => bar.remove());
                    //document.querySelectorAll('.DownSettingBar').forEach(bar => bar.remove());
                    document.querySelectorAll('.settingAreaContainer').forEach(bar => bar.remove());
                }
            }, 0); // 使用 0 毫秒延遲
        });
    }

    //================[核心：插入齒輪按鈕 + showFloatingPanel]================

    /**
     * [插入齒輪按鈕]：在 toolBar 末端加入 <button><i class="bi bi-gear"></i></button>
     */
    static insertGearMenuButton(toolBar) {
        const gearButton = document.createElement("button");
        gearButton.classList.add("gear-menu-button");
        gearButton.innerHTML = `<i class="bi bi-gear"></i>`;
        toolBar.appendChild(gearButton);

        // 綁定點擊 -> 顯示浮動面板
        gearButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.showFloatingPanel(toolBar, gearButton);
        });
    }

    /**
     * [顯示浮動面板]：建立一個浮動面板，內容含「複製、刪除、必填、更多設定」等功能
     * @param {HTMLElement} toolBar
     * @param {HTMLElement} gearButton
     */
    static showFloatingPanel(toolBar, gearButton) {
        let TargetModuleBlock = ModuleBlock_Main.GetSelectTarget();

        let floatPanel = document.getElementById("customFloatPanel");
        if (!floatPanel) {
            floatPanel = document.createElement("div");
            floatPanel.id = "customFloatPanel";
            floatPanel.classList.add("custom-float-panel");
            document.body.appendChild(floatPanel);

            // 點擊空白關閉
            document.addEventListener("click", (evt) => {
                if (!floatPanel.contains(evt.target) && evt.target !== gearButton) {
                    floatPanel.style.display = "none";
                }
            });
        }
        floatPanel.innerHTML = ""; // 清空

        // 2.1) 「單選／複選」下拉選單
        const singleMultiSelect = document.createElement("select");
        singleMultiSelect.classList.add("form-select", "me-2");
        // 建立兩個 option: 單選 / 複選
        const optRadio = document.createElement("option");
        optRadio.value = "radio";
        optRadio.textContent = "單選";

        const optCheckbox = document.createElement("option");
        optCheckbox.value = "checkbox";
        optCheckbox.textContent = "複選";

        singleMultiSelect.appendChild(optRadio);
        singleMultiSelect.appendChild(optCheckbox);

        // 依當前模組的 checkboxType 設定預設
        const theBlock = toolBar.closest(".ModuleBlock");
        if (theBlock) {
            const ctype = theBlock.dataset.checkboxType; // "radio" or "checkbox"
            singleMultiSelect.value = ctype || "radio"; // 預防無值時預設radio
        }
        // 監聽下拉選單切換
        singleMultiSelect.addEventListener("change", (evt) => {
            evt.stopPropagation();
            const newType = evt.target.value; // "radio" or "checkbox"
            const block = toolBar.closest(".ModuleBlock");
            if (!block) return;
            // 呼叫您已有的切換函式
            if (newType === "radio") {
                ModuleOptionEditor.SetAllOptionBecome_Radio(block);
            } else {
                ModuleOptionEditor.SetAllOptionBecome_CheckBox(block);
            }
            // 也可更新 block.dataset.checkboxType = newType;
            block.dataset.checkboxType = newType;

            // ★★★【同步上方/下方原本的下拉】★★★
            // 1) 找到 UpSettingBar 上的 select
            const upSelect = block.querySelector(".UpSettingBar select.custom-select");
            if (upSelect) {
                upSelect.value = newType;
            }

            //2) 若 DownSettingBar 也有下拉
            const downSelect = block.querySelector(".DownSettingBar select.custom-select");
            if (downSelect) {
                downSelect.value = newType;
            }

            // 結束後關閉面板或保留都行
            floatPanel.style.display = "none";
        });

        // 加入面板
        floatPanel.appendChild(singleMultiSelect);

        // 3) 新增選項 按鈕
        const addOptionBtn = document.createElement("button");
        addOptionBtn.classList.add("btn", "btn-light", "me-2");
        addOptionBtn.innerHTML = `<i class="bi bi-plus-square"></i>`;
        addOptionBtn.title = "新增選項";
        addOptionBtn.addEventListener("click", (evt) => {
            evt.stopPropagation();
            const block = toolBar.closest(".ModuleBlock");
            if (block) {
                ModuleOptionEditor.createOption(block);
                Tab_EditTableMgr.UpdateTargetInner();
                 AutoScreen_js.resetAutoScreenBlockSize();
            }
            floatPanel.style.display = "none";
        });
        floatPanel.appendChild(addOptionBtn);

        // 新增模塊按鈕
        const addModuleBtn = document.createElement("button");
        addModuleBtn.classList.add("btn", "btn-light", "bi-layers");
        // 使用 bi-layers 或 bi-layers-fill 都可以
        //addModuleBtn.innerHTML = `<i class="bi bi-layers"></i>`;
        addModuleBtn.title = "新增模塊";
        addModuleBtn.onclick = (e) => {
            e.stopPropagation();
            // 在此撰寫您要「新增模塊」的邏輯
            // 例如：
            // ModuleBlockCreatMgr.createNewModuleBlock(...);
            //alert("已執行『新增模塊』操作！");
            ModuleOptionEditor.AddModuleBlockIn(ModuleBlock_Main.GetSelectTarget());
        }

        //let TargetModuleBlock = ModuleBlock_SelectTargetMgr.SetModuleBlockSelectTarget(targetModuleBlock)
        floatPanel.appendChild(addModuleBtn);

        // 檢查核選按鈕 (block.setValiState...等, 若無請自行修改/移除)
        if (!TargetModuleBlock.dataset.OptionMode) { floatPanel.appendChild(this.createOptionBtn(TargetModuleBlock)) }
        const checkCheckBtn = document.createElement("button");
        checkCheckBtn.classList.add("btn", "btn-light", "bi-clipboard-check", "checkCheckBtn");
        //checkCheckBtn.innerHTML = `<i class="bi bi-check2-square"></i>`;  // 圖示：方框打勾
        checkCheckBtn.title = "檢查核選";
        //bi-clipboard-check
        // 綁定點擊事件
        checkCheckBtn.onclick = (e) => {
            e.stopPropagation();
            const target = ModuleBlock_Main.GetSelectTarget();
            if (target.dataset.needvali === 'true') {
                block.setValiState(false);
            } else {
                block.setValiState(true);
            }
            block.setValiArea();
            //alert("執行檢查核選的程式碼！");
        };
        floatPanel.appendChild(checkCheckBtn);




        // === 加入「複製」按鈕 ===
        const copyBtn = document.createElement("button");
        copyBtn.classList.add("btn", "btn-light", "me-2");
        copyBtn.innerHTML = `<i class="bi bi-files"></i>`;
        copyBtn.title = "複製";
        copyBtn.onclick = (e) => {
            e.stopPropagation();
            const block = toolBar.closest(".ModuleBlock");
            if (block) this.copyModuleBlock(block);
            floatPanel.style.display = "none";
        };
        floatPanel.appendChild(copyBtn);

        // === 加入「刪除」按鈕 ===
        const delBtn = document.createElement("button");
        delBtn.classList.add("btn", "btn-light", "me-2");
        delBtn.innerHTML = `<i class="bi bi-trash"></i>`;
        delBtn.title = "刪除";
        delBtn.onclick = (e) => {
            e.stopPropagation();
            const block = toolBar.closest(".ModuleBlock");
            if (block) this.deleteModuleBlock(block);
            floatPanel.style.display = "none";
        };
        floatPanel.appendChild(delBtn);

        // === 加入「必填」切換 ===
        const switchWrap = document.createElement("div");
        switchWrap.classList.add("form-check", "form-switch", "d-inline-flex", "align-items-center", "me-2");
        switchWrap.style.marginBottom = "0";
        switchWrap.innerHTML = `
          <input class="form-check-input" type="checkbox" role="switch" id="requiredSwitch_Float">
          <label class="form-check-label ms-1" for="requiredSwitch_Float">必填</label>`;
        switchWrap.querySelector("input").addEventListener("change", (evt) => {
            evt.stopPropagation();
            const block = toolBar.closest(".ModuleBlock");
            if (!block) return;
            const checkbox = block.querySelector("._checkbox");
            if (checkbox) {
                checkbox.required = evt.target.checked;
                alert("本模塊必填狀態：" + checkbox.required);
            }
            floatPanel.style.display = "none";
        });
        //floatPanel.appendChild(switchWrap);
        //新增模塊 2.檢查核選

        // === 加入「更多設定」按鈕 ===
        const moreBtn = document.createElement("button");
        moreBtn.classList.add("btn", "btn-light");
        moreBtn.innerHTML = `<i class="bi bi-three-dots"></i>`;
        moreBtn.onclick = (e) => {
            e.stopPropagation();
            const blockId = toolBar.dataset.moduleblockid;
            this.openMoreSettings(blockId);
            floatPanel.style.display = "none";
        };
        floatPanel.appendChild(moreBtn);

        // 定位到齒輪按鈕旁
        floatPanel.style.display = "block";
        floatPanel.style.position = "absolute";
        const rect = gearButton.getBoundingClientRect();
        floatPanel.style.top = (window.scrollY + rect.bottom + 5) + "px";
        floatPanel.style.left = (window.scrollX + rect.right + 5) + "px";
    }



    //========================================================
    // [新增] 用於檢查「本工具列」是否已停止過 Click 冒泡的布林值
    //========================================================
    static CheckEventisEnd_SettingBar_Click(event) {
        // 取得旗標 (若之前已被設定過，這裡就會是 true)
        let isEnd = event.SettingBar_Click_Isend;
        // 若尚未處理，則本次設定為已處理
        event.SettingBar_Click_Isend = true;

        // 回傳給呼叫端知道是否已被處理
        return isEnd;
    }



    ///創建工具列
    static addSettingBar(TargetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) return;
        const ModuleBlock_inner = TargetModuleBlock.querySelector("." + ModuleBlockElementMgr.ModuleBlock_innerName);
        const TextBox = TargetModuleBlock.querySelector("." + ModuleBlockElementMgr.TextBoxName);
        const area = document.createElement('div');
        area.classList.add('settingAreaContainer');
        if ( !TargetModuleBlock.dataset.OptionMode) { area.appendChild(this.createOptionBtn(TargetModuleBlock)) }

        area.appendChild(this.creatUpSettingBar(TargetModuleBlock));
        area.appendChild(this.creatDownSettingBar(TargetModuleBlock));
        this.insertGearMenuButton(area);
        ModuleBlock_inner.insertBefore(area, TextBox.nextSibling);
        console.log(area.offsetWidth);
         AutoScreen_js.resetAutoScreenBlockSize();

    }

    ///創建選項開關
    static createOptionBtn(TargetModuleBlock) {
        const btn = document.createElement('button');
        btn.classList.add('optionSwitch', "btn", "btn-light", "bi-check2-square");
        btn.setAttribute('title', '是否填寫')
        btn.dataset.enable = false;

        const checkbox = ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(TargetModuleBlock);

        if (checkbox.style.display != 'none') {
            btn.dataset.enable = true;
        }


        btn.addEventListener('click', (event) => {
            if (btn.dataset.enable === 'false') {
                ModuleOptionEditor.SetAnswer(TargetModuleBlock, true);
                //console.log("新增按鈕 true");
            } else {
                ModuleOptionEditor.SetAnswer(TargetModuleBlock, false);
                btn.dataset.enable = "false";
            }
        });
        return btn;
    }

    /**
 * [插入工具列]：在目標模塊的底部插入工具列 (可改成插入到其他位置)
 * @param {HTMLElement} TargetModuleBlock - 指定的 ModuleBlock
 */
    static addSettingUpBar(TargetModuleBlock) {
        // 檢查是否為真正的 ModuleBlock
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) return;


        // 建立新的工具列
        const UpSettingBar = this.creatUpSettingBar(TargetModuleBlock);

        // 找到「.ModuleBlock_inner」
        const ModuleBlock_inner = TargetModuleBlock.querySelector("." + ModuleBlockElementMgr.ModuleBlock_innerName);
        const TextBoxDiv = TargetModuleBlock.querySelector("." + ModuleBlockElementMgr.TextBoxName);

        
        if (!ModuleBlock_inner) {
            return;
        }

        if (!ModuleBlock_inner) return;

        // 將工具列插到文字框前面      
        ModuleBlock_inner.insertBefore(UpSettingBar, TextBoxDiv.nextSibling); //塞在文字框前面


      

        // 重新計算畫面
         AutoScreen_js.resetAutoScreenBlockSize();
    }


    /**
     * [插入工具列]：在目標模塊的底部插入工具列 (可改成插入到其他位置)
     * @param {HTMLElement} TargetModuleBlock - 指定的 ModuleBlock
     */
    static addSettingDownBar(TargetModuleBlock) {
        // 檢查是否為真正的 ModuleBlock
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) { console.warn("addSettingDownBar warn"); return; }

        // 建立新的工具列
        const DownSettingBar = this.creatDownSettingBar(TargetModuleBlock);

        // 找到「.ModuleBlock_inner」
        const ModuleBlock_inner = TargetModuleBlock.querySelector("." + ModuleBlockElementMgr.ModuleBlock_innerName);
        if (!ModuleBlock_inner) { console.warn("addSettingDownBar warn"); return; }

        // 將工具列插到底部
        ModuleBlock_inner.appendChild(DownSettingBar);

        // 重新計算畫面
         AutoScreen_js.resetAutoScreenBlockSize();
    }


    //========================UpSettingBar工具的內容=================================
    /**
   * [建立工具列核心]：示範左側複製/刪除，右側必填 Switch / 更多設定
   * @param {HTMLElement} TargetModuleBlock - 目標模塊
   * @returns {HTMLDivElement} 工具列容器
   */
    static creatUpSettingBar(TargetModuleBlock) {
        // 建立最外層容器
        const newUpSettingBar = document.createElement("div");
        newUpSettingBar.classList.add("UpSettingBar");
        //newUpSettingBar.classList.add("UpSettingBar", "d-flex", "justify-content-between", "w-100");
        newUpSettingBar.dataset.ModuleBlockId = TargetModuleBlock.id;

       
        // 獲取當前目標的 checkboxType
        let currentType = "radio"; //默認值 radio
        const selectTarget = TargetModuleBlock;// ModuleBlock_Main.GetSelectTarget();
        if (selectTarget.dataset.checkboxType === "radio") {
            // 如果目標是單選
            currentType = "radio";
        } else if (selectTarget.dataset.checkboxType === "checkbox") {
            // 如果目標是複選
            currentType = "checkbox";
        } else {
            // 錯誤處理
            console.error("未知的 checkboxType:", selectTarget.dataset.checkboxType);
        }
        //========== 下拉選單 ==========
        const addOptionBtn = document.createElement("button");

        const dropdownOptions = [
            {
                text: "單選",
                value: "radio",
                onClick: () => {

                    addOptionBtn.classList.remove("bi-ui-checks","bi-ui-radios");
                    addOptionBtn.classList.add("bi-ui-radios");

                    ModuleOptionEditor.SetAllOptionBecome_Radio(TargetModuleBlock);
                    //this.updateUI(TargetModuleBlock);
                    //alert("單選已觸發！");
                }
            },
            {
                text: "複選",
                value: "checkbox",
                onClick: () => {
                    addOptionBtn.classList.remove("bi-ui-checks", "bi-ui-radios");
                    addOptionBtn.classList.add("bi-ui-checks");

                    ModuleOptionEditor.SetAllOptionBecome_CheckBox(TargetModuleBlock);
                    //this.updateUI(TargetModuleBlock);
                }
            }
        ];

        // 建立下拉選單，並設定預設選項
        const selectElement = this.createSelect(
            `select_${TargetModuleBlock.id}`, // 唯一的下拉選單 ID
            "選擇操作",         // 預設顯示的文字
            dropdownOptions,
            currentType         // 傳入當前選項
        );


        // 放進工具列
        //leftTools.appendChild(addOptionDropdown);
        if (TargetModuleBlock.dataset.QuestionMode =="true") {
            newUpSettingBar.appendChild(selectElement);
        }

        //========== 右邊：新增按鈕 ==========
        // 新增選項按鈕
      
        addOptionBtn.classList.add("btn", "btn-light", "bi-node-plus");
        //addOptionBtn.innerHTML = `<i class="bi bi-plus-square"></i>`; // icon: 加號方塊 (新增選項)
        addOptionBtn.title = "新增選項";
        addOptionBtn.onclick = (e) => {
            e.stopPropagation();// 僅阻止自身，不用布林值檢查

            ModuleOptionEditor.createOption(TargetModuleBlock);

            ModuleBlock_SelectTargetMgr.SetModuleBlockSelectTarget(TargetModuleBlock);
            ModuleBlock_SelectTargetMgr.SetModuleBlockShowAssociation(TargetModuleBlock);
            Tab_EditTableMgr.UpdateTargetInner();
            AutoScreen_js.resetAutoScreenBlockSize();

        };

        // ============= 加入「新增模塊」按鈕 =============
        const addModuleBtn = document.createElement("button");//bi bi-plus-circle
        addModuleBtn.classList.add("btn", "btn-light", "bi-plus-circle");
        // 使用 bi-layers 或 bi-layers-fill 都可以
        //addModuleBtn.innerHTML = `<i class="bi bi-layers"></i>`;
        addModuleBtn.title = "新增模塊";
        addModuleBtn.onclick = (e) => {
            e.stopPropagation();
            // 在此撰寫您要「新增模塊」的邏輯
            // 例如： ModuleBlockCreatMgr.createNewModuleBlock(...);
            //alert("已執行『新增模塊』操作！");
            ModuleOptionEditor.AddModuleBlockIn(ModuleBlock_Main.GetSelectTarget());
        };

        //============== 加入「檢查核選」按鈕 ==============
        const checkCheckBtn = document.createElement("button");
        checkCheckBtn.classList.add("btn", "btn-light", "bi-clipboard-check");
        //checkCheckBtn.innerHTML = `<i class="bi bi-check2-square"></i>`;  // 圖示：方框打勾
        checkCheckBtn.title = "檢查核選";
        //bi-clipboard-check
        // 綁定點擊事件
        checkCheckBtn.onclick = (e) => {
            e.stopPropagation();
            const target = TargetModuleBlock;
            if (target.dataset.needvali === 'true') {
                block.setValiState(false);
            } else {
                block.setValiState(true);
            }
            block.setValiArea();
            //alert("執行檢查核選的程式碼！");
        };


        const space = document.createElement("div");
   
        space.classList.add("bi", "bi-pause-fill");
        space.style.width = "25px";
        space.style.display = "flex";
        space.style.justifyContent = "center"; // 水平置中
        space.style.alignItems = "center"; // 垂直置中
        space.style.opacity = "0.2"; // 0 完全透明，1 完全不透明

        if (TargetModuleBlock.dataset.GridMode != "true") {

            
            //將此按鈕加到工具列末端-新增選項
            newUpSettingBar.appendChild(addOptionBtn);

            newUpSettingBar.appendChild(space);

            // 將此按鈕加到工具列末端-新增模塊
            newUpSettingBar.appendChild(addModuleBtn);
        }
        else {
            newUpSettingBar.appendChild(space);

        }






        // 最後，把這個按鈕也加到工具列-核選
        newUpSettingBar.appendChild(checkCheckBtn);


        return newUpSettingBar;
    }

    /**
 * [更新 UI] - 用於在新增選項後更新界面
 * @param {HTMLElement} TargetModuleBlock - 目標模塊
 */
    static updateUI(TargetModuleBlock) {
        // 根據需要實現 UI 更新邏輯
        // 例如，重新綁定事件、刷新視圖等
        AutoScreen_js.resetAutoScreenBlockSize();
    }

    /**
     * [創建下拉選單（<select>）]：
     * @param {string} selectId - 下拉選單的 ID
     * @param {string} defaultText - 下拉選單預設顯示的文字
     * @param {Array} options - 下拉選單的選項，每個選項包含 text、value 和 onClick 函數
     * @returns {HTMLElement} - 下拉選單的 <select> 元素
     */
    static createSelect(selectId, defaultText, options, selectedValue = null) {
       
        // 建立 <select> 元素
        const selectElement = document.createElement("select");
        selectElement.classList.add("form-select");
        //selectElement.setAttribute("aria-label", "Large select example");
        selectElement.id = `select_${selectId}`;

        // 建立預設選項
        const defaultOption = document.createElement("option");
        defaultOption.selected = true;
        defaultOption.disabled = true; // 防止選擇預設選項
        defaultOption.textContent = defaultText; // 移除 <i> 標籤
        selectElement.appendChild(defaultOption);

        // 建立其他選項
        options.forEach(option => {
            const optionElement = document.createElement("option");
            optionElement.value = option.value || option.text;
            optionElement.textContent = option.text;
            if (selectedValue && option.value === selectedValue) {
                optionElement.selected = true;
                defaultOption.selected = false; // 取消預設選項的選中狀態
            }
            selectElement.appendChild(optionElement);
        });

        // 添加 change 事件監聽器
        selectElement.addEventListener("change", (e) => {
            const selectedValue = e.target.value;
            const selectedOption = options.find(opt => opt.value === selectedValue || opt.text === selectedValue);
            if (selectedOption && typeof selectedOption.onClick === "function") {
                selectedOption.onClick();
            }

            // 更新目標元素的 data-checkboxType 屬性
            ModuleBlock_Main.GetSelectTarget().dataset.checkboxType = selectedValue;

            // 如果要馬上切換 => 
            if (selectedValue === "radio") {
                ModuleOptionEditor.SetAllOptionBecome_Radio(ModuleBlock_Main.GetSelectTarget());
            } else {
                ModuleOptionEditor.SetAllOptionBecome_CheckBox(ModuleBlock_Main.GetSelectTarget());
            }

            // ★★★【同步齒輪面板的下拉】★★★
            // 取得該模塊
            const theBlock = ModuleBlock_Main.GetSelectTarget(); // 或 e.target.closest(".ModuleBlock")
            if (!theBlock) return;

            // 找出浮動面板裡的下拉 (若已顯示)
            const floatPanel = document.getElementById("customFloatPanel");
            if (floatPanel && floatPanel.style.display === "block") {
                const gearSelect = floatPanel.querySelector("select.form-select");
                if (gearSelect) {
                    gearSelect.value = selectedValue;
                }
            }

            //也可再同步到下方工具列 select (若下方也有)
            const downSelect = theBlock.querySelector(".DownSettingBar select.custom-select");
            if (downSelect) {
                downSelect.value = selectedValue;
            }


            // 可選：重設選擇為預設選項
            //e.target.selectedIndex = 0;
        });

        // 防止點擊 <select> 觸發全局點擊事件
        selectElement.addEventListener("click", function (e) {

            // 檢查是否已被自己(或其他 SettingBar)阻止過
            if (!ModuleBlockSettingBarMgr.CheckEventisEnd_SettingBar_Click(e)) {
                // 若尚未阻止 -> 只在此處終止冒泡，不影響其他程式之 MouseEnter/Drag 等
                e.stopPropagation();
            }
        });

        return selectElement;
    }


    // 靜態方法：更新目標模塊的 label 最後的折疊圖示
    static updateLabelCollapseIcon(TargetModuleBlock, collapsed) {
        // 取得該模塊內 textBox 的 label 元素
        TargetModuleBlock.dataset.collapsed = collapsed;
        var settingAreaContainer = ModuleDataFetcherMgr.GetTargetModuleBlock_Inner(TargetModuleBlock)
            .querySelector(`:scope > .settingAreaContainer`);
        if (settingAreaContainer) {
            var chevron = settingAreaContainer.querySelector(".bi-chevron-up,.bi-chevron-down");

            if (chevron) {

                chevron.classList.remove("bi-chevron-up", "bi-chevron-down");

                if (collapsed) {
                    chevron.classList.add("bi-chevron-down");
                }
                else {

                    chevron.classList.add("bi-chevron-up");
                }
            }
        }





        const textBox = ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(TargetModuleBlock);
        if (!textBox) return;

        let collapseIcon = textBox.querySelector(":scope > .collapse-icon");
        // 若折疊狀態：若沒有圖示則新增
        if (!collapseIcon) {
            collapseIcon = document.createElement("span");
            collapseIcon.classList.add("collapse-icon");
            collapseIcon.style.cursor = "pointer";
            // 設定絕對定位，置於右側並置中垂直
            collapseIcon.style.fontSize = "8px";
            collapseIcon.innerHTML = `<i class="bi bi-chevron-down"></i>`;
            textBox.appendChild(collapseIcon);
            // 點擊圖示也能切換（模擬下方按鈕點擊）
            collapseIcon.addEventListener("click", ModuleBlockSettingBarMgr.CollapseIconAction);
            textBox.appendChild(collapseIcon);
        } else {
            collapseIcon.innerHTML = `<i class="bi bi-chevron-down"></i>`;
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

            if (_labelElement.style.fontSize == "0px") {
                collapseIcon.innerHTML = ``;
                //collapseIcon.innerHTML = `<i class="bi bi-backpack2"></i>`;
            }
            else {

                collapseIcon.innerHTML = `<i class="bi bi-chevron-up"></i>`;
            }

            //collapseIcon.innerHTML = `<i class="bi bi-chevron-up"></i>`;
            //collapseIcon.innerHTML = ``;
        }
    }

    static setAllCollapseIconAction() {

        document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(
            (TargetModuleBlock) => {

                const textBox = ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(TargetModuleBlock);
                if (!textBox) { return };

                let collapseIcon = textBox.querySelector(":scope > .collapse-icon");

                if (collapseIcon) {

                    collapseIcon.removeEventListener("click", ModuleBlockSettingBarMgr.CollapseIconAction);

                    collapseIcon.addEventListener("click", ModuleBlockSettingBarMgr.CollapseIconAction);
                }
            }
        );
    }

    //設定所有折疊類型
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


    static CollapseIconAction(event) {

        event.stopPropagation();

        var TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(event.target);

        ModuleBlockSettingBarMgr.toggleCollapse(TargetModuleBlock);
    }

    static toggleCollapse(TargetModuleBlock) {
        // 讀取目前折疊狀態，預設為展開（"false"）
        const isCollapsed = (TargetModuleBlock.dataset.collapsed === "true");

        ModuleBlockEditMgr.setCollapse(TargetModuleBlock, !isCollapsed);

    }

    static setCollapse(TargetModuleBlock, setCollapsed) {


        // 以 TargetModuleBlock.dataset.GridMode 判斷是否為 grid 模式（注意：確保此屬性已正確設定為 "true" 或 "false"）
        const isGrid = (TargetModuleBlock.dataset.GridMode === "true");


        //console.log("toggleCollapse " + setCollapsed);

      
       ModuleBlockEditMgr.setCollapse(TargetModuleBlock, setCollapsed);
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



    //========================DownSettingBar工具的內容=================================
    /**
     * [建立工具列核心]：示範左側複製/刪除，右側必填 Switch / 更多設定
     * @param {HTMLElement} TargetModuleBlock - 目標模塊
     * @returns {HTMLDivElement} 工具列容器
     */
    static creatDownSettingBar(TargetModuleBlock) {
        // 建立最外層容器
        const newDownSettingBar = document.createElement("div");
        newDownSettingBar.classList.add("DownSettingBar");
        newDownSettingBar.dataset.ModuleBlockId = TargetModuleBlock.id;

        //========== 左邊：複製 與 刪除 按鈕 ==========

        // 複製按鈕
        const copyBtn = document.createElement("button");
        copyBtn.classList.add("btn", "btn-light", "bi-files");
        //copyBtn.innerHTML = `<i class="bi bi-files"></i>`;  // icon: 檔案疊疊
        copyBtn.title = "複製本模塊";
        copyBtn.onclick = (e) => {
            e.stopPropagation();// 僅阻止自己的冒泡
            this.copyModuleBlock(TargetModuleBlock);
        };

        // 刪除按鈕
        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("btn", "btn-light", "bi-trash");
        //deleteBtn.innerHTML = `<i class="bi bi-trash"></i>`; // icon: 垃圾桶
        deleteBtn.title = "刪除本模塊";
        deleteBtn.onclick = (e) => {
            e.stopPropagation();// 僅阻止自己的冒泡

           


            this.deleteModuleBlock(TargetModuleBlock);
    
        };

        // ===【新增】刪除模塊中所有 <textarea> 的按鈕 ===
        const removeAllTextareaBtn = document.createElement("button");
        removeAllTextareaBtn.classList.add("btn", "btn-light", "bi-x-square"); // 選個喜歡的 icon
        removeAllTextareaBtn.title = "刪除本模塊中的所有文字輸入欄";
        removeAllTextareaBtn.onclick = (e) => {
            e.stopPropagation(); // 只阻止自己的冒泡
            // 取得此模塊裡所有 <textarea>
            const allTextareas = TargetModuleBlock.querySelectorAll("textarea");
            allTextareas.forEach(txt => {
                txt.remove(); // 直接 remove
            });
            //alert("已刪除本模塊中所有的 <textarea> 文字輸入欄！");
        };

        // ===【新增】刪除模塊中所有的模塊 的按鈕 ===
        const removeAllModuleBtn = document.createElement("button");
        removeAllModuleBtn.classList.add("btn", "btn-light", "bi-x-circle"); // 使用 bi-x-circle 作為圖示
        removeAllModuleBtn.title = "刪除本模塊中的所有模塊";
        removeAllModuleBtn.onclick = (e) => {
            e.stopPropagation(); // 只阻止自己的冒泡
            // 取得此模塊內所有的 .ModuleBlock 元素（包含所有子層模塊）
            const allModules = TargetModuleBlock.querySelectorAll(".ModuleBlock");
            allModules.forEach(mod => {
                mod.remove(); // 直接刪除模塊
            });
            //alert("已刪除本模塊中所有的模塊！");
        };

        // 放進工具列
        newDownSettingBar.appendChild(copyBtn);
        newDownSettingBar.appendChild(deleteBtn);
        newDownSettingBar.appendChild(removeAllTextareaBtn);
        newDownSettingBar.appendChild(removeAllModuleBtn);

        //========== 右邊：必填 Switch + 更多設定 ==========

        // 建立右側容器
        const rightSide = document.createElement("div");
        rightSide.classList.add("switchArea");

        //【新增折疊按鈕】－用 dataset 來記錄狀態
        // 在 ModuleBlockSettingBarMgr 類別中（creatDownSettingBar 方法內右側按鈕區段）
        const collapseBtn = document.createElement("button");
        collapseBtn.classList.add("btn", "btn-light", "collapse-toggle");
        collapseBtn.title = "折疊/展開選項";


        // 初始預設為展開狀態，顯示向上箭頭
        // 設定初始狀態為展開（collapsed 為 false）
        if (TargetModuleBlock.dataset.collapsed != "true") {
            TargetModuleBlock.dataset.collapsed = "false";
            collapseBtn.classList.add("bi", "bi-chevron-up");
            //rightSide.style.backgroundColor = "red";
        }
        else {
            collapseBtn.classList.add("bi-chevron-down");
            //rightSide.style.backgroundColor = "green";
        }


        collapseBtn.onclick = (e) => {
            e.stopPropagation();

            ModuleBlockSettingBarMgr.toggleCollapse(TargetModuleBlock);
        };

        rightSide.appendChild(collapseBtn);

        //==========【新增】隱藏/取消隱藏 TableGrid 外框的按鈕 ==========
        const toggleTableGridBtn = document.createElement("button");
        toggleTableGridBtn.classList.add("btn", "btn-light");
        toggleTableGridBtn.title = "隱藏/取消隱藏表格外框";
        // 初始顯示隱藏圖示（可依需求自行設定初始狀態）
        toggleTableGridBtn.innerHTML = `<i class="bi bi-eye-slash"></i>`;
        toggleTableGridBtn.onclick = (e) => {
            e.stopPropagation();
            const tableGrid = ModuleDataFetcherMgr.GetTargetModuleBlock_TableGrid(TargetModuleBlock);
            if (!tableGrid) {
                console.warn("找不到 TableGrid 元素");
                return;
            }
            // 判斷當前是否有隱藏樣式
            if (tableGrid.classList.contains("tableStyle_hide")) {
                tableGrid.classList.remove("tableStyle_hide");
                // 更新按鈕圖示（此處設定為隱藏圖示）
                toggleTableGridBtn.innerHTML = `<i class="bi bi-eye-slash"></i>`;
            } else {
                tableGrid.classList.add("tableStyle_hide");
                // 更新按鈕圖示（此處設定為顯示圖示）
                toggleTableGridBtn.innerHTML = `<i class="bi bi-eye"></i>`;
            }
        };
        // 將新按鈕加入右側容器
        rightSide.appendChild(toggleTableGridBtn);



        //【如果原有更多設定按鈕需保留】再接續加入更多設定按鈕
        const moreSettingsBtn = document.createElement("button");
        moreSettingsBtn.classList.add("btn", "btn-light");
        moreSettingsBtn.title = "更多設定";
        moreSettingsBtn.innerHTML = `<i class="bi bi-three-dots"></i>`;
        moreSettingsBtn.onclick = (e) => {
            e.stopPropagation();
            this.openMoreSettings(TargetModuleBlock.id);
        };
        rightSide.appendChild(moreSettingsBtn);

        newDownSettingBar.appendChild(rightSide);

        return newDownSettingBar;
    }




    /**
   * [複製模塊] - 使用 cloneNode(true) 並指定新的 ModuleBlock.id
   * 同時更新其子層的 Opt_x / value / name 等對應關係。
   * @param {HTMLElement} TargetModuleBlock - 要被複製的根 ModuleBlock (父層)
   */
    static copyModuleBlock(TargetModuleBlock) {

        // 1) 深度克隆 (含子模塊) 
        const clonedBlock = TargetModuleBlock.cloneNode(true);

        // 2) 收集「舊的所有 ModuleBlock」(含父) 以及「克隆後對應的所有 ModuleBlock」，以便做 ID 映射
        //    - 原則: 依照 ID 數字大小排序 (保證複製順序固定)
        const originalBlocks = Array.from(TargetModuleBlock.querySelectorAll('.ModuleBlock'));
        originalBlocks.unshift(TargetModuleBlock); // 父層也加入
        originalBlocks.sort((a, b) => {
            const idA = parseInt(a.id.split('_')[1], 10);
            const idB = parseInt(b.id.split('_')[1], 10);
            return idA - idB;
        });

        const clonedBlocks = Array.from(clonedBlock.querySelectorAll('.ModuleBlock'));
        clonedBlocks.unshift(clonedBlock);
        clonedBlocks.sort((a, b) => {
            const idA = parseInt(a.id.split('_')[1], 10);
            const idB = parseInt(b.id.split('_')[1], 10);
            return idA - idB;
        });

        // 3) 建立一個 Map，紀錄「舊ID -> 新ID」 
        const idMap = new Map();

        // 4) 依序為每個原 ModuleBlock 分配新 ID，並改寫對應的 clone
        for (let i = 0; i < originalBlocks.length; i++) {
            const oldBlock = originalBlocks[i];
            const newBlock = clonedBlocks[i];
            if (!newBlock) continue;

            // 4-1) 取得新的 ModuleBlock ID
            ModuleBlockCreatMgr.ModuleBlockIdStart();
            const newIdNum = ModuleBlockCreatMgr.getModuleBlockId();
            const newBlockId = "ModuleBlock_" + newIdNum;

            // 4-2) 記錄映射
            idMap.set(oldBlock.id, newBlockId);

            // 4-3) 設置克隆後的 newBlock.id = 新 ID
            newBlock.id = newBlockId;

            // (可選) data--color-layer 或 dataset.checkboxType 等也可做調整

        }

        // 5) 更新克隆後 DOM 裡的 input / label 對應 (Opt_x, value, name)
        //    先找出所有 input[id^="Opt_"], label[for^="Opt_"] 
        //    => 若舊 id = Opt_7, 其對應的 ModuleBlock idMap( "ModuleBlock_7" ) => "ModuleBlock_13"
        //    => 則新 input id = Opt_13, value=13, name=ModuleBlock_13
        const allInputs = clonedBlock.querySelectorAll('input[id^="Opt_"]');
        const allLabels = clonedBlock.querySelectorAll('label[for^="Opt_"]');

        // 5-1) 處理 <input> 
        allInputs.forEach(inp => {
            // 例: inp.id="Opt_7" => 7
            const oldNum = inp.id.replace('Opt_', '');
            const oldBlockId = 'ModuleBlock_' + oldNum;
            if (idMap.has(oldBlockId)) {
                const newBlockId = idMap.get(oldBlockId); // 例: "ModuleBlock_13"
                const newNum = newBlockId.split('_')[1];  // 13

                // 新 id = "Opt_13"
                inp.id = "Opt_" + newNum;
                // 新 value = 13
                inp.value = newNum;

                // 若原本有 name="ModuleBlock_7" => name="ModuleBlock_13"
                const oldName = inp.getAttribute('name');
                if (oldName && idMap.has(oldName)) {
                    inp.name = idMap.get(oldName);
                }
                // 若根本沒 name，但要保持父ID => 
                // (父模塊id 需對應新的) => 須再視需求,看是否 input.name = (新的父id)
            }
        });

        // 5-2) 處理 <label>
        allLabels.forEach(lab => {
            const oldFor = lab.getAttribute('for');  // e.g. "Opt_7"
            if (!oldFor) return;
            const oldNum = oldFor.replace('Opt_', '');
            const oldBlockId = 'ModuleBlock_' + oldNum;

            if (idMap.has(oldBlockId)) {
                const newBlockId = idMap.get(oldBlockId);
                const newNum = newBlockId.split('_')[1];
                lab.setAttribute('for', 'Opt_' + newNum);
            }
        });

        // 6) 將克隆好的 clonedBlock 插在 TargetModuleBlock 後面 
        TargetModuleBlock.insertAdjacentElement('afterend', clonedBlock);

        // 7) 重新掛事件 (用 SurveyEditer 的函式，依您的專案習慣)
        //    單一模塊 => ReSet_ModuleBlock_EventAction(clonedBlock);
        //    或整體 => ReSetAll_ModuleBlock_EventAction();
        //ModuleBlockCreatMgr.ReSet_ModuleBlock_EventAction(clonedBlock);
        ModuleBlockCreatMgr.ReSetAll_ModuleBlock_EventAction();
        // 8) 做視覺更新
         AutoScreen_js.resetAutoScreenBlockSize();

        // 9) 選取新的複製模塊 (可選)
        ModuleBlock_SelectTargetMgr.SetModuleBlockSelectTarget(clonedBlock);

        console.log("複製完成，已對應 Opt_x, value, name, label.for，並重新掛事件。");
    }

    /**
     * [刪除模塊]
     */
    static deleteModuleBlock(TargetModuleBlock) {


        var TargetModuleBlockParentNode = TargetModuleBlock.parentNode;
        var parentModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(TargetModuleBlockParentNode);

        if (!confirm("確定要刪除此模塊？")) return;
        block.deleteRecord(TargetModuleBlock);
        TargetModuleBlock.remove();

        AutoScreen_js.resetAutoScreenBlockSize();

        /*document.querySelector(`#${TargetModuleBlock.id}`).dataset.isRemove = "true";*/


        alert(document.querySelector(`#${TargetModuleBlock.id}`));
        alert("模塊已刪除！");


        if (parentModuleBlock)
        {
            console.error("有父親");
           ModuleBlockEditMgr.setCollapse(parentModuleBlock, false);

            ModuleOptionEditor.checkHasOption(parentModuleBlock);
        }
    }

    /**
     * [切換必填 - HTML方式]
     */
    static toggleRequiredHTML(moduleBlockId, event) {
        event.stopPropagation();
        const isChecked = event.target.checked;
        console.log(`[HTML] 必填狀態 = ${isChecked}`);

        const TargetModuleBlock = document.getElementById(moduleBlockId);
        if (!TargetModuleBlock) return;

        const checkbox = TargetModuleBlock.querySelector("._checkbox");
        if (!checkbox) {
            alert("本模塊沒有 checkbox，無法切換必填。");
            return;
        }
        checkbox.required = isChecked;
        alert(`本模塊必填狀態已切換為：${checkbox.required}`);
    }

    /**
     * [更多設定]
     */
    static openMoreSettings(moduleBlockId) {
        alert("開啟更多設定... (此處可自訂彈窗或其他 UI)\n模塊ID=" + moduleBlockId);
    }

    //==================載入html=============================================
    /**
    * [匯入檔案]：流程為
    *  1) 彈出視窗讓使用者選 .txt
    *  2) 讀取檔案文字，裡面是 HTML
    *  3) 透過 parseHTML => 產生暫時的 DOM
    *  4) 對於 .ModuleBlock 逐一「clone + 重新編號」 => Append 到頁面上
    */
    /**
   * (★) 重點：改寫 importTxtAndProcess()，可同時處理
   *  1) 從檔案 (.txt) 匯入
   *  2) 從字串 (HTML) 匯入
   * - 當呼叫: importTxtAndProcess() => 開檔案對話框
   * - 當呼叫: importTxtAndProcess("<div> ... </div>") => 直接解析 HTML
   */
    static importTxtAndProcess(htmlString = null) {

        // 如果呼叫時傳入了 htmlString (表示從外部已拿到HTML)
        if (htmlString) {
            this.#importHtmlString(htmlString);
            return;
        }

        // 否則走原本檔案流 (.txt)
        // 1) 建立 <input type="file"> 專用來選 txt
        const inputFile = document.createElement("input");
        inputFile.type = "file";
        inputFile.accept = ".txt";

        // 2) 監聽 change: 使用者選完檔案
        inputFile.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            // 檢查副檔名 (可再加嚴謹判斷)
            if (!file.name.endsWith(".txt")) {
                alert("請選擇 .txt 檔案！");
                return;
            }

            try {
                // 3) 讀取檔案內容(文字)
                const content = await file.text();
                this.#importHtmlString(content);
            } catch (err) {
                console.error("讀取檔案失敗:", err);
                alert("匯入失敗：" + err.message);
            }

        });

        // 觸發選擇檔案
        inputFile.click();
    }

    /**
  * (★) 處理來自「HtmlSection組成的HTML字串」或 txt內容
  *     - 會將字串 parse，找最外層 .ModuleBlock
  *     - clone + reId => append 到 #AutoScreen
  */
    static #importHtmlString(htmlContent) {
        try {

            // 4) 將文字 parse 成 DOM
            const tempWrapper = document.createElement("div");
            tempWrapper.innerHTML = htmlContent;
            //   => content 若含 <div class="ModuleBlock"> ... 會保留 DOM 結構

            // 5) 先抓出 tempWrapper 裏所有的 .ModuleBlock
            const allBlocks = Array.from(tempWrapper.querySelectorAll(".ModuleBlock"));

            // 只保留“最外層”模組，條件是：它沒有父 .ModuleBlock 或其父不在 allBlocks 裏
            const rootBlocks = allBlocks.filter(block => {
                const parentMB = block.parentElement?.closest(".ModuleBlock");
                // 如果 parentMB 不存在，代表本身就是最外層
                // 或者 parentMB 不在 allBlocks 之中，表示是更外圍 (不是同一批)
                return !parentMB || !allBlocks.includes(parentMB);
            });

            if (rootBlocks.length === 0) {
                alert("匯入內容沒有找到任何最外層 .ModuleBlock。");
                return;
            }

            // 6) 逐一把 rootBlocks 做 clone + 重新編號，再插到 #AutoScreen (或其他位置)
            //    - 也可視需求一次把 tempWrapper 整個 clone
            const autoScreen = document.getElementById("AutoScreen");

            if (!autoScreen) {
                alert("無法找到 #AutoScreen 區域！");
                return;
            }

            rootBlocks.forEach(block => {
                // a) cloneBlock
                const newBlock = ModuleBlockSettingBarMgr.#cloneWithNewIds(block);
                // b) 加到畫面上
                autoScreen.appendChild(newBlock);
                // c) 重新綁定事件
            });

            ModuleBlockCreatMgr.ReSetAll_ModuleBlock_EventAction();
            // 7) 重整畫面
             AutoScreen_js.resetAutoScreenBlockSize();
            alert("匯入成功，所有 .ModuleBlock 已新增至畫面！");

        } catch (err) {
            console.error("讀取檔案失敗:", err);
            alert("匯入失敗：" + err.message);
        }
    }





    /**
 * [匯出檔案] - 將目前畫面上的所有 .ModuleBlock (或您指定的區域，如 #AutoScreen) 轉成 HTML 字串後，
 *  以 .txt 形式觸發下載。
 */
    static exportModulesToTxt() {
        try {
            // 1) 取得 #AutoScreen 內容
            const autoScreen = document.getElementById("AutoScreen");
            if (!autoScreen) {
                alert("無法找到 AutoScreen 區域！");
                return;
            }

            // 2) 取得檔名（使用 prompt 或其他 UI）
            //    預設 "myModules" 當檔名，若使用者按取消，則直接 return
            const fileName = prompt("請輸入想儲存的檔名(不含副檔名)", "myModules");
            if (!fileName) {
                // 使用者取消或輸入空字串就不進行匯出
                return;
            }

            // 3) 抓出 HTML 內容
            const htmlContent = autoScreen.innerHTML;

            // 4) 建立 Blob 來進行下載
            const blob = new Blob([htmlContent], { type: "text/plain" });
            const url = URL.createObjectURL(blob);

            // 5) 建立 <a> 元素，下載 .txt
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName + ".txt";   // 使用者輸入的檔名 + .txt
            document.body.appendChild(link);
            link.click();

            // 6) 清理 
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert(`匯出成功，已下載「${fileName}.txt」！`);

        } catch (err) {
            console.error("匯出失敗:", err);
            alert("匯出失敗：" + err.message);
        }
    }


    /**
     * [cloneWithNewIds]：將「單個」 .ModuleBlock 深度複製後，
     * 自動為此區塊(含子 .ModuleBlock) 產生新的 ID, 以及 input.id / label.for / value / name。
     * 回傳新的 DOM 節點。
     * 
     * 可與 copyModuleBlock 相同邏輯抽出來做共用
     */
    static #cloneWithNewIds(TargetModuleBlock) {
        // 1) 深度 clone
        const clonedBlock = TargetModuleBlock.cloneNode(true);

        // 2) 收集「舊的所有 ModuleBlock」(含父) +「克隆後對應的 ModuleBlock」，做 ID 對應
        const originalBlocks = Array.from(TargetModuleBlock.querySelectorAll('.ModuleBlock'));
        originalBlocks.unshift(TargetModuleBlock);
        originalBlocks.sort((a, b) => {
            const idA = parseInt(a.id.split('_')[1], 10);
            const idB = parseInt(b.id.split('_')[1], 10);
            return idA - idB;
        });

        const clonedBlocks = Array.from(clonedBlock.querySelectorAll('.ModuleBlock'));
        clonedBlocks.unshift(clonedBlock);
        clonedBlocks.sort((a, b) => {
            const idA = parseInt(a.id.split('_')[1], 10);
            const idB = parseInt(b.id.split('_')[1], 10);
            return idA - idB;
        });

        const idMap = new Map(); //「舊ID -> 新ID」

        // 3) 依序給每個 .ModuleBlock 新的 ID
        for (let i = 0; i < originalBlocks.length; i++) {
            const oldBlock = originalBlocks[i];
            const newBlock = clonedBlocks[i];
            if (!newBlock) continue;

            ModuleBlockCreatMgr.ModuleBlockIdStart();
            const newNum = ModuleBlockCreatMgr.getModuleBlockId();
            const newId = "ModuleBlock_" + newNum;
            idMap.set(oldBlock.id, newId);
            newBlock.id = newId;
        }

        // 4) 更新 <input> & <label> => Opt_x, value, name
        const allInputs = clonedBlock.querySelectorAll('input[id^="Opt_"]');
        const allLabels = clonedBlock.querySelectorAll('label[for^="Opt_"]');

        allInputs.forEach(inp => {
            const oldNum = inp.id.replace('Opt_', '');
            const oldBlockId = 'ModuleBlock_' + oldNum;
            if (idMap.has(oldBlockId)) {
                const newBlockId = idMap.get(oldBlockId);
                const newNum = newBlockId.split('_')[1];
                // input.id
                inp.id = "Opt_" + newNum;
                // value
                inp.value = newNum;
                // name
                const oldName = inp.getAttribute('name');
                if (oldName && idMap.has(oldName)) {
                    inp.name = idMap.get(oldName);
                }
            }
        });

        allLabels.forEach(lab => {
            const oldFor = lab.getAttribute('for');
            if (!oldFor) return;
            const oldNum = oldFor.replace('Opt_', '');
            const oldBlockId = 'ModuleBlock_' + oldNum;
            if (idMap.has(oldBlockId)) {
                const newBlockId = idMap.get(oldBlockId);
                const newNum = newBlockId.split('_')[1];
                lab.setAttribute('for', 'Opt_' + newNum);
            }
        });

        return clonedBlock;
    }


    /**
     * [範例：匯入按鈕觸發]
     * 在您的「匯入按鈕」(帶 .bi-upload 的) onclick 時呼叫這個。
     * 也可把下列程式碼放到 surveyEditer.js or site.js 皆可。
     */
    static bindImportButton() {
        const importButton = document.querySelector('button[title="匯入"]');
        if (!importButton) return;

        importButton.addEventListener("click", (event) => {
            // 顯示一個 offcanvas (或 modal) 都可以
            // 假設已經做好一個 #htmlUploadCanvas offcanvas



            const offCanvas = new bootstrap.Offcanvas("#htmlUploadCanvas");
            offCanvas.show();

            // 或者直接呼叫 importTxtAndProcess() 也行：
            // this.importTxtAndProcess();
        });
    }

}
