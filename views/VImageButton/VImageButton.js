
class VImageButton extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        this._ASrc = this.getAttribute("src") || null;
        this._AColor = this.getAttribute("color") || "var(--color-background-on)";
        this._APlaceholder = this.getAttribute("placeholder");
        this._AText = this.getAttribute("text") || "";
        //Создаем shadowDOM
        this.attachShadow({mode: "open"});
        const style = document.createElement("style");
        style.innerHTML = `
            ${CCommon.STYLE_SCROLLBARS}
            div{
                box-sizing: border-box;
                display: flex;
                width: calc(100%-4px);
                height: calc(100%-4px);
                padding: 2px;
                align-items: center;
                justify-content: center;
                position: relative;
                background-color: inherit;
            }
            
            button{
                -webkit-touch-callout: none; /* iOS Safari */
                -webkit-user-select: none;   /* Chrome/Safari/Opera */
                -khtml-user-select: none;    /* Konqueror */
                -moz-user-select: none;      /* Firefox */
                -ms-user-select: none;       /* Internet Explorer/Edge */
                user-select: none;  
                color: var(--color);
                background-color: var(--color);
                -webkit-mask: var(--src) center / contain no-repeat;
                mask: var(--src) center / contain no-repeat;
                width: 100%;
            }
            
            
            div:hover::before{
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                content: "";
                background-color: black;
                opacity: 0.1;
            }
            
        `
        this.shadowRoot.innerHTML = `
        <link rel="stylesheet" type="text/css" href="/javascripts/VImageButton/VImageButtonStyle.css">
        <div id="idContainer">
            <button id="button">ss</button>
            <div id="idBackground">
            </div>
            <div id="idTextContainer">
                <p id="idText"></p>
            </div>
            <div id="idPlaceholderContainer">
                <p id="idPlaceholder"></p>
            </div>
            
        </div>
        `;
        //this.shadowRoot.appendChild(style);
        this._viewButton = this.shadowRoot.getElementById("button");
        this._viewContainer = this.shadowRoot.getElementById("idContainer");
        this._viewPlaceholderContainer = this.shadowRoot.getElementById("idPlaceholderContainer");
        this._viewPlaceholder = this.shadowRoot.getElementById("idPlaceholder");
        this._viewTextContainer = this.shadowRoot.getElementById("idTextContainer");
        this._viewText = this.shadowRoot.getElementById("idText");
        this._viewButton.onclick = this.onclick;
        this._fontSize = `medium`;
        this._updateStyles();
        this.setText(this._AText);
        this.setPlaceholder(this._APlaceholder);
    }

    setSrc(src){
        this._ASrc = src;
        this._updateStyles();
    }

    setSize(size1, size2){
        if((typeof size1) === "number" && size1 > 0){
            this._fontSize = `${size1}px`;
        }else if((typeof size1) === "string"){
            this._fontSize = size1;
        }
        if(size2){
            if((typeof size2) === "number" && size2 > 0){
                this._ButtonSize = `${size2}px`;
            }else if((typeof size2) === "string"){
                this._ButtonSize = size2;
            }
        }else{
            if((typeof size1) === "string")
                this._ButtonSize = this._fontSize + "";
            else
                this._ButtonSize = this._fontSize + 0;
        }
        this._updateStyles();
    }

    setText(text){
        if(text){
            this._AText = text;
            this._viewTextContainer.classList.remove("sHidden");
            this._viewText.innerHTML = text;
        }else{
            this._viewTextContainer.classList.add("sHidden");
        }
    }

    changeTextVisibility(visibility){
        if(visibility)
            this._viewTextContainer.classList.remove("sHidden");
        else
            this._viewTextContainer.classList.add("sHidden");
    }

    _updateStyles(){
        this._viewButton.style.cssText = `
            --color: ${this._AColor};
            --src: url(${this._ASrc});
            --font: ${this._ButtonSize};
        `;
        this._viewTextContainer.style.cssText = `
            --color: ${this._AColor};
            --font: ${this._fontSize};
        `;
    }

    setPlaceholder(placeholder){
        if((typeof placeholder) === "string"){
            this._viewPlaceholder.innerHTML = placeholder;
            this._viewContainer.onmouseover = () => {
                this._placeholderVisibilityTimeout = setTimeout(()=>{
                    this._viewPlaceholderContainer.className = "sVisibility";
                }, 800)
            }
            this._viewContainer.onmouseout = () => {
                if(this._placeholderVisibilityTimeout)
                    clearTimeout(this._placeholderVisibilityTimeout);
                this._viewPlaceholderContainer.className = "";
            }
        }
    }

    
}

customElements.define("v-image-button", VImageButton);