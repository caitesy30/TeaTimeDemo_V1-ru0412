//station.js
var dataTable;

$(function () {
    // 加載 DataTable
    loadDataTable();
});

function loadDataTable() {
    dataTable = $('#tblData').DataTable({
        "ajax": {
            url: '/admin/station/getall'
        },
        "order": [[1, "asc"]], // 默认按第二列（DisplayOrder）升序排列
        "fixedHeader": true,  // 固定標題
        "columns": [
            { data: 'name', "width": "25%" },
            { data: 'displayOrder', "width": "15%" },
            { data: 'remark', "width": "10%" },
            {
                data: 'id',
                "render": function (data) {
                    return `
                        <div class="w-75 btn-group" role="group">
                            <a href="/admin/station/upsert?id=${data}" class="btn btn-primary mx-2"><i class="bi bi-pencil-square"></i>Edit</a>
                            <a onClick=Delete('/admin/station/delete/${data}') class="btn btn-danger mx-2"><i class="bi bi-trash-fill"></i>Delete</a>
                        </div>`;
                },
                "width": "15%"
            }
        ]
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
                type: 'DELETE',
                success: function (data) {
                    dataTable.ajax.reload();
                    toastr.success(data.message);
                }
            })
        }
    })
}