// =======================================================
// SellerCenterApp.js — Seller Center 單頁（合併 Stage1 MVP 與「MVP 交易及上架助手」）
// 要點：
// 1) 所有 HTML 由 JS 產生（class + static）。
// 2) 一頁三區：A. 快速指引（Stage 標籤） B. 上架助手（AI 提示位） C. Seller CRUD（清單＋新增/編輯）。
// 3) API 使用 /Customer/Api/SellerCrud/*（示範 In-Memory，可隨時替換為正式 Repository）。
// =======================================================
class SellerCenterApp {
    static render(containerId, { stage = "mvp" } = {}) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = this._style() + `<div class="sca-root"></div>`;
        const root = el.querySelector(".sca-root");

        // A. 頂部 Stage 切換（其實同頁，只改 active 標記）
        root.appendChild(this._header(stage));

        // B. 上架助手（簡版入口）
        root.appendChild(this._assistant(stage));

        // C. Seller CRUD 主體
        root.appendChild(this._crud());

        // 首次載入資料
        this._loadList(root);
    }

    /* -------------------- Styles -------------------- */
    static _style() {
        return `
    <style>
      .sca-card{border:1px solid #e5e7eb;border-radius:16px;background:#fff;margin-bottom:18px}
      .sca-head{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid #e5e7eb}
      .sca-title{font-weight:800;font-size:18px}
      .sca-body{padding:14px}
      .sca-pill{display:inline-block;padding:4px 10px;border:1px solid #e5e7eb;border-radius:999px;margin-right:6px;cursor:pointer}
      .sca-pill.active{background:#111827;color:#fff;border-color:#111827}
      .sca-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
      @media(max-width:992px){.sca-grid{grid-template-columns:1fr}}
      .sca-assist{border:1px dashed #cbd5e1;border-radius:12px;padding:12px}
      .sca-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      @media(max-width:992px){.sca-row{grid-template-columns:1fr}}
      .sca-table{width:100%}
      .sca-table th,.sca-table td{padding:8px 10px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
      .sca-empty{color:#64748b}
      .sca-modal{position:fixed;inset:0;background:rgba(17,24,39,.56);display:none;align-items:center;justify-content:center;z-index:1050}
      .sca-modal .inner{background:#fff;border-radius:16px;max-width:920px;width:96%;padding:16px}
    </style>
    `;
    }

    /* -------------------- Header (Stage pills) -------------------- */
    static _header(stage) {
        const card = document.createElement("div"); card.className = "sca-card";
        const head = document.createElement("div"); head.className = "sca-head";
        head.innerHTML = `<div class="sca-title">Stage</div>`;
        const body = document.createElement("div"); body.className = "sca-body";

        const pills = [
            { key: "mvp", text: "Stage 1：MVP（存活期）" },
            { key: "assistant", text: "MVP 交易及上架助手" }
        ];
        const wrap = document.createElement("div");
        pills.forEach(p => {
            const b = document.createElement("span");
            b.className = "sca-pill" + (stage === p.key ? " active" : "");
            b.textContent = p.text;
            b.onclick = () => {
                document.querySelectorAll(".sca-pill").forEach(x => x.classList.remove("active"));
                b.classList.add("active");
                // 切換僅改助手文案（CRUD 是同一頁）
                const t = document.getElementById("sca-assist-title");
                const s = document.getElementById("sca-assist-sub");
                if (t && s) {
                    if (p.key === "mvp") {
                        t.textContent = "MVP 關鍵行動建議";
                        s.textContent = "先把商品上架、價格/庫存填好，能賣就好！其餘延後。";
                    } else {
                        t.textContent = "上架助手（AI 建議位）";
                        s.textContent = "幫你把標題、規格、圖說、生圖素材都一次就緒。";
                    }
                }
            };
            wrap.appendChild(b);
        });
        head.appendChild(wrap);
        card.appendChild(head);
        card.appendChild(body);
        return card;
    }

    /* -------------------- Assistant block -------------------- */
    static _assistant(stage) {
        const card = document.createElement("div"); card.className = "sca-card";
        const head = document.createElement("div"); head.className = "sca-head";
        head.innerHTML = `<div class="sca-title" id="sca-assist-title">${stage === "mvp" ? "MVP 關鍵行動建議" : "上架助手（AI 建議位）"}</div>`;
        const body = document.createElement("div"); body.className = "sca-body";
        body.innerHTML = `
      <div id="sca-assist-sub" class="text-secondary mb-2">${stage === "mvp" ? "先把商品上架、價格/庫存填好，能賣就好！其餘延後。" : "幫你把標題、規格、圖說、生圖素材都一次就緒。"}</div>
      <div class="sca-grid">
        ${[
                { t: "分類/屬性建議", d: "根據商品名自動推薦分類與屬性欄位" },
                { t: "標題優化", d: "自動補齊關鍵字（勿堆疊），長度 20~28 字" },
                { t: "圖像壓縮/浮水印", d: "前端壓縮、保清晰；可選加浮水印" },
                { t: "定價基準", d: "參考同類均價與平台抽成，給出起始價" },
                { t: "TinyMCE 規格模板", d: "一鍵插入規格/FAQ 表格（支援多語）" },
                { t: "素材生成", d: "產出首圖/短片分鏡（日後接 Stable Diffusion）" }
            ].map(x => `<div class="sca-assist"><div class="fw-bold mb-1">${x.t}</div><div class="text-secondary">${x.d}</div></div>`).join("")}
      </div>
    `;
        card.appendChild(head); card.appendChild(body);
        return card;
    }

    /* -------------------- CRUD block -------------------- */
    static _crud() {
        const card = document.createElement("div"); card.className = "sca-card";
        const head = document.createElement("div"); head.className = "sca-head";
        head.innerHTML = `<div class="sca-title">Seller CRUD（商品清單 / 快速編輯）</div>`;
        const right = document.createElement("div");
        const btnAdd = document.createElement("button"); btnAdd.className = "btn btn-dark btn-sm"; btnAdd.innerHTML = `<i class="bi bi-plus-lg"></i> 新增商品`;
        btnAdd.onclick = () => this._openModal();
        right.appendChild(btnAdd); head.appendChild(right);

        const body = document.createElement("div"); body.className = "sca-body";
        body.innerHTML = `
      <div class="mb-2">
        <input type="text" id="sca-q" class="form-control" placeholder="搜尋商品名稱…" />
      </div>
      <div class="table-responsive">
        <table class="sca-table">
          <thead><tr><th style="width:60px">ID</th><th>名稱</th><th style="width:120px">售價</th><th style="width:100px">庫存</th><th style="width:120px">操作</th></tr></thead>
          <tbody id="sca-tbody"><tr><td colspan="5" class="sca-empty">載入中…</td></tr></tbody>
        </table>
      </div>
    `;

        // Modal 容器
        const modal = document.createElement("div"); modal.className = "sca-modal"; modal.id = "sca-modal";
        modal.innerHTML = `<div class="inner"><div id="sca-modal-body"></div></div>`;

        const wrap = document.createElement("div");
        wrap.appendChild(head); wrap.appendChild(body); wrap.appendChild(modal);
        return wrap;
    }

    /* -------------------- Data Ops -------------------- */
    static async _loadList(root) {
        const q = (root.querySelector("#sca-q")?.value || "").trim();
        const url = `/Customer/Api/SellerCrud/List${q ? `?q=${encodeURIComponent(q)}` : ""}`;
        const tbody = root.querySelector("#sca-tbody");
        try {
            const res = await fetch(url, { credentials: "include" });
            if (!res.ok) throw new Error(await res.text());
            const list = await res.json();
            if (list.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="sca-empty">目前沒有商品</td></tr>`;
            } else {
                tbody.innerHTML = list.map(x => `
          <tr>
            <td>${x.id}</td>
            <td>${this._escape(x.name)}</td>
            <td><input type="number" min="0" step="1" value="${x.price}" class="form-control form-control-sm" data-id="${x.id}" data-f="price" /></td>
            <td><input type="number" min="0" step="1" value="${x.stock}" class="form-control form-control-sm" data-id="${x.id}" data-f="stock" /></td>
            <td>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" data-edit="${x.id}"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-outline-danger" data-del="${x.id}"><i class="bi bi-trash"></i></button>
              </div>
            </td>
          </tr>
        `).join("");
                // 綁定事件
                tbody.querySelectorAll("input[data-id]").forEach(inp => {
                    inp.addEventListener("change", async (e) => {
                        const id = Number(inp.dataset.id), f = inp.dataset.f;
                        const val = Number(inp.value);
                        await this._upsert({ id, [f]: val });
                    });
                });
                tbody.querySelectorAll("button[data-edit]").forEach(b => b.onclick = () => this._openModal(Number(b.dataset.edit)));
                tbody.querySelectorAll("button[data-del]").forEach(b => b.onclick = () => this._del(Number(b.dataset.del)));
            }
            // 搜尋事件（只綁一次）
            const box = root.querySelector("#sca-q");
            if (box && !box.__bind) {
                box.__bind = true;
                box.addEventListener("input", () => this._loadList(root));
            }
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-danger">載入失敗：${this._escape(err.message || String(err))}</td></tr>`;
        }
    }

    static async _upsert(model) {
        const res = await fetch("/Customer/Api/SellerCrud/Upsert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(model)
        });
        if (!res.ok) { alert("儲存失敗：" + await res.text()); return; }
    }

    static async _del(id) {
        if (!confirm("確定刪除？")) return;
        const res = await fetch(`/Customer/Api/SellerCrud/Delete/${id}`, { method: "DELETE", credentials: "include" });
        if (!res.ok) { alert("刪除失敗：" + await res.text()); return; }
        // 重新整理清單
        const root = document.querySelector(".sca-root");
        this._loadList(root);
    }

    /* -------------------- Modal (Create/Edit) -------------------- */
    static async _openModal(id) {
        const modal = document.getElementById("sca-modal");
        const body = document.getElementById("sca-modal-body");
        // 載入資料
        let model = { id: 0, name: "", price: 0, stock: 0, category: "", image: "", desc: "" };
        if (id) {
            const res = await fetch(`/Customer/Api/SellerCrud/Get/${id}`, { credentials: "include" });
            if (res.ok) model = await res.json();
        }
        // 用既有的 SellerProductCreate 元件渲染表單
        body.innerHTML = `<div id="spc-app"></div>`;
        SellerProductCreate.render("spc-app", { categories: ["3C", "運動", "服飾", "戶外", "玩具", "美妝"] });

        // 將舊值填入
        setTimeout(() => {
            const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.value = val ?? ""; };
            set("#Name", model.name);
            set("#Price", model.price);
            set("#Stock", model.stock);
            set("#Category", model.category);
            set("#Desc", model.desc);
            if (model.image) { const img = document.getElementById("Preview"); if (img) img.src = model.image; }
            // 改寫 form submit 為呼叫 API
            const form = document.getElementById("spc-form");
            if (form && !form.__bind) {
                form.__bind = true;
                form.onsubmit = async (e) => {
                    e.preventDefault();
                    const payload = {
                        id: model.id || 0,
                        name: document.getElementById("Name").value.trim(),
                        price: Number(document.getElementById("Price").value || 0),
                        stock: Number(document.getElementById("Stock").value || 0),
                        category: document.getElementById("Category").value.trim(),
                        image: document.getElementById("Preview").getAttribute("src") || "",
                        desc: document.getElementById("Desc").value.trim()
                    };
                    const ok = await SellerCenterApp._save(payload);
                    if (ok) { modal.style.display = "none"; SellerCenterApp._loadList(document.querySelector(".sca-root")); }
                };
            }
        }, 0);

        modal.style.display = "flex";
        modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
    }

    static async _save(payload) {
        if (!payload.name) { alert("請輸入商品名稱"); return false; }
        const res = await fetch("/Customer/Api/SellerCrud/Upsert", {
            method: "POST", headers: { "Content-Type": "application/json" },
            credentials: "include", body: JSON.stringify(payload)
        });
        if (!res.ok) { alert("儲存失敗：" + await res.text()); return false; }
        return true;
    }

    /* -------------------- Utils -------------------- */
    static _escape(s) { return String(s ?? "").replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
}
// 對外
window.SellerCenterApp = SellerCenterApp;