// ======================================================
// CommerceBlueprint.v2.js — AI 中心化・分頁版藍圖 (v2.4, V3-style)
// 特色：
// - 主題色票/字級/留白 常數化（與 V3 對齊）
// - 真實量測換行 wrapText（長文不溢出）
// - curveArrow2（可調拱度 lift，避免線條重疊）
// - 泳道漸層 + 投影，對比更清晰
// - Seller Workbench 採卡片化模組（最小可用單元，便於漸進擴建）
// 依賴：ExportKit.js
// ======================================================

/* -------------------- 基礎與主題 -------------------- */

// --- 可自訂的連結對照表（依你的路由調整） ---
const LINKMAP_V2 = {
    "流量引擎": "/Live",
    "轉化引擎": "/Checkout",
    "供給引擎": "https://localhost:7021/Customer/Seller/ProductCreate",
    "風控與合規": "/Admin/Risk",
    "多語/跨境": "/I18n",
    "幣與結算": "/Wallet"
};



const CBV2_THEME = {
    font: "Inter, Arial, 'Noto Sans TC', sans-serif",
    ink: "#111827",
    sub: "#475569",
    note: "#64748b",
    bg: "#ffffff",
    panel: "#f8fafc",
    lane: "#f9fafb",
    border: "#e5e7eb",
    slate: "#94a3b8",
    blue: "#2563eb",
    green: "#059669",
    purple: "#7c3aed",
    kpi: "#0ea5e9"
};

class CBV2Svg {
    static el(tag, attrs = {}, children = []) {
        const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
        Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v)));
        children.forEach(c => e.appendChild(c));
        return e;
    }
    static text(x, y, str, { anchor = "start", size = 14, weight = "normal", color = CBV2_THEME.ink } = {}) {
        const t = this.el("text", {
            x, y, "text-anchor": anchor, "font-size": size, "font-weight": weight,
            "font-family": CBV2_THEME.font, fill: color
        });
        t.textContent = str; return t;
    }
    static rect(x, y, w, h, r = 14, cls = "cbv2-box") { return this.el("rect", { x, y, width: w, height: h, rx: r, ry: r, class: cls }); }
    static circle(cx, cy, r, fill = CBV2_THEME.ink) { return this.el("circle", { cx, cy, r, fill }); }
    static line(x1, y1, x2, y2, cls = "cbv2-line") { return this.el("line", { x1, y1, x2, y2, class: cls }); }

    // 可調 lift 的曲線箭頭：lift<0 往上拱；lift>0 往下拱
    static curveArrow2(x1, y1, x2, y2, { bend = 0.5, lift = -60, cls = "cbv2-arrow" } = {}) {
        const g = this.el("g");
        const cx = x1 + (x2 - x1) * bend, cy = y1 + (y2 - y1) * bend + lift;
        const p = this.el("path", { d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, class: cls, fill: "none" });
        g.appendChild(p);
        const ang = Math.atan2(y2 - cy, x2 - cx), ax = x2 - 12 * Math.cos(ang), ay = y2 - 12 * Math.sin(ang);
        g.appendChild(this.line(x2, y2, ax - 5 * Math.sin(ang), ay + 5 * Math.cos(ang), cls));
        g.appendChild(this.line(x2, y2, ax + 5 * Math.sin(ang), ay - 5 * Math.cos(ang), cls));
        return g;
    }

    static addDefs(svg) {
        const defs = this.el("defs", {});
        // 投影
        const f = this.el("filter", { id: "cbv2-ds", x: "-20%", y: "-20%", width: "140%", height: "140%" });
        f.appendChild(this.el("feDropShadow", { dx: "0", dy: "2", stdDeviation: "1.7", "flood-color": "#000", "flood-opacity": "0.12" }));
        defs.appendChild(f);
        // 泳道漸層
        const grad = (id, c1, c2) => {
            const g = this.el("linearGradient", { id, x1: "0", y1: "0", x2: "0", y2: "1" });
            g.appendChild(this.el("stop", { offset: "0%", "stop-color": c1 }));
            g.appendChild(this.el("stop", { offset: "100%", "stop-color": c2 }));
            defs.appendChild(g);
        };
        grad("laneE", "#f0f9ff", CBV2_THEME.bg);
        grad("laneF", "#ecfdf5", CBV2_THEME.bg);
        grad("laneP", "#f5f3ff", CBV2_THEME.bg);
        svg.appendChild(defs);
    }

    // 真實量測換行
    static wrapText(svg, { x, y, text, maxWidth, lineHeight = 18, size = 13, weight = "normal", color = CBV2_THEME.ink, anchor = "start", maxLines = 99 }) {
        const group = this.el("g", {});
        const base = this.text(x, y, "", { anchor, size, weight, color });
        group.appendChild(base);
        const probe = this.text(-9999, -9999, "", { anchor: "start", size, weight, color });
        probe.setAttribute("opacity", "0"); svg.appendChild(probe);

        const pushLine = (s, dy) => {
            const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            tspan.setAttribute("x", String(x));
            if (dy !== 0) tspan.setAttribute("dy", String(dy));
            tspan.textContent = s; base.appendChild(tspan);
        };

        let line = "", dy = 0, lines = 0;
        const chars = Array.from(text || "");
        for (let i = 0; i < chars.length; i++) {
            const test = line + chars[i];
            probe.textContent = test;
            const w = probe.getComputedTextLength();
            if (w <= maxWidth || line.length === 0) line = test;
            else {
                pushLine(line, dy === 0 ? 0 : lineHeight); lines++;
                if (lines >= maxLines) {
                    let tail = "";
                    for (; i < chars.length; i++) {
                        probe.textContent = tail + chars[i] + "…";
                        if (probe.getComputedTextLength() > maxWidth) break;
                        tail += chars[i];
                    }
                    pushLine(tail + "…", lineHeight); line = ""; break;
                }
                dy += lineHeight; line = chars[i];
            }
        }
        if (line) pushLine(line, dy === 0 ? 0 : lineHeight);
        svg.removeChild(probe); return group;
    }

    static downloadPng(svgEl, filename = "blueprint.png") { ExportKit.downloadPngFromSvg(svgEl, filename); }
    static downloadPdf(svgEl, filename = "blueprint.pdf") { ExportKit.downloadPdfFromSvg(svgEl, filename); }
}

/* -------------------- 版面與樣式 -------------------- */
class CBV2Layout {
    static style() {
        return `
<style>
  .cbv2-wrap{background:${CBV2_THEME.bg};border:1px solid ${CBV2_THEME.border};border-radius:16px;padding:12px 12px 6px}
  .cbv2-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
  .cbv2-tab{border:1px solid ${CBV2_THEME.border};border-radius:999px;padding:8px 14px;background:#fff;cursor:pointer}
  .cbv2-tab.active{background:${CBV2_THEME.ink};color:#fff;border-color:${CBV2_THEME.ink}}
  .cbv2-card{border:1px solid ${CBV2_THEME.border};border-radius:16px;padding:16px;box-shadow:0 6px 18px rgba(0,0,0,.06);margin-bottom:16px;background:#fff}
  .cbv2-title{font-weight:800;font-size:18px;letter-spacing:.2px;margin-bottom:12px;display:flex;gap:12px;align-items:center}
  .cbv2-actions{margin-left:auto;display:flex;gap:8px}
  svg{width:100%;height:auto}
  .cbv2-box{fill:#fff;stroke:${CBV2_THEME.slate};stroke-width:1.8;filter:url(#cbv2-ds)}
  .cbv2-box-strong{fill:${CBV2_THEME.panel};stroke:#475569;stroke-width:2;filter:url(#cbv2-ds)}
  .cbv2-lane{stroke:${CBV2_THEME.border};fill:${CBV2_THEME.lane}}
  .cbv2-arrow{stroke:${CBV2_THEME.ink};stroke-width:1.8}
  .cbv2-line{stroke:${CBV2_THEME.slate};stroke-width:1.6}
  .cbv2-kpi{fill:${CBV2_THEME.kpi};font-weight:800}
  /* 分層色（提高辨識度） */
  .cbv2-box-e{fill:#eff6ff;stroke:${CBV2_THEME.blue}}
  .cbv2-box-f{fill:#ecfdf5;stroke:${CBV2_THEME.green}}
  .cbv2-box-p{fill:#f5f3ff;stroke:${CBV2_THEME.purple}}
  .cbv2-arrow-e{stroke:${CBV2_THEME.blue}}
  .cbv2-arrow-f{stroke:${CBV2_THEME.green}}
  .cbv2-arrow-p{stroke:${CBV2_THEME.purple}}
</style>`;
    }

    static card(title, contentNode, withDownload = true) {
        const wrap = document.createElement("div");
        wrap.className = "cbv2-card";
        const head = document.createElement("div");
        head.className = "cbv2-title";
        head.innerHTML = `<div>${title}</div>`;
        if (withDownload) {
            const actions = document.createElement("div"); actions.className = "cbv2-actions";
            const b1 = document.createElement("button"); b1.className = "btn btn-sm btn-outline-secondary"; b1.textContent = "下載 PNG";
            const b2 = document.createElement("button"); b2.className = "btn btn-sm btn-dark"; b2.textContent = "下載 PDF";
            actions.appendChild(b1); actions.appendChild(b2); head.appendChild(actions);
            setTimeout(() => {
                const svg = contentNode.querySelector("svg"); if (!svg) return;
                b1.onclick = () => CBV2Svg.downloadPng(svg, (title || "v2").replace(/\s+/g, "_") + ".png");
                b2.onclick = () => CBV2Svg.downloadPdf(svg, (title || "v2").replace(/\s+/g, "_") + ".pdf");
            }, 0);
        }
        wrap.appendChild(head); wrap.appendChild(contentNode); return wrap;
    }

    static tabs(container, tabs) {
        const head = document.createElement("div"); head.className = "cbv2-tabs";
        const body = document.createElement("div"); body.className = "cbv2-body";
        container.appendChild(head); container.appendChild(body);
        const btns = [];
        const switchTo = (i) => { btns.forEach((b, j) => b.classList.toggle("active", j === i)); body.innerHTML = ""; body.appendChild(tabs[i].render()); };
        tabs.forEach((t, i) => { const b = document.createElement("button"); b.className = "cbv2-tab" + (i === 0 ? " active" : ""); b.textContent = t.name; b.onclick = () => switchTo(i); head.appendChild(b); btns.push(b); });
        switchTo(0);
    }
}

/* -------------------- 主控制器 -------------------- */
class CommerceBlueprintV2 {
    static render(containerId) {
        const root = document.getElementById(containerId); if (!root) return;
        root.innerHTML = CBV2Layout.style() + `<div class="cbv2-wrap"></div>`;
        const wrap = root.querySelector(".cbv2-wrap");
        const tabs = [
            { name: "AI 中樞總覽", render: () => CBV2Pages.p1_AICore() },
            { name: "資料流與決策引擎", render: () => CBV2Pages.p2_DataDecision() },
            { name: "流量 → 轉化策略", render: () => CBV2Pages.p3_TrafficConversion() },
            { name: "Seller AI 工作台", render: () => CBV2Pages.p4_SellerWorkbench() },
            { name: "發展路線與 KPI", render: () => CBV2Pages.p5_RoadmapKPI() },
        ];
        CBV2Layout.tabs(wrap, tabs);
    }
}

/* -------------------- 各頁（模組化） -------------------- */
class CBV2Pages {
    static get TOP_PAD() { return 46; }

    // 1) AI 中樞總覽
    // 1) AI 中樞總覽（可點版）
    static p1_AICore() {
        const wrap = document.createElement("div");
        const TOP = this.TOP_PAD;
        const svg = CBV2Svg.el("svg", { viewBox: `0 0 1200 ${520 + TOP}` });
        CBV2Svg.addDefs(svg);

        svg.appendChild(CBV2Svg.circle(600, TOP + 260, 72, CBV2_THEME.ink));
        svg.appendChild(CBV2Svg.text(600, TOP + 258, "AI Core", { anchor: "middle", size: 18, weight: "bold", color: "#fff" }));
        svg.appendChild(CBV2Svg.text(600, TOP + 280, "流量｜轉化｜供給｜風控", { anchor: "middle", size: 12, color: "#e5e7eb" }));

        const nodes = [
            { x: 260, y: TOP + 120, w: 240, h: 88, t1: "流量引擎", t2: "短劇/直播/社交/SEO" },
            { x: 700, y: TOP + 120, w: 240, h: 88, t1: "轉化引擎", t2: "商品卡/AI 導購/幣支付" },
            { x: 260, y: TOP + 332, w: 240, h: 88, t1: "供給引擎", t2: "上架助手/TinyMCE/多語" },
            { x: 700, y: TOP + 332, w: 240, h: 88, t1: "風控與合規", t2: "異常偵測/退款監測" },
        ];
        nodes.forEach(n => {
            const r = CBV2Svg.rect(n.x, n.y, n.w, n.h, 16, "cbv2-box");
            r.dataset.href = LINKMAP_V2[n.t1] || "";
            r.dataset.confirm = `要前往「${n.t1}」嗎？`;
            r.dataset.target = "_self";
            svg.appendChild(r);

            svg.appendChild(CBV2Svg.text(n.x + n.w / 2, n.y + 34, n.t1, { anchor: "middle", size: 14, weight: "bold" }));
            svg.appendChild(CBV2Svg.text(n.x + n.w / 2, n.y + 58, n.t2, { anchor: "middle", size: 12, color: CBV2_THEME.note }));
            svg.appendChild(CBV2Svg.curveArrow2(n.x + n.w / 2, n.y + n.h / 2, 600, TOP + 260, { bend: .5, lift: (n.y < TOP + 260 ? -80 : 80) }));
        });

        const caps = [
            { x: 80, y: TOP + 240, w: 180, h: 70, t1: "多語/跨境", t2: "實時翻譯/稅務對應" },
            { x: 940, y: TOP + 240, w: 180, h: 70, t1: "幣與結算", t2: "Coins/Escrow/Ledger" }
        ];
        caps.forEach(c => {
            const rc = CBV2Svg.rect(c.x, c.y, c.w, c.h, 14, "cbv2-box-strong");
            rc.dataset.href = LINKMAP_V2[c.t1] || "";
            rc.dataset.confirm = `要前往「${c.t1}」嗎？`;
            rc.dataset.target = "_self";
            svg.appendChild(rc);

            svg.appendChild(CBV2Svg.text(c.x + c.w / 2, c.y + 32, c.t1, { anchor: "middle", size: 13, weight: "bold" }));
            svg.appendChild(CBV2Svg.text(c.x + c.w / 2, c.y + 54, c.t2, { anchor: "middle", size: 12, color: CBV2_THEME.note }));
            svg.appendChild(CBV2Svg.curveArrow2(c.x + c.w / 2, c.y + c.h / 2, (c.x < 600 ? 540 : 660), c.y + 20, { lift: -60 }));
        });

        svg.appendChild(CBV2Svg.text(24, TOP + 500, "核心 KPI：7/30 日 GMV、TTF(首單時間)、直播 CTR、短影片即買率、退款率", { size: 12, color: CBV2_THEME.note }));

        wrap.appendChild(CBV2Layout.card("AI 中樞總覽", (() => { const h = document.createElement("div"); h.appendChild(svg); return h; })()));
        return wrap;
    }


    // 2) 資料流與決策引擎（分層上色 + 漸層泳道）
    static p2_DataDecision() {
        const wrap = document.createElement("div");
        const TOP = this.TOP_PAD;
        const svg = CBV2Svg.el("svg", { viewBox: `0 0 1200 ${560 + TOP}` });
        CBV2Svg.addDefs(svg);

        const LANE_W = 1160, LANE_H = 112;
        svg.appendChild(CBV2Svg.el("rect", { x: 20, y: TOP + 72, width: LANE_W, height: LANE_H, rx: 16, ry: 16, class: "cbv2-lane", fill: "url(#laneE)" }));
        svg.appendChild(CBV2Svg.text(36, TOP + 98, "⚡ 事件蒐集（Event Stream）", { size: 13, weight: "bold" }));

        svg.appendChild(CBV2Svg.el("rect", { x: 20, y: TOP + 220, width: LANE_W, height: LANE_H, rx: 16, ry: 16, class: "cbv2-lane", fill: "url(#laneF)" }));
        svg.appendChild(CBV2Svg.text(36, TOP + 246, "🧬 特徵工程（Feature Store）", { size: 13, weight: "bold" }));

        svg.appendChild(CBV2Svg.el("rect", { x: 20, y: TOP + 368, width: LANE_W, height: LANE_H, rx: 16, ry: 16, class: "cbv2-lane", fill: "url(#laneP)" }));
        svg.appendChild(CBV2Svg.text(36, TOP + 394, "🧪 決策與實驗（Policy & Experiment）", { size: 13, weight: "bold" }));

        const events = [
            { x: 60, t: "user_login" }, { x: 200, t: "view_item" }, { x: 340, t: "live_watch" },
            { x: 480, t: "add_to_cart" }, { x: 620, t: "start_checkout" }, { x: 760, t: "purchase" },
            { x: 900, t: "refund_request" }, { x: 1040, t: "inventory_change" },
        ];
        events.forEach(it => {
            const w = 130, h = 54, y = TOP + 94;
            svg.appendChild(CBV2Svg.rect(it.x, y, w, h, 12, "cbv2-box cbv2-box-e"));
            const g = CBV2Svg.wrapText(svg, { x: it.x + w / 2, y: y + 30, text: it.t, maxWidth: w - 20, lineHeight: 16, size: 12, weight: "bold", anchor: "middle", maxLines: 2 });
            svg.appendChild(g);
            svg.appendChild(CBV2Svg.curveArrow2(it.x + w / 2, y + h, it.x + w / 2, TOP + 220, { cls: "cbv2-arrow cbv2-arrow-e", lift: -40 }));
        });

        const feats = [
            { x: 120, t: "user_vec / RFM" },
            { x: 420, t: "item_vec / 價格/庫存/評分" },
            { x: 760, t: "context / 裝置/語言/時段" },
        ];
        feats.forEach(it => {
            const w = 220, h = 64, y = TOP + 242;
            svg.appendChild(CBV2Svg.rect(it.x, y, w, h, 12, "cbv2-box cbv2-box-f"));
            const g = CBV2Svg.wrapText(svg, { x: it.x + w / 2, y: y + 36, text: it.t, maxWidth: w - 24, lineHeight: 16, size: 12, weight: "bold", anchor: "middle", maxLines: 2 });
            svg.appendChild(g);
            svg.appendChild(CBV2Svg.curveArrow2(it.x + w / 2, y + h, it.x + w / 2, TOP + 368, { cls: "cbv2-arrow cbv2-arrow-f", lift: -38 }));
        });

        const pols = [
            { x: 80, t: "排序策略（首頁/列表）" },
            { x: 360, t: "定價/券/返幣策略" },
            { x: 640, t: "分流（直播/短劇/內容）" },
            { x: 920, t: "風控/補貨/客服策略" },
        ];
        pols.forEach(it => {
            const w = 240, h = 64, y = TOP + 390;
            svg.appendChild(CBV2Svg.rect(it.x, y, w, h, 12, "cbv2-box cbv2-box-p"));
            const g = CBV2Svg.wrapText(svg, { x: it.x + w / 2, y: y + 38, text: it.t, maxWidth: w - 28, lineHeight: 16, size: 13, weight: "bold", anchor: "middle" });
            svg.appendChild(g);
            svg.appendChild(CBV2Svg.curveArrow2(it.x + w / 2, y + h, it.x + w / 2, TOP + 506, { cls: "cbv2-arrow cbv2-arrow-p", lift: -36 }));
        });

        const dict = "資料字典：event_user, event_view, event_live, order, refund, inventory…（線上/離線一致）";
        svg.appendChild(CBV2Svg.wrapText(svg, { x: 24, y: TOP + 530, text: dict, maxWidth: 1150, lineHeight: 16, size: 12, color: CBV2_THEME.note }));

        wrap.appendChild(CBV2Layout.card("資料流與決策引擎", (() => { const h = document.createElement("div"); h.appendChild(svg); return h; })()));
        return wrap;
    }

    // 3) 流量 → 轉化策略
    static p3_TrafficConversion() {
        const wrap = document.createElement("div");
        const TOP = this.TOP_PAD;
        const svg = CBV2Svg.el("svg", { viewBox: `0 0 1200 ${520 + TOP}` });
        CBV2Svg.addDefs(svg);

        const left = { x: 48, y: TOP + 56, w: 480, h: 360 }, right = { x: 672, y: TOP + 56, w: 480, h: 360 };
        svg.appendChild(CBV2Svg.rect(left.x, left.y, left.w, left.h, 16, "cbv2-box"));
        svg.appendChild(CBV2Svg.text(left.x + 16, left.y + 32, "引流層（Attention）", { size: 15, weight: "bold" }));
        ["① 短劇/短影音（首要）", "② 直播預告/開播", "③ 社交裂變（群/好友）", "④ 內容沉澱（測評/攻略）"]
            .forEach((t, i) => svg.appendChild(CBV2Svg.text(left.x + 24, left.y + 72 + i * 28, "• " + t, { size: 13 })));

        svg.appendChild(CBV2Svg.rect(right.x, right.y, right.w, right.h, 16, "cbv2-box"));
        svg.appendChild(CBV2Svg.text(right.x + 16, right.y + 32, "轉化層（Conversion & Monetization）", { size: 15, weight: "bold" }));
        ["A. 直播商品卡（免跳轉）", "B. 幣支付 + Escrow", "C. AI 導購（價格/比較/規格）", "D. 返幣/券/會員成長"]
            .forEach((t, i) => svg.appendChild(CBV2Svg.text(right.x + 24, right.y + 72 + i * 28, "• " + t, { size: 13 })));

        svg.appendChild(CBV2Svg.curveArrow2(left.x + left.w, left.y + left.h / 2, right.x, right.y + right.h / 2, { lift: -80 }));

        const sX = right.x + 24, sY = right.y + 200, sW = right.w - 48;
        svg.appendChild(CBV2Svg.rect(sX, sY, sW, 120, 12, "cbv2-box-strong"));
        svg.appendChild(CBV2Svg.text(sX + 12, sY + 26, "直播商品卡 Schema（關鍵資料）", { size: 13, weight: "bold" }));
        const schema = "productId, skuId, price, promoPrice, stock, sellerId, countdown, rebateRate, couponIds[], buyUrl";
        svg.appendChild(CBV2Svg.wrapText(svg, { x: sX + 12, y: sY + 50, text: schema, maxWidth: sW - 24, lineHeight: 16, size: 12, color: CBV2_THEME.note }));

        wrap.appendChild(CBV2Layout.card("流量 → 轉化策略", (() => { const h = document.createElement("div"); h.appendChild(svg); return h; })()));
        return wrap;
    }

    // 4) Seller AI 工作台（卡片化模組，修正黑底問題）
    static p4_SellerWorkbench() {
        const wrap = document.createElement("div");
        const TOP = this.TOP_PAD;
        const svg = CBV2Svg.el("svg", { viewBox: `0 0 1200 ${540 + TOP}` });
        CBV2Svg.addDefs(svg);

        // 外層泳道（明確淡底，避免變黑）
        svg.appendChild(CBV2Svg.el("rect", { x: 20, y: TOP + 40, width: 1160, height: 440, rx: 16, ry: 16, class: "cbv2-lane" }));
        svg.appendChild(CBV2Svg.text(36, TOP + 70, "Seller AI 工作台（上架 → 內容 → 直播 → 迭代）", { size: 15, weight: "bold" }));

        const BOX_W = 240, BOX_H = 330, START_Y = TOP + 110;
        const cols = [
            { t: "上架助手", x: 60, items: ["分類建議/屬性建議", "圖像壓縮/浮水印", "定價基準/競品提醒"] },
            { t: "內容生成", x: 350, items: ["TinyMCE 模板（規格/FAQ）", "AI 產文/多語/濃縮", "影片腳本/分鏡建議"] },
            { t: "直播準備", x: 640, items: ["直播腳本/商品排序", "限時價/倒數/返幣設計", "預告素材（短片/海報）"] },
            { t: "運營迭代", x: 930, items: ["A/B 測試建議", "差評修復建議", "再行銷受眾清單"] },
        ];
        cols.forEach((c, i) => {
            svg.appendChild(CBV2Svg.rect(c.x, START_Y, BOX_W, BOX_H, 14, "cbv2-box"));
            svg.appendChild(CBV2Svg.text(c.x + BOX_W / 2, START_Y + 36, c.t, { anchor: "middle", size: 14, weight: "bold" }));
            let yy = START_Y + 68;
            c.items.forEach(line => {
                svg.appendChild(CBV2Svg.wrapText(svg, { x: c.x + 18, y: yy, text: "• " + line, maxWidth: BOX_W - 36, size: 13, lineHeight: 20, color: CBV2_THEME.ink }));
                yy += 28;
            });
            // 自欄位至泳道標題的短弧
            svg.appendChild(CBV2Svg.curveArrow2(c.x + BOX_W / 2, START_Y - 6, c.x + BOX_W / 2, TOP + 44, { lift: -30 }));
        });

        wrap.appendChild(CBV2Layout.card("Seller AI 工作台", (() => { const h = document.createElement("div"); h.appendChild(svg); return h; })()));
        return wrap;
    }

    // 5) 發展路線與 KPI
    static p5_RoadmapKPI() {
        const wrap = document.createElement("div");
        const TOP = this.TOP_PAD;
        const svg = CBV2Svg.el("svg", { viewBox: `0 0 1200 ${520 + TOP}` });
        CBV2Svg.addDefs(svg);

        const boxes = [
            { x: 48, t: "Stage 1：MVP（存活期）", s: ["上架/車/結帳（Coins+Escrow）", "直播商品卡即買", "AI 導購標準問集"], k: ["TTF↓", "7/30 GMV↑", "直播即買率↑"] },
            { x: 420, t: "Stage 2：跨國成長", s: ["多語翻譯/字幕", "短劇引流/社交裂變", "跨境物流/支付"], k: ["跨語 CTR↑", "分潤率↑", "退款率≤目標"] },
            { x: 792, t: "Stage 3：元宇宙", s: ["Unity 3D/AR/VR", "AI 分身/Web3"], k: ["3D 互動→下單率↑", "會員 LTV↑"] },
        ];
        boxes.forEach((b, idx) => {
            svg.appendChild(CBV2Svg.rect(b.x, TOP + 80, 320, 168, 16, "cbv2-box-strong"));
            svg.appendChild(CBV2Svg.text(b.x + 16, TOP + 110, b.t, { size: 15, weight: "bold" }));
            b.s.forEach((line, i) => svg.appendChild(CBV2Svg.text(b.x + 16, TOP + 138 + i * 22, "• " + line, { size: 13 })));
            svg.appendChild(CBV2Svg.text(b.x + 16, TOP + 200, "KPI：", { size: 12, weight: "bold", color: CBV2_THEME.note }));
            svg.appendChild(CBV2Svg.wrapText(svg, { x: b.x + 60, y: TOP + 200, text: b.k.join("、"), maxWidth: 260, lineHeight: 16, size: 12, color: CBV2_THEME.kpi }));
            if (idx < boxes.length - 1) svg.appendChild(CBV2Svg.curveArrow2(b.x + 320, TOP + 164, b.x + 352, TOP + 164, { lift: -50 }));
        });

        svg.appendChild(CBV2Svg.text(24, TOP + 480, "原則：每階段皆可單獨 Demo 與變現；AI 決策貫穿全旅程（首頁/直播/上架/結算）。", { size: 12, color: CBV2_THEME.note }));

        wrap.appendChild(CBV2Layout.card("發展路線與 KPI", (() => { const h = document.createElement("div"); h.appendChild(svg); return h; })()));
        return wrap;
    }
}
