// CBHoverLink.js — 將 V2/V3/V4 的 hover 動畫 + 連結能力套用到 V2/V3/V4 的方塊
// 用法：載入本檔後自動套用。讓某個方塊可點 → 設定 rect 的 data-href（可選 data-confirm, data-target）
// 例：rect.dataset.href="https://..."; rect.dataset.confirm="要前往嗎？"; rect.dataset.target="_blank";

(() => {
    const NS = "http://www.w3.org/2000/svg";
    const BOX_SELECTORS = [
        "rect.cbv2-box", "rect.cbv2-box-strong",
        "rect.v3-box", "rect.v3-box-strong",
        "rect.v4-box", "rect.v4-box-strong",  
    ].join(",");


    function injectGradient(svg) {
        if (svg.__cbGradId) return svg.__cbGradId;
        const id = "cbGrad-" + Math.random().toString(36).slice(2, 8);
        const defs = svg.querySelector("defs") || svg.appendChild(document.createElementNS(NS, "defs"));
        const lg = document.createElementNS(NS, "linearGradient");
        lg.setAttribute("id", id);
        lg.setAttribute("x1", "0%"); lg.setAttribute("y1", "0%");
        lg.setAttribute("x2", "100%"); lg.setAttribute("y2", "100%");
        const s1 = document.createElementNS(NS, "stop"); s1.setAttribute("offset", "0%"); s1.setAttribute("stop-color", "#6366f1");
        const s2 = document.createElementNS(NS, "stop"); s2.setAttribute("offset", "50%"); s2.setAttribute("stop-color", "#22d3ee");
        const s3 = document.createElementNS(NS, "stop"); s3.setAttribute("offset", "100%"); s3.setAttribute("stop-color", "#f472b6");
        lg.appendChild(s1); lg.appendChild(s2); lg.appendChild(s3);
        defs.appendChild(lg);
        svg.__cbGradId = id;
        return id;
    }

    // ✅ 改良版：在 hover 時疊加 drop-shadow，而不是覆蓋原本的 filter（如 url(#cbv2-ds)）
    function enableHover(svg, rect) {
        const gid = injectGradient(svg);
        rect.style.transition = "transform .18s cubic-bezier(.2,.8,.2,1), filter .18s";
        rect.style.transformOrigin = "center";
        rect.style.transformBox = "fill-box";
        rect.style.pointerEvents = "all";

        rect.addEventListener("mouseenter", () => {
            rect.__oldFill = rect.getAttribute("fill");
            rect.__oldStrokeOpacity = rect.getAttribute("stroke-opacity");

            // 記下舊的 filter（優先抓 style；沒有就抓 computedStyle）
            rect.__oldFilter =
                rect.style.filter && rect.style.filter !== "none"
                    ? rect.style.filter
                    : getComputedStyle(rect).filter;

            rect.style.transform = "scale(1.04)";
            const base = rect.__oldFilter && rect.__oldFilter !== "none" ? rect.__oldFilter + " " : "";
            rect.style.filter = base + "drop-shadow(0 10px 24px rgba(0,0,0,.18))";

            rect.setAttribute("fill", `url(#${gid})`);
            rect.setAttribute("stroke-opacity", "0");
        });

        rect.addEventListener("mouseleave", () => {
            rect.style.transform = "";
            if (rect.__oldFilter && rect.__oldFilter !== "none") rect.style.filter = rect.__oldFilter;
            else rect.style.filter = "";

            if (rect.__oldFill != null) rect.setAttribute("fill", rect.__oldFill);
            else rect.removeAttribute("fill");
            if (rect.__oldStrokeOpacity != null) rect.setAttribute("stroke-opacity", rect.__oldStrokeOpacity);
            else rect.removeAttribute("stroke-opacity");
        });
    }

    function enableLink(rect) {
        if (!rect || !rect.dataset || !rect.dataset.href) return;
        rect.style.cursor = "pointer";
        rect.setAttribute("tabindex", "0");
        rect.addEventListener("click", () => {
            const msg = rect.dataset.confirm;
            const go = (msg === undefined || msg === "" || msg === "false") ? true : confirm(msg);
            if (!go) return;
            const url = rect.dataset.href;
            const target = rect.dataset.target === "_blank" ? "_blank" : "_self";
            if (target === "_blank") window.open(url, "_blank");
            else location.href = url;
        });
        rect.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); rect.click(); }
        });
    }

    function decorateSvg(svg) {
        if (!svg || svg.__cbDecorated) return;
        svg.__cbDecorated = true;
        // 讓文字不攔截滑鼠（避免點不到 rect）
        svg.querySelectorAll("text").forEach(t => t.style.pointerEvents = "none");
        svg.querySelectorAll(BOX_SELECTORS).forEach(rect => {
            enableHover(svg, rect);
            enableLink(rect);
        });
    }

    function decorateAllIn(root = document) {
        root.querySelectorAll("svg").forEach(decorateSvg);
    }

    // 初始與動態觀察（因為 V2/V3/V4 多數是 tab 切換動態 render）
    function auto() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => { decorateAllIn(); observe(); });
        } else { decorateAllIn(); observe(); }
    }
    function observe() {
        const mo = new MutationObserver((muts) => {
            for (const m of muts) {
                m.addedNodes && m.addedNodes.forEach(n => {
                    if (n.nodeType === 1) {
                        if (n.tagName && n.tagName.toLowerCase() === "svg") decorateSvg(n);
                        else decorateAllIn(n);
                    }
                });
            }
        });
        mo.observe(document.body, { childList: true, subtree: true });
    }

    // 對外 API（可手動呼叫）
    window.CBHoverLink = { decorateSvg, auto };
    auto();
})();
