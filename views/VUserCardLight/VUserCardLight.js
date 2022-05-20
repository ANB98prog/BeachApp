"use strict"

class VUserCardLight extends HTMLElement{
    
    constructor(initUser){
        super();
        if(initUser instanceof CUser)
            this._mUser = new CUser(initUser);
        else
            this._mUser = new CUser();
    }

    connectedCallback(){
        this._AShadowUse = this.getAttribute("shadow");
        //Создаем shadowDOM
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `
        <link rel="stylesheet" type="text/css" href="/javascripts/VUserCardLight/VUserCardLightStyle.css">
        <div id="idContainer">
            <div id="idAvatar">
            </div>
            <div id="idInfoContainer">  
                <p id="idFullName">Попрыгин А.Ю.</p>
                <p id="idAccountType">admin</p>
                <button id="idActButton">Выйти</button>
            <div>
        </div>
        `
        this._viewAvatar = this.shadowRoot.getElementById("idAvatar");
        this._viewInfoContainer = this.shadowRoot.getElementById("idInfoContainer");
        this._viewInfoFullName = this.shadowRoot.getElementById("idFullName");
        this._viewInfoAccountType = this.shadowRoot.getElementById("idAccountType");
        this._viewActButton = this.shadowRoot.getElementById("idActButton");
        window.addEventListener("load", () => {
            //Делаем квадратную картинку
            const style = window.getComputedStyle(this._viewAvatar)
            this._viewAvatar.style.width = 
            `calc(${this._viewInfoContainer.getBoundingClientRect().height}px -
            ${style.marginTop} - ${style.marginBottom})`
        })
        this._actTitle = "Act";
        this._updateView();
    }

    setUser(user){
        if(user instanceof CUser){
            this._mUser = new CUser(user);
            this._updateView();
        }
    }

    _updateView(){
        if(this._viewAvatar){
            if(this._mUser){
                //Формируем строку звание + ФИО
                const temp = (this._mUser.fields[CUser.MASK_RANK] ? this._mUser.fields[CUser.MASK_RANK] + " " : "") +
                (this._mUser.fields[CUser.MASK_SURNAME] ? this._mUser.fields[CUser.MASK_SURNAME] + " " : "??? ") +
                (this._mUser.fields[CUser.MASK_NAME] ? this._mUser.fields[CUser.MASK_NAME][0] + ". " : "?. ") + 
                (this._mUser.fields[CUser.MASK_PATRONYMIC] ? this._mUser.fields[CUser.MASK_PATRONYMIC][0] + ". " : "?.");
                this._viewInfoFullName.innerHTML = temp;
                const type = (this._mUser.fields[CUser.MASK_ACCOUNT_TYPE] ? this._mUser.fields[CUser.MASK_ACCOUNT_TYPE] : "?");
                const login = this._mUser.fields[CUser.MASK_LOGIN] ? this._mUser.fields[CUser.MASK_LOGIN] : "?";
                this._viewInfoAccountType.innerHTML = `логин: ${login}`;
            }
            this._viewAvatar.style.backgroundImage = `url("${CCommon.URL + "/images/usersAvatars/" + (this._mUser && this._mUser.fields[CUser.MASK_AVATAR_PATH] ? this._mUser.fields[CUser.MASK_AVATAR_PATH] : "INoPhoto.jpg")}")`;
            this._viewActButton.innerHTML = this._actTitle;
            if(this._onAct){
                this._viewActButton.onclick = this._onAct;
            }
            window.addEventListener("load",() => {
                this._updateView();
            })
        }
        
    }

    setAct(text, onact){
        if(text){
            this._actTitle = text + "";
        }
        this._onAct = onact;
    }
}

customElements.define("v-user-card-light", VUserCardLight);