/********************************************/
/* dialogTabEvents.js                         */
/* 初始化分頁樣式的相關函式                   */
/********************************************/


class dialogTabEventsMgr{

    static init() {
        $(document).on('shown.bs.tab', '#editModalTabs [data-bs-toggle="tab"]', function (e) {
            const newPaneId = e.target.getAttribute('aria-controls');
            if (newPaneId !== 'edit-text') {
                dialogTabEventsMgr.resetToDefaultSize();
                //alert('已呼叫 resetToDefaultSize()');
            }
            if (newPaneId === 'add-tabl') {
                Tab_EditTableMgr.init();
                //alert('已呼叫 resetToDefaultSize()');
            }

        });
    }

    static openInit() {
        Tab_EditTableMgr.init();
}



// (1) 初始化函式
      static resetToDefaultSize() {
      const dialog = document.querySelector('.custom-modal-dialog');
      dialog.classList.remove('enlarged');

        const insertFillSection = document.querySelector('.insert-fill-section');
        if (insertFillSection) {
          insertFillSection.style.display = 'none';
        }
   
      }
   
}





