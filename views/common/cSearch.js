
class cSearch{


    constructor(commonContainerName = "div", containerName = "div", contentName = "div"){
        this._commonContainerName = commonContainerName;
        this._containerName = containerName;
        this._contentName = contentName;
    }

    setCommonContainerClass(className){
        this._commonContainerClassName = className;
    }
    setRowContainerClass(className){
        this._rowContainerClassName = className;
    }

    setOnClickRow(clickRow){
        this._clickRow = clickRow;
    }

    stopSearch(){
        this._taskSearch = null;
        this._filterTask = null;
    }

    setRegexMode(mode){
        this.regexEnabled = mode;
    }

    search(data, searchMask, searchVal, regexEnabled, endCallback, stepCallback){
        //data - матрица (одномерная или двумерная)
        //searchMask - маска поиска по массиву
        //searchVal - строка для поиска
        //regexEnabled - true - строка поиска регулярное выражение 
        //endCallback(res, resElement) - вызывается после всего поиска
        //stepCallback(res, indexStart, indexEnd) - возвращается после каждого шага, res - общий результат
        if(this._taskSearch){
            clearTimeout(this._taskSearch);
            this._taskSearch = null;
        }
        if(this._filterTask){
            clearTimeout(this._filterTask);
            this._filterTask = null;
        }
        this._taskSearch = setTimeout(() => {
            //Проверяем выражение для поиска
            if(this._regexEnabled){
                // Если включен regex проверяем на корректность введенную строку
                if(!this.isRegex(searchVal)){
                    if(endCallback) endCallback(null, "error regEx");
                    return;
                }

            }else{
                searchVal = this.convertToLiteralSearchValue(searchVal);
            }   
            //Создаем общий контэйнер
            const resultElement = document.createElement(this._commonContainerName);
            //фильтруем
            const length = data.length;
            const divider = 100; 
            let result = [];
            let iter = 0;
            const filter = () => {
                let i = iter++*divider;
                let k = 0;
                for(; i < length && k < divider; ++i, ++k){
                    const row = data[i]+"";
                    let flagSmthFindInRow = false;
                    let resRow = [];
                    //Настройка строки
                    const resElementRow = document.createElement(this._containerName);
                    if(this._rowContainerClassName)
                        resElementRow.className = this._rowContainerClassName;
                    if(this._clickRow){
                        resElementRow.onmousedown = (e)=>{
                            let div = e.target;
                            let res = "";
                            if(e.target instanceof HTMLSpanElement)
                               div = e.target.parentElement;
                            if(e.target.firstElementChild && 
                                e.target.firstElementChild instanceof HTMLDivElement)
                                div = e.target.firstElementChild;
                            for(let i = 0; i < div.children.length; ++i){
                                res += div.children[i].innerHTML;
                            }
                            this._clickRow(res);
                        };
                    }
                    for(let j = 0; j < (row instanceof Array ? row.length : 1); ++j){
                        let cell = "";
                        if(row instanceof Array)
                            cell = row[j]+"";
                        else
                            cell = row+"";
                        let resDataIn = null;
                        let flagSmthFind = false;
                        if(!searchMask[j]){
                            //Если данный элемент не анализируется, просто оборачиваем его в элемент
                            resDataIn.innerHTML = cell;
                            resRow.push({element: resDataIn, flagSmthFind});
                            //continue;
                        }else{
                            const cellSearchRes = this._searchCell(this._contentName, cell, searchVal);
                            resDataIn = cellSearchRes.view;
                            flagSmthFind = cellSearchRes.flagSmthFind;
                            if(flagSmthFind){
                                flagSmthFindInRow = true;
                            }
                        }
                        resElementRow.appendChild(resDataIn);
                        resRow.push({element: resDataIn, flagSmthFind})
                    }
                    result.push({row: resRow, flagSmthFindInRow});
                    if(flagSmthFindInRow){
                        resultElement.appendChild(resElementRow);
                    }
                }
                if(i < length){
                    if(stepCallback)
                        stepCallback(result, i-k, i);
                    if(this._taskSearch)
                        this._filterTask = setTimeout(filter,0);
                }else{
                    if(this._taskSearch){
                        this._taskSearch = null;
                        this._filterTask = null;
                        if(endCallback)
                            endCallback(result, resultElement);
                    }
                }
            }
            this._filterTask = setTimeout(filter,0); 
        },100);     
    }

    convertToLiteralSearchValue(searchValue){
         // экранируем все специальные символы
         const specSymbols = Array.from(`[]\\^$.|?*+()/`);
         specSymbols.forEach(el => {
             searchValue = searchValue.replace(el, `\\${el}`, "g");
         })
         return searchValue;
    }

    isRegex(searchVal){
        try{
            const temp = new RegExp(searchVal);
        }catch{
            return false;
        }
        return true;
    }

    _searchCell(cellContainerName, input, searchVal){
        const resDataIn = document.createElement(cellContainerName);
        let flagSmthFind = false;
        const reg = new RegExp(`${searchVal}`, "g");
        const searchRes = input.matchAll(reg);
        const searchInput = input;
        let temp1 = searchRes.next();
        let temp2 = searchRes.next();
        let indexStart = 0;
        if(!temp1.done){
            //Если что-то нашли сбрасываем cell, затем формируем ее заново 
            //с помощью спанов
            flagSmthFind = true;
        }else{
            resDataIn.innerHTML = input;
        }
        while(!temp1.done){
            let index1 = temp1.value.index;
            if(temp1.value){
                //Если что-то нашли, разбиваем текст на спаны
                if(!temp2.done){
                    //Если следующий результат есть, то возможны два случая
                    //1. текущий результат и следующий результат не пересекаются
                    let index2 = temp2.value.index; 
                    if(index1 + temp1.value[0].length <= index2){
                        //1. текущий результат и следующий результат не пересекаются
                        //Просто оборачиваем в спаны, и обрезаем целевую строку поиска
                        const indexGenStart = index1 - indexStart;
                        const indexGenEnd = indexGenStart + temp1.value[0].length;
                        const strGen = searchInput.substring(indexStart, index1 + temp1.value[0].length);
                        const spans = this._doSpansSS(strGen, indexGenStart, indexGenEnd);
                        resDataIn.appendChild(spans[0]);
                        resDataIn.appendChild(spans[1]);
                    }
                }else{
                    //Если следующего результата нет (temp2 нет), то просто оборачиваем в спан
                    const indexGenStart = index1 - indexStart;
                    const indexGenEnd = index1 - indexStart + temp1.value[0].length;
                    const strGen = searchInput.substring(indexStart);
                    const spans = this._doSpansSSS(strGen, indexGenStart, indexGenEnd);
                    resDataIn.appendChild(spans[0]);
                    resDataIn.appendChild(spans[1]);
                    resDataIn.appendChild(spans[2]);
                }
                indexStart = temp1.value.index + temp1.value[0].length;
            }
            temp1 = temp2;
            temp2 = searchRes.next();
        }
        return {view: resDataIn, flagSmthFind};
    }

    searchCell(cellContainerName, input, searchValue, regexMode = false){
        if(regexMode){
            if(this.isRegex(searchValue))
                this._searchCell(cellContainerName, input, searchValue);
        }else{
            searchValue = this.convertToLiteralSearchValue(searchValue);
            return this._searchCell(cellContainerName, input, searchValue);
        }
        return null;
    }

    _doSpansSS(text, searchBegin){
        const spanSimple1 = document.createElement("span");
        const spanSearch = document.createElement("span");
        spanSearch.className = "cFindText";
        spanSimple1.innerText = text.substring(0, searchBegin);
        spanSearch.innerText = text.substring(searchBegin);
        return [spanSimple1, spanSearch];
    }

    _doSpansSSS(text, searchBegin, searchEnd){
        const spanSimple1 = document.createElement("span");
        const spanSimple2 = document.createElement("span");
        const spanSearch = document.createElement("span");
        spanSearch.className = "cFindText";
        spanSimple1.innerText = text.substring(0, searchBegin);
        spanSearch.innerText = text.substring(searchBegin, searchEnd);
        spanSimple2.innerText = text.substring(searchEnd);
        return [spanSimple1, spanSearch, spanSimple2];
    }
}