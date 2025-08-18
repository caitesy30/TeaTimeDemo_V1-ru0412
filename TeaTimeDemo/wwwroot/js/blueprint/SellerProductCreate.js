// ==========================
// SellerProductCreate.js
// 商品上架表單（純 JS 生成）
// ==========================
class SellerProductCreate {
    static render(containerId, { categories = [] } = {}) {
        const el = document.getElementById(containerId);
        if (!el) return;

        el.innerHTML = `
      <style>
        .spc-card{border:1px solid #e5e7eb;border-radius:16px;padding:16px;background:#fff}
        .spc-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        @media(max-width:992px){.spc-row{grid-template-columns:1fr}}
        .spc-img{width:100%;max-width:220px;aspect-ratio:1/1;object-fit:cover;border:1px dashed #cbd5e1;border-radius:12px}
        .spc-hint{color:#64748b;font-size:12px}
      </style>
      <form method="post" action="/Customer/Seller/ProductCreateSubmit" enctype="multipart/form-data" class="spc-card">
        <div class="spc-row">
          <div>
            <label class="form-label fw-bold">商品名稱</label>
            <input type="text" class="form-control" name="Name" id="Name" required />
          </div>
          <div>
            <label class="form-label fw-bold">分類</label>
            <select class="form-select" name="Category" id="Category" required></select>
          </div>
        </div>

        <div class="spc-row mt-2">
          <div>
            <label class="form-label fw-bold">售價（Coins）</label>
            <input type="number" min="0" step="1" class="form-control" name="Price" id="Price" required />
          </div>
          <div>
            <label class="form-label fw-bold">庫存</label>
            <input type="number" min="0" step="1" class="form-control" name="Stock" id="Stock" required />
          </div>
        </div>

        <div class="mt-3">
          <label class="form-label fw-bold">主圖</label>
          <div class="d-flex align-items-center gap-3">
            <img id="Preview" class="spc-img" src="https://placehold.co/220x220?text=Preview" alt="preview">
            <div>
              <input type="file" class="form-control" name="ImageFile" id="ImageFile" accept="image/*" />
              <div class="spc-hint mt-2">建議 1200×900，jpg/png，小於 1MB。上傳後自動壓縮（TODO）</div>
            </div>
          </div>
        </div>

        <div class="mt-3">
          <label class="form-label fw-bold">商品描述</label>
          <textarea id="Desc" name="Desc" class="form-control" rows="6" placeholder="支援 TinyMCE（TODO：初始化）"></textarea>
        </div>

        <div class="mt-4 d-flex gap-2">
          <button type="submit" class="btn btn-dark"><i class="bi bi-cloud-arrow-up"></i> 送出上架</button>
          <button type="button" class="btn btn-outline-secondary" id="btnDraft"><i class="bi bi-save2"></i> 存草稿</button>
        </div>
      </form>
    `;

        // 填入分類
        const sel = el.querySelector('#Category');
        categories.forEach(c => {
            const op = document.createElement('option');
            op.value = c; op.textContent = c; sel.appendChild(op);
        });

        // 預覽圖片
        const file = el.querySelector('#ImageFile');
        const preview = el.querySelector('#Preview');
        file?.addEventListener('change', () => {
            const f = file.files?.[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = e => { preview.src = e.target.result; };
            reader.readAsDataURL(f);
        });

        // TODO: 初始化 TinyMCE（之後改成載本地 js/tinymce/tinymce.min.js）
        // tinymce.init({ selector:'#Desc', ... });

        // 存草稿（前端驗證）
        el.querySelector('#btnDraft').onclick = () => {
            const name = el.querySelector('#Name').value.trim();
            if (!name) { alert('請先填商品名稱'); return; }
            alert('（DEMO）已暫存草稿。下一步：呼叫 /api/seller/draft');
        };
    }
}
