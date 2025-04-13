// questionImage.js
$(document).ready(function () {
    // 初始化 DataTable
    var table = $('#tblData').DataTable({
        "scrollX": true, // 啟用水平滾動
       // "autoWidth": false, // 禁用自動寬度計算
        "ajax": {
            "url": "/admin/questionimage/getall", // 後端取得資料的 API
            "type": "GET",
            "datatype": "json",
            "error": function (xhr, status, error) {
                console.error("DataTables AJAX Error:", status, error);
                toastr.error("載入資料失敗: " + error);
            }
        },
        "columns": [
            { "data": "id", "className": "text-center" },
            {
                "data": "imageUrl",
                "className": "text-center",
                "render": function (data, type, row) {
                    if (data && data !== "無效的Base64字串") {
                        // 顯示縮圖為100px並加入 previewable 類別
                        return `<img src="${data}" alt="Image" width="100" height="100" class="previewable"/>`;
                    }
                    return "無圖片";
                }
            },
            {
                "data": "imageUrl",
                "render": function (data, type, row) {
                    if (data && data !== "無效的Base64字串") {
                        // 圖片路徑文字加上 previewable-path 並從 data-img 屬性取得圖片路徑
                        return `<span class="previewable-path" data-img="${data}" style="cursor:pointer; text-decoration:underline;">${data}</span>`;
                    }
                    return "";
                }
            },
            { "data": "surveyId", "className": "text-center" },
            { "data": "questionId", "defaultContent": "", "className": "text-center" },
            { "data": "questionOptionId", "defaultContent": "", "className": "text-center" },
            { "data": "description" }, // 描述欄位
            { "data": "width", "className": "text-center" },
            { "data": "height", "className": "text-center" },
            {
                "data": "id","className": "text-center",
                "render": function (data, type, row) {
                    return `
                        <div class="text-center">
                            <button class="btn btn-warning text-white me-1" onclick="openEditModal(${data}, '${row.imageUrl}', ${row.width}, ${row.height})">編輯</button>
                            <button class="btn btn-danger text-white" onclick="Delete('/admin/questionimage/delete/${data}')">刪除</button>
                        </div>`;
                }
            },
            { "data": "imageExtension", "visible": false },
            { "data": "imageBase64Parts", "visible": false }
        ],
        "language": {
            "url": "/js/i18n/Chinese-traditional.json" // DataTable 語言設定
        }
    });

    // 預覽容器相關控制
    var $previewContainer = $('#imagePreviewContainer');
    var $previewImg = $('#imagePreview');

    // 對表格內容中 .previewable 或 .previewable-path 綁定事件
    $('#tblData tbody').on('mouseenter', '.previewable, .previewable-path', function (e) {
        var imgSrc = $(this).hasClass('previewable') ? $(this).attr('src') : $(this).data('img');
        if (imgSrc && imgSrc !== "無效的Base64字串") {
            $previewImg.attr('src', imgSrc);
            $previewContainer.show();
        }
    }).on('mouseleave', '.previewable, .previewable-path', function (e) {
        // 滑鼠離開時隱藏預覽
        $previewContainer.hide();
        $previewImg.attr('src', '');
    }).on('mousemove', '.previewable, .previewable-path', function (e) {
        // 更新預覽位置，使預覽顯示在游標附近
        var offset = 20; // 游標偏移值
        $previewContainer.css({
            top: (e.pageY + offset) + 'px',
            left: (e.pageX + offset) + 'px'
        });
    });
});

// 刪除圖片的函式
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
                    $('#tblData').DataTable().ajax.reload();
                    toastr.success(data.message);
                },
                error: function (xhr, status, error) {
                    console.error("刪除錯誤:", status, error);
                    toastr.error("刪除失敗: " + error);
                }
            })
        }
    });
}

// 開啟編輯圖片尺寸的 Modal
function openEditModal(id, imageUrl, width, height) {
    $('#editImageId').val(id);
    $('#editImagePreview').attr('src', imageUrl);
    $('#imageWidthInput').val(width);
    $('#imageHeightInput').val(height);
    $('#imageWidthRange').val(width);
    $('#imageHeightRange').val(height);

    // 綁定輸入事件，更新拉桿與數值同步
    $('#imageWidthInput').off('input').on('input', function () {
        $('#imageWidthRange').val($(this).val());
        updatePreviewSize();
    });
    $('#imageWidthRange').off('input').on('input', function () {
        $('#imageWidthInput').val($(this).val());
        updatePreviewSize();
    });

    $('#imageHeightInput').off('input').on('input', function () {
        $('#imageHeightRange').val($(this).val());
        updatePreviewSize();
    });
    $('#imageHeightRange').off('input').on('input', function () {
        $('#imageHeightInput').val($(this).val());
        updatePreviewSize();
    });

    var myModal = new bootstrap.Modal(document.getElementById('editImageModal'));
    myModal.show();
}

// 更新預覽圖片尺寸
function updatePreviewSize() {
    var newWidth = $('#imageWidthInput').val();
    var newHeight = $('#imageHeightInput').val();
    $('#editImagePreview').css({
        'width': newWidth + 'px',
        'height': newHeight + 'px'
    });
}

// 儲存編輯後的圖片尺寸
$('#saveDimensionsBtn').off('click').on('click', function () {
    var id = $('#editImageId').val();
    var newWidth = $('#imageWidthInput').val();
    var newHeight = $('#imageHeightInput').val();

    $.ajax({
        url: '/admin/questionimage/updatedimensions',
        type: 'POST',
        data: {
            id: id,
            width: newWidth,
            height: newHeight
        },
        success: function (response) {
            if (response.success) {
                toastr.success(response.message);
                $('#tblData').DataTable().ajax.reload();
                var myModalEl = document.getElementById('editImageModal');
                var modal = bootstrap.Modal.getInstance(myModalEl);
                modal.hide();
            } else {
                toastr.error(response.message);
            }
        },
        error: function (xhr) {
            console.log(xhr.responseText);
            toastr.error('更新圖片尺寸時發生錯誤');
        }
    });
});
