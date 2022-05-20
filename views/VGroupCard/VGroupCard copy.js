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
            <div id="idActiveIndicatorContainer" class="sNotActive">
            </div>
            <div id="idUsersContainer">
                <div class="sUsersCaption">
                    <p class="sCaption">Контролирующие</p>
                </div>
                <div id="idControllingUsersContainer" class="sUsersContainer">
                    
                </div>
                <div class="sUsersCaption">
                    <p class="sCaption">Медики</p>
                </div>
                <div id="idMedicUsersContainer" class="sUsersContainer">
                </div>
                <div class="sUsersCaption">
                    <p class="sCaption">Контролируемые</p>
                </div>
                <div id="idControlledUsersContainer" class="sUsersContainer">
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
        this._viewMedicUsersContainer = this.shadowRoot.getElementById("idMedicUsersContainer");
        this._viewControlledUsersContainer = this.shadowRoot.getElementById("idControlledUsersContainer");
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
            this._viewMedicUsersContainer.innerHTML = "";
            this._viewControlledUsersContainer.innerHTML = "";
            const noUserView = document.createElement("div");
            noUserView.innerHTML = `
                <p class="sNoUsers">No Users</p>
            `
            noUserView.classList.add("sNoUsersContainer");
            if(this._mGroup.controllingUsers.length){
                const userCard = document.createElement("v-card-user");
                this._viewControllingUsersContainer.appendChild(userCard);
                userCard.className = "sUserCard";
                userCard.setUser(this._mGroup.controllingUsers[0]);
                if(this._mGroup.controllingUsers.length > 1){
                    const pPlus = document.createElement("p");
                    const vPlusContainer = document.createElement("div");
                    vPlusContainer.className = "sPlusIndicatorContainer";
                    pPlus.className = "sPlusIndicator";
                    pPlus.innerHTML = "... +" + (this._mGroup.controllingUsers.length - 1);
                    vPlusContainer.appendChild(pPlus);
                    this._viewControllingUsersContainer.appendChild(vPlusContainer);
                }
            }else{
                this._viewControllingUsersContainer.appendChild(noUserView.cloneNode(true));
            }
            if(this._mGroup.medicUsers.length){
                const userCard = document.createElement("v-card-user");
                this._viewMedicUsersContainer.appendChild(userCard);
                userCard.className = "sUserCard";
                userCard.setUser(this._mGroup.medicUsers[0]);
                if(this._mGroup.medicUsers.length > 1){
                    const pPlus = document.createElement("p");
                    const vPlusContainer = document.createElement("div");
                    vPlusContainer.className = "sPlusIndicatorContainer";
                    pPlus.className = "sPlusIndicator";
                    pPlus.innerHTML = "... +" + (this._mGroup.medicUsers.length - 1);
                    vPlusContainer.appendChild(pPlus);
                    this._viewMedicUsersContainer.appendChild(vPlusContainer);
                }
            }else{
                this._viewMedicUsersContainer.appendChild(noUserView.cloneNode(true));
            }
            if(this._mGroup.controlledUsers.length){
                const userCard = document.createElement("v-card-user");
                this._viewControlledUsersContainer.appendChild(userCard);
                userCard.className = "sUserCard";
                userCard.setUser(this._mGroup.controlledUsers[0]);
                if(this._mGroup.controlledUsers.length > 1){
                    const pPlus = document.createElement("p");
                    const vPlusContainer = document.createElement("div");
                    vPlusContainer.className = "sPlusIndicatorContainer";
                    pPlus.className = "sPlusIndicator";
                    pPlus.innerHTML = "... +" + (this._mGroup.controlledUsers.length - 1);
                    vPlusContainer.appendChild(pPlus);
                    this._viewControlledUsersContainer.appendChild(vPlusContainer);
                }
            }else{
                this._viewControlledUsersContainer.appendChild(noUserView.cloneNode(true));
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
        }
    }
}

customElements.define("v-group-card", VGroupCard);