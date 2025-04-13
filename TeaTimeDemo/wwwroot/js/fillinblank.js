// wwwroot/js/admin/fillinblank.js

$(document).ready(function () {
    $('#tblFillInBlank').DataTable({
        "ajax": {
            "url": "/admin/FillInBlank/GetAll",
            "type": "GET",
            "datatype": "json",
            "dataSrc": "data"
        },
        "columns": [
            { "data": "id", "width": "10%" },
            { "data": "blankNumber", "width": "15%" },
            { "data": "placeholder", "width": "30%" },
            { "data": "length", "width": "10%" },
            { "data": "position", "width": "15%" },
            {
                "data": "id",
                "render": function (data, type, row) {
                    return `
                        <div class="btn-group" role="group">
                            <a href="/admin/FillInBlank/Edit/${data}" class="btn btn-primary btn-sm">
                                <i class="bi bi-pencil-square"></i> 編輯
                            </a>
                            <button class="btn btn-danger btn-sm" onclick="DeleteFillInBlank(${data})">
                                <i class="bi bi-trash-fill"></i> 刪除
                            </button>
                        </div>`;
                },
                "width": "30%"
            }
        ],
        "order": [[0, "asc"]],
        "responsive": true,
        "autoWidth": false
    });
});

// 刪除填空題的函數
function DeleteFillInBlank(id) {
    Swal.fire({
        title: '你確定要刪除這個填空題嗎？',
        text: "刪除後將無法恢復！",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '是的，刪除它！'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/admin/FillInBlank/Delete',
                type: 'POST',
                data: { id: id },
                headers: {
                    'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
                },
                success: function (data) {
                    if (data.success) {
                        toastr.success(data.message);
                        $('#tblFillInBlank').DataTable().ajax.reload();
                    } else {
                        toastr.error(data.message);
                    }
                },
                error: function () {
                    toastr.error('刪除時發生錯誤。');
                }
            });
        }
    });
}
