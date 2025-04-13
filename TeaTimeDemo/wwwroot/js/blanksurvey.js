$(document).ready(function () {
    $('#addToCatForm').on('submit', function (e) {

        /*alert("test");*/
        //e.preventDefault();//防止預先提交，後續再手動提交已選中問卷

        $('#addToCatFrom input[name="SelectedSurveyIds[]"]').remove();//清空先前所製造的input

        const urlParams = new URLSearchParams(window.location.search);
        const notesId = urlParams.get('NotesId');
        const stationId = urlParams.get('StationId');

        // 設置隱藏欄位的值
        $('#addToCatForm')[0].querySelector('input[name="NotesId"]').value = notesId;
        $('#addToCatForm')[0].querySelector('input[name="StationId"]').value = stationId;

        //每個List中的選中問卷添加隱藏input
        selectedSurveyIds.forEach(
            function (id) {
                $('<input>').attr({
                    type: 'hidden',
                    name: 'SelectedSurveyIds[]',//這個要與controller參數名相同
                    value: /*$(this).val()*/id,
                }).appendTo('#addToCatForm');
            }
        );

        //因為前面控制住提交，這裡要手動提交
        this.submit();
    })

    //根據複選框狀態動態更新>>>>>事件觸發
    $('#StblData').on('change', '.survey-checkbox', function () {
        var surveyId = parseInt($(this).val());
        if (this.checked) {//勾選時添加到列表
            if (!selectedSurveyIds.includes(surveyId)) {
                selectedSurveyIds.push(surveyId);
            }
        } else {//取消勾選時移除列表中Id
            selectedSurveyIds = selectedSurveyIds.filter(id => id != surveyId);
        }
    });
})



document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('NtblData')) {
        const manager = new surveyManager('NtblData');
    } else if (document.getElementById('LtblData')) {
        const manager = new surveyManager('LtblData');
    } else if (document.getElementById('StblData')) {
        const manager = new surveyManager('StblData');
        
    }
});
 

function ToggleSelectLayerForm() {
    var form = document.getElementById("selectLayer");
    if (form.style.display === "none") form.style.display = "block";
    else form.style.display = "none";
}

function ToggleForm() {
    var form = document.getElementById("NewPageSection");
    if (form.style.display === "none") form.style.display = "block";
    else form.style.display = "none";
}   

class surveyManager {
    constructor(tableId) {
        if (tableId === 'NtblData') {
            this.table = document.getElementById('NtblData');
            this.dataTable = null;
            this.initNotesTable();
        } else if (tableId === 'LtblData') {
            this.stationTable = document.getElementById('LtblData');
            this.stationDataTable = null;
            this.initStationTable();
        }
        else if (tableId === 'StblData') {
            this.surveyTable = document.getElementById('StblData');
            this.surveyDataTable = null;
            this.initSurveyTable();
        }
    }

    async initSurveyTable() {
        try {
            const data = await this.getSurveyData();
            this.renderSurveyData(data);
        } catch (error) {
            console.error('Notes 表格載入失敗', error);
        }
    }

    async initNotesTable() {
        try {
            const data = await this.getData();
            this.renderSurvey(data);
        } catch (error) {
            console.error('Notes 表格載入失敗', error);
        }
    }

    async initStationTable() {
        try {
            const notesId = this.getNotesIdFromUrl();
            if (notesId) {
                const data = await this.getStationData(notesId);
                this.renderStationData(data);
            } else {
                console.error("URL 缺少 notesId");
            }
        } catch (error) {
            console.error('Station 表格載入失敗', error);
        }
    }

    //async init(){
    //    try {
    //        if (this.table) {
    //            const data = await this.getData();
    //            console.log(data);
    //            this.renderSurvey(data);
    //        } else if (this.stationTable) {
    //            const notesId = this.getNotesIdFromUrl();
    //            if (notesId) {
    //                const stationData = await this.getStationData(); // 確保資料被正確獲取
    //                console.log(stationData);
    //                this.renderStationData(stationData); // 傳遞站點資料進行渲染
    //            } else {
    //                console.error("URL 缺少 notesId");
    //            }
    //        }
    //    }
    //    catch(error) {
    //        console.error('載入失敗', error);
    //        alert('載入失敗');
    //    }
    //}

    async fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('找不到資料');
        }
        const result = await response.json(); // 從 API 回應中提取資料
        console.log('取得的資料:', result.data); // 確認資料正確
        return result.data; // 回傳 `data` 屬性中的資料
    }

    async getSurveyData() {
        return await this.fetchData('/Admin/BlankSurvey/GetSurveys');
    }

    async getData() {
        return await this.fetchData('/Admin/BlankSurvey/GetNotes');
    }
    async getStationData(categoryId) {
        return await this.fetchData(`/Admin/BlankSurvey/GetLayers/${categoryId}`);
    }
    renderSurvey(data) {
        if (this.dataTable) {
            this.dataTable.destroy();
        }

        this.dataTable = $(this.table).DataTable({
            data: data,
            columns: [
                { "data": "name", "width": "15%" },
                { "data": "displayOrder", "width": "15%" },
                { "data": "ispublished", "width": "15%" },
                {
                    data: 'id',
                    "render": (data, type, row) => {
                        var publishButton = row.ispublished === true
                            ? `<button class="btn btn-secondary mx-2" onclick="togglePublish(${data})">取消發佈</button>`
                            : `<button class="btn btn-secondary mx-2" onclick="togglePublish(${data})">發佈</button>`;

                        return `
                        <div class="w-75 btn-group" role="group">
                            <a href="/Admin/BlankSurvey/Station?NotesId=${data}" class="btn btn-primary mx-2" >
                                <i class="bi bi-pencil-square"></i> 編輯
                            </a>
                            <button class="btn btn-danger mx-2" onClick="Delete('/Admin/BlankSurvey/Delete/NtblData/${data}', 'NtblData')">
                                <i class="bi bi-trash-fill"></i> 刪除
                            </button>
                            ${publishButton}
                        </div>`;
                    },
                    "width": "15%"
                },
            ],
            responsive: true,
        });
    }

    getNotesIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('NotesId');
    }

    getStationIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('StationId');
    }

    

    renderStationData(data) {

        const notesId = this.getNotesIdFromUrl();

        if (this.stationDataTable) {
            this.stationDataTable.destroy();
        }

        this.stationDataTable = $(this.stationTable).DataTable({
            data: data,
            columns: [
                { "data": "name", "width": "15%" },
                { "data": "order", "width": "15%" },
                { "data": "description", "width": "15%" },
                {
                    data: 'id',
                    "render": (data) => {
                        return `
                        <div class="w-75 btn-group" role="group">
                            <a href="/Admin/BlankSurvey/Survey?NotesId=${notesId}&StationId=${data }" class="btn btn-primary mx-2" >
                                <i class="bi bi-pencil-square"></i> 編輯
                            </a>
                            <button class="btn btn-danger mx-2" onClick="Delete('/Admin/BlankSurvey/Delete/LtblData/${data}', 'LtblData')">
                                <i class="bi bi-trash-fill"></i> 刪除
                            </button>
                        </div>`;
                    },
                    "width": "15%"
                },
            ],
            responsive: true,
        });
    }

    renderSurveyData(data) {
        const notesId = this.getNotesIdFromUrl();
        const stationId = this.getStationIdFromUrl();
        if (this.surveyDataTable) {
            this.surveyDataTable.destroy();
        }

        this.surveyDataTable = $(this.surveyTable).DataTable({
            data: data,
            columns: [
                {
                    data: 'id',
                    "render": (data) => {
                        return `<input type="checkbox" class="survey-checkbox" value="${data}" 

                                  ${selectedSurveyIds.includes(data) ? "checked" : ""}>`; // 添加複選框
                    },
                    "width": "5%"
                },
                { "data": "category", "width": "10%" },  
                { "data": "station", "width": "10%" },
                { "data": "pageNo", "width": "5%" },
                { "data": "documentId", "width": "20%" },
            ],
            "columnDefs": [
                {
                    // 自定義排序欄位，根據是否勾選排序
                    "targets": 0, // 自定義排序的欄位
                    "orderDataType": "checkbox-selected" // 自定義排序函數名字
                }
            ],
            responsive: true,
            "order": [[0, 'asc']],//升序排列
            "language": {
                "url": "/js/i18n/Chinese-traditional.json"
            },
            "drawCallback": function () {
                //切換daatTable頁數後保持已選中的問卷
                $('#StblData input.survey-checkbox').each(function () {
                    $(this).prop('checked', selectedSurveyIds.includes(parseInt($(this).val())));
                });
            },
        });
        // 自定義排序函數
        $.fn.dataTable.ext.order['checkbox-selected'] = function (settings, col) {
            return this.api().column(col, { order: 'index' }).nodes().map(function (cell) {
                // 根據是否在 `selectedSurveyIds` 中進行排序
                var checkboxValue = parseInt($(cell).find('.survey-checkbox').val());
                return selectedSurveyIds.includes(checkboxValue) ? 0 : 1; // 已選中返回 0, 未選中返回 1
            });
        };
    }
}



// 修改後：加入 event 參數並採用 location.reload() 更新頁面
function Delete(url, tableId) {
    event.preventDefault();
    Swal.fire({
        title: "確定刪除?",
        text: "您將無法恢復此狀態！",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "是的, 刪除它!",
        cancelButtonText: "取消"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: url,
                type: 'DELETE',
                success: function (data) {
                    if (data.success) {
                        //console.log(url);
                        location.reload();
                        toastr.success(data.message);
                    } else {
                        toastr.error(data.message || "刪除失敗");
                    }
                },
                error: function () {
                    toastr.error("伺服器出錯");
                }
            });
        }
    });
}
