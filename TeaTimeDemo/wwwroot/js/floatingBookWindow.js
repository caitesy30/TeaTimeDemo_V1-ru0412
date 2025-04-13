/****************************************************
 * floatingBookWindow.js (大自然深色 + 更寬鬆比對)
 * 功能：
 *   1) 浮動書本按鈕，可最小化/展開輸入視窗。
 *   2) 輸入表單 (Category / Station / PageNo / ...)
 *   3) 點擊「儲存」後呼叫 /SurveyEdit/ParseHtmlAndSave
 *   4) 若有重複 → 檢視舊新頁面差異 (.ModuleBlock為基準)
 *   5) 若文字有增刪改 → 舊模塊=淺紅底/深紅字，新模塊=藍框線/紅字。
 ****************************************************/

// 定義 FloatingBookWindow 類別，封裝所有功能
class FloatingBookWindow {
    // 儲存產生的元素參考（若需要後續操作）
    static minimizedBtn = null;
    static expandedDiv = null;

    static init() {
        // 1) 檢查容器是否存在
        const container = document.getElementById("floatingBookContainer");
        if (!container) return;

        // 註冊自訂事件監聽，當 DocumentExport 資料載入時更新浮動輸入框
        window.addEventListener("DocumentExportLoaded", (e) => {
            FloatingBookWindow.handleDocumentExportLoaded(e);
        });

        // 2) 建立「最小化的書」按鈕
        const minimizedBtn = document.createElement("div");
        minimizedBtn.id = "floatingBookMinimized";
        minimizedBtn.innerHTML = "📙";
        minimizedBtn.title = "點擊展開輸入視窗";
        Object.assign(minimizedBtn.style, {
            position: "fixed",
            top: "100px",
            right: "1618px",
            cursor: "move",
            fontSize: "30px",
            zIndex: "9999",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "8px",
            width: "50px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "gold"
        });

        // 3) 建立「展開後視窗」
        const expandedDiv = document.createElement("div");
        expandedDiv.id = "floatingBookExpanded";
        Object.assign(expandedDiv.style, {
            position: "fixed",
            top: "100px",
            right: "1618px",
            width: "280px",
            minHeight: "200px",
            backgroundColor: "#fafafa",
            border: "1px solid #aaa",
            borderRadius: "8px",
            padding: "0px",
            zIndex: "9998",
            display: "none"
        });

        // 4) 建立標題列 (titleBar)
        const titleBar = document.createElement("div");
        Object.assign(titleBar.style, {
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            backgroundColor: "#eee",
            cursor: "move",
            padding: "5px",
            borderBottom: "1px solid #ddd",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px"
        });

        // 4.1) 建立縮小按鈕
        const btnMinimize = document.createElement("button");
        btnMinimize.id = "btnMinimize";
        btnMinimize.innerHTML = `<i class="bi bi-dash"></i>`;
        Object.assign(btnMinimize.style, {
            cursor: "pointer",
            marginRight: "5px"
        });
        titleBar.appendChild(btnMinimize);

        // 5) 建立內容區 (contentDiv) 與輸入表單
        const contentDiv = document.createElement("div");
        contentDiv.style.padding = "10px";
        contentDiv.innerHTML = `
        <h4>輸入模組</h4>

        <div style="margin-top:10px;">
          <label>種類：</label>
          <select id="txtCategory" class="form-select" style="width:100%">
            <option value="硬板">硬板</option>
            <option value="汽車板">汽車板</option>
            <option value="軟硬板">軟硬板</option>
            <option value="天龍八部">天龍八部</option>
          </select>
        </div>

        <div style="margin-top:10px;">
          <label>站別：</label>
          <select id="txtStation" class="form-select" style="width:100%">
            <option value="PNL">PNL</option>
            <option value="內層">內層</option>
            <option value="外層">外層</option>
            <option value="印字">印字</option>
            <option value="防焊">防焊</option>
            <option value="其它">其它</option>
          </select>
        </div>

        <div style="margin-top:10px;">
          <label>頁數：</label>
          <input type="number" id="txtPageNo" class="form-control" style="width:100%" />
        </div>
        <div style="margin-top:10px;">
          <label>文件編號：</label>
          <input type="text" id="txtDocumentId" class="form-control" style="width:100%" />
        </div>
        <div style="margin-top:10px;">
          <label>後綴：</label>
          <input type="text" id="txtSuffix" class="form-control" style="width:100%" placeholder="(若空則預設一般)" />
        </div>

        <div style="margin-top:15px; text-align:right;">
          <button id="btnConfirm" style="cursor:pointer;" class="btn btn-primary">儲存</button>
        </div>
      `;
        // 將 titleBar 與 contentDiv 加入展開後視窗
        expandedDiv.appendChild(titleBar);
        expandedDiv.appendChild(contentDiv);
        container.appendChild(minimizedBtn);
        container.appendChild(expandedDiv);

        // 6) 綁定「最小化書本」與「縮小按鈕」事件
        minimizedBtn.addEventListener("click", () => {
            minimizedBtn.style.display = "none";
            expandedDiv.style.display = "block";
        });
        btnMinimize.addEventListener("click", () => {
            minimizedBtn.style.display = "flex";
            expandedDiv.style.display = "none";
        });

        // 7) 綁定「儲存」按鈕事件邏輯
        const btnConfirm = contentDiv.querySelector("#btnConfirm");
        btnConfirm.addEventListener("click", () => {
            // 取得用戶輸入
            const categoryValue = document.getElementById("txtCategory").value.trim();
            const stationValue = document.getElementById("txtStation").value.trim();
            const pageNoValue = document.getElementById("txtPageNo").value.trim();
            const docIdValue = document.getElementById("txtDocumentId").value.trim();
            let suffixValue = document.getElementById("txtSuffix").value.trim();
            if (!suffixValue) suffixValue = "一般";

            // 抓取 #AutoScreen 內容
            const pageHtmlValue = document.getElementById("AutoScreen").outerHTML;

            // 建立傳送至後端的資料物件 (forceReplace 初始為 false)
            const bodyObj = {
                pageHtml: pageHtmlValue,
                category: categoryValue,
                station: stationValue,
                pageNo: pageNoValue,
                documentId: docIdValue,
                suffix: suffixValue,
                forceReplace: false
            };

            // 呼叫 sendParseHtmlAndSave 靜態方法
            FloatingBookWindow.sendParseHtmlAndSave(bodyObj);
        });

        // 8) 設定拖曳功能，讓「最小化書本」與「展開後視窗」可移動
        FloatingBookWindow.makeDraggable(minimizedBtn);
        FloatingBookWindow.makeDraggable(titleBar, expandedDiv);
    }

    // 處理自訂事件：更新浮動輸入視窗的值
    static handleDocumentExportLoaded(e) {
        const data = e.detail;
        this.updateFloatingFields(data);
        window._documentExportData = data;
    }

    // 更新展開視窗中各輸入欄位的值；若資料為空則給預設值
    static updateFloatingFields(data) {
        const txtCategory = document.getElementById("txtCategory");
        const txtStation = document.getElementById("txtStation");
        const txtPageNo = document.getElementById("txtPageNo");
        const txtSuffix = document.getElementById("txtSuffix");
        const txtDocumentId = document.getElementById("txtDocumentId");
        if (txtCategory) txtCategory.value = data.category || "硬板";
        if (txtStation) txtStation.value = data.station || "PNL";
        if (txtPageNo) txtPageNo.value = data.pageNo || "";
        if (txtSuffix) txtSuffix.value = data.suffix || "一般";
        if (txtDocumentId) txtDocumentId.value = data.documentId || "";
    }

    // 靜態方法：呼叫後端 API 進行儲存
    static sendParseHtmlAndSave(bodyObj) {
        fetch('/Customer/SurveyEdit/ParseHtmlAndSave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyObj)
        })
            .then(resp => {
                if (!resp.ok) {
                    return resp.text().then(text => { throw new Error(text); });
                }
                return resp.json();
            })
            .then(data => {
                console.log("ParseHtmlAndSave 回傳:", data);
                if (data.success) {
                    // 儲存成功
                    Swal.fire({
                        icon: 'success',
                        title: '儲存成功',
                        text: data.message,
                        background: '#ECF4EC',
                        color: '#2B2B2B',
                        confirmButtonColor: '#86B386',
                        confirmButtonText: '關閉'
                    });
                } else {
                    // 若重複記錄，使用自訂彈窗（包括取代、檢視與複製同意按鈕）
                    if (data.isDuplicate) {
                        Swal.fire({
                            title: '已有相同紀錄！',
                            html: `<div>${data.message}</div>
                               <div style="margin-top:10px;">
                                 <button id="btnReplace" class="swal2-confirm swal2-styled">是的，取代它!</button>
                                 <button id="btnViewDiff" class="swal2-deny swal2-styled">檢視</button>
                                 <button id="btnCopyConsent" class="swal2-styled">複製同意</button>
                                 <button id="btnCancel" class="swal2-cancel swal2-styled">先不要</button>
                               </div>`,
                            showConfirmButton: false,
                            allowOutsideClick: false,
                            didOpen: () => {
                                const btnReplace = Swal.getPopup().querySelector('#btnReplace');
                                const btnViewDiff = Swal.getPopup().querySelector('#btnViewDiff');
                                const btnCopyConsent = Swal.getPopup().querySelector('#btnCopyConsent');
                                const btnCancel = Swal.getPopup().querySelector('#btnCancel');

                                btnReplace.addEventListener('click', () => {
                                    bodyObj.forceReplace = true;
                                    Swal.close();
                                    FloatingBookWindow.sendParseHtmlAndSave(bodyObj);
                                });
                                btnViewDiff.addEventListener('click', () => {
                                    Swal.close();
                                    // 呼叫檢視差異方法
                                    FloatingBookWindow.showViewDifferencesModal(data, bodyObj);
                                });
                                btnCopyConsent.addEventListener('click', () => {
                                    Swal.close();
                                    // 呼叫複製同意的視窗方法
                                    FloatingBookWindow.showCopyConsentModal(bodyObj);
                                });
                                btnCancel.addEventListener('click', () => {
                                    Swal.close();
                                    Swal.fire('已取消', '保留原資料', 'info');
                                });
                            }
                        });
                    } else {
                        // 其它儲存失敗的情況
                        Swal.fire({
                            icon: 'error',
                            title: '儲存失敗',
                            text: data.message || '不明錯誤',
                            background: '#E8F0E8',
                            color: '#2B2B2B',
                            confirmButtonColor: '#7FA47F',
                            confirmButtonText: '關閉'
                        });
                    }
                }
            })
            .catch(err => {
                console.error("ParseHtmlAndSave 例外:", err);
                Swal.fire({
                    icon: 'error',
                    title: '發生錯誤',
                    text: err.message,
                    background: '#E8F0E8',
                    color: '#2B2B2B',
                    confirmButtonColor: '#7FA47F',
                    confirmButtonText: '關閉'
                });
            });
    }

    // 新增：檢視差異的方法，顯示舊版與新版 HTML 差異
    static showViewDifferencesModal(data, bodyObj) {
        const oldHtml = data.oldHtml || "<p>無舊資料</p>";
        const newHtml = bodyObj.pageHtml;
        const highlight = FloatingBookWindow.highlightDifferences(oldHtml, newHtml);

        Swal.fire({
            title: '舊的頁面　|　新的頁面',
            width: '90%',
            heightAuto: false,
            background: '#ECF4EC',
            color: '#2B2B2B',
            html: `
<div style="display: flex; flex-direction: row; height: 70vh; margin: 0; padding: 0;">
  <div style="flex: 1; padding: 8px; border-right: 1px solid #C2C2C2; overflow: auto; transform: scale(0.90); transform-origin: top left; color: #2B2B2B;">
    ${highlight.oldVersion}
  </div>
  <div style="flex: 1; padding: 8px; overflow: auto; transform: scale(0.90); transform-origin: top left; color: #2B2B2B;">
    ${highlight.newVersion}
  </div>
</div>
            `,
            showCancelButton: true,
            confirmButtonText: '是的，取代它!',
            cancelButtonText: '先不要',
            confirmButtonColor: '#86B386',
            cancelButtonColor: '#D2D2D2'
        }).then((result) => {
            if (result.isConfirmed) {
                bodyObj.forceReplace = true;
                FloatingBookWindow.sendParseHtmlAndSave(bodyObj);
            } else {
                Swal.fire('已取消', '保留原資料', 'info');
            }
        });
    }


    // 新增：顯示複製同意視窗，並在上傳PDF後顯示PDF內容預覽
    static showCopyConsentModal(bodyObj) {
        Swal.fire({
            title: '複製同意',
            width: '90%',
            html: `
<div style="display: flex; flex-direction: row; gap:10px;">
  <!-- 左側：同意書內容與輸入區 -->
  <div id="copyConsentLeft" style="flex:1; height:75vh; overflow:auto; border:1px solid #ccc; padding:10px;">
    <strong>同意書</strong>
    <p>本人同意將前料號之設計資訊與資料內容，完整複製至新料號，以供後續重新設計或修改用途。</p>
    <p>本人承諾複製後之新料號設計，將依據新料號的設計規範與要求進行調整與驗證，並負責後續資料完整性及設計正確性之確認與管理。</p>
    <textarea id="txtDifferences" class="swal2-textarea" style="width:95%; height:120px;" placeholder="請填寫與前版料號的差異之處"></textarea>
    <div style="margin-top:10px; display: flex; align-items:center;">
      <input type="checkbox" id="noPdfCheckbox">
      <label for="noPdfCheckbox" style="margin-left:5px;">無PDF</label>
    </div>
    <div style="margin-top:10px; display: flex; align-items:center;">
      <input type="password" id="pdfPassword" class="swal2-input" placeholder="請輸入 PDF 密碼 (選填)" style="width:30%;">
      <span id="togglePassword" style="cursor:pointer; margin-left:5px;">👁️</span>
    </div>
  </div>
  <!-- 右側：上傳與預覽PDF，以及閱讀確認 -->
  <div style="flex:1; display: flex; flex-direction: column; gap:5px;">
    <input type="file" id="pdfUpload" accept="application/pdf" style="margin-bottom:5px;"/>
    <div id="pdfPreviewContainer" style="flex:1; border:1px solid #ccc; overflow:hidden;"></div>
    <div style="margin-top:5px;">
      <input type="checkbox" id="pdfReadCheckbox" disabled>
      <label for="pdfReadCheckbox">我已完整閱讀PDF文件</label>
    </div>
  </div>
</div>
            `,
            showCancelButton: true,
            confirmButtonText: '送出',
            cancelButtonText: '取消',
            preConfirm: () => {
                const diffs = Swal.getPopup().querySelector('#txtDifferences').value;
                const pdfFileInput = Swal.getPopup().querySelector('#pdfUpload');
                const pdfFile = pdfFileInput.files[0];
                const noPdfChecked = Swal.getPopup().querySelector('#noPdfCheckbox').checked;
                const pdfReadChecked = Swal.getPopup().querySelector('#pdfReadCheckbox').checked;
                if (!diffs) {
                    Swal.showValidationMessage(`請填寫與前版料號的差異描述`);
                    return;
                }
                if (!noPdfChecked && !pdfFile) {
                    Swal.showValidationMessage(`請上傳前版PDF文件或勾選「無PDF」`);
                    return;
                }
                if (!noPdfChecked && !pdfReadChecked) {
                    Swal.showValidationMessage(`請確認您已完整閱讀PDF文件`);
                    return;
                }
                const pdfPassword = Swal.getPopup().querySelector('#pdfPassword').value;
                return { diffs, pdfFile, pdfPassword, noPdf: noPdfChecked };
            },
            didOpen: () => {
                const pdfInput = Swal.getPopup().querySelector('#pdfUpload');
                const previewContainer = Swal.getPopup().querySelector('#pdfPreviewContainer');
                const noPdfCheckbox = Swal.getPopup().querySelector('#noPdfCheckbox');
                const pdfReadCheckbox = Swal.getPopup().querySelector('#pdfReadCheckbox');
                const confirmBtn = Swal.getConfirmButton();
                confirmBtn.disabled = true;
                // 僅監聽左側內容區的滾動來檢查是否捲到底
                const leftColumn = Swal.getPopup().querySelector('#copyConsentLeft');
                function checkEnableSubmit() {
                    let leftScrolled = false;
                    if (leftColumn) {
                        if (leftColumn.scrollHeight <= leftColumn.clientHeight) {
                            leftScrolled = true;
                        } else {
                            leftScrolled = (leftColumn.scrollTop + leftColumn.clientHeight >= leftColumn.scrollHeight - 5);
                        }
                    }
                    // 僅當左側捲到底時，啟用「我已完整閱讀」的核取方塊，不自動勾選
                    if (leftScrolled) {
                        pdfReadCheckbox.disabled = false;
                    } else {
                        pdfReadCheckbox.disabled = true;
                        pdfReadCheckbox.checked = false;
                    }
                    // 送出按鈕啟用條件：若使用者勾選「無PDF」或手動勾選「我已完整閱讀」
                    if (noPdfCheckbox.checked || pdfReadCheckbox.checked) {
                        confirmBtn.disabled = false;
                    } else {
                        confirmBtn.disabled = true;
                    }
                }
                leftColumn.addEventListener('scroll', checkEnableSubmit);
                noPdfCheckbox.addEventListener('change', checkEnableSubmit);
                // PDF上傳事件僅用於顯示PDF，不影響閱讀判斷
                pdfInput.addEventListener('change', () => {
                    const file = pdfInput.files[0];
                    if (file) {
                        const fileURL = URL.createObjectURL(file);
                        previewContainer.style.height = "100%";
                        previewContainer.style.overflow = "hidden";
                        previewContainer.style.zoom = "1.35";
                        previewContainer.innerHTML = `<iframe src="${fileURL}" style="width:100%; height:100%;" frameborder="0"></iframe>`;
                    } else {
                        previewContainer.innerHTML = "";
                    }
                    checkEnableSubmit();
                });
                // 眼睛圖示：切換 PDF 密碼顯示
                const pdfPasswordInput = Swal.getPopup().querySelector('#pdfPassword');
                const toggleIcon = Swal.getPopup().querySelector('#togglePassword');
                toggleIcon.addEventListener('click', () => {
                    pdfPasswordInput.type = pdfPasswordInput.type === 'password' ? 'text' : 'password';
                });
                // 全螢幕放大按鈕（保持原樣）
                const actions = Swal.getPopup().querySelector('.swal2-actions');
                if (actions && !Swal.getPopup().querySelector('#fsToggleButton')) {
                    const fsToggleButton = document.createElement('button');
                    fsToggleButton.id = 'fsToggleButton';
                    fsToggleButton.type = 'button';
                    fsToggleButton.className = 'swal2-confirm swal2-styled';
                    fsToggleButton.style.backgroundColor = '#3498db';
                    fsToggleButton.textContent = '全螢幕放大';
                    fsToggleButton.style.marginLeft = '10px';
                    actions.appendChild(fsToggleButton);
                    fsToggleButton.addEventListener('click', () => {
                        const pdfPreview = Swal.getPopup().querySelector('#pdfPreviewContainer');
                        if (pdfPreview) {
                            if (!document.fullscreenElement) {
                                pdfPreview.requestFullscreen().then(() => {
                                    pdfPreview.style.height = "100vh";
                                    pdfPreview.style.maxHeight = "none";
                                    pdfPreview.style.zoom = "1.4";
                                    fsToggleButton.textContent = '關閉全螢幕';
                                });
                            } else {
                                document.exitFullscreen().then(() => {
                                    pdfPreview.style.height = "100%";
                                    pdfPreview.style.maxHeight = "none";
                                    pdfPreview.style.zoom = "1.35";
                                    fsToggleButton.textContent = '全螢幕放大';
                                });
                            }
                        }
                    });
                    document.addEventListener('fullscreenchange', () => {
                        const pdfPreview = Swal.getPopup().querySelector('#pdfPreviewContainer');
                        if (!document.fullscreenElement) {
                            if (pdfPreview) {
                                pdfPreview.style.height = "100%";
                                pdfPreview.style.maxHeight = "none";
                                pdfPreview.style.zoom = "1.35";
                            }
                            fsToggleButton.textContent = "全螢幕放大";
                        }
                    });
                    const swalContainer = Swal.getPopup().parentElement;
                    if (swalContainer) swalContainer.style.zIndex = "10000";
                }
            },
            preConfirm: () => {
                const diffs = Swal.getPopup().querySelector('#txtDifferences').value;
                const pdfFileInput = Swal.getPopup().querySelector('#pdfUpload');
                const pdfFile = pdfFileInput.files[0];
                const noPdfChecked = Swal.getPopup().querySelector('#noPdfCheckbox').checked;
                if (!diffs) {
                    Swal.showValidationMessage(`請填寫與前版料號的差異描述`);
                    return;
                }
                if (!noPdfChecked && !pdfFile) {
                    Swal.showValidationMessage(`請上傳前版PDF文件或勾選「無PDF」`);
                    return;
                }
                const pdfPassword = Swal.getPopup().querySelector('#pdfPassword').value;
                return { diffs, pdfFile, pdfPassword, noPdf: noPdfChecked };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { diffs, pdfFile, pdfPassword, noPdf } = result.value;
                const formData = new FormData();
                formData.append('differences', diffs);
                formData.append('pdf', pdfFile);
                formData.append('pdfPassword', pdfPassword);
                formData.append('noPdf', noPdf);
                fetch('/Customer/SurveyEdit/CopyConsent', {
                    method: 'POST',
                    body: formData
                })
                    .then(resp => resp.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire('完成', data.message, 'success');
                        } else {
                            Swal.fire('錯誤', data.message, 'error');
                        }
                    })
                    .catch(err => {
                        Swal.fire('錯誤', err.message, 'error');
                    });
            } else {
                Swal.fire('已取消', '未完成複製同意', 'info');
            }
        });
    }











    // 靜態方法：比對模塊差異，回傳舊/新頁面的 HTML
    static highlightDifferences(oldHtml, newHtml) {
        const parser = new DOMParser();
        const oldDoc = parser.parseFromString(oldHtml, 'text/html');
        const newDoc = parser.parseFromString(newHtml, 'text/html');
        const oldMap = {};
        // 收集舊文件中的 .ModuleBlock
        oldDoc.querySelectorAll('.ModuleBlock').forEach(blk => {
            const theId = blk.id || '';
            oldMap[theId] = blk;
        });
        // 比對新文件中的 .ModuleBlock
        newDoc.querySelectorAll('.ModuleBlock').forEach(newBlk => {
            const theId = newBlk.id || '';
            if (oldMap[theId]) {
                const oldBlk = oldMap[theId];
                const oldText = oldBlk.textContent.trim();
                const newText = newBlk.textContent.trim();
                if (oldText !== newText) {
                    // 文字不同，加入樣式標記
                    var TextBox = ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(newBlk);
                    TextBox.classList.add("highlightDifferences");
                }
                delete oldMap[theId];
            } else {
                // 新增模塊，加入藍框線標記
                var TextBox = ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(newBlk);
                TextBox.classList.add("highlightDifferences");
            }
        });
        // 處理舊文件中獨有的模塊
        for (const key in oldMap) {
            if (Object.hasOwnProperty.call(oldMap, key)) {
                const blk = oldMap[key];
                blk.style.backgroundColor = '#FFEAE6';
                blk.style.color = '#700000';
            }
        }
        return {
            oldVersion: oldDoc.body.innerHTML,
            newVersion: newDoc.body.innerHTML
        };
    }

    // 靜態方法：設定元素拖曳功能
    static makeDraggable(dragHandle, targetElem = dragHandle) {
        let offsetX = 0, offsetY = 0;
        let isMouseDown = false;
        dragHandle.addEventListener("mousedown", function (e) {
            isMouseDown = true;
            offsetX = e.clientX - parseInt(targetElem.style.right || 0);
            offsetY = e.clientY - parseInt(targetElem.style.top || 0);
            e.preventDefault();
        });
        document.addEventListener("mousemove", function (e) {
            if (!isMouseDown) return;
            let newRight = parseInt(targetElem.style.right || 0) - e.movementX;
            let newTop = e.clientY - offsetY;
            if (newRight < 0) newRight = 0;
            if (newTop < 0) newTop = 0;
            targetElem.style.right = newRight + "px";
            targetElem.style.top = newTop + "px";
        });
        document.addEventListener("mouseup", function () {
            isMouseDown = false;
        });
    }
}

// 當 DOM 載入完成後執行初始化
document.addEventListener("DOMContentLoaded", () => {
    FloatingBookWindow.init();
});
