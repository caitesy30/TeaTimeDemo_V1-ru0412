//R5
//document

//import { Toast } from "../lib/bootstrap/dist/js/bootstrap.bundle";

//假的enum
const AnswerTypeEnum = {
    SingleChoice: { value: 0, name: "單選" },
    MultipleChoice: { value: 1, name: "多選" },
    TextAnswer: { value: 2, name: "填空" },
    TextareaAnswer: { value: 3, name: "填空框" },
    SelectOption: { value: 4, name: "下拉選單" },
    ImageUpload: { value: 5, name: "圖片上傳" }
};
//StringBuilder   << .cs

let strArr = [];


function GetAllSelectedOptions() {
    
    // 获取所有的 radio button
    let allRadios = document.querySelectorAll('input[name*="Questions"]:checked');

    // 遍历所有已选中的单选框并输出它们的值
    let SelectedOptions = [];
    allRadios.forEach(function (radio) {
       
        SelectedOptions.push(radio.value);
    });
    return SelectedOptions;
}


function TestShowAllSelectedOptions()
{
    strArr = [];
    // 获取所有的 radio button
    let allRadios = document.querySelectorAll('input[name*="Questions"]:checked');

    // 遍历所有已选中的单选框并输出它们的值
    SelectedOptions=[];
    allRadios.forEach(function (radio) {
        // 提取问题编号 (如 Questions[11].SelectedOption -> 11)
        let questionId = radio.name.match(/\[(\d+)\]/)[1]; // 使用正则从 name 属性中提取出问题 ID

        strArr.push(`問題: ${questionId} 選中的選項: ${radio.value} \n `);

    });

    if (strArr.length === 0) {
        strArr = ["未選中"];
    }

    ShowStrArrData();

}

function getSelectedOptions()
{
    strArr = [];

    //_QuestionsMap.set(@question.Id, {AnswerType: @((int)question.AnswerType), optionArr: [] });
   // _QuestionsObj.QuestionsMap.forEach((value, key) => {
    _QuestionsMap.forEach((value, key) => {
       
        console.log(`${key}: ${value.AnswerType} _ ${value.optionArr} `);
        console.log(AnswerTypeEnum.SingleChoice);
        console.log(`${AnswerTypeEnum.SingleChoice.value}`);


        switch (value.AnswerType) {
            case AnswerTypeEnum.SingleChoice.value:
                // 处理单选题的逻辑
                console.log("處理單選題");
                const selectedOption = document.querySelector(`input[name="Questions[${key}].SelectedOption"]:checked`);
                let selectedOptionValue = selectedOption ? selectedOption.value : "目前尚未有選中的選項";

                strArr.push(`問題: ${key} 選中的選項: ${selectedOptionValue} \n `);

                
                if (selectedOptionValue && selectedOptionValue !== "目前尚未有選中的選項") {
                    value.optionArr = [selectedOptionValue];  // 如果有值，將其加入 optionArr
                } else {
                    value.optionArr = [];  // 如果沒有值，清空 optionArr
                }

                break;

            case AnswerTypeEnum.MultipleChoice.value:
                // 处理多选题的逻辑
                console.log("處理多選題");
                const selectedOptions = document.querySelectorAll(`input[name="Questions[${key}].SelectedOptions"]:checked`);
                let selectedOptionValues = Array.from(selectedOptions).map(checkbox => checkbox.value);

                // 如果没有选中任何复选框
                if (selectedOptionValues.length === 0) {
                    selectedOptionValues = ["目前尚未有選中的選項"];  // 使用数组，保持一致性
                }
                strArr.push(`問題: ${key} 選中的選項: ${selectedOptionValues.join(', ')} \n `);

                value.optionArr = selectedOptionValues.length > 0 && selectedOptionValues[0] !== "目前尚未有選中的選項"
                    ? selectedOptionValues  // 如果有選項，將選中的選項放入 optionArr
                    : [];  // 如果沒有選中，則將 optionArr 設為空陣列


                break;

            case AnswerTypeEnum.TextAnswer.value:
                // 处理填空题的逻辑
                console.log("處理填空題");
                const textAnswer = document.querySelector(`input[name="Questions[${key}].TextAnswer"]`);
                const textAnswerValue = textAnswer ? textAnswer.value : "目前尚未填寫答案";
                strArr.push(`問題: ${key} 填空答案: ${textAnswerValue} \n`);
                break;

            case AnswerTypeEnum.TextareaAnswer.value:
                // 处理长文本填空题的逻辑
                console.log("處理長文本填空題");
                const textareaAnswer = document.querySelector(`textarea[name="Questions[${key}].TextareaAnswer"]`);
                const textareaAnswerValue = textareaAnswer ? textareaAnswer.value : "目前尚未填寫答案";
                strArr.push(`問題: ${key} 長文本填空答案: ${textareaAnswerValue} \n`);
                break;

            case AnswerTypeEnum.SelectOption.value:
                // 处理下拉选单题的逻辑
                console.log("處理下拉選單");
                const selectOption = document.querySelector(`select[name="Questions[${key}].SelectOption"]`);
                const selectOptionValue = selectOption ? selectOption.value : "目前尚未選中";
                strArr.push(`問題: ${key} 選中的選項: ${selectOptionValue} \n`);
                break;

            case AnswerTypeEnum.ImageUpload.value:
                // 处理图片上传题的逻辑
                console.log("處理圖片上傳");
                const imageUpload = document.querySelector(`input[name="Questions[${key}].ImageUpload"]`);
                const imageUploadValue = imageUpload ? imageUpload.value : "目前尚未上傳圖片";
                strArr.push(`問題: ${key} 上傳的圖片: ${imageUploadValue} \n`);
                break;

            default:
                // 如果没有匹配到任何 case，执行默认的逻辑
                console.log("未知的題型");
        }
    });

    
}




//function getSelectedOptions_Loc() {
//    alert("getSelectedOptions");
//    const checkboxes = document.querySelectorAll('input[name="Questions[0].SelectedOptions"]:checked');
//    const selectedValues = Array.from(checkboxes).map(checkbox => checkbox.value);

//    const selectedOption = document.querySelector('input[name="Questions[1].SelectedOption"]:checked');
//    const selectedOptionValue = selectedOption ? selectedOption.value : '未选择';

//    const confirmationMessage = document.getElementById('confirmation-message');
//    confirmationMessage.style.display = 'block';
//    let str = `选中的选项: ${selectedValues.join(', ')}; 其他选择: ${selectedOptionValue}`;

//     //str = `${Model.Survey.Title} 选中的选项: ${selectedValues.join(', ')}; 其他选择: ${selectedOptionValue}`;

//    confirmationMessage.textContent = str;
//   //alert(str);
//}


function ShowStrArrData() {
   
    let finalResult = strArr.join("");  // 一次性将数组连接为字符串
    const confirmationMessage = document.getElementById('confirmation-message');
    confirmationMessage.style.display = 'block';
    //confirmationMessage.textContent = finalResult;  // 显示最终结果
    confirmationMessage.innerHTML = finalResult.replace(/\n/g, "<br>");  // 顯示最終結果並處理換行
}

function ShowSelectedOptions()
{
    getSelectedOptions();

    ShowStrArrData();
}
function SubmitSelectedOptions()
{
    alert("SubmitSelectedOptions");
    getSelectedOptions();
    
    // 將 _QuestionsMap 轉換為普通的 JavaScript 對象
    let questionsObject = {};

    _QuestionsMap.forEach((value, key) => {
        questionsObject[key] = {
            AnswerType: value.AnswerType,
            optionArr: value.optionArr
        };
    });

    // 將對象轉換為 JSON 字符串
    let _QuestionsMapJson = JSON.stringify(questionsObject);

    // 獲取 <a> 元素並設置 href 屬性
    let submitBtn = document.getElementById('submitBtn');
    
    //submitBtn.href = `/Customer/Answer/TestGet?QuestionsMapJson=${encodeURIComponent(_QuestionsMapJson)}`;
    
    let urlStr = `/Customer/Answer/TestGet?QuestionsMapJson=${encodeURIComponent(_QuestionsMapJson)}
    &SurveyId=${encodeURIComponent(SurveyModelId)}`;
    //&LocHtml=${_LocHtml}`;

    alert(_LocHtml);
    submitBtn.href = urlStr;
    submitBtn.click();
    
}

function SubmitSelectedOptions_ajax() {

    alert("SubmitSelectedOptions_ajax");
    // 獲取選中的選項
    //getSelectedOptions();

    // 將 _QuestionsMap 轉換為普通的 JavaScript 對象
    //let questionsObject = {};

    //_QuestionsMap.forEach((value, key) => {
    //    questionsObject[key] = {
    //        AnswerType: value.AnswerType,
    //        optionArr: value.optionArr
    //    };
    //});

    let AllSelectedOptions = GetAllSelectedOptions();

    // 將對象轉換為 JSON 字符串
    let questionsMapJson = JSON.stringify(questionsObject);
     questionsMapJson = JSON.stringify(AllSelectedOptions);
    
    // 準備提交的數據
    let data = {
        QuestionsMapJson: questionsMapJson,
        SurveyId: SurveyModelId,
        LocHtml: _LocHtml
    };

    // 使用 jQuery 的 AJAX 發送請求
    $.ajax({
        url: '/Customer/Answer/TestGet',  // API 接口 URL
        type: 'GET',  // 請求方法
        data: data,   // 傳送的資料
        success: function (response) {
            // 成功時的處理邏輯，假設返回的 response 是成功訊息
            if (response.success) {
                alert("提交成功！");
                // 這裡可以進行跳轉，或其他處理
                // window.location.href = response.redirectUrl;  // 如有需要跳轉
            } else {
                alert("提交失敗，請稍後再試！");
            }
        },
        error: function (xhr, status, error) {
            // 當 AJAX 請求發生錯誤時的處理
            console.error("AJAX 請求失敗: " + error);
            alert("提交過程中發生錯誤，請稍後再試！");
        }
    });
}


function SubmitSelectedOptions_Post() {

   
    getSelectedOptions();
    // 將 _QuestionsMap 轉換為普通的 JavaScript 對象
    let questionsObject = {};
    let AllSelectedOptions = GetAllSelectedOptions();

    _QuestionsMap.forEach((value, key) => {
        questionsObject[key] = {
            AnswerType: value.AnswerType,
            optionArr: value.optionArr
        };
    });

    // 將對象轉換為 JSON 字符串
    let _QuestionsMapJson = JSON.stringify(questionsObject);

    //let _AllSelectedOptionsJson = JSON.stringify(AllSelectedOptions);
    // 準備要發送的資料
    let data = {
        QuestionsMapJson: _QuestionsMapJson,
        ArrAllSelectedOptions: AllSelectedOptions,
        SurveyId: SurveyModelId,
        LocHtml: _LocHtml,
       
    };


    // 使用 fetch 發送 POST 請求
    fetch('/Customer/Answer/TestGetPOST', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) // 將資料轉換為 JSON 字符串
    })
        .then(response => {
            // 如果 response.redirected 是 true，说明发生了重定向
            if (response.redirected) {
                // 跳转到新的页面
                window.location.href = response.url;
            } else {
                return response.text();  // 获取返回的内容
            }
        })
        .then(data => {
            // 在這裡處理返回的數據
            console.log(data);

            // 找到顯示訊息的 div 元素
            let responseMessageDiv = document.getElementById('responseMessage');

            // 設置 div 的內容為返回的 data
            responseMessageDiv.innerHTML = data;

            // 顯示 div
            responseMessageDiv.style.display = 'block';

            // 3秒後隱藏該訊息


            setTimeout(function () {
                responseMessageDiv.style.display = 'none';
                // window.location.href = '/Customer/Answer'; // 跳轉頁面
            }, 3000); // 3000 毫秒，即 3 秒後隱藏
        })
        .then(data => {
            // 在這裡處理返回的數據
            console.log(data);

            // 找到顯示訊息的 div 元素
            let responseMessageDiv = document.getElementById('responseMessage');

            // 設置 div 的內容為返回的 data
            responseMessageDiv.innerHTML = data;

            // 顯示 div
            responseMessageDiv.style.display = 'block';

            // 3秒後隱藏該訊息
            setTimeout(function () {
                responseMessageDiv.style.display = 'none';
                // window.location.href = '/Customer/Answer'; // 跳轉頁面
            }, 3000); // 3000 毫秒，即 3 秒後隱藏
        })


        .catch(error => {
            console.error('錯誤:', error);
        });
}




function CheckAllQuestionsAnswered() {
    // 获取所有问题的唯一 name（只考虑 radio 和 checkbox）
    let allQuestions = new Set();
    let allInputs = document.querySelectorAll('input[type="radio"][name*="Questions"], input[type="checkbox"][name*="Questions"]');
    allInputs.forEach(function (input) {
        allQuestions.add(input.name);
    });

    // 获取所有已回答的 name
    let answeredQuestions = new Set(GetAllOptionsName());

    // 检查是否每个问题都被回答
    for (let question of allQuestions) {
        if (!answeredQuestions.has(question)) {
           
            return false; // 如果有未回答的问题
        }
    }

    return true; // 所有问题都已回答
}

function GetAllOptionsName() {
    // 获取所有选中的 radio 或 checkbox
    let allInputs = document.querySelectorAll('input[type="radio"][name*="Questions"]:checked, input[type="checkbox"][name*="Questions"]:checked');

    // 使用 Set 确保唯一性
    let uniqueNames = new Set();

    // 遍历所有选中项并获取它们的 name 属性
    allInputs.forEach(function (input) {
        uniqueNames.add(input.name);
    });

    // 将 Set 转换为数组并返回
    return Array.from(uniqueNames);
}



function HighlightUnansweredQuestions() {
    // 获取所有带有 "Questions" 的输入元素
    let allInputs = document.querySelectorAll('input[name*="Questions"]');

    // 收集所有问题的唯一 name
    let allQuestions = new Set();
    allInputs.forEach(input => allQuestions.add(input.name));

    // 获取已回答的问题 name
    let answeredQuestions = new Set();
    let checkedInputs = document.querySelectorAll('input[name*="Questions"]:checked');
    checkedInputs.forEach(input => answeredQuestions.add(input.name));

    // 遍历所有问题，添加或移除高亮
    allQuestions.forEach(questionName => {
        // 找到该问题的相关输入元素
        let relatedInputs = document.querySelectorAll(`input[name="${questionName}"]`);

        // 检查是否已回答
        let isAnswered = answeredQuestions.has(questionName);

        // 为相关输入元素的父容器添加或移除 .unanswered 类
        relatedInputs.forEach(input => {
            
            let label = document.querySelector(`label[for="${input.id}"]`); // 获取与 input 关联的 label

            if (isAnswered) {
                // 如果已回答，去掉背景颜色
                if (label) {
                    label.style.color = '';
                    label.style.backgroundColor = ''; // 清除 label 背景色
                }
               
            } else {
                // 如果未回答，设置红色背景并加上高亮
                if (label) {
                    label.style.color = 'white';
                    //label.style.backgroundColor = '#ec7063'; // 高亮 label 背景色

                    label.style.backgroundColor = '#f1948a'; 
                }
            }
        });
    });
}



function SubmitSelectedOptions_ajax_GetAnsweredSurveyData() { 
   
    HighlightUnansweredQuestions();
    if (CheckAllQuestionsAnswered()) {
   
    }
    else {
        alert("紅底題目尚未填寫");
        return;
    }
   

    let AllSelectedOptions = GetAllSelectedOptions();

    
    let questionsMapJson = JSON.stringify(AllSelectedOptions);


    // 準備要發送的資料
    let data = {
        ArrAllSelectedOptions: AllSelectedOptions,
        AnsweredSurveyId :SurveyModelId,
        QuestionsMapJson: questionsMapJson,
        SurveyId: SurveyModelId,
        LocHtml: _LocHtml,
        SurveyCount: surveycount,
         
        //MtNum: _MtNum,
        //ProcessNum: _ProcessNum,
        //PageName: _PageName
    };

    // 使用 jQuery 的 AJAX 發送 POST 請求
    $.ajax({
        url: '/Admin/Order/GetAnsweredSurveyData',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
           
            if (response.success) {


                let new_MtNum = htmlDecode(_MtNum);
                let new_ProcessNum = htmlDecode(_ProcessNum);
                let new_PageName = htmlDecode(_PageName);

               let _TargetUrl = `/Admin/Order/PageView?MtNum=${new_MtNum}&ProcessNum=${new_ProcessNum}&PageName=${new_PageName}`;
                //alert(_TargetUrl);
                // alert  結果為  Admin / Order / PageView ? MtNum = RT7478 & ProcessNum=5 & PageName=防焊第1頁
               window.location.href = _TargetUrl;


                // 獲取當前 URL 的查詢參數
                let urlParams = new URLSearchParams(window.location.search);

                // 獲取 ServeyId 參數並轉換為數字,10進制
                let serveyId = parseInt(urlParams.get('ServeyId'), 10);
                if (serveyId == Number(surveycount)) {
                    let pageViewUrl = "/Admin/Order/PageView?MtNum=" + _MtNum + "&ProcessNum=" + _ProcessNum + "&PageName=" + _PageName;
                    window.location.href = _TargetUrl;
                    //Toast.
                    return; // 結束函數執行
                }

                serveyId++;

                window.location.href = "/Admin/Order/ServeyEdit?ServeyId=" + serveyId + "&SurveyCount="+ surveycount;
         
            } else {
                alert("操作失敗");
            }
        },
        error: function (xhr, status, error) {
            console.error('錯誤:', error);
        }
    });
}

function htmlDecode(input) {
    let doc = document.createElement('textarea');
    doc.innerHTML = input;
    return doc.value;
}

function SubmitSelectedOptions_Post_ajax() {
    alert("SubmitSelectedOptions_Post_ajax");
    getSelectedOptions();
    // 將 _QuestionsMap 轉換為普通的 JavaScript 對象
    let questionsObject = {};

    _QuestionsMap.forEach((value, key) => {
        questionsObject[key] = {
            AnswerType: value.AnswerType,
            optionArr: value.optionArr
        };
    });

    // 將對象轉換為 JSON 字符串
    let _QuestionsMapJson = JSON.stringify(questionsObject);

    // 準備要發送的資料
    let data = {
        QuestionsMapJson: questionsMapJson,
        SurveyId: SurveyModelId,
        LocHtml: _LocHtml
    };

    // 使用 jQuery 的 AJAX 發送 POST 請求
    $.ajax({
        url: '/Customer/Answer/TestGetPOST',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            // 如果 response.redirected 是 true，说明发生了重定向
            if (response.redirected) {
                // 跳转到新的页面
                window.location.href = response.url;
            } else {
                // 在這裡處理返回的數據
                console.log(response);

                // 找到顯示訊息的 div 元素
                let responseMessageDiv = document.getElementById('responseMessage');

                // 設置 div 的內容為返回的 response
                responseMessageDiv.innerHTML = response;

                // 顯示 div
                responseMessageDiv.style.display = 'block';

                // 3秒後隱藏該訊息
                setTimeout(function () {
                    responseMessageDiv.style.display = 'none';
                    // window.location.href = '/Customer/Answer'; // 跳轉頁面
                }, 3000); // 3000 毫秒，即 3 秒後隱藏
            }
        },
        error: function (xhr, status, error) {
            console.error('錯誤:', error);
        }
    });
}


function SubmitSelectedOptions_Post02() {
    getSelectedOptions();
    // 將 _QuestionsMap 轉換為普通的 JavaScript 對象
    let questionsObject = {};

    _QuestionsMap.forEach((value, key) => {
        questionsObject[key] = {
            AnswerType: value.AnswerType,
            optionArr: value.optionArr
        };
    });

    // 將對象轉換為 JSON 字符串
    let _QuestionsMapJson = JSON.stringify(questionsObject);

    // 準備要發送的資料
    let data = {
        QuestionsMapJson: questionsMapJson,
        SurveyId: SurveyModelId,
        LocHtml: _LocHtml
    };

    // 使用 fetch 發送 POST 請求
    fetch('/Customer/Answer/TestGetPOST', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) // 將資料轉換為 JSON 字符串
    })
        .then(data => {
            // 在這裡處理返回的數據
            console.log(data);

            // 找到顯示訊息的 div 元素
            let responseMessageDiv = document.getElementById('responseMessage');

            // 設置 div 的內容為返回的 data
            responseMessageDiv.innerHTML = data;

            // 顯示 div
            responseMessageDiv.style.display = 'block';

            // 3秒後隱藏該訊息
            setTimeout(function () {
                responseMessageDiv.style.display = 'none';
               // window.location.href = '/Customer/Answer'; // 跳轉頁面
            }, 3000); // 3000 毫秒，即 3 秒後隱藏
        })

        .catch(error => {
            console.error('錯誤:', error);
        });
}






function setTargetOptionValue(_int, _bool) {
    const radioButton = document.getElementById(`option_${_int}`);
    // 确保找到了该单选框
    if (radioButton) {
        radioButton.checked = _bool;
        return true;
    } else {
        //alert(`沒有找到目標選項Id [option_${_int}]`)
        return false;
    }
}


function SetOptionChecked() {
    TestSetAllOptionValue_ByOption(false);

    // 查找所有 name 屬性包含 "Questions" 的 input 元素（選項按鈕）
    let allRadios = document.querySelectorAll('input[name*="Questions"]');

    // 使用一個物件來記錄每個問題的選項組
    let questionGroups = {};

    allRadios.forEach(radio => {
        // 根據問題的 name 屬性來分組
        let questionName = radio.name;

        // 如果這個問題的選項組尚未被記錄過，創建一個空的陣列
        if (!questionGroups[questionName]) {
            questionGroups[questionName] = [];
        }

        // 將當前選項按鈕添加到對應的問題組中
        questionGroups[questionName].push(radio);
    });

    // 遍歷每個問題組，將第一個選項設為已選中
    for (let questionName in questionGroups) {
        let radios = questionGroups[questionName];

        if (radios.length > 0) {
            radios[0].checked = true;  // 將該問題組的第一個選項設為已選中
        }

        
    }
}

function TestSetAllOptionValue_ByOption(_bool) {


    let allRadios = document.querySelectorAll('input[name*="Questions"]');

    allRadios.forEach(function (radio) {

        if (!setTargetOptionValue(radio.value, _bool)) {
           
        }
    });

}
function TestSetAllOptionValue(_bool)
{
    let str = "";
    for (let i = 0; i < AllOptionArr.length; i++) {
        //console.log(AllOptionArr[i]);
        if (!setTargetOptionValue(AllOptionArr[i], _bool))
        {
            str += `沒有找到目標選項Id [option_${i}] \n`;
        }
    }
    //if (str != "") {
    //    alert(str);
    //}
    //alert(str);
}

function SetTargetQuestionsOptionValue(QuestionNum, OptionNum, _bool) {

    const radioButton = document.querySelector(`input[name="Questions[${QuestionNum}].SelectedOption"][value="${OptionNum}"]`);

    // 确保找到了该单选框
    if (radioButton) {
        radioButton.checked = _bool;  // 取消选中
        console.log("选项已取消选中");
    } else {
        console.log("未找到该单选框");
    }
}

function TestUseSurveyModel() {

    getSelectedOptions();

    //let OrderArrStr = _QuestionsObj.OrderArr.join("\n");  // 用\n分隔
    //alert(OrderArrStr);

    const obj = QuestionsMapToString(_QuestionsMap);
 
    alert(obj);

}
function QuestionsMapToString(map) {
    if (map.size === 0) return ''; // 如果 map 為空，直接返回空字串

    let str = '';
    map.forEach((value, key) => {
        // 將 key 和 value 轉換為字符串，並處理 value 為對象的情況
        let valueStr = (typeof value === 'object' && value !== null)
            ? JSON.stringify(value)  // 將對象轉換為 JSON 字符串
            : value.toString(); // 其他情況將其轉為字串

        str += `${key}: ${valueStr}\n`;
    });

    // 去掉最後的逗號和空格
    return str;
    //return str.slice(0, -2);
}


function TestUseInputGetSurveyModel(InputSurveyModel) {
    alert("Testfunction");

    alert(InputSurveyModel);
    InputSurveyModel = "TestTitle_02";
    alert(InputSurveyModel);

    return InputSurveyModel;
}


function submitModifiedModel() {
    alert("submitModifiedModel");


    // 假設你已經對 mceHtmlContent 或其他 Model 進行了修改
    let modifiedModel = {
        // 這裡添加你要修改的屬性
        // 例如，如果你要修改 MceHtml
        MceHtml: mceHtmlContent // 使用已修改的內容
    };
    surveyModel.Survey.Title = "新的標題"; // 修改數據

    // 將修改後的 Model 序列化為 JSON
    document.getElementById('inputModel').value = JSON.stringify(surveyModel.Survey.Title);

    // 提交隱藏表單
    document.getElementById('hiddenForm').submit();
}

