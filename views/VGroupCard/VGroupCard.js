"use strict"

class VGroupCard extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        //Создаем shadowDOM
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `
        <link rel="stylesheet" type="text/css" href="/javascripts/VGroupCard/VGroupCardStyle.css">
        <div id="idContainer">
            <div id="idUsersContainer">
                <div id="idControllingUsersTitle">
                    <div id="idActiveIndicatorContainer" class="sNotActive">
                    </div>
                    <p class="sCaption">Контролирующие</p>
                </div>
                <div class="sSeparator"></div>
                <div id="idControllingUsersContainer">
                </div>
                <div class="sSeparator"></div>
                <div id="idOtherUsersContainer">
                    <p id="idMedicUsersInfo" class="sOtherUsersInfo">Медики: ---</p>
                    <p id="idControlledUsersInfo" class="sOtherUsersInfo">Контролируемые: ---</p>
                </div>
            </div>
            <div id="idSettingsContainer">

            </div>
            <div id="idControlPanelContainer">
                <v-image-button id="idButtonClose" class="sControlButton" src="/images/icons/close.svg"></v-image-button>
                <v-image-button id="idButtonEdit" class="sControlButton" src="/images/icons/edit.svg"></v-image-button>
            </div>
        </div>
        `
        this._viewControllingUsersContainer = this.shadowRoot.getElementById("idControllingUsersContainer");
        this._viewMedicUsersInfo = this.shadowRoot.getElementById("idMedicUsersInfo");
        this._viewControlledUsersInfo = this.shadowRoot.getElementById("idControlledUsersInfo");
        this._viewControlPanelContainer = this.shadowRoot.getElementById("idControlPanelContainer");
        this._viewButtonClose = this.shadowRoot.getElementById("idButtonClose");
        this._viewButtonEdit = this.shadowRoot.getElementById("idButtonEdit");
        this._viewActiveIndicator = this.shadowRoot.getElementById("idActiveIndicatorContainer");
    }

    setData(group){
        if(group instanceof CGroup){
            this._mGroup = new CGroup(group);
            this._update();
        } 
    }

    addControlPanel(panelSettings){
        this._viewControlPanelContainer.classList.add("sVisible");
        if(panelSettings){
            if(panelSettings.close){
                if(panelSettings.close.visible){
                    this._viewButtonClose.classList.add("sVisible");
                }
                if(panelSettings.close.onClick){
                    this._viewButtonClose.onclick = () => {
                        panelSettings.close.onClick(this._mGroup);
                    } 
                }
            }
            if(panelSettings.edit){
                if(panelSettings.edit.visible){
                    this._viewButtonEdit.classList.add("sVisible");
                }
                if(panelSettings.edit.onClick){
                    this._viewButtonEdit.onclick = () => {panelSettings.edit.onClick(this._mGroup)};
                }
            }
        }
        
    }

    _update(){
        if(this._mGroup){
            this._viewControllingUsersContainer.innerHTML = "";
            this._viewMedicUsersInfo.innerHTML = "";
            this._viewControlledUsersInfo.innerHTML = "";
            if(this._mGroup.controllingUsers.length){
                const userCard = document.createElement("v-card-user");
                this._viewControllingUsersContainer.appendChild(userCard);
                userCard.setShadow(false)
                userCard.className = "sUserCard";
                userCard.setUser(this._mGroup.controllingUsers[0]);
                if(this._mGroup.controllingUsers.length > 1){
                    const pPlus = document.createElement("p");
                    const vPlusContainer = document.createElement("div");
                    vPlusContainer.className = "sPlusControllingContainer";
                    pPlus.className = "sPlusControllingView";
                    pPlus.innerHTML = "... +" + (this._mGroup.controllingUsers.length - 1);
                    vPlusContainer.appendChild(pPlus);
                    this._viewControllingUsersContainer.appendChild(vPlusContainer);
                }
            }else{
                const userCard = document.createElement("v-card-user");
                this._viewControllingUsersContainer.appendChild(userCard);
                userCard.style.cssText = `
                    visibility: hidden
                `
                const noUserView = document.createElement("div");
                noUserView.innerHTML = "No controlling users";
                noUserView.className = "sNoUserView";
                this._viewControllingUsersContainer.appendChild(noUserView);
            }
            if(this._mGroup.medicUsers.length){
                //Формируем строку с информацией о медиках
                let strMedics = "Медики (" + this._mGroup.medicUsers.length + "): ";
                for(let i = 0; i < this._mGroup.medicUsers.length; ++i){
                    strMedics += this._mGroup.medicUsers[i].fullName;
                    if(i != this._mGroup.medicUsers.length-1)
                        strMedics += ", ";
                }
                //Добавляем строку
                this._viewMedicUsersInfo.innerHTML = strMedics;
            }else{
                this._viewMedicUsersInfo.innerHTML = "Медики (0): ---";
            }
            if(this._mGroup.controlledUsers.length){
                //Формируем строку с информацией о контролируемых
                let strMedics = "Контролируемые (" + this._mGroup.controlledUsers.length + "): ";
                for(let i = 0; i < this._mGroup.controlledUsers.length; ++i){
                    strMedics += this._mGroup.controlledUsers[i].fullName;
                    if(i != this._mGroup.controlledUsers.length-1)
                        strMedics += ", ";
                }
                //Добавляем строку
                this._viewControlledUsersInfo.innerHTML = strMedics;
            }else{
                this._viewControlledUsersInfo.innerHTML = "Контролируемые (0): ---";
            }
            //Анализируем даты и ставим индикатор в зеленый, если группа активна, в красный - если нет
            let active = true;
            const now = new CDate();
            const dateFrom = this._mGroup.getDateFrom() ? new CDate(this._mGroup.getDateFrom()) : undefined;
            const dateUntil = this._mGroup.getDateUntil() ? new CDate(this._mGroup.getDateUntil()) : undefined;new CDate()
            if(dateFrom && (now < dateFrom)){
                //если текущее время меньше даты начала функционирования группы
                active = false;
            }
            if(dateUntil && (now > dateUntil))
                active = false;
            this._viewActiveIndicator.className = active ? "sActive" : "sNotActive";
            //Выводим настройки
        }
    }
}

customElements.define("v-group-card", VGroupCard);