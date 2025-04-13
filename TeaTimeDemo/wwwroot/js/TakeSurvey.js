document.addEventListener("DOMContentLoaded", function () {
    // 獲取隱藏的 input 的值
    const mceHtml = document.getElementById("MceHtml").value;

    // 獲取顯示內容的 div
    const surveyContent = document.getElementById("surveyContent");

    // 將 HTML 插入到指定的 div 中
    surveyContent.innerHTML = mceHtml;
});
