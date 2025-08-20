// ======================================================
// CommerceBlueprint.v2.js  —  AI 中心化・分頁版藍圖 (v2.3 美化)
// - 修復頂部壓字（TOP_PAD）
// - 真實量測換行（wrapText）
// - 「資料流與決策引擎」視覺強化（分層色、漸層泳道、陰影、彩色箭頭）
// - PNG / PDF 匯出（仰賴 ExportKit）
// ======================================================

class CBV2Svg {
    static el(tag, attrs = {}, children = []) {
        const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
        Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v)));
        children.forEach(c => e.appendChild(c));
        return e;
    }
    static text(x, y, str, { anchor = "start", size = 14, weight = "normal", color = "#111827" } = {}) {
        const t = this.el("text", {
            x, y, "text-anchor": anchor,
            "font-size": size, "font-weight": weight,
            "font-family": "Inter, Arial, 'Noto Sans TC', sans-serif",
            fill: color
        });
        t.textContent = str; return t;
    }
    static rect(x, y, w, h, r = 14, cls = "cbv2-box") { return this.el("rect", { x, y, width: w, height: h, rx: r, ry: r, class: cls }); }
    static circle(cx, cy, r, fill = "#111827") { return this.el("circle", { cx, cy, r, fill }); }
    static line(x1, y1, x2, y2, cls = "cbv2-line") { return this.el("line", { x1, y1, x2, y2, class: cls }); }
    static curveArrow(x1, y1, x2, y2, bend = 0.4, cls = "cbv2-arrow") {
        const g = this.el("g");
        const cx = x1 + (x2 - x1) * bend, cy = y1 + (y2 - y1) * bend - 40;
        const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
        const p = this.el("path", { d, class: cls, fill: "none" }); g.appendChild(p);
        const ang = Math.atan2(y2 - cy, x2 - cx), ax = x2 - 12 * Math.cos(ang), ay = y2 - 12 * Math.sin(ang);
        g.appendChild(this.line(x2, y2, ax - 5 * Math.sin(ang), ay + 5 * Math.cos(ang), cls));
        g.appendChild(this.line(x2, y2, ax + 5 * Math.sin(ang), ay - 5 * Math.cos(ang), cls));
        return g;
    }

    // 漸層與陰影
    static addDefs(svg) {
        const defs = this.el("defs", {});

        // 陰影
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
        grad("laneE", "#f0f9ff", "#ffffff"); // Event lane
        grad("laneF", "#ecfdf5", "#ffffff"); // Feature lane
        grad("laneP", "#f5f3ff", "#ffffff"); // Policy lane

        svg.appendChild(defs);
    }

    // 真實量測換行
    static wrapText(svg, { x, y, text, maxWidth, lineHeight = 18, size = 13, weight = "normal", color = "#111827", anchor = "start", maxLines = 99 }) {
        const group = this.el("g", {});
        const base = this.text(x, y, "", { anchor, size, weight, color });
        group.appendChild(base);

        const probe = this.text(-9999, -9999, "", { anchor: "start", size, weight, color });
        probe.setAttribute("opacity", "0");
        svg.appendChild(probe);

        const pushLine = (s, dy) => {
            const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            tspan.setAttribute("x", String(x));
            if (dy !== 0) tspan.setAttribute("dy", String(dy));
            tspan.textContent = s;
            base.appendChild(tspan);
        };

        let line = "", dy = 0, lines = 0;
        const chars = Array.from(text || "");
        for (let i = 0; i < chars.length; i++) {
            const test = line + chars[i];
            probe.textContent = test;
            const w = probe.getComputedTextLength();
            if (w <= maxWidth || line.length === 0) {
                line = test;
            } else {
                pushLine(line, dy === 0 ? 0 : lineHeight);
                lines++; if (lines >= maxLines) {
                    let tail = "";
                    for (; i < chars.length; i++) {
                        probe.textContent = tail + chars[i] + "…";
                        if (probe.getComputedTextLength() > maxWidth) break;
                        tail += chars[i];
                    }
                    pushLine(tail + "…", lineHeight);
                    line = ""; break;
                }
                dy += lineHeight;
                line = chars[i];
            }
        }
        if (line) pushLine(line, dy === 0 ? 0 : lineHeight);

        svg.removeChild(probe);
        return group;
    }

    static downloadPng(svgEl, filename = "blueprint.png") {
        ExportKit.downloadPngFromSvg(svgEl, filename);
    }
    static downloadPdf(svgEl, filename = "blueprint.pdf") {
        ExportKit.downloadPdfFromSvg(svgEl, filename);
    }
}

class CBV2Layout {
    static card(title, contentNode, withDownload = true) {
        const wrap = document.createElement("div");
        wrap.className = "cbv2-card";
        const head = document.createElement("div");
        head.className = "cbv2-title d-flex justify-content-between align-items-center";
        const right = document.createElement("div");
        right.className = "cbv2-actions";
        head.innerHTML = `<div>${title}</div>`;
        if (withDownload) {
            const btnPng = document.createElement("button");
            btnPng.className = "btn btn-sm btn-outline-secondary me-2";
            btnPng.textContent = "下載 PNG";
            const btnPdf = document.createElement("button");
            btnPdf.className = "btn btn-sm btn-dark";
            btnPdf.textContent = "下載 PDF";
            right.appendChild(btnPng);
            right.appendChild(btnPdf);
            head.appendChild(right);

            setTimeout(() => {
                const svg = contentNode.querySelector("svg");
                if (!svg) return;
                btnPng.onclick = () => CBV2Svg.downloadPng(svg, (title || "blueprint").replace(/\s+/g, "_") + ".png");
                btnPdf.onclick = () => CBV2Svg.downloadPdf(svg, (title || "blueprint").replace(/\s+/g, "_") + ".pdf");
            }, 0);
        }
        wrap.appendChild(head); wrap.appendChild(contentNode);
        return wrap;
    }

    static style() {
        return `
    <style>
      .cbv2-wrap{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:12px 12px 4px}
      .cbv2-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
      .cbv2-tab{border:1px solid #e5e7eb;border-radius:999px;padding:8px 14px;background:#fff;cursor:pointer}
      .cbv2-tab.active{background:#111827;color:#fff;border-color:#111827}
      .cbv2-card{border:1px solid #e5e7eb;border-radius:16px;padding:16px;box-shadow:0 6px 18px rgba(0,0,0,.06);margin-bottom:16px;background:#fff}
      .cbv2-title{font-weight:800;font-size:18px;letter-spacing:.2px;margin-bottom:10px;display:flex;gap:12px}
      .cbv2-actions{margin-left:auto;display:flex;gap:8px}
      svg{width:100%;height:auto}
      .cbv2-box{fill:#fff;stroke:#94a3b8;stroke-width:1.8}
      .cbv2-box-strong{fill:#f8fafc;stroke:#475569;stroke-width:2}
      .cbv2-lane{stroke:#e5e7eb}
      .cbv2-arrow{stroke:#111827;stroke-width:1.8}
      .cbv2-line{stroke:#94a3b8;stroke-width:1.6}
      .cbv2-kpi{fill:#0ea5e9;font-weight:800}
      /* 方案A：分層色 */
      .cbv2-box-e{fill:#eff6ff;stroke:#2563eb}   /* Event: 藍 */
      .cbv2-box-f{fill:#ecfdf5;stroke:#059669}   /* Feature: 綠 */
      .cbv2-box-p{fill:#f5f3ff;stroke:#7c3aed}   /* Policy: 紫 */
      .cbv2-arrow-e{stroke:#2563eb}
      .cbv2-arrow-f{stroke:#059669}
      .cbv2-arrow-p{stroke:#7c3aed}
      .cbv2-softshadow{filter:url(#cbv2-ds)}
    </style>`;
    }

    static tabs(container, tabs) {
        const head = document.createElement("div"); head.className = "cbv2-tabs";
        const body = document.createElement("div"); body.className = "cbv2-body";
        container.appendChild(head); container.appendChild(body);
        const btns = [];
        const switchTo = (i) => {
            btns.forEach((b, idx) => b.classList.toggle("active", idx === i));
            body.innerHTML = ""; body.appendChild(tabs[i].render());
        };
        tabs.forEach((t, idx) => {
            const b = document.createElement("button");
            b.className = "cbv2-tab" + (idx === 0 ? " active" : "");
            b.textContent = t.name; b.onclick = () => switchTo(idx);
            head.appendChild(b); btns.push(b);
        });
        switchTo(0);
    }
}

class CommerceBlueprintV2 {
    static render(containerId) {
        const root = document.getElementById(containerId);
        if (!root) return;
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

class CBV2Pages {
    static get TOP_PAD() { return 46; }

    // --- Page 1: AI 中樞總覽 ---
    static p1_AICore() {
        const wrap = document.createElement("div");
        const TOP = this.TOP_PAD;
        const svg = CBV2Svg.el("svg", { viewBox: `0 0 1200 ${520 + TOP}` });

        svg.appendChild(CBV2Svg.circle(600, TOP + 260, 72, "#111827"));
        svg.appendChild(CBV2Svg.text(600, TOP + 258, "AI Core", { anchor: "middle", size: 18, weight: "bold", color: "#fff" }));
        svg.appendChild(CBV2Svg.text(600, TOP + 280, "流量｜轉化｜供給｜風控", { anchor: "middle", size: 12, color: "#e5e7eb" }));

        const nodes = [
            { x: 260, y: TOP + 120, w: 240, h: 88, t1: "流量引擎", t2: "短劇/直播/社交/SEO" },
            { x: 700, y: TOP + 120, w: 240, h: 88, t1: "轉化引擎", t2: "商品卡/AI 導購/幣支付" },
            { x: 260, y: TOP + 332, w: 240, h: 88, t1: "供給引擎", t2: "上架助手/TinyMCE/多語" },
            { x: 700, y: TOP + 332, w: 240, h: 88, t1: "風控與合規", t2: "異常偵測/退款監測" },
        ];
        nodes.forEach(n => {
            svg.appendChild(CBV2Svg.rect(n.x, n.y, n.w, n.h, 16, "cbv2-box"));
            svg.appendChild(CBV2Svg.text(n.x + n.w / 2, n.y + 34, n.t1, { anchor: "middle", size: 14, weight: "bold" }));
            svg.appendChild(CBV2Svg.text(n.x + n.w / 2, n.y + 58, n.t2, { anchor: "middle", size: 12, color: "#64748b" }));
            svg.appendChild(CBV2Svg.curveArrow(n.x + n.w / 2, n.y + n.h / 2, 600, TOP + 260, 0.5));
        });

        const cap = [
            { x: 80, y: TOP + 240, w: 180, h: 70, t1: "多語/跨境", t2: "實時翻譯/稅務對應" },
            { x: 940, y: TOP + 240, w: 180, h: 70, t1: "幣與結算", t2: "Coins/Escrow/Ledger" }
        ];
        cap.forEach(c => {
            svg.appendChild(CBV2Svg.rect(c.x, c.y, c.w, c.h, 14, "cbv2-box-strong"));
            svg.appendChild(CBV2Svg.text(c.x + c.w / 2, c.y + 32, c.t1, { anchor: "middle", size: 13, weight: "bold" }));
            svg.appendChild(CBV2Svg.text(c.x + c.w / 2, c.y + 54, c.t2, { anchor: "middle", size: 12, color: "#64748b" }));
            svg.appendChild(CBV2Svg.curveArrow(c.x + c.w / 2, c.y + c.h / 2, c.x < 600 ? 528 : 672, c.y + 35, 0.5));
        });

        svg.appendChild(CBV2Svg.text(24, TOP + 500, "核心 KPI：7/30 日 GMV、TTF(首單時間)、直播 CTR、短影片即買率、退款率", { size: 12, color: "#64748b" }));

        CBV2Svg.addDefs(svg);
        wrap.appendChild(CBV2Layout.card("AI 中樞總覽", (() => { const holder = document.createElement("div"); holder.appendChild(svg); return holder; })()));
        return wrap;
    }

    // --- Page 2: 資料流與決策引擎（美化版） ---
    static p2_DataDecision() {
        const wrap = document.createElement("div");
        const TOP = this.TOP_PAD;
        const svg = CBV2Svg.el("svg", { viewBox: `0 0 1200 ${560 + TOP}` });

        CBV2Svg.addDefs(svg);

        // 泳道（漸層）
        const LANE_W = 1160, LANE_H = 112;
        svg.appendChild(CBV2Svg.el("rect", { x: 20, y: TOP + 72, width: LANE_W, height: LANE_H, rx: 16, ry: 16, class: "cbv2-lane", fill: "url(#laneE)" }));
        svg.appendChild(CBV2Svg.text(36, TOP + 98, "⚡ 事件蒐集（Event Stream）", { size: 13, weight: "bold" }));

        svg.appendChild(CBV2Svg.el("rect", { x: 20, y: TOP + 220, width: LANE_W, height: LANE_H, rx: 16, ry: 16, class: "cbv2-lane", fill: "url(#laneF)" }));
        svg.appendChild(CBV2Svg.text(36, TOP + 246, "🧬 特徵工程（Feature Store）", { size: 13, weight: "bold" }));

        svg.appendChild(CBV2Svg.el("rect", { x: 20, y: TOP + 368, width: LANE_W, height: LANE_H, rx: 16, ry: 16, class: "cbv2-lane", fill: "url(#laneP)" }));
        svg.appendChild(CBV2Svg.text(36, TOP + 394, "🧪 決策與實驗（Policy & Experiment）", { size: 13, weight: "bold" }));

        // 事件（藍）
        const events = [
            { x: 60, t: "user_login" },
            { x: 200, t: "view_item" },
            { x: 340, t: "live_watch" },
            { x: 480, t: "add_to_cart" },
            { x: 620, t: "start_checkout" },
            { x: 760, t: "purchase" },
            { x: 900, t: "refund_request" },
            { x: 1040, t: "inventory_change" },
        ];
        events.forEach(it => {
            const w = 130, h = 54, y = TOP + 94;
            svg.appendChild(CBV2Svg.rect(it.x, y, w, h, 12, "cbv2-box cbv2-box-e cbv2-softshadow"));
            const g = CBV2Svg.wrapText(svg, {
                x: it.x + w / 2, y: y + 30, text: it.t,
                maxWidth: w - 20, lineHeight: 16, size: 12, weight: "bold", anchor: "middle", maxLines: 2
            });
            svg.appendChild(g);
            svg.appendChild(CBV2Svg.curveArrow(it.x + w / 2, y + h, it.x + w / 2, TOP + 220, 0.45, "cbv2-arrow cbv2-arrow-e"));
        });

        // 特徵（綠）
        const feats = [
            { x: 120, t: "user_vec / RFM" },
            { x: 420, t: "item_vec / 價格/庫存/評分" },
            { x: 760, t: "context / 裝置/語言/時段" },
        ];
        feats.forEach(it => {
            const w = 220, h = 64, y = TOP + 242;
            svg.appendChild(CBV2Svg.rect(it.x, y, w, h, 12, "cbv2-box cbv2-box-f cbv2-softshadow"));
            const g = CBV2Svg.wrapText(svg, {
                x: it.x + w / 2, y: y + 36, text: it.t,
                maxWidth: w - 24, lineHeight: 16, size: 12, weight: "bold", anchor: "middle", maxLines: 2
            });
            svg.appendChild(g);
            svg.appendChild(CBV2Svg.curveArrow(it.x + w / 2, y + h, it.x + w / 2, TOP + 368, 0.43, "cbv2-arrow cbv2-arrow-f"));
        });

        // 決策（紫）
        const pols = [
            { x: 80, t: "排序策略（首頁/列表）" },
            { x: 360, t: "定價/券/返幣策略" },
            { x: 640, t: "分流（直播/短劇/內容）" },
            { x: 920, t: "風控/補貨/客服策略" },
        ];
        pols.forEach(it => {
            const w = 240, h = 64, y = TOP + 390;
            svg.appendChild(CBV2Svg.rect(it.x, y, w, h, 12, "cbv2-box cbv2-box-p cbv2-softshadow"));
            const g = CBV2Svg.wrapText(svg, {
                x: it.x + w / 2, y: y + 38, text: it.t,
                maxWidth: w - 28, lineHeight: 16, size: 13, weight: "bold", anchor: "middle", maxLines: 2
            });
            svg.appendChild(g);
            svg.appendChild(CBV2Svg.curveArrow(it.x + w / 2, y + h, it.x + w / 2, TOP + 506, 0.40, "cbv2-arrow cbv2-arrow-p"));
        });

        const dict = "資料字典：event_user, event_view, event_live, order, refund, inventory…（線上/離線一致）";
        svg.appendChild(CBV2Svg.wrapText(svg, {
            x: 24, y: TOP + 530, text: dict, maxWidth: 1150, lineHeight: 16, size: 12, color: "#64748b"
        }));

        wrap.appendChild(CBV2Layout.card("資料流與決策引擎（美化版）", (() => { const holder = document.createElement('div'); holder.appendChild(svg); return holder; })()));
        return wrap;
    }

    // --- Page 3: 流量 → 轉化 ---
    static p3_TrafficConversion() {
        const wrap = document.createElement("div");
        const TOP = this.TOP_PAD;
        const svg = CBV2Svg.el("svg", { viewBox: `0 0 1200 ${500 + TOP}` });

        const left = { x: 48, y: TOP + 56, w: 480, h: 360 }, right = { x: 672, y: TOP + 56, w: 480, h: 360 };
        svg.appendChild(CBV2Svg.rect(left.x, left.y, left.w, left.h, 16));
        svg.appendChild(CBV2Svg.text(left.x + 16, left.y + 30, "引流層（Attention）", { size: 15, weight: "bold" }));
        ["① 短劇/短影音（首要）", "② 直播預告/開播", "③ 社交裂變（群/好友）", "④ 內容沉澱（測評/攻略）"]
            .forEach((t, i) => svg.appendChild(CBV2Svg.text(left.x + 24, left.y + 68 + i * 28, "• " + t, { size: 13 })));

        svg.appendChild(CBV2Svg.rect(right.x, right.y, right.w, right.h, 16));
        svg.appendChild(CBV2Svg.text(right.x + 16, right.y + 30, "轉化層（Conversion & Monetization）", { size: 15, weight: "bold" }));
        ["A. 直播商品卡（免跳轉）", "B. 幣支付 + Escrow", "C. AI 導購（價格/比較/規格）", "D. 返幣/券/會員成長"]
            .forEach((t, i) => svg.appendChild(CBV2Svg.text(right.x + 24, right.y + 68 + i * 28, "• " + t, { size: 13 })));

        svg.appendChild(CBV2Svg.curveArrow(left.x + left.w, left.y + left.h / 2, right.x, right.y + right.h / 2, 0.5));

        const sX = right.x + 24, sY = right.y + 200, sW = right.w - 48, sH = 120;
        svg.appendChild(CBV2Svg.rect(sX, sY, sW, sH, 12, "cbv2-box-strong"));
        svg.appendChild(CBV2Svg.text(sX + 12, sY + 26, "直播商品卡 Schema（關鍵資料）", { size: 13, weight: "bold" }));
        const schema = "productId, skuId, price, promoPrice, stock, sellerId, countdown, rebateRate, couponIds[], buyUrl";
        svg.appendChild(CBV2Svg.wrapText(svg, { x: sX + 12, y: sY + 50, text: schema, maxWidth: sW - 24, lineHeight: 16, size: 12, color: "#64748b" }));

        wrap.appendChild(CBV2Layout.card("流量 → 轉化策略", (() => { const holder = document.createElement("div"); holder.appendChild(svg); return holder; })()));
        return wrap;
    }

    // --- Page 4: Seller AI 工作台 ---
    static p4_SellerWorkbench() {
        const wrap = document.createElement("div");
        const TOP = this.TOP_PAD;
        const svg = CBV2Svg.el("svg", { viewBox: `0 0 1200 ${520 + TOP}` });

        svg.appendChild(CBV2Svg.rect(20, TOP + 40, 1160, 430, 16, "cbv2-lane"));
        svg.appendChild(CBV2Svg.text(36, TOP + 66, "Seller AI 工作台（上架 → 內容 → 直播）", { size: 15, weight: "bold" }));

        const BOX_W = 230, BOX_H = 330, START_Y = TOP + 98;
        const cols = [
            { x: 60, t: "上架助手", s: ["分類建議/屬性建議", "圖像壓縮/浮水印", "定價基準/競品提醒"] },
            { x: 340, t: "內容生成", s: ["TinyMCE 模板（規格/FAQ）", "AI 產文/多語/濃縮", "影片腳本/分鏡建議"] },
            { x: 620, t: "直播準備", s: ["直播腳本/商品排序", "限時價/倒數/返幣設計", "預告素材（短片/海報）"] },
            { x: 890, t: "運營迭代", s: ["A/B 測試建議", "差評修復建議", "再行銷受眾清單"] },
        ];
        cols.forEach(c => {
            svg.appendChild(CBV2Svg.rect(c.x, START_Y, BOX_W, BOX_H, 14));
            svg.appendChild(CBV2Svg.text(c.x + BOX_W / 2, START_Y + 32, c.t, { anchor: "middle", size: 14, weight: "bold" }));
            let yy = START_Y + 60;
            c.s.forEach(line => {
                svg.appendChild(CBV2Svg.wrapText(svg, { x: c.x + 18, y: yy, text: "• " + line, maxWidth: BOX_W - 36, size: 13, lineHeight: 20 }));
                yy += 28;
            });
            svg.appendChild(CBV2Svg.curveArrow(c.x + BOX_W / 2, START_Y - 6, c.x + BOX_W / 2, TOP + 42, 0.35));
        });

        wrap.appendChild(CBV2Layout.card("Seller AI 工作台", (() => { const holder = document.createElement("div"); holder.appendChild(svg); return holder; })()));
        return wrap;
    }

    // --- Page 5: 發展路線與 KPI ---
    static p5_RoadmapKPI() {
        const wrap = document.createElement("div");
        const TOP = this.TOP_PAD;
        const svg = CBV2Svg.el("svg", { viewBox: `0 0 1200 ${520 + TOP}` });

        const boxes = [
            { x: 48, t: "Stage 1：MVP（存活期）", s: ["上架/車/結帳（Coins+Escrow）", "直播商品卡即買", "AI 導購標準問集"], k: ["TTF↓", "7/30 GMV↑", "直播即買率↑"] },
            { x: 420, t: "Stage 2：跨國成長", s: ["多語翻譯/字幕", "短劇引流/社交裂變", "跨境物流/支付"], k: ["跨語 CTR↑", "分潤率↑", "退款率≤目標"] },
            { x: 792, t: "Stage 3：元宇宙", s: ["Unity 3D/AR/VR", "AI 分身/Web3"], k: ["3D 互動→下單率↑", "會員 LTV↑"] },
        ];
        boxes.forEach((b, idx) => {
            svg.appendChild(CBV2Svg.rect(b.x, TOP + 80, 320, 168, 16, "cbv2-box-strong"));
            svg.appendChild(CBV2Svg.text(b.x + 16, TOP + 110, b.t, { size: 15, weight: "bold" }));
            b.s.forEach((line, i) => svg.appendChild(CBV2Svg.text(b.x + 16, TOP + 138 + i * 22, "• " + line, { size: 13 })));
            svg.appendChild(CBV2Svg.text(b.x + 16, TOP + 200, "KPI：", { size: 12, weight: "bold", color: "#64748b" }));
            svg.appendChild(CBV2Svg.wrapText(svg, { x: b.x + 60, y: TOP + 200, text: b.k.join("、"), maxWidth: 260, lineHeight: 16, size: 12, color: "#0ea5e9" }));
            if (idx < boxes.length - 1) svg.appendChild(CBV2Svg.curveArrow(b.x + 320, TOP + 164, b.x + 352, TOP + 164, 0.5));
        });

        svg.appendChild(CBV2Svg.text(24, TOP + 480, "原則：每階段皆可單獨 Demo 與變現；AI 決策貫穿全旅程（首頁/直播/上架/結算）。", { size: 12, color: "#64748b" }));

        wrap.appendChild(CBV2Layout.card("發展路線與 KPI", (() => { const holder = document.createElement("div"); holder.appendChild(svg); return holder; })()));
        return wrap;
    }
}
