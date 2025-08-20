(function ($) {
    if (!document.getElementById('auditTable')) return;
    $.ajaxSetup({ cache: false });

    if (window.__currencyAuditInited) return;
    window.__currencyAuditInited = true;

    $(document)
        .off('click', '.btn-fix-remain')
        .off('click', '.btn-view')
        .off('click', '.btn-apply')
        .off('click', '#btnAllHoldings')
        .off('click', '#btnPurgeUnknown')
        .off('click', '#btnFixRemainAll');

    const fmt = (n) => Number(n || 0).toLocaleString();

    const $tbl = $('#auditTable').DataTable({
        dom: 'rtip',
        paging: false,
        info: false,
        searching: false,
        columns: [
            { data: 'name' },
            { data: 'totalIssued', className: 'text-end', render: fmt },
            { data: 'remain', className: 'text-end', render: fmt },
            { data: 'givenOut', className: 'text-end', render: fmt }, // = 發行-剩餘
            { data: 'usersHold', className: 'text-end', render: fmt }, // 來自總表（同一真相）
            {
                data: 'diff',
                className: 'text-end',
                render: v => {
                    const cls = v === 0 ? 'text-success' : (v > 0 ? 'text-primary' : 'text-danger');
                    const sign = v > 0 ? '+' : '';
                    return `<span class="${cls}">${sign}${fmt(v)}</span>`;
                }
            },
            {
                data: null, orderable: false,
                render: row => `
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-secondary me-1 btn-view"
                    data-id="${row.currencyTypeId}" data-name="${row.name}">明細</button>
            <button class="btn btn-sm btn-outline-warning btn-fix-remain"
                    data-id="${row.currencyTypeId}">一鍵修正剩餘</button>
          </div>`
            }
        ]
    });

    function loadAudit() {
        $.ajax({
            url: '/Admin/CurrencyAudit/GetAudit',
            method: 'GET',
            data: { _: Date.now() }
        }).done(rows => {
            $tbl.clear().rows.add(rows).draw();
        });
    }
    loadAudit();

    // 單一幣種：一鍵修正剩餘
    $(document).on('click', '.btn-fix-remain', function () {
        const id = $(this).data('id');
        if (!confirm('確定將此幣種的剩餘數量校正為「發行總數 - 使用者持有總和」嗎？')) return;
        $.post('/Admin/CurrencyAudit/FixRemain', { currencyTypeId: id }, function (res) {
            if (res && res.success) { alert('已完成校正。'); loadAudit(); }
            else { alert(res.message || '校正失敗'); }
        });
    });

    // ★ 全部幣種：一鍵修正剩餘（以總表為主），後端回 rows 直接重繪
    $(document).on('click', '#btnFixRemainAll', function () {
        if (!confirm('將依「所有人持幣總表」校正所有幣種：剩餘 = 發行量 - 總持幣。確定？')) return;
        $.post('/Admin/CurrencyAudit/FixRemainAll', function (res) {
            if (res && res.success) {
                if (res.rows) { $tbl.clear().rows.add(res.rows).draw(); }
                else { loadAudit(); }
                alert('已完成全部幣種校正。');
            } else {
                alert('校正失敗，請稍後再試');
            }
        });
    });

    // ===== 單幣種：持有人列表 + 補正 =====
    const usersModalEl = document.getElementById('usersModal');
    const usersModal = usersModalEl ? new bootstrap.Modal(usersModalEl) : null;

    $(document).on('click', '.btn-view', function () {
        const id = $(this).data('id');
        const name = $(this).data('name');
        $('#usersModalTitle').text(`「${name}」持有人列表`);
        const $tbody = $('#usersTable tbody').empty();

        $.ajax({
            url: '/Admin/CurrencyAudit/UsersByCurrency',
            method: 'GET',
            data: { currencyTypeId: id, _: Date.now() }
        }).done(function (res) {
            const list = res && res.items ? res.items : [];
            $('#usersTotal').text(Number(res && res.total || 0).toLocaleString());
            $('#usersCount').text(Number(res && res.count || 0));

            if (!list.length) {
                $tbody.append('<tr><td colspan="3" class="text-center text-muted">無持有資料</td></tr>');
            } else {
                list.forEach(u => {
                    const row = `
            <tr data-userid="${u.userId}" data-currencyid="${id}">
              <td>${u.name}</td>
              <td class="text-end current-balance" data-order="${u.balance}">${u.balance}</td>
              <td>
                <div class="input-group input-group-sm">
                  <input type="number" class="form-control target-balance" value="${u.balance}" />
                  <button class="btn btn-outline-primary btn-apply">補正</button>
                </div>
              </td>
            </tr>`;
                    $tbody.append(row);
                });
            }
            usersModal && usersModal.show();
        }).fail(function () {
            $tbody.empty().append('<tr><td colspan="3" class="text-center text-danger">讀取失敗</td></tr>');
            usersModal && usersModal.show();
        });
    });

    // 單人補正
    $(document).on('click', '.btn-apply', function () {
        const $tr = $(this).closest('tr');
        const userId = $tr.data('userid');
        const currencyTypeId = $tr.data('currencyid');
        const target = parseInt($tr.find('.target-balance').val(), 10);
        if (isNaN(target)) return;

        $.post('/Admin/CurrencyAudit/FixUserBalance',
            { userId, currencyTypeId, targetBalance: target, memo: '對帳補正' },
            function (res) {
                if (res && res.success) {
                    $tr.find('.current-balance').text(target).attr('data-order', target);
                    alert('已補正使用者餘額。');
                    reloadUsersModalTotals();
                    loadAudit(); // 主表同步刷新
                } else {
                    alert(res.message || '補正失敗');
                }
            });
    });

    function reloadUsersModalTotals() {
        let sum = 0, cnt = 0;
        $('#usersTable tbody tr').each(function () {
            const $td = $(this).find('.current-balance');
            if ($td.length) {
                const v = parseInt($td.text(), 10);
                if (!isNaN(v)) { sum += v; cnt++; }
            }
        });
        $('#usersTotal').text(sum.toLocaleString());
        $('#usersCount').text(cnt);
    }

    // ===== 所有人持幣總表 =====
    $(document).on('click', '#btnAllHoldings', fetchAndRenderAllHoldings);

    function fetchAndRenderAllHoldings() {
        $.ajax({
            url: '/Admin/CurrencyAudit/AllHoldings',
            method: 'GET',
            data: { _: Date.now() }
        }).done(renderAllHoldings)
            .fail(() => alert('系統異常，請稍候再試'));
    }

    function renderAllHoldings(res) {
        $('#allUsersCount').text(res.rows.length);
        $('#allGrandTotal').text(Number(res.grandTotal || 0).toLocaleString());

        const $table = $('#allHoldingsTable');
        const $thead = $table.find('thead').empty();
        const $tbody = $table.find('tbody').empty();
        const $tfoot = $table.find('tfoot').empty();

        // 表頭
        let headHtml = '<tr><th>使用者</th>';
        res.currencies.forEach(c => {
            const name = c.name ?? c.Name;
            headHtml += `<th class="text-end">${name}</th>`;
        });
        headHtml += `<th class="text-end">合計</th></tr>`;
        $thead.append(headHtml);

        // 表身
        res.rows.forEach(r => {
            let tr = `<tr><td>${r.name}</td>`;
            res.currencies.forEach(c => {
                const key = c.id ?? c.Id;
                const v = (r.balances && (r.balances[key] ?? r.balances[String(key)])) || 0;
                tr += `<td class="text-end" data-order="${v}">${v}</td>`;
            });
            tr += `<td class="text-end fw-semibold" data-order="${r.rowTotal}">${r.rowTotal}</td></tr>`;
            $tbody.append(tr);
        });

        // 表尾（總計）
        let foot = '<tr><th class="text-end">總計</th>';
        res.currencies.forEach(c => {
            const key = c.id ?? c.Id;
            const t = (res.totals && (res.totals[key] ?? res.totals[String(key)])) || 0;
            foot += `<th class="text-end" data-order="${t}">${t}</th>`;
        });
        foot += `<th class="text-end" data-order="${res.grandTotal || 0}">${res.grandTotal || 0}</th></tr>`;
        $tfoot.append(foot);

        // 異常提醒（不在表內的幣）
        $.ajax({
            url: '/Admin/CurrencyAudit/UnknownSummary',
            method: 'GET',
            data: { _: Date.now() }
        }).done(function (s) {
            if (s && s.countLogs > 0) {
                $('#unknownCount').text(s.countLogs);
                $('#unknownUsers').text(s.affectedUsers);
                $('#unknownWarn').removeClass('d-none');
            } else {
                $('#unknownWarn').addClass('d-none');
            }
        });

        // 顯示 Modal 後再初始化 DataTables
        const modalEl = document.getElementById('allHoldingsModal');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        $(modalEl).one('shown.bs.modal', function () {
            if ($.fn.DataTable.isDataTable($table)) $table.DataTable().destroy();
            $table.DataTable({
                dom: 'lrtip',
                paging: true,
                pageLength: 10,
                lengthChange: false,
                info: false,
                searching: true,
                ordering: true,
                autoWidth: false,
                scrollX: true,
                columnDefs: [
                    { targets: 0, className: '' },
                    { targets: '_all', className: 'text-end' }
                ],
                drawCallback: function () {
                    $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
                }
            });
            setTimeout(() => {
                $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
            }, 60);
        });

        // 關閉時銷毀
        $(modalEl).off('hidden.bs.modal').on('hidden.bs.modal', function () {
            if ($.fn.DataTable.isDataTable($table)) $table.DataTable().destroy();
        });
    }

    // 清除「不在表內的幣」
    $(document).on('click', '#btnPurgeUnknown', function () {
        if (!confirm('此動作將刪除所有「不在幣種表中的」持幣紀錄（不可復原）。確定要繼續嗎？')) return;
        $.post('/Admin/CurrencyAudit/PurgeUnknownCurrencies', function (res) {
            if (res && res.success) {
                alert(`已清除 ${res.deleted} 筆紀錄。`);
                $('#unknownWarn').addClass('d-none');
                loadAudit();
                fetchAndRenderAllHoldings();
            } else {
                alert('清除失敗，請稍後再試');
            }
        });
    });

})(jQuery);
