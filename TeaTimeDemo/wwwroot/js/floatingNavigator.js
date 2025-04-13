// floatingNavigator.js

class FloatingNavigator {
    /**
     * 初始化浮動導航視窗
     * @param {Array} surveyDataList - 問卷資料陣列，每筆資料需包含 id、value、station、suffix、pageNum 屬性
     */
    static init(surveyDataList) {
        // 設定每個問卷區塊的 data 屬性
        // surveyDataList.forEach(item => {
        //     let surveyElementId = `Survey_${item.id}_${item.value}`;
        //     let surveyElement = document.querySelector(`#${CSS.escape(surveyElementId)}`);
        //     if (surveyElement) {
        //         surveyElement.dataset.station = item.station;
        //         surveyElement.dataset.suffix = item.suffix;
        //         surveyElement.dataset.pageNum = item.pageNum;
        //     } else {
        //         console.warn("Survey element not found for id:", surveyElementId);
        //     }
        // });
    }
    static showNavigationUI(surveyDataList) {
        // 建立導航 UI
        this.buildNavigationUI(surveyDataList);
        // 啟用拖曳功能
        this.makeDraggable();
    }



    /**
     * 建立導航 UI
     * @param {Array} surveyDataList - 問卷資料陣列
     */
    static buildNavigationUI(surveyDataList) {
        // 建立或取得導航容器
        let navContainer = document.getElementById("floatingNavigator");
        //navContainer.classList.add('no-print');
        if (!navContainer) {
            navContainer = document.createElement("div");
            navContainer.id = "floatingNavigator";
            document.body.appendChild(navContainer);
        }
        navContainer.classList.add('no-print');
        // 清空原有內容
        navContainer.innerHTML = "";

        // 建立導航標題列（包含書本圖案與縮放按鈕）
        const header = document.createElement("div");
        header.className = "navigator-header";
        header.innerHTML = `<span class="navigator-title">📚 問卷導航</span>
                        <button class="navigator-toggle-btn" title="縮小/展開">–</button>
                        <button class="navigator-close-btn" title="關閉">X</button>`;
        navContainer.appendChild(header);

        // 建立內容區塊
        const contentDiv = document.createElement("div");
        contentDiv.className = "navigator-content";

        // 將問卷資料依 station 分組
        let groups = {};
        surveyDataList.forEach(item => {
            if (!groups[item.station]) {
                groups[item.station] = [];
            }
            groups[item.station].push(item);
        });

        /* 自訂排序函式：
           1. 先依 pageNum 比較，若不相等則依 pageNum 升冪排序
           2. 當 pageNum 相等時，比較 suffix：
              - 若其中一個 suffix 為 "一般"，則該筆資料排在前面
              - 若兩者皆為 "一般" 或皆非 "一般"，則依字元進行排序 */
        function customSort(a, b) {
            if (a.pageNum !== b.pageNum) {
                return a.pageNum - b.pageNum;
            } else {
                if (a.suffix === "一般" && b.suffix !== "一般") {
                    return -1;
                } else if (a.suffix !== "一般" && b.suffix === "一般") {
                    return 1;
                } else {
                    return a.suffix.localeCompare(b.suffix);
                }
            }
        }

        // 對於每個站別建立按鈕與下拉選單
        for (let station in groups) {
            // 建立站別按鈕
            const stationBtn = document.createElement("button");
            stationBtn.className = "navigator-station-btn";
            stationBtn.textContent = station;
            stationBtn.addEventListener("click", () => {
                // 點擊後預設導覽到此站別中排序後第一筆問卷
                let group = groups[station];
                group.sort(customSort);  // 使用自訂排序
                let target = group[0];
                // 調用方式改為傳入三個參數：station, pageNum, suffix
                
                FloatingNavigator.navigateToSurvey(station, target.pageNum, target.suffix);
            });
            contentDiv.appendChild(stationBtn);

            // 建立下拉選單（頁數選項）
            const dropdown = document.createElement("select");
            dropdown.className = "navigator-dropdown";
            groups[station]
                .sort(customSort) // 使用自訂排序
                .forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.pageNum;
                    // 將 suffix 存入 option 的 dataset 中
                    option.dataset.suffix = item.suffix;
                    option.textContent = `第 ${item.pageNum} 頁 (${item.suffix})`;
                    dropdown.appendChild(option);
                });
            dropdown.addEventListener("change", function () {
                // 取得選取的 option 之 suffix
                const selectedSuffix = this.options[this.selectedIndex].dataset.suffix;
                FloatingNavigator.navigateToSurvey(station, this.value, selectedSuffix);
            });
            contentDiv.appendChild(dropdown);
        }
        navContainer.appendChild(contentDiv);

        // 綁定縮小/展開按鈕事件
        const toggleBtn = header.querySelector(".navigator-toggle-btn");
        toggleBtn.addEventListener("click", () => {
            if (contentDiv.style.display === "none") {
                // 展開狀態：顯示完整導覽內容及完整標題
                contentDiv.style.display = "block";
                toggleBtn.textContent = "–";
                header.querySelector(".navigator-title").textContent = "📚 問卷導航"; // 恢復完整標題
            } else {
                // 縮小狀態：隱藏內容，僅保留「📚」圖示
                contentDiv.style.display = "none";
                toggleBtn.textContent = "□"; // 修改為方框符號
                header.querySelector(".navigator-title").textContent = "📚"; // 僅顯示圖示
            }
        });
        // 綁定關閉按鈕事件：點擊「X」後隱藏整個導航容器
        const closeBtn = header.querySelector(".navigator-close-btn");
        closeBtn.addEventListener("click", () => {
            navContainer.style.display = "none";
        });
    }

    /**
     * 根據 station、pageNum 與 suffix 導覽至對應的問卷區塊
     * 完全依照傳入的三個條件比對，不做特殊處理
     * @param {string} station - 主分類
     * @param {string|number} pageNum - 頁數
     * @param {string} suffix - 問卷後綴
     */
    static navigateToSurvey(station, pageNum, suffix) {
        // 取得符合 station、pageNum 與 suffix 的問卷元素
        let targetSurvey = Array.from(document.querySelectorAll(".Survey")).find(s =>
            s.dataset.station === station &&
            s.dataset.pageNum === String(pageNum) &&
            s.dataset.suffix === suffix
        );
        if (targetSurvey) {
            targetSurvey.scrollIntoView({ behavior: "smooth" });
        } else {
            console.warn(`找不到符合 station ${station}、pageNum ${pageNum} 與 suffix ${suffix} 的問卷`);
        }
    }

    /**
     * 使導航容器可拖曳
     */
    static makeDraggable() {
        const navContainer = document.getElementById("floatingNavigator");
        if (!navContainer) return;

        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        // 使用導航標題列作為拖曳手把
        const dragHandle = navContainer.querySelector(".navigator-header");
        if (!dragHandle) return;  
        dragHandle.style.cursor = "move";

        dragHandle.addEventListener("mousedown", (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = navContainer.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            e.preventDefault();
        });

        document.addEventListener("mousemove", (e) => {
            if (isDragging) {
                let dx = e.clientX - startX;
                let dy = e.clientY - startY;
                navContainer.style.left = (initialLeft + dx) + "px";
                navContainer.style.top = (initialTop + dy) + "px";
            }
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
        });
    }
}
