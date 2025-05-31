// ==========================
// 檔名：wallet-table.js
// 製作人：茶神
// 日期：2024-05-31
// 目的：初始化錢包資料表 DataTable
// ==========================

$(function () {
    var table = $('#walletTable').DataTable({
        dom: 'rtip',
        paging: true,
        pageLength: 5,
        ordering: true,
        searching: true,
        info: false,
        lengthChange: false
    });
    $('.dataTables_filter').hide();
    $('.search-btn').on('click', function () {
        var $inp = $('#walletSearch');
        $inp.toggleClass('d-none');
        if (!$inp.hasClass('d-none')) {
            $inp.focus();
        } else {
            $inp.val('');
            table.search('').draw();
        }
    });
    $('#walletSearch').on('keyup', function () {
        table.search(this.value).draw();
    });

    // 交易紀錄表
    $('#logTable').DataTable({
        paging: true,
        pageLength: 10,
        ordering: true,
        searching: false,
        info: false,
        lengthChange: false
    });
});
