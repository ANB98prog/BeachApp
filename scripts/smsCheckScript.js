const viewButtonCheck = document.getElementById("idButtonCheck");
const viewError = document.getElementById("idError");

const viewSMS = document.getElementById("idSMSInput");

viewSMS.onInput = () => {
    viewError.hideError();
    return true;
}

viewButtonCheck.onclick = () => {
    if(viewSMS.getValue() === "1234"){
        //Правильный код
    }else{
        viewError.showError("Неправильный код");
    }
}

window.onkeyup = (k) => {
    if(k.code === "Enter")
        viewButtonCheck.click();
}