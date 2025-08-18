// ==============================
// CommerceBlueprint.js  (Aug 2025 Extended, interactive)
// 功能：用 JS 生成八張規劃圖（前三張原有 + 五張新圖）+ TODO 清單
// 規則：Class + static；所有 HTML 以 JS 產出；SVG 清晰字大留白足
// 互動：所有方塊 hover 放大＋陰影＋漸層（JS 套用）；僅 Seller Center（後台）可點擊跳轉
// ==============================

class SvgKit {
    static el(tag, attrs = {}, children = []) {
        const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
        Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v)));
        children.forEach(c => e.appendChild(c));
        return e;
    }
    static text(x, y, str, anchor = "start", size = 14, weight = "normal", color = "#111827") {
        const t = this.el("text", {
            x, y, "text-anchor": anchor, "font-size": size,
            "font-weight": weight, "font-family": "Inter, Arial, 'Noto Sans TC', sans-serif",
            fill: color
        });
        t.textContent = str;
        return t;
    }
    static rect(x, y, w, h, r = 12, cls = "bp-box") {
        return this.el("rect", { x, y, width: w, height: h, rx: r, ry: r, class: cls });
    }
    static arrow(x1, y1, x2, y2, cls = "bp-arrow") {
        const g = this.el("g");
        const line = this.el("line", { x1, y1, x2, y2, class: cls });
        const ang = Math.atan2(y2 - y1, x2 - x1);
        const ax = x2 - 12 * Math.cos(ang), ay = y2 - 12 * Math.sin(ang);
        const a1 = this.el("line", { x1: x2, y1: y2, x2: ax - 5 * Math.sin(ang), y2: ay + 5 * Math.cos(ang), class: cls });
        const a2 = this.el("line", { x1: x2, y1: y2, x2: ax + 5 * Math.sin(ang), y2: ay - 5 * Math.cos(ang), class: cls });
        g.appendChild(line); g.appendChild(a1); g.appendChild(a2);
        return g;
    }
    static curveArrow(x1, y1, x2, y2, bend = 0.35, cls = "bp-arrow") {
        const g = this.el("g");
        const cx = x1 + (x2 - x1) * bend;
        const cy = y1 + (y2 - y1) * bend - 40;
        const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
        const path = this.el("path", { d, class: cls, fill: "none" });
        g.appendChild(path);
        const ang = Math.atan2(y2 - cy, x2 - cx);
        const ax = x2 - 12 * Math.cos(ang), ay = y2 - 12 * Math.sin(ang);
        const a1 = this.el("line", { x1: x2, y1: y2, x2: ax - 5 * Math.sin(ang), y2: ay + 5 * Math.cos(ang), class: cls });
        const a2 = this.el("line", { x1: x2, y1: y2, x2: ax + 5 * Math.sin(ang), y2: ay - 5 * Math.cos(ang), class: cls });
        g.appendChild(a1); g.appendChild(a2);
        return g;
    }
}

class GridLayout {
    constructor(cellW = 260, cellH = 120, gapX = 28, gapY = 24, offsetX = 24, offsetY = 24) {
        this.cellW = cellW; this.cellH = cellH; this.gapX = gapX; this.gapY = gapY;
        this.offsetX = offsetX; this.offsetY = offsetY;
    }
    pos(c, r) {
        return {
            x: this.offsetX + c * (this.cellW + this.gapX),
            y: this.offsetY + r * (this.cellH + this.gapY),
            w: this.cellW,
            h: this.cellH
        };
    }
}

class CommerceBlueprint {
    // ================= public =================
    static render(containerId) {
        const root = document.getElementById(containerId);
        if (!root) return;

        root.innerHTML = `
<style>
  .bp-card { border:1px solid #e5e7eb; border-radius:16px; padding:16px; box-shadow:0 4px 14px rgba(0,0,0,0.06); margin-bottom:22px; background:#fff; }
  .bp-title { font-weight:800; font-size:18px; margin-bottom:10px; letter-spacing:.2px; }
  .bp-subtle { color:#6b7280; font-size:13px; }
  svg { width:100%; height:auto; }
  svg text { pointer-events: none; user-select: none; }
  .bp-arrow { stroke:#111827; stroke-width:1.8; pointer-events:none; }
  .bp-box { fill:#ffffff; stroke:#94a3b8; stroke-width:1.6; }
  .bp-box-strong { fill:#f8fafc; stroke:#475569; stroke-width:1.8; }
  .bp-lane { fill:#f9fafb; stroke:#e5e7eb; }
  .bp-pill { display:inline-block; padding:4px 8px; background:#eef2ff; color:#3730a3; border-radius:999px; font-size:12px; margin-right:6px; }
  .bp-todo li{ margin:6px 0; }
  .bp-caption{ fill:#64748b; font-size:12px; }

  /* hover 動畫（漸層由 JS 設定 fill 屬性，避免多 SVG id 衝突） */
  .bp-box, .bp-box-strong{
    transition: transform .18s cubic-bezier(.2,.8,.2,1), filter .18s;
    transform-box: fill-box;
    transform-origin: center;
  }
  .bp-box:hover, .bp-box-strong:hover{
    transform: scale(1.04);
    filter: drop-shadow(0 10px 24px rgba(0,0,0,.18));
  }
  .bp-click{ cursor:pointer; }

  @media (prefers-reduced-motion: reduce){
    .bp-box, .bp-box-strong{ transition:none; }
  }
</style>
    `;

        // 三張原有
        root.appendChild(this._card("高階系統藍圖（MVP 範圍）", this._diagramSystem()));
        root.appendChild(this._card("MVP 交易流程泳道圖（下單→託管→放款/退款）", this._diagramSwimlane()));
        root.appendChild(this._card("後台模組路線圖（漸進式）", this._diagramBackoffice()));

        // 五張新圖
        root.appendChild(this._card("平台使命圖（Platform Vision Map）", this._diagramVision()));
        root.appendChild(this._card("三階段發展路線（Development Roadmap）", this._diagramRoadmap()));
        root.appendChild(this._card("流量→變現優先序（Traffic → Monetization）", this._diagramTrafficPriority()));
        root.appendChild(this._card("功能演進時間軸（Feature Evolution）", this._diagramFeatureEvolution()));
        root.appendChild(this._card("AI 助力生態（AI Empowered Ecosystem）", this._diagramAIEcosystem()));

        root.appendChild(this._card("MVP 待辦清單（TODO）", this._todoList()));
    }

    // ================ helpers ================
    // 為每張 SVG 注入「唯一」漸層 id，並回傳 id
    static _injectGradient(svg) {
        if (svg.dataset.gradId) return svg.dataset.gradId;
        const id = 'bpGrad-' + Math.random().toString(36).slice(2, 8);
        const defs = SvgKit.el('defs', {});
        const lg = SvgKit.el('linearGradient', { id, x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
        lg.appendChild(SvgKit.el('stop', { offset: '0%', 'stop-color': '#6366f1' }));
        lg.appendChild(SvgKit.el('stop', { offset: '50%', 'stop-color': '#22d3ee' }));
        lg.appendChild(SvgKit.el('stop', { offset: '100%', 'stop-color': '#f472b6' }));
        defs.appendChild(lg);
        svg.appendChild(defs);
        svg.dataset.gradId = id;
        return id;
    }

    // 對單一方塊加上 hover 漸層與動畫（用屬性，效力高於 CSS）
    static _enableBoxHover(svg, rect) {
        const gid = this._injectGradient(svg);
        rect.style.pointerEvents = 'all';
        rect.addEventListener('mouseenter', () => {
            rect.style.transform = 'scale(1.04)';
            rect.style.filter = 'drop-shadow(0 10px 24px rgba(0,0,0,.18))';
            rect.setAttribute('data-oldfill', rect.getAttribute('fill') || '');
            rect.setAttribute('fill', `url(#${gid})`);
            rect.setAttribute('stroke-opacity', '0');
        });
        rect.addEventListener('mouseleave', () => {
            rect.style.transform = '';
            rect.style.filter = '';
            const old = rect.getAttribute('data-oldfill');
            if (old) rect.setAttribute('fill', old); else rect.removeAttribute('fill');
            rect.removeAttribute('stroke-opacity');
        });
    }

    // 套用到該 SVG 內所有 box
    static _decorateAllBoxes(svg) {
        svg.querySelectorAll('rect.bp-box, rect.bp-box-strong')
            .forEach(r => this._enableBoxHover(svg, r));
    }

    // 卡片容器
    static _card(title, contentNode) {
        const div = document.createElement("div");
        div.className = "bp-card";
        const h = document.createElement("div");
        h.className = "bp-title";
        h.textContent = title;
        div.appendChild(h);
        div.appendChild(contentNode);
        return div;
    }

    // ================ 圖 1：高階系統藍圖 ================
    static _diagramSystem() {
        const svg = SvgKit.el("svg", { viewBox: "0 0 1200 520" });
        this._injectGradient(svg);

        const grid = new GridLayout(280, 110, 24, 18, 20, 50);

        svg.appendChild(SvgKit.text(100, 30, "Frontend（Customer）", "start", 14, "bold"));
        svg.appendChild(SvgKit.text(480, 30, "Services（Domain）", "start", 14, "bold"));
        svg.appendChild(SvgKit.text(880, 30, "Data（EF Core）", "start", 14, "bold"));
        svg.appendChild(SvgKit.text(20, 495, "Integrations", "start", 14, "bold"));

        const f1 = grid.pos(0, 0), f2 = grid.pos(0, 1), f3 = grid.pos(0, 2);
        svg.appendChild(SvgKit.rect(f1.x, f1.y, f1.w, f1.h, 12, "bp-box-strong"));
        svg.appendChild(SvgKit.text(f1.x + 12, f1.y + 26, "Store / Product Detail / Cart / Orders", "start", 14, "bold"));
        svg.appendChild(SvgKit.text(f1.x + 12, f1.y + 52, "• 加入購物車、結帳（Coins）", "start", 13));
        svg.appendChild(SvgKit.text(f1.x + 12, f1.y + 72, "• 訂單查詢、確認收貨", "start", 13));

        // ★ 可點擊：Seller Center（後台）
        const f2Rect = SvgKit.rect(f2.x, f2.y, f2.w, f2.h, 12, "bp-box bp-click");
        f2Rect.setAttribute("id", "bp-seller-center");
        f2Rect.setAttribute("tabindex", "0"); // 鍵盤可用
        svg.appendChild(f2Rect);
        f2Rect.addEventListener("click", () => {
            const ok = confirm("前往 Seller Center（後台）→「商品上架」頁面？");
            if (ok) location.href = "https://localhost:7021/Customer/Seller/ProductCreate";
        });
        f2Rect.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); f2Rect.click(); }
        });
        svg.appendChild(SvgKit.text(f2.x + 12, f2.y + 26, "Seller Center（後台）", "start", 14, "bold"));
        svg.appendChild(SvgKit.text(f2.x + 12, f2.y + 52, "商品上架、庫存、出貨", "start", 13));
        svg.appendChild(SvgKit.text(f2.x + 12, f2.y + 72, "（MVP：基本 CRUD）", "start", 13));

        svg.appendChild(SvgKit.rect(f3.x, f3.y, f3.w, f3.h, 12));
        svg.appendChild(SvgKit.text(f3.x + 12, f3.y + 26, "Admin（平台）", "start", 14, "bold"));
        svg.appendChild(SvgKit.text(f3.x + 12, f3.y + 52, "抽成、退款審核、仲裁", "start", 13));
        svg.appendChild(SvgKit.text(f3.x + 12, f3.y + 72, "（MVP：退款審核）", "start", 13));

        const s1 = grid.pos(1, 0), s2 = grid.pos(1, 1), s3 = grid.pos(1, 2);
        svg.appendChild(SvgKit.rect(s1.x, s1.y, s1.w, s1.h, 12, "bp-box-strong"));
        svg.appendChild(SvgKit.text(s1.x + 12, s1.y + 26, "CheckoutService", "start", 14, "bold"));
        svg.appendChild(SvgKit.text(s1.x + 12, s1.y + 52, "拆單 / 建單 / 減庫存 / 清空購物車", "start", 13));

        svg.appendChild(SvgKit.rect(s2.x, s2.y, s2.w, s2.h, 12, "bp-box-strong"));
        svg.appendChild(SvgKit.text(s2.x + 12, s2.y + 26, "CoinPaymentService", "start", 14, "bold"));
        svg.appendChild(SvgKit.text(s2.x + 12, s2.y + 52, "餘額檢查 / 扣款 / 入帳（Ledger）", "start", 13));

        svg.appendChild(SvgKit.rect(s3.x, s3.y, s3.w, s3.h, 12, "bp-box-strong"));
        svg.appendChild(SvgKit.text(s3.x + 12, s3.y + 26, "EscrowService", "start", 14, "bold"));
        svg.appendChild(SvgKit.text(s3.x + 12, s3.y + 52, "Hold / Release / Refund（託管）", "start", 13));

        const d1 = grid.pos(2, 0), d2 = grid.pos(2, 1), d3 = grid.pos(2, 2);
        svg.appendChild(SvgKit.rect(d1.x, d1.y, d1.w, d1.h, 12));
        svg.appendChild(SvgKit.text(d1.x + 12, d1.y + 26, "Product / Seller / CartItem", "start", 14, "bold"));
        svg.appendChild(SvgKit.text(d1.x + 12, d1.y + 52, "核心商品與購物車", "start", 13));

        svg.appendChild(SvgKit.rect(d2.x, d2.y, d2.w, d2.h, 12));
        svg.appendChild(SvgKit.text(d2.x + 12, d2.y + 26, "Order / OrderItem", "start", 14, "bold"));
        svg.appendChild(SvgKit.text(d2.x + 12, d2.y + 52, "一賣家一張單（拆單）", "start", 13));

        svg.appendChild(SvgKit.rect(d3.x, d3.y, d3.w, d3.h, 12));
        svg.appendChild(SvgKit.text(d3.x + 12, d3.y + 26, "Escrow / CoinLedger", "start", 14, "bold"));
        svg.appendChild(SvgKit.text(d3.x + 12, d3.y + 52, "託管與幣別總帳", "start", 13));

        const centers = (b) => ({ cx: b.x + b.w / 2, cy: b.y + b.h / 2 });
        const cF1 = centers(f1), cS1 = centers(s1), cS2 = centers(s2), cS3 = centers(s3),
            cD1 = centers(d1), cD2 = centers(d2), cD3 = centers(d3);

        svg.appendChild(SvgKit.curveArrow(cF1.cx + 120, cF1.cy, cS1.cx - 120, cS1.cy));
        svg.appendChild(SvgKit.curveArrow(cS1.cx, cS1.cy, cD2.cx, cD2.cy));
        svg.appendChild(SvgKit.curveArrow(cS1.cx, cS1.cy + 22, cD1.cx, cD1.cy));
        svg.appendChild(SvgKit.curveArrow(cS2.cx + 20, cS2.cy, cD3.cx, cD3.cy));
        svg.appendChild(SvgKit.curveArrow(cS3.cx, cS3.cy, cD3.cx, cD3.cy));

        this._decorateAllBoxes(svg);
        return svg;
    }

    // ================ 圖 2：流程泳道 ================
    static _diagramSwimlane() {
        const svg = SvgKit.el("svg", { viewBox: "0 0 1200 460" });
        this._injectGradient(svg);

        const lanes = [
            { y: 40, name: "Buyer" },
            { y: 160, name: "Seller" },
            { y: 280, name: "Services" },
            { y: 400, name: "Wallet" }
        ];
        lanes.forEach(l => {
            svg.appendChild(SvgKit.el("rect", { x: 10, y: l.y - 30, width: 1180, height: 90, class: "bp-lane", rx: 14, ry: 14 }));
            svg.appendChild(SvgKit.text(20, l.y - 10, l.name, "start", 13, "bold"));
        });

        const box = (x, y, label) => {
            svg.appendChild(SvgKit.el("rect", { x, y, width: 200, height: 40, rx: 12, ry: 12, class: "bp-box" }));
            svg.appendChild(SvgKit.text(x + 100, y + 26, label, "middle", 13, "bold"));
            return { cx: x + 200, cy: y + 20 };
        };

        const b1 = box(40, 40, "加入購物車 / 下單");
        const b2 = box(260, 40, "支付 Coins");
        const b3 = box(480, 40, "等待出貨");
        const b4 = box(700, 40, "確認收貨");

        const s1 = box(260, 160, "賣家出貨");
        const s2 = box(700, 160, "款項入帳");

        const sv1 = box(260, 280, "Checkout：建單/拆單");
        const sv2 = box(480, 280, "Escrow：Hold");
        const sv3 = box(700, 280, "Escrow：Release/Refund");
        const sv4 = box(920, 280, "Admin：退款審核（可選）");

        const w1 = box(480, 400, "CoinPayment：扣款+Ledger");
        const w2 = box(920, 400, "CoinPayment：放款/退款+Fee");

        svg.appendChild(SvgKit.curveArrow(b1.cx, b1.cy + 22, sv1.cx - 160, sv1.cy + 22));
        svg.appendChild(SvgKit.curveArrow(sv1.cx, sv1.cy + 20, sv2.cx - 180, sv2.cy + 20));
        svg.appendChild(SvgKit.curveArrow(b2.cx, b2.cy + 22, w1.cx - 180, w1.cy + 22));
        svg.appendChild(SvgKit.curveArrow(w1.cx, w1.cy + 20, sv2.cx - 10, sv2.cy + 20));
        svg.appendChild(SvgKit.curveArrow(b3.cx, b3.cy + 22, s1.cx - 180, s1.cy + 22));
        svg.appendChild(SvgKit.curveArrow(b4.cx, b4.cy + 22, sv3.cx - 180, sv3.cy + 22));
        svg.appendChild(SvgKit.curveArrow(sv3.cx, sv3.cy + 20, w2.cx - 180, w2.cy + 20));
        svg.appendChild(SvgKit.curveArrow(sv3.cx + 20, sv3.cy, s2.cx - 20, s2.cy));
        svg.appendChild(SvgKit.curveArrow(sv3.cx + 20, sv3.cy + 28, sv4.cx - 180, sv4.cy + 28));

        this._decorateAllBoxes(svg);
        return svg;
    }

    // ================ 圖 3：後台路線圖 ================
    static _diagramBackoffice() {
        const svg = SvgKit.el("svg", { viewBox: "0 0 1200 400" });
        this._injectGradient(svg);

        const grid = new GridLayout(260, 90, 22, 16, 20, 40);

        const lane = SvgKit.el("rect", { x: 14, y: 10, width: 1170, height: 340, class: "bp-lane", rx: 16, ry: 16 });
        svg.appendChild(lane);
        svg.appendChild(SvgKit.text(28, 32, "Backoffice Roadmap（先 MVP → 再高階）", "start", 13, "bold"));

        const m1 = grid.pos(0, 0), m2 = grid.pos(1, 0), m3 = grid.pos(2, 0), m4 = grid.pos(3, 0);
        svg.appendChild(SvgKit.rect(m1.x, m1.y, m1.w, m1.h, 12, "bp-box-strong"));
        svg.appendChild(SvgKit.text(m1.x + 12, m1.y + 28, "Seller CRUD", "start", 14, "bold"));
        svg.appendChild(SvgKit.text(m1.x + 12, m1.y + 54, "店鋪、上架、庫存", "start", 13));

        svg.appendChild(SvgKit.rect(m2.x, m2.y, m2.w, m2.h, 12, "bp-box-strong"));
        svg.appendChild(SvgKit.text(m2.x + 12, m2.y + 28, "Order 管理", "start", 14, "bold"));
        svg.appendChild(SvgKit.text(m2.x + 12, m2.y + 54, "出貨/收貨/退款審核", "start", 13));

        svg.appendChild(SvgKit.rect(m3.x, m3.y, m3.w, m3.h, 12, "bp-box-strong"));
        svg.appendChild(SvgKit.text(m3.x + 12, m3.y + 28, "Escrow 面板", "start", 14, "bold"));
        svg.appendChild(SvgKit.text(m3.x + 12, m3.y + 54, "Hold/Release/Refund", "start", 13));

        svg.appendChild(SvgKit.rect(m4.x, m4.y, m4.w, m4.h, 12, "bp-box-strong"));
        svg.appendChild(SvgKit.text(m4.x + 12, m4.y + 28, "Ledger 總帳", "start", 14, "bold"));
        svg.appendChild(SvgKit.text(m4.x + 12, m4.y + 54, "平台抽成/對帳", "start", 13));

        const a = [
            [0, 1, "優惠券/滿額免運", "平台券 / 店鋪券"],
            [1, 1, "直播/社交互動", "Seller Live / DM"],
            [2, 1, "議價/議單中心", "買賣雙方議價流"],
            [3, 1, "物流 API 串接", "新竹 / 黑貓 / 7-11"],
            [0, 2, "評價與申訴", "品質控管 / 仲裁"],
            [1, 2, "動態風控", "異常單偵測 / 凍結"],
            [2, 2, "稅務發票", "B2C/B2B / 電子發票"],
            [3, 2, "多幣別匯率", "跨境（可選）"],
        ];
        a.forEach(([c, r, t, s]) => {
            const p = grid.pos(c, r);
            svg.appendChild(SvgKit.rect(p.x, p.y, p.w, p.h, 12));
            svg.appendChild(SvgKit.text(p.x + 12, p.y + 28, t, "start", 14, "bold"));
            svg.appendChild(SvgKit.text(p.x + 12, p.y + 54, s, "start", 13));
        });

        this._decorateAllBoxes(svg);
        return svg;
    }

    // ================ 圖 4：平台使命圖 ================
    static _diagramVision() {
        const svg = SvgKit.el("svg", { viewBox: "0 0 1200 520" });
        this._injectGradient(svg);

        svg.appendChild(SvgKit.rect(450, 200, 300, 120, 20, "bp-box-strong"));
        svg.appendChild(SvgKit.text(600, 240, "去中心化交易平台", "middle", 18, "bold"));
        svg.appendChild(SvgKit.text(600, 268, "教育 × 訓練 × 趣味 × 幣系統", "middle", 13, "normal", "#64748b"));

        const sat = [
            { x: 150, y: 80, w: 260, h: 90, t1: "跨地域 / 跨文化 / 跨星球", t2: "地球村 → 宇宙村" },
            { x: 790, y: 80, w: 260, h: 90, t1: "AI 共同創作與導購", t2: "人才天賦舞台" },
            { x: 150, y: 350, w: 260, h: 90, t1: "賣家第一桶金", t2: "從零開始的商業旅程" },
            { x: 790, y: 350, w: 260, h: 90, t1: "多媒體即時購物", t2: "直播 / 短影音 / 3D" },
        ];
        sat.forEach(s => {
            svg.appendChild(SvgKit.rect(s.x, s.y, s.w, s.h, 16));
            svg.appendChild(SvgKit.text(s.x + s.w / 2, s.y + 36, s.t1, "middle", 14, "bold"));
            svg.appendChild(SvgKit.text(s.x + s.w / 2, s.y + 62, s.t2, "middle", 13));
        });

        svg.appendChild(SvgKit.curveArrow(410, 150, 450, 240, 0.45));
        svg.appendChild(SvgKit.curveArrow(900, 150, 750, 240, 0.45));
        svg.appendChild(SvgKit.curveArrow(410, 410, 450, 280, 0.45));
        svg.appendChild(SvgKit.curveArrow(900, 410, 750, 280, 0.45));

        svg.appendChild(SvgKit.text(600, 500, "願景：讓任何物種、任何地點，都能被看見並完成交易", "middle", 13, "normal", "#64748b"));

        this._decorateAllBoxes(svg);
        return svg;
    }

    // ================ 圖 5：三階段發展路線 ================
    static _diagramRoadmap() {
        const svg = SvgKit.el("svg", { viewBox: "0 0 1200 420" });
        this._injectGradient(svg);

        const grid = new GridLayout(340, 140, 30, 16, 24, 40);

        const p1 = grid.pos(0, 0), p2 = grid.pos(1, 0), p3 = grid.pos(2, 0);
        svg.appendChild(SvgKit.rect(p1.x, p1.y, p1.w, p1.h, 16, "bp-box-strong"));
        svg.appendChild(SvgKit.text(p1.x + 16, p1.y + 32, "Stage 1：MVP（存活期）", "start", 15, "bold"));
        svg.appendChild(SvgKit.text(p1.x + 16, p1.y + 58, "上架 / 車 / 幣支付 / Escrow", "start", 13));
        svg.appendChild(SvgKit.text(p1.x + 16, p1.y + 78, "AI 入門導師、社交裂變、首購返幣", "start", 13));

        svg.appendChild(SvgKit.rect(p2.x, p2.y, p2.w, p2.h, 16, "bp-box-strong"));
        svg.appendChild(SvgKit.text(p2.x + 16, p2.y + 32, "Stage 2：成長期（跨國）", "start", 15, "bold"));
        svg.appendChild(SvgKit.text(p2.x + 16, p2.y + 58, "直播即時購物（多語翻譯）", "start", 13));
        svg.appendChild(SvgKit.text(p2.x + 16, p2.y + 78, "教育培訓、短影音、跨境物流支付", "start", 13));

        svg.appendChild(SvgKit.rect(p3.x, p3.y, p3.w, p3.h, 16, "bp-box-strong"));
        svg.appendChild(SvgKit.text(p3.x + 16, p3.y + 32, "Stage 3：宇宙村（元宇宙）", "start", 15, "bold"));
        svg.appendChild(SvgKit.text(p3.x + 16, p3.y + 58, "Unity 3D 商場 / VR / AR", "start", 13));
        svg.appendChild(SvgKit.text(p3.x + 16, p3.y + 78, "AI 分身、Web3 去中心化交易", "start", 13));

        const c1 = { x: p1.x + p1.w, y: p1.y + p1.h / 2 };
        const c2 = { x: p2.x, y: p2.y + p2.h / 2 };
        const c3 = { x: p2.x + p2.w, y: p2.y + p2.h / 2 };
        const c4 = { x: p3.x, y: p3.y + p3.h / 2 };
        svg.appendChild(SvgKit.curveArrow(c1.x, c1.y, c2.x, c2.y, 0.5));
        svg.appendChild(SvgKit.curveArrow(c3.x, c3.y, c4.x, c4.y, 0.5));

        svg.appendChild(SvgKit.text(24, 360, "原則：先幫賣家賺到第一桶金 → 再國際化擴張 → 最後宇宙化", "start", 13, "normal", "#64748b"));

        this._decorateAllBoxes(svg);
        return svg;
    }

    // ================ 圖 6：流量→變現優先序 ================
    static _diagramTrafficPriority() {
        const svg = SvgKit.el("svg", { viewBox: "0 0 1200 480" });
        this._injectGradient(svg);

        const left = { x: 48, y: 56, w: 480, h: 360 };
        svg.appendChild(SvgKit.rect(left.x, left.y, left.w, left.h, 16));
        svg.appendChild(SvgKit.text(left.x + 16, left.y + 30, "引流層（Attention）", "start", 15, "bold"));
        ["① 短影音 / 短劇（第一優先）", "② 社交裂變（好友/群組分享）", "③ 內容沉澱（測評 / 攻略）"]
            .forEach((t, i) => svg.appendChild(SvgKit.text(left.x + 24, left.y + 68 + i * 28, "• " + t, "start", 13)));

        const right = { x: 672, y: 56, w: 480, h: 360 };
        svg.appendChild(SvgKit.rect(right.x, right.y, right.w, right.h, 16));
        svg.appendChild(SvgKit.text(right.x + 16, right.y + 30, "轉化層（Conversion & Monetization）", "start", 15, "bold"));
        ["A. 直播秒購（商品卡免跳轉）", "B. 幣支付 / 託管（安全）", "C. AI 導購（即答價格/評價/比較）", "D. 返幣 / 拍賣 / 會員成長"]
            .forEach((t, i) => svg.appendChild(SvgKit.text(right.x + 24, right.y + 68 + i * 28, "• " + t, "start", 13)));

        svg.appendChild(SvgKit.curveArrow(left.x + left.w, left.y + left.h / 2, right.x, right.y + right.h / 2, 0.5));
        svg.appendChild(SvgKit.text(600, 440, "策略：先爆量引流 → 社交放大 → 內容養信任 → 購物閉環變現", "middle", 13, "normal", "#64748b"));

        this._decorateAllBoxes(svg);
        return svg;
    }

    // ================ 圖 7：功能演進時間軸 ================
    static _diagramFeatureEvolution() {
        const svg = SvgKit.el("svg", { viewBox: "0 0 1200 420" });
        this._injectGradient(svg);

        svg.appendChild(SvgKit.el("line", { x1: 80, y1: 280, x2: 1120, y2: 280, stroke: "#94a3b8", "stroke-width": 2 }));

        const milestones = [
            { x: 120, t: "MVP 交易", s: ["上架/車/結帳", "Coins / Escrow"], level: 1 },
            { x: 360, t: "直播購物", s: ["多語翻譯", "直播商品卡"], level: 2 },
            { x: 600, t: "短影音/短劇", s: ["即看即買", "社交裂變"], level: 2 },
            { x: 840, t: "AI 市場", s: ["AI 導購", "動態定價"], level: 3 },
            { x: 1080, t: "元宇宙商場", s: ["Unity 3D/VR/AR", "AI 分身/Web3"], level: 4 },
        ];

        milestones.forEach(m => {
            const y = 280 - m.level * 40;
            svg.appendChild(SvgKit.el("circle", { cx: m.x, cy: y, r: 10, fill: "#111827" }));
            svg.appendChild(SvgKit.el("line", { x1: m.x, y1: y, x2: m.x, y2: 280, stroke: "#111827", "stroke-width": 2 }));
            svg.appendChild(SvgKit.rect(m.x - 110, y - 96, 220, 70, 12));
            svg.appendChild(SvgKit.text(m.x, y - 70, m.t, "middle", 14, "bold"));
            m.s.forEach((txt, i) => svg.appendChild(SvgKit.text(m.x, y - 46 + i * 20, txt, "middle", 13)));
        });

        svg.appendChild(SvgKit.text(80, 320, "時間 →", "start", 13, "bold"));
        svg.appendChild(SvgKit.text(600, 380, "原則：演進而非重做；每一階段都可獨立 Demo / 變現", "middle", 13, "normal", "#64748b"));

        this._decorateAllBoxes(svg);
        return svg;
    }

    // ================ 圖 8：AI 助力生態 ================
    static _diagramAIEcosystem() {
        const svg = SvgKit.el("svg", { viewBox: "0 0 1200 480" });
        this._injectGradient(svg);

        svg.appendChild(SvgKit.el("circle", { cx: 600, cy: 240, r: 70, fill: "#111827" }));
        svg.appendChild(SvgKit.text(600, 244, "AI Core", "middle", 16, "bold", "#ffffff"));
        svg.appendChild(SvgKit.text(600, 266, "導購 / 流量 / 定價", "middle", 12, "normal", "#e5e7eb"));

        const nodes = [
            { x: 300, y: 100, w: 220, h: 70, t1: "上架助手", t2: "標題/圖說/規格建議" },
            { x: 780, y: 100, w: 220, h: 70, t1: "行銷文案", t2: "多語/多平台素材" },
            { x: 300, y: 310, w: 220, h: 70, t1: "跨語客服", t2: "即時問答/售後" },
            { x: 780, y: 310, w: 220, h: 70, t1: "價格/庫存策略", t2: "動態定價/促銷建議" },
        ];
        nodes.forEach(n => {
            svg.appendChild(SvgKit.rect(n.x, n.y, n.w, n.h, 14));
            svg.appendChild(SvgKit.text(n.x + n.w / 2, n.y + 30, n.t1, "middle", 14, "bold"));
            svg.appendChild(SvgKit.text(n.x + n.w / 2, n.y + 52, n.t2, "middle", 12, "normal", "#64748b"));
            const tx = n.x + n.w / 2, ty = n.y + n.h / 2;
            svg.appendChild(SvgKit.curveArrow(tx, ty, 600 - (tx - 600) * 0.1, 240 - (ty - 240) * 0.1, 0.55));
        });

        svg.appendChild(SvgKit.text(600, 450, "AI 與人協作：讓新手也能迅速成為專業賣家", "middle", 13, "normal", "#64748b"));

        this._decorateAllBoxes(svg);
        return svg;
    }

    // ================ TODO 清單 ================
    static _todoList() {
        const wrap = document.createElement("div");
        wrap.innerHTML = `
      <div class="bp-subtle mb-2">先上 MVP，再逐步打開高階功能。所有複雜處先留 TODO，避免卡關。</div>
      <div class="mb-2">
        <span class="bp-pill">✅ 必要</span>
        <span class="bp-pill">⏭️ 下一步</span>
        <span class="bp-pill">🧊 TODO（之後）</span>
      </div>
      <ol class="bp-todo">
        <li>✅ 前台：Store / Product Detail / Cart / Orders（可先用你現有樣式）</li>
        <li>✅ Services：CheckoutService / CoinPaymentService / EscrowService（三支已給骨架）</li>
        <li>✅ Data：Product / Seller / CartItem / Order / OrderItem / Escrow / CoinLedger</li>
        <li>✅ 支付：Coins 扣款 → Ledger 記帳 → Escrow Hold</li>
        <li>⏭️ Seller 後台：上架、庫存、標價（MVP 只做必要欄位）</li>
        <li>🧊 優惠券（平台券 / 店鋪券）、滿額免運</li>
        <li>🧊 直播、議價中心、私訊溝通強化</li>
        <li>🧊 物流 API 串接（先用「自填單號」）</li>
        <li>🧊 風控（異常單 / 交易限額 / 黑名單）</li>
      </ol>
    `;
        return wrap;
    }
}

// 讓外部可呼叫
window.CommerceBlueprint = CommerceBlueprint;
