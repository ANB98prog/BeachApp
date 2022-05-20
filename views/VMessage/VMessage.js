"use strict"

class VMessage extends HTMLElement{

    static MESSAGE_TYPE_INFO = "info";
    static MESSAGE_TYPE_EVENT = "event";

    constructor(initMessage, initMessageContent){
        super();
        this._mMessageObj = {};
        if(initMessage)
            this._setData(initMessage, initMessageContent);
    }

    connectedCallback(){

        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" type="text/css" href="/javascripts/VMessage/VMessageStyle.css">
            <div id="idMessageContainer">
                <div id="idHeader">
                    <div id="idTypeIconContainer">
                    </div>
                    <p id="idMessageTitle"></p>
                    <v-image-button id="idExpandButton" src="/javascripts/VMessage/imgs/expand.svg"></v-image-button>
                    <v-image-button id="idCloseButton" src="/images/icons/close.svg"></v-image-button>
                </div>
                <div id="idContentContainer" hidden>Test</div>
            </div>
        `
        this._viewMessageContainer = this.shadowRoot.getElementById("idMessageContainer");
        this._viewContentContainer = this.shadowRoot.getElementById("idContentContainer");
        this._viewMessageTitle = this.shadowRoot.getElementById("idMessageTitle");
        this._viewTypeIcon = this.shadowRoot.getElementById("idTypeIconContainer");
        this._viewCloseButton = this.shadowRoot.getElementById("idCloseButton");
        this._viewExpandButton = this.shadowRoot.getElementById("idExpandButton");
        
        this._viewExpandButton.onclick = (e) => {
            this._viewExpandButton.classList.toggle("sExpand");
            this._viewContentContainer.hidden = !this._viewContentContainer.hidden;
        }
        this._viewCloseButton.onclick = (e) => {
            if(this.parentElement){
                this.parentElement.removeChild(this)
            }
        }
        this.showMessage();
    }

    _setData(message, messageContent){
        if((typeof message) === "string"){
            //Если просто текстовое сообщение
            this._mMessageObj.message = {};
            this._mMessageObj.message.title = message;
            this._mMessageObj.message.message = messageContent;
            this._mMessageObj.type = VMessage.MESSAGE_TYPE_INFO;
        }else if(message instanceof CEvent){
            //Если сообщение типа "Новое событие"
            this._mMessageObj.message = message;
            this._mMessageObj.type = VMessage.MESSAGE_TYPE_EVENT;
        }
    }

    showMessage(message){
        if(message)
            this._setData(message);
        this._update(); 
    }

    _update(){
        if(this._mMessageObj){
            switch(this._mMessageObj.type){
                case VMessage.MESSAGE_TYPE_INFO: 
                    this._viewTypeIcon.style.cssText = `--url-type-image: url("/javascripts/VMessage/imgs/info.svg");`;
                    if(this._mMessageObj.message){
                        this._viewMessageTitle.innerHTML = this._mMessageObj.message.title + " (" + (new Date()).toLocaleTimeString("ru-RU") + ")";
                        this._viewContentContainer.innerHTML = this._mMessageObj.message.message;
                    }
                    break;
                case VMessage.MESSAGE_TYPE_EVENT:
                    this._viewTypeIcon.style.cssText = `--url-type-image: url("/javascripts/VMessage/imgs/event.svg");`;
                    this._viewMessageTitle.innerHTML = `${this._mMessageObj.message.eventTypeString} (${this._mMessageObj.message.timeCreatedLocale})`;
                    const view = new VUserCard(this._mMessageObj.message.owner);
                    this._viewContentContainer.innerHTML = "";
                    this._viewContentContainer.appendChild(view);
                    break;
            }
        }
    }
}

customElements.define("v-message", VMessage);