// ======================================================
// CommerceBlueprint.v4.js — 樂高模組化（食/衣/住/行/育/樂）
// 頁籤：總覽｜模組目錄｜金流 × 物流｜搜尋比價｜Play & Create
// 依賴：ExportKit（PNG/PDF）
// ======================================================

const LINKMAP_V4 = {
    "食": "/v4/food",
    "衣": "/v4/apparel",
    "住": "/v4/home",
    "行": "/v4/travel",
    "育": "/v4/edu",
    "樂": "/v4/fun"
};


class CBV4Svg {
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
    static rect(x, y, w, h, r = 14, cls = "v4-box") { return this.el("rect", { x, y, width: w, height: h, rx: r, ry: r, class: cls }); }
    static circle(cx, cy, r, fill = "#111827") { return this.el("circle", { cx, cy, r, fill }); }
    static line(x1, y1, x2, y2, cls = "v4-line") { return this.el("line", { x1, y1, x2, y2, class: cls }); }
    static curveArrow(x1, y1, x2, y2, { bend = .5, lift = -60, cls = "v4-arrow" } = {}) {
        const g = this.el("g"); const cx = x1 + (x2 - x1) * bend, cy = y1 + (y2 - y1) * bend + lift;
        const p = this.el("path", { d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, class: cls, fill: "none" }); g.appendChild(p);
        const ang = Math.atan2(y2 - cy, x2 - cx), ax = x2 - 12 * Math.cos(ang), ay = y2 - 12 * Math.sin(ang);
        g.appendChild(this.line(x2, y2, ax - 5 * Math.sin(ang), ay + 5 * Math.cos(ang), cls));
        g.appendChild(this.line(x2, y2, ax + 5 * Math.sin(ang), ay - 5 * Math.cos(ang), cls));
        return g;
    }
    // 真實量測換行
    static wrapText(svg, { x, y, text, maxWidth, lineHeight = 18, size = 13, weight = "normal", color = "#111827", anchor = "start", maxLines = 99 }) {
        const group = this.el("g", {}); const base = this.text(x, y, "", { anchor, size, weight, color }); group.appendChild(base);
        const probe = this.text(-9999, -9999, "", { anchor: "start", size, weight, color }); probe.setAttribute("opacity", "0"); svg.appendChild(probe);
        const push = (s, dy) => { const t = document.createElementNS("http://www.w3.org/2000/svg", "tspan"); t.setAttribute("x", String(x)); if (dy !== 0) t.setAttribute("dy", String(dy)); t.textContent = s; base.appendChild(t); };
        let line = "", dy = 0, lines = 0; const chars = Array.from(text || "");
        for (let i = 0; i < chars.length; i++) {
            const test = line + chars[i]; probe.textContent = test; const w = probe.getComputedTextLength();
            if (w <= maxWidth || line.length === 0) { line = test; }
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
        svg.removeChild(probe); return group;
    }
    static downloadPng(svgEl, filename = "v4.png") { ExportKit.downloadPngFromSvg(svgEl, filename); }
    static downloadPdf(svgEl, filename = "v4.pdf") { ExportKit.downloadPdfFromSvg(svgEl, filename); }
}

class CBV4Layout {
    static style() {
        return `
    <style>
      .v4-wrap{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:12px 12px 6px}
      .v4-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
      .v4-tab{border:1px solid #e5e7eb;border-radius:999px;padding:8px 14px;background:#fff;cursor:pointer}
      .v4-tab.active{background:#111827;color:#fff;border-color:#111827}
      .v4-card{border:1px solid #e5e7eb;border-radius:16px;padding:16px;box-shadow:0 6px 18px rgba(0,0,0,.06);margin-bottom:16px;background:#fff}
      .v4-title{font-weight:800;font-size:18px;letter-spacing:.2px;margin-bottom:12px;display:flex;gap:12px;align-items:center}
      .v4-actions{margin-left:auto;display:flex;gap:8px}
      svg{width:100%;height:auto}
      .v4-box{fill:#fff;stroke:#94a3b8;stroke-width:1.8}
      .v4-box-strong{fill:#f8fafc;stroke:#475569;stroke-width:2}
      .v4-lane{fill:#f9fafb;stroke:#e5e7eb}
      .v4-arrow{stroke:#111827;stroke-width:1.8}
      .v4-line{stroke:#94a3b8;stroke-width:1.6}
      .v4-pill{font-size:12px;fill:#0ea5e9}
    </style>`;
    }
    static card(title, contentNode, withDownload = true) {
        const wrap = document.createElement("div"); wrap.className = "v4-card";
        const head = document.createElement("div"); head.className = "v4-title"; head.innerHTML = `<div>${title}</div>`;
        if (withDownload) {
            const btns = document.createElement("div"); btns.className = "v4-actions";
            const b1 = document.createElement("button"); b1.className = "btn btn-sm btn-outline-secondary"; b1.textContent = "下載 PNG";
            const b2 = document.createElement("button"); b2.className = "btn btn-sm btn-dark"; b2.textContent = "下載 PDF";
            btns.appendChild(b1); btns.appendChild(b2); head.appendChild(btns);
            setTimeout(() => {
                const svg = contentNode.querySelector("svg"); if (!svg) return;
                b1.onclick = () => CBV4Svg.downloadPng(svg, (title || "v4").replace(/\s+/g, "_") + ".png");
                b2.onclick = () => CBV4Svg.downloadPdf(svg, (title || "v4").replace(/\s+/g, "_") + ".pdf");
            }, 0);
        }
        wrap.appendChild(head); wrap.appendChild(contentNode); return wrap;
    }
    static tabs(container, tabs) {
        const head = document.createElement("div"); head.className = "v4-tabs";
        const body = document.createElement("div"); body.className = "v4-body";
        container.appendChild(head); container.appendChild(body);
        const btns = [];
        const switchTo = (i) => { btns.forEach((b, j) => b.classList.toggle("active", j === i)); body.innerHTML = ""; body.appendChild(tabs[i].render()); }
        tabs.forEach((t, i) => { const b = document.createElement("button"); b.className = "v4-tab" + (i === 0 ? " active" : ""); b.textContent = t.name; b.onclick = () => switchTo(i); head.appendChild(b); btns.push(b); });
        switchTo(0);
    }
}

class CommerceBlueprintV4 {
    static render(containerId) {
        const root = document.getElementById(containerId); if (!root) return;
        root.innerHTML = CBV4Layout.style() + `<div class="v4-wrap"></div>`;
        const wrap = root.querySelector(".v4-wrap");
        const tabs = [
            { name: "總覽（六大生活域 × 樂高模組）", render: () => CBV4Pages.page_Overview() },
            { name: "模組目錄（可插拔）", render: () => CBV4Pages.page_Modules() },
            { name: "金流 × 物流（整合）", render: () => CBV4Pages.page_PayLogi() },
            { name: "搜尋比價（商城/旅遊）", render: () => CBV4Pages.page_Search() },
            { name: "Play & Create（Roblox × NFT）", render: () => CBV4Pages.page_PlayCreate() },
        ];
        CBV4Layout.tabs(wrap, tabs);
    }
}

class CBV4Pages {
    // --- 1) 總覽：六大類 + 代表模組 ---
    static page_Overview() {
        const wrap = document.createElement("div");
        const W = 1200, H = 650; const svg = CBV4Svg.el("svg", { viewBox: `0 0 ${W} ${H}` });
        const cats = [
            { x: 70, y: 100, t: "食", mods: ["餐券/外送串接", "公益送餐"] },
            { x: 440, y: 100, t: "衣", mods: ["二手/改衣", "品牌會員"] },
            { x: 810, y: 100, t: "住", mods: ["社區任務", "物資互助"] },
            { x: 70, y: 320, t: "行", mods: ["旅遊比價", "共乘/外送"] },
            { x: 440, y: 320, t: "育", mods: ["英文學校", "中文學校"] },
            { x: 810, y: 320, t: "樂", mods: ["Roblox 創作", "NFT 市集"] },
        ];

        // ✅ 可點版 box
        const box = (x, y, t, lines) => {
            const w = 300, h = 130;
            const r = CBV4Svg.rect(x, y, w, h, 16, "v4-box");
            r.dataset.href = LINKMAP_V4[t] || "";
            r.dataset.confirm = `要前往「${t}」嗎？`;
            r.dataset.target = "_self";
            svg.appendChild(r);

            svg.appendChild(CBV4Svg.text(x + 16, y + 36, `${t}`, { size: 18, weight: "bold" }));
            lines.forEach((s, i) => svg.appendChild(CBV4Svg.text(x + 16, y + 64 + i * 22, "• " + s, { size: 13, color: "#475569" })));
            return { cx: x + w / 2, cy: y + h / 2 };
        };

        cats.forEach(c => box(c.x, c.y, c.t, c.mods));

        // 中心：樂高原則
        svg.appendChild(CBV4Svg.rect(70, 520, 1060, 80, 14, "v4-box-strong"));
        const cap = "原則：所有功能皆為『模組』。V1(交易核心) × V2(AI) × V3(影響力) 可自由嵌入六大生活域；逐一上線、互相增益。";
        svg.appendChild(CBV4Svg.wrapText(svg, { x: 90, y: 565, text: cap, maxWidth: 1020, size: 13, color: "#0ea5e9" }));
        wrap.appendChild(CBV4Layout.card("總覽（六大生活域 × 樂高模組）", (() => { const h = document.createElement("div"); h.appendChild(svg); return h; })()));
        return wrap;
    }


    // --- 2) 模組目錄：可插拔（含 V1/V2/V3 舊模組對應） ---
    static page_Modules() {
        const wrap = document.createElement("div");
        const W = 1200, H = 780; const svg = CBV4Svg.el("svg", { viewBox: `0 0 ${W} ${H}` });
        // 每類一欄：列模組與來源（V1/V2/V3/V4）
        const colW = 540, colH = 300, gap = 40;
        const columns = [
            {
                x: 60, y: 100, t: "食", list: [
                    "餐券/送餐（V3｜公益）", "外送串接：Foodpanda/Uber Eats（V4｜物流）", "商家 POS & 團餐（V4）"
                ]
            },
            {
                x: 600, y: 100, t: "衣", list: [
                    "二手市集（V3）", "改衣/接單（V4）", "品牌會員/積分（V2｜AI 推薦/定價）"
                ]
            },
            {
                x: 60, y: 440, t: "住", list: [
                    "社區小程序（V3）", "時間銀行任務（V3）", "物資互助/倉儲（V4）"
                ]
            },
            {
                x: 600, y: 440, t: "行", list: [
                    "旅遊搜尋比價（V4）", "共享出行/外送（V4）", "票券/保險（V4）"
                ]
            },
        ];
        columns.forEach(c => {
            svg.appendChild(CBV4Svg.rect(c.x, c.y, colW, colH, 16, "v4-box"));
            svg.appendChild(CBV4Svg.text(c.x + 16, c.y + 34, `${c.t}`, { size: 16, weight: "bold" }));
            let yy = c.y + 64;
            c.list.forEach(s => { svg.appendChild(CBV4Svg.wrapText(svg, { x: c.x + 16, y: yy, text: "• " + s, maxWidth: colW - 32, size: 13 })); yy += 26; });
        });
        // 育 & 樂 區域（指明學校與 Roblox/NFT）
        svg.appendChild(CBV4Svg.rect(60, 100 - 60, 0, 0, 0)); // no-op keep structure
        const eduX = 60, eduY = 160 - 60;
        svg.appendChild(CBV4Svg.rect(60, 700, 540, 300, 16, "v4-box")); // (不會顯示，僅示例；高度 H=780 已足夠)
        const eX = 60, eY = 100 + gap * 0; // already used
        const edu = { x: 60, y: 700 - 180, w: 540, h: 160 };
        const fun = { x: 600, y: 700 - 180, w: 540, h: 160 };
        svg.appendChild(CBV4Svg.rect(edu.x, edu.y, edu.w, edu.h, 16, "v4-box"));
        svg.appendChild(CBV4Svg.text(edu.x + 16, edu.y + 34, "育（學校模組）", { size: 16, weight: "bold" }));
        const eduLines = [
            "英文學校（課表/作業/測驗/多語字幕）",
            "中文學校（字詞/朗讀/寫作/古文）",
            "AI 助教（批改/講解/語音對話）"
        ];
        let y1 = edu.y + 64; eduLines.forEach(s => { svg.appendChild(CBV4Svg.wrapText(svg, { x: edu.x + 16, y: y1, text: "• " + s, maxWidth: edu.w - 32, size: 13 })); y1 += 26; });

        svg.appendChild(CBV4Svg.rect(fun.x, fun.y, fun.w, fun.h, 16, "v4-box"));
        svg.appendChild(CBV4Svg.text(fun.x + 16, fun.y + 34, "樂（創作模組）", { size: 16, weight: "bold" }));
        const funLines = [
            "Roblox 創作平台（地圖/任務/內購）",
            "NFT 繪圖/鑄造（作品上架/分潤/授權）",
            "家長/學校共同經營社群活動"
        ];
        let y2 = fun.y + 64; funLines.forEach(s => { svg.appendChild(CBV4Svg.wrapText(svg, { x: fun.x + 16, y: y2, text: "• " + s, maxWidth: fun.w - 32, size: 13 })); y2 += 26; });

        wrap.appendChild(CBV4Layout.card("模組目錄（可插拔）", (() => { const h = document.createElement("div"); h.appendChild(svg); return h; })()));
        return wrap;
    }

    // --- 3) 金流 × 物流（Coins/冠名幣/善時點數/ECPay × 外送/快遞） ---
    static page_PayLogi() {
        const wrap = document.createElement("div");
        const W = 1200, H = 560; const svg = CBV4Svg.el("svg", { viewBox: `0 0 ${W} ${H}` });
        // 上：金流
        svg.appendChild(CBV4Svg.rect(20, 80, 1160, 180, 16, "v4-lane"));
        svg.appendChild(CBV4Svg.text(36, 106, "金流（Payments）", { size: 15, weight: "bold" }));
        const pay = [
            { x: 60, t: "平台幣（居希恩幣）｜Ledger/Escrow" },
            { x: 320, t: "冠名幣（企業/個人）｜回饋/捐款" },
            { x: 580, t: "善時點數（時間銀行）｜任務兌換" },
            { x: 840, t: "ECPay 綠界金流｜信用卡/超商/ATM" }
        ];
        pay.forEach((p, i) => {
            const w = 240, h = 80, y = 140;
            svg.appendChild(CBV4Svg.rect(p.x, y, w, h, 12, "v4-box"));
            svg.appendChild(CBV4Svg.wrapText(svg, { x: p.x + 12, y: y + 28, text: p.t, maxWidth: w - 24, size: 13 }));
        });
        // 下：物流/外送
        svg.appendChild(CBV4Svg.rect(20, 300, 1160, 180, 16, "v4-lane"));
        svg.appendChild(CBV4Svg.text(36, 326, "物流 / 外送（Logistics / Delivery）", { size: 15, weight: "bold" }));
        const logi = [
            { x: 60, t: "Foodpanda / Uber Eats 串接（餐飲）" },
            { x: 420, t: "店配/宅配（7-11、黑貓、新竹等）" },
            { x: 780, t: "即時快遞（可擴充：Lalamove 等）" }
        ];
        logi.forEach((p, i) => {
            const w = 340, h = 80, y = 360;
            svg.appendChild(CBV4Svg.rect(p.x, y, w, h, 12, "v4-box"));
            svg.appendChild(CBV4Svg.wrapText(svg, { x: p.x + 12, y: y + 28, text: p.t, maxWidth: w - 24, size: 13 }));
        });

        wrap.appendChild(CBV4Layout.card("金流 × 物流（整合）", (() => { const h = document.createElement("div"); h.appendChild(svg); return h; })()));
        return wrap;
    }

    // --- 4) 搜尋比價：商城 / 旅遊（管道 × 轉化） ---
    static page_Search() {
        const wrap = document.createElement("div");
        const W = 1200, H = 620; const svg = CBV4Svg.el("svg", { viewBox: `0 0 ${W} ${H}` });

        // 左：商城搜尋
        const left = { x: 60, y: 100, w: 480, h: 420 };
        svg.appendChild(CBV4Svg.rect(left.x, left.y, left.w, left.h, 16, "v4-box"));
        svg.appendChild(CBV4Svg.text(left.x + 16, left.y + 34, "商城搜尋｜統一比價", { size: 15, weight: "bold" }));
        const lns = [
            "來源：各大商城（API/授權/資料合作）",
            "類別：全站、3C、家電、服飾、保健…",
            "功能：比價/到貨/評價彙整/歷史價格",
            "轉化：一鍵加購 / 返幣 / 優惠券"
        ];
        let y = left.y + 64; lns.forEach(s => { svg.appendChild(CBV4Svg.wrapText(svg, { x: left.x + 16, y, text: "• " + s, maxWidth: left.w - 32, size: 13 })); y += 26; });

        // 右：旅遊搜尋
        const right = { x: 660, y: 100, w: 480, h: 420 };
        svg.appendChild(CBV4Svg.rect(right.x, right.y, right.w, right.h, 16, "v4-box"));
        svg.appendChild(CBV4Svg.text(right.x + 16, right.y + 34, "旅遊搜尋｜航班/飯店/票券", { size: 15, weight: "bold" }));
        const rns = [
            "來源：OTA/航空/訂房（授權資料）",
            "功能：多源比價、行程拼裝、保險加購",
            "AI：依預算/時段產生行程、即時改票建議",
            "轉化：票券/團費 Escrow、旅伴分帳"
        ];
        y = right.y + 64; rns.forEach(s => { svg.appendChild(CBV4Svg.wrapText(svg, { x: right.x + 16, y, text: "• " + s, maxWidth: right.w - 32, size: 13 })); y += 26; });

        wrap.appendChild(CBV4Layout.card("搜尋比價（商城/旅遊）", (() => { const h = document.createElement("div"); h.appendChild(svg); return h; })()));
        return wrap;
    }

    // --- 5) Play & Create：Roblox × NFT × 商城變現 ---
    static page_PlayCreate() {
        const wrap = document.createElement("div");
        const W = 1200, H = 560; const svg = CBV4Svg.el("svg", { viewBox: `0 0 ${W} ${H}` });

        const steps = [
            { x: 80, t: "Roblox 創作", s: "地圖/角色/任務設計" },
            { x: 330, t: "上架與測試", s: "社群參與/活動導流" },
            { x: 580, t: "連動商城", s: "道具/票券/課程 綁定" },
            { x: 830, t: "NFT 鑄造", s: "作品發行/權利設定/分潤" },
            { x: 1030, t: "變現/分帳", s: "幣/金流/時間點數/捐贈" }
        ];
        steps.forEach((st, i) => {
            const y = 220, w = 200, h = 100;
            svg.appendChild(CBV4Svg.rect(st.x, y, w, h, 12, "v4-box"));
            svg.appendChild(CBV4Svg.text(st.x + w / 2, y + 36, st.t, { anchor: "middle", size: 14, weight: "bold" }));
            svg.appendChild(CBV4Svg.wrapText(svg, { x: st.x + 12, y: y + 58, text: st.s, maxWidth: w - 24, size: 12, color: "#475569" }));
            if (i < steps.length - 1) {
                const nx = steps[i + 1].x; svg.appendChild(CBV4Svg.curveArrow(st.x + w, y + 50, nx - 10, y + 50, { lift: -20 }));
            }
        });

        svg.appendChild(CBV4Svg.rect(60, 420, 1080, 80, 14, "v4-box-strong"));
        const note = "未成年保護：家長同意、收入代管、KPI 以學習/公益時數為主；內容審核與版權合規。";
        svg.appendChild(CBV4Svg.wrapText(svg, { x: 80, y: 465, text: note, maxWidth: 1040, size: 12, color: "#64748b" }));

        wrap.appendChild(CBV4Layout.card("Play & Create（Roblox × NFT）", (() => { const h = document.createElement("div"); h.appendChild(svg); return h; })()));
        return wrap;
    }
}
