"use strict"

class VTable extends HTMLElement{

    
    constructor(){
        super();
        this._columnWidth = -1;
        this._lineNumberColumnVisibility = false;
    }

    connectedCallback(){
        this.ASearchEnable = this.getAttribute("searchEnable");
        this.attachShadow({mode: "open"});
        const style = document.createElement("style");
        style.innerHTML = `
            ${CCommon.STYLE_SCROLLBARS}
            .cContainer{
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: stretch;
                border-width: 2px;
                border-style: solid;
                padding: 5px;
                border-color:var(--color-primary);
                background-color: var(--color-background);
                overflow-y: auto;
            }
            /*Таблица*/
            .dataContainer{
                position: relative;
                box-sizing: border-box;
                margin: 5px;
                display: flex;
                flex-direction: column;
                flex-grow: 1;

            }
            
            #idTableContainer{
                min-height: 100px;
                width: 100%;
                position: relative;
                flex-grow: 1;
            }
            
            #idDiv2{
                width: 100%;
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                overflow-y: auto;
            }
            
            table{
                display: grid;
                grid-template-columns: var(--column-template);
                border-collapse: collapse;
            }
            
            thead,tbody, tr{
                display: contents;
            }
            
            th{
                position: sticky;
                position: -webkit-sticky;
                top: 0;
                background-color: var(--color-primary-light);
                box-shadow: inset 0px 0px 4px 0px var(--color-primary);
                z-index: 1;
            }
            
            td,th{
                display: flex;
                border: thin solid var(--color-background-on);
                padding: 5px;
                text-align: center;
                justify-content: center;
                align-items: center;
            }
            
            td.sControlColumn,th.sControlColumn{
                position: sticky;
                position: -webkit-sticky;
                right: 0;
            }
            td.sControlColumn{
                background-color: var(--color-background);
            }
            
            /*Специализированные ячейки*/
            
            
            .sCellImage{
                max-width: 100%;
                max-height: 75px;
                object-fit: contain;
            }
            
            .sCellButton{
                max-height: 25px;
                color: var(--color-background-on);
                background-color: var(--color, transparent);
                -webkit-mask: var(--mask);
                mask: var(--mask);
                border: none;
                border-bottom: 1px solid var(--color-background-on);
                margin: 2px 5px;
            }
            
            .sCellButton:hover{
                filter: opacity(50%);
            }
            
            
            
            /*Фильтрация*/
            
            .cFindText{
                background-color: yellow;
            }
            .cSearchDiv {
                margin: 3px 0px 3px 0px;
                display: flex;
                flex-direction: row;
                align-items: center;
                z-index: 2;
            }
            #idInputSearch{
                margin-right: 3px;
                flex-grow: 1;
            }
            #idButtonRegExChoice{
                padding: 5px;
                margin: 1px;
                background-color: var(--color-background);
                outline: none;
                border: 1px solid var(--color-primary);
            }
            #idButtonRegExChoice:hover{
                background-color: var(--color-primary-light);
            }
            #idButtonRegExChoice.sEnabledRegEx{
                background-color: var(--color-primary-light);
                box-shadow: inset 0px 0px 1px 0px var(--color-background-on);
            }
            #idButtonRegExChoice.sDisabledRegEx{
                background-color: var(--color-background);
                box-shadow: 0;
            }
            
            #idSelectSearchColumn{
                width: 20%;
            }
            
            /*Загрузка*/
            @keyframes rotateImage{
                to{
                    transform: rotate(350deg);
                }
            }
            .sLoadContainer{
                width: 100%;
                height: 100%;
                display: flex;
                align-items: top;
                visibility: hidden;
                position: absolute;
                flex-grow: 1;
                background-color: rgba(255,255,255, 0.8);
                justify-content: center;
                z-index: 3;
            }
            .sLoadImg{
                width: 20px;
                height: 20px;
                margin-top: 40px;
                animation: rotateImage 1s linear 0s infinite normal none;
                align-self: top;
            }
            
            /*Нет данных*/
            #idNoData{
                text-align: center;
                font-size: large;
                font-style: italic;
                padding: 40px 0px 40px 0px;
                color: rgba(0,0,0, 0.5);
            }
        `
        this.shadowRoot.innerHTML = `  
        <div class="cContainer">
            <div class="cSearchDiv">
                <v-input id="idInputSearch" type="simpleText" caption="фильтр"></v-input>
                <button id="idButtonRegExChoice">(.*)</button>
                <v-select id="idSelectSearchColumn" placeholder="Выберите столбцы..." multiple="true"></v-select>
            </div>
            <div class="dataContainer">
                <div id="idLoad" class="sLoadContainer">
                    <img src="/images/icons/load.svg"/>
                </div>
                <div id="idTableContainer">
                    <div id="idDiv2">
                        <table id="idTable"> </table>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; justify-content: center;">
                    <p id="idNoData">No data</p>
                </div>
            </div>
        </div>
        `
        this.shadowRoot.appendChild(style);
        this.viewTable = this.shadowRoot.getElementById("idTable");
        this.viewSelectColumn = this.shadowRoot.getElementById("idSelectSearchColumn");
        this.viewInput = this.shadowRoot.getElementById("idInputSearch");
        this.viewNoData = this.shadowRoot.getElementById("idNoData");
        this._viewLoad = this.shadowRoot.getElementById("idLoad");
        this._viewButtonRegExChoice = this.shadowRoot.getElementById("idButtonRegExChoice");
        //Инициализации индикации ожидания
        this._stopWaitAnim();
        //Настраиваем поиск
        this._regexChoiceChange(false);
        this._viewButtonRegExChoice.onclick = () => {
            this._regexChoiceChange(!this._regexEnabled);
            if(this.viewInput && this.viewInput.value && this.viewInput.value != ""){
                this._startWaitAnim();
                this._search((e) => {
                    this._stopWaitAnim();
                    if(e)
                        this._printAllTable(true);
                });
            }
        }
        this.viewInput.oninput = () => {
            //Просматриваем каждую ячейку (Из колонки выбранной в селекте) 
            //на предмет наличия строки запроса
            if(this.viewInput && this.viewInput.value && this.viewInput.value != ""){
                this._startWaitAnim();
                this._search((e) => {
                    this._stopWaitAnim();
                    if(e)
                        this._printAllTable(true);
                });
            }else{
                if(this._taskSearch){
                    clearTimeout(this._taskSearch);
                    this._taskSearch = null;
                }
                if(this._filterTask){
                    clearTimeout(this._filterTask);
                    this._filterTask = null;
                }
                this._printAllTable(true);
            }
           
        }
        this.viewSelectColumn.onchange = () => {
            if(this.viewInput && this.viewInput.value && this.viewInput.value != ""){
                this._startWaitAnim();
                this._search((e) => {
                    this._stopWaitAnim();
                    if(e)
                        this._printAllTable(true);
                });
            }
        };
    }

    _startWaitAnim(){
        this._viewLoad.hidden = false;
        this._viewLoad.style.visibility = "visible";
        this._viewLoad.children[0].className = "sLoadImg";
    }
    _stopWaitAnim(){
        if(!this._globalWait){
            this._viewLoad.hidden = true;
            this._viewLoad.style.visibility = "hidden";
            this._viewLoad.children[0].className = "";
        }
        
    }

    _getVisibleHeaderByIndex(indexSearch){
        let index = 0;
        for(let i = 0; i < this._mHeadersAll.length; ++i){
            if(this._mHeadersAll[i].visible){
                if(index++ == indexSearch)
                    return this._mHeadersAll[i];
            }
        }
        return null;
    }
    _search(endCallback){
        if(this._taskSearch){
            clearTimeout(this._taskSearch);
            this._taskSearch = null;
        }
        if(this._filterTask){
            clearTimeout(this._filterTask);
            this._filterTask = null;
        }
        this._taskSearch = setTimeout(() => {
            //Получаем копию исходной таблицы и совершаем поиск
            this._printAllTable(false, viewTableTemp => {
                let searchVal = this.viewInput.value;
                const searchClass = new cSearch();
                if(this._regexEnabled){
                    // Если включен regex проверяем на корректность введенную строку
                    if(!searchClass.isRegex(searchVal)){
                        //Если выражение не регулярное выражение
                        this.viewInput.showError("Неверное выражение");
                        if(endCallback) endCallback("error regEx");
                        return;
                    }
                }else{
                    //Преобразуем в строку литерального поиска
                    searchVal = searchClass.convertToLiteralSearchValue(searchVal);
                }
                let flagSmthFind = false;
                //фильтруем
                const numRows = viewTableTemp.children[1].children.length;
                const divider = 100;
                let iter = 0;
                const filter = () => {
                    let i = iter++*divider;
                    let k = 0;
                    for(; i < numRows && k < divider; ++i, ++k){
                        const row = viewTableTemp.children[1].children[i];
                        let flagYesResult = false;
                        for(let j = 0; j < row.children.length; ++j){
                            if(!this._getVisibleHeaderByIndex(j).search)
                                continue;
                            //Определяем по какому столбце поиск
                            if(!this.viewSelectColumn.isChecked(this._getVisibleHeaderByIndex(j).header))
                                continue;
                            const searchRes = searchClass._searchCell("td",row.children[j].innerHTML,
                                searchVal);
                            searchRes.view.style.width = row.children[j].style.width;//для сохранения ширины ячеек
                            row.replaceChild(searchRes.view, row.children[j]);
                            if(searchRes.flagSmthFind){
                                flagYesResult = true;
                                flagSmthFind = true;
                            }
                        }
                        if(!flagYesResult){
                            //Если ничего не нашли удаляем эту строку из таблицы
                            viewTableTemp.children[1].children[i].innerHTML = "";
                        }
                    }
                    if(i < numRows){
                        if(this._taskSearch)
                            this._filterTask = setTimeout(filter,0);
                    }else{
                        if(this._taskSearch){
                            this._setVisibilityViewNoData(!flagSmthFind);
                            this._changeTable(viewTableTemp);
                            this._taskSearch = null;
                            this._filterTask = null;
                            if(endCallback)
                                endCallback();
                        }
                    }
                };
                this._filterTask = setTimeout(filter,0);
                },0) 
            },100);
            
    }

    _changeTable(newTable){
        newTable.id = this.viewTable.id;
        newTable.className = this.viewTable.className;
        newTable.style.cssText = this.viewTable.style.cssText;
        this.viewTable.parentElement.replaceChild(newTable, this.viewTable);
        this.viewTable = this.shadowRoot.getElementById("idTable");
    }
    
    /**
     * Вывод данных в виде таблицы
     * @param {Array} data - данные для печати
     * @param {boolean} firstRowCaption - является ли первая строка заголовком
     */
    showData(data, firstRowCaption = false){
        //Проверяем вход
        if(!(data && data instanceof Array)){
            console.error("error data input");
            return;
        }
        //Преобразуем данные, в массив
        this._mData = data.map((el => {
            if(el instanceof Array)
                return el;
            else
                return [el];
        }));
        if(firstRowCaption){
            //Если первая строка - заголовки
            let headersTemp = [];
            for(let i = 0; i < this._mData[0].length; ++i){
                headersTemp[i] = {header: this._mData[0][i]};
            }
            this.setHeaders(headersTemp);
            this._mData.shift();//Удаляем первую строку
        }else{
            if(this._mHeadersAll){
                //Если заголовки определены ничего не делаем
            }else{
                //Если нет заголовков еще
                this._setDefaultHeaders(this._mData[0].length);
            }
        }
        //Обновляем таблицу
        this._printAllTable();
    }

    _setDefaultHeaders(numCoulumns = 2){
        //Делает заголовки по умолчанию
        const nameDefault = "Column ";
        const headers = [];
        for(let i = 0; i < numCoulumns; ++i){
            headers.push({header: nameDefault + (i+1)});
        }        
        this.setHeaders(headers);
    }

    /**
     * Задание заголовков для таблицы 
     * @param {array} headers - array of objects {header: string, search: boolean (default - true), visible: boolean (default - true)}
     */
    setHeaders(headers){
        //Проверяем вход
        if(headers && !(headers instanceof Array)){
            console.error("Заголовки должны быть массивом");
            return;
        }
        for(let i = 0; i < headers.length; ++i){
            //Проверяем каждый заголовок на наличие header
            if(headers[i].header == undefined){
                console.error("Input error header in " + i + " element");
                return;
            }
            //если есть search, то он должен быть boolean
            if(headers[i].search != undefined && (typeof headers[i].search) !== "boolean"){
                console.error("Input error search in " + i + " element");
                return;
            }

            if((headers[i].visible != undefined && headers[i].visible != null) && (typeof headers[i].visible) !== "boolean"){
                console.error("Input error visible in " + i + " element");
                return;
            }
            if((headers[i].mask != undefined && headers[i].mask != null) && (typeof headers[i].mask) !== "string"){
                console.error("Input error mask in " + i + " element");
                return;
            }
        }
        //Сбрасываем уже заданные заголовки и соответствующие массивы
        this._mHeadersAll = [];
        //Формируем массив зоголовков
        //Сразу добавляем столбец с номером строк, просто скрываем его
        this._mHeadersAll.push({header: "Line №", search: false, visible: false, type: "data"});
        for(let i = 0; i < headers.length; ++i){
            const element = {header: headers[i].header, 
                search: (headers[i].search != undefined && headers[i].search != null) ? headers[i].search : true, 
                visible: (headers[i].visible != undefined && headers[i].visible != null) ? headers[i].visible : true,
                mask: headers[i].mask,
                type: (headers[i].type != undefined && headers[i].type != null) ? headers[i].type : "data"};
            this._mHeadersAll.push(element);
        }
        //Добавляем заголовки в селект
        //(сначала чистим его)
        let dataHeaders = [];
        for(let i = 0; i < this._mHeadersAll.length; ++i){
            if(this._mHeadersAll[i].visible && this._mHeadersAll[i].search)
                dataHeaders.push(this._mHeadersAll[i].header);
        }  
        this.viewSelectColumn.setData(dataHeaders);
        //Перерисовываем таблицу
        this._printAllTable();
    }

    addLineNumberColumn(){
        if(this._mHeadersAll && !this._mHeadersAll[0].visible){
            this._mHeadersAll[0].visible = true;
            //Перерисовываем таблицу
            this._printAllTable();
        }
    }

    deleteRow(index){
        //Удаляем строку
        if(this._mData && index >= 0 && index < this._mData.length){
            this._mData.splice(index,1);
        }
        this._printAllTable();
    }

    addRowToIndex(data, index){
        if(this._mData){
            if(index != undefined && index != null){
                if(index >= 0 && index < this._mData.length){
                    //Добавляем в массив данные 
                    if(data && (data instanceof Array)){
                        this._mData.splice(index, 0, data);
                    }else{
                        console.error("addRow wrong data " + data);
                    }
                }else{
                    console.error("addRow wrong index " + index);
                }
            }else{
                //Вставляем в конец данных 
                this._mData.push(data);
            }
        }
        this._printAllTable();

    }

    indexOf(headerMask, value){
        //Находим индекс заголовка по маске
        if(this._mHeadersAll){
            let indexHeader = 0;
            for(let i = 1; i < this._mHeadersAll.length; ++i)
                if(this._mHeadersAll[i].mask === headerMask){
                    indexHeader = i;
                    break;
                }
            //Анализируем данные
            if(indexHeader && this._mData){
                for(let i = 0; i < this._mData.length; ++i){
                    if(this._mData[i][indexHeader-1] === value){
                        return i;
                    }
                }
            }
        } 
    }

    changeRowOnIndex(newRow, index){
        if(this._mData){
            if(index != undefined && index != null){
                if(index >= 0 && index < this._mData.length){
                    //Добавляем в массив данные 
                    if(newRow && (newRow instanceof Array)){
                        this._mData.splice(index, 1, newRow);
                    }else{
                        console.error("changeRow wrong data " + newRow);
                    }
                }else{
                    console.error("addRow wrong index " + index);
                }
            }
        }
        this._printAllTable();
    }

    showWait(){
        this._globalWait = true;
        this._startWaitAnim();
    }

    hideWait(){
        this._globalWait = false;
        this._stopWaitAnim();
    }

    getAvailableValues(mask){
        const set = new Set(null);
        if(this._mHeadersAll && this._mData){
            //Определяем индекс заголовка
            let colNum = -1;
            for(let i = 1; i < this._mHeadersAll.length; ++i){
                if(this._mHeadersAll[i].mask === mask){
                    colNum = i-1;
                }
            }
            for(let i = 0; i < this._mData.length; ++i){
                if(this._mData[i][colNum] && this._mData[i][colNum].length)
                    set.add(this._mData[i][colNum]);
            }
        }

        return Array.from(set);
    }

    _setVisibilityViewNoData(visibility){
        if(this.viewNoData){
            this.viewNoData.hidden = !visibility;
        }
    }

    _printAllTable(updatePrint = true, endCallback){
        //Запускаем анимацию ожидания, если нужно перерисовать таблицу
        if(updatePrint){
            this._startWaitAnim();
        }
        const viewTableTemp = document.createElement("table");
        let visibleColumnsCount = 0;
        //Печатаем заголовки
        if(this._mHeadersAll){
            //Если есть заголовки, добавляем их
            const thead = document.createElement("thead");
            const rowHeaders = document.createElement("tr");
            for(let i = 0; i < this._mHeadersAll.length; ++i){
                if(this._mHeadersAll[i].visible){
                    const viewCol = document.createElement("th");
                    viewCol.innerHTML = `${this._mHeadersAll[i].header}`;
                    if(this._mHeadersAll[i].type === "control"){
                        viewCol.classList.add("sControlColumn")
                    }
                        
                    rowHeaders.appendChild(viewCol);
                    ++visibleColumnsCount;
                }
            }
            //Добавляем строку в таблицу
            thead.appendChild(rowHeaders)
            viewTableTemp.appendChild(thead);
        }
        if(updatePrint){
            //Если необходимо показать таблицу, обновляем заголовки
            this.viewTable.style.cssText = `--column-template: repeat(${visibleColumnsCount}, 1fr)`;
        }
        const tbody = document.createElement("tbody");
        const flagDataExist = this._mData && (this._mData.length > 0) ? true : false; // Есть ли какие-нибудь данные
        //Печатаем данные
        if(flagDataExist){
            //Если данные есть
            let lineNumber = 0;
            const numIters = this._mData.length;
            let iter = 0;
            let divider = 100;
            const numAllColumns = this._mHeadersAll.length;
            const print = () => {
                let i = iter++*divider;
                let end = i + divider;
                for(; i < numIters && i < end; ++i){
                    let row = null;
                    try{
                        row = this._mData[i].map((el)=>{
                            return el;
                        });
                    }catch(ex){
                        return;
                    }
                    row.unshift(++lineNumber);
                    const rowTemp = document.createElement("tr");
                    //Добавляем данные
                    let countCols = 0;
                    for(; countCols < numAllColumns; ++countCols){
                        if(this._mHeadersAll[countCols].visible){
                            const tempCol = document.createElement("td");
                            tempCol.classList.add("sCellContainer");
                            if(this._mHeadersAll[countCols].type === "control"){
                                tempCol.classList.add("sControlColumn");
                            }
                            if(row[countCols]){
                                //Если данные существуют
                                if(row[countCols].toStringOutConvert){
                                    //Если есть конвертер в строку, то выводим сразу строку
                                    tempCol.innerHTML = `${row[countCols].toStringOutConvert()}`;
                                }else if((typeof row[countCols]) === "object"){
                                    const createSpecElement = (obj, indexElement=-1) => {
                                        //indexElement - -1, Если одна кнопка (не массив), индекс в массиве объектов кнопки
                                        switch(obj.typeContent){
                                            case "img":
                                                if(obj.path){
                                                    const img = document.createElement("img");
                                                    img.src = obj.path;
                                                    img.className = "sCellImage";
                                                    return img;
                                                }else{
                                                    const p = document.createElement("p");
                                                    p.innerHTML = "no path image";
                                                    return p;
                                                }
                                                
                                            case "button":
                                                const but = document.createElement("button");
                                                but.className = "sCellButton";
                                                if(obj.svgPath){
                                                    //Если кнопка с картинкой
                                                    but.style = `
                                                    --color: var(--color-background-on);
                                                    --mask: url(../../${obj.svgPath}) top center / contain no-repeat`;
                                                    but.textContent = "S5";
                                                }else if(obj.content && (typeof obj.content === "string")){
                                                    //Если кнопка с текстом
                                                    but.textContent = obj.content;
                                                }
                                                if(obj.onClick){
                                                    //Если есть событие по клику
                                                    but.setAttribute("attr-row", i);
                                                    but.setAttribute("attr-col", countCols - 1);//-1 так как первый столбец всегда номер строки
                                                    but.setAttribute("attr-num-element",indexElement);
                                                    but.addEventListener("click", (e)=>{
                                                        const indexRow = e.target.getAttribute("attr-row");
                                                        const indexCol = e.target.getAttribute("attr-col");
                                                        const numElement = e.target.getAttribute("attr-num-element");
                                                        if(indexRow && indexCol){
                                                            //Формируем объект возвращаемый
                                                            const objRet={row: parseInt(indexRow)+1, data: {}};
                                                            for(let i = 0; i < this._mData[indexRow].length-1; ++i){
                                                                if(this._mHeadersAll[i+1].mask)
                                                                    objRet.data[this._mHeadersAll[i+1].mask] = this._mData[indexRow][i];
                                                                else{
                                                                    objRet.data[`${i}`] = this._mData[indexRow][i];
                                                                }
                                                            }
                                                            if(numElement && numElement == -1 && this._mData[indexRow][indexCol].onClick)
                                                                this._mData[indexRow][indexCol].onClick(objRet);
                                                            else if(numElement && this._mData[indexRow][indexCol][numElement].onClick)
                                                                this._mData[indexRow][indexCol][numElement].onClick(objRet);
                                                        }
                                                    }) 
                                                }
                                                return but; 
                                            case "checkbox":
                                                const checkbox = document.createElement("input");
                                                checkbox.type = "checkbox";
                                                checkbox.checked = obj.getValue ? obj.getValue(this._mData[i]) : false;
                                                if(obj.onChange){
                                                    //Если есть событие по клику
                                                    checkbox.setAttribute("attr-row", i);
                                                    checkbox.setAttribute("attr-col", countCols - 1);//-1 так как первый столбец всегда номер строки
                                                    checkbox.setAttribute("attr-num-element",indexElement);
                                                    checkbox.addEventListener("click", (e)=>{
                                                        const checked = e.target.checked === true;
                                                        const indexRow = e.target.getAttribute("attr-row");
                                                        const indexCol = e.target.getAttribute("attr-col");
                                                        const numElement = e.target.getAttribute("attr-num-element");
                                                        if(indexRow && indexCol){
                                                            //Формируем объект возвращаемый
                                                            const objRet={row: parseInt(indexRow)+1, data: {}};
                                                            for(let i = 0; i < this._mData[indexRow].length-1; ++i){
                                                                if(this._mHeadersAll[i+1].mask)
                                                                    objRet.data[this._mHeadersAll[i+1].mask] = this._mData[indexRow][i];
                                                                else{
                                                                    objRet.data[`${i}`] = this._mData[indexRow][i];
                                                                }
                                                            }
                                                            if(numElement && numElement == -1 && this._mData[indexRow][indexCol].onChange)
                                                                this._mData[indexRow][indexCol].onChange(checked, objRet);
                                                            else if(numElement && this._mData[indexRow][indexCol][numElement].onChange)
                                                                this._mData[indexRow][indexCol][numElement].onChange(checked, objRet);
                                                        }
                                                    }) 
                                                }   
                                                return checkbox;
                                        }
                                        const p = document.createElement("p");
                                        p.innerHTML = "ErrorSecElement";
                                        return p;
                                    };
                                    if(row[countCols].typeContent){
                                        tempCol.appendChild(createSpecElement(row[countCols]));
                                    }else{
                                        //Возможен еще вариант с массивом объектов
                                        if(row[countCols] instanceof Array){
                                            const divContainer = document.createElement("div");
                                            divContainer.className = "sCellContainer";
                                            let flagSmthGood = false;
                                            for(let j = 0; j < row[countCols].length; ++j)
                                                if(row[countCols][j].typeContent){
                                                    divContainer.appendChild(createSpecElement(row[countCols][j], j));
                                                    flagSmthGood = true;
                                                }
                                            if(flagSmthGood){
                                                tempCol.appendChild(divContainer);
                                            }else{
                                                //Неизвестный тип данных
                                                tempCol.innerHTML = "Error";
                                            }
                                        }else{
                                            //Неизвестный тип данных
                                            tempCol.innerHTML = "Error";
                                        }
                                    }
                                }else{
                                    //Если что-то из простых типов, то просто преобразуем в строку
                                    tempCol.innerHTML = `${row[countCols]}`;
                                }
                            }else{
                                //Если данных не существует, дозаполняем пустой ячейкой
                                tempCol.innerHTML = "---";
                            }
                            rowTemp.appendChild(tempCol);
                        }
                    }
                    tbody.appendChild(rowTemp)
                    
                }
                viewTableTemp.appendChild(tbody);
                if(i < numIters)
                    setTimeout(print, 0);
                else{
                    if(updatePrint){
                        this._changeTable(viewTableTemp);
                        this._stopWaitAnim();
                        if(flagDataExist)
                            this._setVisibilityViewNoData(false);
                    }
                    if(endCallback)
                        endCallback(viewTableTemp)
                }
            }
            setTimeout(print, 0);
        }else{
            if(updatePrint){
                this._changeTable(viewTableTemp);
                this._stopWaitAnim();
                if(flagDataExist)
                    this._setVisibilityViewNoData(false);
            }
            this._setVisibilityViewNoData(true);
        }
    }

    _regexChoiceChange(enabled){
        this._regexEnabled = enabled;
        if(enabled){
            this._viewButtonRegExChoice.className = "sEnabledRegEx";
        }else{
            this._viewButtonRegExChoice.className = "sDisabledRegEx";
        }
    }

}
customElements.define("v-table", VTable);