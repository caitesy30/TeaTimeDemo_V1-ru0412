// user.js
var dataTable;
$(function () {
    loadDataTable();
});

function loadDataTable() {
    dataTable = $('#tblUserData').DataTable({
        "scrollX": true, // 啟用橫向卷軸
        "ajax": {
            url: '/admin/user/getall'
        },
        "columns": [
            { data: 'name', "width": "15%", "className": "text-center" },
            { data: 'address', "width": "30%", "className": "text-center" },
            { data: 'storeName', "width": "15%", "className": "text-center" },
            { data: 'phoneNumber', "width": "15%", "className": "text-center" },
            {
                data: 'id',
                "render": function (data) {
                    return `<div class="btn-group" role="group">
                                <a href="/admin/user/upsert?id=${data}" class="btn btn-primary mx-1"><i class="bi bi-pencil-square"></i> 編輯</a>
                                <a onClick=Delete('/admin/user/delete/${data}') class="btn btn-danger mx-1"><i class="bi bi-trash-fill"></i> 刪除</a>
                            </div>`;
                },
                "width": "25%",
                "className": "text-center"
            }
        ],
        "columnDefs": [
            { "orderable": false, "targets": 4 } // 禁用動作欄位的排序
        ],
        "order": [[0, "asc"]], // 初始排序方式
        "responsive": true // 啟用響應式設計
    });
}

function Delete(url) {
    Swal.fire({
        title: "確定刪除?",
        text: "您將無法恢復此使用者的資料！",
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
                        dataTable.ajax.reload();
                        toastr.success(data.message);
                    }
                    else {
                        toastr.error(data.message);
                    }
                }
            })
        }
    });
}
