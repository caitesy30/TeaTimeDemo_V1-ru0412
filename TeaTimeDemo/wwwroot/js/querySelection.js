// querySelection.js
document.addEventListener('DOMContentLoaded', function () {
    // 創建查詢系統容器
    const querySystem = document.createElement('div');
    querySystem.id = 'query-system';
    querySystem.style.position = 'fixed';
    querySystem.style.right = '20px';
    querySystem.style.bottom = '20px';
    querySystem.style.zIndex = '9999';
    document.body.appendChild(querySystem);

    // 查詢按鈕
    const queryBtn = document.createElement('button');
    queryBtn.className = 'btn btn-primary btn-sm shadow-sm';
    queryBtn.innerHTML = '<i class="bi bi-search"></i> 查詢';
    queryBtn.style.display = 'none';
    queryBtn.style.position = 'absolute';
    querySystem.appendChild(queryBtn);

    // 結果面板
    const resultPanel = document.createElement('div');
    resultPanel.className = 'card shadow-lg';
    resultPanel.style.display = 'none';
    resultPanel.style.width = '350px';
    resultPanel.style.maxHeight = '60vh';
    resultPanel.style.overflow = 'auto';
    resultPanel.innerHTML = `
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center py-2">
            <h6 class="mb-0">查詢結果</h6>
            <button class="btn btn-sm btn-light close-btn">&times;</button>
        </div>
        <div class="card-body p-3">
            <div class="explanation-content"></div>
            <div class="d-flex justify-content-between align-items-center mt-2">
                <small class="source-info text-muted"></small>
                <button class="btn btn-sm btn-success save-btn" disabled>
                    <i class="bi bi-save"></i> 儲存
                </button>
            </div>
        </div>
    `;
    querySystem.appendChild(resultPanel);

    // 文字選取事件
    document.addEventListener('mouseup', function (e) {
        const selection = window.getSelection().toString().trim();
        if (selection.length > 1 && !isInsidePanel(e.target)) {
            const range = window.getSelection().getRangeAt(0);
            const rect = range.getBoundingClientRect();

            queryBtn.style.display = 'block';
            queryBtn.style.top = `${window.scrollY + rect.top - 40}px`;
            queryBtn.style.left = `${window.scrollX + rect.left + (rect.width / 2) - 40}px`;
            queryBtn.dataset.queryText = selection;
        } else {
            queryBtn.style.display = 'none';
        }
    });

    // 查詢按鈕點擊事件
    queryBtn.addEventListener('click', async function () {
        const queryText = this.dataset.queryText;
        if (!queryText) return;

        showLoadingState(queryText);

        try {
            const response = await fetch('/Customer/Query/GetExplanation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ QueryText: queryText })
            });

            const data = await response.json();

            if (data.success) {
                showResult(data.query, data.explanation, data.source);
            } else {
                showError(data.error || '查詢失敗');
            }
        } catch (error) {
            showError(`網路錯誤: ${error.message}`);
        }
    });

    // 關閉面板
    resultPanel.querySelector('.close-btn').addEventListener('click', () => {
        resultPanel.style.display = 'none';
    });

    // 輔助函數：顯示加載狀態
    function showLoadingState(queryText) {
        resultPanel.style.display = 'block';
        resultPanel.querySelector('.explanation-content').innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary"></div>
                <div class="mt-2">正在查詢「${escapeHtml(queryText)}」...</div>
            </div>
        `;
        resultPanel.querySelector('.source-info').textContent = '';
        resultPanel.querySelector('.save-btn').disabled = true;
    }

    // 輔助函數：顯示結果
    function showResult(query, explanation, source) {
        const sourceText = {
            cache: '來自快取',
            database: '來自知識庫',
            api: '來自 Deepseek AI'
        }[source] || '';

        resultPanel.querySelector('.explanation-content').innerHTML = `
            <h5 class="text-primary mb-3">${escapeHtml(query)}</h5>
            <div class="border-start border-3 ps-3 text-break">
                ${formatExplanation(explanation)}
            </div>
        `;
        resultPanel.querySelector('.source-info').textContent = sourceText;
        resultPanel.querySelector('.save-btn').disabled = false;
    }

    // 輔助函數：顯示錯誤
    function showError(message) {
        resultPanel.querySelector('.explanation-content').innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i>
                ${escapeHtml(message)}
            </div>
        `;
        resultPanel.querySelector('.source-info').textContent = '';
    }

    // 輔助函數：HTML 跳脫
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 輔助函數：格式化解釋
    function formatExplanation(text) {
        return escapeHtml(text)
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    // 輔助函數：檢查是否點擊在面板內
    function isInsidePanel(element) {
        while (element) {
            if (element === resultPanel || element === queryBtn) return true;
            element = element.parentElement;
        }
        return false;
    }
});