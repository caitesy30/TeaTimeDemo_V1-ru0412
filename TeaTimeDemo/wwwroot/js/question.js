// wwwroot/js/question.js

$(document).ready(function () {
    $('#tblData').DataTable({
        "ajax": {
            "url": "/admin/Question/GetAll",
            "type": "GET",
            "datatype": "json",
            "dataSrc": function (json) {
                console.log("Received data:", json);
                return json.data;
            }
        },
        "columns": [
            { "data": "id", "width": "5%" }, // ID
            { "data": "surveyId", "width": "10%" }, // 問卷ID
            { "data": "surveyTitle", "width": "15%" }, // 問卷標題
            { "data": "questionText", "width": "25%" }, // 問題文本
            {
                "data": "answerType",
                "width": "10%",
                "render": function (data) {
                    // 根據 AnswerTypeEnum 的值顯示相應文字
                    switch (parseInt(data)) {
                        case 0: return "單選";
                        case 1: return "多選";
                        case 2: return "填空";
                        case 3: return "填空框";
                        case 4: return "下拉選單";
                        case 5: return "圖片上傳";
                        default: return "未知";
                    }
                }
            }, // 答案類型
            { "data": "sortOrder", "width": "10%" }, // 排序順序
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
                            <a href="/admin/question/edit/${data}" class="btn btn-primary mx-1">
                                <i class="bi bi-pencil-square"></i> 編輯
                            </a>
                            <a class="btn btn-danger mx-1" onclick="Delete('/admin/question/delete/${data}')">
                                <i class="bi bi-trash-fill"></i> 刪除
                            </a>
                            <button onclick="MoveUp(${data}, ${row.surveyId})" class="btn btn-secondary mx-1">
                                <i class="bi bi-arrow-up"></i> 上移
                            </button>
                            <button onclick="MoveDown(${data}, ${row.surveyId})" class="btn btn-secondary mx-1">
                                <i class="bi bi-arrow-down"></i> 下移
                            </button>
                            <a href="/admin/question/insert/${data}" class="btn btn-success mx-1">
                                <i class="bi bi-plus-circle"></i> 插入問題
                            </a>
                        </div>`;
                },
                "width": "30%" // 調整寬度以容納新增按鈕
            } // 操作
        ],
        "order": [[1, "asc"]], // 按 surveyId 進行初始排序
        "responsive": true,
        "autoWidth": false
    });
});

// 格式化日期的函數
function formatDate(data) {
    if (!data) return "";
    var date = new Date(data);
    return date.toLocaleString();
}

// 刪除功能
function Delete(url) {
    Swal.fire({
        title: "你確定要刪除這個問題嗎?",
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
                type: 'POST',
                headers: {
                    'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
                },
                success: function (data) {
                    if (data.success) {
                        toastr.success(data.message);
                        $('#tblData').DataTable().ajax.reload();
                    } else {
                        toastr.error(data.message);
                    }
                },
                error: function () {
                    toastr.error("刪除時發生錯誤。");
                }
            });
        }
    })
}

// 上移功能
function MoveUp(id, surveyId) {
    $.ajax({
        url: '/admin/question/moveup',
        type: 'POST',
        data: {
            id: id,
            surveyId: surveyId
        },
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function (response) {
            if (response.success) {
                toastr.success(response.message);
                $('#tblData').DataTable().ajax.reload();
            } else {
                toastr.warning(response.message);
            }
        },
        error: function () {
            toastr.error("上移操作時發生錯誤。");
        }
    });
}

// 下移功能
function MoveDown(id, surveyId) {
    $.ajax({
        url: '/admin/question/movedown',
        type: 'POST',
        data: {
            id: id,
            surveyId: surveyId
        },
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function (response) {
            if (response.success) {
                toastr.success(response.message);
                $('#tblData').DataTable().ajax.reload();
            } else {
                toastr.warning(response.message);
            }
        },
        error: function () {
            toastr.error("下移操作時發生錯誤。");
        }
    });
}
