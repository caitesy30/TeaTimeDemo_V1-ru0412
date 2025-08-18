// wwwroot/js/blueprint/StoreHome.js
(function () {
    // ------- 小工具 -------
    const h = (html) => {
        const d = document.createElement("div");
        d.innerHTML = html.trim();
        return d.firstElementChild;
    };
    const css = `
  <style>
    .sh-wrap{display:flex;flex-direction:column;gap:16px}
    .sh-card{border:1px solid #e5e7eb;border-radius:16px;background:#fff;box-shadow:0 6px 18px rgba(0,0,0,.06)}
    .sh-card .hd{padding:14px 16px;border-bottom:1px solid #e5e7eb;font-weight:800}
    .sh-card .bd{padding:16px}
    .sh-hero{position:relative;border-radius:16px;background:linear-gradient(135deg,#ecfeff,#eef2ff);padding:24px 20px;overflow:hidden;border:1px solid #e5e7eb}
    .sh-hero h3{font-weight:800;letter-spacing:.3px;margin:0 0 6px}
    .sh-hero p{color:#475569;margin:0}
    .sh-badge{display:inline-flex;align-items:center;gap:6px;background:#fff;border:1px solid #e2e8f0;border-radius:999px;padding:6px 10px;font-size:12px;margin-top:10px}
    .sh-chips{display:flex;gap:10px;flex-wrap:wrap}
    .sh-chip{border:1px solid #e5e7eb;border-radius:999px;padding:6px 12px;background:#fff;cursor:pointer;font-size:14px}
    .sh-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:16px}
    @media(max-width:1200px){.sh-grid{grid-template-columns:repeat(4,1fr)}}
    @media(max-width:992px){.sh-grid{grid-template-columns:repeat(3,1fr)}}
    @media(max-width:768px){.sh-grid{grid-template-columns:repeat(2,1fr)}}
    .sh-pcard{border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;background:#fff;display:flex;flex-direction:column}
    .sh-img{width:100%;aspect-ratio:4/3;object-fit:cover}
    .sh-body{padding:12px}
    .sh-name{font-weight:700;margin:0 0 6px}
    .sh-seller{font-size:12px;color:#64748b;margin-bottom:6px}
    .sh-price{font-weight:800}
    .sh-add{margin-top:auto;border:1px solid #111827;background:#111827;color:#fff;border-radius:10px;padding:8px 10px;width:100%}
    .sh-fab{position:fixed;right:20px;bottom:24px;background:#111827;color:#fff;border:none;border-radius:999px;padding:12px 16px;box-shadow:0 10px 25px rgba(0,0,0,.18);display:flex;align-items:center;gap:10px;z-index:999}
    .sh-fab .qty{background:#fff;color:#111827;border-radius:999px;padding:2px 8px;font-weight:800}
  </style>`;

    // 預設資料
    const DEFAULT_PRODUCTS = [
        { id: 1, name: "無線藍牙耳機", price: 1290, img: "https://picsum.photos/seed/p1/400/300", seller: "音控小舖" },
        { id: 2, name: "雙人保暖被", price: 980, img: "https://picsum.photos/seed/p2/400/300", seller: "溫暖家居" },
        { id: 3, name: "極細眼線液", price: 299, img: "https://picsum.photos/seed/p3/400/300", seller: "美妝研究社" },
        { id: 4, name: "機能運動衣", price: 690, img: "https://picsum.photos/seed/p4/400/300", seller: "UP SPORT" },
        { id: 5, name: "迷你積木組", price: 450, img: "https://picsum.photos/seed/p5/400/300", seller: "玩具共和國" },
        { id: 6, name: "休閒露營椅", price: 1150, img: "https://picsum.photos/seed/p6/400/300", seller: "戶外玩家" },
    ];

    // 預設佈局（想換就傳 layout 進來覆蓋）
    const DEFAULT_LAYOUT = [
        { type: "hero" },
        { type: "quickEntries" },       // 樂高入口：食/衣/住/行/育/樂
        { type: "recommendGrid" },      // 商品格狀
        { type: "liveBlock" },          // 直播/短劇
        { type: "impactBoard" },        // 影響力看板
        { type: "myModules" },          // 我的模組
        { type: "floatingCart" }        // 右下角購物車
    ];

    // 佈局正規化：不論你傳什麼，都還原成陣列
    function normalizeLayout(layout) {
        if (!layout) return DEFAULT_LAYOUT.slice();
        if (Array.isArray(layout)) return layout;
        if (Array.isArray(layout?.sections)) return layout.sections;
        if (typeof layout === "object") return Object.values(layout);
        return DEFAULT_LAYOUT.slice();
    }

    // ------- 各區塊 renderer -------
    const renderers = {
        hero(root, ctx) {
            const username = ctx.username ? `，${ctx.username}` : "";
            root.appendChild(h(`
        <div class="sh-hero">
          <h3>嗨${username}！歡迎來到商城</h3>
          <p>用你的 Coins 直接結帳，安全託管 Escrow，買得更安心～</p>
          <div class="sh-badge"><i class="bi bi-coin"></i><span>目前餘額</span><b>${ctx.coinBalance}</b> Coins</div>
        </div>
      `));
        },

        quickEntries(root) {
            const box = h(`<div class="sh-card"><div class="hd">🧱 六大入口（樂高模組）</div><div class="bd"><div class="sh-chips"></div></div></div>`);
            const chips = box.querySelector(".sh-chips");
            [
                ["食｜餐券 / 外送", "/Food"],
                ["衣｜二手 / 改衣", "/Wear"],
                ["住｜社區 / 互助", "/Live"],
                ["行｜旅遊 / 出行", "/Move"],
                ["育｜英文學校", "/Edu/English"],
                ["育｜中文學校", "/Edu/Chinese"],
                ["樂｜Roblox 創作", "/Play/Roblox"],
                ["樂｜NFT 市集", "/NFT"],
            ].forEach(([txt, url]) => {
                const b = h(`<button class="sh-chip">${txt}</button>`);
                b.onclick = () => location.href = url;
                chips.appendChild(b);
            });
            root.appendChild(box);
        },

        recommendGrid(root, ctx) {
            const box = h(`<div class="sh-card"><div class="hd">⚡ 首屏推薦</div><div class="bd"><div class="sh-grid" id="sh-grid"></div></div></div>`);
            const grid = box.querySelector("#sh-grid");
            ctx.products.forEach(p => {
                const card = h(`
          <div class="sh-pcard">
            <img class="sh-img" src="${p.img}" alt="${p.name}">
            <div class="sh-body">
              <h6 class="sh-name">${p.name}</h6>
              <div class="sh-seller"><i class="bi bi-shop"></i> ${p.seller}</div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="sh-price">${p.price} <small>Coins</small></div>
                <button class="sh-add"><i class="bi bi-plus-lg"></i> 加入</button>
              </div>
            </div>
          </div>
        `);
                card.querySelector(".sh-add").onclick = () => {
                    ctx.cartQty++; ctx.updateCartQty();
                    // TODO: 呼叫 /Customer/Cart/Add?productId=${p.id}
                };
                grid.appendChild(card);
            });
            root.appendChild(box);
        },

        liveBlock(root) {
            root.appendChild(h(`
        <div class="sh-card">
          <div class="hd">🎥 直播 / 短劇推薦</div>
          <div class="bd">（示意）3 個直播卡片…</div>
        </div>
      `));
        },

        impactBoard(root) {
            root.appendChild(h(`
        <div class="sh-card">
          <div class="hd">❤️ 影響力看板</div>
          <div class="bd">
            <div>公益達成率：72%</div>
            <div>本週送餐：128 份</div>
            <div>任務完成：46 小時</div>
          </div>
        </div>
      `));
        },

        myModules(root) {
            root.appendChild(h(`
        <div class="sh-card">
          <div class="hd">🧩 我的模組</div>
          <div class="bd">
            <div class="sh-chips">
              <div class="sh-chip">商城比價</div>
              <div class="sh-chip">二手市集</div>
              <div class="sh-chip">時間銀行</div>
              <div class="sh-chip">Roblox</div>
            </div>
          </div>
        </div>
      `));
        },

        floatingCart(root, ctx) {
            const btn = h(`<button class="sh-fab"><i class="bi bi-cart"></i> 購物車 <span class="qty">0</span></button>`);
            btn.onclick = () => location.href = "/Customer/Cart/Index";
            ctx.updateCartQty = () => { btn.querySelector(".qty").textContent = String(ctx.cartQty); };
            ctx.updateCartQty();
            root.appendChild(btn);
        }
    };

    // ------- 入口 -------
    class StoreHome {
        static render(containerId, opts = {}) {
            const el = document.getElementById(containerId);
            if (!el) return console.warn("[StoreHome] container not found:", containerId);

            // 狀態 & 預設
            const ctx = {
                coinBalance: Number.isFinite(opts.coinBalance) ? opts.coinBalance : 0,
                username: (opts.username && String(opts.username).trim()) || "訪客",
                products: Array.isArray(opts.products) ? opts.products : DEFAULT_PRODUCTS,
                cartQty: 0,
                updateCartQty: () => { }
            };

            // 佈局正規化（這裡就是避免你遇到的 forEach 錯誤）
            const sections = normalizeLayout(opts.layout);

            el.innerHTML = css + `<div class="sh-wrap"></div>`;
            const root = el.querySelector(".sh-wrap");

            // 逐段渲染（未知 type 會被忽略，但不會噴錯）
            sections.forEach(sec => {
                const type = (sec && sec.type) || String(sec || "").trim();
                const renderer = renderers[type];
                if (typeof renderer === "function") renderer(root, ctx, sec);
            });
        }
    }
    window.StoreHome = StoreHome;
})();
