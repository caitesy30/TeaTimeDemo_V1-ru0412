// wwwroot/js/auth/LogoutUI.js
// 用 JS 生成登出按鈕（GET），行動端/LIFF 最穩定。
// 規範：Class + static；HTML 由 JS 產生。

(function (global) {
    class LogoutUI {
        /**
         * 在指定容器產生一顆「登出」按鈕（GET）
         * @param {string} containerSelector - 容器 CSS 選擇器，預設 '#logout-slot'
         * @param {string} text - 顯示文字，預設 '登出'
         * @param {string} returnUrl - 登出後回跳；預設 '/'
         */
        static render(containerSelector = '#logout-slot', text = '登出', returnUrl = '/') {
            // 1) 找到容器：先找指定容器，找不到就嘗試導覽列
            let container =
                document.querySelector(containerSelector) ||
                document.querySelector('.navbar .navbar-nav') ||
                document.querySelector('.navbar-nav');

            if (!container) return; // 找不到容器就先跳過

            // 2) 產生 <a>（GET 登出）
            const a = document.createElement('a');
            a.href = `/Identity/Account/Logout?returnUrl=${encodeURIComponent(returnUrl)}`;
            a.textContent = text;
            a.className = 'btn btn-outline-danger btn-sm ms-2';

            // 3) 若容器是 <ul> / <ol>（Bootstrap 常見），包成 <li>
            if (container.tagName && (container.tagName === 'UL' || container.tagName === 'OL')) {
                const li = document.createElement('li');
                li.className = 'nav-item';
                li.appendChild(a);
                container.appendChild(li);
            } else {
                container.appendChild(a);
            }
        }

        /**
         * 便捷：根據目前頁面產生回跳網址（含 querystring）
         */
        static currentUrl() {
            return window.location.pathname + window.location.search;
        }
    }

    // 導出到全域（讓 Razor Partial 能呼叫）
    global.LogoutUI = LogoutUI;

    // 預防某些頁面忘記呼叫：如果偵測到 #logout-slot 就自動渲染
    document.addEventListener('DOMContentLoaded', () => {
        const slot = document.querySelector('#logout-slot');
        if (slot && global.LogoutUI) {
            global.LogoutUI.render('#logout-slot', '登出', LogoutUI.currentUrl());
        }
    });
})(window);
