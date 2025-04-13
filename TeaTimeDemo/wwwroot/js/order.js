var dataTable;
$(document).ready(function () {
    SurveyOption.init();
});

//$(function () {
//    var url = window.location.search;
//    console.log(url)
//    if (url.includes("Processing")) {
//        loadDataTable("Processing");
//    }
//    else {
//        if (url.includes("Pending")) {
//           // loadDataTable("Pending");
//        }
//        else {
//            if (url.includes("Ready")) {
//               // loadDataTable("Ready");
//            }
//            else {
//                if (url.includes("Completed")) {
//                    //loadDataTable("Completed");
//                }
//                else {
//                   // loadDataTable("all");
//                }
//            }
//        }

//    }

//});


//function loadDataTable(status) {
//    dataTable = $('#tblData').DataTable({
//        "ajax": {
//            url: '/admin/order/getall?status=' + status
//        },
//        "columns": [
//            { data: 'id', "width": "10%" },
//            { data: 'name', "width": "15%" },
//            { data: 'phoneNumber', "width": "20%" },
//            { data: 'applicationUser.email', "width": "20%" },
//            { data: 'orderStatus', "width": "10%" },
//            { data: 'orderTotal', "width": "10%" },
//            {
//                data: 'id',
//                "render": function (data) {
//                    return `
//                        <div class="w-75 btn-group" role="group">
//                            <a href="/admin/order/details?orderId=${data}"
//                            class="btn btn-primary mx-2"><i class="bi bi-pencil-square"></i></a>
                            
//                        </div>`;
//                },
//                "width": "15%"
//            }
//        ]
//    });
//}





function AddNotes(_PcbCategoryId)
{
    // 取得 input 元素
    let pcbCategoryId = document.querySelector('select[name=pcbCategoryId]');
    let productId =     document.querySelector('input[name=productId]');
    let reProductId =   document.querySelector('input[name=ReProductId]');


    if (_PcbCategoryId == 0) {
        toastr.warning("PCB類別 不得為 無");

        resetQuerySelector();
        return;
    }
    // 確認兩者值不為空，且內容一致
    if (productId.value !== "" && reProductId.value !== "" && productId.value === reProductId.value)
    {
       
        AddNotes_ajax(productId.value, _PcbCategoryId)
    }
    else {
        // 如果不一致或有空值
        toastr.warning("productId 和 ReProductId 必須一致且不可為空");

        resetQuerySelector();
    }

    
}

function resetQuerySelector()
{
    document.querySelector('select[name=pcbCategoryId]').value = 0;;
    document.querySelector('input[name=productId]').value = "";
    document.querySelector('input[name=ReProductId]').value = "";
}



function AddNotes_ajax(_MtNum, _pcbCategoryId) {

   

    // 使用 jQuery 的 AJAX 發送請求
    $.ajax({
        url: '/Admin/Order/AddNotes',  // API 接口 URL
        type: 'GET',  // 請求方法
        data: {
            MtNum: _MtNum,
            PcbCategoryId: _pcbCategoryId,
        },   // 傳送的資料
        success: function (response) {
            // 成功時的處理邏輯，假設返回的 response 是成功訊息
            if (response.success) {
                toastr.success(response.message);
                location.reload();
                //alert("提交成功！");
                // 這裡可以進行跳轉，或其他處理
               // window.location.href = response.redirectUrl;  // 如有需要跳轉
               // window.location.href = '/Admin/Order/Index'
            } else {
                toastr.warning(response.message);
                //alert("提交失敗，請稍後再試！");
            }
            resetQuerySelector();
            //window.location.href = window.location.href;
            //window.location.href = '/Admin/Order/Index'
        },
        error: function (xhr, status, error) {
            // 當 AJAX 請求發生錯誤時的處理
            console.error("AJAX 請求失敗: " + error);
            //alert("提交過程中發生錯誤，請稍後再試！");
            toastr.success("提交過程中發生錯誤，請稍後再試！")
        }
    });
}


function restrictInput(event) {
    const input = event.target;

    setTimeout(() => {
        input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }, 0);
}


/*顯示表單*/
function ToggleForm() {
    var form = document.getElementById("NewPageSection");
    if (form.style.display === "none") form.style.display = "block";
    else form.style.display = "none";
}   

function Delete(MtNum) {
    Swal.fire({
        title: "確定刪除?",
        text: "您將無法恢復此狀態！",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "是的, 刪除它!",
        cancelButtonText: "取消"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: 'DELETE',
                url: '/Admin/Order/DeleteNotes?MtNum=' + MtNum,
                success: function (data) {
                    location.reload()
                    toastr.success(data.message);
                }
            })
        }
    });
}



class Notes {

    static Duplicate(mtNum) {
        if (!mtNum) return;
        const requestData = {
            mtNum
        }
        $.ajax({
            url: '/Admin/Order/DuplicateNotes',  // API 接口 URL
            type: 'POST',  // 請求方法
            contentType: 'application/json',
            data: JSON.stringify(mtNum),
            success: function (response) {
                if (response.success) {
                    alert('複製成功！');
                    location.reload(); // 刷新頁面
                } else {
                    alert('錯誤: ' + response.message);
                }
            },
            error: function (xhr) {
                alert('伺服器錯誤: ' + xhr.status);
            }
        });
    }

    static async Add() {

        const mtNum = document.getElementById('productId').value;
        const remtNum = document.getElementById('ReProductId').value;
        if (mtNum !== remtNum) {
            alert('料號不一致請在確認一次!');
            return;
        }

        const categoryId = document.getElementById('PcbCategoryId').value;

        const selectedList = [];


        const promises = Array.from(document.querySelectorAll('[data-process-type]')).map(async (dropdown) => {
            const value = dropdown.dataset.value || 0;
            let processName = dropdown.textContent;
            const typeName = dropdown.getAttribute(('data-process-type'));
            let pageList = [];

            if (value > 0) {
                try {
                    // 呼叫 API 取得 BlankSurvey 和其 SelectedIds
                    const response = await $.ajax({
                        url: `/Admin/Order/GetBlankSurvey/${value}`,
                        type: 'GET',
                        contentType: 'application/json',
                    });

                    if (response.success && response.data) {
                        pageList = response.data.map(survey => ({
                            surveyId: survey.surveyId,
                            version: survey.version
                        }));
                    }
                } catch (error) {
                    console.log.error("發生錯誤")
                }
            } else if (value == 0) {
                const layer = dropdown.getAttribute(('data-process-type'));
                processName = "一般";
                try {
                    const response = await $.ajax({
                        url: `/Admin/Order/GetBlankSurveyDefault?categoryId=${categoryId}&layer=${layer}`,
                        type: 'GET',
                        contentType: 'application/json',
                    });
                    if (response.success && response.data) {
                        pageList = response.data.map(survey => ({
                            surveyId: survey.surveyId,
                            version: survey.version
                        }));
                    }
                } catch (error) {
                    console.log.error("發生錯誤")
                }
            }

            selectedList.push({
                processName: typeName + " : " + processName,
                value: parseInt(value),
                pageList
            });
        });


        await Promise.all(promises);


        //document.querySelectorAll('[data-process-type]').forEach(dropdown => {
        //    selectedList.push({
        //        processType: dropdown.getAttribute('data-process-type'),
        //        Value: dropdown.dataset.value || 0,
        //    });
        //});

        const requestData = {
            MtNum: mtNum,
            PcbCategoryId: categoryId,
            OptionList: selectedList
        }

        $.ajax({
            url: '/Admin/Order/AddNotes',  // API 接口 URL
            type: 'POST',  // 請求方法
            contentType: 'application/json',
            data: JSON.stringify(requestData),
            success: function (response) {
                if (response.success) {
                    alert('建立成功！');
                    location.reload(); // 刷新頁面
                } else {
                    alert('錯誤: ' + response.message);
                }
            },
            error: function (xhr) {
                alert('伺服器錯誤: ' + xhr.status);
            }
        });
    }

    static Complete() {

    }
}

class SurveyOption {
    static selectedSurveyIds = [];
    static dataTableInstance = null; 

    static init() {
        if (!document.getElementById('PcbCategoryId')) return;
        document.getElementById('PcbCategoryId').addEventListener('change', SurveyOption.getCategory);
        
    }
    static Add(processType) {
        const select = document.querySelector('.form-select');
        const selectValue = select.value;
        if (selectValue == 0) {
            alert('請先選擇Notes類別！');
            return;
        }
        SurveyOption.selectedSurveyIds = [];
        let modal = new bootstrap.Modal(document.getElementById('addOption'));
        
        modal.show();
        SurveyOption.loadDataTable(selectValue, processType);

        //document.getElementById('saveNewOption').removeEventListener('click', SurveyOption.handleCreate);
        //document.getElementById('saveNewOption').addEventListener('click', () => {
        //    SurveyOption.handleCreate(selectValue, processType);
        //}, { once: true });

        $('#saveNewOption').off('click').one('click', function () {
            SurveyOption.handleCreate(selectValue, processType);
        });
        
    }

    static getCategory() {
        const categoryId = this.value;
        const processDropdowns = document.querySelectorAll('[data-process-type]');

        processDropdowns.forEach(dropdown => {
            const processType = dropdown.getAttribute('data-process-type');
            SurveyOption.loadProcessOptions(categoryId, processType, dropdown);
        });

    }

    static SetSwitch() {
        let menu = this.closest('.dropdown');
        let selectedText = this.textContent.trim(); // 取得選中的文字
        let selectedValue = this.getAttribute("data-value"); // 取得選中的 value
        let selectedProcess = this.getAttribute('data-process-type');
        let dropdownButton = menu.querySelector(".dropdown-toggle"); // 取得對應的按鈕
        let categoryId = document.getElementById('PcbCategoryId').value;
        let existingModifyBtn = menu.parentNode.querySelector('.modifyBtn');
        
        //let optionId = dropdownButton.dataset.value;
        if (existingModifyBtn) {
            existingModifyBtn.remove(); // 如果有，先刪除
        }
        const modifyBtn = document.createElement('button');
        modifyBtn.classList.add('btn', 'btn-secondary', 'modifyBtn');
        modifyBtn.innerHTML = '<i class="bi bi-pencil"></i>'
        modifyBtn.addEventListener('click', () => {

            let modal = new bootstrap.Modal(document.getElementById('addOption'));

            modal.show();

            SurveyOption.loadDataTable(categoryId, selectedProcess, selectedValue, selectedText);


            $('#saveNewOption').off('click').one('click', function () {
                SurveyOption.update(selectedValue);
            });
        });
        menu.parentNode.appendChild(modifyBtn);
    
        // 修改按鈕的文字與 data-value
        dropdownButton.textContent = selectedText;
        dropdownButton.setAttribute("data-value", selectedValue);
    }

    static loadProcessOptions(categoryId, processType, dropdownElement) {
        if (categoryId === "0") {
            return;
        }

        $.ajax({
            url: '/Admin/Order/GetProcessesByCategory',
            type: 'GET',
            data: {
                categoryId: categoryId,
                processType: processType
            },
            success: function (response) {
                dropdownElement.textContent = dropdownElement.getAttribute('data-original-text');
                var dropdownMenu = dropdownElement.parentNode.querySelector('.dropdown-menu');
                dropdownMenu.innerHTML = ''; 
                if (!response.success) return;
                // 添加新选项
                response.data.forEach(process => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                    <button class="dropdown-item" data-value="${process.id}">
                        ${process.name}
                    </button>
                `;
                    dropdownMenu.appendChild(li);
                    const addNewButton = li.querySelector('button');
                    addNewButton.addEventListener('click', SurveyOption.SetSwitch);
                });

                // 添加分隔线和「新增其他」按钮
                const divider = document.createElement('li');
                divider.innerHTML = '<hr class="dropdown-divider">';
                dropdownMenu.appendChild(divider);

                const addNewItem = document.createElement('li');
                addNewItem.innerHTML = `
                <button class="dropdown-item" data-value="0" 
                    onclick="SurveyOption.Add('${processType}')">
                    >新增其他
                </button>
            `;
                dropdownMenu.appendChild(addNewItem);
                

            },
            error: function () {
                alert('加载流程失败！');
            }
        });
    }

    static handleCreate(categoryId, processName) {
        let newOptionText = document.getElementById("newOptionInput").value.trim(); // 取得輸入值

        if (!newOptionText) {
            alert("請輸入有效的選項名稱！");
            return;
        }

        // 發送 AJAX 請求到後端
        $.ajax({
            url: "/Admin/Order/AddSurveyOption",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                CategoryId: categoryId,       // 類別名稱
                ProcessName: processName,      // 流程名稱
                OptionName: newOptionText,     //新框架名稱
                SurveyIds: SurveyOption.selectedSurveyIds  // 原 surveyIds → SurveyIds
            }),
            success: function (response) {
                if (response.success) {
                    const dropdownElement = document.querySelector(`[data-process-type="${processName}"]`)
                    // 關閉 Modal
                    let modal = bootstrap.Modal.getInstance(document.getElementById('addOption'));
                    modal.hide();
                    alert('添加成功！');
                    SurveyOption.loadProcessOptions(categoryId, processName, dropdownElement);
                    //location.reload();
                    
                } else {
                    alert("儲存失敗: " + response.message);
                }
            },
            error: function () {
                alert("發生錯誤，請稍後再試！");
            }
        });
    }

    static update(blankSurveyId) {


        
        let newOptionText = document.getElementById("newOptionInput").value.trim(); // 取得輸入值
        const obj = {
            BlankSurveyId: blankSurveyId,
            OptionName: newOptionText,     //新框架名稱
            
            SurveyIds: SurveyOption.selectedSurveyIds  // 原 surveyIds → 
        }
        $.ajax({
            url: "/Admin/Order/UpdateSurveyOptions",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(obj),
            success: function (response) {
                if (response.success) {
                    /*const dropdownElement = document.querySelector(`[data-process-type="${processName}"]`)*/
                    // 關閉 Modal
                    let modal = bootstrap.Modal.getInstance(document.getElementById('addOption'));
                    if (modal) {
                        modal.dispose(); // 銷毀 modal 實例
                        //modal.remove();   // 選擇性地從 DOM 中移除元素
                    }
                    //alert('更新成功！');
                    
                    location.reload();
                    toastr.success(response.message);
                    /*SurveyOption.loadProcessOptions(categoryId, processName, dropdownElement);*/
                    //location.reload();

                } else {
                    alert("儲存失敗: " + response.message);
                }
            },
            error: function () {
                alert("發生錯誤，請稍後再試！");
            }
        });

    }

    static async loadDataTable(categoryId, processName, blankSurveyId, selectedText) {

        if (SurveyOption.dataTableInstance) {
            SurveyOption.dataTableInstance.destroy();
            $('#MtblData').empty().removeAttr('style');
        }
        //console.log(`/Admin/Order/GetSurvey?categoryId=${categoryId}&processName=${processName}`);

        try {
            const response = await $.ajax({
                url: `/Admin/Order/GetBlankSurveyToOption/${blankSurveyId}`,
                type: 'GET',
                contentType: 'application/json'
            });
            if (response.success && response.data) {
                // 直接使用後端傳回的 List<int>
                SurveyOption.selectedSurveyIds = response.data.selectedIds || [];
                processName = response.data.processName;
                

            } else {
                SurveyOption.selectedSurveyIds = [];
            }
        } catch (error) {
            console.error("載入 BlankSurvey 失敗:", error);
            SurveyOption.selectedSurveyIds = [];
        }

        SurveyOption.dataTableInstance = $('#MtblData').DataTable({
            "ajax": {
                url: `/Admin/Order/GetSurvey?categoryId=${categoryId}&processName=${processName}`,
                type: "GET",
                /*datatype: "json",*/
                dataSrc: "data",
            },
            "fixedHeader": true,
            "columns": [
                {
                    "data": "id",
                    "render": function (data, type, row) {
                        const isChecked = SurveyOption.selectedSurveyIds.includes(data) ? "checked" : "";
                        return `<input type="checkbox" class="survey-checkbox" value="${data}" ${isChecked}>`;
                    },
                    "width": "5%"
                },
                { "data": "category", "width": "10%" },  // 確保與 SurveyDTO 的 CategoryName 對應
                { "data": "station", "width": "15%" },
                { "data": "pageNo", "width": "10%" },
                { "data": "documentId", "width": "15%" },
                {"data": "version", "width": "10%"}
            ],
            "columnDefs": [
                {
                    // 自定義排序欄位，根據是否勾選排序
                    "targets": 0, // 自定義排序的欄位
                    "orderDataType": "checkbox-selected" // 自定義排序函數名字
                }
            ],
            "order": [[0, 'asc']],//升序排列

            "initComplete": function (settings, json) {
                // 假設後端回傳的 json 中有 newOptionName 欄位
                if (selectedText) {
                    $('#newOptionInput').val(selectedText);
                }
            },
            "language": {
                "url": "/js/i18n/Chinese-traditional.json"
            },
            "drawCallback": function () {
                //切換daatTable頁數後保持已選中的問卷
                $('#MtblData input.survey-checkbox').each(function () {
                    const surveyId = parseInt($(this).val());
                    $(this).prop('checked', SurveyOption.selectedSurveyIds.includes(surveyId));
                });
            },
        });
         //自定義排序函數
        $.fn.dataTable.ext.order['checkbox-selected'] = function (settings, col) {
            return this.api().column(col, { order: 'index' }).nodes().map(function (cell) {
                // 根據是否在 `selectedSurveyIds` 中進行排序
                var checkboxValue = parseInt($(cell).find('.survey-checkbox').val());
                return SurveyOption.selectedSurveyIds.includes(checkboxValue) ? 0 : 1; // 已選中返回 0, 未選中返回 1
            });
        };
        // 監聽複選框變更
        $(document).off("change", "#MtblData tbody input.survey-checkbox");
        $(document).on("change", "#MtblData tbody input.survey-checkbox", function () {
            let surveyId = parseInt($(this).val());
            if ($(this).is(":checked")) {
                if (!SurveyOption.selectedSurveyIds.includes(surveyId)) {
                    SurveyOption.selectedSurveyIds.push(surveyId);
                }
            } else {
                SurveyOption.selectedSurveyIds = SurveyOption.selectedSurveyIds.filter(id => id !== surveyId);
            }
        });
    }

    static loadUpdateTblData() {
        $('#updateTblData').DataTable({
            "ajax": {
                url: '/Admin/Order/GetExistingSurvey', // 更新資料的 API，回傳現有問卷資料
                type: "GET",
                dataSrc: "data"
            },
            "columns": [
                // 同樣定義欄位
            ],
            "order": [[0, 'asc']],
            "language": {
                "url": "/js/i18n/Chinese-traditional.json"
            },
            "drawCallback": function () {
                $('#updateTblData input.survey-checkbox').each(function () {
                    const surveyId = parseInt($(this).val());
                    $(this).prop('checked', SurveyOption.selectedSurveyIds.includes(surveyId));
                });
            }
        });
    }
}

            