"use strict"

class VUserCard extends HTMLElement{
    
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
        const style = document.createElement("style");
        style.innerHTML = `
            ${CCommon.STYLE_SCROLLBARS}
            *{
                --font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
                --font-size: 20px;
            }
            
            #idUserCardContainer{
                box-sizing: border-box;
                display: flex;
                align-items: stretch;
                width: 100%;
                background-color: inherit;
                box-shadow: 0 0 4px 0 var(--color-background-on);
                overflow-x: auto;
                font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
            }
            
            
            
            /*Идентификаторное значение*/
            #idIdentificatorContainer{
                display: flex;
                align-items: center;
                max-width: 5%;
                max-height: 100%;
                padding: 0 5px;
            }
            
            #idIdentificatorContainer div{
                width: 100%;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                text-align: center;
            }
            
            #idIdentificator{
                font-family: var(--font-family);
                font-size: var(--font-size);
                margin: auto;
                text-align: center;
                text-overflow: ellipsis;
            }
            
            /*аватарка*/
            #idAvatar{
                max-height: 75px;
                aspect-ratio: 3/4;
                object-fit: contain;
                padding: 2px 2px;
                border-left: thin solid var(--color-background-on);
                border-right: thin solid var(--color-background-on);
            }
            
            /*Основная информация*/
            #idInfoUserContainer{
                display: flex;
                flex-direction: column;
                border-right: thin solid var(--color-background-on);
                align-items: center;
                justify-content: center;
                flex-grow: 1;
            }
            .sTextContainer{
                display: flex;
                align-items: center;
            }
            .sTextField{
                padding: 0 5px;
                font-family: var(--font-family);
                font-size: var(--font-size);
            }
            .sAccountTypeField{
                font-style: italic;
            }            

        `
        this.shadowRoot.innerHTML = `
        <link rel="stylesheet" type="text/css" href="/javascripts/VUserCard/VUserCardStyle.css">
        <div id="idUserCardContainer" ${(this._AShadowUse !== "false") ? `class="sWithShadow"` : ""}>
            <div id="idIdentificatorContainer">
                <div>
                    <span id="idIdentificator" hidden="true">1</span>
                </div>
            </div>
            <img id="idAvatar"/>
            <div id="idInfoUserContainer">
                <div>
                    <span id="idRankFullName" class="sTextField"></span>
                </div>
                <div>
                    <span id="idTypeLogin" class="sTextField sAccountTypeField"></span>
                </div>
            </div>
        </div>
        `
       // this.shadowRoot.appendChild(style);
        this._viewUserCardContainer = this.shadowRoot.getElementById("idUserCardContainer");
        this._viewIdentificator = this.shadowRoot.getElementById("idIdentificator");
        this._viewAvatar = this.shadowRoot.getElementById("idAvatar");
        this._viewRankFullName = this.shadowRoot.getElementById("idRankFullName");
        this._viewTypeLogin = this.shadowRoot.getElementById(`idTypeLogin`);
        this.setUser(this._mUser);
    }

    setUser(user){
        if(user instanceof CUser){
            if(this._viewUserCardContainer){
                this._mUser = new CUser(user);
                this._updateView();
            }else{
                this.onload = () => {
                    this._mUser = new CUser(user);
                    this._updateView();
                }
            }
        }
    }

    setShadow(shadowUse){
        if(this._viewUserCardContainer){
            if(shadowUse)
                this._viewUserCardContainer.classList.add("sWithShadow")
            else
                this._viewUserCardContainer.classList.remove("sWithShadow");
        }else{
            this.onload = () => {
                this.setShadow(shadowUse);
            }
        }
        
    }

    _updateView(){
        if(this._viewRankFullName && this._viewTypeLogin && this._viewAvatar){
            if(this._mUser){
                //Формируем строку звание + ФИО
                const temp = (this._mUser.fields[CUser.MASK_RANK] ? this._mUser.fields[CUser.MASK_RANK] + " " : "") +
                (this._mUser.fields[CUser.MASK_SURNAME] ? this._mUser.fields[CUser.MASK_SURNAME] + " " : "??? ") +
                (this._mUser.fields[CUser.MASK_NAME] ? this._mUser.fields[CUser.MASK_NAME][0] + ". " : "?. ") + 
                (this._mUser.fields[CUser.MASK_PATRONYMIC] ? this._mUser.fields[CUser.MASK_PATRONYMIC][0] + ". " : "?.");
                this._viewRankFullName.innerHTML = temp;
                const type = (this._mUser.fields[CUser.MASK_ACCOUNT_TYPE] ? this._mUser.fields[CUser.MASK_ACCOUNT_TYPE] : "?");
                const login = this._mUser.fields[CUser.MASK_LOGIN];
                this._viewTypeLogin.innerHTML = `Тип аккаунта: ${type} (${login})`;
            }
            this._viewAvatar.src = CCommon.URL + "/images/usersAvatars/" + (this._mUser && this._mUser.fields[CUser.MASK_AVATAR_PATH] ? this._mUser.fields[CUser.MASK_AVATAR_PATH] : "INoPhoto.jpg");
        }else{
            this.onload = () => {
                this._updateView();
            }
        }
        
    }
}

customElements.define("v-card-user", VUserCard);