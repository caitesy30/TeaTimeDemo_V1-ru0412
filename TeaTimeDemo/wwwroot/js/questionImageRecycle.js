// questionImageRecycle.js
$(document).ready(function () {
    var table = $('#tblDeletedData').DataTable({
        "scrollX": true,
        "ajax": {
            "url": "/admin/questionimage/getdeleted", // 後端取得已刪除圖片資料的 API
            "type": "GET",
            "datatype": "json",
            "error": function (xhr, status, error) {
                console.error("DataTables AJAX Error:", status, error);
                toastr.error("載入回收筒資料失敗: " + error);
            }
        },
        "columns": [
            { "data": "id", "className": "text-center" },
            {
                "data": "imageUrl",
                "className": "text-center",
                "render": function (data) {
                    if (data && data !== "無效的Base64字串") {
                        return `<img src="${data}" alt="Image" width="100" height="100" class="previewable"/>`;
                    }
                    return "無圖片";
                }
            },
            {
                "data": "imageUrl",
                "render": function (data) {
                    if (data && data !== "無效的Base64字串") {
                        return `<span class="previewable-path" data-img="${data}" style="cursor:pointer; text-decoration:underline;">${data}</span>`;
                    }
                    return "";
                }
            },
            { "data": "surveyId", "className": "text-center" },
            { "data": "questionId", "defaultContent": "", "className": "text-center" },
            { "data": "questionOptionId", "defaultContent": "", "className": "text-center" },
            { "data": "description" },
            { "data": "width", "className": "text-center" },
            { "data": "height", "className": "text-center" },
            {
                // 刪除時間從 DTO 沒有直接欄位，需在 DTO 加上 DeletedAt，若沒有請加上
                // 假設已在 DTO 加上 DeletedAt
                "data": "deletedAt",
                "defaultContent": "",
                "className": "text-center",
                "render": function (data) {
                    if (data) {
                        var date = new Date(data);
                        return date.getFullYear() + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + String(date.getDate()).padStart(2, '0');
                    }
                    return "";
                }
            },
            {
                "data": "id",
                "className": "text-center",
                "render": function (data, type, row) {
                    // 使用表單 POST 還原與永久刪除
                    return `
                        <form action="/admin/questionimage/restore/${data}" method="post" style="display:inline">
                            <input type="hidden" name="__RequestVerificationToken" value="${$('input[name="__RequestVerificationToken"]').val()}" />
                            <button type="submit" class="btn btn-sm btn-success" onclick="return confirm('您確定要恢復此圖片嗎？');">恢復</button>
                        </form>
                        <form action="/admin/questionimage/permanentdelete/${data}" method="post" style="display:inline; margin-left:5px;">
                            <input type="hidden" name="__RequestVerificationToken" value="${$('input[name="__RequestVerificationToken"]').val()}" />
                            <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('您確定要永久刪除此圖片嗎？此操作無法復原。');">永久刪除</button>
                        </form>
                    `;
                }
            },
            { "data": "imageExtension", "visible": false },
            { "data": "imageBase64Parts", "visible": false }
        ],
        "language": {
            "url": "/js/i18n/Chinese-traditional.json"
        }
    });

    // 預覽容器相關控制
    var $previewContainer = $('#imagePreviewContainer');
    var $previewImg = $('#imagePreview');

    $('#tblDeletedData tbody').on('mouseenter', '.previewable, .previewable-path', function () {
        var imgSrc = $(this).hasClass('previewable') ? $(this).attr('src') : $(this).data('img');
        if (imgSrc && imgSrc !== "無效的Base64字串") {
            $previewImg.attr('src', imgSrc);
            $previewContainer.show();
        }
    }).on('mouseleave', '.previewable, .previewable-path', function () {
        $previewContainer.hide();
        $previewImg.attr('src', '');
    }).on('mousemove', '.previewable, .previewable-path', function (e) {
        var offset = 20;
        $previewContainer.css({
            top: (e.pageY + offset) + 'px',
            left: (e.pageX + offset) + 'px'
        });
    });
});
