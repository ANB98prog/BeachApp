"use strict"


class VSelect extends HTMLElement{

    

    constructor(){
        super();
        this._flagButtonClick = false;
    }

    connectedCallback(){

        this._APlaceholder = this.getAttribute("placeholder") || "...";
        this._AMultipleChoice = this.getAttribute("multiple");
        this._ALabel = this.getAttribute("label");
        this.name = this.getAttribute("name") || null;
        this._viewHiddenSelect = document.createElement("select");
        this._viewHiddenSelect.hidden = true;
        this.appendChild(this._viewHiddenSelect);
        this._viewHiddenSelect.name = this.name;
        this.attachShadow({mode: "open"});
        const style = document.createElement("style");
        style.innerHTML = `
            ${CCommon.STYLE_SCROLLBARS}
            *{
                margin: 0;
                padding: 0;
            }
            
            .select_box{
                width: 100%;
                margin: 2px;
                position: relative;
            }
            
            #idContainerDropDown{
                width: 100%;
                display: flex;
                align-items: center;
            }
            
            #idContainerDropDown::before{
                content: attr(label-value);
                margin-right: 5px;
                white-space: nowrap;
                align-self: flex-end;
            }
            /*Главная кнопка*/
            #idButtonDropDown{
                flex-grow: 1;
                display: flex;
                position: relative;
                width: 100%;
                border-radius: 2px;
                border: 1px solid var(--color-primary);
                padding: 5px 30px 5px 5px;
                background-color: var(--color-background);
                text-align: start;
                font-size: 16px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: var(--color-background-placeholder);
                cursor: pointer;
            }
            
            
            
            #idButtonDropDown.sChoiced{
                color: var(--color-background-on);
            }
            
            #idButtonDropDown::before {
                position: absolute;
                right: 3px;
                content: "";
                width: 15px;
                height: 8px;
                top: 50%;
                transform: translateY(-50%);
                background-color: var(--color-primary);
                clip-path: polygon(0% 0%, 100% 0%, 50% 100%, 50% 100%);
                pointer-events: none;
                z-index: 99;
              }
              #idButtonDropDown::after {
                position: absolute;
                right: 0px;
                content: "";
                width: 23px;
                height: 100%;
                top: 50%;
                transform: translateY(-50%);
                background-color: var(--color-background);
                pointer-events: none;
              }
              #idButtonDropDown:hover::before{
                background-color: var(--color-accent);
              }
            
            #idButtonDropDown:hover{
                border-color: var(--color-accent);
            }
            
            #idButtonDropDown:focus{
                outline: none;
                box-shadow: 0px 0px 2px 1px var(--color-background-on);
            }
            
            /*Items*/
            
            #idOptionsContainer{
                width: 100%;
                list-style-type: none;
                background-color: var(--color-background);
                position: absolute;
                z-index: 1;
                border-radius: 5px;
                overflow: hidden;
            }
            
            .sDropDownItem{
                border: 1px solid var(--color-primary);
                border-bottom: 0;
                padding: 5px 5px 5px 23px;
                cursor: pointer;
            }
            
            /*Стрелочка выбора*/
            .sOptionContainer1Level{
                position: relative;
            }
            
            .sOptionContainer2Level.sItemChecked::before{
                position: absolute;
                content: "";
                width: 14px;
                height: 7px;
                border: 1px solid var(--color-primary);
                background-color: var(--color-primary);
                bottom: 9px;
                left: 5px;
                clip-path: polygon(0% 0%, 10% 0%, 50% 80%, 90% 0%, 100% 0%, 50% 100%, 0% 0%);
            }
            
            .sItemChecked{
                background-color: var(--color-background-dark);
            }
            
            .sDropDownItem:last-child{
                border-radius: 0px 0px 5px 5px;
                border-bottom: 1px solid var(--color-primary);
                margin-bottom: 1px;
            }
            
            .sDropDownItem:first-child{
                border-top-left-radius: 5px;
                border-top-left-radius: 5px
            }
            
            .sDropDownItem:hover{
                background-color: var(--color-background-dark);
            }
            
            
            .sPreviewContainer{
                display: flex;
                border: 1px solid var(--color-primary);
                border-radius: 2px;
                padding: 0px 2px;
                margin: 0px 3px;
                align-items: center;
                color: var(--color-background-on);
                white-space: nowrap;
            }
            
            .sPreviewButtonDelete{
                background-color: var(--color-background);
                outline: none;
                padding: 0px 2px;
                margin: 0px 2px;
                border: none;
            }
            
            .sPreviewButtonDelete:hover{
                background-color: var(--color-primary);
                border-radius: 2px;
            }    
        `
        this.shadowRoot.innerHTML = `
        <link rel="stylesheet" type="text/css" href="/javascripts/VSelect/VSelectStyle.css">
        <div class="select_box">
            <div id="idContainerDropDown">
                <button id="idButtonDropDown" >...</button>
            </div>
            <ul id="idOptionsContainer">
            </ul>
        </div>
        `
        //this.shadowRoot.appendChild(style);
        if(this._ALabel){
            this.shadowRoot.getElementById("idContainerDropDown").setAttribute("label-value", this._ALabel);
        }
        this._viewOptionsContainer = this.shadowRoot.getElementById("idOptionsContainer");
        this._viewOptionsContainer.hidden = true;
        document.addEventListener("click", () => {
            if(!this._flagButtonClick && !this._viewOptionsContainer.hidden)
                    this._optionsContainerHiddenToggle();
            this._flagButtonClick = false;
        })
        document.addEventListener("keydown", (event) => {
            if(event.key === "Tab" || event.key == "Escape"){
                if(!this._viewOptionsContainer.hidden)
                    this._optionsContainerHiddenToggle();
            }
        })
        this._viewButton = this.shadowRoot.getElementById("idButtonDropDown");
        this._viewButton.onclick = (view) => {
            this._flagButtonClick = true;
            setTimeout(() => {
                this._optionsContainerHiddenToggle();
            })
        };
        this._updatePreviewButton();
    }

    _optionsContainerHiddenToggle(){
        this._viewOptionsContainer.hidden = !this._viewOptionsContainer.hidden;
    }

    setData(data){  
        //Сначала чистим
        this._viewOptionsContainer.innerHTML = "";
        this.values = [];
        if(data instanceof Array){
            data.forEach((el) => {
                const optionContainer2 = document.createElement("div");
                optionContainer2.className = "sOptionContainer2Level";
                const optionContainer1 = document.createElement("div");
                optionContainer1.className = "sOptionContainer1Level sDropDownItem";
                const newOption = document.createElement("li");
                newOption.innerHTML = el;
                this.values.push({value: el, checked: false})
                newOption.value = this.values.length-1;
                optionContainer1.onclick = (v) => {
                    const index = optionContainer2.firstElementChild.value;
                    this._checkedChange(index, !this.values[index].checked);
                    this._updatePreviewButton();
                    v.stopPropagation();
                    if(!(this._AMultipleChoice)){
                        //Закрываем, если не множественный выбор
                        this._optionsContainerHiddenToggle();
                    }
                };
                optionContainer2.appendChild(newOption);
                optionContainer1.appendChild(optionContainer2);
                this._viewOptionsContainer.appendChild(optionContainer1);
                const hiddenOption = document.createElement("option");
                hiddenOption.value = el;
                this._viewHiddenSelect.appendChild(hiddenOption);
            })
        }
    }

    setValue(val){
        //Устанавливаем текущее значение
        if(this._AMultipleChoice){
            
        }else if(this.values){
            //Если один выбор
            for(let i = 0; i < this.values.length; ++i){
                if(this.values[i].value === val)
                    this._checkedChange(i, true);
            }
        }
    }

    isChecked(value){
        if(this.values && value){
            for(let i = 0; i < this.values.length; ++i)
                if(this.values[i].value === value)
                    return this.values[i].checked;
        }
        return false;
    }

    getChecked(){
        if(this.values){
            const res = [];
            for(let i = 0; i < this.values.length; ++i)
                if(this.values[i].checked)
                    res.push(this.values[i].value);
            return res;
        }
        return null;
    }

    _checkedChange(index, checked){
        if(!(this._AMultipleChoice)){
            //Если только один выбор
            if(checked){
                for(let i = 0; i < this.values.length; ++i)
                    this.values[i].checked = false;
                this.values[index].checked = true;
                this._viewHiddenSelect.value = this.values[index].value;
            }
        }else{
            this.values[index].checked = checked;
        }
        //Обновляем отрисовку элементов
        for(let i = 0; i < this._viewOptionsContainer.children.length; ++i){
            const option = this._viewOptionsContainer.children[i];
            if(option){
                if(this.values[i].checked){
                    option.className = "sOptionContainer1Level sDropDownItem sItemChecked";
                    option.firstElementChild.className = "sOptionContainer2Level sItemChecked";
                }else{
                    option.className = "sOptionContainer1Level sDropDownItem";
                    option.firstElementChild.className = "sOptionContainer2Level";
                }
            }
        }
        //Обновляем отображение кнопок
        this._updatePreviewButton();
        if(this.onchange) this.onchange();
    }

    _updatePreviewButton(){
        //Перерисовываем кнопку согласно выбранным значениям
        let flagSmthCheck = false;
        this._viewButton.innerHTML = "";
        if(this.values){
            for(let i = 0; i < this.values.length; ++i){
                if(this.values[i].checked){
                    if(!(this._AMultipleChoice)){
                        //Если только один выбор
                        flagSmthCheck = true;
                        this._viewButton.innerHTML = this.values[i].value;
                        break;
                    }
                    const el = document.createElement("div");
                    el.style.display = "flex";
                    const butt = document.createElement("button");
                    butt.innerHTML = "x";
                    butt.onclick = (v) => {
                        v.stopPropagation();
                        this._checkedChange(i, !this.values[i].checked);
                        this._updatePreviewButton();
                    }
                    butt.className = "sPreviewButtonDelete";
                    el.appendChild(butt);
                    const p = document.createElement("p");
                    p.innerHTML = this.values[i].value;
                    el.appendChild(p);
                    el.className = "sPreviewContainer";
                    this._viewButton.appendChild(el);
                    flagSmthCheck = true;
                }
            }

        }
        
        if(!flagSmthCheck){
            this._viewButton.className = "";
            this._viewButton.innerHTML = this._APlaceholder;
        }else{
            this._viewButton.className="sChoiced";
        }
    }

    setEnabled(enabled){
        if(enabled === false){
            this._viewButton.classList.add("sNotActive");
        }else{
            this._viewButton.classList.remove("sNotActive");
        }
    }

}

customElements.define("v-select", VSelect);