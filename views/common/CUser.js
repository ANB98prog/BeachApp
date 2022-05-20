

class CUser{
    //avatarPath
    //surname
    //name
    //patronymic
    //birthday
    //rank (воинское звание)
    //post (должность)
    //place (место службы/работы)
    //login
    //password
    //accountType


    static get MASK_ID(){return "_id"};
    static get MASK_NAME(){return "name"};
    static get MASK_SURNAME(){return "surname"};
    static get MASK_PATRONYMIC(){return "patronymic"}
    static get MASK_AVATAR_PATH(){return "avatarPath"}
    static get MASK_BIRTHDAY(){return "birthday"}
    static get MASK_RANK(){return "rank"}
    static get MASK_POST(){return "post"}
    static get MASK_PLACE(){return "place"}
    static get MASK_LOGIN(){return "login"}
    static get MASK_PASSWORD(){return "password"}
    static get MASK_ACCOUNT_TYPE(){return "accountType"}

    static get _MASKS(){return [CUser.MASK_ID, CUser.MASK_AVATAR_PATH, 
        CUser.MASK_SURNAME,
        CUser.MASK_NAME, 
        CUser.MASK_PATRONYMIC,
        CUser.MASK_BIRTHDAY,
        CUser.MASK_RANK,
        CUser.MASK_POST,
        CUser.MASK_PLACE,
        CUser.MASK_LOGIN,
        CUser.MASK_PASSWORD,
        CUser.MASK_ACCOUNT_TYPE]};

    static maskExist(mask){
        for(let i = 0; i<CUser._MASKS.length; ++i)
            if(CUser._MASKS[i] === mask)
                return true;
        return false;
    }
    

    static indexOfMask(mask){
        for(let i = 0; i < CUser._MASKS.length; ++i)
            if(CUser._MASKS[i] === mask)
                return i;
        return -1;
    }

    get fields(){
        return this._mUser;
    }

    static maskOfIndex(index){
        return CUser._MASKS[index];
    }

    constructor(initValue){
        this._mUser = {};
        if(initValue && initValue instanceof Array){
            for(let i = 0; i < initValue.length && i < CUser._MASKS.length; ++i){
                const mask = CUser.maskOfIndex(i);
                if(mask === CUser.MASK_BIRTHDAY){
                    try{
                        if(initValue[i])
                            this._mUser[mask] = new CDate(initValue[i] + "");
                    }catch(ex){}
                }else 
                    this._mUser[mask] = initValue[i] + "";
            }
        }else if(initValue && (initValue instanceof CUser)){
            for(let i = 0; i < CUser._MASKS.length; ++i)
                this._mUser[CUser._MASKS[i]] = initValue.fields[CUser._MASKS[i]];
        }else if(initValue && ((typeof initValue) === "object")){
            for(let key in initValue){
                if(key === CUser.MASK_BIRTHDAY){
                    if(initValue[key] instanceof CDate)
                        this._mUser[key] = initValue[key];
                    else{
                        try{
                            if(initValue[key])
                                this._mUser[key] = new CDate(initValue[key]);
                        }catch(ex){}
                    }
                }else{
                    const index = CUser.indexOfMask(key);
                    if(index != -1){
                        this._mUser[key] = initValue[key];
                    }
                }
                
            }
        }else{
            //Если нет инициализирующего значения
            for(let i = 0; i < CUser._MASKS.length; ++i){
                this._mUser[CUser.maskOfIndex(i)] = "";
            }
        }
    }

    get fullName(){
        return  (this.fields[CUser.MASK_RANK] ? this.fields[CUser.MASK_RANK] + " " : "") + 
            (this.fields[CUser.MASK_SURNAME] ? this.fields[CUser.MASK_SURNAME] : "-") + " " +
            (this.fields[CUser.MASK_NAME] ? this.fields[CUser.MASK_NAME].substring(0,1) + "." : "-") + " " +
            (this.fields[CUser.MASK_PATRONYMIC] ? this.fields[CUser.MASK_PATRONYMIC].substring(0,1) + "." : "-");
    }

    toArray(){
        let res = [];
        if(this._mUser){
            for(let i = 0; i < CUser._MASKS.length; ++i){
                if(this._mUser[CUser._MASKS[i]])
                    res.push(this._mUser[CUser._MASKS[i]]);
                else
                    res.push("");
            }

        }
        return res;
    }

    isEqual(user){
        if(user instanceof CUser){
            if(this._mUser[CUser.MASK_ID]){
                return this._mUser[CUser.MASK_ID] === user.fields[CUser.MASK_ID];
            }else{
                return this._mUser[CUser.MASK_LOGIN] === user.fields[CUser.MASK_LOGIN]
            }
        }else
            return false;
            
    }
}

class CGroup{
    //_id
    //controllingUsers
    //medicUsers
    //controlledUsers
    //fromDate
    //toDate

    static get MASK_ID(){return "_id"};
    static get MASK_CONTROLLING_USERS(){return "controllingUsers"};
    static get MASK_MEDIC_USERS(){return "medicUsers"};
    static get MASK_CONTROLLED_USERS(){return "controlledUsers"}
    static get MASK_FROM_DATE(){return "fromDate"}
    static get MASK_TO_DATE(){return "toDate"}
    static get MASK_AUTODELETE(){return "autodelete"}

    static get _MASKS(){return [CGroup.MASK_ID, 
        CGroup.MASK_CONTROLLING_USERS, 
        CGroup.MASK_MEDIC_USERS, 
        CGroup.MASK_CONTROLLED_USERS, 
        CGroup.MASK_FROM_DATE,
        CGroup.MASK_TO_DATE,
        CGroup.MASK_AUTODELETE
    ]};

    static maskExist(mask){
        for(let i = 0; i<CGroup._MASKS.length; ++i)
            if(CGroup._MASKS[i] === mask)
                return true;
        return false;
    }
    
    get _id(){
        return this._mGroup[CGroup.MASK_ID];
    }

    set _id(value){
        this._mGroup[CGroup.MASK_ID] = value;
    }

    get controllingUsers(){
        return this._mGroup[CGroup.MASK_CONTROLLING_USERS];
    }

    get controlledUsers(){
        return this._mGroup[CGroup.MASK_CONTROLLED_USERS];
    }

    get medicUsers(){
        return this._mGroup[CGroup.MASK_MEDIC_USERS];
    }

    static indexOfMask(mask){
        for(let i = 0; i < CGroup._MASKS.length; ++i)
            if(CGroup._MASKS[i] === mask)
                return i;
        return -1;
    }

    get fields(){
        return this._mGroup;
    }

    get controllingUsers(){
        return this._mGroup[CGroup.MASK_CONTROLLING_USERS] ? this._mGroup[CGroup.MASK_CONTROLLING_USERS] : [];
    }

    get medicUsers(){
        return this._mGroup[CGroup.MASK_MEDIC_USERS] ? this._mGroup[CGroup.MASK_MEDIC_USERS] : [];
    }

    get controlledUsers(){
        return this._mGroup[CGroup.MASK_CONTROLLED_USERS] ? this._mGroup[CGroup.MASK_CONTROLLED_USERS] : [];
    }
    get autodelete(){
        return this.fields[CGroup.MASK_AUTODELETE];
    }

    maskOfIndex(index){
        return CGroup._MASKS[index];
    }
//Contrilling user edit-----------------------------------
    addControllingUsers(users){
        this._addUsers(CGroup.MASK_CONTROLLING_USERS, users)
    }
    
    setControllingUsers(users){
        this._setUsers(CGroup.MASK_CONTROLLING_USERS, users)
    }

    deleteControllingUser(user){
        this._deleteUser(CGroup.MASK_CONTROLLING_USERS, user);
    }

    includeControllingUser(user){
        return this._includeUser(CGroup.MASK_CONTROLLING_USERS, user);
    }


//Medic users edit-------------------------------------------
    addMedicUsers(users){
        this._addUsers(CGroup.MASK_MEDIC_USERS, users)
    }

    setMedicUsers(users){
        this._setUsers(CGroup.MASK_MEDIC_USERS, users)
    }

    deleteMedicUser(user){
        this._deleteUser(CGroup.MASK_MEDIC_USERS, user);
    }

    includeMedicUser(user){
        return this._includeUser(CGroup.MASK_MEDIC_USERS, user);
    }

//Controlled Users Edit----------------------------------------
    addControlledUsers(users){
        this._addUsers(CGroup.MASK_CONTROLLED_USERS, users)
    }
    
    setControlledUsers(users){
        this._setUsers(CGroup.MASK_CONTROLLED_USERS, users)
    }

    deleteControlledUser(user){
        this._deleteUser(CGroup.MASK_CONTROLLED_USERS, user);
    }

    includeControlledUser(user){
        return this._includeUser(CGroup.MASK_CONTROLLED_USERS, user);
    }
//Dates ---------------------------------
    checkDates(){
        if(this._mGroup[CGroup.MASK_TO_DATE] && this._mGroup[CGroup.MASK_FROM_DATE]){
            if(this._mGroup[CGroup.MASK_FROM_DATE] >= this._mGroup[CGroup.MASK_TO_DATE])
                return "from > until";
        }
        if(this._mGroup[CGroup.MASK_TO_DATE]){
            const now = new CDate();
            now.setSeconds(0);
            now.setMilliseconds(0);
            if(now > this._mGroup[CGroup.MASK_TO_DATE]){
                return "now > until";
            }
        }
        
        
    }
    setDateFrom(date){
        //Проверка корректности даты
        if(date instanceof CDate){
            this._mGroup[CGroup.MASK_FROM_DATE] = date;
            return this.checkDates();
        }
        
    }

    getDateFrom(){
        if(this._mGroup[CGroup.MASK_FROM_DATE])
            return this._mGroup[CGroup.MASK_FROM_DATE].toIsoString2();
    }

    setDateUntil(date){
        //Проверка корректности даты
        if(date instanceof CDate){
            this._mGroup[CGroup.MASK_TO_DATE] = date;
            return this.checkDates();
        }
    }

    getDateUntil(){
        if(this._mGroup[CGroup.MASK_TO_DATE])
            return this._mGroup[CGroup.MASK_TO_DATE].toIsoString2();  
    }

    resetDates(){
        const dateBegin = new CDate();
        if(dateBegin.getHours() < 9){
            //Если меньше 9, то просто доводим до 9 часов 00 минут
            
        }else{
            //Иначе ставим 9 00 следующего дня
            dateBegin.setDate(dateBegin.getDate() + 1);
        }
        dateBegin.setHours(9);
        dateBegin.setMinutes(0);
        this._mGroup[CGroup.MASK_FROM_DATE] = dateBegin;
        this._mGroup[CGroup.MASK_TO_DATE] = undefined;
    }

    clearDates(){
        if(this._mGroup[CGroup.MASK_FROM_DATE])
            this._mGroup[CGroup.MASK_FROM_DATE] = undefined;
        if(this._mGroup[CGroup.MASK_TO_DATE])
            this._mGroup[CGroup.MASK_TO_DATE] = undefined;
    }
//Autodelete-------------------
    setAutodelete(autodelete){
        if(autodelete != undefined && autodelete != null)
            this._mGroup[CGroup.MASK_AUTODELETE] = autodelete;
    }
//Common edit funcs---------------------------------------
    _setUsers(typeUsers, users){
        if(users instanceof Array){
            for(let i = 0; i < users.length; ++i)
                if(typeof users[i] !== "string")
                    return;
            this._mGroup[typeUsers] = users;
        }
    }

    _deleteUser(typeUsers, user){
        
        if(user instanceof CUser){
            for(let i = 0; i < this._mGroup[typeUsers].length; ++i)
                if(this._mGroup[typeUsers][i].isEqual(user)){
                    this._mGroup[typeUsers].splice(i,1);
                    return;
                }
        }
    }

    _addUsers(typeUsers, users){
        if(users instanceof Array){
            for(let i = 0; i < users.length; ++i)
                if(!(users[i] instanceof CUser))
                    return;
                this._mGroup[typeUsers] = this._mGroup[typeUsers].concat(users);
        }
    }

    _includeUser(typeUser, user){
        if(user instanceof CUser){
            for(let i = 0; i < this._mGroup[typeUser].length; ++i){
                if(this._mGroup[typeUser][i].isEqual(user))
                    return true;
            }
        }
        return false;
    }

    constructor(initValue){
        this._mGroup = {};
        if(initValue && initValue instanceof Array){
            for(let i = 0; i < initValue.length && i < CGroup._MASKS.length; ++i){
                this._mGroup[CGroup.maskOfIndex(i)] = initValue[i];
            }
        }else if(initValue instanceof CGroup){
            this._mGroup[CGroup.MASK_CONTROLLING_USERS] = initValue.fields[CGroup.MASK_CONTROLLING_USERS].map(user => {return new CUser(user)});
            this._mGroup[CGroup.MASK_CONTROLLED_USERS] = initValue.fields[CGroup.MASK_CONTROLLED_USERS].map(user => {return new CUser(user)});
            this._mGroup[CGroup.MASK_MEDIC_USERS] = initValue.fields[CGroup.MASK_MEDIC_USERS].map(user => {return new CUser(user)});
            this._mGroup[CGroup.MASK_FROM_DATE] = initValue.fields[CGroup.MASK_FROM_DATE];
            this._mGroup[CGroup.MASK_TO_DATE] = initValue.fields[CGroup.MASK_TO_DATE];
            this._mGroup[CGroup.MASK_ID] = initValue.fields[CGroup.MASK_ID];
            this._mGroup[CGroup.MASK_AUTODELETE] = initValue.fields[CGroup.MASK_AUTODELETE];
        }else if(initValue && ((typeof initValue) === "object")){
            for(let key in initValue){
                const index = CGroup.indexOfMask(key);
                if(index != -1){
                    if(key === CGroup.MASK_CONTROLLING_USERS || key === CGroup.MASK_CONTROLLED_USERS 
                        || key === CGroup.MASK_MEDIC_USERS){
                        if(initValue[key] instanceof Array){
                            this._mGroup[key] = [];
                            for(let i = 0; i < initValue[key].length; ++i){
                                if(initValue[key][i] instanceof CUser)
                                    this._mGroup[key].push(initValue[key][i]);
                                else
                                    this._mGroup[key].push(new CUser(initValue[key][i]))
                            }
                        }else
                            this._mGroup[key] = [new CUser(initValue[key])];
                    }else if(key === CGroup.MASK_FROM_DATE || key === CGroup.MASK_TO_DATE){
                        if(initValue[key] instanceof CDate)
                            this._mGroup[key] = initValue[key];
                        else{
                            try{
                                this._mGroup[key] = new CDate(initValue[key]);
                            }catch(ex){}
                        }
                    }else{
                        this._mGroup[key] = initValue[key];
                    }
                        
                }
            }
        }else{
            this._mGroup[CGroup.MASK_CONTROLLING_USERS] = [];
            this._mGroup[CGroup.MASK_MEDIC_USERS] = [];
            this._mGroup[CGroup.MASK_CONTROLLED_USERS] = [];
            this._mGroup[CGroup.MASK_AUTODELETE] = true;
        }
    }

    toSaveObject(){
        const res = {
            [CGroup.MASK_CONTROLLING_USERS]: [],
            [CGroup.MASK_MEDIC_USERS]: [],
            [CGroup.MASK_CONTROLLED_USERS]: [],
        };
        for(let i = 0; i < this.fields[CGroup.MASK_CONTROLLING_USERS].length; ++i){
            res[CGroup.MASK_CONTROLLING_USERS].push(this.fields[CGroup.MASK_CONTROLLING_USERS][i].fields[CUser.MASK_ID]);
        }
        for(let i = 0; i < this.fields[CGroup.MASK_MEDIC_USERS].length; ++i){
            res[CGroup.MASK_MEDIC_USERS].push(this.fields[CGroup.MASK_MEDIC_USERS][i].fields[CUser.MASK_ID]);
        }
        for(let i = 0; i < this.fields[CGroup.MASK_CONTROLLED_USERS].length; ++i){
            res[CGroup.MASK_CONTROLLED_USERS].push(this.fields[CGroup.MASK_CONTROLLED_USERS][i].fields[CUser.MASK_ID]);
        }
        if(this.fields[CGroup.MASK_FROM_DATE])
            res[CGroup.MASK_FROM_DATE] = this.fields[CGroup.MASK_FROM_DATE].toIsoString2();
        if(this.fields[CGroup.MASK_TO_DATE])
            res[CGroup.MASK_TO_DATE] = this.fields[CGroup.MASK_TO_DATE].toIsoString2();
        if(this.fields[CGroup.MASK_AUTODELETE] != undefined)
            res[CGroup.MASK_AUTODELETE] = this.fields[CGroup.MASK_AUTODELETE];
        return res;
    }

    toEditObject(){
        const editObject = this.toSaveObject();
        editObject[CGroup.MASK_ID] = this.fields[CGroup.MASK_ID];
        return editObject;
    }

    isEqual(group){
        if(group instanceof CGroup)
            return this.fields[CGroup.MASK_ID] === group.fields[CGroup.MASK_ID];
    }
}

class CEvent{

    static get MASK_ID(){return "_id";}
    static get MASK_OWNER(){return "owner";}
    static get MASK_TYPE(){return "type";}
    static get MASK_CREATED_AT(){return "createdAt";}
    static get MASK_UPDATED_AT(){return "updatedAt";}
    static get MASK_DATA(){return "data";}

    static get _MASKS(){return [CEvent.MASK_ID, 
        CEvent.MASK_OWNER,
        CEvent.MASK_TYPE,
        CEvent.MASK_CREATED_AT,
        CEvent.MASK_UPDATED_AT,
        CEvent.MASK_DATA
    ]};

    static indexOfMask(mask){
        for(let i = 0; i<CEvent._MASKS.length; ++i)
            if(CEvent._MASKS[i] === mask)
                return i;
        return -1;
    }

    static get _TYPE_USER_ADD(){return "userAdd";}
    static get _TYPE_USER_CHANGE(){return "userChange";}
    static get _TYPE_USER_DELETE(){return "userDelete";}
    static get _TYPE_GROUP_ADD(){return "groupAdd";}
    static get _TYPE_GROUP_CHANGE(){return "groupChange";}
    static get _TYPE_GROUP_DELETE(){return "groupDelete";}
    static get _TYPE_NEW_DATA(){return "newData";}

    get fields(){return this._mEvent;}

    get isUserAddEvent(){return this.fields[CEvent.MASK_TYPE] === CEvent._TYPE_USER_ADD;}
    get isUserChangeEvent(){return this.fields[CEvent.MASK_TYPE] === CEvent._TYPE_USER_CHANGE;}
    get isUserDeleteEvent(){return this.fields[CEvent.MASK_TYPE] === CEvent._TYPE_USER_DELETE;}
    get isGroupAddEvent(){return this.fields[CEvent.MASK_TYPE] === CEvent._TYPE_GROUP_ADD;}
    get isGroupDeleteEvent(){return this.fields[CEvent.MASK_TYPE] === CEvent._TYPE_GROUP_DELETE;}
    get isGroupChangeEvent(){return this.fields[CEvent.MASK_TYPE] === CEvent._TYPE_GROUP_CHANGE;}
    get isNewDataEvent(){return this.fields[CEvent.MASK_TYPE] === CEvent._TYPE_NEW_DATA;}

    get eventTypeString(){
        if(this.isGroupDeleteEvent){
            return "Удаление группы";
        }else if(this.isGroupAddEvent){
            return "Добавление группы";
        }else if(this.isGroupChangeEvent){
            return "Изменение группы";
        }else if(this.isUserAddEvent){
            return "Добавление пользователя";
        }else if(this.isUserChangeEvent){
            return "Изменение пользователя";
        }else if(this.isUserDeleteEvent){
            return "Удаление пользователя";
        }else if(this.isNewDataEvent){
            return "Новые данные";
        }else{
            return "Unknown event";
        }
    }

    get timeCreatedLocale(){
        return (new CDate(this.fields[CEvent.MASK_CREATED_AT])).toLocaleString();
    }

    get owner(){
        if(this.fields[CEvent.MASK_OWNER] instanceof CUser){
            return new CUser(this.fields[CEvent.MASK_OWNER]);
        }
    }
    
    getDeletedUser(onget){
        if(this.isUserDeleteEvent){
            return this._checkDataLoad((data)=>{
                if(data.deletedUser && onget)
                    onget(data.deletedUser)
            });
        }
    }

    getAddedUser(onget){
        if(this.isUserAddEvent){
            return this._checkDataLoad((data)=>{
                if(data.addedUser && onget)
                    onget(data.addedUser)
            });
        }
    }

    getChangedUser(onget){
        if(this.isUserChangeEvent){
            return this._checkDataLoad((data)=>{
                if(data.changedUser && onget)
                    onget(data.changedUser)
            });
        }
    }

    getChangedGroup(onget){
        if(this.isGroupChangeEvent){
            return this._checkDataLoad((data)=>{
                if(data.changedGroup && onget)
                    onget(data.changedGroup)
            });
        }
    }

    getDeletedGroup(onget){
        if(this.isGroupDeleteEvent){
            return this._checkDataLoad((data)=>{
                if(data.deletedGroup && onget)
                    onget(data.deletedGroup)
            });
        }
    }

    getAddedGroup(onget){
        if(this.isGroupAddEvent){
            return this._checkDataLoad((data)=>{
                if(data.addedGroup && onget)
                    onget(data.addedGroup)
            });
        }
    }

    getDataOfMeasuring(onget){
        if(this.isNewDataEvent){
            return this._checkDataLoad((data)=>{
                if(data.measuredData && onget)
                    onget(data.measuredData)
            });
        }
    }

    _checkDataLoad(ondata){
        if(this._dataLoaded){
            //Если данные загружены, то просто возвращаем их
            if(ondata)
                ondata(this.fields[CEvent.MASK_DATA]);
            return this.fields[CEvent.MASK_DATA];
        }else{
            //Иначе, загружаем данные
            CRequest.getEventsData(this.fields[CEvent.MASK_ID],(data) => {
                this._mEvent[CEvent.MASK_DATA] = {};
                if(this.isUserDeleteEvent){
                    if(data.deletedUser)
                        this._mEvent[CEvent.MASK_DATA].deletedUser = new CUser(data.deletedUser);
                }else if(this.isUserAddEvent){
                    if(data.addedUser)
                        this._mEvent[CEvent.MASK_DATA].addedUser = new CUser(data.addedUser);
                }else if(this.isUserChangeEvent){
                    if(data.changedUser)
                        this._mEvent[CEvent.MASK_DATA].changedUser = new CUser(data.changedUser);
                }else if(this.isGroupChangeEvent){
                    if(data.changedGroup)
                        this._mEvent[CEvent.MASK_DATA].changedGroup = new CGroup(data.changedGroup);
                }else if(this.isGroupAddEvent){
                    if(data.addedGroup)
                        this._mEvent[CEvent.MASK_DATA].addedGroup = new CGroup(data.addedGroup);
                }
                else if(this.isGroupDeleteEvent){
                    if(data.deletedGroup)
                        this._mEvent[CEvent.MASK_DATA].deletedGroup = new CGroup(data.deletedGroup);
                }else if(this.isNewDataEvent){
                    if(data.data){
                        this._mEvent[CEvent.MASK_DATA].measuredData = data.data;
                        console.dir(data)
                        for(let i = 0; i < this._mEvent[CEvent.MASK_DATA].measuredData.length; ++i){
                            this._mEvent[CEvent.MASK_DATA].measuredData[i].x = 0.02*i;
                        }
                    } 
                }
                this._dataLoaded = true;
                if(ondata)
                    ondata(this._mEvent[CEvent.MASK_DATA]);
                
            })
        }
    }

    isEqual(event){
        if(event instanceof CEvent)
            return event.fields[CEvent.MASK_ID] === this.fields[CEvent.MASK_ID]; 
    }

    constructor(initObj){
        this._mEvent = {};
        this._dataLoaded = false;
        if((typeof initObj) === "object"){
            for(let key in initObj){
                if(CEvent.indexOfMask(key) != -1){
                    //Если такой ключ существует
                    if(key === CEvent.MASK_OWNER){
                        if((typeof initObj[key]) === "string")
                            this._mEvent[key] = initObj[key];
                        else
                            this._mEvent[key] = new CUser(initObj[key]);
                    }else
                        this._mEvent[key] = initObj[key];
                }
            }
        }else if(initObj instanceof CEvent){
            for(let i = 0; i < CEvent._MASKS.length; ++i){
                if(initObj[CEvent._MASKS[i]] instanceof CUser)
                    this._mEvent[CEvent._MASKS[i]] = new CUser(initObj[CEvent._MASKS[i]]);
                else
                    this._mEvent[CEvent._MASKS[i]] = initObj[CEvent._MASKS[i]];
            }
        }
    }

    

}