
/**************************************************/
/* SurveyAnswerMode.js                   
/**************************************************/

$(document).ready(function () {

        // 預先綁定列印按鈕事件，確保第一次點選就能執行列印
        var btnPrint = document.getElementById("btnPrint");
        if (btnPrint) {
            btnPrint.addEventListener("click", function () {
            console.log("[功能列] 列印被點擊");
            // 先將工具列隱藏（加上 collapsed class）
            var menuBar = document.getElementById("documentMenuBar");

            //menuBar.classList.add("collapsed");
            if (menuBar) menuBar.classList.add("collapsed");

            // 延遲 100 毫秒後呼叫 window.print()，以確保畫面更新
            setTimeout(function () {
                window.print();
                // 印完後移除 collapsed 狀態
                //menuBar.classList.remove("collapsed");

                if (menuBar) menuBar.classList.remove("collapsed");
            }, 100);
        });
        } else {
        //console.error("找不到 ID 為 btnPrint 的列印按鈕");
        // 如果頁面中沒有 btnPrint，則僅顯示警告（或直接忽略）
        console.warn("找不到 ID 為 btnPrint 的列印按鈕，請確認是否需要該功能或調整初始化時間。");
    }

        document.addEventListener("keydown", (event) => {
            
            
                    //console.log(`event.shiftKey: ${event.shiftKey} event.key: ${event.key}, event.code: ${event.code}`);
                    if (event.altKey && event.ctrlKey)
                    {
                        switch (event.key) {
                            case "1":
                                //SaveAndLoadAnswerMgr.LoadSurvey(SurveyId, Version, htmlContent);
                                //console.log("ctrl + alt + 1 被按下了！");
                                break;
                            case "2":

                                //console.log("ctrl + alt + 2 被按下了！");
                                AllQuestionsAnsweredMgr.CheckAllQuestionsAnswered();
                                break;
                            case "3":
                                console.log("ctrl + alt + 3 被按下了！");

                                document.querySelectorAll(".ModuleBlock").forEach(
                                    (ModuleBlock) => {
                                        ModuleBlock.style.backgroundColor = "";
                                        ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(ModuleBlock).style.backgroundColor = "";
                                    }
                                );

                                break;
                            case "4":
                                console.log("ctrl + alt + 4 被按下了！");
                                // ResetAllBugOptionEditor.resetAllBugOptionSet();//---------------------------- 視情況修改

                                break;
                            case "5":
                                console.log("ctrl + alt + 5 被按下了！");

                                //ResetAllBugOptionEditor.resetAllBugOptionSet();------------------------------------

                                break;
                            case "6":
                                console.log("ctrl + alt + 6 被按下了！");
                                //ResetAllBugOptionEditor.resetQuestionListOption();

                                //
                                ResetActionMgr.resetAction(); //---------------------------------------------------------------------

                                AutoScreen_js.resetAutoScreenBlockSize();
                                //ModuleBlockEditMgr.setAllCollapseType(true);
                                //SurveyAnswerModeEditor.SetSurveyAnswerMode();
                                //ModuleBlockSettingBarMgr.setAllCollapseIconAction();
                                //ModuleBlock_ConfirmBoxMgr.resetConfirmBox();
                                //AutoScreen_js.resetAutoScreenBlockSize();
                                //SetCheckBoxActionMgr.resetCheckBoxAction();

                                break;
                            case "7":
                                console.log("ctrl + alt + 7 被按下了！");

                                //存檔


                                //SaveAndLoadAnswerMgr.TestSurvey();

                                //SaveAndLoadAnswerMgr.saveSurveyAnswerToData(1, 1, '{"test":"value"}', "A58G100");
                                //SaveAndLoadAnswerMgr.saveAnswer();

                                //var jsonStr = SaveAndLoadAnswerMgr.saveAnswer();
                                //console.log(jsonStr);

                                //SaveAndLoadAnswerMgr.loadAnswerDataListFromJson(jsonStr);
                                SaveAndLoadAnswerMgr.saveAnswer();

                                //SaveAndLoadAnswerMgr.saveSurveyAnswerToData(1, 1, jsonStr, "A58G100");
                                //SaveAndLoadAnswerMgr.saveSurveyAnswerToData(1, 1, '{"test":"value"}', "A58G100");


                                /////////////////////////////////////////////////////////////////
                              //  var jsonStr = SaveAndLoadAnswerMgr.saveAnswer();
                                //SaveAndLoadAnswerMgr.saveSurveyAnswer();

                                break;
                            case "8":
                                console.log("ctrl + alt + 8 被按下了！");
                                // 從 localStorage 取得答案 JSON
                                //const storedAnswerJson = localStorage.getItem("answerJson");
                                //if (storedAnswerJson) {
                                //    // 將 JSON 載入 AnswerDataList
                                //    SaveAndLoadAnswerMgr.loadAnswerDataListFromJson(storedAnswerJson);
                                //    // 呼叫 loadAnswer() 將答案填回到介面上
                                //    SaveAndLoadAnswerMgr.loadAnswer();
                                //} else {
                                //    alert("沒有找到已儲存的答案資料！");
                                //}
                                //SaveAndLoadAnswerMgr.loadAnswer();------------------------------------------------
                                //SaveAndLoadAnswerMgr.saveAnswer();
                                break;
                            case "9":
                                console.log("ctrl + alt + 9 被按下了！");
                                //SaveAndLoadAnswerMgr.ClearAllAnswer();

                                //ModuleBlockEditMgr.setAllCollapseType(true);--------------------------------------
                                //SurveyAnswerModeEditor.resetAllFirstLayer();--------------------------------------
                          
                                break;
                            default:
                            //console.log(`其他鍵被按下: ${event.code}`);
                        }
                    }           
                
                }
    );

        // 新增全域點擊事件：當點擊非 .UploadedIeContainer 區域時，取消所有選取（藍框）
        document.addEventListener("click", function (e) {
        // 如果點擊目標不在任何 .UploadedImageContainer 內
        if (!e.target.closest(".UploadedImageContainer")) {
            document.querySelectorAll(".UploadedImageContainer.selected").forEach(function (elem) {
                elem.classList.remove("selected");
                // 同時移除該容器上的拖曳手柄
                SaveAndLoadAnswerMgr.removeResizeHandles(elem);
            });
        }
    });


    

    } 
);







class ResetActionMgr {
    static isSetting = false;

    static async resetAction() {

        document.querySelectorAll(".Survey").forEach(
            (survey) => {

                ResetActionMgr.resetAction_Survey(survey);
            }

        )

    }


    static async resetAction_Survey(survey) {

        //console.log(survey.id);
        //if (ResetActionMgr.isSetting) {
        //    return;
        //}
        //ResetActionMgr.isSetting = true;
        //console.log(survey.id);
        try {

            survey.querySelector(".Input_Check").checked = true;




            //設定折疊Label的樣式
            await SurveyAnswerModeEditor.resetAllModuleBlockLabel_Survey(survey);

            //設定折疊
            await ModuleBlockEditMgr.setCollapseType_Survey(survey,true);

            //設定id
            await SaveAndLoadAnswerMgr.setInputAnswerId_Survey(survey);
            //設定成填答模式
            //await SurveyAnswerModeEditor.SetSurveyAnswerMode();
            await SurveyAnswerModeEditor.SetSurveyAnswerMode_Survey(survey);

            //設定摺疊Icon
            await ModuleBlockEditMgr.setAllCollapseIconAction_Survey(survey);

            //重設審核框
            //await ModuleBlock_ConfirmBoxMgr.resetConfirmBox();

            // 重置畫面大小
            //await AutoScreen_js.resetAutoScreenBlockSize();

            //重設確認框Action
            await SetCheckBoxActionMgr.resetCheckBoxAction_Survey(survey);

        } catch (error) {
            console.error("Error in ResetActionMgr.resetAction:", error);
        } finally {
          //  ResetActionMgr.isSetting = false;
        }
    }

}


class ModuleBlock_ConfirmBoxMgr {

    static resetConfirmBox() {

        const ModuleBlocks = document.querySelectorAll('.ModuleBlock');
      

        ModuleBlocks.forEach(ModuleBlock => {
            const toDelete = ModuleBlock.querySelector(':scope > .ModuleBlock_group');
            if (toDelete) {
                toDelete.remove();
            }
            if (ModuleBlock.dataset.needvali === 'true') {
                if (!ModuleBlock.querySelector(':scope > .ModuleBlock_group')) {

                    let group = block.createModuleBlock_group(ModuleBlock);

                    ModuleBlock.appendChild(group);
                }
            } 
        })

    }

}



class SurveyAnswerModeEditor {

    //一開始填寫模式為否
    static SurveyAnswerModeType = false;



    static createDropdown(name) {

            const options = [
                { value: "volvo", label: "Volvo" },
                { value: "saab", label: "Saab" },
                { value: "mercedes", label: "Mercedes" }
            ];

        const select = document.createElement("select");
        select.name = name;

        options.forEach(option => {
            const opt = document.createElement("option");
            opt.value = option.value;
            opt.textContent = option.label;
            select.appendChild(opt);
        });
        document.querySelector("#AutoScreenBlock").appendChild(select);
    }
    static createList(name) {
        const options = [
            { value: "Chrome" },
            { value: "Firefox" },
            { value: "Safari" }
        ];

        // 創建 input 元素
        const input = document.createElement("input");
        input.name = name;

        // 創建 datalist 元素
        const datalist = document.createElement("datalist");

        // 生成唯一識別符（避免 id 直接寫在 HTML）
        const uniqueId = `datalist-${Date.now()}`;
        input.setAttribute("list", uniqueId);
        datalist.setAttribute("id", uniqueId);

        // 添加選項
        options.forEach(option => {
            const opt = document.createElement("option");
            opt.value = option.value;
            datalist.appendChild(opt);
        });

        // 插入 DOM
        const container = document.querySelector("#AutoScreenBlock");
        container.appendChild(input);
        container.appendChild(datalist);
    }

    //把該開的開起來 該關的關起來
    static SetSurveyAnswerMode() {

        //this.SurveyAnswerModeType = !this.SurveyAnswerModeType;
        this.SurveyAnswerModeType = true;
        //開啟填寫模式時 先關閉所有填寫
        this.setAllCanAnswer(this.SurveyAnswerModeType);  

        //----------------------------
        //this.resetAllTextarea(); 會引響原始排版
        // ResetAllBugOptionEditor.resetAllBugOptionSet();//---------------------------- 視情況修改

        ResetAllBugOptionEditor.resetAllDivStyle();

        this.resetAllDataSet();

        this.resetAllFirstLayer();
    
    }

    static SetSurveyAnswerMode_Survey(survey) {

        //開啟填寫模式時 先關閉所有填寫
        this.setAllCanAnswer_Survey(survey,true);

        //----------------------------
        //this.resetAllTextarea(); 會引響原始排版
        // ResetAllBugOptionEditor.resetAllBugOptionSet();//---------------------------- 視情況修改

        ResetAllBugOptionEditor.resetAllDivStyle_Survey(survey);

        this.resetAllDataSet_Survey(survey);

        this.resetSurveyFirstLayer(survey);

    }

    static setAllCanAnswer_Survey(survey,bool) {
        //true是關閉

        survey.querySelectorAll(".ModuleBlock input, .ModuleBlock textarea")
            .forEach((input) => {
                input.disabled = bool; // 設定 disabled 狀態
            });
        SaveAndLoadAnswerMgr.ClearAllAnswer_Survey(survey);

    }


    static setAllCanAnswer(bool) {
        //true是關閉

        document.querySelectorAll(".ModuleBlock input, .ModuleBlock textarea")
            .forEach((input) => {
                input.disabled = bool; // 設定 disabled 狀態
            });
        SaveAndLoadAnswerMgr.ClearAllAnswer();

    }

    static resetAllTextarea() {

        document.querySelectorAll("textarea").forEach(textarea => {
            textarea.setAttribute("rows", "1");
            
            textarea.style.height = "auto"; // 先重置高度，確保重新計算 scrollHeight

            if (textarea.value.trim() === "") {
                textarea.value = "";
            }
        });

        let lineHeight = 10; // 單行高度
        let paddingOffset = 5; // 額外增加的高度
        document.querySelectorAll("textarea").forEach((textarea) => {
            const height = textarea.scrollHeight - paddingOffset; // 用 scrollHeight 確保正確高度
            const adjustedHeight = Math.max(lineHeight, Math.round(height / lineHeight) * lineHeight) + paddingOffset;
            textarea.style.height = `${adjustedHeight}px`;
        });
    }

    static resetAllModuleBlockLabel() {

        document.querySelectorAll(".ModuleBlock label").forEach(label => {
            label.style.cursor = "pointer";
        });

    }
    //設應 DataSet
    static resetAllDataSet() {
        //console.log("resetAllDataSet");

        // 重置所有模組的 dataset
        document.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(
            (ModuleBlock) => { ModuleBlock.dataset.QuestionMode = false; }
        );

        let questionNameList = new Map(); // 使用 Map，以 name 為 key，確保唯一性

        document.querySelectorAll("." + ModuleBlockElementMgr.optionCheckboxName).forEach(
            (optionCheckbox) => {
                var TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(optionCheckbox);
                if (optionCheckbox.name == TargetModuleBlock.id) {
                    optionCheckbox.removeAttribute("name");
                } else {
                    if (optionCheckbox.name) {
                        let surveyElement = optionCheckbox.closest(".Survey");
                        let surveyId = surveyElement ? surveyElement.id : "未找到 Survey";

                        let OptionData = {
                            surveyId: surveyId,
                            name: optionCheckbox.name
                        };

                        //console.log("++++++++++++" + OptionData.surveyId + "----------" + OptionData.name);
                        optionCheckbox.dataset.OptionMode = true;

                        // 存入 Map，以 name 為 key，確保唯一性
                        let uniqueKey = `${surveyId}-${optionCheckbox.name}`;
                        questionNameList.set(uniqueKey, OptionData);
                    }
                }
            }
        );

        let uniqueQuestionNameList = Array.from(questionNameList.values());

        uniqueQuestionNameList.forEach((OptionData) => {
            //console.log("==============" + OptionData.surveyId + "-------" + OptionData.name);

            if (!OptionData.name || !OptionData.surveyId) {
                return; // 跳過這個迴圈
            }

            // 修正 querySelector，確保 surveyId 轉換為正確的 CSS 選擇器
            var survey = document.querySelector(`#${CSS.escape(OptionData.surveyId)}`);
            if (!survey) {
                console.warn("Survey not found for surveyId:", OptionData.surveyId);
                return;
            }

            if (OptionData.name.startsWith("Bool_")) {
                OptionData.name = OptionData.name.replace(/^Bool_/, "ModuleBlock_"); // 轉換前綴
            }
            //====================================================
            const match = OptionData.name.match(/ModuleBlock_\d+/);
          
            // 使用 CSS.escape 確保 id 不會導致 querySelector 出錯
            var target = survey.querySelector(`#${CSS.escape(match)}`);
            if (!target) {
                //console.warn("Target not found for name:", match);
                return;
            }

            // 修改 target 屬性
            target.dataset.QuestionMode = "true";
            target.dataset.needAnswered = "false";
            //target.style.backgroundColor = "red"; // 標記為紅色

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
    static resetAllDataSet_Survey(survey) {
        //console.log("resetAllDataSet");

        // 重置所有模組的 dataset
        survey.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`).forEach(
            (ModuleBlock) => { ModuleBlock.dataset.QuestionMode = false; }
        );

        let questionNameList = new Map(); // 使用 Map，以 name 為 key，確保唯一性

        survey.querySelectorAll("." + ModuleBlockElementMgr.optionCheckboxName).forEach(
            (optionCheckbox) => {
                var TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(optionCheckbox);
                if (optionCheckbox.name == TargetModuleBlock.id) {
                    optionCheckbox.removeAttribute("name");
                } else {
                    if (optionCheckbox.name) {
                        let surveyElement = optionCheckbox.closest(".Survey");
                        let surveyId = surveyElement ? surveyElement.id : "未找到 Survey";

                        let OptionData = {
                            surveyId: surveyId,
                            name: optionCheckbox.name
                        };

                        //console.log("++++++++++++" + OptionData.surveyId + "----------" + OptionData.name);
                        optionCheckbox.dataset.OptionMode = true;

                        // 存入 Map，以 name 為 key，確保唯一性
                        let uniqueKey = `${surveyId}-${optionCheckbox.name}`;
                        questionNameList.set(uniqueKey, OptionData);
                    }
                }
            }
        );

        let uniqueQuestionNameList = Array.from(questionNameList.values());

        uniqueQuestionNameList.forEach((OptionData) => {
            //console.log("==============" + OptionData.surveyId + "-------" + OptionData.name);

            if (!OptionData.name || !OptionData.surveyId) {
                return; // 跳過這個迴圈
            }

            // 修正 querySelector，確保 surveyId 轉換為正確的 CSS 選擇器
            var survey = document.querySelector(`#${CSS.escape(OptionData.surveyId)}`);
            if (!survey) {
                console.warn("Survey not found for surveyId:", OptionData.surveyId);
                return;
            }

            if (OptionData.name.startsWith("Bool_")) {
                OptionData.name = OptionData.name.replace(/^Bool_/, "ModuleBlock_"); // 轉換前綴
            }
            //====================================================
            const match = OptionData.name.match(/ModuleBlock_\d+/);

            // 使用 CSS.escape 確保 id 不會導致 querySelector 出錯
            var target = survey.querySelector(`#${CSS.escape(match)}`);
            if (!target) {
                //console.warn("Target not found for name:", match);
                return;
            }

            // 修改 target 屬性
            target.dataset.QuestionMode = "true";
            target.dataset.needAnswered = "false";
            //target.style.backgroundColor = "red"; // 標記為紅色

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

    ///////////////////////////////


    static resetAllFirstLayer() {

        document.querySelectorAll(`.Survey`).forEach((Survey) => { SurveyAnswerModeEditor.resetSurveyFirstLayer(Survey); });

    }


    static resetSurveyFirstLayer(Survey) {

        var allFirstLayerModuleBlocks = Survey.querySelectorAll(`:scope > .Survey_Inner > .${ModuleBlockElementMgr.ModuleBlockName}`);
        //var FirstLayers = [];
        var FirstLayers = new Set();

        //console.error(allFirstLayerModuleBlocks.length);


        if (allFirstLayerModuleBlocks.length > 0) {
            allFirstLayerModuleBlocks.forEach((TargetModuleBlock) => {

                //FirstLayers = FirstLayers.concat(this.getFirstLayerModuleBlocks(TargetModuleBlock)); // 展開陣列
                //FirstLayers.push(TargetModuleBlock);

                this.getFirstLayerModuleBlocks(TargetModuleBlock).forEach(block => FirstLayers.add(block));
                // FirstLayers.add(TargetModuleBlock); // 確保 TargetModuleBlock 只加入一次

            });
        }
        
        FirstLayers = [...FirstLayers];

        var allModuleBlock = Survey.querySelectorAll(`.${ModuleBlockElementMgr.ModuleBlockName}`);

        allModuleBlock.forEach(

            (ModuleBlock) => {

                if (ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(ModuleBlock).style.display == "none") {
                    //關閉預設就是打開

                    ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(ModuleBlock).checked = true;
                    ModuleBlock.dataset.SetOpenModuleBlock = "true";
                }
                else {
                    ModuleBlock.dataset.SetOpenModuleBlock = "false";
                }

                if (ModuleBlock.dataset.SetOpenModuleBlock == "true") {
                    ModuleBlock.style.backgroundColor = "PINK";
                }
                //ModuleBlock.style.backgroundColor = "PINK";
            }
        );

        //return;
        //console.warn("FirstLayers  " + FirstLayers);
        FirstLayers.forEach(
            (ModuleBlock) => {
                if (ModuleBlock instanceof HTMLElement) { // 確保是 DOM 元素

                    //開啟選項框
                    ModuleBlock.style.backgroundColor = "yellow";
                    ModuleBlock.dataset.SetOpenModuleBlock = "true";

                    ModuleBlockEditMgr.setCollapse(ModuleBlock, false);

                    ModuleBlock.querySelectorAll(
                        `:scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .textBox  input , 
                        :scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .textBox  textarea`
                    ).forEach((input) => {

                        input.disabled = true; // 設定 disabled 狀態

                        if (input.type === "radio" || input.type === "checkbox") {
                            //input.checked = true; //預設勾選
                            input.checked = false;
                            input.disabled = false; // 設定 disabled 狀態
                            //ModuleDataFetcherMgr.GetTargetModuleBlock(input).style.backgroundColor="green";
                            console.log("預設勾選");
                        } else {
                            // 也不用清空 資料帶不進來 value
                        }
                    });
                }
            }
        )
        //return;
        allFirstLayerModuleBlocks.forEach(
            (ModuleBlock) => {
                if (ModuleBlock instanceof HTMLElement) { // 確保是 DOM 元素

                    //層層解鎖
                    this.setOpenByLayer(ModuleBlock);
                }
            }
        )

    }
    ///////////////////////////////////////////////////
    static setOpenByLayer(ModuleBlock) {

        if (ModuleBlock.dataset.SetOpenModuleBlock != "true") {

            return;
        }
     
        this.OpenModuleTextBox(ModuleBlock);

        this.OpenModuleBlock(ModuleBlock);
       ModuleBlockEditMgr.setCollapse(ModuleBlock, false);


        this.getTargetQuestionOption(ModuleBlock).forEach((Child) => {
            this.OpenModuleBlock(Child);
        });

        ModuleDataFetcherMgr.getAllChilds(ModuleBlock).forEach((Child) => {
            this.OpenModuleBlock(Child);
            
            this.setOpenByLayer(Child);
        });
    }
    ///////////////////////////////////////////////////


    ///////////////////////////////////////////////////
    static OpenModuleTextBox(ModuleBlock) {



        ModuleBlock.querySelectorAll(
            `:scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .textBox  input , 
                        :scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .textBox  textarea`
        ).forEach((input) => {

            if (input.type === "radio" || input.type === "checkbox") {
                return;
            }

            input.disabled = false; // 設定 disabled 狀態

        });


      
    }
    static OpenModuleBlock(ModuleBlock) {

        ModuleBlock.querySelectorAll(
            `:scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .textBox  input[type="radio"], 
             :scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .textBox  input[type="checkbox"]`
        ).forEach((input) => {

            input.disabled = false; // 設定 disabled 狀態
            
        });
    }

    ///////////////////////////////////////////////////
    static getFirstLayerModuleBlocks(ModuleBlock)
    {
       
        var FirstLayers = [];

        //console.warn("ModuleBlock " + ModuleBlock.id + "      " + ModuleBlock.dataset.QuestionMode + "     " + ModuleBlockEditMgr.IsModuleBlock_TableGrid_Open(ModuleBlock));

        // 如果模塊不是表格 也不是問題
        if (!this.IsFirstLayer(ModuleBlock)) {

            var allModuleBlocks = ModuleDataFetcherMgr.getAllChilds(ModuleBlock);

            if (allModuleBlocks.length > 0) {
                allModuleBlocks.forEach((TargetModuleBlock) => {
                    FirstLayers = FirstLayers.concat(this.getFirstLayerModuleBlocks(TargetModuleBlock)); // 展開陣列
                });
            }
            //FirstLayers.push(ModuleBlock);
        }
        else {
            //自己就是第一個
            FirstLayers.push(ModuleBlock);
        }
        return FirstLayers;

    }

    static initFirstLayerModuleBlockAndChild(ModuleBlock) {

        ModuleBlock.querySelectorAll(
            `:scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .textBox  input , 
                        :scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .textBox  textarea`
        ).forEach((input) => {


            if (input.type === "radio" || input.type === "checkbox") {
               
            } else {
                input.disabled = false; // 設定 disabled 狀態
                input.value = ""; // 也不用清空 資料帶不進來 value
            }
        });
      

        //--- 表格 處理
        var allModuleBlocks = ModuleDataFetcherMgr.getAllChilds(ModuleBlock);
        if (allModuleBlocks.length > 0) {
            
            allModuleBlocks.forEach(
                (childModule) => {

                    var SetTargets = childModule.querySelectorAll(
                        `:scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .textBox  input , 
                     :scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .textBox  textarea`
                    )


                    var NeedSet = false;
                    if (SetTargets.length > 0) {

                        SetTargets.forEach((input) => {

                            input.disabled = false; // 設定 disabled 狀態

                            if (input.type === "radio" || input.type === "checkbox") {
                                input.checked = false;
                            } else {
                                input.value = ""; // 也不用清空 資料帶不進來 value
                            }

                            if (!input.classList.contains(ModuleBlockElementMgr.optionCheckboxName)) {

                                NeedSet = true;
                              
                            } 
                        });

                    }


                    if (ModuleBlockEditMgr.IsModuleBlock_TableGrid_Open(ModuleBlock) || NeedSet)
                    {

                        this.initFirstLayerModuleBlockAndChild(childModule);
                    }


                }
            )
        }




        //--- 問題 選項 處理
        var allOptionModuleBlock = this.getTargetQuestionOption(ModuleBlock);

        if (allOptionModuleBlock.length > 0) {
            allOptionModuleBlock.forEach(
                (OptionModuleBlock) => {

                    var CheckBox = ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(OptionModuleBlock);
                    var SetTargets = OptionModuleBlock.querySelectorAll(
                        `:scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .textBox  input , 
                     :scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .textBox  textarea`
                    )

                    if (SetTargets.length > 0) {

                        SetTargets.forEach((input) => {

                            input.disabled = false; // 設定 disabled 狀態

                            if (input.type === "radio" || input.type === "checkbox") {
                                input.checked = false;
                            } else {
                                input.value = ""; // 也不用清空 資料帶不進來 value
                            }
                        });

                    }
                    else {

                        //如果沒有 就在往下一層
                        this.initFirstLayerModuleBlockAndChild(childModule);
                    }



                }
            )

        }


       

    }
    static getTargetQuestionOption(ModuleBlock) {
        // 直接透過 CSS 選擇器篩選符合條件的元素，避免 filter 額外遍歷
        const targetElements = document.querySelectorAll(`.option_checkbox[name="${CSS.escape(ModuleBlock.id)}"]`);

        // 將符合條件的 checkbox 轉換為對應的 ModuleBlock
        return Array.from(targetElements).map(CheckBox => ModuleDataFetcherMgr.GetTargetModuleBlock(CheckBox));
    }



    //static getTargetQuestionOption(ModuleBlock) {

    //    const checkboxes = Array.from(document.querySelectorAll(".option_checkbox")) .filter(el => el.name === ModuleBlock.id);

    //    var OptionModuleBlock = [];

    //    if (checkboxes.length > 0) {
    //        checkboxes.forEach(
    //            (CheckBox) => {

    //                OptionModuleBlock.push(ModuleDataFetcherMgr.GetTargetModuleBlock(CheckBox));
    //            }
    //        )

    //    }

    //    //console.log("getTargetQuestionOption   " + ModuleBlock.id +"    Length   "+checkboxes.length); // 輸出符合條件的元素


    //    return OptionModuleBlock;
    //}


    static IsFirstLayer(ModuleBlock) {


        //是否是問題
        var IsQuestionMode = ModuleBlock.dataset.QuestionMode == "true";

        //是否是表格
        var IsGridMode = ModuleBlockEditMgr.IsModuleBlock_TableGrid_Open(ModuleBlock);

        
        //目標的CheckBox
        var targetCheckBox = ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(ModuleBlock);

        //是否是非題
        var IsBoolMode = targetCheckBox.name.includes("Bool") || targetCheckBox.name.includes("needAnswered");
        //Survey_83_2Bool_1
        //Survey_8_2needAnswered


        //框框被關起來
        var checkboxIsNone = targetCheckBox && targetCheckBox.style.display === "none";

        //是否有其他InputTextarea
        var hasOtherInputTextarea = false;
        
        
        const inputs =  ModuleBlock.querySelectorAll(`:scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .textBox  textarea,
        :scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .textBox  input`
        );

        for (const input of inputs) {

            if (!input.classList.contains(ModuleBlockElementMgr.optionCheckboxName)) {

                hasOtherInputTextarea = true;
                break;
            } 
        }


        var HasTextareaOrInput = hasOtherInputTextarea && checkboxIsNone;
      
        //console.log(`${ModuleBlock.id}_${IsQuestionMode}-${IsGridMode}-${HasTextareaOrInput}   _${checkboxIsNone}  ${hasOtherInputTextarea}` );

        return IsQuestionMode || IsGridMode || HasTextareaOrInput || IsBoolMode; 
    }


    //--------------------------------------------------------------------------------
    static resetAllModuleBlockLabel_Survey(survey) {

        survey.querySelectorAll(".ModuleBlock label").forEach(label => {
            label.style.cursor = "pointer";
        });

    }



    
}


class ResetAllBugOptionEditor {
    //有問題
    static resetAllDivStyle() {
        var labels = document.querySelectorAll("label");
       

        labels.forEach(label => {

            label.style.width = "";
            label.style.height = "";
            //label.style.position = "relative";


            var divs = label.querySelectorAll(`:scope div`); // 找到所有 div
            divs.forEach(div => {
                div.style.width = "100%";
                div.style.height = "100%";
            });

        });
    }

    static resetAllDivStyle_Survey(survey) {
        var labels = survey.querySelectorAll("label");


        labels.forEach(label => {

            label.style.width = "";
            label.style.height = "";
            //label.style.position = "relative";


            var divs = label.querySelectorAll(`:scope div`); // 找到所有 div
            divs.forEach(div => {
                div.style.width = "100%";
                div.style.height = "100%";
            });

        });
    }


    static resetAllBugOptionSet() {

        //找到被關閉選項卻有name的選項
        //把name抓出來
        //把所有該name的name都刪除
        //把沒有name卻有開啟選項的 改成 data-need-answered =true

        let questionNameList = new Set();

        document.querySelectorAll("." + ModuleBlockElementMgr.optionCheckboxName).forEach(
            (optionCheckbox) => {

                //不希望有選項的問題是自己
                var TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(optionCheckbox);
                if (optionCheckbox.name == TargetModuleBlock.id) {
                    TargetModuleBlock.style.backgroundColor = "red";
                    optionCheckbox.removeAttribute("name");
                }



                if (optionCheckbox.style.display == "none") {

                    var TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(optionCheckbox);
                    if (optionCheckbox.name != TargetModuleBlock.id) {

                        //抓取有選項被關閉的name
                        questionNameList.add(optionCheckbox.name); // Set 會自動去除重複值
                    }
                  

                }
            }
        );

        // 如果需要轉回陣列
        let uniqueQuestionNameList = Array.from(questionNameList);

        uniqueQuestionNameList.forEach(

            (name) => {

                document.querySelectorAll(`input[name="${name}"][type="checkbox"], input[name="${name}"][type="radio"]`).forEach
                    ((el) => {

                        //設定成方框
                        el.setAttribute("type", "checkbox");
                        el.removeAttribute("name");

                        let targetBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(el);
                        if (targetBlock) {
                            targetBlock.style.backgroundColor = "red";
                        } else {
                            console.warn("找不到對應的模組區塊:", optionCheckbox);
                        }


                    });

            }
        );

    }

    static resetQuestionListOption() {
        //將所有裡面有選項的模塊 設定為問題模式

        document.querySelectorAll("." + ModuleBlockElementMgr.ModuleBlockName).forEach(
            (ModuleBlock) => {

                ModuleDataFetcherMgr.getAllTableListChilds(ModuleBlock).forEach(

                    (ModuleBlockOption) => {
                        if (ModuleBlockOption.dataset.OptionMode == "true" ||
                            ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(ModuleBlockOption).style.display != "none")
                        {

                            ModuleBlockOption.dataset.OptionMode == "true";
                            ModuleBlock.dataset.QuestionMode == "true";
                            ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(ModuleBlockOption).name = ModuleBlock.id;
                        }

                    }
                );

                if (ModuleBlock.dataset.checkboxType === "radio") {
                    ModuleOptionEditor.SetAllOptionBecome_Radio(ModuleBlock);
                }
                else if (ModuleBlock.dataset.checkboxType === "checkbox") {
                    ModuleOptionEditor.SetAllOptionBecome_CheckBox(ModuleBlock);
                }
                else {
                    console.warn("SetAllOptionBecome_  " + TargetModuleBlock.dataset.checkboxType);
                }
            }
        );


    }

}


class SetCheckBoxActionMgr
{
    static resetCheckBoxAction() {
       
        document.querySelectorAll(".Survey").forEach(
            (survey) => {
                SetCheckBoxActionMgr.resetCheckBoxAction_Survey(survey);
            }
        );
       
    }
    static resetCheckBoxAction_Survey(survey) {
        
        survey.querySelectorAll("." + ModuleBlockElementMgr.optionCheckboxName).forEach(
            (checkbox) => {

                // Checkbox.name
                checkbox.removeEventListener('change', SetCheckBoxActionMgr.CheckBoxChangeAction);
                checkbox.addEventListener('change', SetCheckBoxActionMgr.CheckBoxChangeAction);
            }
        );

    }



    static CheckBoxChangeAction(event) {
        const checkbox = event.target; // 取得被點擊的 checkbox
        
        if (checkbox.style.display == "none") {
            checkbox.checked = !checkbox.checked; // 強制還原狀態，防止變更
            return;
        }



        if (checkbox.type === "radio") {
            // 過濾出同 name 的 radio buttons
            const checkboxes = Array.from(document.querySelectorAll(".option_checkbox"))
                .filter(el => el.name === checkbox.name);

            checkboxes.forEach((otherCheckBox) => {
                if (otherCheckBox !== checkbox) {
                    otherCheckBox.checked = false;

                    const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(otherCheckBox);

                    if (ModuleDataFetcherMgr.getAllChilds(TargetModuleBlock).length > 0) {
                        // 自己摺疊，底下的也要摺疊，並關閉底下的 checkbox
                       ModuleBlockEditMgr.setCollapse(TargetModuleBlock, true);
                    }
                    SetCheckBoxActionMgr.setCloseByLayer(TargetModuleBlock);
                }
            });
        }

        const TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(checkbox);

        if (checkbox.checked) {
            // 解開摺疊
           ModuleBlockEditMgr.setCollapse(TargetModuleBlock, false);
            SetCheckBoxActionMgr.setOpenByLayer(TargetModuleBlock);
        } else {
            if (ModuleDataFetcherMgr.getAllChilds(TargetModuleBlock).length > 0) {
                // 自己摺疊，底下的也要摺疊，並關閉底下的 checkbox
               ModuleBlockEditMgr.setCollapse(TargetModuleBlock, true);
            }
            SetCheckBoxActionMgr.setCloseByLayer(TargetModuleBlock);
        }



        AutoScreen_js.resetAutoScreenBlockSize();
    }

    static setOpenByLayer(ModuleBlock) {

        const checkbox = ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(ModuleBlock);

        var AllChilds = ModuleDataFetcherMgr.getAllChilds(ModuleBlock);

        if ((checkbox.checked == true || checkbox.style.display == "none") && AllChilds.length > 0) {

           ModuleBlockEditMgr.setCollapse(ModuleBlock, false);


      
        }
        if (checkbox.checked == true || checkbox.style.display == "none") {

            //ModuleBlock.style.backgroundColor = "green";
            ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(ModuleBlock)
                .querySelectorAll("input,textarea")
                .forEach(
                    (input) => {

                        if (!input.classList.contains(ModuleBlockElementMgr.optionCheckboxName)) {

                            input.disabled = false;
                        }

                    }
                );
        }
       


        //目標底下的選項
        var AllChilds = ModuleDataFetcherMgr.getAllChilds(ModuleBlock);

        AllChilds.forEach(
            (childModuleBox) => {
                var ModuleBoxCheckBox = ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(childModuleBox);
                if (checkbox.checked == true || checkbox.style.display=="none") {

                    ModuleBoxCheckBox.disabled = false;
                    //childCheckbox.disabled = true;
                    //var childModuleBox = ModuleDataFetcherMgr.GetTargetModuleBlock(childCheckbox);
                    //childModuleBox.style.backgroundColor = "cyan";
                    SetCheckBoxActionMgr.setOpenByLayer(childModuleBox);

                }
            }

        );


        ////////////////////////////////////////////////////////////////////


        //const checkboxes = Array.from(document.querySelectorAll(".option_checkbox")).filter(el => el.name === ModuleBlock.id);

        //if (checkbox.checked == true) {

        //    if (checkboxes.length > 0) {
        //        checkboxes.forEach(
        //            (childCheckbox) => {
        //                childCheckbox.disabled = false;
        //                var childModuleBox = ModuleDataFetcherMgr.GetTargetModuleBlock(childCheckbox);
        //                SetCheckBoxActionMgr.setOpenByLayer(childModuleBox);
        //            }
        //        );
        //    }
        //}
    


    }

    static setCloseByLayer(ModuleBlock) {
     
        const checkbox = ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(ModuleBlock);

        ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(ModuleBlock)
            .querySelectorAll("input,textarea")
            .forEach(
                (input) => {
                    if (!input.classList.contains(ModuleBlockElementMgr.optionCheckboxName)) {

                        input.disabled = true;
                    }
                }
            );


        if (checkbox.checked == false && ModuleDataFetcherMgr.getAllChilds(ModuleBlock).length > 0) {

           ModuleBlockEditMgr.setCollapse(ModuleBlock, true);
        }


        //目標底下的選項


        var AllChilds = ModuleDataFetcherMgr.getAllChilds(ModuleBlock);


        AllChilds.forEach(
            (childModuleBox) => {
                ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(childModuleBox).disabled = true;

                //childCheckbox.disabled = true;

                //var childModuleBox = ModuleDataFetcherMgr.GetTargetModuleBlock(childCheckbox);
               
                SetCheckBoxActionMgr.setCloseByLayer(childModuleBox);
            }

        );


        //const checkboxes = Array.from(document.querySelectorAll(".option_checkbox")).filter(el => el.name === ModuleBlock.id);

        //if (checkboxes.length > 0) {
        //    checkboxes.forEach(
        //        (childCheckbox) => {
        //            childCheckbox.disabled = true;

        //            var childModuleBox = ModuleDataFetcherMgr.GetTargetModuleBlock(childCheckbox);
                    
        //            SetCheckBoxActionMgr.setCloseByLayer(childModuleBox);
        //        }
        //    );
        //}
    

    }
}



class AllQuestionsAnsweredMgr
{

    static isEmptyOrWhitespace(str) {

        return str.trim().length === 0;
    }

    static CheckAllQuestionsAnswered_Survey(Survey) {

        Survey.querySelectorAll(".ModuleBlock").forEach(
            (ModuleBlock) => {
                //ModuleBlock.style.backgroundColor = "";

                ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(ModuleBlock).style.backgroundColor = "";
            }
        );

        const targets = Survey.querySelectorAll(
            ` .${ModuleBlockElementMgr.ModuleBlock_innerName} > .textBox  input , 
              .${ModuleBlockElementMgr.ModuleBlock_innerName} > .textBox  textarea
            `
        );

        const Question_NotYetCompleted_Set = new Set();

        const ModuleBlock_NotYetCompleted_Set = new Set();

        const All_NotYetCompleted_Set = new Set();


        targets.forEach(
            (target) => {
                var TargetModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(target);
                if (target.type === "radio" || target.type === "checkbox") {

                    //如果是 核選框 而且有顯示  並且 沒有關閉
                    //抓取所有可以選的選項
                    if (target.classList.contains(ModuleBlockElementMgr.optionCheckboxName) && target.style.display != "none" && !target.disabled) {

                        var targetName = target.name.match(/ModuleBlock_\d+/);

                        console.log(target.name +"----------------  "+targetName);

                        //Survey_2_2ModuleBlock_2
                        Question_NotYetCompleted_Set.add(targetName);
                        All_NotYetCompleted_Set.add(targetName);
                    }
                }
                else {

                    if (target.tagName != "TEXTAREA" && target.style.display != "none" && !target.disabled && AllQuestionsAnsweredMgr.isEmptyOrWhitespace(target.value)) {

                        ModuleBlock_NotYetCompleted_Set.add(TargetModuleBlock.id);

                    }
                }

                //文字框

                if (target.tagName == "TEXTAREA" && !target.disabled && TargetModuleBlock.dataset.QuestionMode == "true") {

                    if (TargetModuleBlock.parentNode && AllQuestionsAnsweredMgr.isEmptyOrWhitespace(target.value)) {

                        var parentModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(TargetModuleBlock.parentNode);
                        //
                        while (parentModuleBlock) {
                            var PID = parentModuleBlock.id;
                            var ID = TargetModuleBlock.id;
                            if (parentModuleBlock.dataset.GridMode == "true") {
                                ModuleBlock_NotYetCompleted_Set.add(ID);
                                parentModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(parentModuleBlock.parentNode);
                            }
                            else {
                                parentModuleBlock = null;
                            }
                        }
                    }


                }


            }
        )



        let All_QuestionName_List = Array.from(Question_NotYetCompleted_Set);

        let All_NotYetCompleted_List = Array.from(All_NotYetCompleted_Set);

        let All_ModuleBlock_List = Array.from(ModuleBlock_NotYetCompleted_Set);

        /////////////////////////////////////////////////////////////////////////
        console.log("-----------------------------------------------------------------------------------------------")
        All_ModuleBlock_List.forEach(
            (id) => {

                if (id && id.trim()) {  // 確保 id 不是空字串或空白
                    var targetBlock = Survey.querySelector(`#${CSS.escape(id)}`);
                    console.log("---" + Survey.id)
                    if (targetBlock) {
                        //targetBlock.style.backgroundColor = "red";

                        const checkbox = ModuleDataFetcherMgr.GetTargetModuleBlock_CheckBox(targetBlock);

                        if ((checkbox.checked == true || checkbox.style.display == "none")) {
                            ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(targetBlock).style.backgroundColor = "red";
                        }


                        targetBlock.dataset.QuestionMode == true
                    }
                    else {

                    }
                } else {
                    console.warn("Invalid ID:", id);  // 記錄錯誤，方便偵錯
                }


            }
        )

        All_QuestionName_List.forEach(
            (QuestionName) => {
                //console.error(Survey.id + QuestionName);
                if (AllQuestionsAnsweredMgr.getCheckboxValues(Survey.id+QuestionName)) {

                    //已經作答
                    //console.error(QuestionName + "-有Values-");
                }
                else {
                    //還沒作答
                    //console.error(target.id + "-有Values-");
                    var target = Survey.querySelector(`#${CSS.escape(QuestionName)}`);
                  
                    if (target) {

                        ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(target).style.backgroundColor = "#ff0084";
                        //target.style.backgroundColor = "#ff0084";
                        //console.error(QuestionName + "-設定成紅色-");
                    }

                }
            }

        )


    }


    static CheckAllQuestionsAnswered() {

        document.querySelectorAll(".Survey").forEach(
            (Survey) => {
                AllQuestionsAnsweredMgr.CheckAllQuestionsAnswered_Survey(Survey);          
            }
        );
    }

    static checkTextareaAnswered(targetBlock) {

       // let target = querySelector.querySelector(""+ QuestionName);
       //// "input,textarea"

       // let selectedOptions = $(`input,`).map(function () {
       //     return this.value;
       // }).get();
       // if (selectedOptions.length > 0) {
       //     //alert("選中的答案是：" + selectedOptions.join(", "));
       //     return true;
       // } else {
       //     //alert("尚未選擇任何答案");
       //     return false;
       // }
    }

    static getCheckboxValues(QuestionName) {
        if (!QuestionName || /[#."'\[\]]/.test(QuestionName)) {
            console.warn(`getCheckboxValues: Invalid QuestionName "${QuestionName}"`);
            return false;
        }

        let selector = `input[name="${CSS.escape(QuestionName)}"]:checked`;
        console.log("Using selector:", selector); // 確保選擇器正確

        let selectedOptions = $(selector).map(function () {
            return this.value;
        }).get();

        return selectedOptions.length > 0;
    }



}



class SaveAndLoadAnswerMgr
{
    static NotesMtNum = "";
    static StageMtNum = 0;

    

    static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


    static async loadAllSurveysInBatches(_surveyHtmlDataList) {
        // 先預載
        for (const item of _surveyHtmlDataList) {
            try {
                const {
                    pcb_category: PCB_Category,
                    station: Station,
                    suffix: Suffix,
                    pageNum: PageNum,
                    id: SurveyId,
                    value: Version
                } = item;

                await SaveAndLoadAnswerMgr.LoadSurvey(
                    PCB_Category, Station, Suffix, PageNum, "", "", SurveyId, Version, false
                );
            } catch (error) {
                console.error(error);
            }
        }

        // 任務轉成 async 函數陣列
        const tasks = _surveyHtmlDataList.map((item) => {
            return async () => {
                try {
                    const {
                        pcb_category: PCB_Category,
                        station: Station,
                        suffix: Suffix,
                        pageNum: PageNum,
                        documentId: DocumentId,
                        html: htmlContent,
                        id: SurveyId,
                        value: Version,
                        ansJson: AnsJson,
                        images: Images
                    } = item;

                    const _Survey = await SaveAndLoadAnswerMgr.LoadSurvey(
                        PCB_Category, Station, Suffix, PageNum, DocumentId, htmlContent, SurveyId, Version, true
                    );

                    await SaveAndLoadAnswerMgr.loadAnswerImages(
                        SaveAndLoadAnswerMgr.NotesMtNum, SurveyId, Version, SaveAndLoadAnswerMgr.StageMtNum
                    );

                    const SurveyName = `Survey_${SurveyId}_${Version}`;
                    const SurvryAnswerData = { SurveyId: SurveyName };

                    if (AnsJson && AnsJson.trim() !== "") {
                        try {
                            SurvryAnswerData.AnswerDataList = JSON.parse(AnsJson);
                            SaveAndLoadAnswerMgr.AnswerDataList.push(SurvryAnswerData);
                        } catch (error) {
                            console.error(`❌ JSON parsing error for SurveyId=${SurveyId}:`, error);
                        }
                    }

                    await SaveAndLoadAnswerMgr.resetInputName(_Survey);
                    await ResetActionMgr.resetAction_Survey(_Survey);
                    await SaveAndLoadAnswerMgr.setFakeLabel(_Survey);
                    await SaveAndLoadAnswerMgr.loadAnswerOpen_Survey(_Survey);

                    _Survey.querySelectorAll(".ModuleBlock").forEach((ModuleBlock) => {
                        ModuleBlock.style.backgroundColor = "";
                        ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(ModuleBlock).style.backgroundColor = "";
                    });

                    AutoScreen_js.resetAutoScreenBlockSize();
                    await SaveAndLoadAnswerMgr.delay(10);

                } catch (error) {
                    console.error(error);
                }
            };
        });

        // 👉 使用限制並發的執行器
        await SaveAndLoadAnswerMgr.runWithConcurrencyLimit(tasks, 1); // 可調整數字 5 為你想要的最大併發數量

        AutoScreen_js.resetAutoScreenBlockSize();
        console.log('✅ 所有數據已處理完成');
    }

    static async  runWithConcurrencyLimit(tasks, limit = 5) {
          const results = [];
          let running = 0;
          let currentIndex = 0;

          return new Promise((resolve, reject) => {
              const next = () => {
                  if (currentIndex >= tasks.length && running === 0) {
                      return resolve(results);
                  }

                  while (running < limit && currentIndex < tasks.length) {
                      const taskIndex = currentIndex++;
                      const task = tasks[taskIndex];

                      running++;
                      task().then((result) => {
                          results[taskIndex] = result;
                          running--;
                          next();
                      }).catch((err) => {
                          console.error('❌ Task error:', err);
                          running--;
                          next();
                      });
                  }
              };

              next();
          });
     }


    //01
    static resetInputName(servey) {
        const checkBoxs = servey.querySelectorAll('input[type="radio"] , input[type="checkBox"]');

        checkBoxs.forEach(checkBox => {

            if (checkBox.name != "") {
                checkBox.name = servey.id + checkBox.name;
            }
        }
        )



        const option_checkboxS = servey.querySelectorAll('.option_checkbox');
        //option_checkbox
        //Survey_1_4ModuleBlock_91

        //Opt_126
        //Survey_29_2ModuleBlock_4
        option_checkboxS.forEach(option_checkbox => {

          
            }
        )


    }


    //03
    static setFakeLabel(_survey) {

        if (!_survey) {
            console.error("setFakeLabel" + _survey.id);
            return;
        }

        const labels = _survey.querySelectorAll('label');

        labels.forEach(label => {
            //var _survey = label.closest(".Survey"); // 找到最近的 .Survey 容器

            const div = document.createElement('div');

            div.classList.add("fakeLabels");
            div.innerHTML = label.innerHTML;


            var targetBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(label);

            var textBox = ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(targetBlock);

            ////////////////////////////////////////////
            const targetId = label.getAttribute('for');
            if (targetId) {
                var surveyName = _survey ? _survey.id : null; // 防止 _survey 為 null
                if (surveyName) {

                    //div
                    if (textBox) {
                        textBox.onclick = function (event) {
                           
                            if (event.target.tagName !== "INPUT") {
                                var targetElement = _survey.querySelector("#" + targetId);
                                if (targetElement) {
                                    targetElement.click();
                                }
                            }


                        };
                    }
                    else {
                        console.error("失敗");
                    }


                }
            }
            ////////////////////////////////////////////
            //textBox.append(div);
            label.parentNode.replaceChild(div, label);
        });
    }

    //-----------------------------------------------------------

    static async loopSave() {
        console.warn("===   loopSave  ===");
        await SaveAndLoadAnswerMgr.AwaitSaveAnswer();
        setTimeout(SaveAndLoadAnswerMgr.loopSave, 60000); // 等 60 秒再跑下一次
    }
    static async LoadAllSurvey(mtNum, stage, _surveyHtmlDataList) {

        SaveAndLoadAnswerMgr.NotesMtNum = mtNum;
        SaveAndLoadAnswerMgr.StageMtNum = stage;

        // 讀取答案用的列表
        SaveAndLoadAnswerMgr.AnswerDataList = [];


        await SaveAndLoadAnswerMgr.loadAllSurveysInBatches(_surveyHtmlDataList);

        SaveAndLoadAnswerMgr.loopSave();
    }

    static CloseSurvey(event) {
      
        event.stopPropagation();

        var Survey = event.target.closest(".Survey");

        //Survey.dataset.Collapse = Survey.dataset.Collapse === "true" ? "false" : "true";

        var Survey_Inner = Survey.querySelector(".Survey_Inner");
        var TailBar = Survey.querySelector(".TailBar");

       

        //console.warn(`CloseSurvey - ${Survey.id}   ${event.target.checked}`);
        if (!event.target.checked) {

            Survey.querySelectorAll(
                `.textBox  input ,
             .textBox  textarea`
            ).forEach((input) => {
                input.disabled = true;
            });

        }
        else {

            ModuleBlockEditMgr.setCollapseType_survey(Survey, true)
            SurveyAnswerModeEditor.resetSurveyFirstLayer(Survey);

            Survey.querySelectorAll(".ModuleBlock").forEach(
                (ModuleBlock) => {
                    ModuleBlock.style.backgroundColor = "";
                    ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(ModuleBlock).style.backgroundColor = "";
                }
            );

            Survey.querySelectorAll(
                `.textBox  input `
            ).forEach((input) => {
                //input.disabled = true;

                if (input.checked) {
                    input.checked = false;
                    input.click();
                }

            });

            SaveAndLoadAnswerMgr.loadAnswerData_Survey(Survey);

        }


        var switchCollapse = event.target.checked+"" === "true" ? "false" : "true";
        SaveAndLoadAnswerMgr.CollapseIconAction(Survey, switchCollapse);

        AutoScreen_js.resetAutoScreenBlockSize();
    }
    static CollapseIconAction_Event(event) {

        event.stopPropagation();

        var Survey = event.target.closest(".Survey");

        var switchCollapse = Survey.dataset.Collapse === "true" ? "false" : "true";

        SaveAndLoadAnswerMgr.CollapseIconAction(Survey,switchCollapse);
    }

    static CollapseIconAction(Survey, IsCollapse) {

        

        var collapseIcon = Survey.querySelector(".collapse-icon > i");

        Survey.dataset.Collapse = IsCollapse;
       // Survey.dataset.Collapse = Survey.dataset.Collapse === "true" ? "false" : "true";

        collapseIcon.classList.remove("bi-chevron-down");
        collapseIcon.classList.remove("bi-chevron-up");

        //----------------------------------------------
        var Survey_Inner = Survey.querySelector(".Survey_Inner");
        var TailBar = Survey.querySelector(".TailBar");

        if (IsCollapse =="true") {
            Survey_Inner.style.display = "none";
            TailBar.style.display = "none";

            collapseIcon.classList.add("bi-chevron-down");
        }
        else {
            Survey_Inner.style.display = "";
            TailBar.style.display = "";


            collapseIcon.classList.add("bi-chevron-up");
        }

        AutoScreen_js.resetAutoScreenBlockSize();
    }




    //PCB_Category  Station Suffix  PageNum  DocumentId
    //硬板 PNL 後綴 頁數 文件編號
    static LoadSurvey(PCB_Category, Station, Suffix, PageNum, DocumentId, htmlContent, SurveyId, Version, needTailBar ) {

        var SurveyName = `Survey_${SurveyId}_${Version}`;

        var SurveyText = `${SaveAndLoadAnswerMgr.NotesMtNum} : ${PCB_Category}_${Station}_${Suffix}_第${PageNum}頁`; 


        var Survey = document.querySelector(`#${SurveyName}`);

    
        if (Survey) {
            Survey.innerHTML = "";
        }
        else {
           


            Survey = document.createElement("div");
            Survey.classList.add("Survey");
            Survey.id = SurveyName;
            var AutoScreen = document.querySelector("#AutoScreen");
            AutoScreen.appendChild(Survey);
            
        }
            Survey.dataset.station = `${Station}`;
            Survey.dataset.suffix = `${Suffix}`;
            Survey.dataset.pageNum = `${PageNum}`

            // 產生問卷開頭區塊
            let SurvryBar = document.createElement("div");

            SurvryBar.classList.add("SurvryBar");

            var SurveyName = `SurveyID :  ${SurveyId}   Version :  ${Version}`; 
            //頭    分類 種類:硬板 站別:一課 頁數:5 料號:zda456465
            //尾    文件編號

            Survey.appendChild(SurvryBar);
        /////////////////////////////////////////////////////////

        var SurveyInput = document.createElement("input");
          SurveyInput.id = "Input_" + Survey.id;
          SurveyInput.type = "checkbox";
          SurveyInput.classList.add("Input_Check");
          SurveyInput.style.width = "10px";
          SurveyInput.addEventListener("click", SaveAndLoadAnswerMgr.CloseSurvey);
        //--------------------------------------------------------
        var SurvryNameBar = document.createElement("div");

        // 先把勾選框加到 SurvryNameBar
        SurvryNameBar.appendChild(SurveyInput);

        // 加入文字
        var SurveyTextNode = document.createTextNode(SurveyText);
        SurvryNameBar.appendChild(SurveyTextNode);

        SurvryNameBar.style.width = "100%";
        SurvryNameBar.style.textAlign = "center";

        SurvryBar.appendChild(SurvryNameBar);
        //--------------------------------------------------------
        var collapseIcon = document.createElement("span");
        collapseIcon.classList.add("collapse-icon");
        collapseIcon.style.cursor = "pointer";
        // 設定絕對定位，置於右側並置中垂直
        collapseIcon.style.fontSize = "8px";
        collapseIcon.innerHTML = `<i class="bi bi-chevron-down"></i>`;
        SurvryBar.appendChild(collapseIcon);

        // 點擊圖示也能切換（模擬下方按鈕點擊）
        collapseIcon.addEventListener("click", SaveAndLoadAnswerMgr.CollapseIconAction_Event);

        
        /////////////////////////////////////////////////////////


        var SurveyInner = document.createElement("div");
        SurveyInner.classList.add("Survey_Inner");

        //console.log(htmlContent);
        // 1) 用 <div> 解析 HTML
        const tempWrapper = document.createElement("div");
        tempWrapper.innerHTML = htmlContent;
        document.body.appendChild(tempWrapper);

        // 2) 選取所有 .ModuleBlock
        let allBlocks =[];
        if (tempWrapper.querySelector("#AutoScreen")) {
            allBlocks = Array.from(tempWrapper.querySelectorAll("#AutoScreen > .ModuleBlock"));
        }
        else {
             allBlocks = Array.from(tempWrapper.querySelectorAll(":scope > .ModuleBlock"));
        }
     


        // 3) 使用 DocumentFragment 提高效能
        const fragment = document.createDocumentFragment();
        allBlocks.forEach((Block) => fragment.appendChild(Block));

   


        // 4) 一次性插入 Survry
        SurveyInner.appendChild(fragment);


        Survey.appendChild(SurveyInner);


        const allInners = Survey.getElementsByClassName(ModuleBlockElementMgr.ModuleBlock_innerName);
        Array.from(allInners).forEach(MB_inner => {
            MB_inner.style.borderLeft = '';
        });


        if (needTailBar) {
            // 新增：載入尾Bar，並傳入文件編號
            let tailBar = SaveAndLoadAnswerMgr.LoadTailBar(DocumentId);
            Survey.appendChild(tailBar);
        }
     

        // SurveyInput.click();
        // 5) 重新設定尺寸
        //AutoScreen_js.resetAutoScreenBlockSize();
        return Survey;
    }

    // 新增：根據 NtNum、SurveyId、Version、Stage 從後端取得答案圖片資料，並載入到對應問卷尾部（TailBarRow2）
    static loadAnswerImages(ntNum, surveyId, version, stage) {
        // 呼叫後端 API 取得圖片資料（請根據您的 API 路徑與參數調整 URL）
        fetch(`/Customer/SurveyEdit/GetAnswerImages?ntNum=${encodeURIComponent(ntNum)}&surveyId=${encodeURIComponent(surveyId)}&version=${version}&stage=${stage}`)
            .then(response => response.json())
            .then(result => {
                if (result.success && result.data && result.data.length > 0) {
                    // 組合問卷區塊的 id，依照 "Survey_{SurveyId}_{Version}"
                    let surveyElementId = `Survey_${surveyId}_${version}`;
                    let surveyElement = document.querySelector(`#${surveyElementId}`);
                    if (!surveyElement) {
                        console.warn("無法找到問卷元素, id:", surveyElementId);
                        return;
                    }
                    let tailBarRow2 = surveyElement.querySelector(".TailBarRow2");
                    if (!tailBarRow2) {
                        console.warn("無法找到 TailBarRow2 容器於問卷:", surveyElementId);
                        return;
                    }
                    // 逐一處理每筆圖片資料
                    result.data.forEach(imgObj => {
                        // imgObj 可能傳回 { imageUrl, width, height } 或 { src, width, height }
                        let imageUrl = imgObj.imageUrl || imgObj.src;
                        if (!imageUrl) return;
                        // 建立圖片容器
                        let imgContainer = document.createElement("div");
                        imgContainer.classList.add("UploadedImageContainer");
                        // 設定使用者調整後的尺寸，若沒有則預設 200px
                        imgContainer.style.width = imgObj.width || "200px";
                        imgContainer.style.height = imgObj.height || "200px";

                        // 建立 img 元素，設定來源
                        let img = document.createElement("img");
                        img.src = imageUrl;
                        img.style.width = "100%";
                        img.style.height = "100%";
                        img.style.display = "block";
                        img.style.margin = "auto";
                        imgContainer.appendChild(img);

                        // 綁定點擊事件：點選時切換選取狀態，並依據狀態新增或移除拖曳手柄
                        imgContainer.addEventListener("click", function (e) {
                            imgContainer.classList.toggle("selected");
                            if (imgContainer.classList.contains("selected")) {
                                SaveAndLoadAnswerMgr.addResizeHandles(imgContainer);
                            } else {
                                SaveAndLoadAnswerMgr.removeResizeHandles(imgContainer);
                            }
                            e.stopPropagation();
                        });

                        // 建立控制區塊（上移、下移、刪除按鈕）
                        let arrowContainer = document.createElement("div");
                        arrowContainer.classList.add("ArrowContainer");

                        // 上移按鈕
                        let upBtn = document.createElement("button");
                        upBtn.innerHTML = "↑";
                        upBtn.classList.add("ArrowBtn", "ArrowUp");
                        upBtn.title = "上移圖片";
                        upBtn.style.backgroundColor = "rgba(193,211,177,0.95)";
                        upBtn.style.border = "none";
                        upBtn.style.color = "white";
                        upBtn.addEventListener("mouseover", function () {
                            upBtn.style.transform = "scale(1.25)";
                        });
                        upBtn.addEventListener("mouseout", function () {
                            upBtn.style.transform = "scale(1)";
                        });
                        upBtn.addEventListener("click", function (e) {
                            e.stopPropagation();
                            let prev = imgContainer.previousElementSibling;
                            if (prev) {
                                tailBarRow2.insertBefore(imgContainer, prev);
                            }
                        });

                        // 下移按鈕
                        let downBtn = document.createElement("button");
                        downBtn.innerHTML = "↓";
                        downBtn.classList.add("ArrowBtn", "ArrowDown");
                        downBtn.title = "下移圖片";
                        downBtn.style.backgroundColor = "rgba(193,211,177,0.95)";
                        downBtn.style.border = "none";
                        downBtn.style.color = "white";
                        downBtn.addEventListener("mouseover", function () {
                            downBtn.style.transform = "scale(1.25)";
                        });
                        downBtn.addEventListener("mouseout", function () {
                            downBtn.style.transform = "scale(1)";
                        });
                        downBtn.addEventListener("click", function (e) {
                            e.stopPropagation();
                            let next = imgContainer.nextElementSibling;
                            if (next) {
                                tailBarRow2.insertBefore(next, imgContainer);
                            }
                        });

                        // 刪除按鈕
                        let deleteBtn = document.createElement("button");
                        deleteBtn.innerHTML = "✖";
                        deleteBtn.classList.add("ArrowBtn", "ArrowDelete");
                        deleteBtn.title = "刪除圖片";
                        deleteBtn.style.backgroundColor = "rgba(193,211,177,0.95)";
                        deleteBtn.style.border = "none";
                        deleteBtn.style.color = "white";
                        deleteBtn.addEventListener("mouseover", function () {
                            deleteBtn.style.transform = "scale(1.25)";
                        });
                        deleteBtn.addEventListener("mouseout", function () {
                            deleteBtn.style.transform = "scale(1)";
                        });
                        deleteBtn.addEventListener("click", function (e) {
                            e.stopPropagation();
                            imgContainer.remove();
                        });

                        arrowContainer.appendChild(upBtn);
                        arrowContainer.appendChild(downBtn);
                        arrowContainer.appendChild(deleteBtn);
                        imgContainer.appendChild(arrowContainer);

                        // 將圖片容器加入 TailBarRow2
                        tailBarRow2.appendChild(imgContainer);
                    });
                } else {
                    console.warn("取得答案圖片資料失敗或資料為空。");
                }
            })
            .catch(err => {
                console.error("取得答案圖片錯誤:", err);
            });
    }




    //===========LoadTailBar相關函式=================================================================================================
    // =================== 調整大小相關 static 變數 ===================
    static currentHandle = null;
    static origWidth = 0;
    static origHeight = 0;
    static origX = 0;
    static origY = 0;
    static origMouseX = 0;
    static origMouseY = 0;

    // =================== 將調整大小函數改為 static ===================
    static addResizeHandles(container) {
        // 若已存在手柄，則不重複新增
        if (container.querySelectorAll(".resize-handle").length > 0) return;
        const positions = [
            { class: "handle-tl", cursor: "nwse-resize" },
            { class: "handle-tr", cursor: "nesw-resize" },
            { class: "handle-bl", cursor: "nesw-resize" },
            { class: "handle-br", cursor: "nwse-resize" }
        ];
        positions.forEach(pos => {
            let handle = document.createElement("div");
            handle.classList.add("resize-handle", pos.class);
            handle.style.cursor = pos.cursor;
            // 綁定 static initResize 方法
            handle.addEventListener("mousedown", SaveAndLoadAnswerMgr.initResize, false);
            container.appendChild(handle);
        });
    }

    static removeResizeHandles(container) {
        container.querySelectorAll(".resize-handle").forEach(handle => handle.remove());
    }

    static initResize(e) {
        e.stopPropagation();
        SaveAndLoadAnswerMgr.currentHandle = e.target;
        let container = SaveAndLoadAnswerMgr.currentHandle.parentElement;
        SaveAndLoadAnswerMgr.origWidth = container.offsetWidth;
        SaveAndLoadAnswerMgr.origHeight = container.offsetHeight;
        SaveAndLoadAnswerMgr.origX = container.offsetLeft;
        SaveAndLoadAnswerMgr.origY = container.offsetTop;
        SaveAndLoadAnswerMgr.origMouseX = e.clientX;
        SaveAndLoadAnswerMgr.origMouseY = e.clientY;
        document.addEventListener("mousemove", SaveAndLoadAnswerMgr.resize, false);
        document.addEventListener("mouseup", SaveAndLoadAnswerMgr.stopResize, false);
    }

    static resize(e) {
        if (!SaveAndLoadAnswerMgr.currentHandle) return;
        let container = SaveAndLoadAnswerMgr.currentHandle.parentElement;
        let dx = e.clientX - SaveAndLoadAnswerMgr.origMouseX;
        let dy = e.clientY - SaveAndLoadAnswerMgr.origMouseY;

        // 設定最小尺寸與最大尺寸（可依需求調整）
        const minWidth = 50;    // 最小寬度 50px
        const minHeight = 50;   // 最小高度 50px
        const maxWidth = 720;   // 最大寬度 720px
        const maxHeight = 800;  // 最大高度 800px

        let newWidth, newHeight;
        if (SaveAndLoadAnswerMgr.currentHandle.classList.contains("handle-tl")) {
            newWidth = SaveAndLoadAnswerMgr.origWidth - dx;
            newHeight = SaveAndLoadAnswerMgr.origHeight - dy;
        } else if (SaveAndLoadAnswerMgr.currentHandle.classList.contains("handle-tr")) {
            newWidth = SaveAndLoadAnswerMgr.origWidth + dx;
            newHeight = SaveAndLoadAnswerMgr.origHeight - dy;
        } else if (SaveAndLoadAnswerMgr.currentHandle.classList.contains("handle-bl")) {
            newWidth = SaveAndLoadAnswerMgr.origWidth - dx;
            newHeight = SaveAndLoadAnswerMgr.origHeight + dy;
        } else if (SaveAndLoadAnswerMgr.currentHandle.classList.contains("handle-br")) {
            newWidth = SaveAndLoadAnswerMgr.origWidth + dx;
            newHeight = SaveAndLoadAnswerMgr.origHeight + dy;
        }

        // 限制 newWidth 與 newHeight 在 min 與 max 範圍內
        newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
        newHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));

        container.style.width = newWidth + "px";
        container.style.height = newHeight + "px";

        // 同步更新內部圖片尺寸
        let img = container.querySelector("img");
        if (img) {
            img.style.width = container.style.width;
            img.style.height = container.style.height;
        }

        // 重新設定尺寸
        AutoScreen_js.resetAutoScreenBlockSize();
    }

    static stopResize(e) {
        document.removeEventListener("mousemove", SaveAndLoadAnswerMgr.resize, false);
        document.removeEventListener("mouseup", SaveAndLoadAnswerMgr.stopResize, false);
        SaveAndLoadAnswerMgr.currentHandle = null;
    }

    // =================== LoadTailBar 函數（含圖片上傳與排序、點選圖片可顯示拖曳手柄） ===================
    static LoadTailBar(documentId) {


        // 建立尾Bar主容器
        let tailBar = document.createElement("div");
        tailBar.classList.add("TailBar");

        // 建立第一列：左側顯示文件編號，右側上傳圖片按鈕
        let row1 = document.createElement("div");
        row1.classList.add("TailBarRow1");

        let docSpan = document.createElement("span");
        docSpan.innerText = `${SaveAndLoadAnswerMgr.NotesMtNum} : 文件編號: ` + documentId;
        row1.appendChild(docSpan);

        let uploadBtn = document.createElement("button");
        uploadBtn.classList.add("UploadImageBtn");
        uploadBtn.innerHTML = '<i class="bi bi-upload"></i>';
        row1.appendChild(uploadBtn);

        // 隱藏檔案輸入元件
        let fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.multiple = true;
        fileInput.style.display = "none";

        // 建立第二列：圖片預覽區
        let row2 = document.createElement("div");
        row2.classList.add("TailBarRow2");

        tailBar.appendChild(row1);
        tailBar.appendChild(row2);
        tailBar.appendChild(fileInput);

        uploadBtn.addEventListener("click", function () {
            fileInput.click();
        });

        fileInput.addEventListener("change", function (event) {
            Array.from(fileInput.files).forEach(file => {
                // 使用 FormData 將檔案上傳到後端
                let formData = new FormData();
                formData.append("file", file);
                fetch('/Customer/SurveyEdit/UploadAnswerImage', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.json())
                    .then(result => {
                        if (result.success) {
                            // 建立圖片容器
                            let imgContainer = document.createElement("div");
                            imgContainer.classList.add("UploadedImageContainer");
                            imgContainer.style.width = "200px";
                            imgContainer.style.height = "200px";

                            // 點選圖片容器切換選取狀態並新增/移除拖曳手柄
                            imgContainer.addEventListener("click", function (e) {
                                imgContainer.classList.toggle("selected");
                                if (imgContainer.classList.contains("selected")) {
                                    SaveAndLoadAnswerMgr.addResizeHandles(imgContainer);
                                } else {
                                    SaveAndLoadAnswerMgr.removeResizeHandles(imgContainer);
                                }
                                e.stopPropagation();
                            });

                            // 建立 img 元素，使用後端回傳的圖片 URL
                            let img = document.createElement("img");
                            img.src = result.imageUrl;
                            img.style.width = "100%";
                            img.style.height = "100%";
                            img.style.display = "block";
                            img.style.margin = "auto";
                            imgContainer.appendChild(img);

                            // 建立控制區塊（箭頭與刪除按鈕）
                            let arrowContainer = document.createElement("div");
                            arrowContainer.classList.add("ArrowContainer");

                            // 上移按鈕
                            let upBtn = document.createElement("button");
                            upBtn.innerHTML = "↑";
                            upBtn.classList.add("ArrowBtn", "ArrowUp");
                            upBtn.title = "上移圖片";
                            upBtn.style.backgroundColor = "rgba(193,211,177,0.95)";
                            upBtn.style.border = "none";
                            upBtn.style.color = "white";
                            upBtn.addEventListener("mouseover", function () {
                                upBtn.style.transform = "scale(1.25)";
                            });
                            upBtn.addEventListener("mouseout", function () {
                                upBtn.style.transform = "scale(1)";
                            });
                            upBtn.addEventListener("click", function (e) {
                                e.stopPropagation();
                                let prev = imgContainer.previousElementSibling;
                                if (prev) {
                                    row2.insertBefore(imgContainer, prev);
                                }
                            });

                            // 下移按鈕
                            let downBtn = document.createElement("button");
                            downBtn.innerHTML = "↓";
                            downBtn.classList.add("ArrowBtn", "ArrowDown");
                            downBtn.title = "下移圖片";
                            downBtn.style.backgroundColor = "rgba(193,211,177,0.95)";
                            downBtn.style.border = "none";
                            downBtn.style.color = "white";
                            downBtn.addEventListener("mouseover", function () {
                                downBtn.style.transform = "scale(1.25)";
                            });
                            downBtn.addEventListener("mouseout", function () {
                                downBtn.style.transform = "scale(1)";
                            });
                            downBtn.addEventListener("click", function (e) {
                                e.stopPropagation();
                                let next = imgContainer.nextElementSibling;
                                if (next) {
                                    row2.insertBefore(next, imgContainer);
                                }
                            });

                            // 刪除按鈕
                            let deleteBtn = document.createElement("button");
                            deleteBtn.innerHTML = "✖";
                            deleteBtn.classList.add("ArrowBtn", "ArrowDelete");
                            deleteBtn.title = "刪除圖片";
                            deleteBtn.style.backgroundColor = "rgba(193,211,177,0.95)";
                            deleteBtn.style.border = "none";
                            deleteBtn.style.color = "white";
                            deleteBtn.addEventListener("mouseover", function () {
                                deleteBtn.style.transform = "scale(1.25)";
                            });
                            deleteBtn.addEventListener("mouseout", function () {
                                deleteBtn.style.transform = "scale(1)";
                            });
                            deleteBtn.addEventListener("click", function (e) {
                                e.stopPropagation();
                                // 移除該圖片容器
                                imgContainer.remove();
                            });

                            // 將按鈕依序加入控制區塊，再加入圖片容器
                            arrowContainer.appendChild(upBtn);
                            arrowContainer.appendChild(downBtn);
                            arrowContainer.appendChild(deleteBtn);
                            imgContainer.appendChild(arrowContainer);

                            // 將圖片容器加入 row2（圖片預覽區）
                            row2.appendChild(imgContainer);

                            // 重置尺寸（依需求調整）
                            AutoScreen_js.resetAutoScreenBlockSize();
                        } else {
                            alert("圖片上傳失敗：" + result.message);
                        }
                    })
                    .catch(err => {
                        console.error("UploadAnswerImage 錯誤：", err);
                        alert("圖片上傳發生錯誤：" + err.message);
                    });
            });
            fileInput.value = "";
        });



        return tailBar;
    }
   



//=====================================================================================================

    static AnswerDataList = [];

   
    //main
    static async saveAnswer() {

        await SaveAndLoadAnswerMgr.AwaitSaveAnswer();


       
        alert("-儲存成功-  " );
    }

    static AwaitSaveAnswer() {
        console.warn("SaveAnswer");

        SaveAndLoadAnswerMgr.AnswerDataList = [];

       // SaveAndLoadAnswerMgr.setInputAnswerId();


        document.querySelectorAll(".Survey").forEach(
            (Survey) => {

                var AnswerData = SaveAndLoadAnswerMgr.GetSaveAnswerDataBySurvey(Survey)



                SaveAndLoadAnswerMgr.AnswerDataList.push(AnswerData);
            }

        );

        //SaveAndLoadAnswerMgr.ClearAllAnswer();


        SaveAndLoadAnswerMgr.SaveJsonToDB()

    }


    static GetSaveAnswerDataBySurvey(Survey) {


      /*  var Survey = document.querySelector(`#${SurveyID}`);*/

        var SurveyAnswerData = {};

        SurveyAnswerData.SurveyId = Survey.id;
        //------------------------------------
        SurveyAnswerData.AnswerDataList = [];

        //------------------------------------
        var AnswerData_survey = {};
        var Input_Check = Survey.querySelector(".Input_Check");

        AnswerData_survey.id = Input_Check.id;
        AnswerData_survey.checked = Input_Check.checked;

        //console.warn(AnswerData_survey);
        //-
     
        AnswerData_survey.value = "";
        AnswerData_survey.disabled = false;
        //-
        SurveyAnswerData.AnswerDataList.push(AnswerData_survey);


        //-----------------------------------------------

        var InSurveyInputData = Survey.querySelectorAll(".textBox input, .textBox textarea");


        console.log(`獲取答案數據 : ${Survey.id} -    長度 : ${InSurveyInputData.length}`);

        InSurveyInputData.forEach((target) => {

                var AnswerData = {};

                AnswerData.id = target.id;
                AnswerData.checked = target.checked;
                AnswerData.value = target.value;
                AnswerData.disabled = target.disabled;


                var NeedSave = false;

                if (target.tagName == "INPUT") {

                    if (target.type === "text") {
                        if (target.value.trim() !== "") {
                            NeedSave = true;
                        }
                    }
                    //如果是顯示狀態 而且被勾起來
                    else if (
                        (target.type === "radio" || target.type === "checkbox")
                        /*&& target.style.display!="none"*/
                        && target.checked)
                    {

                        NeedSave = true;
                    }

                }
                else if (target.tagName == "TEXTAREA") {
                    if (target.value.trim() !== "") {
                        NeedSave = true;
                    }
                }


                //如果target.(沒有)被停用
                //if (target.disabled == false) {
                //    AnswerData.disabled = false;
                //    NeedSave = true;
                   
                //}
                //NeedSave = true;

                if (NeedSave) {
                    SurveyAnswerData.AnswerDataList.push(AnswerData);
                   // ModuleDataFetcherMgr.GetTargetModuleBlock(target).style.backgroundColor = "green";
                }


            });

        return SurveyAnswerData;

    }


    static isValidSelectorId(id) {
        return typeof id === 'string' &&
            id.length > 0 &&
            /^[A-Za-z_][A-Za-z0-9_\-:.]*$/.test(id);
    }
  
    static async loadAnswerOpen_Survey(survey) {
        
        //const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);


        //survey.querySelector(".SurvryBar").style.backgroundColor = randomColor;


        const matchedAnswerDataList = SaveAndLoadAnswerMgr.AnswerDataList.filter(
            (AnswerData) => survey.id === AnswerData.SurveyId
        );


        if (matchedAnswerDataList.length <= 0) {
            return;
        }

        //關閉顏色
        survey.querySelectorAll(".ModuleBlock").forEach(
            (ModuleBlock) => {
                ModuleBlock.style.backgroundColor = "";
                ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(ModuleBlock).style.backgroundColor = "";
            }
        );

       
        if (matchedAnswerDataList.length <= 0) {
            //如果沒有過去存檔
            console.error("沒有過去存檔");
            //alert("沒有過去存檔");
            //survey.querySelectorAll(".Input_Check").forEach(
            //    (target) => { target.checked = "true"; }
            //)
            return;
        }
        //console.log("讀取檔案 " + SaveAndLoadAnswerMgr.AnswerDataList.length);

        survey.querySelectorAll(".textBox input, .textBox textarea")
            .forEach((target) => {

                target.checked = false;
               
            }
            );


        for (const AnswerData of matchedAnswerDataList) {

            for (const TargetAnswerData of AnswerData.AnswerDataList) {

                if (!SaveAndLoadAnswerMgr.isValidSelectorId(TargetAnswerData.id)) {
                    console.log("continue;")
                    continue;
                }

                var target = survey.querySelector(`#${TargetAnswerData.id}`);
             
                if (target) {

                    if (target.classList.contains("Input_Check") ) {
                        target.checked = !TargetAnswerData.checked;
                        target.click();
                        target.checked = TargetAnswerData.checked;
                    }
                   
                }
                else {
                    console.error("❌  loadAnswer_Survey  " + AnswerData.SurveyId + "   " + TargetAnswerData.id + "   " + TargetAnswerData.checked + "   " + TargetAnswerData.value);
                }


            }




        }




    }

    static async loadAnswerData_Survey(survey) {
        
        //const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);


        //survey.querySelector(".SurvryBar").style.backgroundColor = randomColor;

      
        const matchedAnswerDataList = SaveAndLoadAnswerMgr.AnswerDataList.filter(
            (AnswerData) => survey.id === AnswerData.SurveyId
        );
        
        //-------------------------------------------------------------------
        //關閉顏色
        survey.querySelectorAll(".ModuleBlock").forEach(
            (ModuleBlock) => {
                ModuleBlock.style.backgroundColor = "";
                ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(ModuleBlock).style.backgroundColor = "";
            }
        );


        if (matchedAnswerDataList.length <= 0) {
            console.error("沒有過去存檔");
            return;
        }
        
        survey.querySelectorAll(".textBox input, .textBox textarea")
        .forEach((target) => {

                target.checked = false;
            }
        );

       
        //把所有作答都填上
        for (const AnswerData of matchedAnswerDataList) {

            //在開啟裡面問題
            for (const TargetAnswerData of AnswerData.AnswerDataList) {

                if (!SaveAndLoadAnswerMgr.isValidSelectorId(TargetAnswerData.id)) {
                    console.log("continue;")
                    continue;
                }
                var target = survey.querySelector(`#${TargetAnswerData.id}`);

                if (target) {

                    if (!target.classList.contains("Input_Check")) {

                        target.checked = TargetAnswerData.checked;
                        target.value = TargetAnswerData.value;
                       
                    }
                }
                else {
                    console.error("❌  loadAnswer_Survey  " + AnswerData.SurveyId + "   " + TargetAnswerData.id + "   " + TargetAnswerData.checked + "   " + TargetAnswerData.value);
                }


            }


        }


        
         survey.querySelectorAll(".textBox input")
             .forEach((target) => {
        
                 if (!target.classList.contains("Input_Check")) {

                     var LocChecked = target.checked;
                     // var LocDisplay = target.style.display;
                     // var LocDisabled = target.disabled;
                   

                     
                     if (LocChecked) {
                         target.disabled = false;
                         //target.style.display = "";
                         target.checked = !target.checked;


                         target.click();
                         target.checked = LocChecked;
                         //target.display = LocDisplay;
                     }
                 }
        
                 
             }
        );
    
    }


    static setInputAnswerId_Survey(survey) {
        // 儲存每個 ModuleBlock 下 text / textarea 出現的次數
        const dictTextNum = new Map();
        //ModuleBlock_1_text_1
        survey.querySelectorAll(".ModuleBlock input[type='text'], .ModuleBlock textarea")
            .forEach((target) => {
                const ModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(target);
                if (!ModuleBlock || !ModuleBlock.id) {
                    console.warn("無法取得 ModuleBlock 或 ID:", target);
                    return;
                }

                const ModuleBlockId = ModuleBlock.id;

                if (target.tagName === "INPUT" && target.type === "text") {
                    const key = `${ModuleBlockId}_text`;
                    const num = (dictTextNum.get(key) || 0) + 1;
                    dictTextNum.set(key, num);
                    target.id = `${key}_${num}`;
                }
                else if (target.tagName === "TEXTAREA") {
                    const key = `${ModuleBlockId}_TEXTAREA`;
                    const num = (dictTextNum.get(key) || 0) + 1;
                    dictTextNum.set(key, num);
                    target.id = `${key}_${num}`;
                }
            });
    }


    static ClearAllAnswer() {
        //true是關閉

        document.querySelectorAll(".ModuleBlock input, .ModuleBlock textarea")
            .forEach((input) => {

                if (input.type === "radio" || input.type === "checkbox") {
                    input.checked = false; // 取消勾選
                } else {
                    input.value = ""; // 也不用清空 資料帶不進來 value
                }

                input.checked = false;

                //input.disabled = false;
                input.disabled = true;
            });
    }
    static ClearAllAnswer_Survey(survey) {
        //true是關閉

        survey.querySelectorAll(".ModuleBlock input, .ModuleBlock textarea")
            .forEach((input) => {

                if (input.type === "radio" || input.type === "checkbox") {
                    input.checked = false; // 取消勾選
                } else {
                    input.value = ""; // 也不用清空 資料帶不進來 value
                }

                input.checked = false;

                //input.disabled = false;
                input.disabled = true;
            });
    }
    // **將 AnswerDataList 轉 JSON**
    static convertAnswerDataListToJson() {

        var jsonStr = JSON.stringify(SaveAndLoadAnswerMgr.AnswerDataList);
        console.log(jsonStr);


        console.log(jsonStr.length);

        return jsonStr;
    }

    static SaveJsonToDB() {
        
        SaveAndLoadAnswerMgr.AnswerDataList.forEach(
            (SurvryAnswerData) => {

                SurvryAnswerData.SurveyId;


                //SQL對應的SurveyId
                var SurveyId = SaveAndLoadAnswerMgr.getSurveyId(SurvryAnswerData.SurveyId);
                console.log(`${SurveyId}-${SurvryAnswerData.SurveyId}`);

                //SQL對應的VersionId
                var Version = SaveAndLoadAnswerMgr.getVersionNumber(SurvryAnswerData.SurveyId);;
                console.log(`${Version}-${SurvryAnswerData.SurveyId}`);

                //SQL對應的jsonStr
                var jsonStr = JSON.stringify(SurvryAnswerData.AnswerDataList);
                
                //if (SurveyId=="83") {
                //    alert(`${SurveyId}    ${jsonStr}`);
                //}


                //料號

                //工號

                //姓名

                SaveAndLoadAnswerMgr.saveSurveyAnswerToData(SurveyId, Version, jsonStr,
                    SaveAndLoadAnswerMgr.NotesMtNum,
                    SaveAndLoadAnswerMgr.StageMtNum);

                console.log(SaveAndLoadAnswerMgr.StageMtNum);
                //SaveAndLoadAnswerMgr.saveSurveyAnswerToData(SurveyId, Version, jsonStr);


                //SaveAndLoadAnswerMgr.saveSurveyAnswerToData(1, 1, jsonStr, "A58G100");
                //SaveAndLoadAnswerMgr.saveSurveyAnswerToData(SurveyId, Version, jsonStr,
                //SaveAndLoadAnswerMgr.NotesMtNum,4);

            }
        );
      
    }

    static getSurveyId(str) {
        const match = str.match(/Survey_(\d+)_/);
        return match ? parseInt(match[1], 10) : null;
    }
    
    static getVersionNumber(str) {
        const match = str.match(/_(\d+)$/);
        return match ? parseInt(match[1], 10) : null;
    }

    // **將 JSON 轉回 AnswerDataList**
    static loadAnswerDataListFromJson(jsonString) {
        try {
            SaveAndLoadAnswerMgr.AnswerDataList = JSON.parse(jsonString);
        } catch (error) {
            console.error("JSON 解析錯誤:", error);
            SaveAndLoadAnswerMgr.AnswerDataList = [];
        }
    }

    // 新增：用於從文字字串中擷取標籤後的值（模擬 C# 的 ExtractValueAfterLabel）
    static extractValueAfterLabelJS(source, label) {
        if (!source || !label) return "";
        var labelIndex = source.indexOf(label);
        if (labelIndex === -1) return "";
        labelIndex += label.length;
        var substring = source.substring(labelIndex);
        // 定義可能的其他標籤
        var possibleLabels = ["種類:", "站別:", "頁數:", "序號:", "文件編號:"];
        var earliestNextLabelPos = -1;
        possibleLabels.forEach(function (l) {
            if (l === label) return;
            var tmpPos = substring.indexOf(l);
            if (tmpPos !== -1 && (earliestNextLabelPos === -1 || tmpPos < earliestNextLabelPos)) {
                earliestNextLabelPos = tmpPos;
            }
        });
        if (earliestNextLabelPos !== -1) {
            substring = substring.substring(0, earliestNextLabelPos);
        }
        // 利用 textarea 進行 HTML entity decode，再 trim
        var ta = document.createElement("textarea");
        ta.innerHTML = substring;
        return ta.value.trim();
    }

    static saveSurveyAnswerToData(SurveyId, Version, jsonStr, MtNum, Stage) {
        // 組合 Survey 區塊的 id（依照慣例）
        const surveyElementId = `Survey_${SurveyId}_${Version}`;
        let images = [];
        // 從該 Survey 區塊中，透過 TailBarRow2 找出所有圖片（每個圖片放在 .UploadedImageContainer 內）
        const surveyElement = document.querySelector(`#${surveyElementId}`);
        if (surveyElement) {
            surveyElement.querySelectorAll(".TailBarRow2 .UploadedImageContainer").forEach(container => {
                let img = container.querySelector("img");
                // 若使用者有調整尺寸，取 container 的 style 屬性，否則預設 200px
                let width = container.style.width || "200px";
                let height = container.style.height || "200px";
                images.push({ src: img.src, width: width, height: height });
            });
        } else {
            console.warn("找不到 Survey 元素，id:", surveyElementId);
        }
        // 將圖片資料轉成 JSON 字串
        let imagesStr = JSON.stringify(images);


        let dto = {
            SurveyId: SurveyId,       // 問卷 id（參考 DocumentExport 的 id）
            Version: Version,         // 版本號
            AnsweredJson: jsonStr,    // 答案 JSON 字串
            MtNum: MtNum,             // 料號
            Images: imagesStr,        // 圖片資料（逗號分隔的字串）
            Stage: Stage              // 階段
        };

        console.log("送出至 SaveSurveyAnswerToData 的 DTO:", dto);

        fetch('/Customer/SurveyEdit/SaveSurveyAnswerToData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        })
            .then(response => response.json())
            .then(data => {
                console.log("SaveSurveyAnswerToData 回傳資料:", data);
                if (data.success) {
               //     alert("以料號為主的問卷答案儲存成功：" + data.message);
                } else {
               //     alert("以料號為主的問卷答案儲存失敗：" + data.message);
                }
            })
            .catch(err => {
                console.error("saveSurveyAnswerToData 發生錯誤:", err);
                alert("發生錯誤：" + err.message);
            });
    }





    static saveSurveyAnswer() {

        // 先更新所有 input 和 textarea 的 value 屬性
        document.querySelectorAll("input, textarea").forEach(input => {
            input.setAttribute("value", input.value);
        });

        // 呼叫 saveAnswer 收集答案，整合功能
        const answerJson = SaveAndLoadAnswerMgr.saveAnswer();
        // 把答案存到 localStorage
        localStorage.setItem("answerJson", answerJson);

        // 接著取得更新後包含使用者輸入資料的 outerHTML
        let htmlContent = document.getElementById("AutoScreen").outerHTML;

        let categoryElem = document.getElementById("inputCategory");
        let stationElem = document.getElementById("inputStation");
        let pageNoElem = document.getElementById("inputPageNo");
        let sequenceNoElem = document.getElementById("inputSequenceNo");
        let documentIdElem = document.getElementById("inputDocumentId");

        let category, station, pageNo, sequenceNo, documentId;
        if (categoryElem && stationElem && pageNoElem && sequenceNoElem && documentIdElem) {
            category = categoryElem.value;
            station = stationElem.value;
            pageNo = pageNoElem.value;
            sequenceNo = sequenceNoElem.value;
            documentId = documentIdElem.value;
        }
        else {
            // 從 #AutoScreen 的 HTML 中解析
            let autoScreenHtml = document.getElementById("AutoScreen").outerHTML;
            let parser = new DOMParser();
            let doc = parser.parseFromString(autoScreenHtml, "text/html");

            // 取得第一個模塊，解析「種類、站別、頁數、序號」
            let firstModule = doc.querySelector(".ModuleBlock");
            if (firstModule) {
                let firstText = firstModule.textContent;

                // 調試用，印出第一個模塊的內容及從中解析出的「種類:」
                console.log("firstModule.textContent:", firstText);
                console.log("Extracted 種類:", SaveAndLoadAnswerMgr.extractValueAfterLabelJS(firstText, "種類:"));


                category = SaveAndLoadAnswerMgr.extractValueAfterLabelJS(firstText, "種類:");
                station = SaveAndLoadAnswerMgr.extractValueAfterLabelJS(firstText, "站別:");
                pageNo = SaveAndLoadAnswerMgr.extractValueAfterLabelJS(firstText, "頁數:");
                //sequenceNo = SaveAndLoadAnswerMgr.extractValueAfterLabelJS(firstText, "序號:");

                // 針對序號部分，直接抓 input 的值
                let seqInput = firstModule.querySelector("input[type='text']");
                sequenceNo = seqInput ? seqInput.value.trim() : "";
            }
            // 取得最後一個模塊，解析「文件編號」
            let modules = doc.querySelectorAll(".ModuleBlock");
            if (modules.length > 0) {
                let lastModule = modules[modules.length - 1];
                let lastText = lastModule.textContent;
                documentId = SaveAndLoadAnswerMgr.extractValueAfterLabelJS(lastText, "文件編號:");
            }
        }

        if (!category || !station || !pageNo || !sequenceNo || !documentId) {
            alert("必要的欄位不存在，請檢查 AutoScreen 中是否包含『種類:』『站別:』『頁數:』『序號:』『文件編號:』等資訊");
            return;
        }

        let jsonStr = SaveAndLoadAnswerMgr.getAnswerJsonStr();
        htmlContent = document.getElementById("AutoScreen").outerHTML;

        let dto = {
            Category: category,
            Station: station,
            PageNo: pageNo,
            SequenceNo: sequenceNo,
            DocumentId: documentId,
            HtmlContent: htmlContent,
            AnswerJson: answerJson, // 使用 saveAnswer() 回傳的 JSON 字串
            Images: "",
            Comment: ""
        };

        console.log("送出至後端的 DTO:", dto);
        console.log(SaveAndLoadAnswerMgr.AnswerDataList);

        fetch('/Customer/SurveyEdit/SaveSurveyAnswer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        })
            .then(response => response.json())
            .then(data => {
                console.log("後端回傳的資料:", data);
                if (data.success) {
                    alert("問卷答案已儲存：" + data.message);
                } else {
                    alert("儲存失敗：" + data.message);
                }
            })
            .catch(err => {
                console.error("發生錯誤:", err);
                alert("發生錯誤：" + err.message);
            });
    }//舊的測試，目前用不到


    // 新增：用於從文字字串中擷取標籤後的值（模擬 C# 的 ExtractValueAfterLabel）
    static extractValueAfterLabelJS(source, label) {
        if (!source || !label) return "";
        let labelIndex = source.indexOf(label);
        if (labelIndex === -1) return "";
        labelIndex += label.length;
        let substring = source.substring(labelIndex);
        // 定義可能的其他標籤
        const possibleLabels = ["種類:", "站別:", "頁數:", "序號:", "文件編號:"];
        let earliestNextLabelPos = -1;
        possibleLabels.forEach(function (l) {
            if (l === label) return; // 跳過自己
            const tmpPos = substring.indexOf(l);
            if (tmpPos !== -1 && (earliestNextLabelPos === -1 || tmpPos < earliestNextLabelPos)) {
                earliestNextLabelPos = tmpPos;
            }
        });
        if (earliestNextLabelPos !== -1) {
            substring = substring.substring(0, earliestNextLabelPos);
        }
        // 使用 textarea 進行 HTML entity decode 並 Trim
        const ta = document.createElement("textarea");
        ta.innerHTML = substring;
        return ta.value.trim();
    }

}


/* ========== 問卷功能列管理 ========================================================================= */
/* 把功能列事件 (含 Ctrl+Alt+7 監聽) 寫在這裡 */
class TopMenuBarMgr {
    static initMenuBar() {
        // 1. 監聽 Ctrl+Alt+7 快捷鍵 => 觸發保存
        //document.addEventListener("keydown", (event) => {
        //    if (event.ctrlKey && event.altKey && event.key === "7") {
        //        event.preventDefault();
        //        console.log("Ctrl + Alt + 7 => 進行保存動作");
        //        // 呼叫既有的 SaveAndLoadAnswerMgr.saveAnswer()，或自行串接後端API
        //        if (typeof SaveAndLoadAnswerMgr !== "undefined" && SaveAndLoadAnswerMgr.saveAnswer) {
        //            SaveAndLoadAnswerMgr.saveAnswer();
        //        } else {
        //            alert("尚未定義存檔方法，請自行接後端API。");
        //        }
        //    }
        //});

        // 2. 綁定功能列各按鈕
        let btnSave = document.getElementById("btnSave");
        if (btnSave) {
            btnSave.addEventListener("click", function () {
                console.log("[功能列] 保存被點擊");
                alert("尚未定義存檔方法，請自行接後端API。");

                //var jsonStr = SaveAndLoadAnswerMgr.saveAnswer();
                //console.log(jsonStr);

                //SaveAndLoadAnswerMgr.loadAnswerDataListFromJson(jsonStr);
                //SaveAndLoadAnswerMgr.saveSurveyAnswer();

                //SaveAndLoadAnswerMgr.saveSurveyAnswerToData(1, 1, jsonStr, "A58G100");
                //SaveAndLoadAnswerMgr.saveSurveyAnswerToData(1, 1, '{"test":"value"}', "A58G100");

                //if (typeof SaveAndLoadAnswerMgr !== "undefined" && SaveAndLoadAnswerMgr.saveAnswer) {
                //    SaveAndLoadAnswerMgr.saveAnswer();
                //} else {
                //    alert("尚未定義存檔方法，請自行接後端API。");
                //}
            });
        }

        // 其他功能 => 新建
        let btnNew = document.getElementById("btnNew");
        if (btnNew) {
            btnNew.addEventListener("click", function () {
                console.log("[功能列] 新建被點擊");
                alert("執行新建功能...");
            });
        }

        // 匯入
        let btnImport = document.getElementById("btnImport");
        if (btnImport) {
            btnImport.addEventListener("click", function () {
                console.log("[功能列] 匯入被點擊");
                alert("執行匯入功能...");

                setLoadBtnMgr.importTxtAndProcess();
            });
        }

        // 匯出
        let btnClean = document.getElementById("btnClean");
        if (btnClean) {
            btnClean.addEventListener("click", function () {
                console.log("[功能列] 清除被點擊");
                //alert("執行清除功能...");
                // 模擬 F5 的功能，刷新頁面
                window.location.reload();
            });
        }

        // 修訂歷史
        let btnHistory = document.getElementById("btnHistory");
        if (btnHistory) {
            btnHistory.addEventListener("click", function () {
                console.log("[功能列] 修訂歷史被點擊");
                alert("顯示修訂歷史...");
            });
        }

        // 頁面設置
        let btnPageSetup = document.getElementById("btnPageSetup");
        if (btnPageSetup) {
            btnPageSetup.addEventListener("click", function () {
                console.log("[功能列] 頁面設置被點擊");
                alert("顯示頁面設置對話框...");
            });
        }

       

        // 關閉
        let btnClose = document.getElementById("btnClose");
        if (btnClose) {
            btnClose.addEventListener("click", function () {
                console.log("[功能列] 關閉被點擊");
                window.close();
            });
        }
    }

    static initPrintwindows() {
        // 列印
        let btnPrint = document.getElementById("btnPrint");
        if (btnPrint && !btnPrint.dataset.eventBound) {
            btnPrint.addEventListener("click", function () {
                console.log("[功能列] 列印被點擊");
                // 1) 先把工具列加上 .collapsed
                const menuBar = document.getElementById("documentMenuBar");
                menuBar.classList.add("collapsed");

                // 2) 延遲一點點呼叫 window.print() (確保畫面已更新)
                setTimeout(() => {
                    window.print();
                    // 印完後可根據需求移除 collapsed 狀態
                    menuBar.classList.remove("collapsed");
                }, 100);


                //// 3) 監聽 afterprint 事件（印完後再把工具列顯示回來）
                //window.addEventListener('afterprint', function () {
                //    menuBar.classList.remove("collapsed");
                //}, { once: true });

            });
            // 設定標記，表示該事件已被綁定
            btnPrint.dataset.eventBound = "true";
        }
    }

    // === 新增：小箭頭隱藏/顯示功能 ===
    static initToggleArrow() {
        const topMenuBar = document.querySelector(".topMenuBar");
        const toggleArrow = document.getElementById("toggleArrow");

        if (!topMenuBar || !toggleArrow) return;

        let isCollapsed = false; // 紀錄目前是否隱藏

        toggleArrow.addEventListener("click", function () {
            // 切換 collapsed 狀態
            isCollapsed = !isCollapsed;
            if (isCollapsed) {
                // 隱藏整列 (套用 collapsed class)
                topMenuBar.classList.add("collapsed");
                // 變換小箭頭方向(示範用, 可換圖示)
                toggleArrow.textContent = "⯆";
            } else {
                // 顯示整列 (移除 collapsed class)
                topMenuBar.classList.remove("collapsed");
                // 變換小箭頭方向
                toggleArrow.textContent = "⯈";
            }
        });
    }
}

/* ========== 文件功能列管理 ========================================================================= */
/* === 文件功能列管理 === */
class DocumentMenuBarMgr {
    static initMenuBar() {
        const docMenuBar = document.getElementById("documentMenuBar");
        const arrowUp = document.getElementById("toggleArrowUp");
        const hiddenZone = document.getElementById("documentMenuBarHiddenZone");
        const pinToggle = document.getElementById("pinToggle"); // 釘選按鈕

        if (!docMenuBar || !arrowUp || !hiddenZone || !pinToggle) return;

        // 修改預設：文件工具列初始狀態為顯示，且未釘選
        let isCollapsed = false;  // 由原來 true 改為 false
        let isPinned = false;     // 由原來 true 改為 false

        // ============== 釘選邏輯 ==============
        pinToggle.addEventListener("click", () => {
            isPinned = !isPinned;
            if (isPinned) {
                pinToggle.classList.add("pinned");
            } else {
                pinToggle.classList.remove("pinned");
            }
        });

        // ============== 雙箭頭 (收合/展開) ==============
        arrowUp.addEventListener("click", () => {
            if (isPinned) {
                alert("已釘選！請先取消釘選再收合。");
                return;
            }
            isCollapsed = !isCollapsed;
            if (isCollapsed) {
                docMenuBar.classList.add("collapsed");
                arrowUp.textContent = "⏬";
                hiddenZone.classList.add("documentMenuBarHidden");
            } else {
                docMenuBar.classList.remove("collapsed");
                arrowUp.textContent = "⏫";
                hiddenZone.classList.remove("documentMenuBarHidden");
            }
        });

        // ============== 隱藏區塊：點擊再展開 ==============
        hiddenZone.addEventListener("click", () => {
            if (isCollapsed && !isPinned) {
                docMenuBar.classList.remove("collapsed");
                arrowUp.textContent = "⏫";
                hiddenZone.classList.remove("documentMenuBarHidden");
                isCollapsed = false;
            }
        });

        // ============== 新增：點擊功能列按鈕特效 ==============
        const menuItems = docMenuBar.querySelectorAll("ul > li");
        menuItems.forEach(item => {
            item.addEventListener("click", (e) => {
                if (e.button === 0) {
                    item.classList.add("menu-click-effect");
                    setTimeout(() => {
                        item.classList.remove("menu-click-effect");
                    }, 300);
                }
            });
        });
    }
}




/* ========== 自動隱藏 / 顯示 + pinned 功能 ========================================================== */

class AutoHideMenuBar {
    static isPinned = false;    // 是否固定 (預設釘選)
    static isHidden = false;   // 是否隱藏
    static menuBar = null;
    static pinBtn = null;      // 釘子按鈕(可選)

    static initAutoHideMenu() {
        AutoHideMenuBar.menuBar = document.getElementById("documentMenuBar");
        if (!AutoHideMenuBar.menuBar) return;

        // 1. 加個 pinned 按鈕(若需要)；如果沒用 pinned，就可略過
        AutoHideMenuBar.pinBtn = document.getElementById("pinToggle");
        if (AutoHideMenuBar.pinBtn) {
            AutoHideMenuBar.pinBtn.addEventListener("click", () => {
                AutoHideMenuBar.togglePin();
            });
        }

        // 2. 監聽 mousemove
        document.addEventListener("mousemove", AutoHideMenuBar.onMouseMove);
    }

    static togglePin() {
        AutoHideMenuBar.isPinned = !AutoHideMenuBar.isPinned;
        if (AutoHideMenuBar.isPinned) {
            // pinned => 取消隱藏
            AutoHideMenuBar.showBar();
            // 也可改釘子圖示外觀
            AutoHideMenuBar.pinBtn.classList.add("pinned");
        } else {
            AutoHideMenuBar.pinBtn.classList.remove("pinned");
        }
    }

    static onMouseMove(e) {
        // pinned = true 時，不自動隱藏
        if (AutoHideMenuBar.isPinned || !AutoHideMenuBar.menuBar) return;

        const x = e.clientX;
        const y = e.clientY;

        // (1) 若滑鼠在「安全區域」(左上角) 或者 y<50，都顯示工具列
        if ( y < 5) {
            AutoHideMenuBar.showBar();
        }
        // (2) 若滑鼠跑到太下方(y>120)，又不在安全區域，就隱藏
        else if (y > 120) {
            AutoHideMenuBar.hideBar();
        }
        //static safeZoneElem = null;

        // 在 initAutoHideMenu 或其他地方，抓到你的「下拉整塊容器」(例如 <ul class="subMenu">)：
          //AutoHideMenuBar.safeZoneElem = document.querySelector(".documentMenuBar ul li ul");
          // ← 這裡根據自己實際結構抓 DOM

          // onMouseMove 中：
    //         const rect = AutoHideMenuBar.safeZoneElem.getBoundingClientRect();
    //         const inSafeZone = (
    //           x >= rect.left &&
    //           x <= rect.right &&
    //           y >= rect.top &&
    //           y <= rect.bottom
    //           );

    //if(inSafeZone) { AutoHideMenuBar.showBar(); } 
    //else { AutoHideMenuBar.hideBar(); }
   


    }

    static showBar() {
        if (AutoHideMenuBar.isHidden) {
            AutoHideMenuBar.menuBar.classList.remove("collapsed"); // or remove "hideBar" if you used that
            AutoHideMenuBar.isHidden = false;
        }
    }

    static hideBar() {
        if (!AutoHideMenuBar.isHidden) {
            AutoHideMenuBar.menuBar.classList.add("collapsed");  // or add "hideBar" 
            AutoHideMenuBar.isHidden = true;
        }
    }
}

/* =================================================================================================== */


//---[ 重置 ]---
//找出所有option
//將所有有選項的模塊 都加上 question-mode = true
//如果沒有 input cls option_checkbox  display: none; 就不是選項
//data--question-mode
//data--option-mode
//data-need-answered   是問題 全部都要加上這個  如果沒有的 就要變成false


//---[ 重置 ]---
//data-need-answered  true 是指 需不需要確認

//從最上層 一層一層往下找到第一個表格或是問題
//把選項開啟並且打勾
//再把打勾的下面的選項的勾勾打開


//---[ 塞入程式 ]---
// 掛在問題上面 如果vaule被變更 就把其他的設定成不能選擇 並且把以下的value全部清空
// 開啟選項底下的選擇權





