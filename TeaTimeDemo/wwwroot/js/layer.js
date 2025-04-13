var dataTable;

$(document).ready(function () {

    loadDataTable();
    

    $('#addToCatForm').on('submit', function (e) {
        e.preventDefault();//防止預先提交，後續再手動提交已選中問卷

        $('#addToCatFrom input[name="SelectedSurveyIds[]"]').remove();//清空先前所製造的input



        //每個List中的選中問卷添加隱藏input
        selectedSurveyIds.forEach(function (id) {
            $('<input>').attr({
                type: 'hidden',
                name: 'SelectedSurveyIds[]',//這個要與controller參數名相同
                value: /*$(this).val()*/id,
            }).appendTo('#addToCatForm');
        });

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
});

/*顯示隱藏新增表單*/
function ToggleForm() {
    var form = document.getElementById("NewPageSection");
    if (form.style.display === "none") form.style.display = "block";
    else form.style.display = "none";
}


function loadDataTable(categoryId) {
    //alert(categoryId);
    dataTable4 = $('#LtblData').DataTable({
        "ajax": {
            url: ``,
            type: "Get",
            datatype: "json",
            "dataSrc": "data"
        },
        "flexedHeader": true,
        "columns": [
            { "data": "name", "width": "15%" },
            { "data": "order", "width": "15%" },
            {"data": "description", "width": "15%" },
            {
                data: 'id',
                "render": function (data, type, row) {
                    //alert("function"+categoryId);
                    return `
                        <div class="w-75 btn-group" role="group">
                            <a href="/customer/pagegroup/Layer?id=${data}" class="btn btn-primary mx-2" >
                                <i class="bi bi-pencil-square"></i> 編輯
                            </a>
                            <button class="btn btn-danger mx-2" onClick="Delete('/customer/pagegroup/delete/${data}')">
                                <i class="bi bi-trash-fill"></i> 刪除
                            </button>
                        </div>`;
                },
                "width": "15%"
            }
        ],
        "language": {
            "url": "/js/i18n/Chinese-traditional.json"
        }
    });
}

function Delete(url) {
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
                    dataTable.ajax.reload();
                    toastr.success(data.message);
                }
            })
        }
    });
}
