// user.js  — 支援 A 方案（刪除帳號同時回收餘幣至幣種庫存，並寫入點數記錄）
// 注意：後端 /Admin/User/Delete 必須已採用 A 方案的刪除實作

var dataTable;

$(function () {
    loadDataTable();
});

function loadDataTable() {
    dataTable = $('#tblUserData').DataTable({
        scrollX: true,
        ajax: { url: '/admin/user/getall' },
        columns: [
            { data: 'name', width: "15%", className: "text-center" },
            { data: 'address', width: "30%", className: "text-center" },
            { data: 'storeName', width: "15%", className: "text-center" },
            { data: 'phoneNumber', width: "15%", className: "text-center" },
            {
                data: 'id',
                render: function (id) {
                    const editUrl = `/admin/user/upsert?id=${encodeURIComponent(id)}`;
                    return `
                        <div class="btn-group" role="group">
                            <a href="${editUrl}" class="btn btn-primary mx-1">
                                <i class="bi bi-pencil-square"></i> 編輯
                            </a>
                            <button type="button" class="btn btn-danger mx-1"
                                    onclick="DeleteUser('${encodeURIComponent(id)}')">
                                <i class="bi bi-trash-fill"></i> 刪除
                            </button>
                        </div>`;
                },
                width: "25%",
                className: "text-center",
                orderable: false
            }
        ],
        order: [[0, "asc"]],
        responsive: true
    });
}

/**
 * 刪除使用者（A 方案）
 * - 後端會自動：
 *   1) 把該使用者持有的各幣種餘額回收至「幣種庫存」(CurrencyType.RemainQuantity += balance)
 *   2) 寫入一筆使用者負數的 UserCurrencyLog：Action="刪除帳號退幣"、Memo="系統回收至庫存"
 *   3) 再刪除使用者帳號（同一交易處理）
 */
function DeleteUser(encodedId) {
    const id = decodeURIComponent(encodedId);
    const urlDelete = `/admin/user/delete/${encodeURIComponent(id)}`;

    Swal.fire({
        title: "確定刪除這位使用者？",
        html: `
            <div class="text-start">
              <p class="mb-2">此動作將：</p>
              <ol class="mb-2 ps-3">
                <li>自動回收該使用者持有的所有幣，<b>補回幣種庫存</b></li>
                <li>於「點數記錄」寫入一筆 <code>刪除帳號退幣</code> 的負數紀錄</li>
                <li>最後刪除使用者帳號</li>
              </ol>
              <p class="mb-0 text-danger">此操作無法復原，請再次確認。</p>
            </div>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "是的，刪除並回收！",
        cancelButtonText: "取消",
        allowOutsideClick: false,
        allowEscapeKey: true
    }).then((result) => {
        if (!result.isConfirmed) return;

        // 讀取（若有）Anti-forgery token：不一定需要，有就帶
        const antiToken =
            document.querySelector('input[name="__RequestVerificationToken"]')?.value ||
            document.getElementById('__RequestVerificationToken')?.value ||
            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
            null;

        // 顯示處理中
        Swal.fire({
            title: "處理中…",
            text: "正在回收餘幣並刪除帳號，請稍候。",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        // 主要：用 DELETE 呼叫
        $.ajax({
            url: urlDelete,
            type: 'DELETE',
            dataType: 'json',
            headers: antiToken ? { 'RequestVerificationToken': antiToken } : {},
            success: function (res) {
                Swal.close();
                if (res && res.success) {
                    dataTable.ajax.reload(null, false);
                    toastr.success(res.message || "刪除成功，已回收餘幣並記錄！");
                } else {
                    toastr.error(res?.message || "刪除失敗，請稍後再試。");
                }
            },
            error: function (xhr) {
                Swal.close();

                // 某些環境若不允許 DELETE，可用 POST 備援
                if (xhr && xhr.status === 405) {
                    // 備援：POST /admin/user/delete?id=xxx
                    $.ajax({
                        url: '/admin/user/delete',
                        type: 'POST',
                        dataType: 'json',
                        data: { id: id },
                        headers: antiToken ? { 'RequestVerificationToken': antiToken } : {},
                        success: function (res2) {
                            if (res2 && res2.success) {
                                dataTable.ajax.reload(null, false);
                                toastr.success(res2.message || "刪除成功，已回收餘幣並記錄！");
                            } else {
                                toastr.error(res2?.message || "刪除失敗，請稍後再試。");
                            }
                        },
                        error: function () {
                            toastr.error("刪除失敗（POST 備援）。");
                        }
                    });
                } else {
                    toastr.error("刪除失敗，請稍後再試。");
                }
            }
        });
    });
}
