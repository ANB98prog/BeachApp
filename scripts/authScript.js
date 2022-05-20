const viewButtonIn = document.getElementById("idButtonIn");
const viewButtonReg = document.getElementById("idButtonReg")
const viewError = document.getElementById("idError");

const viewLogin = document.getElementById("idLoginInput");
const viewPassword = document.getElementById("idPasswordInput");

const mUsers = [{login: "7", password: "123456", type: 1},
            {login: "8", password: "123456", type: 2}];


viewLogin.onInput = (e) => {
    const symbol = e.data;
    if(viewLogin.getValue().length == 0 && symbol){
        if(symbol !== "8" && symbol !== "7"){
            viewLogin.showError("Введите номер телефона (79XXXXXXXXX)")
            return false;
        }
    }
    if(viewLogin.getValue().length == 1){
        if(symbol !== "9"){
            viewLogin.showError("Введите номер телефона (79XXXXXXXXX)")
            return false;
        }
    }
    viewError.hideError();
    viewLogin.hideError();
    return viewLogin.getValue().length < 11;
}

viewPassword.oninput = () => {
    viewError.hideError();
}

viewButtonIn.onclick = () => {
    const login = viewLogin.getValue();
    const password = viewPassword.getValue();
    for(let i = 0; i < mUsers.length; ++i){
        if(mUsers[i].login === login){
            if(mUsers[i].password === password){
                alert("Тип пользователя " + mUsers[i].type)
                window.location.href = "/smsCheck";
                return;
            }else{
                viewError.showError("Неправильный пароль");
                return;
            }
        }
    }
    viewError.showError("Пользователь не найден")
}

viewButtonReg.onclick = () => {
    window.location.href = "/registration/chooseUserType";
}   

window.onkeyup = (k) => {
    if(k.code === "Enter")
        viewButtonIn.click();
}