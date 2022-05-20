"use strict"

class CRequest{

    static mainURL = "http://localhost:3000";

//Users---------------------------------------------

    static getAllUsers(callback){
        fetch(CRequest.mainURL+"/work/users", {method: "POST",
                    headers: {'Content-Type': 'application/json;charset=utf-8'},
                    body: JSON.stringify({requestType: "GET ALL USERS"})})
        .then(response => {
            if(response.ok){										
                return response.json();
            }else{
                alert("Bad response");
            }
        })
        .then(result => {
            if(result.error){
                console.error("request ALL USERS error");
            }else{
                //Декодируем результат
                if(callback){
                    callback(result);
                }
            }
        });
    }

    static getUsersByAccountType(accountType, callback){
        fetch(CRequest.mainURL+"/work/users", {method: "POST",
                    headers: {'Content-Type': 'application/json;charset=utf-8'},
                    body: JSON.stringify({requestType: "GET USERS WITH PARAMETERS _ ACCOUNT_TYPE",
                                            requestParameters: {accountType}})})
        .then(response => {
            if(response.ok){										
                return response.json();
            }else{
                alert("Bad response");
            }
        })
        .then(result => {
            if(result.error){
                console.error("request ALL USERS WITH PARAMETERS error");
            }else{
                if(callback){
                    callback(result);
                }
            }
        });
    }

    static addUser(formData, callback){
        fetch("/work/users", {method: "PUT",
                                    body: formData})
        .then(response => {
            if(response.ok){										
                return response.json();
            }else{
                alert("Bad response");
            }
        })
        .then(result => {
            const answer = new CServerAnswer(result)
            if(!answer.isSuccess()){
                console.error(answer.error);
                alert(answer.error);
                if(callback)
                    callback(answer.error);
            }else{
                if(callback)
                    callback();
            }
        });
    }

    static changeUser(formData, callback){
        fetch("/work/users", {method: "POST",
                                body: formData})
        .then(response => {
            if(response.ok){										
                return response.json();
            }else{
                alert("Bad response");
            }
        })
        .then(result => {
            const answer = new CServerAnswer(result);
            if(!answer.isSuccess){
                console.error(answer.error);
                alert(answer.error);
                if(callback)
                    callback(answer.error);
            }else{
                if(callback)
                    callback();
            }
        });
    }

    static deleteUser(idUser, callback){
        fetch("/work/users", {method: "DELETE", headers: {'Content-Type': 'application/json;charset=utf-8'},
                                        body: JSON.stringify({_id: idUser})})
        .then(response => {
            if(response.ok){
                return response.json();
            }else{
                return {deleteRes: "error"}
            }
        })
        .then(res => {
            const answer = new CServerAnswer(res);
            if(!answer.isSuccess()){
                console.error(answer.error);
                alert(answer.error);
                if(callback)
                    callback(answer.error);
            }else{
                if(callback)
                    callback();
            }
        })
    }


//Groups------------------------------------------------------

    static getGroups(callback){
        fetch(CRequest.mainURL+"/work/groups", {method: "POST",
                    headers: {'Content-Type': 'application/json;charset=utf-8'},
                    body: JSON.stringify({requestType: "GET ALL GROUPS"})})
        .then(response => {
            if(response.ok){										
                return response.json();
            }else{
                alert("Bad response");
            }
        })
        .then(result => {
            const answer = new CServerAnswer(result);
            if(!answer.isSuccess()){
                console.error(answer.error);
                alert(answer.error);
                if(callback)
                    callback(answer.error);
            }else{
                //Декодируем результат и вызываем callback
                if(callback && answer.parameters.data){
                    callback(CDataFormatter.fromDataBaseGroupsToClientGroups(answer.parameters.data));
                }
            }
        });
    }

    static saveGroup(group, callback){
        //Сохранить группу
        if(group instanceof CGroup){
            fetch(CRequest.mainURL+"/work/groups", {method: "PUT",
                    headers: {'Content-Type': 'application/json;charset=utf-8'},
                    body: JSON.stringify({requestType: "ADD GROUP",
                                            requestParameters: {group: group.toSaveObject()}})})
            .then(response => {
                if(response.ok){										
                    return response.json();
                }else{
                    alert("Bad response");
                }
            })
            .then(result => {
                const answer = new CServerAnswer(result);
                if(!answer.isSuccess()){
                    console.error(answer.error);
                    alert(answer.error);
                    if(callback)
                        callback(answer.error);
                }else{
                    if(callback){
                        callback();
                    }
                }
            });
        }
    }

    static changeGroup(group, callback){
        //Сохранить группу
        if(group instanceof CGroup){
            fetch(CRequest.mainURL+"/work/groups", {method: "POST",
                    headers: {'Content-Type': 'application/json;charset=utf-8'},
                    body: JSON.stringify({requestType: "EDIT GROUP _ changingGROUP",
                                            requestParameters: {changingGroup: group.toEditObject()}})})
            .then(response => {
                if(response.ok){										
                    return response.json();
                }else{
                    alert("Bad response");
                }
            })
            .then(result => {
                const answer = new CServerAnswer(result);
                if(!answer.isSuccess()){
                    console.error(answer.error);
                    alert(answer.error);
                    if(callback)
                        callback(answer.error);
                }else{
                    if(callback){
                        callback(undefined, group);
                    }
                }
            });
        }
    }

    static deleteGroup(group, callback){
        if(group instanceof CGroup){
            if(group.fields[CGroup.MASK_ID]){
                //Если id известен, то можно удалять 
                fetch(CRequest.mainURL + "/work/groups", {method: "DELETE",
                    headers: {'Content-Type': 'application/json;charset=utf-8'},
                    body: JSON.stringify({requestType: "DELETE GROUP _ ID",
                                        requestParameters: {[CGroup.MASK_ID]: group.fields[CGroup.MASK_ID]}})})
                .then((response) => {
                    if(response.ok){										
                        return response.json();
                    }else{
                        alert("Bad response");
                    }
                })
                .then((result => {
                    const answer = new CServerAnswer(result);
                    if(!answer.isSuccess()){
                        console.error(answer.error);
                        if(callback)
                            callback(answer.error);
                    }else{
                        if(callback){
                            callback();
                        }
                    }
                }))
            }
        }
    }

//Events---------------------------------------------------------

    static getAllEventsFrom(callback, from){
        if(from)
            from = "null";
        fetch(CRequest.mainURL+"/events", {method: "POST",
                    headers: {'Content-Type': 'application/json;charset=utf-8'},
                    body: JSON.stringify({requestType: "GET ALL EVENTS _ FROM",
                    parameters: {from}})})
        .then(response => {
            if(response.ok){										
                return response.json();
            }else{
                alert("Bad response");
            }
        })
        .then(result => {
            const answer = new CServerAnswer(result);
            if(!answer.isSuccess()){
                console.error(answer.error);
                if(callback)
                    callback(answer.error);
            }else{
                //Декодируем результат и вызываем callback
                if(callback && answer.parameters.data){
                    callback(answer.parameters.data);
                }
            }
        });
    }

    static getEventsData(eventId, callback){
        if((typeof eventId) === "string"){
            fetch(CRequest.mainURL+"/events/data", {method: "POST",
                    headers: {'Content-Type': 'application/json;charset=utf-8'},
                    body: JSON.stringify({requestType: "GET DATA OF EVENT _ ID",
                    parameters: {_id: eventId}})})
            .then(response => {
                if(response.ok){										
                    return response.json();
                }else{
                    alert("Bad response");
                }
            })
            .then(result => {
                const answer = new CServerAnswer(result);
                if(!answer.isSuccess()){
                    console.error(answer.error);
                    if(callback)
                        callback(answer.error);
                }else{
                    //Декодируем результат и вызываем callback
                    if(callback && answer.parameters.data.data){
                        callback(answer.parameters.data.data);
                    }
                }
            });
        }
    }

//-Common requests-----------------------------------------------------------

    static logout(callback){
        fetch(CRequest.mainURL+"/logout", {method: "GET"})
        .then(response => {
            if(response.ok){										
                return response.json();
            }else{
                alert("Bad response");
            }
        })
        .then(result => {
            const answer = new CServerAnswer(result);
            if(!answer.isSuccess()){
                console.error(answer.error);
                if(callback)
                    callback(answer.error);
            }else{
                //Ничего не делаем, если успех
                window.location.reload();
            }
        });
    }

}

class CServerAnswer{
    constructor(answer){
        this._mAnswer = answer;
    }

    isSuccess(){
        return this._mAnswer.status === "success";
    }

    get error() {
        if(this.isSuccess())
            return null;
        else{
            return this._mAnswer.error ? this._mAnswer.error : "unknown error";
        }
    }

    get parameters(){
        if(this._mAnswer.dopParameters)
            return this._mAnswer.dopParameters;
        else
            return {};
    }
}