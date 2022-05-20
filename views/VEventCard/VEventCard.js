"use strict"

class VEventCard extends HTMLElement{
    constructor(initValue){
        super();
        if(initValue instanceof CEvent)
            this._mEvent = initValue;
    }

    connectedCallback(){
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" type="text/css" href="/javascripts/VEventCard/VEventCardStyle.css">
            <div id="idContainer" class="sNotRead">
                <div id="idEventTypeContainer">
                    <p id="idEventTypeTitle">Unknown type</p>
                </div>
                <div id="idInfoContainer" class="sCaptionContainer">
                    <p id="idDateCreateShow">date unknown</p>
                </div>
                <div id="idOwnerCaptionContainer" class="sCaptionContainer">
                    Owner
                </div>
                <div id="idOwnerViewContainer">
                    OwnerView
                </div>
                <div id="idControlCaptionContainer" class="sCaptionContainer">
                    Control
                </div>
                <div id="idControlPanelContainer">
                    <v-image-button id="idMoreInfoButton" src="/javascripts/VEventCard/imgs/info.svg"></v-image-button>
                </div>
            </div>
        `
        this._viewContainer = this.shadowRoot.getElementById("idContainer");
        this._viewDateCreateShow = this.shadowRoot.getElementById("idDateCreateShow");
        this._viewOwnerViewContainer = this.shadowRoot.getElementById("idOwnerViewContainer");
        this._viewMoreInfoButton = this.shadowRoot.getElementById("idMoreInfoButton");
        //Задаем события
        this._viewContainer.onclick = () => {
            this._viewContainer.classList.remove("sNotRead")
        }
        this._viewMoreInfoButton.onclick = () => {
            if(this.onInfoShow)
                this.onInfoShow(this._mEvent);
        }
        //Обновляем view
        this._update();
    }

    setData(event){
        if(event instanceof CEvent){
            this._mEvent = event;
            this._update();
        }
    }

    getEvent(){
        return this._mEvent;
    }

    setReadStatus(readStatus){
        if(readStatus === true)
            this._viewContainer.classList.remove("sNotRead");
    }

    _update(){
        if(this._mEvent){
            const viewTypeEvent = this.shadowRoot.getElementById("idEventTypeTitle");
            viewTypeEvent.innerHTML = this._mEvent.eventTypeString;
            //Определяем "владельца" события
            this._viewOwnerViewContainer.innerHTML = "";
            if(this._mEvent.fields[CEvent.MASK_OWNER]){
                //Есть владелец
                const user = new CUser(this._mEvent.fields[CEvent.MASK_OWNER]);
                const ownerView = new VUserCard();
                this._viewOwnerViewContainer.appendChild(ownerView);
                ownerView.setUser(user);
                ownerView.set
            }else{
                const p = document.createElement("p");
                p.innerHTML = "No Owner";
                p.className = "sNoOwnerText";
                this._viewOwnerViewContainer.appendChild(p);
            }
            this._viewDateCreateShow.innerHTML = this._mEvent.timeCreatedLocale;
        }
        
    }
}

customElements.define("v-event-card", VEventCard);