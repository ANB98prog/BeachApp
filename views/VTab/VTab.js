 "use strict"

 
 class VTab extends HTMLElement{

    constructor(){
        super();
    }

    connectedCallback(){
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" type="text/css" href="/javascripts/VTab/VTabStyle.css">
            <div id="_idTabContainer" class="sHiddenWithoutAnim">
                <slot id="idContentSlot" name="content"></slot>
            </div>
        `
        this._viewTabContainer = this.shadowRoot.getElementById("_idTabContainer");
    }

    showTab(){
        this._viewTabContainer.className = "";
        this._viewTabContainer.classList.add("sVisibleAnim");
    }
    hideTab(){
        this._viewTabContainer.className = "";
        this._viewTabContainer.classList.add("sHiddenAnim");
    }

    isVisible(){
        return this._viewTabContainer.classList.contains("sVisibleAnim") || this._viewTabContainer.classList.contains("sVisibleWithoutAnim")
    }
 }

 customElements.define("v-tab", VTab);