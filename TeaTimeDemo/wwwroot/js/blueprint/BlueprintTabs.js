// =======================================================
// BlueprintTabs.js — V1/V2/V3/V4 分頁控制（含 V1 PNG/PDF 注入）
// =======================================================
class BlueprintTabs {
    static mount(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = this._style() + `<div class="bp-tabs-root"></div>`;
        const root = el.querySelector(".bp-tabs-root");
        this._renderTabs(root);
    }

    static _style() {
        return `
      <style>
        .bp-tabs-root{border:1px solid #e5e7eb;border-radius:16px;background:#fff}
        .bp-tabs-head{display:flex;gap:8px;flex-wrap:wrap;padding:10px 12px;border-bottom:1px solid #e5e7eb}
        .bp-tab{border:1px solid #e5e7eb;border-radius:999px;padding:8px 14px;background:#fff;cursor:pointer}
        .bp-tab.active{background:#111827;color:#fff;border-color:#111827}
        .bp-tabs-body{padding:12px}
        .bp-pane{display:none}
        .bp-pane.active{display:block}
        .bp-export{display:flex;gap:8px;align-items:center}
        .bp-title .bp-export{margin-left:auto}
      </style>
    `;
    }

    static _renderTabs(root) {
        const head = document.createElement("div");
        head.className = "bp-tabs-head";
        const body = document.createElement("div");
        body.className = "bp-tabs-body";
        root.appendChild(head); root.appendChild(body);

        const tabs = [
            { key: "v1", title: "V1｜MVP 全貌", render: () => this._ensureV1(body) },
            { key: "v2", title: "V2｜AI 中心（分頁）", render: () => this._ensureV2(body) },
            { key: "v3", title: "V3｜影響力經濟", render: () => this._ensureV3(body) },
            { key: "v4", title: "V4｜樂高模組（食衣住行育樂）", render: () => this._ensureV4(body) },
        ];

        const urlTab = (new URLSearchParams(location.search)).get("tab");
        let activeKey = (urlTab && ["v1", "v2", "v3", "v4"].includes(urlTab)) ? urlTab : "v1";

        const buttons = [];
        tabs.forEach(t => {
            const btn = document.createElement("button");
            btn.className = "bp-tab" + (t.key === activeKey ? " active" : "");
            btn.textContent = t.title;
            btn.onclick = () => switchTo(t.key);
            head.appendChild(btn); buttons.push(btn);
        });

        body.innerHTML = `
      <div id="bp-pane-v1" class="bp-pane"></div>
      <div id="bp-pane-v2" class="bp-pane"></div>
      <div id="bp-pane-v3" class="bp-pane"></div>
      <div id="bp-pane-v4" class="bp-pane"></div>
    `;

        const switchTo = (key) => {
            activeKey = key;
            buttons.forEach((b, i) => b.classList.toggle("active", tabs[i].key === key));
            body.querySelectorAll(".bp-pane").forEach(p => p.classList.remove("active"));
            const pane = body.querySelector("#bp-pane-" + key);
            pane.classList.add("active");
            if (!pane.dataset.inited) {
                const tab = tabs.find(x => x.key === key);
                tab.render();
                pane.dataset.inited = "1";
            }
            const usp = new URLSearchParams(location.search);
            usp.set("tab", key);
            history.replaceState(null, "", location.pathname + "?" + usp.toString());
        };

        switchTo(activeKey);
    }

    // ========== V1 ==========
    static _ensureV1(body) {
        const pane = body.querySelector("#bp-pane-v1");
        pane.innerHTML = `<div id="bp-v1-root"></div>`;
        try {
            if (typeof CommerceBlueprint !== "undefined") {
                CommerceBlueprint.render("bp-v1-root");
                setTimeout(() => this._augmentV1Exports(pane), 0);
            } else {
                pane.innerHTML = `<div class="text-danger">找不到 CommerceBlueprint.js</div>`;
            }
        } catch (err) {
            console.error(err);
            pane.innerHTML = `<div class="text-danger">渲染 V1 失敗：${err?.message || err}</div>`;
        }
    }

    static _augmentV1Exports(scopeEl) {
        const cards = scopeEl.querySelectorAll(".bp-card");
        cards.forEach((card, idx) => {
            const svg = card.querySelector("svg"); if (!svg) return;
            let titleEl = card.querySelector(".bp-title");
            if (!titleEl) {
                titleEl = document.createElement("div");
                titleEl.className = "bp-title d-flex";
                titleEl.textContent = "藍圖";
                card.insertBefore(titleEl, card.firstChild);
            }
            if (!titleEl.querySelector(".bp-export")) {
                const btns = document.createElement("div");
                btns.className = "bp-export";
                const bPng = document.createElement("button");
                bPng.className = "btn btn-sm btn-outline-secondary"; bPng.textContent = "下載 PNG";
                bPng.onclick = () => ExportKit.downloadPngFromSvg(svg, `v1_${idx + 1}.png`);
                const bPdf = document.createElement("button");
                bPdf.className = "btn btn-sm btn-dark"; bPdf.textContent = "下載 PDF";
                bPdf.onclick = () => ExportKit.downloadPdfFromSvg(svg, `v1_${idx + 1}.pdf`);
                btns.appendChild(bPng); btns.appendChild(bPdf); titleEl.appendChild(btns);
                titleEl.style.display = "flex"; titleEl.style.alignItems = "center"; titleEl.style.gap = "10px";
            }
        });
    }

    // ========== V2 ==========
    static _ensureV2(body) {
        const pane = body.querySelector("#bp-pane-v2");
        pane.innerHTML = `<div id="bp-v2-root"></div>`;
        try {
            if (typeof CommerceBlueprintV2 !== "undefined") {
                CommerceBlueprintV2.render("bp-v2-root");
            } else {
                pane.innerHTML = `<div class="text-danger">找不到 CommerceBlueprint.v2.js</div>`;
            }
        } catch (err) {
            console.error(err);
            pane.innerHTML = `<div class="text-danger">渲染 V2 失敗：${err?.message || err}</div>`;
        }
    }

    // ========== V3 ==========
    static _ensureV3(body) {
        const pane = body.querySelector("#bp-pane-v3");
        pane.innerHTML = `<div id="bp-v3-root"></div>`;
        try {
            if (typeof CommerceBlueprintV3 !== "undefined") {
                CommerceBlueprintV3.render("bp-v3-root");
            } else {
                pane.innerHTML = `<div class="text-danger">找不到 CommerceBlueprint.v3.js</div>`;
            }
        } catch (err) {
            console.error(err);
            pane.innerHTML = `<div class="text-danger">渲染 V3 失敗：${err?.message || err}</div>`;
        }
    }

    // ========== V4 ==========
    static _ensureV4(body) {
        const pane = body.querySelector("#bp-pane-v4");
        pane.innerHTML = `<div id="bp-v4-root"></div>`;
        try {
            if (typeof CommerceBlueprintV4 !== "undefined") {
                CommerceBlueprintV4.render("bp-v4-root");
            } else {
                pane.innerHTML = `<div class="text-danger">找不到 CommerceBlueprint.v4.js</div>`;
            }
        } catch (err) {
            console.error(err);
            pane.innerHTML = `<div class="text-danger">渲染 V4 失敗：${err?.message || err}</div>`;
        }
    }
}
