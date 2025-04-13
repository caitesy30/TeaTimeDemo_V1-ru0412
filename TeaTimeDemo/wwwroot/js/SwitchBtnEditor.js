class SwitchBtnEditor {

    static CreateSwitchBtn() {
        const switchBtn = document.createElement("label");
        switchBtn.classList.add("switch");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        const span = document.createElement("span");
        span.classList.add("slider");

        switchBtn.appendChild(checkbox);

        switchBtn.appendChild(span);

        return switchBtn;
    }





}


//<label class="switch">
//    <input type="checkbox">
//     <span class="slider"></span>
//</label>



//<div>
//    <label class="switch">
//        <input type="radio" name="toggle" value="option1">
//        <span class="slider"></span>
//    </label>
//    <label class="switch">
//        <input type="radio" name="toggle" value="option2">
//        <span class="slider"></span>
//    </label>
//</div>