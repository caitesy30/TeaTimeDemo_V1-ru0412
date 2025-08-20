// ======================================================================
// CommerceBlueprint.v5.merged.js — V5（保留舊版大多數功能）× 新版多分頁視覺 × 模組佈局可編輯
// - 保留：本機存檔、即時呼叫 API、樣板、拖曳排序、手繪、模組可編輯、PNG/PDF 匯出
// - 調整：刪除「V4｜樂高精華」分頁；模組 hover：預設藍漸層、填連結者為綠漸層；「綜合商城」預設連到 /mall
// 依賴：ExportKit.js（先於頁面引入）；若需彈窗 TinyMCE，頁面需引入 TinyMCE（僅模組彈窗用）
// ======================================================================

/* ----------------------------- 可調區（API 與鍵名） ----------------------------- */
const CBV5_API_BASE = "/api/blueprint/save";       // ★ 儲存即呼叫的 API（POST）
const CBV5_STORE_KEY = "CBV5:modules";
const CBV5_TPL_KEY = "CBV5:templates";

/* ----------------------------- 佈景主題與顏色 ----------------------------- */
const CBV5_THEMES = {
    gradient: {
        name: "Gradient（預設）",
        gradStops: ["#6366f1", "#22d3ee", "#f472b6"],
        boxFill: "#ffffff",
        boxStroke: "#94a3b8",
        lane: "#f9fafb",
    },
    pastel: {
        name: "Pastel",
        gradStops: ["#fde68a", "#86efac", "#93c5fd"],
        boxFill: "#fffef8",
        boxStroke: "#e5e7eb",
        lane: "#fcfcff",
    },
    contrast: {
        name: "Contrast",
        gradStops: ["#0ea5e9", "#6366f1", "#1f2937"],
        boxFill: "#ffffff",
        boxStroke: "#111827",
        lane: "#ffffff",
    },
};

// 「三階段」色票（Pill 與輔助）
const CBV5_STAGE = {
    "存活期": { fill: "#e0f2fe", text: "#0369a1", stroke: "#38bdf8" },
    "成長期": { fill: "#dcfce7", text: "#065f46", stroke: "#34d399" },
    "宇宙村": { fill: "#ede9fe", text: "#5b21b6", stroke: "#a78bfa" }
};

// 組織專色
const CBV5_ORG = {
    "協會": { fill: "#FED7AA", stroke: "#FB923C" },
    "居希恩": { fill: "#C7D2FE", stroke: "#818CF8" }
};

// ★ 預設連結（沒填 link 時用）
const CBV5_DEFAULT_LINKS = {
    "home-mall": "https://localhost:7021/Customer/Store"
};

/* ----------------------------- 初始模組清單（保留） ----------------------------- */
const CBV5_INIT = [
    // 食
    { id: "food-charity", name: "公益送餐", subtitle: "", category: "食", org: "協會", stage: "存活期", shape: "rect", desc: "" },
    { id: "food-platform", name: "餐飲平台", subtitle: "", category: "食", org: "居希恩", stage: "成長期", shape: "rect", desc: "" },
    { id: "food-agri", name: "農產品平台", subtitle: "", category: "食", org: "居希恩", stage: "成長期", shape: "rect", desc: "" },
    // 衣
    { id: "wear-donate", name: "衣物捐贈", subtitle: "", category: "衣", org: "協會", stage: "成長期", shape: "pill", desc: "" },
    { id: "wear-second", name: "二手市集", subtitle: "", category: "衣", org: "居希恩", stage: "存活期", shape: "rect", desc: "" },
    { id: "wear-alter", name: "改衣接單", subtitle: "", category: "衣", org: "居希恩", stage: "成長期", shape: "rect", desc: "" },
    // 住
    { id: "home-timebank", name: "時間銀行", subtitle: "", category: "住", org: "協會", stage: "成長期", shape: "rect", desc: "" },
    { id: "home-community", name: "社區小程序", subtitle: "", category: "住", org: "協會", stage: "成長期", shape: "rect", desc: "" },
    // ★ 綜合商城（預設連到 /mall）
    { id: "home-mall", name: "綜合商城", subtitle: "", category: "住", org: "居希恩", stage: "存活期", shape: "rect", desc: "", link: "/mall" },
    // 行
    { id: "move-charity", name: "公益運輸", subtitle: "", category: "行", org: "協會", stage: "成長期", shape: "diamond", desc: "" },
    { id: "move-travel", name: "旅遊比價", subtitle: "", category: "行", org: "居希恩", stage: "成長期", shape: "rect", desc: "" },
    { id: "move-ticket", name: "票券保險", subtitle: "", category: "行", org: "居希恩", stage: "成長期", shape: "rect", desc: "" },
    // 育
    { id: "edu-tutor", name: "社區課輔", subtitle: "", category: "育", org: "協會", stage: "宇宙村", shape: "rect", desc: "" },
    { id: "edu-ai", name: "AI 助教", subtitle: "", category: "育", org: "居希恩", stage: "宇宙村", shape: "rect", desc: "" },
    { id: "edu-en", name: "英文學校", subtitle: "", category: "育", org: "居希恩", stage: "宇宙村", shape: "rect", desc: "" },
    { id: "edu-zh", name: "中文學校", subtitle: "", category: "育", org: "居希恩", stage: "宇宙村", shape: "rect", desc: "" },
    // 樂
    { id: "play-parent", name: "家長社群", subtitle: "", category: "樂", org: "協會", stage: "宇宙村", shape: "pill", desc: "" },
    { id: "play-roblox", name: "Roblox 創作", subtitle: "", category: "樂", org: "居希恩", stage: "宇宙村", shape: "rect", desc: "" },
    { id: "play-nft", name: "NFT 市集", subtitle: "", category: "樂", org: "居希恩", stage: "宇宙村", shape: "rect", desc: "" },
];

/* ----------------------------- 內建樣板（保留） ----------------------------- */
const CBV5_BUILTIN_TEMPLATES = [
    { key: "text-only", name: "單文字區塊", html: `<h2>大標題</h2><p>這是一段說明文字。</p>` },
    { key: "image-text", name: "圖片＋文字", html: `<figure><img style="max-width:100%" src="https://placehold.co/600x300" alt=""><figcaption>圖片說明</figcaption></figure><p>內容描述…</p>` },
    { key: "para-list", name: "段落＋列表", html: `<p>簡介段落…</p><ul><li>要點一</li><li>要點二</li><li>要點三</li></ul>` },
    { key: "title-sub", name: "大標＋小字", html: `<h2>大標題</h2><p class="sub">補充的小字</p>` },
    { key: "two-col", name: "圖文兩欄", html: `<table><tr><td style="width:50%"><img style="max-width:100%" src="https://placehold.co/400x260"></td><td style="width:50%"><h3>標題</h3><p>文字說明…</p></td></tr></table>` },
    { key: "title-3points", name: "標題＋三點", html: `<h3>重點標題</h3><ol><li>重點 A</li><li>重點 B</li><li>重點 C</li></ol>` },
];

/* ----------------------------- 資料存取 + API ----------------------------- */
const CBV5Api = {
    async saveSnapshot(modules) {
        try {
            await fetch(CBVV5.ctx.apiBase, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ modules })
            });
            CBV5UI.toast("✅ 已儲存（並同步到伺服器）");
        } catch (e) {
            CBV5UI.toast("⚠️ 無法連到 API，已暫存於本機", 3000);
        }
    }
};

class CBV5Store {
    static load() {
        try {
            const raw = localStorage.getItem(CBVV5.ctx.storeKey);
            const arr = raw ? JSON.parse(raw) : CBV5_INIT.slice();
            // baseline 合併：避免日後新增預設遺失
            const map = new Map(arr.map(m => [m.id, m]));
            const merged = CBV5_INIT.map(m => map.get(m.id) || m);
            arr.forEach(m => { if (!merged.find(x => x.id === m.id)) merged.push(m); });
            return merged;
        } catch {
            return CBV5_INIT.slice();
        }
    }
    static save(list) {
        localStorage.setItem(CBVV5.ctx.storeKey, JSON.stringify(list));
        // ★ 儲即呼叫 API（無版本）
        CBV5Api.saveSnapshot(list).catch(() => { });
    }
    static update(mod) {
        const all = this.load();
        const i = all.findIndex(x => x.id === mod.id);
        if (i >= 0) all[i] = mod; else all.push(mod);
        this.save(all);
    }
    static remove(id) { this.save(this.load().filter(x => x.id !== id)); }
    static byId(id) { return this.load().find(m => m.id === id); }
}

class CBV5Templates {
    static load() {
        try {
            const raw = localStorage.getItem(CBVV5.ctx.tplKey);
            const arr = raw ? JSON.parse(raw) : [];
            const map = new Map(arr.map(t => [t.key, t]));
            CBV5_BUILTIN_TEMPLATES.forEach(t => { if (!map.has(t.key)) arr.push(t); });
            return arr;
        } catch {
            return CBV5_BUILTIN_TEMPLATES.slice();
        }
    }
    static save(list) { localStorage.setItem(CBVV5.ctx.tplKey, JSON.stringify(list)); }
    static add(tpl) {
        const all = this.load();
        if (!tpl.key) tpl.key = "user-" + Math.random().toString(36).slice(2, 8);
        all.push(tpl); this.save(all);
    }
}

/* ----------------------------- 全域主題（新增綠色漸層） ----------------------------- */
const CBV5_THEME = {
    font: "Inter, Arial, 'Noto Sans TC', sans-serif",
    ink: "#111827",
    sub: "#475569",
    note: "#64748b",
    border: "#e5e7eb",
    lane: "#f9fafb",
    panel: "#f8fafc",
    blue1: "#2563eb",
    blue2: "#60a5fa",
    green1: "#059669",
    green2: "#34d399"
};

/* ----------------------------- 簡易 UI（樣式、Toast、Modal） ----------------------------- */
const CBV5UI = {
    style() {
        return `
<style>
  .v5-wrap{background:#fff;border:1px solid ${CBV5_THEME.border};border-radius:16px;padding:12px 12px 6px}
  .v5-title{font-weight:800;font-size:18px;display:flex;gap:12px;align-items:center;margin-bottom:8px}
  .v5-actions{margin-left:auto;display:flex;gap:8px}
  .v5-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
  .v5-select{padding:6px 10px;border:1px solid #e5e7eb;border-radius:10px;background:#fff}
  .v5-note{color:#64748b;font-size:12px}

  svg{width:100%;height:auto}
  .v5-sort{margin-top:10px;border-top:1px dashed #e5e7eb;padding-top:8px}
  .v5-sort h6{font-size:13px;color:#64748b;margin:0 0 6px}
  .v5-sortlist{display:flex;gap:8px;flex-wrap:wrap}
  .v5-chip{user-select:none;cursor:grab;padding:6px 10px;border:1px solid #e5e7eb;border-radius:999px;background:#fff}
  .v5-chip.dragging{opacity:.4}

  /* 浮動工具箱（可拖曳、可縮） */
  .v5-fab{position:fixed;right:16px;top:120px;z-index:12000}
  .v5-panel{width:260px;border:1px solid #e5e7eb;background:#fff;border-radius:14px;box-shadow:0 12px 28px rgba(0,0,0,.14);overflow:hidden}
  .v5-panel .hd{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#111827;color:#fff}
  .v5-panel .hd .drag{cursor:move}
  .v5-panel .bd{padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .v5-btn{font-size:12px;border:1px solid #e5e7eb;background:#fff;border-radius:10px;padding:8px 10px;cursor:pointer}
  .v5-mini{width:44px;height:44px;border-radius:999px;border:1px solid #e5e7eb;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px rgba(0,0,0,.14);cursor:pointer}

  /* Modal */
  .v5-modal{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);z-index:13000}
  .v5-dialog{background:#fff;border-radius:12px;padding:16px;width:min(760px,92vw)}
  .v5-row{display:flex;gap:8px;margin:8px 0}
  .v5-row label{width:80px;line-height:32px}
  .v5-row input,.v5-row select{flex:1;padding:8px;border:1px solid #e5e7eb;border-radius:8px}
  .v5-actions-2{text-align:right;margin-top:10px}
  .v5-actions-2 button{margin-left:8px}

  /* Toast */
  .v5-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#111827;color:#fff;padding:10px 14px;border-radius:8px;opacity:0;pointer-events:none;transition:opacity .2s;z-index:14000}
  .v5-toast.show{opacity:1}

  /* 新版分頁 */
  .v5-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
  .v5-tab{border:1px solid ${CBV5_THEME.border};border-radius:999px;padding:8px 14px;background:#fff;cursor:pointer}
  .v5-tab.active{背景:${CBV5_THEME.ink};background:${CBV5_THEME.ink};color:#fff;border-color:${CBV5_THEME.ink}}
  .v5-card{border:1px solid ${CBV5_THEME.border};border-radius:16px;padding:16px;box-shadow:0 6px 18px rgba(0,0,0,.06);margin-bottom:16px;background:#fff}
  .v5-card .v5-title{letter-spacing:.2px}

  /* SVG 樣式（注意：fill 在 hover 會用 inline-style 覆蓋） */
  .v5-box{fill:#fff;stroke:#94a3b8;stroke-width:1.8;filter:url(#v5-ds)}
  .v5-box-strong{fill:${CBV5_THEME.panel};stroke:#475569;stroke-width:2;filter:url(#v5-ds)}
  .v5-arrow{stroke:${CBV5_THEME.ink};stroke-width:1.8}
  .v5-line{stroke:#94a3b8;stroke-width:1.6}
  .v5-note{fill:${CBV5_THEME.note};font-size:12px}

  /* Editor 區避免被裁切；TinyMCE 工具列 z-index */
  .v5-editor-wrap{position:relative; overflow:visible}
  .tox.tox-tinymce{z-index:12010}
</style>`;
    },
    toast(msg, ms = 1200) {
        let el = document.getElementById("v5-toast");
        if (!el) { el = document.createElement("div"); el.id = "v5-toast"; el.className = "v5-toast"; document.body.appendChild(el); }
        el.textContent = msg; el.classList.add("show");
        setTimeout(() => el.classList.remove("show"), ms);
    },
    modal(html, onMount) {
        const ov = document.createElement("div"); ov.className = "v5-modal";
        const dlg = document.createElement("div"); dlg.className = "v5-dialog"; dlg.innerHTML = html;
        ov.appendChild(dlg); document.body.appendChild(ov);
        const close = () => document.body.removeChild(ov);
        dlg.querySelectorAll("[data-close]").forEach(b => b.onclick = close);
        onMount && onMount({ root: ov, close, dlg });
        return { close, root: ov, dlg };
    }
};

/* ----------------------------- SVG 小工具（合併新版） ----------------------------- */
const NS = "http://www.w3.org/2000/svg";
const CBV5Svg = {
    el(tag, attrs = {}, children = []) { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v))); children.forEach(c => e.appendChild(c)); return e; },
    text(x, y, str, { anchor = "start", size = 14, weight = "normal", color = CBV5_THEME.ink } = {}) { const t = this.el("text", { x, y, "text-anchor": anchor, "font-size": size, "font-weight": weight, "font-family": CBV5_THEME.font, fill: color }); t.textContent = str; return t; },
    rect(x, y, w, h, r = 14, cls = "v5-box") { return this.el("rect", { x, y, width: w, height: h, rx: r, ry: r, class: cls }); },
    circle(cx, cy, r, cls = "v5-box") { return this.el("circle", { cx, cy, r, class: cls }); },
    polygon(points, cls = "v5-box") { return this.el("polygon", { points, class: cls }); },
    lane(x, y, w, h) { return this.el("rect", { x, y, width: w, height: h, rx: 16, ry: 16, fill: CBV5_THEME.lane, stroke: CBV5_THEME.border }); },
    line(x1, y1, x2, y2, cls = "v5-line") { return this.el("line", { x1, y1, x2, y2, class: cls }); },
    curveArrow2(x1, y1, x2, y2, { bend = .5, lift = -70, cls = "v5-arrow" } = {}) {
        const g = this.el("g");
        const cx = x1 + (x2 - x1) * bend, cy = y1 + (y2 - y1) * bend + lift;
        const p = this.el("path", { d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, class: cls, fill: "none" });
        g.appendChild(p);
        const ang = Math.atan2(y2 - cy, x2 - cx), ax = x2 - 12 * Math.cos(ang), ay = y2 - 12 * Math.sin(ang);
        g.appendChild(this.line(x2, y2, ax - 5 * Math.sin(ang), ay + 5 * Math.cos(ang), cls));
        g.appendChild(this.line(x2, y2, ax + 5 * Math.sin(ang), ay - 5 * Math.cos(ang), cls));
        return g;
    },
    wrapText(svg, { x, y, text, maxWidth, lineHeight = 18, size = 13, weight = "normal", color = CBV5_THEME.ink, anchor = "start", maxLines = 99 }) {
        const g = this.el("g", {}); const base = this.text(x, y, "", { anchor, size, weight, color }); g.appendChild(base);
        const probe = this.text(-9999, -9999, "", { anchor: "start", size, weight, color }); probe.setAttribute("opacity", "0"); svg.appendChild(probe);
        const push = (s, dy) => { const t = document.createElementNS(NS, "tspan"); t.setAttribute("x", String(x)); if (dy !== 0) t.setAttribute("dy", String(dy)); t.textContent = s; base.appendChild(t); };
        let line = "", dy = 0, lines = 0; const chars = Array.from(text || "");
        for (let i = 0; i < chars.length; i++) {
            const test = line + chars[i]; probe.textContent = test; const w = probe.getComputedTextLength();
            if (w <= maxWidth || line.length === 0) line = test;
            else {
                push(line, dy === 0 ? 0 : lineHeight); lines++;
                if (lines >= maxLines) {
                    let tail = ""; for (; i < chars.length; i++) { probe.textContent = tail + chars[i] + "…"; if (probe.getComputedTextLength() > maxWidth) break; tail += chars[i]; }
                    push(tail + "…", lineHeight); line = ""; break;
                }
                dy += lineHeight; line = chars[i];
            }
        }
        if (line) push(line, dy === 0 ? 0 : lineHeight);
        svg.removeChild(probe); return g;
    },
    addDefs(svg) {
        const defs = this.el("defs", {});
        // 藍色漸層（共用 hover）
        const g = this.el("linearGradient", { id: "v5BlueGrad", x1: "0%", y1: "0%", x2: "100%", y2: "100%" });
        g.appendChild(this.el("stop", { offset: "0%", "stop-color": CBV5_THEME.blue1 }));
        g.appendChild(this.el("stop", { offset: "100%", "stop-color": CBV5_THEME.blue2 }));
        defs.appendChild(g);
        // 綠色漸層（用於有填連結的模組）
        const g2 = this.el("linearGradient", { id: "v5GreenGrad", x1: "0%", y1: "0%", x2: "100%", y2: "100%" });
        g2.appendChild(this.el("stop", { offset: "0%", "stop-color": CBV5_THEME.green1 }));
        g2.appendChild(this.el("stop", { offset: "100%", "stop-color": CBV5_THEME.green2 }));
        defs.appendChild(g2);
        // 投影
        const f = this.el("filter", { id: "v5-ds", x: "-20%", y: "-20%", width: "140%", height: "140%" });
        f.appendChild(this.el("feDropShadow", { dx: "0", dy: "2", stdDeviation: "1.7", "flood-color": "#000", "flood-opacity": "0.12" }));
        defs.appendChild(f);
        svg.appendChild(defs);
    },
    // ★ Hover：用 inline style 覆蓋 CSS（藍／綠）
    decorateBlueHover(svg) {
        const pickGrad = (node) => {
            const explicit = node.getAttribute("data-hover-grad");
            if (explicit === "green") return "url(#v5GreenGrad)";
            if (explicit === "blue") return "url(#v5BlueGrad)";
            if (node.getAttribute("data-linked") === "1" || node.hasAttribute("data-href")) return "url(#v5GreenGrad)";
            return "url(#v5BlueGrad)";
        };
        svg.querySelectorAll("rect.v5-box, rect.v5-box-strong, circle.v5-box, polygon.v5-box").forEach(node => {
            node.style.transition = "transform .18s cubic-bezier(.2,.8,.2,1), filter .18s";
            node.style.transformBox = "fill-box"; node.style.transformOrigin = "center";
            node.addEventListener("mouseenter", () => {
                node.__oldStyleFill = node.style.fill; // 記住 inline style
                node.__oldStrokeOpacity = node.getAttribute("stroke-opacity");
                node.style.transform = "scale(1.04)";
                node.style.filter = "drop-shadow(0 10px 24px rgba(0,0,0,.18))";
                node.style.fill = pickGrad(node);            // 用 style.fill 覆蓋
                node.setAttribute("stroke-opacity", "0");
            });
            node.addEventListener("mouseleave", () => {
                node.style.transform = ""; node.style.filter = "";
                if (node.__oldStyleFill) node.style.fill = node.__oldStyleFill; else node.style.removeProperty("fill");
                if (node.__oldStrokeOpacity != null) node.setAttribute("stroke-opacity", node.__oldStrokeOpacity); else node.removeAttribute("stroke-opacity");
            });
        });
    },
    downloadPng(svgEl, filename = "v5.png") { ExportKit.downloadPngFromSvg(svgEl, filename); },
    downloadPdf(svgEl, filename = "v5.pdf") { ExportKit.downloadPdfFromSvg(svgEl, filename); },
};

/* ----------------------------- 舊版可編輯畫布 → 作為「模組佈局」子分頁（保留） ----------------------------- */
const CBV5ModuleEditor = (() => {
    // 內部狀態（沿用舊版，包在此頁專用）
    let state = {
        themeKey: "gradient",
        modules: [],
        selectedId: null,
        cols: 3,
        cardW: 320,
        cardH: 120,
        gapX: 28,
        gapY: 22,
        offsetX: 24,
        offsetY: 64,
    };

    function saveAll() { CBV5Store.save(state.modules); }
    function selected() { return state.modules.find(m => m.id === state.selectedId) || null; }
    function select(id) { state.selectedId = id; renderCanvas(); }
    const getLink = (m) => (m.link && m.link.trim()) || CBV5_DEFAULT_LINKS[m.id] || "";

    function headerBar() {
        const wrap = document.createElement("div");
        const head = document.createElement("div"); head.className = "v5-title"; head.innerHTML = `<div>V5｜食衣住行育樂 × 可編輯</div>`;
        const actions = document.createElement("div"); actions.className = "v5-actions";
        const bSave = document.createElement("button"); bSave.className = "btn btn-sm btn-primary"; bSave.textContent = "儲存（同步 API）"; bSave.onclick = () => saveAll();
        const bExportPng = document.createElement("button"); bExportPng.className = "btn btn-sm btn-outline-secondary"; bExportPng.textContent = "下載 PNG";
        const bExportPdf = document.createElement("button"); bExportPdf.className = "btn btn-sm btn-dark"; bExportPdf.textContent = "下載 PDF";
        actions.appendChild(bSave); actions.appendChild(bExportPng); actions.appendChild(bExportPdf);
        head.appendChild(actions);

        const bar = document.createElement("div"); bar.className = "v5-toolbar";
        const sel = document.createElement("select"); sel.className = "v5-select";
        Object.entries(CBV5_THEMES).forEach(([k, v]) => {
            const o = document.createElement("option"); o.value = k; o.textContent = v.name; if (k === state.themeKey) o.selected = true; sel.appendChild(o);
        });
        sel.onchange = () => { state.themeKey = sel.value; renderCanvas(); };
        bar.appendChild(document.createTextNode("主題：")); bar.appendChild(sel);
        const note = document.createElement("div"); note.className = "v5-note"; note.textContent = "雙擊標題＝只編標題；點小字＝只編小字；點分類＝只編分類；整框：無連結→開編輯；有連結→開新分頁。";

        wrap.appendChild(head); wrap.appendChild(bar); wrap.appendChild(note);

        // 匯出（綁定畫布）
        setTimeout(() => {
            const svg = document.getElementById("v5-svg-editor"); if (!svg) return;
            bExportPng.onclick = () => CBV5Svg.downloadPng(svg, "v5-modules.png");
            bExportPdf.onclick = () => CBV5Svg.downloadPdf(svg, "v5-modules.pdf");
        }, 0);

        return wrap;
    }

    function renderSorter(container) {
        container.innerHTML = `
      <div class="v5-sort">
        <h6>排序（拖曳 Chip 改變排列，放開即儲存）</h6>
        <div id="v5-sortlist" class="v5-sortlist"></div>
      </div>`;
        const list = container.querySelector("#v5-sortlist");
        state.modules.forEach(m => {
            const chip = document.createElement("div"); chip.className = "v5-chip"; chip.draggable = true; chip.textContent = m.name; chip.dataset.id = m.id;
            chip.addEventListener("dragstart", e => { chip.classList.add("dragging"); e.dataTransfer.setData("text/plain", m.id); });
            chip.addEventListener("dragend", () => chip.classList.remove("dragging"));
            list.appendChild(chip);
        });
        list.addEventListener("dragover", e => {
            e.preventDefault();
            const dragging = list.querySelector(".dragging"); if (!dragging) return;
            const after = Array.from(list.querySelectorAll(".v5-chip:not(.dragging)")).find(el => {
                const box = el.getBoundingClientRect();
                return e.clientX < box.left + box.width / 2;
            });
            if (after) list.insertBefore(dragging, after); else list.appendChild(dragging);
        });
        list.addEventListener("drop", () => {
            const newOrder = Array.from(list.querySelectorAll(".v5-chip")).map(el => el.dataset.id);
            state.modules.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
            saveAll(); renderCanvas();
        });
    }

    function renderCanvas() {
        const root = document.getElementById("v5-canvas-editor"); if (!root) return;
        root.innerHTML = "";
        const theme = CBV5_THEMES[state.themeKey];
        const svgH = state.offsetY + Math.ceil(state.modules.length / state.cols) * (state.cardH + state.gapY) + 40;
        const svg = CBV5Svg.el("svg", { id: "v5-svg-editor", viewBox: `0 0 ${state.offsetX * 2 + state.cols * (state.cardW + state.gapX) - state.gapX} ${svgH}` });
        CBV5Svg.addDefs(svg);

        // 標題
        svg.appendChild(CBVV5Helpers.smallTitle(svg, 20, 28, "食 / 衣 / 住 / 行 / 育 / 樂 × 協會（橘）／居希恩（淡藍紫） × 三階段（可編輯）"));

        // 卡片
        state.modules.forEach((m, idx) => {
            const col = idx % state.cols, row = Math.floor(idx / state.cols);
            const x = state.offsetX + col * (state.cardW + state.gapX);
            const y = state.offsetY + row * (state.cardH + state.gapY);
            const g = CBV5Svg.el("g", { "data-id": m.id });

            // 底形狀
            let shapeNode;
            if (m.shape === "pill") { shapeNode = CBV5Svg.rect(x, y, state.cardW, state.cardH, 999, "v5-box"); }
            else if (m.shape === "circle") { shapeNode = CBV5Svg.circle(x + state.cardW / 2, y + state.cardH / 2, Math.min(state.cardW, state.cardH) / 2, "v5-box"); }
            else if (m.shape === "diamond") {
                const cx = x + state.cardW / 2, cy = y + state.cardH / 2, w = state.cardW, h = state.cardH;
                const pts = `${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`;
                shapeNode = CBV5Svg.polygon(pts, "v5-box");
            } else { shapeNode = CBV5Svg.rect(x, y, state.cardW, state.cardH, 14, "v5-box"); }
            shapeNode.setAttribute("fill", theme.boxFill);
            shapeNode.setAttribute("stroke", theme.boxStroke);
            shapeNode.setAttribute("stroke-width", "1.6");
            shapeNode.style.cursor = "pointer";

            const link = getLink(m);
            // ★ 標記是否有連結 → hover 會變綠漸層
            shapeNode.setAttribute("data-linked", link ? "1" : "0");
            if (link) { shapeNode.setAttribute("data-href", link); shapeNode.setAttribute("title", `前往：${link}`); }

            // 選取外框
            if (state.selectedId === m.id) {
                const sel = CBV5Svg.rect(x - 4, y - 4, state.cardW + 8, state.cardH + 8, 16, "");
                sel.setAttribute("fill", "none"); sel.setAttribute("stroke", "#111827"); sel.setAttribute("stroke-width", "2.2");
                svg.appendChild(sel);
            }

            // 組織色框角標（左上）
            const orgC = CBV5_ORG[m.org] || CBV5_ORG["居希恩"];
            const corner = CBV5Svg.rect(x - 2, y - 2, 22, 22, 6, "");
            corner.setAttribute("fill", orgC.fill); corner.setAttribute("stroke", orgC.stroke);

            // 內容：標題 / 小字 / 分類 / 階段 pill
            const tx = x + 14, ty = y + 28;
            const title = CBV5Svg.text(tx, ty, m.name || "未命名", { size: 15, weight: "bold" });
            title.style.cursor = "text";
            title.addEventListener("dblclick", (ev) => { ev.stopPropagation(); openEditor(m.id, "title"); });

            const sub = CBV5Svg.wrapText(svg, { x: tx, y: ty + 20, text: m.subtitle || "（雙擊標題、點小字或分類即可編輯）", maxWidth: state.cardW - 28, size: 12, color: "#475569" });
            sub.style.cursor = "text";
            sub.addEventListener("click", (ev) => { ev.stopPropagation(); openEditor(m.id, "subtitle"); });

            // 分類 pill（左下）
            const catW = Math.min(80, m.category ? 10 + m.category.length * 16 : 40);
            const catY = y + state.cardH - 20;
            const pill = CBV5Svg.rect(tx, catY, catW, 18, 10, "");
            pill.setAttribute("fill", "#eef2ff"); pill.setAttribute("stroke", "#6366f1");
            const pillT = CBV5Svg.text(tx + catW / 2, catY + 13, m.category || "分類", { anchor: "middle", size: 11, weight: "bold", color: "#3730a3" });
            [pill, pillT].forEach(n => {
                n.style.cursor = "text";
                n.addEventListener("click", (ev) => { ev.stopPropagation(); openEditor(m.id, "category"); });
            });

            // 階段 pill（右下）
            const st = CBV5_STAGE[m.stage] || CBV5_STAGE["存活期"];
            const spW = 66; const spX = x + state.cardW - spW - 12;
            const sp = CBV5Svg.rect(spX, catY, spW, 18, 10, "");
            sp.setAttribute("fill", st.fill); sp.setAttribute("stroke", st.stroke);
            const spT = CBV5Svg.text(spX + spW / 2, catY + 13, m.stage, { anchor: "middle", size: 11, weight: "bold", color: st.text });

            // 整框點擊：有連結→開新分頁；沒連結→開編輯
            shapeNode.addEventListener("click", (e) => {
                select(m.id);
                if (link) { window.open(link, "_blank", "noopener"); }
                else { openEditor(m.id, "all"); }
            });
            // 點擊任何區塊都選取
            [shapeNode, title, sub, pill, pillT, sp, spT, corner].forEach(n => n.addEventListener("click", () => select(m.id)));

            g.appendChild(shapeNode);
            g.appendChild(corner);
            g.appendChild(title);
            g.appendChild(sub);
            g.appendChild(pill);
            g.appendChild(pillT);
            g.appendChild(sp);
            g.appendChild(spT);
            svg.appendChild(g);
        });

        root.appendChild(svg);
        CBV5Svg.decorateBlueHover(svg); // 新版 hover 效果（含綠色條件）
    }

    /* ---------- TinyMCE 編輯器（沿用舊版：僅彈窗使用） ---------- */
    function openEditor(id, mode /* title|subtitle|category|all */) {
        const m = state.modules.find(x => x.id === id); if (!m) return;
        const html = `
      <h4>編輯：${m.name}</h4>
      <div class="v5-row"><label>名稱</label><input id="ed-name" type="text" value="${m.name}"></div>
      <div class="v5-row"><label>小字</label><input id="ed-sub" type="text" value="${m.subtitle || ""}"></div>
      <div class="v5-row"><label>分類</label><input id="ed-cat" type="text" value="${m.category || ""}"></div>
      <div class="v5-row"><label>連結</label><input id="ed-link" type="text" placeholder="https://..." value="${getLink(m)}"></div>
      <div class="v5-note">內文支援圖文、表格；Shift+Enter 換行</div>
      <textarea id="v5-editor-modal"></textarea>
      <div class="v5-actions-2">
        <button class="btn btn-sm btn-secondary" data-close>取消</button>
        <button id="ed-save" class="btn btn-sm btn-primary">儲存</button>
      </div>`;

        CBV5UI.modal(html, ({ dlg, close }) => {
            // 決定要帶入的內容
            let content = m.desc || "";
            if (mode === "title") content = `<h2>${m.name}</h2>`;
            if (mode === "subtitle") content = `<p>${m.subtitle || ""}</p>`;
            if (mode === "category") content = `<p>${m.category || ""}</p>`;

            // init TinyMCE（modal 專用）
            if (window.tinymce) {
                const exist = tinymce.get("v5-editor-modal"); if (exist) exist.remove();
                tinymce.init({
                    selector: '#v5-editor-modal',
                    plugins: 'advlist autolink lists link image charmap preview anchor code table',
                    toolbar: 'undo redo | formatselect | bold italic backcolor | code | table | image | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
                    height: 420, menubar: 'file edit view insert format tools table', branding: false,
                    setup: (ed) => ed.on('init', () => ed.setContent(content || "")),
                    z_index: 12010
                });
            }

            dlg.querySelector("#ed-save").onclick = () => {
                m.name = dlg.querySelector("#ed-name").value || m.name;
                m.subtitle = dlg.querySelector("#ed-sub").value || "";
                m.category = dlg.querySelector("#ed-cat").value || m.category;
                const linkVal = (dlg.querySelector("#ed-link").value || "").trim();
                m.link = linkVal; // 空字串代表無連結，會 fallback 到 DEFAULT_LINKS（若該 id 有）
                m.desc = tinymce.get("v5-editor-modal") ? tinymce.get("v5-editor-modal").getContent() : m.desc;
                CBV5Store.update(m); renderCanvas();
                close(); if (window.tinymce) tinymce.remove("#v5-editor-modal");
            };

            dlg.querySelector("[data-close]").onclick = () => { if (window.tinymce) tinymce.remove("#v5-editor-modal"); };
        });
    }

    /* ---------- 右側懸浮工具箱 ---------- */
    function spawnToolbox() {
        if (document.getElementById("v5-fab")) return;
        const root = document.createElement("div"); root.id = "v5-fab"; root.className = "v5-fab";
        const panel = document.createElement("div"); panel.className = "v5-panel";
        panel.innerHTML = `
      <div class="hd"><div class="drag">工具箱</div><button id="v5-collapse" class="btn btn-sm btn-light">—</button></div>
      <div class="bd">
        <button id="tb-add" class="v5-btn">＋ 模組</button>
        <button id="tb-dup" class="v5-btn">複製</button>
        <button id="tb-del" class="v5-btn">刪除</button>
        <button id="tb-prev" class="v5-btn">預覽</button>
        <button id="tb-save-tpl" class="v5-btn">另存為樣板</button>
        <button id="tb-from-tpl" class="v5-btn">從樣板建立</button>
        <button id="tb-draw" class="v5-btn">手繪</button>
        <button id="tb-save" class="v5-btn">儲存</button>
      </div>`;
        const mini = document.createElement("div"); mini.className = "v5-mini"; mini.title = "展開工具箱"; mini.innerHTML = "⋯"; mini.style.display = "none";

        panel.querySelector("#v5-collapse").onclick = () => { panel.style.display = "none"; mini.style.display = "flex"; };
        mini.onclick = () => { mini.style.display = "none"; panel.style.display = "block"; };

        // 功能鍵
        panel.querySelector("#tb-add").onclick = () => addModuleDialog();
        panel.querySelector("#tb-dup").onclick = () => duplicateSelected();
        panel.querySelector("#tb-del").onclick = () => deleteSelected();
        panel.querySelector("#tb-prev").onclick = () => previewSelected();
        panel.querySelector("#tb-save-tpl").onclick = () => saveAsTemplate();
        panel.querySelector("#tb-from-tpl").onclick = () => fromTemplate();
        panel.querySelector("#tb-draw").onclick = () => drawingPad();
        panel.querySelector("#tb-save").onclick = () => saveAll();

        // 拖曳移動
        const hd = panel.querySelector(".hd");
        let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
        const onDown = e => { dragging = true; const r = root.getBoundingClientRect(); ox = r.left; oy = r.top; sx = e.clientX; sy = e.clientY; document.addEventListener("mousemove", onMove); document.addEventListener("mouseup", onUp); };
        const onMove = e => { if (!dragging) return; const nx = ox + (e.clientX - sx); const ny = oy + (e.clientY - sy); root.style.right = "auto"; root.style.left = nx + "px"; root.style.top = ny + "px"; };
        const onUp = () => { dragging = false; document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
        hd.addEventListener("mousedown", onDown);

        root.appendChild(panel); root.appendChild(mini); document.body.appendChild(root);
    }

    /* ---------- 對話框：新增/複製/刪除/預覽/樣板 ---------- */
    function addModuleDialog(prefill = {}) {
        CBV5UI.modal(`
      <h4>新增模組</h4>
      <div class="v5-row"><label>標題</label><input id="m-title" type="text" value="${prefill.name || ""}"></div>
      <div class="v5-row"><label>小字</label><input id="m-subtitle" type="text" value="${prefill.subtitle || ""}"></div>
      <div class="v5-row"><label>分類</label><input id="m-category" type="text" value="${prefill.category || "食"}"></div>
      <div class="v5-row"><label>連結</label><input id="m-link" type="text" placeholder="https://..." value="${prefill.link || ""}"></div>
      <div class="v5-row"><label>組織</label>
        <select id="m-org">
          <option ${prefill.org === "協會" ? "selected" : ""}>協會</option>
          <option ${prefill.org === "居希恩" ? "selected" : ""}>居希恩</option>
        </select>
      </div>
      <div class="v5-row"><label>階段</label>
        <select id="m-stage">
          ${["存活期", "成長期", "宇宙村"].map(s => `<option ${prefill.stage === s ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </div>
      <div class="v5-row"><label>形狀</label>
        <select id="m-shape">
          ${["rect", "pill", "diamond", "circle"].map(s => `<option ${prefill.shape === s ? "selected" : ""} value="${s}">${s}</option>`).join("")}
        </select>
      </div>
      <div class="v5-actions-2">
        <button class="btn btn-sm btn-secondary" data-close>取消</button>
        <button id="m-ok" class="btn btn-sm btn-primary">加入</button>
      </div>
    `, ({ dlg, close }) => {
            dlg.querySelector("#m-ok").onclick = () => {
                const m = {
                    id: "mod-" + Math.random().toString(36).slice(2, 8),
                    name: dlg.querySelector("#m-title").value || "未命名",
                    subtitle: dlg.querySelector("#m-subtitle").value || "",
                    category: dlg.querySelector("#m-category").value || "食",
                    link: (dlg.querySelector("#m-link").value || "").trim(),
                    org: dlg.querySelector("#m-org").value,
                    stage: dlg.querySelector("#m-stage").value,
                    shape: dlg.querySelector("#m-shape").value,
                    desc: prefill.desc || ""
                };
                state.modules.push(m); saveAll(); renderCanvas(); renderSorter(document.getElementById("v5-sort-editor")); select(m.id);
                close();
            };
        });
    }

    function duplicateSelected() {
        const m = selected(); if (!m) return CBV5UI.toast("請先選取一個模組");
        const copy = JSON.parse(JSON.stringify(m));
        copy.id = m.id + "-copy-" + Math.random().toString(36).slice(2, 5);
        copy.name = m.name + "（複製）";
        state.modules.push(copy); saveAll(); renderCanvas(); renderSorter(document.getElementById("v5-sort-editor")); select(copy.id);
    }

    function deleteSelected() {
        const m = selected(); if (!m) return CBV5UI.toast("請先選取一個模組");
        if (!confirm(`刪除「${m.name}」？`)) return;
        state.modules = state.modules.filter(x => x.id !== m.id);
        saveAll(); state.selectedId = null; renderCanvas(); renderSorter(document.getElementById("v5-sort-editor"));
    }

    function previewSelected() {
        const m = selected(); if (!m) return CBV5UI.toast("請先選取一個模組");
        const link = getLink(m);
        CBV5UI.modal(`
      <h4>預覽：${m.name}</h4>
      <div style="border:1px solid #e5e7eb;border-radius:10px;padding:12px">
        <h3 style="margin:0">${m.name}</h3>
        ${m.subtitle ? `<div style="color:#64748b">${m.subtitle}</div>` : ""}
        <div style="margin:10px 0"><span style="padding:3px 8px;border-radius:999px;background:#eef2ff;color:#3730a3">${m.category}</span>
        <span style="padding:3px 8px;border-radius:999px;margin-left:6px;background:${CBV5_STAGE[m.stage].fill};color:${CBV5_STAGE[m.stage].text}">${m.stage}</span></div>
        ${link ? `<div style="margin:8px 0"><a href="${link}" target="_blank" rel="noopener">外部連結</a></div>` : ""}
        <div>${m.desc || "<em style='color:#94a3b8'>（尚無內容）</em>"}</div>
      </div>
      <div class="v5-actions-2">
        <button class="btn btn-sm btn-secondary" data-close>關閉</button>
      </div>
    `, () => { });
    }

    function saveAsTemplate() {
        const m = selected(); if (!m) return CBV5UI.toast("請先選取一個模組");
        CBV5UI.modal(`
      <h4>另存為樣板</h4>
      <div class="v5-row"><label>名稱</label><input id="tpl-name" type="text" value="${m.name}"></div>
      <div class="v5-actions-2">
        <button class="btn btn-sm btn-secondary" data-close>取消</button>
        <button id="tpl-ok" class="btn btn-sm btn-primary">儲存</button>
      </div>
    `, ({ dlg, close }) => {
            dlg.querySelector("#tpl-ok").onclick = () => {
                CBV5Templates.add({ name: dlg.querySelector("#tpl-name").value || m.name, html: m.desc || "" });
                CBV5UI.toast("樣板已儲存"); close();
            };
        });
    }

    function fromTemplate() {
        const tpls = CBV5Templates.load();
        CBV5UI.modal(`
      <h4>從樣板建立</h4>
      <div class="v5-row"><label>樣板</label>
        <select id="tpl-sel">${tpls.map((t, i) => `<option value="${i}">${t.name}</option>`).join("")}</select>
      </div>
      <div class="v5-row"><label>標題</label><input id="tpl-title" type="text" value="新模組"></div>
      <div class="v5-row"><label>分類</label><input id="tpl-cat" type="text" value="食"></div>
      <div class="v5-row"><label>連結</label><input id="tpl-link" type="text" placeholder="https://..."></div>
      <div class="v5-row"><label>組織</label>
        <select id="tpl-org"><option>協會</option><option selected>居希恩</option></select>
      </div>
      <div class="v5-row"><label>階段</label>
        <select id="tpl-stage"><option>存活期</option><option selected>成長期</option><option>宇宙村</option></select>
      </div>
      <div class="v5-row"><label>形狀</label>
        <select id="tpl-shape"><option>rect</option><option>pill</option><option>diamond</option><option>circle</option></select>
      </div>
      <div class="v5-actions-2">
        <button class="btn btn-sm btn-secondary" data-close>取消</button>
        <button id="tpl-add" class="btn btn-sm btn-primary">加入</button>
      </div>
    `, ({ dlg, close }) => {
            dlg.querySelector("#tpl-add").onclick = () => {
                const t = tpls[parseInt(dlg.querySelector("#tpl-sel").value, 10)];
                const m = {
                    id: "mod-" + Math.random().toString(36).slice(2, 8),
                    name: dlg.querySelector("#tpl-title").value || t.name,
                    subtitle: "",
                    category: dlg.querySelector("#tpl-cat").value || "食",
                    link: (dlg.querySelector("#tpl-link").value || "").trim(),
                    org: dlg.querySelector("#tpl-org").value,
                    stage: dlg.querySelector("#tpl-stage").value,
                    shape: dlg.querySelector("#tpl-shape").value,
                    desc: t.html
                };
                state.modules.push(m); saveAll(); renderCanvas(); renderSorter(document.getElementById("v5-sort-editor")); select(m.id);
                close();
            };
        });
    }

    function drawingPad() {
        CBV5UI.modal(`
      <h4>手繪（畫完可匯入選取模組內容）</h4>
      <canvas id="pad" width="720" height="360" style="border:1px solid #e5e7eb;border-radius:10px;width:100%"></canvas>
      <div class="v5-row">
        <label>筆粗</label><input id="sz" type="range" min="1" max="16" value="3">
        <label>顏色</label><input id="col" type="color" value="#111827">
      </div>
      <div class="v5-actions-2">
        <button class="btn btn-sm btn-secondary" data-close>關閉</button>
        <button id="pad-clear" class="btn btn-sm btn-outline-secondary">清除</button>
        <button id="pad-insert" class="btn btn-sm btn-primary">匯入選取模組</button>
      </div>
    `, ({ dlg, close }) => {
            const cvs = dlg.querySelector("#pad"); const ctx = cvs.getContext("2d");
            let drawing = false, last = null;
            const get = e => { const r = cvs.getBoundingClientRect(); const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left; const y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top; return { x, y }; };
            const draw = (a, b) => { ctx.strokeStyle = dlg.querySelector("#col").value; ctx.lineWidth = parseInt(dlg.querySelector("#sz").value, 10); ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
            const down = e => { drawing = true; last = get(e); };
            const move = e => { if (!drawing) return; const p = get(e); draw(last, p); last = p; };
            const up = () => drawing = false;
            cvs.addEventListener("mousedown", down); cvs.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
            cvs.addEventListener("touchstart", down, { passive: false }); cvs.addEventListener("touchmove", e => { e.preventDefault(); move(e); }, { passive: false }); window.addEventListener("touchend", up);
            dlg.querySelector("#pad-clear").onclick = () => { ctx.clearRect(0, 0, cvs.width, cvs.height); };
            dlg.querySelector("#pad-insert").onclick = () => {
                const m = selected(); if (!m) return CBV5UI.toast("請先選取一個模組");
                const url = cvs.toDataURL("image/png");
                m.desc = `<figure><img style="max-width:100%" src="${url}" alt=""></figure>` + (m.desc || "");
                CBV5Store.update(m); renderCanvas(); close();
            };
        });
    }

    function render(container) {
        // 載入資料
        state.modules = CBV5Store.load();

        const page = document.createElement("div");
        const headWrap = document.createElement("div"); headWrap.appendChild(headerBar());

        const canvasBox = document.createElement("div"); canvasBox.id = "v5-canvas-editor"; canvasBox.style.marginTop = "8px";
        const sortBox = document.createElement("div"); sortBox.id = "v5-sort-editor";

        page.appendChild(headWrap);
        page.appendChild(canvasBox);
        page.appendChild(sortBox);

        renderCanvas(); renderSorter(sortBox); spawnToolbox();

        return CBV5Layout.card("模組佈局（可編輯）", page);
    }

    // 對外
    return { render };
})();

/* ----------------------------- 新版通用 Layout ----------------------------- */
class CBV5Layout {
    static card(title, contentNode, withDownload = true) {
        const wrap = document.createElement("div"); wrap.className = "v5-card";
        const head = document.createElement("div"); head.className = "v5-title"; head.innerHTML = `<div>${title}</div>`;
        if (withDownload) {
            const btns = document.createElement("div"); btns.className = "v5-actions";
            const b1 = document.createElement("button"); b1.className = "btn btn-sm btn-outline-secondary"; b1.textContent = "下載 PNG";
            const b2 = document.createElement("button"); b2.className = "btn btn-sm btn-dark"; b2.textContent = "下載 PDF";
            btns.appendChild(b1); btns.appendChild(b2); head.appendChild(btns);
            setTimeout(() => {
                const svg = contentNode.querySelector("svg"); if (!svg) return;
                b1.onclick = () => CBV5Svg.downloadPng(svg, (title || "v5").replace(/\s+/g, "_") + ".png");
                b2.onclick = () => CBV5Svg.downloadPdf(svg, (title || "v5").replace(/\s+/g, "_") + ".pdf");
            }, 0);
        }
        wrap.appendChild(head); wrap.appendChild(contentNode); return wrap;
    }
    static tabs(container, tabs) {
        const head = document.createElement("div"); head.className = "v5-tabs";
        const body = document.createElement("div"); body.className = "v5-body";
        container.appendChild(head); container.appendChild(body);
        const btns = [];
        const switchTo = (i) => { btns.forEach((b, j) => b.classList.toggle("active", j === i)); body.innerHTML = ""; body.appendChild(tabs[i].render()); };
        tabs.forEach((t, i) => { const b = document.createElement("button"); b.className = "v5-tab" + (i === 0 ? " active" : ""); b.textContent = t.name; b.onclick = () => switchTo(i); head.appendChild(b); btns.push(b); });
        switchTo(0);
    }
}

/* ----------------------------- 頁面群（新版靜態視覺） ----------------------------- */
class CBV5Pages {
    static cardOf(title, svg) { CBV5Svg.addDefs(svg); CBV5Svg.decorateBlueHover(svg); const shell = document.createElement("div"); shell.appendChild(svg); return CBV5Layout.card(title, shell); }

    // 01 總覽
    static p01_Overview() {
        const wrap = document.createElement("div");
        const svg = CBV5Svg.el("svg", { viewBox: "0 0 1200 540" });
        const q = [
            { x: 90, y: 90, t: "V1｜交易核心", s: "上架 / 購物車 / Coins / Escrow" },
            { x: 640, y: 90, t: "V2｜AI 中樞", s: "導購 / 決策 / 多語 / 定價" },
            { x: 90, y: 310, t: "V3｜影響力", s: "愛心幣 × 時間銀行 × 公益" },
            { x: 640, y: 310, t: "V4｜樂高模組", s: "食衣住行育樂 × 可插拔" },
        ];
        q.forEach(b => {
            svg.appendChild(CBV5Svg.rect(b.x, b.y, 470, 120, 16, "v5-box"));
            svg.appendChild(CBV5Svg.text(b.x + 16, b.y + 36, b.t, { size: 16, weight: "bold" }));
            svg.appendChild(CBV5Svg.text(b.x + 16, b.y + 64, "• " + b.s, { size: 13, color: CBV5_THEME.sub }));
        });
        svg.appendChild(CBV5Svg.text(600, 40, "V5：整合關係與順序（以 V2/V3 視覺呈現）", { anchor: "middle", size: 14, weight: "bold" }));
        const mids = q.map(b => ({ x: b.x + 235, y: b.y + 60 }));
        svg.appendChild(CBV5Svg.curveArrow2(mids[0].x + 80, mids[0].y, mids[1].x - 80, mids[1].y, { lift: -80 }));
        svg.appendChild(CBV5Svg.curveArrow2(mids[1].x, mids[1].y + 40, mids[3].x, mids[3].y - 40, { lift: +60 }));
        svg.appendChild(CBV5Svg.curveArrow2(mids[0].x, mids[0].y + 40, mids[2].x, mids[2].y - 40, { lift: +60 }));
        svg.appendChild(CBV5Svg.curveArrow2(mids[2].x + 80, mids[2].y, mids[3].x - 80, mids[3].y, { lift: -80 }));
        wrap.appendChild(this.cardOf("總覽（V1~V4 統整）", svg));
        return wrap;
    }

    // （原 05 V4 精華頁已移除出分頁，不再掛上）

    // 06 流量→轉化（綜觀）
    static p06_TrafficConv() {
        const wrap = document.createElement("div");
        const svg = CBV5Svg.el("svg", { viewBox: "0 0 1200 520" });
        const left = { x: 60, y: 80, w: 460, h: 360 }, right = { x: 680, y: 80, w: 460, h: 360 };
        svg.appendChild(CBV5Svg.rect(left.x, left.y, left.w, left.h, 16, "v5-box"));
        svg.appendChild(CBV5Svg.text(left.x + 16, left.y + 34, "引流層（短劇/直播/社交/內容）", { size: 15, weight: "bold" }));
        svg.appendChild(CBV5Svg.rect(right.x, right.y, right.w, right.h, 16, "v5-box"));
        svg.appendChild(CBV5Svg.text(right.x + 16, right.y + 34, "轉化層（商品卡/Coins/Escrow/AI）", { size: 15, weight: "bold" }));
        svg.appendChild(CBV5Svg.curveArrow2(left.x + left.w, left.y + left.h / 2, right.x, right.y + right.h / 2, { lift: -80 }));
        wrap.appendChild(this.cardOf("流量→轉化（綜觀）", svg));
        return wrap;
    }

    // 07 資料流 × 依賴
    static p07_DataDeps() {
        const wrap = document.createElement("div");
        const svg = CBV5Svg.el("svg", { viewBox: "0 0 1200 560" });
        const lanes = [{ y: 90, name: "事件蒐集" }, { y: 240, name: "特徵工程" }, { y: 390, name: "策略決策" }];
        lanes.forEach(l => { svg.appendChild(CBV5Svg.lane(20, l.y, 1160, 110)); svg.appendChild(CBV5Svg.text(36, l.y + 26, l.name, { size: 13, weight: "bold" })); });
        const evx = [60, 220, 380, 540, 700, 860, 1020], evt = ["view", "add_to_cart", "live_watch", "start_checkout", "purchase", "refund", "inventory"];
        evx.forEach((x, i) => {
            svg.appendChild(CBV5Svg.rect(x, 120, 140, 54, 12, "v5-box"));
            svg.appendChild(CBV5Svg.text(x + 70, 150, evt[i], { anchor: "middle", size: 12, weight: "bold" }));
            svg.appendChild(CBV5Svg.curveArrow2(x + 70, 174, x + 70, 240, { lift: -30 }));
        });
        wrap.appendChild(this.cardOf("資料流 × 依賴圖", svg));
        return wrap;
    }

    // 08 模組依存關係（順序）
    static p08_ModuleOrder() {
        const wrap = document.createElement("div");
        const svg = CBV5Svg.el("svg", { viewBox: "0 0 1200 420" });
        const steps = [{ x: 80, t: "① 交易核心" }, { x: 320, t: "② AI 導購" }, { x: 560, t: "③ 影響力串接" }, { x: 800, t: "④ 樂高拓展" }];
        steps.forEach((s, i) => {
            svg.appendChild(CBV5Svg.rect(s.x, 160, 200, 90, 14, "v5-box"));
            svg.appendChild(CBV5Svg.text(s.x + 100, 205, s.t, { anchor: "middle", size: 14, weight: "bold" }));
            if (i < steps.length - 1) svg.appendChild(CBV5Svg.curveArrow2(s.x + 200, 205, steps[i + 1].x, 205, { lift: -40 }));
        });
        wrap.appendChild(this.cardOf("模組依存關係（有序上線）", svg));
        return wrap;
    }

    // 09 支付×託管×物流
    static p09_PayEscrowLogi() {
        const wrap = document.createElement("div");
        const svg = CBV5Svg.el("svg", { viewBox: "0 0 1200 520" });
        svg.appendChild(CBVV5Helpers.kvRow(svg, 60, 120, [
            ["平台幣（居希恩幣）", "Ledger / Escrow"],
            ["冠名幣", "回饋 / 公益捐贈"],
            ["時間銀行", "任務兌換 / 社群治理"],
            ["金流（ECPay 等）", "信用卡 / 超商 / ATM"]
        ]));
        svg.appendChild(CBV5Svg.text(60, 420, "物流：店配/宅配/即時快遞；餐飲對接 Foodpanda/Uber Eats（可擴充）", { size: 12, color: CBV5_THEME.note }));
        wrap.appendChild(this.cardOf("支付 × 託管 × 物流", svg));
        return wrap;
    }

    // 10 KPI 看板（修正）
    static p10_KPI() {
        const wrap = document.createElement("div");
        const svg = CBV5Svg.el("svg", { viewBox: "0 0 1200 380" });
        const kpis = ["7/30 日 GMV", "TTF(首單時間)", "直播 CTR", "即買率", "退款率", "會員 LTV"];
        kpis.forEach((k, i) => {
            const x = 60 + i * 180;
            svg.appendChild(CBV5Svg.rect(x, 120, 160, 90, 14, "v5-box-strong"));
            svg.appendChild(CBV5Svg.text(x + 80, 165, k, { anchor: "middle", size: 13, weight: "bold" }));
            svg.appendChild(CBV5Svg.text(x + 80, 190, "—", { anchor: "middle", size: 12, color: CBV5_THEME.note }));
        });
        wrap.appendChild(this.cardOf("營運 KPI 看板（指標位）", svg));
        return wrap;
    }

    // 11 路線圖（三階段）
    static p11_Roadmap() {
        const wrap = document.createElement("div");
        const svg = CBV5Svg.el("svg", { viewBox: "0 0 1200 420" });
        const r = [
            ["Stage 1：MVP", "上架/車/結帳（Coins+Escrow）", "AI 入門導購"],
            ["Stage 2：成長", "直播/短劇/多語", "跨境物流/支付"],
            ["Stage 3：宇宙村", "Unity3D/VR/AR", "AI 分身 / Web3"]
        ];
        r.forEach((v, i) => {
            const x = 80 + i * 360;
            svg.appendChild(CBV5Svg.rect(x, 120, 300, 140, 16, "v5-box-strong"));
            svg.appendChild(CBV5Svg.text(x + 16, 150, v[0], { size: 15, weight: "bold" }));
            svg.appendChild(CBV5Svg.text(x + 16, 176, "• " + v[1], { size: 13 }));
            svg.appendChild(CBV5Svg.text(x + 16, 198, "• " + v[2], { size: 13 }));
            if (i < r.length - 1) svg.appendChild(CBV5Svg.curveArrow2(x + 300, 190, 80 + (i + 1) * 360, 190, { lift: -50 }));
        });
        wrap.appendChild(this.cardOf("三階段路線圖", svg));
        return wrap;
    }

    // 12 居希恩營業項目
    static p12_BizItems() {
        const wrap = document.createElement("div");
        const svg = CBV5Svg.el("svg", { viewBox: "0 0 1200 560" });
        CBV5Svg.addDefs(svg);

        const ITEMS = [
            ["F206020", "日常用品零售業"],
            ["F399040", "無店面零售業"],
            ["F204110", "布疋、衣著、鞋、帽、傘、服飾品零售業"],
            ["F208040", "化粧品零售業"],
            ["F213060", "電信器材零售業"],
            ["F299990", "其他零售業"],
            ["F399990", "其他綜合零售業"],
            ["ZZ99999", "除許可業務外，得經營法令非禁止或限制之業務"],
            ["F213110", "電池零售業"],
            ["IZ10010", "排版業"],
            ["F201010", "農產品零售業"]
        ];

        svg.appendChild(CBV5Svg.rect(40, 60, 1120, 90, 16, "v5-box-strong"));
        svg.appendChild(CBV5Svg.text(60, 95, "居希恩營業項目（公司登記事項）", { size: 16, weight: "bold" }));
        svg.appendChild(CBV5Svg.text(60, 122, "以下項目由你提供，作為法規對應之正式營業項目清單。", { size: 12, color: CBV5_THEME.note }));

        const left = ITEMS.slice(0, 6);
        const right = ITEMS.slice(6);

        const box = (x, y, code, name) => {
            const w = 520, h = 68;
            svg.appendChild(CBV5Svg.rect(x, y, w, h, 12, "v5-box"));
            svg.appendChild(CBV5Svg.text(x + 14, y + 30, code, { size: 14, weight: "bold" }));
            svg.appendChild(CBV5Svg.wrapText(svg, { x: x + 14, y: y + 52, text: name, maxWidth: w - 28, size: 12, color: CBV5_THEME.sub }));
        };

        let y = 180;
        left.forEach(([c, n]) => { box(60, y, c, n); y += 80; });

        y = 180;
        right.forEach(([c, n]) => { box(620, y, c, n); y += 80; });

        wrap.appendChild(this.cardOf("居希恩營業項目", svg));
        return wrap;
    }

    // 13 教育 × 教會
    static p13_EduChurch() {
        const wrap = document.createElement("div");
        const svg = CBV5Svg.el("svg", { viewBox: "0 0 1200 520" });
        const blocks = [
            { x: 80, y: 120, t: "教育（學校）", list: ["課表/作業/測驗/多語字幕", "AI 助教：批改/講解/語音"] },
            { x: 460, y: 120, t: "教會（治理）", list: ["週報/會計/團契/活動", "志工排班/奉獻/透明帳"] },
            { x: 840, y: 120, t: "商城/公益串接", list: ["周邊/NFT/課程票券", "餐券/送餐/任務兌換"] }
        ];
        blocks.forEach(b => {
            svg.appendChild(CBV5Svg.rect(b.x, b.y, 260, 180, 16, "v5-box"));
            svg.appendChild(CBV5Svg.text(b.x + 16, b.y + 34, b.t, { size: 14, weight: "bold" }));
            b.list.forEach((s, i) => svg.appendChild(CBV5Svg.text(b.x + 16, b.y + 64 + i * 22, "• " + s, { size: 12, color: CBV5_THEME.sub })));
        });
        wrap.appendChild(this.cardOf("教育 × 教會 串接", svg));
        return wrap;
    }

    // 14 社群治理 × 時間銀行
    static p14_GovernTime() {
        const wrap = document.createElement("div");
        const svg = CBV5Svg.el("svg", { viewBox: "0 0 1200 520" });
        const lanes = [{ x: 60, y: 90, t: "社群任務" }, { x: 420, y: 90, t: "驗收/核銷" }, { x: 780, y: 90, t: "點數/治理" }];
        lanes.forEach(l => { svg.appendChild(CBV5Svg.rect(l.x, 120, 300, 120, 14, "v5-box")); svg.appendChild(CBV5Svg.text(l.x + 16, 150, l.t, { size: 14, weight: "bold" })); });
        svg.appendChild(CBV5Svg.curveArrow2(360, 180, 420, 180, { lift: -40 }));
        svg.appendChild(CBV5Svg.curveArrow2(720, 180, 780, 180, { lift: -40 }));
        wrap.appendChild(this.cardOf("社群治理 × 時間銀行", svg));
        return wrap;
    }
}

/* 小工具：畫資料列、清單、標題 */
const CBVV5Helpers = {
    smallTitle(svg, x, y, text) { return svg.appendChild(CBV5Svg.text(x, y, text, { size: 14, weight: "bold", color: "#334155" })); },
    kvRow(svg, x, y, rows) {
        rows.forEach((r, i) => {
            const xx = x + i * 280;
            CBVV5Helpers.kvBox(svg, xx, y, r[0], r[1]);
            if (i < rows.length - 1) svg.appendChild(CBV5Svg.curveArrow2(xx + 240, y + 50, x + (i + 1) * 280, y + 50, { lift: -30 }));
        });
        return CBV5Svg.el("g", {});
    },
    kvBox(svg, x, y, k, v) {
        svg.appendChild(CBV5Svg.rect(x, y, 240, 100, 12, "v5-box"));
        svg.appendChild(CBV5Svg.text(x + 12, y + 30, k, { size: 13, weight: "bold" }));
        svg.appendChild(CBV5Svg.wrapText(svg, { x: x + 12, y: y + 54, text: v, maxWidth: 216, size: 12, color: CBV5_THEME.sub }));
        return CBV5Svg.el("g", {});
    },
    bullets(svg, x, y, arr, w = 480) {
        svg.appendChild(CBV5Svg.rect(x, y - 20, w, 160, 12, "v5-box-strong"));
        arr.forEach((s, i) => svg.appendChild(CBV5Svg.text(x + 12, y + 10 + i * 24, "• " + s, { size: 13 })));
        return CBV5Svg.el("g", {});
    }
};

/* ----------------------------- 全域 Context ----------------------------- */
const CBVV5 = {
    ctx: {
        apiBase: CBV5_API_BASE,
        storeKey: CBV5_STORE_KEY,
        tplKey: CBV5_TPL_KEY,
    }
};

/* ----------------------------- 對外渲染 ----------------------------- */
class CommerceBlueprintV5 {
    static render(containerId) {
        const root = document.getElementById(containerId); if (!root) return;
        root.innerHTML = CBV5UI.style() + `<div class="v5-wrap"></div>`;
        const wrap = root.querySelector(".v5-wrap");

        // ★ 分頁：移除「V4｜樂高精華」，其他保留；模組佈局放最後
        const tabs = [
            { name: "總覽（V1~V4 統整）", render: () => CBV5Pages.p01_Overview() },
            // { name: "V4｜樂高精華", render: () => CBV5Pages.p05_V4() }, // ← 移除
            { name: "流量→轉化（綜觀）", render: () => CBV5Pages.p06_TrafficConv() },
            { name: "資料流 × 依賴圖", render: () => CBV5Pages.p07_DataDeps() },
            { name: "模組依存關係（順序）", render: () => CBV5Pages.p08_ModuleOrder() },
            { name: "支付×託管×物流", render: () => CBV5Pages.p09_PayEscrowLogi() },
            { name: "營運 KPI 看板", render: () => CBV5Pages.p10_KPI() },
            { name: "三階段路線圖", render: () => CBV5Pages.p11_Roadmap() },
            { name: "居希恩營業項目", render: () => CBV5Pages.p12_BizItems() },
            { name: "教育 × 教會 串接", render: () => CBV5Pages.p13_EduChurch() },
            { name: "社群治理 × 時間銀行", render: () => CBV5Pages.p14_GovernTime() },
            { name: "模組佈局（可編輯）", render: () => CBV5ModuleEditor.render() }, // ← 放最後
        ];

        CBV5Layout.tabs(wrap, tabs);
    }
}

// 對外輸出
window.CommerceBlueprintV5 = CommerceBlueprintV5;
