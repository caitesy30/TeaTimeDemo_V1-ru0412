// ======================================================
// ExportKit.js  —  圖片 / PDF 匯出小工具（Class + static）
// 依賴：僅在需要 PDF 時動態載入 jsPDF（UMD）
// ======================================================
class ExportKit {
    static _jspdf = null; // window.jspdf.jsPDF

    static async ensureJsPDF() {
        if (this._jspdf) return this._jspdf;
        const url = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
        await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = url; s.async = true;
            s.onload = resolve; s.onerror = () => reject(new Error("jsPDF 載入失敗"));
            document.head.appendChild(s);
        });
        const jspdfNS = window.jspdf || window.jspdf_default || window.jspdf_umd || {};
        this._jspdf = jspdfNS.jsPDF || window.jsPDF;
        if (!this._jspdf) throw new Error("找不到 jsPDF 物件");
        return this._jspdf;
    }

    // 將 SVG 轉成 PNG（Canvas）
    static svgToPngCanvas(svgEl, scale = 2) {
        const vb = svgEl.viewBox.baseVal;
        const w = (vb && vb.width) ? vb.width : svgEl.clientWidth || 1200;
        const h = (vb && vb.height) ? vb.height : svgEl.clientHeight || 600;
        const svgStr = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.floor(w * scale));
                canvas.height = Math.max(1, Math.floor(h * scale));
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                URL.revokeObjectURL(url);
                resolve(canvas);
            };
            img.src = url;
        });
    }

    static async downloadPngFromSvg(svgEl, filename = "blueprint.png") {
        const canvas = await this.svgToPngCanvas(svgEl, 2);
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = filename;
        a.click();
    }

    static async downloadPdfFromSvg(svgEl, filename = "blueprint.pdf") {
        const jsPDF = await this.ensureJsPDF();
        const canvas = await this.svgToPngCanvas(svgEl, 2);
        const imgData = canvas.toDataURL("image/png");

        const w = canvas.width, h = canvas.height;
        const landscape = w > h;
        const pdf = new jsPDF({ orientation: landscape ? "landscape" : "portrait", unit: "pt", format: [w, h] });
        pdf.addImage(imgData, "PNG", 0, 0, w, h);
        pdf.save(filename);
    }
}
