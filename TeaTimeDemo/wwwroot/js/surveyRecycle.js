// wwwroot/js/surveyRecycle.js
$(document).ready(function () {
    var table = $('#tblDeletedData').DataTable({
        "scrollX": true,
        "ajax": {
            "url": "/admin/survey/getdeleted", // 後端取得已刪除問卷的 API
            "type": "GET",
            "datatype": "json",
            "error": function (xhr, status, error) {
                console.error("DataTables AJAX Error:", status, error);
                toastr.error("載入回收筒資料失敗: " + error);
            }
        },
        "columns": [
            { "data": "categoryName", "className": "text-center" },
            { "data": "title", "className": "text-center" },
            { "data": "stationName", "className": "text-center" },
            { "data": "description", "className": "text-center" },
            { "data": "questionNum", "className": "text-center" },
            { "data": "isPublished", "className": "text-center" },
            { "data": "createTime", "className": "text-center" },
            { "data": "completeTime", "className": "text-center" },
            { "data": "jobName", "className": "text-center" },
            {
                "data": "id",
                "className": "text-center",
                "render": function (data, type, row) {
                    // 使用 POST 呼叫 Restore 與 PermanentDelete
                    return `
                        <form action="/admin/survey/restore/${data}" method="post" style="display:inline">
                            <input type="hidden" name="__RequestVerificationToken" value="${$('input[name="__RequestVerificationToken"]').val()}" />
                            <button type="submit" class="btn btn-sm btn-success" onclick="return confirm('您確定要恢復此問卷嗎？');">恢復</button>
                        </form>
                        <form action="/admin/survey/permanentdelete/${data}" method="post" style="display:inline; margin-left:5px;">
                            <input type="hidden" name="__RequestVerificationToken" value="${$('input[name="__RequestVerificationToken"]').val()}" />
                            <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('您確定要永久刪除此問卷嗎？此操作無法復原。');">永久刪除</button>
                        </form>
                    `;
                }
            }
        ],
        "language": {
            "url": "/js/i18n/Chinese-traditional.json"
        }
    });
});
