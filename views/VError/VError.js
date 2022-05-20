"use strict"

class VError extends HTMLElement{
    constructor(){
        super();
    }


    showError(error){
        const p = this.shadowRoot.getElementById("idError");
        if(p instanceof HTMLParagraphElement){
            p.innerHTML = error;
            p.className = "sErrorMessageVisible";
        }
    }

    hideError(){
        const p = this.shadowRoot.getElementById("idError");
        if(p instanceof HTMLParagraphElement){
            p.className = "sErrorMessageHidden";
        }
        
    }

    connectedCallback(){
        this.attachShadow({mode: 'open'});
        const style = document.createElement("style");
        style.innerHTML = `
            *{
                padding: 0;
                margin: 0;
            }
            
            @keyframes visibilityAnimation{
                from{
                    transform: translateX(0px);
                }
                10%{
                    transform: translateX(-4px);
                }
                30% {
                    transform: translateX(-4px);
                }
                50% {
                    transform: translateX(-2px);
                }
                70% {
                    transform: translateX(-1px);
                }
                90% {
                    transform: translateX(-1px);
                }
                20% {
                    transform: translateX(4px);
                }
                40% {
                    transform: translateX(3px);
                }
                60% {
                    transform: translateX(2px);
                }
                80% {
                    transform: translateX(1px);
                }
                to{
                    transform: translateX(0px);
                }
            }
            
            .sErrorMessageHidden{
                font-size: attr(font-size); 
                font-style: italic; 
                font-weight: bold; 
                color: var(--color-error); 
                visibility: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                padding: 1px;
            }
            
            .sErrorMessageVisible{
                font-size: attr(font-size); 
                font-style: italic; 
                font-weight: bold; 
                color: var(--color-error); 
                visibility: visible;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                padding: 1px;
                animation-name: visibilityAnimation;
                animation-duration: 0.4s;
                animation-timing-function: ease-out;
                animation-direction: alternate;
                animation-iteration-count: 1;
            }
        `;
        this.shadowRoot.innerHTML = `
        <div>
            <p id="idError" class = "sErrorMessageVisible">E</p>
        </div>
        `;
        this.shadowRoot.appendChild(style);
        this.hideError();
    }
    setFontSize(sizeStr){
        this.shadowRoot.getElementById("idError").style.fontSize = `${sizeStr}`;
    }
}
customElements.define("v-error", VError);