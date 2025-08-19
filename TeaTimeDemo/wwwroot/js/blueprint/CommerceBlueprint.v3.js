// ======================================================
// CommerceBlueprint.v3.js  —  影響力經濟（愛心幣 × 時間銀行 × 社區小程序）
// 五頁：總覽｜募與公益資金流｜善時點數（時間銀行）｜模組化拼裝架構｜教會管理套件
// 特性：字大留白、真實量測換行、曲線箭頭可調拱度（不穿越方塊）、內建 PNG/PDF 匯出
// 依賴：ExportKit.js（已在你的專案中）
// ======================================================

const LINKMAP_V3 = {
    "公益模組": "/Charity",
    "時間銀行": "/TimeBank",
    "幣中心 & 交易": "/Wallet",
    "二手市集 & 教育": "/Market"
};


class CBV3Svg {
    static el(tag, attrs = {}, children = []) {
        const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
        Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v)));
        children.forEach(c => e.appendChild(c));
        return e;
    }
    static text(x, y, str, { anchor = "start", size = 14, weight = "normal", color = "#111827" } = {}) {
        const t = this.el("text", {
            x, y, "text-anchor": anchor, "font-size": size, "font-weight": weight,
            "font-family": "Inter, Arial, 'Noto Sans TC', sans-serif", fill: color
        });
        t.textContent = str; return t;
    }
    static rect(x, y, w, h, r = 14, cls = "v3-box") { return this.el("rect", { x, y, width: w, height: h, rx: r, ry: r, class: cls }); }
    static circle(cx, cy, r, fill = "#111827") { return this.el("circle", { cx, cy, r, fill }); }
    static line(x1, y1, x2, y2, cls = "v3-line") { return this.el("line", { x1, y1, x2, y2, class: cls }); }

    static curveArrow(x1, y1, x2, y2, bend = 0.4, cls = "v3-arrow") {
        const g = this.el("g");
        const cx = x1 + (x2 - x1) * bend, cy = y1 + (y2 - y1) * bend - 40;
        const p = this.el("path", { d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, class: cls, fill: "none" });
        g.appendChild(p);
        const ang = Math.atan2(y2 - cy, x2 - cx), ax = x2 - 12 * Math.cos(ang), ay = y2 - 12 * Math.sin(ang);
        g.appendChild(this.line(x2, y2, ax - 5 * Math.sin(ang), ay + 5 * Math.cos(ang), cls));
        g.appendChild(this.line(x2, y2, ax + 5 * Math.sin(ang), ay - 5 * Math.cos(ang), cls));
        return g;
    }

    // ★ 可調「lift」的曲線箭頭：lift<0 往上拱；lift>0 往下拱（避免重疊）
    static curveArrow2(x1, y1, x2, y2, { bend = 0.5, lift = -90, cls = "v3-arrow" } = {}) {
        const g = this.el("g");
        const cx = x1 + (x2 - x1) * bend, cy = y1 + (y2 - y1) * bend + lift;
        const p = this.el("path", { d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, class: cls, fill: "none" });
        g.appendChild(p);
        const ang = Math.atan2(y2 - cy, x2 - cx), ax = x2 - 12 * Math.cos(ang), ay = y2 - 12 * Math.sin(ang);
        g.appendChild(this.line(x2, y2, ax - 5 * Math.sin(ang), ay + 5 * Math.cos(ang), cls));
        g.appendChild(this.line(x2, y2, ax + 5 * Math.sin(ang), ay - 5 * Math.cos(ang), cls));
        return g;
    }

    // 真實量測換行：同一張 svg 內插入隱形 <text> 測寬
    static wrapText(svg, { x, y, text, maxWidth, lineHeight = 18, size = 13, weight = "normal", color = "#111827", anchor = "start", maxLines = 99 }) {
        const group = this.el("g", {});
        const base = this.text(x, y, "", { anchor, size, weight, color });
        group.appendChild(base);

        const probe = this.text(-9999, -9999, "", { anchor: "start", size, weight, color });
        probe.setAttribute("opacity", "0"); svg.appendChild(probe);

        const pushLine = (s, dy) => {
            const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            tspan.setAttribute("x", String(x)); if (dy !== 0) tspan.setAttribute("dy", String(dy));
            tspan.textContent = s; base.appendChild(tspan);
        };

        let line = "", dy = 0, lines = 0; const chars = Array.from(text || "");
        for (let i = 0; i < chars.length; i++) {
            const test = line + chars[i]; probe.textContent = test;
            const w = probe.getComputedTextLength();
            if (w <= maxWidth || line.length === 0) line = test;
            else {
                pushLine(line, dy === 0 ? 0 : lineHeight); lines++;
                if (lines >= maxLines) { // 省略尾端
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

    static downloadPng(svgEl, filename = "v3.png") { ExportKit.downloadPngFromSvg(svgEl, filename); }
    static downloadPdf(svgEl, filename = "v3.pdf") { ExportKit.downloadPdfFromSvg(svgEl, filename); }
}

class CBV3Layout {
    static style() {
        return `
    <style>
      .v3-wrap{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:12px 12px 6px}
      .v3-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
      .v3-tab{border:1px solid #e5e7eb;border-radius:999px;padding:8px 14px;background:#fff;cursor:pointer}
      .v3-tab.active{background:#111827;color:#fff;border-color:#111827}
      .v3-card{border:1px solid #e5e7eb;border-radius:16px;padding:16px;box-shadow:0 6px 18px rgba(0,0,0,.06);margin-bottom:16px;background:#fff}
      .v3-title{font-weight:800;font-size:18px;letter-spacing:.2px;margin-bottom:12px;display:flex;gap:12px;align-items:center}
      .v3-actions{margin-left:auto;display:flex;gap:8px}
      svg{width:100%;height:auto}
      .v3-box{fill:#fff;stroke:#94a3b8;stroke-width:1.8}
      .v3-box-strong{fill:#f8fafc;stroke:#475569;stroke-width:2}
      .v3-lane{fill:#f9fafb;stroke:#e5e7eb}
      .v3-arrow{stroke:#111827;stroke-width:1.8}
      .v3-line{stroke:#94a3b8;stroke-width:1.6}
      .v3-note{fill:#64748b;font-size:12px}
      .v3-kpi{fill:#0ea5e9}
    </style>`;
    }

    static card(title, contentNode, withDownload = true) {
        const wrap = document.createElement("div");
        wrap.className = "v3-card";
        const head = document.createElement("div");
        head.className = "v3-title";
        head.innerHTML = `<div>${title}</div>`;
        if (withDownload) {
            const btns = document.createElement("div"); btns.className = "v3-actions";
            const b1 = document.createElement("button"); b1.className = "btn btn-sm btn-outline-secondary"; b1.textContent = "下載 PNG";
            const b2 = document.createElement("button"); b2.className = "btn btn-sm btn-dark"; b2.textContent = "下載 PDF";
            btns.appendChild(b1); btns.appendChild(b2); head.appendChild(btns);
            setTimeout(() => {
                const svg = contentNode.querySelector("svg"); if (!svg) return;
                b1.onclick = () => CBV3Svg.downloadPng(svg, (title || "v3").replace(/\s+/g, "_") + ".png");
                b2.onclick = () => CBV3Svg.downloadPdf(svg, (title || "v3").replace(/\s+/g, "_") + ".pdf");
            }, 0);
        }
        wrap.appendChild(head); wrap.appendChild(contentNode); return wrap;
    }

    static tabs(container, tabs) {
        const head = document.createElement("div"); head.className = "v3-tabs";
        const body = document.createElement("div"); body.className = "v3-body";
        container.appendChild(head); container.appendChild(body);
        const btns = [];
        const switchTo = (i) => { btns.forEach((b, j) => b.classList.toggle("active", j === i)); body.innerHTML = ""; body.appendChild(tabs[i].render()); };
        tabs.forEach((t, i) => { const b = document.createElement("button"); b.className = "v3-tab" + (i === 0 ? " active" : ""); b.textContent = t.name; b.onclick = () => switchTo(i); head.appendChild(b); btns.push(b); });
        switchTo(0);
    }
}

class CommerceBlueprintV3 {
    static render(containerId) {
        const root = document.getElementById(containerId); if (!root) return;
        root.innerHTML = CBV3Layout.style() + `<div class="v3-wrap"></div>`;
        const wrap = root.querySelector(".v3-wrap");
        const tabs = [
            { name: "影響力經濟總覽", render: () => CBV3Pages.page_Overview() },
            { name: "募與公益資金流", render: () => CBV3Pages.page_FundFlow() },
            { name: "時間點數", render: () => CBV3Pages.page_TimeBank() },
            { name: "模組化拼裝架構", render: () => CBV3Pages.page_Modular() },
            { name: "教會管理套件", render: () => CBV3Pages.page_ChurchSuite() },
        ];
        CBV3Layout.tabs(wrap, tabs);
    }
}

class CBV3Pages {

    // 1) 影響力經濟總覽（大間距版）
    static page_Overview() {
        const wrap = document.createElement("div");
        const W = 1200, H = 680;
        const svg = CBV3Svg.el("svg", { viewBox: `0 0 ${W} ${H}` });

        const BOX_W = 320, BOX_H = 100;
        const LEFT_X = 120, RIGHT_X = W - LEFT_X - BOX_W;
        const TOP_Y = 200, BOT_Y = 460;
        const CENTER = { x: W / 2, y: 340 };

        const q1 = { x: LEFT_X, y: TOP_Y, t: "公益模組", d: "餐券 / 送餐 / 帳務透明" };
        const q2 = { x: RIGHT_X, y: TOP_Y, t: "時間銀行", d: "任務發佈 / 積分流轉" };
        const q3 = { x: LEFT_X, y: BOT_Y, t: "幣中心 & 交易", d: "居希恩幣 / 冠名幣 / 集合" };
        const q4 = { x: RIGHT_X, y: BOT_Y, t: "二手市集 & 教育", d: "C2C / 供需 / 課程 / 活動" };
        [q1, q2, q3, q4].forEach(b => {
            const r = CBV3Svg.rect(b.x, b.y, BOX_W, BOX_H, 16, "v3-box");
            r.dataset.href = LINKMAP_V3[b.t] || "";
            r.dataset.confirm = `要前往「${b.t}」嗎？`;
            r.dataset.target = "_self";
            svg.appendChild(r);

            svg.appendChild(CBV3Svg.text(b.x + BOX_W / 2, b.y + 38, b.t, { anchor: "middle", size: 16, weight: "bold" }));
            svg.appendChild(CBV3Svg.text(b.x + BOX_W / 2, b.y + 64, b.d, { anchor: "middle", size: 13, color: "#475569" }));
        });

        svg.appendChild(CBV3Svg.circle(CENTER.x, CENTER.y, 6, "#334155"));
        svg.appendChild(CBV3Svg.text(CENTER.x, CENTER.y + 28, "商城 × 發幣 × 時間銀行 × 社區小程序", { anchor: "middle", size: 13, color: "#64748b" }));

        const mid = b => ({ x: b.x + BOX_W / 2, y: b.y + BOX_H / 2 });
        const m1 = mid(q1), m2 = mid(q2), m3 = mid(q3), m4 = mid(q4);
        svg.appendChild(CBV3Svg.curveArrow2(m1.x, m1.y, CENTER.x - 10, CENTER.y - 6, { bend: .5, lift: -90 }));
        svg.appendChild(CBV3Svg.curveArrow2(m2.x, m2.y, CENTER.x + 10, CENTER.y - 6, { bend: .5, lift: -90 }));
        svg.appendChild(CBV3Svg.curveArrow2(m3.x, m3.y, CENTER.x - 10, CENTER.y + 6, { bend: .5, lift: +90 }));
        svg.appendChild(CBV3Svg.curveArrow2(m4.x, m4.y, CENTER.x + 10, CENTER.y + 6, { bend: .5, lift: +90 }));

        const kx = 100, kw = W - 200, ky = 600, kh = 60;
        svg.appendChild(CBV3Svg.rect(kx, ky, kw, kh, 14, "v3-box-strong"));
        const kpi = "KPI：公益達成率、送餐覆蓋數、重複捐贈率、任務完成時數、跨流通筆數、7/30 日 GMV、TTF、退款率、會員 LTV";
        svg.appendChild(CBV3Svg.wrapText(svg, { x: kx + 16, y: ky + 36, text: kpi, maxWidth: kw - 32, size: 13, color: "#0ea5e9" }));

        wrap.appendChild(CBV3Layout.card("影響力經濟總覽", (() => { const h = document.createElement("div"); h.appendChild(svg); return h; })()));
        return wrap;
    }


    // 2) 募與公益資金流（三欄：來源｜託管核銷｜支出成效）
    static page_FundFlow() {
        const wrap = document.createElement("div");
        const W = 1200, H = 720;
        const svg = CBV3Svg.el("svg", { viewBox: `0 0 ${W} ${H}` });

        const colW = 330, colH = 440, gap = 30;
        const x1 = 70, x2 = x1 + colW + gap, x3 = x2 + colW + gap, y = 140;

        const cols = [
            {
                x: x1, title: "資金來源", items: [
                    "① 商城抽成（%）→ 公益池",
                    "② 善心人士捐贈（常/定期）",
                    "③ 企業/個人冠名幣發行收入",
                    "④ 活動募款（專案/目標金額）"
                ]
            },
            {
                x: x2, title: "託管與核銷", items: [
                    "專案建立（需求/受益者名冊）",
                    "入金：Coins / 法幣 → Escrow",
                    "里程核銷：送餐憑證/發放流水",
                    "善款透明：放款/保管/餘額"
                ]
            },
            {
                x: x3, title: "支出與成效", items: [
                    "餐券支付 / 受助名冊 / 地圖足跡",
                    "專案成效表 / 彙整圖像 / 報表",
                    "捐贈收據（可列印/寄送）",
                    "API 對外開放（開源資料）"
                ]
            }
        ];

        cols.forEach(c => {
            svg.appendChild(CBV3Svg.rect(c.x, y, colW, colH, 16, "v3-box"));
            svg.appendChild(CBV3Svg.text(c.x + 16, y + 32, c.title, { size: 16, weight: "bold" }));
            let yy = y + 60;
            c.items.forEach(line => {
                svg.appendChild(CBV3Svg.wrapText(svg, { x: c.x + 16, y: yy, text: "• " + line, maxWidth: colW - 32, lineHeight: 20, size: 13, color: "#111827" }));
                yy += 26;
            });
        });

        // 幣種說明 Callout
        const bx = x3, by = y + colH + 20, bw = colW, bh = 88;
        svg.appendChild(CBV3Svg.rect(bx, by, bw, bh, 12, "v3-box-strong"));
        svg.appendChild(CBV3Svg.text(bx + 12, by + 28, "幣種", { size: 14, weight: "bold" }));
        const note = "居希恩幣（平台幣）、冠名幣（企業/個人定名，可用於捐款/抵用/回饋）、公益券";
        svg.appendChild(CBV3Svg.wrapText(svg, { x: bx + 12, y: by + 50, text: note, maxWidth: bw - 24, size: 12, color: "#475569" }));

        // 引導箭頭（來源→託管→成效）
        const mid = (x) => ({ x: x + colW / 2, y: y + colH / 2 });
        const m1 = mid(x1), m2 = mid(x2), m3 = mid(x3);
        svg.appendChild(CBV3Svg.curveArrow2(m1.x + 20, m1.y, m2.x - 20, m2.y, { lift: -60 }));
        svg.appendChild(CBV3Svg.curveArrow2(m2.x + 20, m2.y, m3.x - 20, m3.y, { lift: -60 }));

        wrap.appendChild(CBV3Layout.card("募與公益資金流", (() => { const h = document.createElement("div"); h.appendChild(svg); return h; })()));
        return wrap;
    }

    // 3) 善時點數（時間銀行）— 會員任務流
    static page_TimeBank() {
        const wrap = document.createElement("div");
        const W = 1200, H = 760;
        const svg = CBV3Svg.el("svg", { viewBox: `0 0 ${W} ${H}` });

        // 三泳道
        const lanes = [
            { y: 130, name: "會員（社區）" },
            { y: 330, name: "任務流程" },
            { y: 530, name: "治理 / 兌換" }
        ];
        lanes.forEach(l => {
            svg.appendChild(CBV3Svg.rect(20, l.y - 60, W - 40, 120, 16, "v3-lane"));
            svg.appendChild(CBV3Svg.text(36, l.y - 34, l.name, { size: 13, weight: "bold" }));
        });

        const box = (x, y, w, h, t, s) => {
            svg.appendChild(CBV3Svg.rect(x, y, w, h, 12, "v3-box"));
            svg.appendChild(CBV3Svg.text(x + w / 2, y + 34, t, { anchor: "middle", size: 14, weight: "bold" }));
            if (s) svg.appendChild(CBV3Svg.text(x + w / 2, y + 58, s, { anchor: "middle", size: 12, color: "#475569" }));
            return { cx: x + w / 2, cy: y + h / 2, x, y, w, h };
        };

        // 會員層
        const a1 = box(120, 100, 240, 80, "發佈任務", "賞點 / 截止 / 地點");
        const a2 = box(460, 100, 240, 80, "接單與完成", "拍照/簽到/回報");
        const a3 = box(800, 100, 240, 80, "審核入賬", "時間點數 + 評價");
        svg.appendChild(CBV3Svg.curveArrow2(a1.cx + 20, a1.cy, a2.cx - 20, a2.cy, { lift: -60 }));
        svg.appendChild(CBV3Svg.curveArrow2(a2.cx + 20, a2.cy, a3.cx - 20, a3.cy, { lift: -60 }));

        // 任務流程層
        const b1 = box(120, 300, 240, 80, "任務池", "社區分類 / 搜尋");
        const b2 = box(460, 300, 240, 80, "驗收規則", "簽到 / 圖片 / 視頻");
        const b3 = box(800, 300, 240, 80, "積分發放", "自動/人工 核發");
        svg.appendChild(CBV3Svg.curveArrow2(b1.cx + 20, b1.cy, b2.cx - 20, b2.cy, { lift: -40 }));
        svg.appendChild(CBV3Svg.curveArrow2(b2.cx + 20, b2.cy, b3.cx - 20, b3.cy, { lift: -40 }));

        // 治理 / 兌換
        const c1 = box(120, 500, 240, 80, "積分錢包", "餘額 / 歷史 / 轉贈");
        const c2 = box(460, 500, 240, 80, "兌換中心", "餐券 / 教育 / 物資");
        const c3 = box(800, 500, 240, 80, "社區治理", "提案 / 投票 / 公示");
        svg.appendChild(CBV3Svg.curveArrow2(c1.cx + 20, c1.cy, c2.cx - 20, c2.cy, { lift: +40 }));
        svg.appendChild(CBV3Svg.curveArrow2(c2.cx + 20, c2.cy, c3.cx - 20, c3.cy, { lift: +40 }));

        // 備註
        const note = "公式示例：時間點數 = 任務時數 × 權重（難度/稀缺） × 評價係數；可跨幣種兌換與公益聯動。";
        svg.appendChild(CBV3Svg.wrapText(svg, { x: 24, y: 700, text: note, maxWidth: W - 48, size: 12, color: "#64748b" }));

        wrap.appendChild(CBV3Layout.card("時間點數", (() => { const h = document.createElement("div"); h.appendChild(svg); return h; })()));
        return wrap;
    }

    // 4) 模組化拼裝架構（卡片網格）
    static page_Modular() {
        const wrap = document.createElement("div");
        const W = 1200, H = 640;
        const svg = CBV3Svg.el("svg", { viewBox: `0 0 ${W} ${H}` });

        const grid = [
            ["商城核心", "商品/車/訂單/支付（Coins+Escrow）"],
            ["公益模組", "專案/受益者/餐券/捐贈/透明帳"],
            ["時間銀行", "任務池/驗收/時間點數/治理"],
            ["幣中心", "居希恩幣/冠名幣/發行/交易"],
            ["二手市集", "C2C/需求牆/議價/履約"],
            ["教會套件", "週報/會計/團契/活動"],
            ["直播 × 短劇", "即看即買/商品卡/倒數返幣"],
            ["AI Copilot", "上架助手/文案/多語/定價/風控"]
        ];
        const C = 4, Wbox = 260, Hbox = 100, gapX = 24, gapY = 24, offX = 44, offY = 120;

        // 標題說明
        svg.appendChild(CBV3Svg.text(24, 48, "模組可插拔：可按場景任意組合，逐步擴建", { size: 13, color: "#64748b" }));

        grid.forEach((row, i) => {
            const col = i % C, r = Math.floor(i / C);
            const x = offX + col * (Wbox + gapX);
            const y = offY + r * (Hbox + gapY);
            svg.appendChild(CBV3Svg.rect(x, y, Wbox, Hbox, 14, "v3-box"));
            svg.appendChild(CBV3Svg.text(x + 12, y + 34, row[0], { size: 14, weight: "bold" }));
            svg.appendChild(CBV3Svg.wrapText(svg, { x: x + 12, y: y + 58, text: row[1], maxWidth: Wbox - 24, size: 12, color: "#475569" }));
        });

        wrap.appendChild(CBV3Layout.card("模組化拼裝架構", (() => { const h = document.createElement("div"); h.appendChild(svg); return h; })()));
        return wrap;
    }

    // 5) 教會管理套件
    static page_ChurchSuite() {
        const wrap = document.createElement("div");
        const W = 1200, H = 660;
        const svg = CBV3Svg.el("svg", { viewBox: `0 0 ${W} ${H}` });

        const blocks = [
            { x: 60, y: 120, w: 300, h: 120, t: "週報 / 公告", s: ["敬拜流程、代禱事項、活動預告"] },
            { x: 420, y: 120, w: 300, h: 120, t: "團契 / 小組", s: ["名單、聚會簽到、關懷紀錄"] },
            { x: 780, y: 120, w: 300, h: 120, t: "活動 / 課程", s: ["報名、費用、點名、作業"] },
            { x: 60, y: 300, w: 300, h: 120, t: "奉獻 / 會計", s: ["十一、感恩、專案；收支報表"] },
            { x: 420, y: 300, w: 300, h: 120, t: "志工排班", s: ["主日、兒主、招待、影音"] },
            { x: 780, y: 300, w: 300, h: 120, t: "整合商城", s: ["周邊商品、課程、公益串接"] },
        ];
        blocks.forEach(b => {
            svg.appendChild(CBV3Svg.rect(b.x, b.y, b.w, b.h, 14, "v3-box"));
            svg.appendChild(CBV3Svg.text(b.x + 12, b.y + 34, b.t, { size: 14, weight: "bold" }));
            b.s.forEach((line, i) => svg.appendChild(CBV3Svg.text(b.x + 12, b.y + 60 + i * 20, "• " + line, { size: 12, color: "#475569" })));
        });

        const kx = 60, kw = W - 120, ky = 500, kh = 90;
        svg.appendChild(CBV3Svg.rect(kx, ky, kw, kh, 14, "v3-box-strong"));
        const ktxt = "KPI：牧養觸達率、課程參與度、志工填補率、奉獻覆蓋率、社群活躍度、與商城/公益互通率";
        svg.appendChild(CBV3Svg.wrapText(svg, { x: kx + 16, y: ky + 36, text: ktxt, maxWidth: kw - 32, size: 13, color: "#0ea5e9" }));

        wrap.appendChild(CBV3Layout.card("教會管理套件", (() => { const h = document.createElement("div"); h.appendChild(svg); return h; })()));
        return wrap;
    }
}
