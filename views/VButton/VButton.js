"use strict"

class VButton extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        //Запоминаем атрибуты
        this.AType = this.getAttribute("type") || "button";
        this.AOnClick = this.getAttribute("onclick") || null;
        this.AValue = this.getAttribute("value") || "button";
        this._ADisabled = this.getAttribute("disabled") || "false";
        this._ARounded = this.getAttribute("rounded") !== "false";
        const buttonSubmit = document.createElement("input");
        buttonSubmit.type = "submit";
        buttonSubmit.hidden = true;
        buttonSubmit.id = "idHiddenButtonSubmit";
        this.appendChild(buttonSubmit);
        //Создаем shadow DOM
        this.attachShadow({mode: "open"});
        const style = document.createElement("style");
        style.innerHTML = `
            .sButton {
                box-sizing: inherit;
                width: inherit;
                font-family:'Times New Roman', Times, serif;
                font-weight: x-large;
                color: var(--color-background-on);
                background-color: var(--color-background);
                border-width: 1px;
                padding: 6px 14px 6px 14px;
            }

            .sRounded{
                border-radius: 15px;
            }

            .sButton.sButtonEnabled:hover{
                color: var(--color-primary-on);
                background-color: var(--color-primary);
            }

            .sButtonEnabled{
                cursor: pointer;
            }
            .ButtonDisabled{
                cursor: default;
            }
        `
        switch(this.AType){
            case "submit":
                this.shadowRoot.innerHTML =  `
                <input id="idButton" type="submit" class="sButton sButtonEnabled" value="${this.AValue}"></input>
                `
            break;
            default:
                this.shadowRoot.innerHTML =  `
                <button id="idButton" class="sButton sButtonEnabled">${this.AValue}</button>
                `
        }
        this.shadowRoot.appendChild(style);
        //Настройка кнопки
        this._viewButton = this.shadowRoot.getElementById("idButton");
        if(this._ARounded){
            this._viewButton.classList.add("sRounded");   
        }
        if(this._viewButton instanceof HTMLButtonElement || this._viewButton instanceof HTMLInputElement){
            this.setDisabled(this._ADisabled === "true");
            this._viewButton.onmousedown = () => {
                this._viewButton.style.boxShadow = "inset 0 0 5px 0px rgba(0,0,0,0.4)";
            }
            this._viewButton.onmouseup = () => {
                this._viewButton.style.boxShadow = "0 0 0 0";
            }
            this._viewButton.onmouseleave = () =>{
                this._viewButton.style.boxShadow = "0 0 0 0";
            }
            if(this.AType === "submit"){
                this._viewButton.onclick = () => {
                    this.firstElementChild.click();//Вызываем клик скрытого input submit
                }
            }
            //Дублируем необходимые события
            this._viewButton.onclick = this.onclick;
        }
    }

    setDisabled(disabled){
        if(disabled && (typeof disabled) === "boolean"){
            this._viewButton.disabled = true;
            if(this._viewButton.className.indexOf("sButtonEnabled") != -1){
                this._viewButton.classList.remove("sButtonEnabled");
                this._viewButton.classList.add("sButtonDisabled");
            }else if(this._viewButton.className.indexOf("sButtonDisabled") == -1){
                this._viewButton.classList.add("sButtonDisabled");
            }
            this._ADisabled = "true";
        }else{
            this._viewButton.disabled = false;
            this._ADisabled = "false";
            if(this._viewButton.className.indexOf("sButtonDisabled") != -1){
                this._viewButton.classList.remove("sButtonDisabled");
                this._viewButton.classList.add("sButtonEnabled");
            }else if(this._viewButton.className.indexOf("sButtonEnabled") == -1){
                this._viewButton.classList.add("sButtonEnabled");
            }
        }
    }

    get value(){
        return this._value;
    }

    set value(value){
        if(this._viewButton){
            if(this._viewButton instanceof HTMLInputElement)
                this._viewButton.value = value || "button";
            else
                this._viewButton.innerHTML = value || "button";
        }
        this._value = value;
    }
}
customElements.define("v-button", VButton);