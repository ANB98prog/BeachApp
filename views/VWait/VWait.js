"use strict";

class VWait extends HTMLElement{

    constructor(){
        super();
    }

    connectedCallback(){
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" type="text/css" href="/javascripts/VWait/VWaitStyle.css">
            <div id="idWaitContainer">
                <div id="idWait">
                </div>
                <p id="idTextWait">Test</p>
            </div>
        `
        this._viewWaitContainer = this.shadowRoot.getElementById("idWaitContainer");
        this._viewWait = this.shadowRoot.getElementById("idWait");
        this._viewTextWait = this.shadowRoot.getElementById("idTextWait");
    }

    showWait(message){
        this._viewTextWait.hidden = false;
        if(message)
            this._viewTextWait.innerHTML = message+"...";
        else if(message !== null)
            this._viewTextWait.innerHTML = "Ожидайте...";
        else
            this._viewTextWait.hidden = true;
        this._viewWaitContainer.classList.add("sVisible");
    }

    hideWait(){
        this._viewWaitContainer.classList.remove("sVisible");
    }

    setFullHeightMode(direction){
        this._viewWaitContainer.classList.add("sFullHeightMode");
        this._viewTextWait.classList.add("sFullHeightMode");
        this._viewWait.classList.add("sFullHeightMode");
    }
}

customElements.define("v-wait", VWait);