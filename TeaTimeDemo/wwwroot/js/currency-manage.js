$(function () {
    // 取得目前正確 Controller 路徑
    function getControllerPath() {
        let path = window.location.pathname;
        // /Admin/CurrencyType/Index → /Admin/CurrencyType/
        if (path.endsWith("/Index")) path = path.slice(0, -6);
        if (!path.endsWith("/")) path += "/";
        return path;
    }
    // 取得正確的 Import/Export action 路徑
    function getExportExcelUrl() { return getControllerPath() + "ExportExcel"; }
    function getImportExcelUrl() { return getControllerPath() + "ImportExcel"; }

    // 匯入/匯出UI 動態插入
    $('#importExportSlot').after(`<div class="float-end position-relative" id="importExportUI"></div>`);
    let $ui = $('#importExportUI');
    $ui.html(`
        <div class="dropdown">
            <button id="importExportBtn" class="btn btn-light p-2" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="匯入/匯出">
                <svg width="28" height="28" viewBox="0 0 32 32">
                    <rect x="5" y="5" width="22" height="22" rx="5" fill="#f1f1f1" stroke="#55c6f7" stroke-width="2"/>
                    <path d="M16 11 L16 21" stroke="#3798db" stroke-width="2" stroke-linecap="round"/>
                    <polygon points="16,7 12,13 20,13" fill="#3798db"/>
                    <path d="M16 21 L16 11" stroke="#67CEB2" stroke-width="2" stroke-linecap="round"/>
                    <polygon points="16,25 12,19 20,19" fill="#67CEB2"/>
                </svg>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm mt-1" style="min-width:150px;">
                <li>
                    <a class="dropdown-item" id="doExportExcel" href="#">
                        <svg width="18" height="18" viewBox="0 0 18 18" style="vertical-align:middle;margin-right:4px;">
                            <rect x="3" y="3" width="12" height="12" rx="3" fill="#eaf7fc" stroke="#66baff" stroke-width="1"/>
                            <path d="M9 5v6" stroke="#3798db" stroke-width="2" stroke-linecap="round"/>
                            <polygon points="9,13 6,10 12,10" fill="#3798db"/>
                        </svg>
                        匯出
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="#" id="doImportExcelBtn">
                        <svg width="18" height="18" viewBox="0 0 18 18" style="vertical-align:middle;margin-right:4px;">
                            <rect x="3" y="3" width="12" height="12" rx="3" fill="#f1faf0" stroke="#67CEB2" stroke-width="1"/>
                            <path d="M9 13V7" stroke="#44b78b" stroke-width="2" stroke-linecap="round"/>
                            <polygon points="9,5 6,8 12,8" fill="#67CEB2"/>
                        </svg>
                        匯入
                    </a>
                    <form id="importExcelForm" method="post" enctype="multipart/form-data" style="display:none;">
                        <input type="file" id="importExcelInput" name="file" accept=".xlsx"/>
                    </form>
                </li>
            </ul>
        </div>
    `);

    // 修正 form action
    $('#importExcelForm').attr('action', getImportExcelUrl());

    // loading 動畫（SVG三點閃爍）動態插入
    if ($('#loading-overlay').length === 0) {
        $('body').append(`
            <div id="loading-overlay" style="display:none; position:fixed;z-index:9999;left:0;top:0;right:0;bottom:0; background:rgba(255,255,255,0.75); justify-content:center; align-items:center;">
                <div style="display:flex; flex-direction:column; align-items:center;">
                    <svg id="dot-ani" width="60" height="28">
                        <circle cx="12" cy="14" r="6" fill="#67CEB2">
                            <animate attributeName="opacity" values="1;.3;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="0s"/>
                        </circle>
                        <circle cx="30" cy="14" r="6" fill="#67CEB2">
                            <animate attributeName="opacity" values="1;.3;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="0.2s"/>
                        </circle>
                        <circle cx="48" cy="14" r="6" fill="#67CEB2">
                            <animate attributeName="opacity" values="1;.3;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="0.4s"/>
                        </circle>
                    </svg>
                    <div class="loading-text" style="color:#3798db;margin-top:16px;font-size:1.18em;font-weight:500;letter-spacing:1px;">處理中，請稍候...</div>
                </div>
            </div>
        `);
    }

    $('#loading-overlay').hide(); // 確保一進來不顯示

    // DataTable初始化
    var table = $('#currencyTable').DataTable({
        dom: 'lrtip',
        "order": [[0, 'asc']],
        "paging": false,
        "info": false,
        "language": { "zeroRecords": "找不到資料" }
    });
    $('#currencySearch').on('keyup', function () {
        table.search(this.value).draw();
    });

    // 匯出 Excel
    $('#doExportExcel').on('click', function (e) {
        e.preventDefault();
        $('#loading-overlay .loading-text').text('正在匯出，請稍候...');
        $('#loading-overlay').fadeIn();
        window.location.href = getExportExcelUrl();
        setTimeout(function () { $('#loading-overlay').fadeOut(); }, 4000);
    });

    // 匯入 Excel 行為
    $('#doImportExcelBtn').on('click', function (e) {
        e.preventDefault();
        $('#importExcelInput').click();
    });

    // 送出表單時顯示 loading
    $(document).on('change', '#importExcelInput', function () {
        $('#loading-overlay .loading-text').text('正在匯入，請稍候...');
        $('#loading-overlay').fadeIn();
        $('#importExcelForm').submit();
    });

    // 若有AJAX自動隱藏（預防非同步情境）
    $(document).ajaxComplete(function () {
        $('#loading-overlay').fadeOut();
    });

    // =================== 發幣按鈕：JS動態產生Modal ===================
    $(document).on('click', '.send-currency-btn', function () {
        let currencyId = $(this).data('currencyid');
        let currencyName = $(this).data('currencyname');

        // Modal不存在就動態產生
        if ($('#dynamicSendCurrencyModal').length === 0) {
            $('body').append(`
                <div class="modal fade" id="dynamicSendCurrencyModal" tabindex="-1" aria-labelledby="dynamicSendCurrencyModalLabel" aria-hidden="true">
                  <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                      <form id="dynamicSendCurrencyForm" autocomplete="off">
                        <div class="modal-header">
                          <h5 class="modal-title" id="dynamicSendCurrencyModalLabel">發幣給會員</h5>
                          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                          <div class="mb-2">
                            <label for="dynamicMemberSelect" class="form-label">選擇會員</label>
                            <select id="dynamicMemberSelect" class="form-select" required></select>
                          </div>
                          <div class="mb-2">
                            <label for="dynamicCurrencySelect" class="form-label">幣種</label>
                            <select id="dynamicCurrencySelect" class="form-select" required></select>
                          </div>
                          <div class="mb-2">
                            <label for="dynamicAmountInput" class="form-label">數量</label>
                            <input type="number" id="dynamicAmountInput" class="form-control" min="1" value="1" required />
                          </div>
                          <div class="mb-2">
                            <label for="dynamicMemoInput" class="form-label">備註（可空）</label>
                            <input type="text" id="dynamicMemoInput" class="form-control" maxlength="50" />
                          </div>
                          <div id="dynamicSendCurrencyError" class="text-danger small"></div>
                        </div>
                        <div class="modal-footer">
                          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                          <button type="submit" class="btn btn-primary">發幣</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
            `);
        }

        // 幣種資料設定
        $('#dynamicCurrencySelect').html(`<option value="${currencyId}" selected>${currencyName}</option>`);
        $('#dynamicAmountInput').val(1);
        $('#dynamicMemoInput').val('');
        $('#dynamicSendCurrencyError').text('');

        // 取得會員清單並開啟 Modal
        $.get('/Admin/CurrencyType/GetAllMemberList', function (data) {
            let html = '';
            data.forEach(u => html += `<option value="${u.id}">${u.name}</option>`);
            $('#dynamicMemberSelect').html(html);
            $('#dynamicSendCurrencyModal').modal('show');
        });
    });

    // =================== 發幣送出（動態Modal submit） ===================
    $(document).on('submit', '#dynamicSendCurrencyForm', function (e) {
        e.preventDefault();
        let userId = $('#dynamicMemberSelect').val();
        let currencyId = $('#dynamicCurrencySelect').val();
        let amount = parseInt($('#dynamicAmountInput').val(), 10);
        let memo = $('#dynamicMemoInput').val();

        if (!userId || !currencyId || amount <= 0) {
            $('#dynamicSendCurrencyError').text('請完整填寫資料');
            return;
        }
        $.ajax({
            url: '/Admin/CurrencyType/SendCurrency',
            method: 'POST',
            data: {
                userId,
                currencyTypeId: currencyId,
                quantity: amount,
                memo
            },
            success: function (resp) {
                if (resp && resp.success) {
                    // 關掉 modal
                    $('#dynamicSendCurrencyModal').modal('hide');

                    // 取得這次發幣的幣種ID
                    const cid = $('#dynamicCurrencySelect').val();

                    // 找到對應列（那顆「發幣」按鈕在的那列）
                    const $row = $(`#currencyTable button.send-currency-btn[data-currencyid="${cid}"]`).closest('tr');

                    // 用 DataTables API 更新「剩餘數量」欄位（第 5 欄，index 從 0 起算→4）
                    // 若 table 變數在外層已宣告： var table = $('#currencyTable').DataTable({...});
                    if (typeof table !== 'undefined') {
                        table.cell($row, 4).data(resp.newRemain).draw(false);
                    } else {
                        // 萬一沒用到 DataTables API，就直接改 DOM（保險用）
                        $row.find('td').eq(4).text(resp.newRemain);
                    }

                    // 成功提示
                    Swal.fire('發幣成功', resp.message || '', 'success');
                } else {
                    $('#dynamicSendCurrencyError').text(resp?.message || '發幣失敗');
                }
            },
            error: function () {
                $('#dynamicSendCurrencyError').text('系統異常，請稍後再試');
            }
        });
    });

    // =================== Modal關閉時自動清空 ===================
    $(document).on('hidden.bs.modal', '#dynamicSendCurrencyModal', function () {
        $('#dynamicSendCurrencyError').text('');
    });




});
