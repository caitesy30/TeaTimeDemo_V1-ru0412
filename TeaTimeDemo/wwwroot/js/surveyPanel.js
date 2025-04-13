
//TODO: 合併取消、表格調整更新、UNDO
window.onload = function () {
    let ModuleId = 0;
    floating.init();
    // 初始化按鈕位置
    floating.updateButtonPosition();

    // 當視窗大小改變時更新按鈕位置
    window.addEventListener('resize', floating.updateButtonPosition);

    //initLabelTextClick();
    // 初始化 Tooltip
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl); // 启用 Tooltip
    });

    // 初始化 Offcanvas
    var offcanvasElement = document.getElementById('imageUploadCanvas');
    var offcanvas = new bootstrap.Offcanvas(offcanvasElement); // 初始化 Offcanvas

    // 获取 Tooltip 实例
    var imageButton = document.getElementById('imageButton');
    var tooltip = new bootstrap.Tooltip(imageButton); // 初始化 Tooltip 实例

    // 为按钮添加自定义事件来触发 Tooltip 和 Offcanvas
    imageButton.addEventListener('mouseenter', function () {
        tooltip.show();  // 显示 Tooltip
    });

    // 监听鼠标离开时隐藏 Tooltip
    imageButton.addEventListener('mouseleave', function () {
        tooltip.hide();  // 隐藏 Tooltip
    });

    // 监听 Offcanvas 关闭时，隐藏 Tooltip
    offcanvasElement.addEventListener('hidden.bs.offcanvas', function () {
        //console.log("關閉");
        
        setTimeout(function () {
            tooltip.hide();  // 延迟隐藏 Tooltip，确保关闭时完全清除提示
        }, 10); // 延迟 100 毫秒以确保 Tooltip 被移除
    });

    // 显示 Offcanvas
    imageButton.addEventListener('click', function () {
        offcanvas.show();
    });

    
    document.getElementById('imageFile').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
            const reader = new FileReader();
            reader.onload = function (e) {
                const imagePreview = document.getElementById('imagePreview');
                imagePreview.innerHTML = `<img src="${e.target.result}" id="previewImage" style="max-width: 100%; height: auto;">`;
            };
            reader.readAsDataURL(file);
        
    });

    document.getElementById('addImageButton').addEventListener('click', function () {
        const previewImage = document.getElementById('previewImage');
        if (previewImage) {
            const moduleBlockId = ModuleBlock_Main.SelectTargetID; // 獲取當前模塊 ID
            //addImageToModuleBlock(moduleBlockId, previewImage.src);
            block.addNewBlockAddImg(previewImage.src)
        }
        // 關閉畫布
        offcanvas.hide();
    });

    //window.addEventListener('load', toolArea.checkWidth);

    //checkImgblockMgr.init();
    block.init();

    const helper = new CrosshairHelper();

    Table.init();
}


class Crosshair {

    constructor(direction, position, offsetParent) {
        this.direction = direction;
        this.isDragging = false;
        this.isSelected = false;
        this.offsetParent = offsetParent;
        

        this.line = document.createElement('div');
        this.line.className = `crosshair-line ${direction}-line`;
        this.initStyle(position);

        // 綁定事件
        this.line.addEventListener('mousedown', this.handleMouseDown.bind(this));
    }

    initStyle(position) {
        this.line.style.position = 'absolute';
        this.line.style.zIndex = '9999';
        this.line.style.backgroundColor = 'transparent';
        this.line.style.cursor = this.direction === 'horizontal' ? 'row-resize' : 'col-resize';

        if (this.direction === 'horizontal') {
            this.line.style.height = '1px';
            this.line.style.width = '186%';
            this.line.style.borderTop = '1px solid rgba(255, 0, 255, 1)';
            this.line.style.top = `${position}px`;
            this.line.style.left = '-50%';
        } else {
            this.line.style.width = '1px';
            this.line.style.height = '100%';
            this.line.style.borderLeft = '1px solid rgba(255, 0, 255, 1)'; 
            this.line.style.left = `${position}px`;
            this.line.style.top = '0';
        }
    }

    handleMouseDown(event) {
        this.isDragging = true;
        this.isSelected = true;

        if (this.offsetParent.crosshairHelper) {
            this.offsetParent.crosshairHelper.setSelectedLine(this);
        }
        this.line.classList.add('selected');

        // 全局綁定拖曳事件
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        event.preventDefault(); 
    }

    handleMouseMove(event) {
        if (this.isDragging) {
            // 計算相對於父容器的位置
            const parentRect = this.offsetParent.getBoundingClientRect();

            if (this.direction === 'horizontal') {
                const y = event.clientY - parentRect.top; // 相對於父容器的 Y 軸位置
                this.line.style.top = `${y}px`;
            } else {
                const x = event.clientX - parentRect.left; // 相對於父容器的 X 軸位置
                this.line.style.left = `${x}px`;
            }
        }
    }

    handleMouseUp() {
        this.isDragging = false;
        //this.line.classList.remove('selected');

        // 移除全局事件
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    
    }

    remove() {
        this.line.remove();
    }             
}


class CrosshairHelper {
    constructor() {
        this.lines = [];
        this.selectedLine = null;
        this.container = document.getElementById('AutoScreenBlock');
        this.container.crosshairHelper = this;
        // 綁定快捷鍵
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        document.addEventListener('mousemove', this.updateMousePosition.bind(this));
        this.mouseX = 0;
        this.mouseY = 0;
    }


    setSelectedLine(line) {
        // 移除其他輔助線的選中狀態
        this.lines.forEach((l) => {
            if (l !== line) {
                l.isSelected = false;
                l.line.classList.remove('selected');
            }
        });

        // 設置新的選中輔助線
        this.selectedLine = line;
        line.isSelected = true;
        line.line.classList.add('selected');
    }

    updateMousePosition(event) {
        const parentRect = this.container.getBoundingClientRect();

        // 計算相對於父容器的滑鼠位置
        this.mouseX = event.clientX - parentRect.left;
        this.mouseY = event.clientY - parentRect.top;
    }

    addLine(direction) {
        const position = direction === 'horizontal' ? this.mouseY : this.mouseX;
        const line = new Crosshair(direction, position, this.container);
        this.container.appendChild(line.line);

        // 設置為當前選中的輔助線
        this.lines.push(line);
        this.setSelectedLine(line);
    }

    deleteSelectedLine() {
        if (this.selectedLine) {
            this.selectedLine.remove();
            this.lines = this.lines.filter((line) => line !== this.selectedLine);
            this.selectedLine = null;
        }
    }

    handleKeydown(event) {
        if (event.key === ']') {
            this.addLine('horizontal');
        } else if (event.key === '[') {
            this.addLine('vertical');
        } else if (event.key === 'Delete') {
            this.deleteSelectedLine(); 
        }
    }
}


class tblResize {

    constructor(table) {
        if (!table) return;
        this.table = table;
        this.ratio = AutoScreen_js.RealscaleRatio;
        this.rows = Array.from(this.table.querySelectorAll(':scope > tr, :scope >tbody > tr'));
        this.columnsCount = this.rows[0]?.cells.length || 0;
        this.isResizing = false;
        this.cols = [];

        //初始比例
        this.columnRatios = Array(this.columnsCount).fill(1 / this.columnsCount);
        this.rowRatios = Array(this.rows.length).fill(1 / this.rows.length);


        //初始表格變數
        this.startX = 0;
        this.startY = 0;
        this.startHeight = 0;
        this.resizingType = null;
        this.resizingIndex = null;
        this.startRatios = [];

        //啟用狀態
        this.enabled = false;
    }

    initializeRatios() {
        const totalWidth = this.table.offsetWidth;
        const totalHeight = this.table.offsetHeight;
        this.createColgroup();

        this.columnRatios = Array.from(this.cols).map(col => {
            // 優先從 style.width 取得數值，並確保是有效的數字
            let width = parseFloat(col.style.width);
            if (isNaN(width) || width === 0) {
                // 如果 style.width 沒有或為 0，則使用 offsetWidth
                width = col.offsetWidth;
            } else {
                // 如果是百分比，轉為像素
                width = (width / 100) * totalWidth;
            }
            return width / totalWidth;
        });

        // 確保比例加總為 1，避免因浮點誤差導致比例異常
        const totalRatio = this.columnRatios.reduce((sum, ratio) => sum + ratio, 0);
        this.columnRatios = this.columnRatios.map(ratio => ratio / totalRatio);

        this.rowRatios = Array.from(this.rows).map(row => row.offsetHeight / totalHeight);
    }
    createColgroup() {

        let colgroup = this.table.querySelector('colgroup');
        if (!colgroup) {
            colgroup = document.createElement('colgroup');
            const firstRow = this.rows[0];

            let colIndex = 0;
            Array.from(firstRow.cells).forEach(cell => {
                const col = document.createElement('col');
                col.style.width = `${(this.columnRatios[colIndex]) *100}%`;
                colgroup.appendChild(col);
                colIndex++;
            });

            this.table.insertBefore(colgroup, this.table.firstChild);
        }
        
        this.cols = colgroup.children;
    }

    resizeHandler = (e) => {
        if (!this.isResizing || !this.table) return;
        AutoScreen_js.resetAutoScreenBlockSize();
        //const minHeight = 25;
        const totalWidth = this.table.offsetWidth;
        const deltaX = (e.clientX - this.startX) / this.ratio;
        let deltaRatio = deltaX / totalWidth;
        const minWidthRatio = 25 / totalWidth;

        //const deltaY = this.startY - e.clientY;
        if (this.resizingType === 'column') {
            const currentStartRatio = this.startRatios[this.resizingIndex];
            const nextStartRatio = this.startRatios[this.resizingIndex + 1];

            // 計算新的比例
            let newCurrentRatio = currentStartRatio + deltaRatio;
            let newNextRatio = nextStartRatio - deltaRatio;

            // 如果新比例小於最小寬度，調整 deltaRatio
            if (newCurrentRatio < minWidthRatio) {
                deltaRatio = minWidthRatio - currentStartRatio;
                newCurrentRatio = minWidthRatio;
                newNextRatio = nextStartRatio - deltaRatio;
            }

            if (newNextRatio < minWidthRatio) {
                deltaRatio = nextStartRatio - minWidthRatio;
                newNextRatio = minWidthRatio;
                newCurrentRatio = currentStartRatio + deltaRatio;
            }

            // 更新比例
            this.columnRatios[this.resizingIndex] = newCurrentRatio;
            if (this.resizingIndex < this.columnsCount - 1) {
                this.columnRatios[this.resizingIndex + 1] = newNextRatio;
                this.cols[this.resizingIndex + 1].style.width = `${newNextRatio * 100}%`;
            }
            

            // 更新寬度
            this.cols[this.resizingIndex].style.width = `${newCurrentRatio * 100}%`;
            

            // 更新每個單元格寬度，考慮 colspan
            //this.rows.forEach(row => {
            //    let colIndex = 0;
            //    Array.from(row.cells).forEach(cell => {
            //        if (cell.tagName === 'TD') {
            //            const colspan = parseInt(cell.getAttribute('colspan')) || 1;
            //            let totalWidth = 0;

            //            // 計算該單元格實際覆蓋的寬度
            //            for (let i = 0; i < colspan; i++) {
            //                totalWidth += (this.columnRatios[colIndex + i] || 0);
            //            }

            //            // 設定寬度
            //            cell.style.width = `${totalWidth * 100}%`;
            //            colIndex += colspan;
            //        }
            //    });
            //});
        } else if (this.resizingType === 'row') {
            const deltaY = (e.clientY - this.startY )/ this.ratio;; // **修正方向**
            const minHeight = 25;

            const currentRow = this.rows[this.resizingIndex];
            const nextRow = this.rows[this.resizingIndex + 1] || null; // 避免 undefined

            const currentStartHeight = this.startHeights[this.resizingIndex];
            const nextStartHeight = nextRow ? this.startHeights[this.resizingIndex + 1] : 0;

            let newCurrentHeight = currentStartHeight + deltaY; // **當前行變高**
            let newNextHeight = nextStartHeight - deltaY; // **下一行變矮**

            //let newCurrentHeight = currentStartHeight + deltaY; // **改為增加高度**

            if (newCurrentHeight < minHeight ) {
                newCurrentHeight = 25;
                return;
            }

            currentRow.style.height = `${newCurrentHeight}px`;

            if (nextRow) {
                //let newNextHeight = nextStartHeight - deltaY; // **下一行相應縮小**

                if (newNextHeight < minHeight) {
                    const diff = minHeight - newNextHeight;
                    newNextHeight = minHeight;
                    newCurrentHeight -= diff; // 調整當前行的高度
                }

                //nextRow.style.height = `${newNextHeight}px`;
            }
            // 吸附邏輯
            //const snapThreshold = 10; // 吸附閾值（像素）
            //const crosshairLines = document.querySelectorAll('.horizontal-line'); // 查找輔助線
            //let snapped = false;

            //crosshairLines.forEach(line => {
            //    const lineRect = line.getBoundingClientRect();
            //    const lineRelativeTop = lineRect.top - gridTop; // 輔助線相對於 tableGrid 的高度

            //    // 計算當前行的頂部位置，基於 tableGrid 的高度
            //    const rowOffsetTop = this.rows[this.resizingIndex].getBoundingClientRect().bottom;
            //    console.log('表格下高：' + rowOffsetTop);
            //    const rowCurrentTop = rowOffsetTop - gridTop + deltaY;
            //    console.log('輔助線高度：' + lineRelativeTop);
            //    console.log('表格高度：' + rowCurrentTop);
            //    // 判斷行是否接近輔助線
            //    if (Math.abs(lineRelativeTop - rowCurrentTop) <= snapThreshold) {
            //        // 吸附到輔助線
            //        const newSnappedHeight = lineRelativeTop;
            //        this.rows[this.resizingIndex].style.height = `${newSnappedHeight}px`;
            //        snapped = true;
            //    }
            //});

            //if (!snapped) {
                // 未吸附則直接應用拖曳的新高度
                
            //}
        
        }
    };


    enable() {
        if (this.enabled) return;
        this.enabled = true;
        this.initializeRatios();
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mousedown', this.handleMouseDown);
    }

    disable() {
        if (!this.enabled) return;
        this.enabled = false;
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mousedown', this.handleMouseDown);
    }

    stopResize = (e) => {
        //if (!e || !e.target) return;
        //const currentTbl = e.target.closest('.tableGrid');
        //if (!this.isResizing) return;
        //this.isResizing = false;
        //this.table = null;
        this.isResizing = false;
        
        document.removeEventListener('mousemove', this.resizeHandler);
        document.removeEventListener('mouseup', this.stopResize);
        if (this.table) {
            this.table.style.cursor = 'default';

        }
        this.startRatios = [...this.columnRatios];

        //this.table = null;
    }

    handleMouseMove = (e) => {
        if (this.isResizing) return;

        const cell = e.target.closest('td, th');
        if (!cell || cell.closest('table') !== this.table) {
            if (!this.isResizing) this.table.style.cursor = 'default';
            this.resizingType = null;
            this.resizingIndex = null;
            return;
        }

        const rect = cell.getBoundingClientRect();
        const offsetX = e.clientX - rect.right;
        const offsetY = e.clientY - rect.bottom;

        if (Math.abs(offsetX) < 5) {
            this.table.style.cursor = 'col-resize';
            this.resizingType = 'column';
            this.resizingIndex = Array.from(cell.closest('tr').cells).indexOf(cell);
            console.log(this.resizingIndex);
        } else if (Math.abs(offsetY) < 5) {
            this.table.style.cursor = 'row-resize';
            this.resizingType = 'row';
            this.resizingIndex = Array.from(cell.closest('table').rows).indexOf(cell.closest('tr'));
            console.log(this.resizingIndex);
        } else {
            if (!this.isResizing) this.table.style.cursor = 'default';
            this.resizingType = null;
            this.resizingIndex = null;
        }
    };


    handleMouseDown = (e) => {
        if (!this.resizingType || this.resizingIndex === null) return;
        const currentTbl = e.target.closest('.tableGrid');
        if (!currentTbl) return;

        const cell = e.target.closest('td, th');
        if (cell) {
            const colspan = parseInt(cell.getAttribute('colspan')) || 1;
            const rowspan = parseInt(cell.getAttribute('rowspan')) || 1;
            if (this.resizingType == "column" && colspan > 1) {
                let colStart = this.resizingIndex;
                let colEnd = colStart + colspan - 1;
                this.resizingIndex = this.resizingIndex + (colspan - 1);
                this.startRatios = this.columnRatios.slice(colStart, colEnd + 1);
            }
            if (this.resizingType == "row" && rowspan > 1) {
                let rowStart = this.resizingIndex;
                let rowEnd = rowStart + rowspan - 1;
                this.resizingIndex = this.resizingIndex  + (rowspan - 1);
                this.startRatios = this.rowRatios.slice(rowStart, rowEnd + 1);
                console.log('按下' + this.resizingIndex);
            }
        }

        this.isResizing = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startHeights = Array.from(this.rows).map(row => row.offsetHeight);

        this.startRatios = this.resizingType === 'column' ? [...this.columnRatios] : [...this.rowRatios];

        document.addEventListener('mousemove', this.resizeHandler);
        document.addEventListener('mouseup', this.stopResize);
    };

}


const floating = {
    autoScreen: document.getElementById('AutoScreen'),
    TargetWidth: 0,
    floatingPanel: document.querySelector('.floating-panel'),
    resizeBtn: document.getElementById('resizeMode'),
    isResizing: false,
    tblList: [],
    resizers: [],
    init: function () {
        // 計算目標寬度
        if (this.autoScreen) {
            this.TargetWidth = (this.autoScreen.offsetWidth * 2) + ((30 + 30) * 2);
        }

        // 初始化按鈕位置
        this.updateButtonPosition();

        // 綁定視窗大小改變事件
        window.addEventListener('resize', () => {
            this.updateButtonPosition();
        });
        //let tblList;
        //let resizers ;
        document.getElementById('resizeMode').addEventListener('click', (event) => {
            
            
            floating.isResizing = !floating.isResizing;
            if (floating.isResizing) {

                 this.tblList = document.querySelectorAll('.tableGrid');
                 this.resizers = Array.from(this.tblList).map(table => new tblResize(table));

                this.resizers.forEach(resizer => resizer.enable());
                ModuleBlock_MoveMgr.canMoveNow = false;
                ModuleBlock_SelectTargetMgr.CanSelectTargetNow = false;
                floating.createResizeAlert();
                
            } else {
                this.resizers.forEach(resizer => resizer.disable());
               // ModuleBlock_MoveMgr.canMoveNow = true;
                ModuleBlock_SelectTargetMgr.CanSelectTargetNow = true;
                const removeTarget = document.getElementById('resizeAlert');
                Table.isMerging = false;
                if (this.merger) {
                    this.merger.forEach(m => m.deactivate());
                    this.merger.forEach(m => m.history = []); // 清空 Undo 記錄
                    let tblArea = document.querySelectorAll(
                        `
             .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName} > tr > td > .${ModuleBlockElementMgr.TableFieldName} ,
             .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName} > tbody > tr > td > .${ModuleBlockElementMgr.TableFieldName}
             `
                    );
                    tblArea.forEach(t => {
                        t.style.backgroundColor = "";
                    })
                }
                
                removeTarget.remove();
            }

            //if (floating.resizeBtn.dataset.resize === 'false') {
            //    floating.tableBtn(true);
            //} else {
            //    floating.tableBtn(false);
            //}
        });
    },

    tblResizeState: function () {
        if (floating.resizeBtn.dataset.resize === 'true') return true;
        else return false;
    },

    createResizeAlert: function () {
        const target = document.getElementById('BlockPenel');
        const btn = document.getElementById('resizeMode');
        const canvas = document.createElement('div');
        canvas.id = 'resizeAlert';
        // **第一行容器（標題 + 關閉按鈕）**
        const headerContainer = document.createElement('div');
        headerContainer.className = 'header-container';


        const header = document.createElement('span');
        header.textContent = '調整表格中...';
        //const innerText = document.createElement('span');
        //innerText.textContent = '垂直輔助線快捷鍵： [  ';
        //const nextinner = document.createElement('span');
        //nextinner.textContent = '水平輔助線快捷鍵： ]';
        const closeBtn = document.createElement('button');
        closeBtn.id = 'closeBtn';
        closeBtn.textContent = 'x';
        closeBtn.addEventListener('click', () => {
            if (canvas) {
                clearInterval(animationInterval); // 停止動畫
                canvas.remove();
                ModuleBlock_MoveMgr.canMoveNow = true
                ModuleBlock_SelectTargetMgr.CanSelectTargetNow = true;
                floating.resizers.forEach(resizer => resizer.disable());
                btn.setAttribute('data-resize', false);
                floating.isResizing = false;
                Table.isMerging = !Table.isMerging;
                this.merger.forEach(m => m.deactivate());
                this.merger.forEach(m => m.history = []); // 清空 Undo 記錄
                let tblArea = document.querySelectorAll(
                    `
             .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName} > tr > td > .${ModuleBlockElementMgr.TableFieldName} ,
             .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName} > tbody > tr > td > .${ModuleBlockElementMgr.TableFieldName}
             `
                );
                tblArea.forEach(t => {
                    t.style.backgroundColor = "";
                })
            }
        });

        const mergeBtn = document.createElement('button');
        mergeBtn.id = 'mergeTableBtn';
        mergeBtn.textContent = '合併表格';
        mergeBtn.addEventListener('click', () => {
            Table.isMerging = !Table.isMerging;
            let tblList = document.querySelectorAll(`
             .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName}`);
            if (Table.isMerging) {
                this.merger = Array.from(tblList).map(table => new TableMerger(table));
                this.merger.forEach(
                    (m) => {
                        m.activate();
                        //console.log(ModuleDataFetcherMgr.GetTargetModuleBlock(m).id);
                    })
            }
            else {
                this.merger.forEach(m => m.deactivate());
                this.merger.forEach(m => m.history = []); // 清空 Undo 記錄
                let tblArea = document.querySelectorAll(
                    `
             .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName} > tr > td > .${ModuleBlockElementMgr.TableFieldName} ,
             .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName} > tbody > tr > td > .${ModuleBlockElementMgr.TableFieldName}
             `
                );
                tblArea.forEach(t => {
                    t.style.backgroundColor = "";
                })
            }
        });

        
        

        ////偽動畫
        let dots = 3;
        const animationInterval = setInterval(() => {
            dots = dots === 3 ? 6 : 3;
            header.textContent = '調整表格中' + '.'.repeat(dots);
        }, 500); // 每 500 毫秒切換一次
        headerContainer.appendChild(header);
        headerContainer.appendChild(closeBtn);
        canvas.appendChild(headerContainer);
        canvas.appendChild(mergeBtn);
        document.body.appendChild(canvas);
    },
    tableBtn: function (bool) {
        const TargetModuleBlock = ModuleBlock_Main.GetSelectTarget();
        const tblList = document.querySelectorAll('.tableGrid');
        //const tblArea = document.querySelectorAll('')
        //TargetModuleBlock.dataset.QuestionMode && !TargetModuleBlock.dataset.OptionMode
        
        
        if (bool) {
            ModuleBlock_MoveMgr.canMoveNow = false
            ModuleBlock_SelectTargetMgr.CanSelectTargetNow = false;
            //開始調整表格的函示
            tblList.forEach(table => {

                if (ModuleDataFetcherMgr.GetTargetModuleBlock(table).id != "ModuleBlockDemo") {
                    //table.setAttribute('data-resizing', false);
                    block.ratioTableResize(table);
                }
            });
            floating.createResizeAlert();
            floating.resizeBtn.setAttribute('data-resize', true);
            //bool = false;
        } else {
            ModuleBlock_MoveMgr.canMoveNow = true
            ModuleBlock_SelectTargetMgr.CanSelectTargetNow = true;
            tblList.forEach(table => {
                table.setAttribute('data-resizing', false);
            });
            const removeTarget = document.getElementById('resizeAlert');
            removeTarget.remove();
            floating.resizeBtn.setAttribute('data-resize', false);

            //document.removeEventListener('mousemove', resizeHandler);
            //document.removeEventListener('mouseup', stopResize);
            //bool = true;
        }
    },
    updateButtonPosition: function () {
        // 判斷當前視窗寬度以切換樣式
        if (this.floatingPanel) {
            if (window.innerWidth <= this.TargetWidth) {
                this.floatingPanel.classList.remove('desktop');
                this.floatingPanel.classList.add('mobile');
            } else {
                this.floatingPanel.classList.remove('mobile');
                this.floatingPanel.classList.add('desktop');
            }
        }
    }
};


const block = {
    tooltips: [],
    textBox: null,
    modulDiv:null,
    autoScreen: document.getElementById('AutoScreen'),
    label: document.createElement("label"),
    position: ['top-left', 'top-right', 'bottom-right', 'bottom-left', 'top-center', 'right-center', 'left-center', 'bottom-center'],
    inputCheckbox: document.createElement("input"),
    isResizing: false,
    currentHandle: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    imgContainer: document.getElementsByClassName('resize-wrapper'),
    deletedElements: [],
    undoBtn: document.getElementById('undo'),

    fixFreeze: function () {
        var editModalEl = document.getElementById('editTextModal');
        var editModal = bootstrap.Modal.getInstance(editModalEl);
        //console.log(editModal);
        //editModal.show();

        if (editModal) {
            editModal.hide();
        }
        document.body.style.overflow = 'auto';
        document.body.style.padding = 0;
    },

    init: function () {
        document.addEventListener('click', (event) => block.boxbox(event));
        //document.addEventListener('dblclick', block.removeBox);
        document.getElementById("showIdBtn").addEventListener("click", block.showId);
        document.getElementById('savePage').addEventListener('click', block.savePage);
        document.getElementById('edit').addEventListener('click', function () {

            editorFunctionsMgr.LabelTextEdit(ModuleDataFetcherMgr.GetTargetModuleBlock_TextBoxLabel(ModuleBlock_Main.GetSelectTarget()));

        });
        document.getElementById('undo').addEventListener('click', block.recover);
        block.undoBtn.style.display = 'none';
        document.addEventListener('click', (event) => {
            const tableArea = event.target.closest('.tableGrid');
            if (tableArea) {
                //block.ratioTableResize(); // 調用 tableResize 方法
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Delete') {
                //console.log('刪除的是：' + ModuleBlock_Main.GetSelectTarget())
                ModuleBlockSettingBarMgr.deleteModuleBlock(ModuleBlock_Main.GetSelectTarget());
                //if (ModuleBlock_MoveMgr.canMoveNow && ModuleBlock_SelectTargetMgr.CanSelectTargetNow) {
                    
                //    }
            }
            if (event.key === '*') {
                const target = ModuleBlock_Main.GetSelectTarget();
                if (target.dataset.needvali === 'true') {
                        block.setValiState(false);
                    } else {
                        block.setValiState(true);
                    }
                block.setValiArea();
            }
            if (event.key === '/') {
                ModuleBlockCreatMgr.addModuleBlock(true);
            }
            if (event.key === 'Escape'){
                block.fixFreeze();
            }

            if (event.key === '\\'){
                const imgProcessor = new ProcessImg();
                imgProcessor.selectImg();
            }

            //if (event.key === '-') {
            //    let targetGrid = ModuleBlock_Main.GetSelectTarget().closest('.tableGrid');
            //    const tableMerger = new TableMerger(targetGrid);

            //    const btn = document.createElement('button');
            //    targetGrid.append(btn);
            //    btn.addEventListener('click', () => {
            //        tableMerger.merge('down');
            //    })

            //}

            //if (event.key === '-') {
            //    let targetGrid = ModuleBlock_Main.GetSelectTarget().closest('.tableGrid');
            //    const tableMerger = new TableMerger(targetGrid);
            //    document.addEventListener('keydown', (event) => {
            //        if (event.key === "m" || event.key === "M") {
            //            tableMerger.toggleButtons();
            //        }
            //    })
            //}
        });

        document.addEventListener('hidden.bs.modal', () => {
            document.body.style = `position: relative; min-height: 100%; top: 0px;`;
        });
        block.printOption();
    },

    targetArea: function () {
        const targetModule = ModuleBlock_Main.GetSelectTarget();
        const targetArea = targetModule.querySelector(':scope > .ModuleBlock_inner > .UpSettingBar');
        const btn = document.createElement('button');
        btn.addEventListener('click', function () {
            const target = ModuleBlock_Main.GetSelectTarget();
            if (target.dataset.needvali === 'true') {
                block.setValiState(false);
            } else {
                block.setValiState(true);
            }
            //block.setValiArea();
        });
    },

    setValiState: function (bool) {
        const block = ModuleBlock_Main.GetSelectTarget();
        if (block) {
            block.setAttribute('data-needvali', bool.toString());
        }
        else return;
    },

    createModuleBlock_group: function (ModuleBlock) {
        const group = document.createElement('div');
        group.classList.add('ModuleBlock_group');
        group.innerHTML = `<div style="flex: 1; text-align: center;">
                <span style="margin: 0;">CAM</span>
                <div style="display: flex; align-items: center; justify-content: center; margin-top: 3px;">
                    
                        <input type="checkbox" class="group_checkbox" id="Group_1_${ModuleBlock.id}" value="1" style="margin: 0;width: 10px !important;height: 10px !important;">
                        <span style="margin: 0px 2px;">/</span>
                        <input type="checkbox" class="group_checkbox" id="Group_2_${ModuleBlock.id}" value="2" style="margin: 0;width: 10px !important;height: 10px !important;">
                   
                </div>
            </div>

            <!-- 右邊區塊 -->
            <div style="flex: 1; text-align: center;">
                <span style="margin: 0;">QA</span>
                <div>
                        <input type="checkbox" class="group_checkbox" id="Group_3_${ModuleBlock.id}" value="3" style="margin-top: 3px;" >
                </div>
            </div>
        </div>`;
        return group;
    }
    ,
    setValiArea: function () {
        //先幫每個moduleBlock加上data-needVali = true，在設定開關

        const blocks = document.querySelectorAll('.ModuleBlock');
        
        blocks.forEach(ModuleBlock => {
            if (ModuleBlock.dataset.needvali ==='true') {
                if (!ModuleBlock.querySelector(':scope > .ModuleBlock_group')) {
                    const group = block.createModuleBlock_group(ModuleBlock);
                    console.log("Add-group");

                    ModuleBlock.appendChild(group);
                }
            } else if (ModuleBlock.dataset.needvali === 'false') {
                const toDelete = ModuleBlock.querySelector(':scope > .ModuleBlock_group');
                if (toDelete) {
                    toDelete.remove();
                }
            }
            else return;
        })
    },

    printOption: function () {
        document.getElementById('preview-btn').addEventListener('click', () => {
            const showImages = document.getElementById('show-images').checked;
            const previewImage = document.getElementById('preview-image');

            // 根據選項隱藏或顯示圖片
            if (showImages) {
                previewImage.classList.remove('hidden');
            } else {
                previewImage.classList.add('hidden');
            }

            const orientation = document.getElementById('print-orientation').value;
            document.getElementById('preview').style.transform =
                orientation === 'landscape' ? 'rotate(90deg)' : 'none';
        });

        document.getElementById('print-btn').addEventListener('click', () => {

            const showImages = document.getElementById('show-images').checked;
            //console.log('顯示圖片:', showImages);

            // 使用 window.print() 列印
            window.print();
        });
    },

    ratioTableResize: function (table) {
        if (!table) return;
        let ratio = AutoScreen_js.RealscaleRatio;
        let rows = Array.from(table.querySelectorAll(':scope > tr, :scope > tbody > tr'));
        const columnsCount = rows[0]?.cells.length || 0;
        let isResizing = false;

        let columnRatios = Array(columnsCount).fill(1 / columnsCount);
        let rowRatios = Array(rows.length).fill(1 / rows.length);

        let startX = 0;
        let startY = 0;
        let startHeight = 0;
        let resizingIndex = null;
        let resizingType = null;
        let startRatios = [];

        function initializeRatios() {
            const totalWidth = table.offsetWidth;
            columnRatios = Array.from(rows[0].cells).map(cell => cell.offsetWidth / totalWidth);

            const totalHeight = table.offsetHeight;
            rowRatios = Array.from(rows).map(row => row.offsetHeight / totalHeight);
        }

        function resizeHandler(e) {
            AutoScreen_js.resetAutoScreenBlockSize();
            const currentTbl = e.target.closest('.tableGrid');
            const totalWidth = currentTbl.offsetWidth;
            const totalHeight = currentTbl.offsetHeight;
            const deltaX = (e.clientX - startX) / ratio;
            const deltaY = this.startY - e.clientY;

            if (resizingType === 'column') {
                const deltaRatio = deltaX / totalWidth;
                const minWidthRatio = 25 / totalWidth;

                // 找到影響範圍內的所有 `TD`
                let affectedCells = [];
                rows.forEach(row => {
                    Array.from(row.cells).forEach(cell => {
                        if (cell.cellIndex === resizingIndex ||
                            (cell.cellIndex < resizingIndex && cell.cellIndex + cell.colSpan > resizingIndex)) {
                            affectedCells.push(cell);
                        }
                    });
                });

                // 計算新寬度
                affectedCells.forEach(cell => {
                    let newWidth = Math.max(minWidthRatio * totalWidth, cell.offsetWidth + deltaX);
                    cell.style.width = `${(newWidth / totalWidth) * 100}%`;
                });

            } else if (resizingType === 'row') {
                // 找到影響範圍內的所有 `TR`
                let affectedRows = [];
                rows.forEach((row, index) => {
                    let hasRowSpan = Array.from(row.cells).some(cell => cell.rowSpan > 1);
                    if (index === resizingIndex || (index < resizingIndex && hasRowSpan)) {
                        affectedRows.push(row);
                    }
                });

                affectedRows.forEach(row => {
                    let newHeight = Math.max(25, row.offsetHeight + deltaY);
                    row.style.height = `${newHeight}px`;
                });
            }
        }

        function stopResize(e) {
            isResizing = false;
            document.removeEventListener('mousemove', resizeHandler);
            document.removeEventListener('mouseup', stopResize);
            table.style.cursor = 'default';
        }

        initializeRatios();

        if (!table.dataset.resizing) {
            table.setAttribute('data-resizing', true);

            table.addEventListener('mousemove', (e) => {
                if (isResizing || !table.contains(e.target) || table.dataset.resizing === 'false') return;

                const cell = e.target.closest('td');
                if (!cell || !table.contains(cell) || cell.closest('table') !== table) {
                    table.style.cursor = 'default';
                    resizingType = null;
                    resizingIndex = null;
                    return;
                }

                const rect = cell.getBoundingClientRect();
                const offsetX = e.clientX - rect.right;
                const offsetY = e.clientY - rect.bottom;

                if (Math.abs(offsetX) < 5) {
                    table.style.cursor = 'col-resize';
                    resizingType = 'column';
                    resizingIndex = cell.cellIndex;
                } else if (Math.abs(offsetY) < 5) {
                    table.style.cursor = 'row-resize';
                    resizingType = 'row';
                    resizingIndex = Array.from(cell.closest('tr').parentNode.rows).indexOf(cell.closest('tr'));
                } else {
                    table.style.cursor = 'default';
                    resizingType = null;
                    resizingIndex = null;
                }
            });

            table.addEventListener('mousedown', (e) => {
                if (!resizingType || resizingIndex === null) return;
                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;

                if (table.style.cursor == 'row-resize') {
                    startHeight = rows[resizingIndex].offsetHeight;
                }
                startRatios = resizingType === 'column' ? [...columnRatios] : [...rowRatios];

                document.addEventListener('mousemove', resizeHandler);
                document.addEventListener('mouseup', stopResize);
            });
        }
    },

    
    tableResize: function (e) {
        let ratio = AutoScreen_js.RealscaleRatio;
        const tableArea = e.target.closest('table');
        if (!tableArea) return; // 如果點擊的不是 table 或其子元素，直接返回
        let isResizing = false;
        let resizingType = null; // 'column' or 'row'
        let startX = 0, startY = 0, startWidth = 0, startHeight = 0, targetCell = null, targetTable = null;

        var TargetTableGrid = ModuleDataFetcherMgr.GetTargetModuleBlock_TableGrid(ModuleBlock_Main.GetSelectTarget());

        TargetTableGrid.addEventListener('mousemove', (e) => {
            const hoveredCell = e.target.closest('td'); // 確保是 <td> 或其內部
            if (hoveredCell && hoveredCell.closest('table') === TargetTableGrid) {
                const rect = hoveredCell.getBoundingClientRect();
                const offsetX = e.clientX - rect.right; // 邊界距離
                const offsetY = e.clientY - rect.bottom;

                if (Math.abs(offsetX) < 5 && resizingType != 'row') {
                    if (isResizing) { TargetTableGrid.style.cursor = 'row-resize'; }
                    TargetTableGrid.style.cursor = 'col-resize'; // 列調整游標
                    resizingType = 'column';
                } else if (Math.abs(offsetY) < 5 && resizingType != 'column') {
                    if (isResizing) { TargetTableGrid.style.cursor = 'col-resize'; }
                    TargetTableGrid.style.cursor = 'row-resize'; // 行調整游標
                    resizingType = 'row';
                } else {
                    if (isResizing) { return; }
                    TargetTableGrid.style.cursor = 'default';
                    resizingType = null;
                }
            } else {
                TargetTableGrid.style.cursor = 'default';
                resizingType = null;
            }
        });

        TargetTableGrid.addEventListener('mousedown', (e) => {
            const cell = e.target.closest('td');
            if (!cell || cell.closest('table') !== TargetTableGrid) return;

            targetCell = cell;
            targetTable = TargetTableGrid;
            isResizing = true;
            resizingType = TargetTableGrid.style.cursor === 'col-resize' ? 'column' : 'row';

            startX = e.clientX;
            startY = e.clientY;
            startWidth = targetCell.offsetWidth;
            startHeight = targetCell.parentNode.offsetHeight;

            // 綁定 resize 和 stop 事件
            document.addEventListener('mousemove', tResizeHandler);
            document.addEventListener('mouseup', tStopResize);
        });

        function tResizeHandler(e) {
            if (!isResizing || !resizingType) return;

            const totalWidth = targetTable.offsetWidth;

            if (resizingType === "column") {
                const deltaX = (e.clientX - startX) / ratio;
                // 先計算新的寬度
                const newWidth = startWidth + deltaX;

                // 計算比例
                const columnRatio = newWidth / totalWidth;

                // 確保寬度不小於16px
                const adjustedWidth = Math.max(newWidth, 16);

                //console.log('初始寬度:' + startWidth);
                //console.log('位移量:' + deltaX);
                //console.log('新寬度' + newWidth);
                //console.log('調整後寬度' + adjustedWidth);

                // 更新目標列的寬度
                const columnIndex = Array.from(targetCell.parentNode.children).indexOf(targetCell);

                // 根據比例調整寬度
                Array.from(TargetTableGrid.querySelectorAll(':scope > tr')).forEach(row => {
                    const cell = row.cells[columnIndex];
                    if (cell) {
                        // 針對每一列調整寬度
                        const newCellWidth = Math.max(cell.offsetWidth * columnRatio, 16);
                        cell.style.width = `${newCellWidth}px`;
                    }
                });

                // 最後，更新當前目標列的寬度
                targetCell.style.width = `${adjustedWidth}px`;

            } else if (resizingType === "row") {
                const deltaY = (e.clientY - startY) / ratio;
                const newHeight = Math.max(startHeight + deltaY, 16); // 最小高度為 16px
                targetCell.parentNode.style.height = `${newHeight}px`;
            }
        }


        function tStopResize() {
            targetTable = null;
            isResizing = false;
            resizingType = null;
            targetCell = null;

            // 移除事件
            document.removeEventListener('mousemove', tResizeHandler);
            document.removeEventListener('mouseup', tStopResize);
        }
    },

    resizeColumn: function () {
        if (!isRes) return;
    },
    recover: function (e) {
        //tooltip.hide();
        //if(stack,length > 0)stack,pop;
        if (block.deletedElements.length > 0) {
            const { element, parentElement, index } = block.deletedElements.pop();
            if (index >= parentElement.children.length) {
                parentElement.appendChild(element);
                AutoScreen_js.resetAutoScreenBlockSize();
            } else {
                parentElement.insertBefore(element, parentElement.children[index]);
                AutoScreen_js.resetAutoScreenBlockSize();
            }

            var parentModuleBlock = ModuleDataFetcherMgr.GetTargetModuleBlock(element.parentNode);
            ModuleOptionEditor.checkHasOption(parentModuleBlock);

           ModuleBlockEditMgr.setCollapse(parentModuleBlock, false);

        } else {
            block.undoBtn.style.display = 'none';
        }
        if (block.deletedElements.length == 0) {
            block.undoBtn.style.display = 'none';
        }
        //else(stack == null) undo.disable;
    },
    deleteRecord: function (target) {
        //紀錄：obj{1.目標元素 2.父節點 3.下一個兄弟節點}
        const deleteTarget = target;
        const parentElement = deleteTarget.parentElement;
        const index = Array.from(parentElement.children).indexOf(deleteTarget);
        const allInners = document.getElementsByClassName(ModuleBlockElementMgr.ModuleBlock_innerName);
        Array.from(allInners).forEach(MB_inner => {
            MB_inner.style.borderLeft = '';
        });

        // 3) 更新全域選擇
        //ModuleBlock_Main.SetSelectTargetID('');
        //stack.push(obj)
        block.deletedElements.push({ element: deleteTarget, parentElement, index });
        block.undoBtn.style.display = 'inline-block';
    },
    findTarget: function () {
        const allElements = document.querySelectorAll('*');
        let target = null;  // 使用 let 來定義變數
        for (let element of allElements) {
            const computedStyle = window.getComputedStyle(element);
            // 檢查邊框左側是否為紫色
            if (computedStyle.borderLeftColor === 'rgb(255, 0, 255)') {
                target = element.querySelector('label');  // 找到該元素中的 label
                if (target) {
                    return target;  // 返回找到的 label 元素
                }
            }
        }
        return target;  // 如果沒有找到符合條件的元素，返回 null
    },
    savePage: function () {
        // 獲取 AutoScreen 的 HTML 原始碼
        const autoScreenContent = document.querySelector("#AutoScreen").outerHTML;

        // 將原始碼內容轉換為 HTML 安全格式
        const escapedContent = autoScreenContent
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // 打開新分頁
        const newTab = window.open();

        // 設置新分頁的內容，使用 <pre> 來顯示格式化的原始碼
        newTab.document.open();
        newTab.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>HTML 原始碼</title>
            <style>
                body {
                    font-family: monospace;
                    white-space: pre-wrap;
                    background-color: #f4f4f4;
                    margin: 20px;
                    padding: 20px;
                    color: #333;
                }
                pre {
                    background: #fff;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    overflow: auto;
                }
            </style>
        </head>
        <body>
            <h1>HTML 原始碼</h1>
            <pre>${escapedContent}</pre>
        </body>
        </html>
    `);
        newTab.document.close();
    },
    
    addNewBlock: function () {
        var newModuleBlock = ModuleBlockCreatMgr.addModuleBlock();
        var tagettextBox = ModuleDataFetcherMgr.GetTargetModuleBlock_TextBox(newModuleBlock);
        block.textBox = tagettextBox.querySelector(':scope > label > div');
        block.textBox.textContent = "";
     
    },

    createBox: function(img){
        const next = img.nextSibling;
        const parent = img.parentNode;
        const box = document.createElement('div');
        box.style.width = `${img.clientWidth}px`;
        box.style.height = `${img.clientHeight}px`;
        box.classList.add('resize-wrapper');
        box.appendChild(img);
        block.position.forEach(pos => {
            const handle = document.createElement('div');
            handle.classList = `resize-handle ${pos}`;
            handle.addEventListener('mousedown', block.startResize.bind(block));
            box.appendChild(handle);
        });
        parent.insertBefore(box, next)
        //return box;
    },

    removeBox: function () {
        const boxes = document.querySelectorAll('.resize-wrapper');
        if (boxes) {
            boxes.forEach(box => {
                const TargetWidth = box.offsetWidth;
                const TargetHeight = box.offsetHeight;
                const pic = box.querySelector('img');
                const parent = box.parentNode;
                parent.insertBefore(pic, box.nextSibling);
                pic.style.width = `${TargetWidth}px`;
                pic.style.height = `${TargetHeight}px`;
                parent.removeChild(box);
            })
        }
    },

    boxbox: function (e) {
        //console.log('測試' + e.target.tagName);
        const isInWrapper = e.target.closest('.resiz-handle');
        let labels = document.getElementsByTagName('label');
        if (e.target.tagName == 'INPUT') {
            return;
        }
        if (e.target.classList.contains('resiz-handle')) { return; }
        if (!isInWrapper) {
            block.removeBox();
        }
        Array.from(labels).forEach(label => {

            if (label.contains(e.target) && e.target.tagName == 'IMG') {
                if (e.target.parentNode.classList.contains('resize-wrapper')) { return; }
                const img = e.target;
                block.createBox(img);
                return;
            }
        });
    },


    addImgToBlock: function (imgSrc) {
        // 圖片容器
        //const wrapper = document.createElement("div");
        //wrapper.className = 'resize-wrapper'; // 给容器加一个class标识
        const img = document.createElement("img"); // 创建新的图片元素
        img.src = imgSrc; // 设置图片来源

        block.textBox.appendChild(img);//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

        const rect = img.getBoundingClientRect();
        const invisiblebox = document.createElement('div');
        invisiblebox.className = 'invisiblebox';
        const imgBox = document.createElement('div');
        imgBox.className = 'imgBox';
        invisiblebox.appendChild(imgBox);
        imgBox.style.left = `${rect.left}px`;
        imgBox.style.top = `${rect.top}px`;
        block.position.forEach(pos => {
            const handle = document.createElement('div');
            handle.classList = `resize-handle ${pos}`;
            handle.addEventListener('mousedown', block.startResize.bind(block));
            invisiblebox.appendChild(handle);
        });
        document.body.appendChild(invisiblebox);

        let currentHeight = window.innerHeight;
        let currentWidth = window.innerWidth;
        window.addEventListener("resize", function (e) {
            block.updateContainerPosition(img, imgBox, currentHeight, currentWidth);
            const newrect = img.getBoundingClientRect();
            imgBox.style.left = `${newrect.left}px`;
            imgBox.style.top = `${newrect.top}px`;
            imgBox.style.width = `${newrect.width}px`;
            imgBox.style.height = `${newrect.height}px`;
        });
    
    },
    updateContainerPosition: (image, imgBox, currentHeight, currentWidth) => {
        
    },


    addNewBlockAddImg: function (imgSrc) {
        this.addNewBlock();
        this.addImgToBlock(imgSrc);
        AutoScreen_js.resetAutoScreenBlockSize();
    },

    //按下時執行
    startResize: function (e) {
        e.preventDefault();
        this.isResizing = true
        this.currentHandle = e.target;
        this.startX = e.clientX;
        this.startY = e.clientY;
        //alert: 縮放主要調整的是容器而不是圖片
        const container = this.currentHandle.parentElement;

        block.startWidth = container.offsetWidth;
        block.startHeight = container.offsetHeight;
        this.ratio = this.startX / this.startY;

        //綁定事件
        document.addEventListener('mousemove', block._resize);
        document.addEventListener('mouseup', block._stopResize);

    },

    _resize: function (e) {
        block.resize(e);
    },

    _stopResize: function () {
        block.stopResize();
    },

    //移動時執行
    resize: function (e) {
        let scale = AutoScreen_js.RealscaleRatio;
        if (!this.isResizing) return;//console.log("123");
        const dx = (e.clientX - this.startX) / scale;
        const dy = (e.clientY - this.startY) / scale;

        const container = this.currentHandle.parentElement;
        const test = document.querySelector('.textBox .test');
        const aspectRatio = block.startWidth / block.startHeight;
        
        //document.addEventListener('mouseup', block._stopResize);
        const calculateDimensions = (newWidth, newHeight) => {
            let width = Math.max(newWidth, 16); // 設置最小寬度
            let height = Math.max(newHeight, 16); // 設置最小高度
            
            // 等比例調整
            if (aspectRatio) {
                if (this.currentHandle.className.includes('top') || this.currentHandle.className.includes('bottom')) {
                    width = height * aspectRatio;
                } else {
                    height = width / aspectRatio;
                }
            }

            return { width, height };
        };

        let newWidth, newHeight;

        switch (this.currentHandle.className) {
            case 'resize-handle top-left':
                newWidth = block.startWidth - dx;
                newHeight = newWidth / aspectRatio;
                break;

            case 'resize-handle top-right':
                newWidth = block.startWidth + dx;
                newHeight = newWidth / aspectRatio;
                break;

            case 'resize-handle bottom-left':
                newWidth = block.startWidth - dx;
                newHeight = newWidth / aspectRatio;
                break;

            case 'resize-handle bottom-right':
                newWidth = block.startWidth + dx;
                newHeight = newWidth / aspectRatio;
                break;

            case 'resize-handle top-center':
                newHeight = block.startHeight - dy;
                container.style.height = `${Math.max(newHeight, 16)}px`; 
                return; 

            case 'resize-handle bottom-center':
                newHeight = block.startHeight + dy;
                container.style.height = `${Math.max(newHeight, 16)}px`; 
                return; 

            // 自由調整寬度
            case 'resize-handle left-center':
                newWidth = block.startWidth - dx;
                container.style.width = `${Math.max(newWidth, 16)}px`; 
                return; 

            case 'resize-handle right-center':
                newWidth = block.startWidth + dx;
                container.style.width = `${Math.max(newWidth, 16)}px`; 
                return;
        }

        // 計算等比例的新尺寸並應用
        const { width, height } = calculateDimensions(newWidth, newHeight);
        container.style.width = `${width }px`;
        container.style.height = `${height}px`;
        //AutoScreen_js.resetAutoScreenBlockSize();
    },
    stopResize: function () {
        //console.log("停止");
        this.isResizing = false;
        document.removeEventListener('mousemove', this.resize);
        document.removeEventListener('mouseup', this.stopResize);
        //block.textBox.parentElement.addEventListener()
    },
   

    showId: function () {

        // 找到所有 .ModuleBlock 元素
        const modules = document.querySelectorAll(".ModuleBlock");

        // 先清空現有的 Tooltip
        block.tooltips.forEach(tooltip => tooltip.remove());
        block.tooltips.length = 0; 

        // 為每個模組創建 Tooltip
        modules.forEach(module => {
            
            const moduleId = module.getAttribute('id') || "未設定 ID";
            if (moduleId == 'ModuleBlockDemo') { return; }
            // 創建 Tooltip 元素
            const tooltip = document.createElement("div");

            tooltip.textContent = `ID: ${moduleId}`;

            tooltip.className = 'displayId';
            tooltip.style.background = "rgba(0, 0, 0, 0.7)";
            tooltip.style.color = "#fff";
            tooltip.style.padding = "5px 10px";
            tooltip.style.borderRadius = "5px";
            tooltip.style.fontSize = "12px";
            tooltip.style.position = "absolute";
            tooltip.style.zIndex = "9999";
            tooltip.style.display = "block";
            
            // 添加到 DOM
            document.body.appendChild(tooltip);

            // 使用 Popper.js 設置 Tooltip 位置
            Popper.createPopper(module, tooltip, {
                placement: 'top-start', 
                modifiers: [
                    {
                        //name: 'offset',
                        //options: {
                        //    offset: [0, 0], // 偏移設置
                        //},
                    },
                ],
            });

            block.tooltips.push(tooltip);
            tooltip.addEventListener("blur", () => {
                tooltip.remove();
            });
        });

        document.addEventListener("click", (event) => {
            //console.log(event.target.tagName)
            const button = document.querySelector("#showIdBtn");
            if (!event.target.classList.contains("displayId") && !(button.contains(event.target))) {
                //console.log(!event.target.classList.contains("displayId"));
                //console.log(!(button.contains(event.target)));
                block.tooltips.forEach(tooltip => {
                   // tooltip.style.display = 'none';
                    tooltip.remove();
                })
                //block.tooltips.remove();
                }
            },
            //{ once: true } 
        );
    },
};

const toolArea = {
    settingArea: document.querySelector('.settingArea'),
    checkWidth: function () {
        if (this.settingArea) {
            if (this.settingArea.offsetWidth < 30) {
                settingArea.classList.add('hidden');
            } else {
                this.settingArea.classList.remove('hidden');
            }
        }
    }
};




class checkImgblockMgr {

    static init() {
        document.addEventListener("click", this.checkImgblock, true);
    }
    static checkImgblock(event) {
        var resizeWrapperS = document.querySelectorAll(".resize-wrapper");

        resizeWrapperS.forEach(resizeWrapper => {
            if (resizeWrapper.contains(event.target)) {
                resizeWrapper.childNodes.forEach(c => {
                    if(resizeWrapper.querySelector('p')) 
                    {
                        c.childNodes.forEach()
                    }
                    if (c.classList.contains('resize-handle')) {
                        c.style.display = 'inline-block';
                    }
                    if (c.nodeName == "img") {
                        c.style.border = '1px solid #4285f4';
                    }
                });
            }
            else {
                resizeWrapper.childNodes.forEach(c => {
                    if (c.classList.contains('resize-handle')) {
                        c.style.display = 'none';
                    }
                    if (c.nodeName == "img") {
                        c.style.border = '';
                    }
                });
            }

        });

    }
}




class ProcessImg {
    
    updateImages() {
        fetch('/Customer/SurveyEdit/UpdateSurveyImages?surveyId=2', { method: 'POST' })
            .then(response => response.text())
            .then(data => alert(data))
            .catch(error => console.error('錯誤:', error));
    }
    async selectImg() {
        let targets = document.querySelectorAll('img');
        const uploadPromises = [];
        targets.forEach(img => {
            if (img.src.startsWith("data:image/")) {
                const base64String = img.src;
                const fileName = `image_${crypto.randomUUID()}.png`; // 產生 GUID 檔名
                const blob = this.base64ToBlob(base64String);
                const formData = new FormData();
                formData.append("file", blob, fileName);
                // AJAX 上傳到 ASP.NET MVC
                uploadPromises.push(fetch("/Customer/SurveyEdit/UploadImage", {
                    method: "POST",
                    body: formData
                }));
            }
        })

        await Promise.all(uploadPromises); // 等待所有圖片上傳完成
        alert("所有圖片已上傳！");
    }

    base64ToBlob(base64String) {
        const byteCharacters = atob(base64String.split(",")[1]); // 解碼
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: "image/png" });  
    }


}


const Table = {
    isMerging: false,
    merger: [],
    init: function () {
        document.addEventListener('keydown', (event) => {
            if (event.key === '-') {

                Table.isMerging = !Table.isMerging;
                let tblList = document.querySelectorAll(`
             .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName}`);
                if (Table.isMerging) {
                    this.merger = Array.from(tblList).map(table => new TableMerger(table));
                    this.merger.forEach(
                        (m) => {
                            m.activate();
                            //console.log(ModuleDataFetcherMgr.GetTargetModuleBlock(m).id);
                        })
                }
                else {
                    this.merger.forEach(m => m.deactivate());
                    this.merger.forEach(m => m.history = []); // 清空 Undo 記錄
                    let tblArea = document.querySelectorAll(
                        `
             .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName} > tr > td > .${ModuleBlockElementMgr.TableFieldName} ,
             .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName} > tbody > tr > td > .${ModuleBlockElementMgr.TableFieldName}
             `
                    );
                    tblArea.forEach(t => {
                        t.style.backgroundColor = "";
                    })
                }
            }
        })
    }
}
class TableMerger {
    constructor(tableClass) {
        this.table = tableClass;
        this.selectedCell = null;
        this.buttons = []; // 存儲動態按鈕
        this.active = false;
        this.rowToMerge = 1;
        this.colToMerge = 1;
        this.historyStack = [];
        //this.targetCell = null;
        this.init();

    }

    activate() {
        this.active = true;
        for (let row of this.table.rows) {
            for (let cell of row.cells) {
                cell.addEventListener("click", this.handleCellClick.bind(this));
            }
        }
        console.log("🔹 TableMerger 啟動，請點擊儲存格來創建按鈕");
    }

    deactivate() {
        this.active = false;
        this.removeButtons();
        for (let row of this.table.rows) {
            for (let cell of row.cells) {
                cell.removeEventListener("click", this.handleCellClick.bind(this));
            }
        }
        console.log("❌ TableMerger 停止");
    }

    handleCellClick(event) {
        if (!this.active) return;

        this.selectedCell = event.target.closest('td');

        if (!this.selectedCell) return;
        this.colToMerge = this.selectedCell.colSpan || 1;
        this.rowToMerge = this.selectedCell.rowSpan || 1;
        this.removeButtons(); // 先移除其他按鈕
        this.createButtons();

        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === "z") {
                this.undo();
            }
        });
    }


    init() {
        
        // 設定點擊事件，選取儲存格
        for (let row of this.table.rows) {
            for (let cell of row.cells) {
                cell.addEventListener("click", (event) => {
                    let targetCell = event.target.closest("td"); // 找到最近的 <td>
                    let targetTable = targetCell ? targetCell.closest(".tableGrid") : null;
                    // 確保 targetCell 屬於外層表格
                    if (!targetCell || !targetTable) return;
                    this.table = targetTable;
                    this.selectCell(targetCell);
                    this.rowToMerge = cell.rowSpan > 1 ? cell.rowSpan : 1;
                    this.colToMerge = cell.colSpan > 1 ? cell.colSpan : 1;
                });
            }
        }
    }

    selectCell(cell) {
        if (!this.active) return;
        if (this.selectedCell) {
            this.selectedCell.querySelector(':scope > .table_Field').style.backgroundColor = ""; // 清除前一個選取的顏色
        }
        this.selectedCell = cell;
        this.selectedCell.querySelector(':scope > .table_Field').style.backgroundColor = "red";
        //this.selectedCell.style.backgroundColor = "red"; // 設定選取顏色
    }

    merge(direction) {
        if (!this.selectedCell) {
            alert("請先選擇一個儲存格");
            return;
        }

        let row = this.selectedCell.parentElement.rowIndex; // 當前列
        let col = this.selectedCell.cellIndex; //當前行

        switch (direction) {
            case "^":
                if (row > 0) {
                    if (this.selectedCell.colSpan > 1) {
                        this.mergeCells(row - 1, col, this.rowToMerge += 1, this.selectedCell.colSpan);
                    }
                    else {
                        this.mergeCells(row - 1, col, this.rowToMerge += 1, 1);
                    }
                    this.selectedCell = this.table.rows[row -= 1].cells[col];
                    console.log(this.selectedCell);
                    this.selectedCell.querySelector(':scope > .table_Field').style.backgroundColor = "red";
                }
                break;
            case "v":
                if (row < this.table.rows.length - 1) this.mergeCells(row, col, this.rowToMerge += 1, this.colToMerge);
                break;
            case "<":
                if (col > 0) {
                    if (this.selectedCell.rowSpan > 1) {
                        this.mergeCells(row, col - 1, this.selectedCell.rowSpan, this.colToMerge += 1);
                    }
                    else {
                        this.mergeCells(row, col - 1, 1, this.colToMerge += 1 );
                    }
                    
                    this.selectedCell = this.table.rows[row].cells[col -= 1];
                    this.selectedCell.querySelector(':scope > .table_Field').style.backgroundColor = "red";
                }
                break;
            case ">":
                    if (col < this.table.rows[row].cells.length - 1) this.mergeCells(row, col, this.rowToMerge, this.colToMerge += 1);
                break;
            default:
                alert("無效的合併方向");
        }
        //this.removeButtons(); // 合併後移除按鈕
    }

    mergeCells(startRow, startCol, newRowSpan, newColSpan) {
        let cell = this.table.rows[startRow].cells[startCol];//現在的儲存格

        let history = {
            row: startRow,
            col: startCol,
            rowSpan: cell.rowSpan || 1,
            colSpan: cell.colSpan || 1,
            hiddenCells: []
        };

        // 取得當前儲存格的 rowspan & colspan
        let currentRowSpan = cell.rowSpan || 1;
        let currentColSpan = cell.colSpan || 1;

        // 計算新的 rowspan & colspan，確保連續合併時不會覆蓋到其他儲存格
        let finalRowSpan = Math.max(currentRowSpan, newRowSpan);
        let finalColSpan = Math.max(currentColSpan, newColSpan);

        // 設定新的 rowspan & colspan
        cell.rowSpan = finalRowSpan;
        cell.colSpan = finalColSpan;

        //for (let i = startRow; i < startRow + finalRowSpan; i++) {
        //    for (let j = startCol; j < startCol + finalColSpan; j++) {
        //        let row = this.table.rows[i];
        //        let targetCell = row.cells[j];
        //        //if ()
        //    }
        //}

        
        // 遍歷合併範圍，隱藏儲存格
        for (let i = startRow; i < startRow + finalRowSpan; i++) {
            for (let j = startCol; j < startCol + finalColSpan; j++) {
                if (i === startRow && j === startCol) continue; // 跳過主儲存格

                let row = this.table.rows[i];
                if (row && row.cells[j]) {
                    let targetCell = row.cells[j];//被合併儲存格
                    targetCell.removeAttribute('rowSpan');
                    targetCell.removeAttribute('colSpan');
                    targetCell.style.display = "none";
                    history.hiddenCells.push({
                        row: i,
                        col: j,
                        cell: row.cells[j].cloneNode(true) // 儲存被合併的儲存格
                    });
                    let contentToMove = targetCell.querySelectorAll(':scope > .table_Field> .ModuleBlock');
                    let targetToAppend = cell.querySelector(':scope > .table_Field');
                    if (!targetToAppend) {
                        targetToAppend = document.createElement("div");
                        targetToAppend.classList.add("table_Field");
                        cell.appendChild(targetToAppend);
                    }
                    contentToMove.forEach(block => targetToAppend.appendChild(block));
                }
            }
        }
        this.historyStack.push(history);
        this.colToMerge = cell.colSpan;
        this.rowToMerge = cell.rowSpan;
        // 清除選取狀態
        //this.selectedCell = null;
    }


    undo() {
        if (this.historyStack.length === 0) {
            alert("沒有可以復原的操作！");
            return;
        }

        let lastAction = this.historyStack.pop(); // 取得最後一次的合併紀錄
        let cell = this.table.rows[lastAction.row].cells[lastAction.col];

        // 還原 rowspan 和 colspan
        cell.rowSpan = lastAction.rowSpan;
        cell.colSpan = lastAction.colSpan;

        // 還原被隱藏的儲存格
        for (let { row, col, cell: oldCell } of lastAction.hiddenCells) {
            let rowElement = this.table.rows[row];
            if (rowElement) {
                let newCell = rowElement.insertCell(col);
                newCell.innerHTML = oldCell.innerHTML;
                newCell.style.display = ""; // 重新顯示
            }
        }
    }

    findMergedCell(startRow, startCol) {
        let table = this.table;
        if (startRow < 0 || startCol < 0) return null;
        let targetCell = table[startRow].cells[startCol];
        if (!targetCell) return null;
        
        //let currentCell = table[startRow].cells[StartCol];
        if (targetCell.style.display !== 'none') {
            return targetCell;
        }        
        return this.findMergedCell(startRow, startCol - 1) || this.findMergedCell(startRow - 1, startCol);
         
    }

    unmergeCells(startRow, startCol) {
        let cell = this.table.rows[startRow].cells[startCol];

        // 取得 rowspan 和 colspan
        let rowSpan = cell.rowSpan || 1;
        let colSpan = cell.colSpan || 1;

        // 還原 rowspan & colspan
        cell.removeProperty('rowspan');
        cell.removeProperty('colspan');

        // 遍歷合併範圍，將隱藏的儲存格顯示回來
        for (let i = startRow; i < startRow + rowSpan; i++) {
            for (let j = startCol; j < startCol + colSpan; j++) {
                if (i === startRow && j === startCol) continue; // 跳過主要儲存格

                let row = this.table.rows[i];

                // 確保儲存格存在
                if (row) {
                    let newCell = row.cells[j];
                    //newCell.innerHTML = `<div class="table_Field"></div>`; // 恢復結構
                    newCell.style.removeProperty("display"); // 讓它恢復顯示
                }
            }
        }

        // 清除選取狀態
        this.selectedCell = null;
    }



    toggleButtons() {
        if (this.buttons.length > 0) {
            this.removeButtons();
        } else {
            this.createButtons();
        }
    }

    createButtons() {
        const directions = ["^", "v", "<", ">"];
        //const rect = this.selectedCell.getBoundingClientRect();
        const icons = {
            "^": "bi bi-arrow-bar-up",
            "v": "bi bi-arrow-bar-down",
            "<": "bi bi-arrow-bar-left",
            ">": "bi bi-arrow-bar-right"
        };

        const positions = {
            "^": { top: "0", left: "50%" },
            "v": { top: "100%", left: "50%" },
            "<": { top: "50%", left: "0" },
            ">": { top: "50%", left: "100%" }
        };

        directions.forEach((dir) => {
            const btn = document.createElement("button");
            //btn.innerText = dir.toUpperCase();
            btn.style.position = "absolute";
            btn.style.transform = "translate(-50%, -50%)";
            btn.style.zIndex = "1000";
            btn.style.padding = "1px 6px";
            btn.style.cursor = "pointer";
            btn.style.border = "1px solid black";
            btn.style.backgroundColor = "white";
            btn.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.3)";
            btn.style.top = positions[dir].top;
            btn.style.left = positions[dir].left;
            btn.innerHTML = `<i class="${icons[dir]}"></i>`;

            btn.addEventListener("click", () => this.merge(dir));

            let btnArea = this.selectedCell.querySelector(':scope > .table_Field');
            btnArea.appendChild(btn);
            this.buttons.push(btn);
        });
    }

    positionButtons() {
        if (!this.selectedCell) return;
        //const rect = this.selectedCell.getBoundingClientRect();
        const directions = ["up", "down", "left", "right"];
        const icons = {
            "up": "bi bi-arrow-bar-up",
            "down": "bi bi-arrow-bar-down",
            "left": "bi bi-arrow-bar-left",
            "right": "bi bi-arrow-bar-right"
        };

        // 計算相對於 <td> 的 % 位置
        const positions = {
            "^": { top: "0", left: "50%" },
            "v": { top: "100%", left: "50%" },
            "<": { top: "50%", left: "0" },
            ">": { top: "50%", left: "100%" }
        };

        this.buttons.forEach((btn, index) => {
            const dir = directions[index];
            btn.style.top = positions[dir].top;
            btn.style.left = positions[dir].left;
        });
    }



    removeButtons() {
        this.buttons.forEach((btn) => btn.remove());
        this.buttons = [];
    }
    
}