"use strict"

class VEventForm extends HTMLElement{

    constructor(initEvent){
        super();
        if(initEvent instanceof CEvent){
            this._mEvent = initEvent;
        }
    }

    connectedCallback(){
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" type="text/css" href="/javascripts/VFormEvent/VFormEventStyle.css">
            <div id="idMainContainer">
                <div id="idContainer">
                    <div id="CaptionContainer">
                        <p id="idTypeEvent">Type Event</p>
                        <p id="idTimeEvent">Time Event</p>
                    </div>
                    <div id="idContentContainer">
                        <div id="idNavigation">
                            <div class="sMenuItemContainer">
                                <div id="idMenuOwner" class="sMenuItem">Инициатор</div>
                            </div>
                            <div class="sMenuItemContainer">
                                <div id="idMenuDataEvent" class="sMenuItem">Данные события</div>
                            </div>
                        </div>
                        <div id="idTabContainer">
                            <v-wait id="idWaitIndication"></v-wait>
                            <div id="idMenuContentContainer">
                            </div>
                        </div>
                    </div>
                    
                </div>
                <div id="idControlPanelContainer">
                    <v-image-button id="idCloseButton" src="/images/icons/close.svg"></v-image-button>
                </div>
            </div>
            
        `
        this._viewTypeEvent = this.shadowRoot.getElementById("idTypeEvent");
        this._viewTimeEvent = this.shadowRoot.getElementById("idTimeEvent");
        this._viewTabContentContainer = this.shadowRoot.getElementById("idMenuContentContainer");
        this._viewNavigationContainer = this.shadowRoot.getElementById("idNavigation");
        this._viewsNavigationItems = [
            this.shadowRoot.getElementById("idMenuOwner"),
            this.shadowRoot.getElementById("idMenuDataEvent")
        ]
        this._viewWaitIndication = this.shadowRoot.getElementById("idWaitIndication");
        this._viewCloseButton = this.shadowRoot.getElementById("idCloseButton");
        this._currentTab = 0;
        //Задаем события
        for(let i = 0; i < this._viewsNavigationItems.length; ++i)
            this._viewsNavigationItems[i]. onclick = () => {
                this._currentTab = i;
                this._update();
            }
        this._viewCloseButton.onclick = () => {
            if(this.onclose){
                this.onclose();
            }
        }
        this._update();
    }

    _update(){
        if(this._viewTimeEvent && (this._mEvent instanceof CEvent)){
            //Форма создана
            //Сбрасываем состояние
            this._viewWaitIndication.hideWait();
            //Обновляем заголовок
            this._viewTypeEvent.innerHTML = this._mEvent.eventTypeString;
            this._viewTimeEvent.innerHTML = this._mEvent.timeCreatedLocale;
            //Сбрасываем меню
            for(let i = 0; i < this._viewsNavigationItems.length; ++i)
                this._viewsNavigationItems[i].classList.remove("sActiveItem");
            if(this._currentTab != undefined)
                this._viewsNavigationItems[this._currentTab].classList.add("sActiveItem");
            //Формируем текущую вкладку
            const getViewUsersChange = (typeEvent, getUserFuncName) => {
                const temp = this._mEvent[getUserFuncName]((user) => {
                    const p = document.createElement("p");
                    const containerUserLevel1 = document.createElement("div");
                    const containerUserLevel2 = document.createElement("div");
                    const containerTitleLevel1 = document.createElement("div");
                    const containerTitleLevel2 = document.createElement("div");
                    containerUserLevel1.className = "sUserInfoContainerLevel1";
                    containerUserLevel2.className = "sUserInfoContainerLevel2";
                    containerTitleLevel1.className = "sTitleContainerLevel1";
                    containerTitleLevel2.className = "sTitleContainerLevel2";
                    p.className = "sTitleUser";
                    p.innerHTML = typeEvent;
                    containerUserLevel2.appendChild(p);
                    containerUserLevel1.appendChild(containerUserLevel2);
                    const userForm = new VFormUser(user, VFormUser.MODE_SHOW);
                    userForm.className = "sUserForm";
                    containerUserLevel2.appendChild(userForm);
                    this._viewTabContentContainer.appendChild(containerUserLevel1);
                    this._viewWaitIndication.hideWait();
                });
                if(temp === undefined){
                    //Если данные не загружены, показываем индикацию
                    this._viewWaitIndication.showWait("Загрузка данных");
                } 
            }

            const getViewGroupsChange = (typeEvent, getGroupFuncName) => {
                const temp = this._mEvent[getGroupFuncName]((group) => {
                    const p = document.createElement("p");
                    const containerGroupLevel1 = document.createElement("div");
                    const containerGroupLevel2 = document.createElement("div");
                    const containerTitleLevel1 = document.createElement("div");
                    const containerTitleLevel2 = document.createElement("div");
                    containerGroupLevel1.className = "sGroupInfoContainerLevel1";
                    containerGroupLevel2.className = "sGroupInfoContainerLevel2";
                    containerTitleLevel1.className = "sTitleContainerLevel1";
                    containerTitleLevel2.className = "sTitleContainerLevel2";
                    p.className = "sTitleUser";
                    p.innerHTML = typeEvent;
                    containerGroupLevel2.appendChild(p);
                    containerGroupLevel1.appendChild(containerGroupLevel2);
                    const groupForm = new VFormGroup(group, VFormGroup.MODE_SHOW);
                    groupForm.className = "sUserForm";
                    containerGroupLevel2.appendChild(groupForm);
                    this._viewTabContentContainer.appendChild(containerGroupLevel1);
                    this._viewWaitIndication.hideWait();
                });
                if(temp === undefined){
                    //Если данные не загружены, показываем индикацию
                    this._viewWaitIndication.showWait("Загрузка данных");
                }
            }
            this._viewTabContentContainer.innerHTML = "";
            switch(this._currentTab){
                case 0:
                    //Owner
                    const container = document.createElement("div");
                    if(this._mEvent.owner){
                        const containerOwnerForm = document.createElement("div");
                        const ownerForm = new VFormUser(this._mEvent.owner, VFormUser.MODE_SHOW);
                        containerOwnerForm.appendChild(ownerForm);
                        containerOwnerForm.className = "sOwnerFormContainer";
                        this._viewTabContentContainer.appendChild(containerOwnerForm);
                    }else{
                        const noOwner = document.createElement("div");
                        noOwner.innerHTML = "Нет данных об инициаторе события";
                        noOwner.className = "sNoOwner";
                        this._viewTabContentContainer.appendChild(noOwner);
                    }
                    break;
                case 1:
                    //Показываем данные в зависимости от типа события
                    if(this._mEvent.isUserDeleteEvent){
                        //Если это событите удаление пользователя, 
                            //показываем информацию об удаленном пользователе
                        getViewUsersChange("Удаленный пользователь", "getDeletedUser");
                    }else if(this._mEvent.isUserAddEvent){
                        //Если это событите добавление пользователя, 
                            //показываем информацию о добавленном пользователе
                        getViewUsersChange("Добавленный пользователь", "getAddedUser");
                        
                    }else if(this._mEvent.isUserChangeEvent){
                        //Если это событите изменение пользователя, 
                            //показываем информацию об измененном пользователе
                        getViewUsersChange("Измененный пользователь", "getChangedUser");
                    }else if(this._mEvent.isGroupChangeEvent){
                        //Если это событите изменение группы, 
                            //показываем информацию об измененной группе
                        getViewGroupsChange("Измененная группа", "getChangedGroup");
                    }else if(this._mEvent.isGroupDeleteEvent){
                        //Если это событите удаление группы, 
                            //показываем информацию об удаленной группе
                        getViewGroupsChange("Удаленная группа", "getDeletedGroup");
                    }else if(this._mEvent.isGroupAddEvent){
                        //Если это событите добавление группы, 
                            //показываем информацию о добавленной группе
                        getViewGroupsChange("Добавленная группа", "getAddedGroup");
                    }else if(this._mEvent.isNewDataEvent){
                        //Если это событите получения новых замерочных данных, 
                            //показываем информацию о замеренных данных
                        const temp = this._mEvent.getDataOfMeasuring((measuredData) => {
                            const graph = new VGraph(measuredData);
                            const containerDataLevel1 = document.createElement("div");
                            const containerDataLevel2 = document.createElement("div");
                            containerDataLevel1.className = "sGroupInfoContainerLevel1";
                            containerDataLevel2.className = "sGroupInfoContainerLevel2";
                            graph.className = "sGraphData"; 
                            containerDataLevel2.appendChild(graph);
                            containerDataLevel1.appendChild(containerDataLevel2);
                            this._viewTabContentContainer.appendChild(containerDataLevel1);
                            this._viewWaitIndication.hideWait();
                        })
                        if(temp === undefined){
                            //Если данные не загружены, показываем индикацию
                            this._viewWaitIndication.showWait("Загрузка данных");
                        }
                        
                    }
                    break;
            }
        }   
        
    }

    setEvent(event){
        if(event instanceof CEvent){
            this._mEvent = event;
            this._update();
        }
    }

    getEvent(){
        return this._mEvent;
    }


}

customElements.define("v-form-event", VEventForm);