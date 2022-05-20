

class CDataFormatter{
    /**
     * Перевод данных из формата базы данных в формат для вывода в VTable view
     * @param usersCollection elements from collection user
     * @returns data for VTable view
     */

    static fromDataBaseUsersToVTable(usersCollection){
        this.result = new Object();
        this.result.data = [];    
        if(usersCollection && (usersCollection instanceof Array)){
            //Формируем данные
            for(let i = 0; i < usersCollection.length; ++i){
                const objTemp = {
                    [CUser.MASK_ID]: usersCollection[i]._id + "", 
                    [CUser.MASK_AVATAR_PATH]: usersCollection[i].avatarPath,
                    [CUser.MASK_SURNAME]: usersCollection[i].surname, 
                    [CUser.MASK_NAME]: usersCollection[i].name, 
                    [CUser.MASK_PATRONYMIC]: usersCollection[i].patronymic,
                    [CUser.MASK_BIRTHDAY]: usersCollection[i].birthday ? new CDate(usersCollection[i].birthday) : "",
                    [CUser.MASK_RANK]: usersCollection[i].rank,
                    [CUser.MASK_POST]: usersCollection[i].post,
                    [CUser.MASK_PLACE]: usersCollection[i].place,
                    [CUser.MASK_LOGIN]: usersCollection[i].login, 
                    [CUser.MASK_PASSWORD]: usersCollection[i].password,
                    [CUser.MASK_ACCOUNT_TYPE]: usersCollection[i].accountType
                }
                this.result.data.push((new CUser(objTemp)).toArray());
            }
            //Формируем заголовки
            this.result.headers = [
                {header: "_id", mask: CUser.maskOfIndex(0), search: false, visible: false},
                {header: "_avatarPath", mask: CUser.maskOfIndex(1), search: false, visible: false},
                {header: "Фамилия", mask: CUser.maskOfIndex(2)},
                {header: "Имя", mask: CUser.maskOfIndex(3)},
                {header: "Отчество", mask: CUser.maskOfIndex(4)},
                {header: "Дата рождения", mask: CUser.maskOfIndex(5)},
                {header: "Воинское завние", mask:CUser.maskOfIndex(6)},
                {header: "Должность", mask: CUser.maskOfIndex(7)},
                {header: "Место службы", mask: CUser.maskOfIndex(8)},
                {header: "Логин", mask: CUser.maskOfIndex(9)},
                {header: "_password", mask: CUser.maskOfIndex(10), search: false, visible: false},
                {header: "Тип аккаунта", mask: CUser.maskOfIndex(11), search: false}
            ];
        }
        return this.result;
    }

    static fromDataBaseGroupsToClientGroups(dataBaseGroups){
        const res = [];
        if(dataBaseGroups instanceof Array){
            for(let i = 0; i < dataBaseGroups.length; ++i){
                const group = new CGroup(dataBaseGroups[i]);
                res.push(group);
            }
        }
        return res
    }
    
}
