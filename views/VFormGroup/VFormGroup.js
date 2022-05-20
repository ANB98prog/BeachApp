"use strict"

class VFormGroup extends HTMLElement{

    static _TAB_NUM_CONTROLLING_USERS = 0;
    static _TAB_NUM_MEDIC_USERS = 1;
    static _TAB_NUM_CONTROLLED_USERS = 2;
    static _TAB_NUM_GROUP_SETTINGS = 3;
    
    static MODE_SHOW = 1;
    static MODE_REDACTION = 2;

    constructor(initGroup, initMode){
        super();
        if(initGroup instanceof CGroup){
            this._mGroup = new CGroup(initGroup);
        }else{
            this._mGroup = new CGroup();
        }
        if(initMode == VFormGroup.MODE_SHOW)
            this._mode = initMode;
        else
            this._mode = VFormGroup.MODE_REDACTION;
        this._shownTabNum = -1;
    }

    connectedCallback(){
        //Создаем shadowDOM
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `
        <link rel="stylesheet" type="text/css" href="/javascripts/VFormGroup/VFormGroupStyle.css">
        <form id="idForm">
            <div id="idNavigation">
                <div class="sMenuItemContainer">
                    <div id="idMenuControlling" class="sMenuItem">Контролирующие</div>
                </div>
                <div class="sMenuItemContainer">
                    <div id="idMenuMedic" class="sMenuItem">Медики</div>
                </div>
                <div class="sMenuItemContainer">
                    <div id="idMenuControlled" class="sMenuItem">Контролируемые</div>
                </div>
                <span style="width: 100%; height: 1px; background-color: var(--color-background-on)"></span>
                <div class="sMenuItemContainer">
                    <div id="idMenuGroupSettings" class="sMenuItem">Настройки</div>
                </div>
            </div>
            <div id="idTabView">
                <div id="idTableUsersContainer">
                    <div style="display: flex; height: 100%; width: 100%">
                        <v-table id="idTableUsers"></v-table>
                        <div id="idTableControlPanelContainer">
                            <v-image-button id="idCloseUsersTableButton" src="/images/icons/close.svg"></v-image-button>
                        </div>
                    </div>
                </div>
                <div class="sTabContent1Level">
                    <div id="idTabContent">
                        
                    </div>
                </div>
                <div id="idContolTabPanelContainer">
                    <v-image-button id="idCloseFormButton" src="/images/icons/close.svg" class="sControlButton"> </v-image-button>
                    <v-image-button id="idAddUserButton" src="/images/icons/edit.svg" class="sControlButton sVisible" placeholder="Редактировать"> </v-image-button>
                    <v-image-button id="idButtonSaveGroup" src="/images/icons/save.svg" class="sControlButton"> </v-image-button>
                </div>
            </div>
        </form>
        `
        this._viewTabContent = this.shadowRoot.getElementById("idTabContent");
        this._viewMainTabContentContainer = this.shadowRoot.getElementById("idMainTabContentContainer");
        this._viewTableUsersContainer = this.shadowRoot.getElementById("idTableUsersContainer"); 
        this._viewMenuItems = [this.shadowRoot.getElementById("idMenuControlling"),
            this.shadowRoot.getElementById("idMenuMedic"),
            this.shadowRoot.getElementById("idMenuControlled"),
            this.shadowRoot.getElementById("idMenuGroupSettings")
        ];
        this._viewContolPanelContainer = this.shadowRoot.getElementById("idContolTabPanelContainer");
        this._viewCloseFormButton = this.shadowRoot.getElementById("idCloseFormButton");
        this._viewButtonSaveGroup = this.shadowRoot.getElementById("idButtonSaveGroup");
        this._viewButtonCloseUsersTable = this.shadowRoot.getElementById("idCloseUsersTableButton");
        const funcOnItemMenuClick = (e) => {
            const target = e.target;
            //Сбрасываем классы во всех других MenuItems
            for(let i = 0; i < this._viewMenuItems.length; ++i)
                this._viewMenuItems[i].className = "sMenuItem";
            target.className = "sMenuItem sActiveItem";
            switch (target.id) {
                case "idMenuControlling":
                    this._showTab(VFormGroup._TAB_NUM_CONTROLLING_USERS);
                    break;
                case "idMenuMedic":
                    this._showTab(VFormGroup._TAB_NUM_MEDIC_USERS);
                    break;
                case "idMenuControlled":
                    this._showTab(VFormGroup._TAB_NUM_CONTROLLED_USERS);
                    break;
                case "idMenuGroupSettings":
                    this._showTab(VFormGroup._TAB_NUM_GROUP_SETTINGS);
                    break;
                default:
                    break;
            }
        }
        for(let i = 0; i < this._viewMenuItems.length; ++i){
            this._viewMenuItems[i].onclick = funcOnItemMenuClick;
        }
        this._viewAddUserButton = this.shadowRoot.getElementById("idAddUserButton");
        this._viewTable = this.shadowRoot.getElementById("idTableUsers")
        this._viewButtonCloseUsersTable.onclick = () => {
            this._viewTableUsersContainer.className = "sTableUserContainerHidden";
            this._updateForm();
        }
        this._errors = {};
        //Инициализируем view
        this._showTab(VFormGroup._TAB_NUM_CONTROLLING_USERS);
        this._updateForm();
    }

    setData(group){
        if(group instanceof CGroup){
            this._mGroup = new CGroup(group);
            this._updateForm();
        }
    }

    addControlPanel(panelSettings){
        if(panelSettings){
            this._viewContolPanelContainer.className = "sVisible";
            if(panelSettings.close){
                if(panelSettings.close.visible === true){
                    this._viewCloseFormButton.classList.add("sVisible")
                    if(panelSettings.close.onClick){
                        this._viewCloseFormButton.onclick = panelSettings.close.onClick;
                   }
                   if(panelSettings.close.placeholder){
                       this._viewCloseFormButton.setPlaceholder(panelSettings.save.placeholder);
                   }
                }
            }
            if(panelSettings.save){
                if(panelSettings.save.visible === true){
                    this._viewButtonSaveGroup.classList.add("sVisible")
                    if(panelSettings.save.onClick){
                        this._viewButtonSaveGroup.onclick = () => {
                            const groupForSave = new CGroup(this._mGroup);
                            //Меняем настройки в зависимости от чеков
                            if(this._settingsGroup){
                                if(this._settingsGroup.datesEnabled != true){
                                    groupForSave.clearDates();
                                }
                            }
                            let error;
                            for(let key in this._errors){
                                if(this._settingsGroup.datesEnabled){
                                    if(key === "dateUntil"){
                                        error = "error";
                                        break;
                                    }
                                    if(key === "dateFrom"){
                                        error = "error";
                                        break;
                                    }
                                }
                                
                            }
                            panelSettings.save.onClick(groupForSave, error);
                        };
                   }
                   if(panelSettings.save.placeholder){
                       this._viewButtonSaveGroup.setPlaceholder(panelSettings.save.placeholder);
                   }
                }
            }
        }
    }

    _showTab(tabNum){
        //Обнуляем навигацию
        for(let i = 0; i < this._viewMenuItems.length; ++i)
            this._viewMenuItems[i].className = "sMenuItem";
        this._viewMenuItems[tabNum].className = "sMenuItem sActiveItem";
        let userType = -1;
        let includeUserFunction = null;
        let addUserFunction = null;
        let deleteUserFunction = null;
        //Скрываем таблицу
        this._viewTableUsersContainer.className = "";
        switch (tabNum) {
            case VFormGroup._TAB_NUM_CONTROLLING_USERS:
                this._shownTabNum = VFormGroup._TAB_NUM_CONTROLLING_USERS;
                userType = 2;
                includeUserFunction = (user) => {return this._mGroup.includeControllingUser(user)};
                addUserFunction = (user) => {this._mGroup.addControllingUsers(user)};
                deleteUserFunction = (user) => {this._mGroup.deleteControllingUser(user)};
                this._showUsersTab(this._mGroup.controllingUsers, "Нет контролирующих");
                break;
            case VFormGroup._TAB_NUM_MEDIC_USERS:
                this._shownTabNum = VFormGroup._TAB_NUM_MEDIC_USERS;
                userType = 3;
                includeUserFunction = (user) => {return this._mGroup.includeMedicUser(user)};
                addUserFunction = (user) => {this._mGroup.addMedicUsers(user)};
                deleteUserFunction = (user) => {this._mGroup.deleteMedicUser(user)};
                this._showUsersTab(this._mGroup.medicUsers, "Нет медиков");
                break;
            case VFormGroup._TAB_NUM_CONTROLLED_USERS:
                this._shownTabNum = VFormGroup._TAB_NUM_CONTROLLED_USERS;
                userType = 4;
                includeUserFunction = (user) => {return this._mGroup.includeControlledUser(user)};
                addUserFunction = (user) => {this._mGroup.addControlledUsers(user)};
                deleteUserFunction = (user) => {this._mGroup.deleteControlledUser(user)};
                this._showUsersTab(this._mGroup.controlledUsers, "Нет контролируемых");
                break;    
            case VFormGroup._TAB_NUM_GROUP_SETTINGS:
                this._shownTabNum = VFormGroup._TAB_NUM_GROUP_SETTINGS;
                this._showGroupSettingsTab();
                break;
            default:
                this._viewTabContent.innerHTML = "";
                break;
        }
        if(this._mode == VFormGroup.MODE_REDACTION){
            //Переопределяем кнопку
            this._viewAddUserButton.onclick = (e) => {
                this._viewTableUsersContainer.className = "sTableUserContainerVisible";
                this._viewTable.showWait();
                CRequest.getUsersByAccountType(userType, (res)=>{
                    const dataForTable = CDataFormatter.fromDataBaseUsersToVTable(res.data);
                    dataForTable.headers.push({header: "", search: false, type: "control"})
                    for(let i = 0; i < dataForTable.data.length; ++i){
                        dataForTable.data[i].push({typeContent: "checkbox", getValue: (rowData) => {
                            const user = new CUser(rowData);
                            return includeUserFunction ? includeUserFunction(user) : false;
                        }, onChange: (checked, row)=>{
                            if(checked == true){
                                //Если добавить пользователя в группу
                                //Добавляем карточку пользователя в preview
                                if(addUserFunction)
                                    addUserFunction([new CUser(row.data)]);
                            }else{
                                //Если удалить пользователя, удаляем карточку из preview
                                if(deleteUserFunction)
                                    deleteUserFunction(new CUser(row.data));
                            }
                        }})
                    }
                    this._viewTableUsersContainer.className = "sTableUserContainerVisible";
                    this._viewTable.setHeaders(dataForTable.headers)
                    this._viewTable.showData(dataForTable.data);
                    this._viewTable.addLineNumberColumn();
                    this._viewTable.hideWait();
                })
            }
        }
        
    }

    _showUsersTab(data, noUsersMessage){
        this._viewTabContent.innerHTML = "";
        //Редактируем панель 
        this._viewAddUserButton.classList.add("sVisible");
        //Перерисовываем tabContent
        if(data && (data instanceof Array) && data.length){
            //Если есть пользователи, то выводим их
            for(let i = 0; i < data.length; ++i){
                if(data[i] instanceof CUser){
                    const card = new VUserCard();
                    const cardContainer = document.createElement("div");
                    cardContainer.className = "sUserCardContainer";
                    card.className = "sUserCard";
                    cardContainer.appendChild(card);
                    this._viewTabContent.appendChild(cardContainer);
                    card.setUser(data[i]);
                }
            }
        }else{
            //Иначе нет пользователей
            const noUsersContainer = document.createElement("div");
            const noUsersImg = document.createElement("div");
            const noUsersTitle = document.createElement("p");
            if(noUsersMessage)
                noUsersTitle.innerHTML = noUsersMessage;
            else
                noUsersTitle.innerHTML = "NO USERS";
            if(this._mode == VFormGroup.MODE_REDACTION){
                noUsersImg.className = "sNoUserImgRedactionMode";
            }else{
                noUsersImg.className = "sNoUserImgShowMode";
            }
            
            noUsersTitle.className = "sNoUserTitle";
            noUsersContainer.className = "sNoUserContainer";
            noUsersContainer.appendChild(noUsersImg);
            noUsersContainer.appendChild(noUsersTitle);
            noUsersImg.onclick = () => {
                if(this._viewAddUserButton.onclick)
                    this._viewAddUserButton.onclick()
            };
            this._viewTabContent.appendChild(noUsersContainer);
        }
    }


    _updateForm(){
        this._showTab(this._shownTabNum);
        this._checkErrors();
    }

    _showGroupSettingsTab(){
        this._viewTabContent.innerHTML = "";
        //Редактируем панель 
        this._viewAddUserButton.classList.remove("sVisible");
        //Формируем таб
        this._viewSettingsTab = document.createElement("div");
        this._viewSettingsTab.className = "sSettingsContainer";
        this._viewSettingsTab.innerHTML = `
            <div class="sSetting">
                <div class="sSettingsEnableDateContainer">
                    <div class="sSettingTitleContainer">
                        <input id="idEnableDate" type="checkbox" value="chbDates"></input>
                        <p style="padding: 0 5px">Время работы группы</p>
                    </div>
                </div>
                <div class="sSettingsDatesContainer">
                    <v-input id="idSettingsDateFrom" type="datetime" caption="Дата начала" class="sSetting"></v-input>
                    <v-input id="idSettingsDateUntil" type="datetime" caption="Дата окончания" class="sSetting"></v-input>
                    <div id="idAutodeleteCheckContainer" class="sCheckBoxSetting">
                        <input id="idAutodeleteCheck" type="checkbox" checked="true"></input>
                        <p>Автоудаление группы по истечению времени функционирования</p>
                    </div>
                </div>
            </div>
        `
        this._viewTabContent.appendChild(this._viewSettingsTab);
        const enableDate = this.shadowRoot.getElementById("idEnableDate");
        const dateFrom = this.shadowRoot.getElementById("idSettingsDateFrom");
        const dateUntil =  this.shadowRoot.getElementById("idSettingsDateUntil");
        const autodeleteCheck = this.shadowRoot.getElementById("idAutodeleteCheck");
        const autodeleteCheckContainer = this.shadowRoot.getElementById("idAutodeleteCheckContainer");
        autodeleteCheck.checked = this._mGroup && this._mGroup.autodelete != undefined ? this._mGroup.autodelete : true;
        if(this._settingsGroup === undefined){
            this._settingsGroup = {
                datesEnabled: this._mGroup.getDateFrom() || this._mGroup.getDateUntil()
            };
        }
        enableDate.checked = this._settingsGroup.datesEnabled;
        if(this._mode == VFormGroup.MODE_SHOW){
            dateFrom.setEnabled(false);
            dateUntil.setEnabled(false);
            dateFrom.setValue(this._mGroup.getDateFrom());
            dateUntil.setValue(this._mGroup.getDateUntil());
            autodeleteCheck.disabled = true;
            enableDate.disabled = true;
        }else{
            const showSettingsErrors = (source) => {
                dateUntil.hideError();
                dateFrom.hideError();
                this._errors = {};
                const error = this._mGroup.checkDates();
                if(error === "now > until"){
                    //ошибка - дата окончания меньше текущей даты
                    this._errors.dateUntil = "Время окончания должно быть больше текущего времени";
                }else if(error === "from > until"){
                    if(source === "dateUntil")
                        this._errors.dateUntil = "Время окончания должно быть больше времени начала";
                    else
                        this._errors.dateFrom = "Время начала должно быть меньше времени окончания";
                }
                for(let key in this._errors){
                    switch(key){
                        case "dateUntil":
                            if(this._settingsGroup.datesEnabled)
                                dateUntil.showError(this._errors[key], true);
                        break;
                        case "dateFrom":
                            if(this._settingsGroup.datesEnabled)
                                dateFrom.showError(this._errors[key], true);
                        break;
                    }
                }
                this._checkErrors();
            }
            
            dateFrom.onchange = (oldValue, newValue) => {
                try{
                    const date = new CDate(newValue);
                    this._mGroup.setDateFrom(date);
                    updateSettingsViews();
                }catch(ex){}
            }
            dateUntil.onchange = (oldValue, newValue) => {
                try{
                    const date = new CDate(newValue);
                    this._mGroup.setDateUntil(date);
                    updateSettingsViews();
                }catch(ex){}
            }
            autodeleteCheck.onchange = () => {
                if(autodeleteCheck.checked != undefined){
                    this._mGroup.setAutodelete(autodeleteCheck.checked);
                }
            }
            var updateSettingsViews = () => {
                //Обновляем видимость
                dateFrom.setEnabled(this._settingsGroup.datesEnabled);
                dateUntil.setEnabled(this._settingsGroup.datesEnabled);
                autodeleteCheck.disabled = !this._settingsGroup.datesEnabled;
                if(this._settingsGroup.datesEnabled)
                    autodeleteCheckContainer.classList.remove("sDisabled")
                else
                    autodeleteCheckContainer.classList.add("sDisabled")
                //Проверяем ошибки
                showSettingsErrors();
                this._checkErrors();
                //обновляем значения в полях
                dateFrom.setValue(this._mGroup.getDateFrom());
                dateUntil.setValue(this._mGroup.getDateUntil());
                autodeleteCheck.checked = this._mGroup.autodelete;
                
            }
    
            enableDate.onchange = (e) => {
                this._settingsGroup.datesEnabled = e.target.checked;
                updateSettingsViews();
            }       
            updateSettingsViews();
        }
        
        
    }

    _checkErrors(){
        let settingsErrorNum = 0;
        for(let key in this._errors){
            switch(key){
                case "dateUntil":
                    if(this._settingsGroup.datesEnabled)
                        settingsErrorNum++;
                break;
                case "dateFrom":
                    if(this._settingsGroup.datesEnabled)
                        settingsErrorNum++;
                break;
            }
        }
        if(settingsErrorNum){
            //Показываем ошибки
            this._viewMenuItems[3].parentNode.classList.add("sMenuError");
            this._viewMenuItems[3].parentNode.style.cssText = `
                --error-num: "${settingsErrorNum}"
            `
        }else{
            this._viewMenuItems[3].parentNode.classList.remove("sMenuError");
        }
    }
    
}

customElements.define("v-form-group", VFormGroup);