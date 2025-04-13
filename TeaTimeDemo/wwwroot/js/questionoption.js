var dataTable;

$(function () {
    // 加載 DataTable
    loadDataTable();
});

function loadDataTable() {
    console.log("Initializing DataTable...");
    dataTable = $('#tblData').DataTable({
        "processing": true,
        "serverSide": false, // 禁用伺服器端處理
        "ajax": {
            "url": "/admin/questionoption/getall",
            "type": "GET",
            "datatype": "json",
            "dataSrc": function (json) {
                console.log("Received data:", json);
                return json.data;
            }
        },
        "columns": [
            { "data": "id", "width": "5%" }, // ID
            { "data": "questionId", "width": "10%" }, // 問題ID
            { "data": "surveyId", "width": "10%" }, // 問卷ID
            { "data": "optionText", "width": "30%" }, // 選項文本
            { "data": "sortOrder", "width": "5%" }, // 排序順序
            {
                "data": "createTime",
                "width": "15%",
                "render": function (data) {
                    return formatDate(data); // 僅顯示日期
                }
            }, // 創建時間
            {
                "data": "completeTime",
                "width": "15%",
                "render": function (data) {
                    return formatDate(data); // 根據需求調整
                }
            }, // 完成時間
            {
                "data": "id",
                "render": function (data, type, row) {
                    return `
                        <div class="btn-group" role="group">
                            <a href="/admin/questionoption/edit/${data}" class="btn btn-primary mx-1">
                                <i class="bi bi-pencil-square"></i> 編輯
                            </a>
                            <a onClick=Delete('/admin/questionoption/delete/${data}') class="btn btn-danger mx-1">
                                <i class="bi bi-trash-fill"></i> 刪除
                            </a>
                            <button onclick="MoveUp(${data}, ${row.surveyId}, ${row.questionId})" class="btn btn-secondary mx-1">
                                <i class="bi bi-arrow-up"></i> 上升
                            </button>
                            <button onclick="MoveDown(${data}, ${row.surveyId}, ${row.questionId})" class="btn btn-secondary mx-1">
                                <i class="bi bi-arrow-down"></i> 下降
                            </button>
                        </div>`;
                },
                "width": "25%" // 調整寬度以容納新增按鈕
            } // 操作
        ],
        "language": {
            "url": "/js/i18n/Chinese-traditional.json" // 使用繁體中文語言包
        },
        "order": [[2, "asc"], [1, "asc"], [4, "asc"]], // 按 SurveyId, QuestionId, SortOrder 排序
        "fixedHeader": true,  // 固定標題
        "responsive": true,
        "scrollX": true // 啟用橫向捲軸
    });
    console.log("DataTable initialized.");
}

// 日期格式化函數（僅顯示日期）
function formatDate(data) {
    if (data) {
        var date = new Date(data);
        if (isNaN(date.getTime())) {
            // 無效日期
            return '';
        }
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }
    return '';
}

// 上升功能
function MoveUp(id, surveyId, questionId) {
    $.ajax({
        url: '/admin/questionoption/moveup',
        type: 'POST',
        data: {
            id: id,
            surveyId: surveyId,
            questionId: questionId
        },
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function (response) {
            if (response.success) {
                toastr.success(response.message);
                dataTable.ajax.reload();
            } else {
                toastr.warning(response.message);
            }
        },
        error: function () {
            toastr.error("上升操作時發生錯誤。");
        }
    });
}

// 下降功能
function MoveDown(id, surveyId, questionId) {
    $.ajax({
        url: '/admin/questionoption/movedown',
        type: 'POST',
        data: {
            id: id,
            surveyId: surveyId,
            questionId: questionId
        },
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function (response) {
            if (response.success) {
                toastr.success(response.message);
                dataTable.ajax.reload();
            } else {
                toastr.warning(response.message);
            }
        },
        error: function () {
            toastr.error("下降操作時發生錯誤。");
        }
    });
}

function Delete(url) {
    Swal.fire({
        title: "你確定要刪除嗎?",
        text: "刪除後將無法恢復!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "是的，刪除它!"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: url,
                type: 'DELETE', // 改為 DELETE 請求
                //headers: {
                //    'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
                //},
                success: function (data) {
                    if (data.success) {
                        toastr.success(data.message);
                        dataTable.ajax.reload();
                    } else {
                        toastr.error(data.message);
                    }
                },
                error: function () {
                    toastr.error("刪除時發生錯誤。");
                }
            })
        }
    })
}

/*
// 提取 URL 中的 ID
function extractIdFromUrl(url) {
    var parts = url.split('/');
    return parts[parts.length - 1];
}
*/
