//Product.js
var dataTable;
$(function() {
    loadDataTable();
});

function loadDataTable() {
    dataTable = $('#tblData').DataTable({
        "scrollX": true, // 啟用橫向卷軸
        "ajax":
        {
            url: '/admin/product/getall'
        },
        "columns":
        [
                { data: 'name', "width": "15%","className": "text-center" },
                { data: 'category.name', "width": "10%", "className": "text-center" },
                { data: 'size', "width": "10%", "className": "text-center" },
                { data: 'price', "width": "10%", "className": "text-center" },
                { data: 'description', "width": "25%" },
            {
                data: 'id',
                "render": function (data)
                {
                    return `<div class="w-75 btn-group" role="group">
                            <a href="/admin/product/upsert?id=${data}" class="btn btn-primary mx-2"><i class="bi
                            bi-pencil-square"></i>編輯</a>

                            <a onClick=Delete('/admin/product/delete/${data}') class="btn btn-danger mx-2"><i class="bi
                            bi-trash-fill"></i>刪除</a>
                            </div>`
                },
                "width": "20%",
                "className": "text-center"
            }
        ]
    });
}

function Delete(url)
{
    Swal.fire({
        title: "確定刪除?",
        text: "您將無法恢復此狀態！",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "是的, 刪除它!",
        cancelButtonText:"取消"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: url,
                type: 'DELETE',
                success:function(data) {
                    dataTable.ajax.reload();
                    toastr.success(data.message);
                }
            })
        }
    });
}