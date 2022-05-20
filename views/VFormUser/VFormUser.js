


class VFormUser extends HTMLElement{
    
    static MODE_REDACTION = 1;
    static MODE_SHOW = 2;

    constructor(initUser, mode){
        super();
        if(initUser instanceof CUser){
            this._newData = new CUser(initUser);
            this._oldData = new CUser(initUser);
        }else{
            this._newData = new CUser();
            this._oldData = new CUser();
        }
        if(mode){
            switch(mode){
                case VFormUser.MODE_REDACTION:
                    this._mode = mode;
                    break;
                case VFormUser.MODE_SHOW:
                    this._mode = mode;
                    break;
                default:
                    this._mode = VFormUser.MODE_REDACTION;
            }
        }else{
            this._mode = VFormUser.MODE_REDACTION;
        }
        
    }

    connectedCallback(){
        this._AActionValue = this.getAttribute("actionValue") || null;
        //Формируем shadowDOM
        this.attachShadow({mode: "open"});
        this._initUserForm();
        this._updateFields();
    }

    setData(data){
        if(data instanceof CUser){
            this._oldData = data;
            this._newData = data;
            this._updateFields();
        }
    }

    showError(maskField, error){
        if(CUser.maskExist(maskField) && error){
            const inputView = this.shadowRoot.getElementById("id"+maskField);
            inputView.showError(error);
        }
    }

    hideAllErrors(){
        const inputs = this.shadowRoot.querySelectorAll(".sInputField");
        for(let i = 0; i < inputs.length; ++i)
            if(inputs[i] instanceof VInput)
                inputs[i].hideError();
    }

    _updateFields(){
        if(this._viewForm && this._newData){
            for(let field in this._newData.fields){
                if(field !== CUser.MASK_AVATAR_PATH){
                    const f = this.shadowRoot.getElementById("id"+field);
                    if(f.setEnabled)
                        f.setEnabled(true);
                    if(f instanceof HTMLInputElement){
                        if(f.type === "text"){
                            f.value = this._newData.fields[field];
                        }
                    }else if(f instanceof VInput || f instanceof VSelect){
                        f.setValue(this._newData.fields[field]);
                    }
                }else{
                    //Если это аватар, пробуем его подгрузить
                    const imageName = this._newData.fields[field] ? this._newData.fields[field] : "INoPhoto.jpg";
                    const imgSrc = "/images/usersAvatars/" + imageName;
                    this._viewPreviewAvatar.src = imgSrc;
                    this._viewPreviewAvatar.onerror = () => {
                        console.log("error read file " + imgSrc)
                    }
                }
            }
            if(this._mode == VFormUser.MODE_REDACTION){
                this._viewAddImageButton.onclick = (e) => {
                    const viewAddImageInput = document.createElement("input");
                    viewAddImageInput.type = "file";
                    viewAddImageInput.hidden = true;
                    viewAddImageInput.accept = "image/*"
                    viewAddImageInput.name = CUser.MASK_AVATAR_PATH;
                    viewAddImageInput.id = "id" + CUser.MASK_AVATAR_PATH;
                    this._viewForm.appendChild(viewAddImageInput);
                    this._viewAddImageInput = viewAddImageInput;
                    this._viewAddImageInput.click();
                    this._viewAddImageInput.onchange = (e) => {
                        const fileReader = new FileReader();
                        fileReader.onload = () => {
                            this._viewPreviewAvatar.src = fileReader.result;
                        }
                        fileReader.readAsDataURL(e.target.files[0])
                    }
                }
            }else if(this._mode == VFormUser.MODE_SHOW){
                //Скрываем поле пароль 
                this._viewButtonAct.hidden = true;
                for(let field in this._newData.fields){
                    const f = this.shadowRoot.getElementById("id"+field);
                    if(f instanceof VInput){
                        f.setEnabled(false);
                        if(f.getValue() === undefined || f.getValue() === "")
                            f.setValue("---")
                    }else if(f instanceof VSelect){
                        f.setEnabled(false);
                    }
                }
                const f = this.shadowRoot.getElementById("id"+CUser.MASK_PASSWORD);
                if(f)
                    f.parentNode.hidden = true;
            }
        }        
    }

    resetFormData(){
        this._newData = new CUser();
        this._oldData = new CUser();
        this._updateFields();
    }

    _initUserForm(){
        const style = document.createElement("style");
        style.innerHTML = `
            ${CCommon.STYLE_SCROLLBARS}
            *{
                --avatar-size-width: 150px;
                --avatar-size-height: calc(1.25*var(--avatar-size-width));
            }
            #idFormContainer{
                display: flex;
                box-sizing: border-box;
                height: 100%;
                width: 100%;
                overflow: auto;
                justify-items: center;
                align-items: flex-start;
            }
            .sContainer{
                position: relative;
                display: flex;
                flex-direction: column;
                flex-grow: 1;
            }

            .sContainerWithImg{
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .sContainerWithImgForData{
                display: block;
                flex-direction: column;
                flex-grow: 25;
                align-self: stretch;
                justify-content: flex-start;
            }

            /*отрисовка аватарки*/
            .sAvatarContainer{
                border: 1px solid var(--color-background-on);
                outline: none;
                position: relative;
                flex-grow: 25;
                max-width: 165px;
                aspect-ratio: 3 / 4;
            }

            .sAvatar{
                max-width: 100%;
                aspect-ratio: inherit;
                padding: 2px;
            }

            #idPreviewAvatar{
                width: 100%;
                height: 100%;
                object-fit: contain;
                text-align: center;
            }

            .sAddAvatar{
                width: 100%;
                height: 100%;
                position: absolute;
            }

            .sAddAvatar:hover{
                background: linear-gradient(90deg, rgba(var(--color-background-components),0.3) 0%, 
                    rgba(var(--color-background-on-components), 0.15) 15%,
                    rgba(var(--color-background-on-components), 0.3) 50%,
                    rgba(var(--color-background-on-components), 0.15) 85%,
                    rgba(var(--color-background-components),0.15) 100%);
            }

            .sAddAvatar:hover::before{
                --size: 24%;
                --size-plus-thickness: 5%;
                content: "";
                width: var(--size);
                height: calc(0.75*var(--size));
                top: calc(50% - 0.75*var(--size)/2);
                left: calc(50% - var(--size)/2);
                position: absolute;
                background-color: var(--color-background-placeholder);
                z-index: 2;
                clip-path: polygon(calc(50% - var(--size-plus-thickness)) 0%,
                    calc(50% + var(--size-plus-thickness)) 0%,
                    calc(50% + var(--size-plus-thickness)) calc(50% - var(--size-plus-thickness)), 
                    100% calc(50% - var(--size-plus-thickness)), 
                    100% calc(50% + var(--size-plus-thickness)), 
                    calc(50% + var(--size-plus-thickness)) calc(50% + var(--size-plus-thickness)), 
                    calc(50% + var(--size-plus-thickness)) 100%, 
                    calc(50% - var(--size-plus-thickness)) 100%, 
                    calc(50% - var(--size-plus-thickness)) calc(50% + var(--size-plus-thickness)), 
                    0% calc(50% + var(--size-plus-thickness)), 
                    0% calc(50% - var(--size-plus-thickness)), 
                    calc(50% - var(--size-plus-thickness)) calc(50% - var(--size-plus-thickness)));
            }

            /*Поля ввода*/
            .sInputContainer{
                padding: 5px 5px 10px 5px;
                border-top: 1px solid var(--color-background-dark);
            }

            /*Кнопка submit*/
            #idSubmitButtonContainer{
                background-color: var(--color-background);
                position: sticky;
                bottom: 0;
                display: flex;
                justify-content: end;
            }

            #idSubmitButton{
                box-sizing: border-box;
                margin: 0px 5px 5px 5px;
                width: 100%;
            }

        `;
        this.shadowRoot.innerHTML = `
        <!-- <link rel="stylesheet" type="text/css" href="/javascripts/VFormUser/VFormUserStyle.css"> -->
        <div id="idFormContainer">
            <form id="idForm" name="nameForm" class="sContainer">
                <div class="sContainerWithImg">
                    <div class="sAvatarContainer">
                        <div id="idAddImageButton" class="sAddAvatar"></div>
                        <div style="padding: 5px" class="sAvatar">
                            <img id="idPreviewAvatar" class="sAvatarImg"/>
                        </div>
                    </div>
                    <input id="id${CUser.MASK_ID}" name="${CUser.MASK_ID}" type="text" hidden="true">
                    <div class="sContainerWithImgForData">
                        <div class="sInputContainer">
                            <v-input id="id${CUser.MASK_SURNAME}" name="${CUser.MASK_SURNAME}" caption="Фамилия" class="sInputField" errorHidden="true"></v-input>
                        </div>
                        <div class="sInputContainer">
                            <v-input id="id${CUser.MASK_NAME}" name="${CUser.MASK_NAME}" caption="Имя" class="sInputField" errorHidden="true"></v-input>
                        </div>
                        <div class="sInputContainer">
                            <v-input id="id${CUser.MASK_PATRONYMIC}" name="${CUser.MASK_PATRONYMIC}" caption="Отчество" class="sInputField" errorHidden="true"></v-input>
                        </div>
                        <div  class="sInputContainer">
                            <v-input id="id${CUser.MASK_BIRTHDAY}" type="date" name="${CUser.MASK_BIRTHDAY}" caption="Дата рождения" class="sInputField" errorHidden="true"></v-input>
                        </div>
                    </div>
                </div>
                <div class="sInputContainer">
                    <v-input id="id${CUser.MASK_RANK}" name="${CUser.MASK_RANK}" caption="Воинское звание" class="sInputField" errorHidden="true"></v-input>
                </div> 
                <div class="sInputContainer">
                    <v-input id="id${CUser.MASK_POST}" name="${CUser.MASK_POST}" caption="Должность" class="sInputField" errorHidden="true"></v-input>
                </div> 
                <div class="sInputContainer">
                    <v-input id="id${CUser.MASK_PLACE}" name="${CUser.MASK_PLACE}" caption="Место службы" class="sInputField" errorHidden="true"></v-input>
                </div>
                <div  class="sInputContainer">
                    <v-select id="id${CUser.MASK_ACCOUNT_TYPE}" name="${CUser.MASK_ACCOUNT_TYPE}" class="sInputField" label="Тип аккаунта"></v-select>
                </div>
                <div  class="sInputContainer">
                    <v-input id="id${CUser.MASK_LOGIN}" type="login" name="${CUser.MASK_LOGIN}" validate="true" caption="Логин" class="sInputField"></v-input>
                </div>
                <div  class="sInputContainer">
                    <v-input id="id${CUser.MASK_PASSWORD}" name="${CUser.MASK_PASSWORD}" type="password" validate="true" caption="Пароль" class="sInputField"></v-input>
                </div>
                <div id="idSubmitButtonContainer">
                    <v-button id="idSubmitButton" type="button" value="${this._AActionValue ?? "Act"}"/>
                </div>
            </form>
        </div>
        `;
        this.shadowRoot.appendChild(style);
        this._viewForm = this.shadowRoot.getElementById("idForm");
        this._viewAddImageButton = this.shadowRoot.getElementById("idAddImageButton");
        this._viewPreviewAvatar = this.shadowRoot.getElementById("idPreviewAvatar");
        this._viewButtonAct = this.shadowRoot.getElementById("idSubmitButton");
        this._viewSelectAccountType = this.shadowRoot.getElementById("idaccountType");
        this._viewSelectAccountType.setData(["1","2","3","4"]);
        this._viewSelectAccountType.setValue("4");
    }

    setAvailableValues(mask, availableValues){
        if(mask && availableValues){
            const inputField = this.shadowRoot.getElementById("id"+mask)
            if(inputField)
                inputField.setAvailableValues(availableValues);
        }
    }

    _validateUser(){
        let flagErrorExist = false;
        const formElements = this.shadowRoot.getElementById("idForm").elements;
        const flagErrorMap = Array.from({length: formElements.length}).map(()=>{return false;})
       /* //Проверяем наличие фамилии
        if(!(formElements.surname.value)){
            //Если нет фамилии
            flagErrorExist = true;
            flagErrorMap[0] = true;
            this.shadowRoot.getElementById("idsurname").showError("Данное поле обязательно для заполнения");
        }
        //Проверяем наличие имени
        if(!(formElements.name.value)){
            flagErrorExist = true;
            flagErrorMap[1] = true;
            this.shadowRoot.getElementById("idname").showError("Данное поле обязательно для заполнения");
        }*/
        //Проверяем корректность даты рождения
        if(formElements.birthday.value){
            const birthday = new Date(formElements.birthday.value);
            const now = new Date();
            const now100yearsAgo = (new Date()).setFullYear(now.getFullYear() - 120);
            if(birthday >= now || birthday <= now100yearsAgo){
                flagErrorExist = true;
                flagErrorMap[3] = true;
                this.shadowRoot.getElementById(`id${CUser.MASK_BIRTHDAY}`).showError("Некорректная дата рождения");
                this.shadowRoot.getElementById(`id${CUser.MASK_BIRTHDAY}`).scrollIntoView();
            }
        }
        //Проверяем наличие и корректность логина
        if(!(formElements.login.value)){
            if(!flagErrorExist)
                this.shadowRoot.getElementById(`id${CUser.MASK_LOGIN}`).scrollIntoView();
            this.shadowRoot.getElementById(`id${CUser.MASK_LOGIN}`).showError("Данное поле обязательно для заполнения");
            flagErrorExist = true;
            flagErrorMap[7] = true;
        }
        //Проверяем наличие и корректность пароля
        if(!(formElements.password.value)){
            if(!flagErrorExist)
                this.shadowRoot.getElementById(`id${CUser.MASK_PASSWORD}`).scrollIntoView();
            flagErrorExist = true;
            flagErrorMap[8] = true;
            this.shadowRoot.getElementById(`id${CUser.MASK_PASSWORD}`).showError("Данное поле обязательно для заполнения");
        }else if(formElements.password.length < 6){
            if(!flagErrorExist)
                this.shadowRoot.getElementById(`id${CUser.MASK_PASSWORD}`).scrollIntoView();
            flagErrorExist = true;
            flagErrorMap[8] = true;
            this.shadowRoot.getElementById(`id${CUser.MASK_PASSWORD}`).showError("Пароль должен быть не менее 6 символов");
        }
        return !flagErrorExist;
    }

    get actValue(){
        return this._AActionValue;
    }

    set actValue(value){
        if(this._viewButtonAct){
            this._viewButtonAct.value = value;
        }
        this._AActionValue = value || "Act";
    }

    set onact(value){
        if(this._viewButtonAct)
            this._viewButtonAct.onclick = () => {
                
                if(this._validateUser()){
                    const elements = this._viewForm.elements;
                    const objRes = {};
                    for(let i = 0; i < elements.length; ++i){
                        if(elements[i].value){
                            if(elements[i].name === CUser.MASK_BIRTHDAY)
                                objRes[elements[i].name] = new CDate(elements[i].value); 
                            else
                                objRes[elements[i].name] = elements[i].value; 
                        }
                            
                    }
                    //Формируем formData
                    const formData = new FormData(this._viewForm);
                    value(new CUser(objRes), formData);  
                }
            };
    }
}

customElements.define("v-form", VFormUser)