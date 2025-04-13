
/**************************************************/
/* SurveyLoad.js                   
/**************************************************/

$(document).ready(function () {




    setLoadBtnMgr.SetBtn();

    }
);


class setLoadBtnMgr
{

    static SetBtn() {

        var btn = document.createElement("button");
        btn.innerText = "點擊Btn"; // 設定按鈕文字
        btn.style.display = 'fixed';
        // 設定按鈕點擊事件
        btn.addEventListener("click", function () {
            
            setLoadBtnMgr.importTxtAndProcess();
        });

        // 將按鈕加入 body 或特定容器

        $('body').append(btn);

        //----------------------------------------//




        var SaveBtn = document.createElement("button");
        SaveBtn.innerText = "儲存問卷Btn"; // 設定按鈕文字

        // 設定按鈕點擊事件
        SaveBtn.addEventListener("click", function () {

            SaveAndLoadAnswerMgr.saveAnswer();

        });

        // 將按鈕加入 body 或特定容器

        $('body').append(SaveBtn);

        //----------------------------------------//


    }


    static importTxtAndProcess(htmlString = null) {

        // 如果呼叫時傳入了 htmlString (表示從外部已拿到HTML)
        if (htmlString) {
            // this.#importHtmlString(htmlString);
            SaveAndLoadAnswerMgr.LoadSurvey(1, 1, htmlString);
            console.log(content);
            return;
        }

        // 否則走原本檔案流 (.txt)
        // 1) 建立 <input type="file"> 專用來選 txt
        const inputFile = document.createElement("input");
        inputFile.type = "file";
        inputFile.accept = ".txt";

        // 2) 監聽 change: 使用者選完檔案
        inputFile.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            // 檢查副檔名 (可再加嚴謹判斷)
            if (!file.name.endsWith(".txt")) {
                alert("請選擇 .txt 檔案！");
                return;
            }

            try {
                // 3) 讀取檔案內容(文字)
                const content = await file.text();

                console.log(content);
          

                var SurveyId = Math.floor(Math.random() * 10) + 1;
                var Version = Math.floor(Math.random() * 10) + 1;
                //SurveyId = 1;
                //Version = 1;
                var htmlContent = content;

                SaveAndLoadAnswerMgr//.LoadSurvey(SurveyId, Version, htmlContent);
                .LoadSurvey("PCB_Category", "Station", "Suffix", "PageNum", "DocumentId", htmlContent, SurveyId, Version)
               // this.#importHtmlString(content);
            } catch (err) {
                console.error("讀取檔案失敗:", err);
                alert("匯入失敗：" + err.message);
            }

        });

        // 觸發選擇檔案
        inputFile.click();
    }




}