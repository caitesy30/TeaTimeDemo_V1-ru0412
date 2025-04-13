
document.addEventListener('DOMContentLoaded', () => {
    const checkExist = setInterval(() => {
        if (document.querySelector("#floatingNavigator")) {
            clearInterval(checkExist); 
            //console.log("#floatingNavigator 已載入");
            validation.init();
        }
    }, 500); // 每 500 毫秒檢查一次
});

class validation {
    static init() {
        const area = document.querySelector('.navigator-content');
        const btn = document.createElement('button');
        btn.classList.add('btn', 'btn-info');
        btn.innerHTML = '<i class="bi bi-collection"></i>';
        if (area == null) {
            return;
        }
        area.appendChild(btn);
        btn.addEventListener('click', () => {
            AllQuestionsAnsweredMgr.CheckAllQuestionsAnswered();
            if (validation.checkVali()) {
                alert('還有題目尚未填寫');
            } else {
                alert('填寫完成！');
            }
        });
    }


    static checkVali() {

        const checkList = document.querySelector('#AutoScreen').querySelectorAll('.textBox');
        for (const c of checkList) {
            if (c.style.backgroundColor !== '') {
                //console.log(c, 'box');
                return true;  
            }
        }

        return false;
    }
}