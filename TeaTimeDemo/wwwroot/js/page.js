var dataTable;
var dataTable2;
var dataTable3;
var dataTable4;

$(document).ready(function () { 

    loadDataTable();
    loadDataTable2();
    loadDataTable3();
    loadDataTable4(categoryId);

    $('#addToCatForm').on('submit', function (e) {

        /*alert("test");*/
        e.preventDefault();//防止預先提交，後續再手動提交已選中問卷

        $('#addToCatFrom input[name="SelectedSurveyIds[]"]').remove();//清空先前所製造的input



        //每個List中的選中問卷添加隱藏input
        selectedSurveyIds.forEach(
            function (id) {
            $('<input>').attr({
                type: 'hidden',
                name: 'SelectedSurveyIds[]',//這個要與controller參數名相同
                value: /*$(this).val()*/id,
            }).appendTo('#addToCatForm');
            }

        );

        //因為前面控制住提交，這裡要手動提交
        this.submit();
    })

    //根據複選框狀態動態更新>>>>>事件觸發
    $('#StblData').on('change', '.survey-checkbox', function () {
        var surveyId = parseInt($(this).val());
        if (this.checked) {//勾選時添加到列表
            if (!selectedSurveyIds.includes(surveyId)) {
                selectedSurveyIds.push(surveyId);
            }
        } else {//取消勾選時移除列表中Id
          selectedSurveyIds = selectedSurveyIds.filter(id => id != surveyId);
        }
    });
});

/*顯示隱藏新增表單*/
function ToggleForm() {
    var form = document.getElementById("NewPageSection");
    if (form.style.display === "none") form.style.display = "block";
    else form.style.display = "none";
}

function ToggleSelectLayerForm() {
    var form = document.getElementById("selectLayer");
    if (form.style.display === "none") form.style.display = "block";
    else form.style.display = "none";
}


//全部問卷
function loadDataTable() {
    dataTable = $('#StblData').DataTable({
        "ajax": {
            url: '/customer/pagegroup/getall',
            type: "GET",
            /*datatype: "json",*/
            "dataSrc": "data"
        },
        "fixedHeader": true,
        "columns": [
            {
                "data": "id",
                "render": function (data, type, row) {     
                    return `<input type="checkbox" class="survey-checkbox" value="${data}" 

                                  ${selectedSurveyIds.includes(data) ? "checked" : ""}>`; // 添加複選框
                },
                "width": "5%"
            },
            { "data": "categoryName", "width": "10%" },  // 確保與 SurveyDTO 的 CategoryName 對應
            { "data": "title", "width": "15%" },
            { "data": "stationName", "width": "10%" },
            { "data": "description", "width": "15%" },
            { "data": "questionNum", "width": "5%" },
            { "data": "isPublished", "width": "5%" },
            { "data": "createTime", "width": "10%", "render": function (data) { return data; } },
            { "data": "completeTime", "width": "10%", "render": function (data) { return data; } },
            { "data": "jobName", "width": "10%" },
        ],
        "columnDefs": [
            {
                // 自定義排序欄位，根據是否勾選排序
                "targets": 0, // 自定義排序的欄位
                "orderDataType": "checkbox-selected" // 自定義排序函數名字
            }
        ],
        "order": [[0, 'asc']],//升序排列
        "language": {
            "url": "/js/i18n/Chinese-traditional.json"
        },
        "drawCallback": function () {
            //切換daatTable頁數後保持已選中的問卷
            $('#StblData input.survey-checkbox').each(function () {
                $(this).prop('checked', selectedSurveyIds.includes(parseInt($(this).val())));
            });
        },       
    });
    // 自定義排序函數
    $.fn.dataTable.ext.order['checkbox-selected'] = function (settings, col) {
        return this.api().column(col, { order: 'index' }).nodes().map(function (cell) {
            // 根據是否在 `selectedSurveyIds` 中進行排序
            var checkboxValue = parseInt($(cell).find('.survey-checkbox').val());
            return selectedSurveyIds.includes(checkboxValue) ? 0 : 1; // 已選中返回 0, 未選中返回 1
        });
    };
}


function loadDataTable2() {
    dataTable2 = $('#NtblData').DataTable({
        "ajax": {
            url: '/Customer/PageGroup/getCategoryList',
            type: "Get",
            datatype: "json",
            "dataSrc": "data"
        },
        "order": [[1, "asc"]],
        "flexedHeader": true,
        "columns": [
            { "data": "name", "width": "15%" },
            { "data": "displayOrder", "width": "15%" },
            { "data": "ispublished", "width": "15%"},
            {
                data: 'id',
                "render": function (data, type, row) {
                    var publishButton = row.ispublished === true
                        ? `<button class="btn btn-secondary mx-2" onclick="togglePublish(${data})">取消發佈</button>`
                        : `<button class="btn btn-secondary mx-2" onclick="togglePublish(${data})">發佈</button>`;

                    return `
                        <div class="w-75 btn-group" role="group">
                            <a href="/customer/pagegroup/Layer/${data}" class="btn btn-primary mx-2" onclick="loadDataTable4('${data}')">
                                <i class="bi bi-pencil-square"></i> 編輯
                            </a>
                            <button class="btn btn-danger mx-2" onClick="Delete('/customer/pagegroup/delete/NtblData/${data}', 'NtblData')">
                                <i class="bi bi-trash-fill"></i> 刪除
                            </button>
                            ${publishButton}
                        </div>`;
                },
                "width": "15%"
            },
        ],
        "language": {
            "url": "/js/i18n/Chinese-traditional.json"
        }
    });
}


//頁數    
function loadDataTable3() {
    dataTable3 = $('#GtblData').DataTable({
        "ajax": {
            url: `/Customer/PageGroup/GetSurveyGroupList/${categoryId}/${layerId}`,
            type: "Get",
            datatype: "json",
            "dataSrc": "data"
        },
        "order": [[2, "asc"]],
        "flexedHeader": true,
        "columns": [
            { "data": "name", "width": "15%" },
            { "data": "count", "width": "15%" },
            { "data": "order", width: "15%" },
            { "data": "description", width: "15%" },
            {
                data: 'id',
                "render": function (data, type, row) {
                    return `
                        <div class="w-75 btn-group" role="group">
                            <a href="/customer/pagegroup/upsert/${categoryId}/${layerId}/${data}" class="btn btn-primary mx-2">
                                <i class="bi bi-pencil-square"></i> 編輯
                            </a>
                            <button class="btn btn-danger mx-2" onClick="Delete('/customer/pagegroup/delete/GtblData/${data}', 'GtblData')">
                                <i class="bi bi-trash-fill"></i> 刪除
                            </button>
                        </div>`;
                },
                "width": "15%"
            }
            ],
        "language": {
            "url": "/js/i18n/Chinese-traditional.json"
        }
    });
}


function loadDataTable4(categoryId) {
    //alert(categoryId);
    dataTable4 = $('#LtblData').DataTable({
        "ajax": {
            url: `/customer/pagegroup/GetLayerList/${categoryId}`,
            type: "Get",
            datatype: "json",
            "dataSrc": "data"
        },
        "order": [[1, "asc"]],
        "flexedHeader": true,
        "columns": [
            { "data": "name", "width": "15%" },
            { "data": "order", "width": "15%" },
            {"data": "description", "width": "15%"},
            {
                data: 'id',
                "render": function (data, type, row) {
                    //alert("function"+categoryId);
                    return `
                        <div class="w-75 btn-group" role="group">
                            <a href="/customer/pagegroup/Page/${categoryId}/${data}" class="btn btn-primary mx-2" >
                                <i class="bi bi-pencil-square"></i> 編輯
                            </a>
                            <button class="btn btn-danger mx-2" onClick="Delete('/customer/pagegroup/delete/LtblData/${data}', 'LtblData')">
                                <i class="bi bi-trash-fill"></i> 刪除
                            </button>
                        </div>`;
                },
                "width": "15%"
            }
        ],
        "language": {
            "url": "/js/i18n/Chinese-traditional.json"
        }
    });
}



// 切換是否發佈的狀態
function togglePublish(id) {
    $.ajax({
        url: `/customer/pagegroup/togglepublish/${id}`,
        type: 'POST',
        success: function (data) {
            if (data.success) {
                dataTable2.ajax.reload();  // 刷新表格
                toastr.success(data.message);
            } else {
                toastr.error(data.message);
            }
        }
    });
}

//預設添加頁數
function autoAddSG() {
    var categoryId = $('#categoryIdInput').val();
    var layerId = $('#layerIdInput').val();
    var dataTableCount = $('#GtblData').DataTable().data().count();
    //alert(c);
    $.ajax({
        url: '/customer/pagegroup/AutoAdd',
        type: 'POST',
        data: {
            categoryId: categoryId,
            layerId: layerId,
            dataTableCount: dataTableCount
        },
        success: function (response) {
            if (response.success) {
                alert("新增成功");
                window.location.href = response.redirectUrl;
                loadDataTable4(categoryId);
            } else {
                alert(`新增失敗，${response.message}`);
            }
        },
        error: function () {
            alert("新增失敗")
        }
    });
}

function Delete(url, tableId) {
    event.preventDefault();
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
                url: url,
                type: 'DELETE',
                success: function (data) {
                    if (data.success) {
                        $('#' + tableId).DataTable().ajax.reload();
                        toastr.success(data.message);
                    } else {
                        toastr.error(data.message || "刪除失敗");
                    }
                },
                error: function () {
                    toastr.error("伺服器出錯");
                }
            });
        }
    });
}
        

