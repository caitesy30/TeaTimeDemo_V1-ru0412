//SurveyController的index中的survey.js
var dataTable;
$(function () {
    loadDataTable();
});

function loadDataTable() {
    dataTable = $('#tblData').DataTable({
        "ajax": {
            url: '/admin/survey/getall',
            type: "GET",
            datatype: "json",
            "dataSrc": "data"
        },
        "fixedHeader": true,
        "columns": [
            { "data": "categoryName", "width": "10%" },  // 確保與 SurveyDTO 的 CategoryName 對應
            { "data": "title", "width": "15%" },
            { "data": "stationName", "width": "10%" },
            { "data": "description", "width": "15%" },
            { "data": "questionNum", "width": "5%" },
            { "data": "isPublished", "width": "5%" },
            { "data": "createTime", "width": "10%", "render": function (data) { return data; } },
            { "data": "completeTime", "width": "10%", "render": function (data) { return data; } },
            { "data": "jobName", "width": "10%" },
            {
                "data": "id",
                "render": function (data, type, row) {
                    var publishButton = row.isPublished === "是"
                        ? `<button class="btn btn-secondary mx-2" onclick="togglePublish(${data})">取消發佈</button>`
                        : `<button class="btn btn-secondary mx-2" onclick="togglePublish(${data})">發佈</button>`;

                    return `
                        <div class="w-75 btn-group" role="group">
                            <a href="/admin/survey/upsert?id=${data}" class="btn btn-primary mx-2">
                                <i class="bi bi-pencil-square"></i> 編輯
                            </a>
                            <button class="btn btn-danger mx-2" onClick="Delete('/admin/survey/delete/${data}')">
                                <i class="bi bi-trash-fill"></i> 刪除
                            </button>
                            ${publishButton}
                        </div>`;
                },
                "width": "20%"
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
        url: `/admin/survey/togglepublish/${id}`,
        type: 'POST',
        success: function (data) {
            if (data.success) {
                dataTable.ajax.reload();  // 刷新表格
                toastr.success(data.message);
            } else {
                toastr.error(data.message);
            }
        }
    });
}

function Delete(url) {
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
                    dataTable.ajax.reload();
                    toastr.success(data.message);
                }
            })
        }
    });
}
