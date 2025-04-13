/********************************************/
/* savePageToDatabase.js                  */
/*負責儲存資料到資料庫相關功能 (含載入Notes)*/
/********************************************/

// 若頁面上沒有該 input，動態插入，注意要加上 name="file"
if (!document.getElementById("importFileInput")) {
    document.body.insertAdjacentHTML(
        "beforeend",
        '<input type="file" id="importFileInput" name="file" style="display: none;" accept=".xlsx,.xls" onchange="savePageToDatabaseMgr.triggerFileUpload(this)">'
    );
}

class savePageToDatabaseMgr {

    // (★) 新增一個變數，用來記住 "目前載入的 DocumentExport.Id"
    static currentLoadedDocId = null;

    static AnswerDataList = [];
  　 /**
      * (A) 原本：整頁儲存 => /SurveyEdit/ParseHtmlAndSave
      */
        static savePageToDatabase() {  
  
    const pageHtml = document.getElementById("AutoScreen").outerHTML;


    fetch('/Customer/SurveyEdit/ParseHtmlAndSave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageHtml: pageHtml })
    })
        .then(response => {
            // 若成功(2xx) => 用 response.json()
            if (response.ok) {
                return response.json();
            } else {
                // 若非 2xx (例如 400) => 可能是純文字
                return response.text().then(text => {
                    throw new Error(text); // 丟到 catch
                });
            }
        })
        .then(data => {
            // 這裡就能接到 { success: true, message: "...", ... }
            alert("儲存成功：" + data.message);
        })
        .catch(err => {
            // 這裡會接到 throw new Error(text) 的情況
            console.error(err);
            alert("發生錯誤：" + err.message);
        });
    }

    /**
 　　* (B) 動態產生「載入Notes」Modal，若已存在就不建
　　 */
    static createLoadNotesModalIfNeeded() {
        if (document.getElementById('loadNotesModal')) {
            return; // 已存在
        }

        // 動態插入 Modal 結構
        const modalHtml = `
<div class="modal fade" id="loadNotesModal" tabindex="-1" aria-labelledby="loadNotesModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-xl">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="loadNotesModalLabel">載入Notes (DocumentExport)</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="關閉"></button>
      </div>
      <div class="modal-body">
        <table id="documentExportsTable" class="table table-striped table-bordered" style="width:100%">
          <thead>
            <tr>
              <th>Id</th>
              <th>Category</th>
              <th>Station</th>
              <th>PageNo</th>
              <th>Suffix</th>
              <th>DocumentId</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }


    /**
     * (C) 初始化 DataTable (只初始化一次)
     */
    static initDocumentExportsTable() {
        if (window.docExpTable) {
            // 已初始化過
            return;
        }

        // ★ 若要使用 DataTables Buttons，需引入對應 JS/CSS
        window.docExpTable = $('#documentExportsTable').DataTable({

            // 1) 加上 buttons 設定
            dom: 'Bfrtip', // "Bfrtip" => Buttons / Filtering / ...
            buttons: [
                {
                    text: '重排ID',
                    className: 'btn btn-warning',
                    action: function (e, dt, node, config) {
                        // ★ 按下後呼叫後端
                        Swal.fire({
                            title: '確定要重排 ID？',
                            text: '將會同時更新 HtmlSections 的 DocumentExportId。',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: '確定',
                            cancelButtonText: '取消'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                //fetch('/Customer/SurveyEdit/ReorderDocumentExports', {
                                fetch('/Customer/SurveyEdit/ReorderDocumentExportsViaNewTable', {
                                    method: 'POST'
                                })
                                    .then(resp => resp.json())
                                    .then(res => {
                                        if (res.success) {
                                            Swal.fire('完成', res.message, 'success');
                                            dt.ajax.reload(); // 重新載入表格
                                        } else {
                                            Swal.fire('失敗', res.message, 'error');
                                        }
                                    })
                                    .catch(err => {
                                        console.error(err);
                                        Swal.fire('失敗', err.message, 'error');
                                    });
                            }
                        });
                      }
                   },
                   {
                    // 新增匯入/匯出圖示按鈕（僅圖示）
                       text: '<i class="bi bi-box-arrow-in-down"></i>',
                       titleAttr: "匯入/匯出",
                       className: 'btn btn-outline-secondary',
                       action: function (e, dt, node, config) {

                        // 呼叫下拉選單切換函式
                        savePageToDatabaseMgr.showImportExportModal();
                    }
                }
            ],

            ajax: {
                url: '/Customer/SurveyEdit/GetAllDocumentExports', // 後端方法
                dataSrc: ''
            },
            columns: [
                { data: 'id' },
                { data: 'category' },
                { data: 'station' },
                { data: 'pageNo' },
                { data: 'suffix' },
                { data: 'documentId' },
                {
                    data: null,
                    render: function (data, type, row) {
                        // 「載入」 => 將合併後的HTML載到 #AutoScreen
                        // 「刪除」 => 刪除該紀錄
                        return `
<button class="btn btn-sm btn-primary me-2" onclick="savePageToDatabaseMgr.loadDocumentToAutoScreen(${row.id})">
  載入
</button>
<button class="btn btn-sm btn-danger" onclick="savePageToDatabaseMgr.deleteDocument(${row.id})">
  刪除
</button>`;
                    }
                }
            ],
            // 新增設定：將所有欄位的文字水平與垂直置中
            columnDefs: [
                { className: "text-center align-middle", targets: "_all" }
            ]

        });
    }


    /**
     * (D) 打開「載入Notes」Modal
     */
    static openLoadNotesModal() {
        // 1. 動態產生Modal
        savePageToDatabaseMgr.createLoadNotesModalIfNeeded();
        // 2. 初始化 DataTable
        savePageToDatabaseMgr.initDocumentExportsTable();
        // 3. 顯示 Modal
        $('#loadNotesModal').modal('show');
        // 4. 重新載入
        if (window.docExpTable) {
            window.docExpTable.ajax.reload();
        }
    }


    /**
     * (E) 載入 => 將此 DocumentExport 的完整HTML載到 #AutoScreen
     */
    static loadDocumentToAutoScreen(docId) {
        const url = `/Customer/SurveyEdit/GetFullHtml?documentId=${docId}`;
        fetch(url)
            .then(resp => resp.json())
            .then(data => {
                if (data.success) {
                    // 保存當前載入的 DocumentExport.Id，供後續更新用
                    this.currentLoadedDocId = docId;
                    // 呼叫處理函式，處理 HTML 載入與 ID 重編
                    ModuleBlockSettingBarMgr.importTxtAndProcess(data.htmlContent);
                    // 派送自訂事件，讓浮動書本能更新各欄位（包含 debug 資訊）
                    const event = new CustomEvent("DocumentExportLoaded", { detail: data });
                    window.dispatchEvent(event);
                    // 關閉 Notes Modal
                    $('#loadNotesModal').modal('hide');
                } else {
                    alert('載入失敗：' + data.message);
                }
            })
            .catch(err => {
                console.error(err);
                alert('載入資料發生錯誤：' + err.message);
            });
    }


    /**
     * (F) 刪除 DocumentExport
     */
    static deleteDocument(docId) {
        Swal.fire({
            title: '確定要刪除嗎？',
            text: '刪除後將無法恢復',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '刪除',
            cancelButtonText: '取消'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/Customer/SurveyEdit/DeleteDocumentExport/${docId}`, { method: 'DELETE' })
                    .then(resp => resp.json())
                    .then(res => {
                        if (res.success) {
                            Swal.fire('刪除成功', '', 'success');
                            if (window.docExpTable) {
                                window.docExpTable.ajax.reload();
                            }
                        } else {
                            Swal.fire('刪除失敗', res.message, 'error');
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        Swal.fire('刪除失敗', '後端錯誤', 'error');
                    });
            }
        });
    }

    /**
 * (★) 新增：修改Notes => 將目前 #AutoScreen 的內容更新回原DocumentExport.Id
 */
    static updateOriginalNotes() {
        // 1) 確認是否已經載入過某筆 DocumentExport
        if (!this.currentLoadedDocId) {
            alert("尚未載入任何 Notes，無法修改！");
            return;
        }

        // 2) 抓取 #AutoScreen 的 HTML
        const pageHtml = document.getElementById("AutoScreen").outerHTML;

        // 3) 發送 AJAX 到後端 UpdateHtmlSections (請先在後端建立對應 API)
        fetch('/Customer/SurveyEdit/UpdateHtmlSections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                documentId: this.currentLoadedDocId,
                htmlContent: pageHtml
            })
        })
            .then(resp => {
                if (!resp.ok) {
                    return resp.text().then(text => { throw new Error(text); });
                }
                return resp.json();
            })
            .then(data => {
                if (data.success) {
                    alert("修改成功：" + data.message);
                } else {
                    alert("修改失敗：" + data.message);
                }
            })
            .catch(err => {
                console.error(err);
                alert("修改過程發生錯誤：" + err.message);
            });
    }





    /**
 * 靜態方法：動態生成匯入/匯出 Modal 視窗
 */
    static showImportExportModal() {
        let modal = document.getElementById("importExportModal");
        if (!modal) {
            // 若不存在則生成 Modal HTML
            const modalHtml = `
<div class="modal fade" id="importExportModal" tabindex="-1" aria-labelledby="importExportModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="importExportModalLabel">匯入 / 匯出</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="關閉"></button>
      </div>
      <div class="modal-body">
        <div class="d-grid gap-3">
          <button type="button" class="btn btn-success" onclick="savePageToDatabaseMgr.triggerExport()">匯出</button>
          <button type="button" class="btn btn-info" onclick="savePageToDatabaseMgr.triggerImport()">匯入</button>
        </div>
      </div>
    </div>
  </div>
</div>`;
            document.body.insertAdjacentHTML("beforeend", modalHtml);
            modal = document.getElementById("importExportModal");
        }
        // 使用 Bootstrap Modal API 顯示 Modal
        const bsModal = new bootstrap.Modal(modal, { keyboard: false });
        bsModal.show();
    }


    /**
   * 靜態方法：點選匯出，關閉 Modal 並導向後端 API
   */
    static triggerExport() {
        const modalElem = document.getElementById("importExportModal");
        const bsModal = bootstrap.Modal.getInstance(modalElem);
        if (bsModal) { bsModal.hide(); }
        window.location.href = '/Customer/SurveyEdit/ExportDocumentData';
    }

    /**
     * 靜態方法：點選匯入，關閉 Modal 並觸發檔案選擇器
     */
    static triggerImport() {
        const modalElem = document.getElementById("importExportModal");
        const bsModal = bootstrap.Modal.getInstance(modalElem);
        if (bsModal) { bsModal.hide(); }
        document.getElementById("importFileInput").click();
    }

    /**
   * 靜態方法：當檔案選擇器改變時，上傳檔案，並刷新 loadNotesModal 的 DataTable
   * @param {HTMLInputElement} input
   */
    static triggerFileUpload(input) {
        if (input.files.length === 0) {
            alert("請選擇一個 Excel 檔案！");
            return;
        }
        console.log("檔案選擇成功，檔案名稱：" + input.files[0].name + "，大小：" + input.files[0].size + " bytes");

        // 顯示 loading Modal 提示
        let loadingModalHtml = `
<div class="modal fade" id="importLoadingModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content" style="background: transparent; border: none; box-shadow: none;">
      <div class="modal-body text-center">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>檔案上傳中，請稍候...</p>
      </div>
    </div>
  </div>
</div>`;
        document.body.insertAdjacentHTML("beforeend", loadingModalHtml);
        const loadingModalElem = document.getElementById("importLoadingModal");
        const bsLoadingModal = new bootstrap.Modal(loadingModalElem, { keyboard: false });
        bsLoadingModal.show();

        const formData = new FormData();
        formData.append("file", input.files[0]);

        fetch('/Customer/SurveyEdit/ImportDocumentData', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                // 關閉 loading Modal
                bsLoadingModal.hide();
                // 移除 loading Modal 的 HTML
                loadingModalElem.remove();
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    return response.json();
                } else {
                    return response.text().then(text => { throw new Error(text); });
                }
            })
            .then(data => {
                if (data.success) {
                    alert("匯入成功：" + data.message);
                    // 刷新 loadNotesModal 中的 DataTable
                    if (window.docExpTable) { window.docExpTable.ajax.reload(); }
                    // 顯示載入Notes Modal 以呈現更新資料
                    $('#loadNotesModal').modal('show');
                } else {
                    alert("匯入失敗：" + data.message);
                }
            })
            .catch(err => {
                bsLoadingModal.hide();
                loadingModalElem.remove();
                console.error(err);
                alert("匯入發生錯誤：" + err.message);
            });
    }

    /**
   * 切換編輯模態視窗的「編輯功能」：當關閉時，雙擊 label 無反應；當開啟時，雙擊 label 可正常呼出編輯模態視窗。
   */
    static toggleEditModal() {
        // 如果全域變數未定義，預設設為 true
        if (window.editingModalEnabled === undefined) {
            window.editingModalEnabled = true;
        }
        // 如果目前編輯功能啟用，則關閉
        if (window.editingModalEnabled) {


            surveyEditer.removeAllLabelTextClick();


            window.editingModalEnabled = false;
            // 如果編輯模態視窗目前處於開啟狀態，則先關閉
            var editModalEl = document.getElementById('editTextModal');
            var modalInstance = bootstrap.Modal.getOrCreateInstance(editModalEl);
            if (editModalEl.classList.contains('show')) {
                modalInstance.hide();
            }
            alert("編輯功能已關閉，雙擊標籤將不再呼出編輯視窗。");
        } else {

            surveyEditer.initAllLabelTextClick();

            // 反之，啟用編輯功能
            window.editingModalEnabled = true;
            // 重新初始化標籤雙擊事件，確保功能恢復
            //surveyEditer.initAllLabelTextClick();
            alert("編輯功能已啟用，雙擊標籤可呼出編輯視窗。");
        }
    }
}

// 將 savePageToDatabaseMgr 設為全域物件
window.savePageToDatabaseMgr = savePageToDatabaseMgr;
