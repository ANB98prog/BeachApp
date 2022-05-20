"use strict"

class VGraph extends HTMLElement{

    constructor(initData){
        super();
        if(initData){
            if(initData[0] != undefined && initData[0].x != undefined && initData[0].y != undefined){
                this._xyMap = initData;
                return;
            }
        }
        this._xyMap = [];
        //Первоначальный набор данных
        for(let i = 0; i <= 100; i+=0.02)
            this._xyMap.push({x: i, y:  Math.abs(i)});
    }

    _setAspectRatio(ratio){
        this._aspectRatio = ratio;
        this._canvasParameters.xGraphWidth = 1000;
        this._canvasParameters.yGraphWidth = 1000/this._aspectRatio;
        this._canvasParameters._viewBoxXMaxContainer = 1000;
        this._canvasParameters._viewBoxYMaxContainer = this._canvasParameters._viewBoxXMaxContainer/this._aspectRatio;
        this._canvasParameters._viewBoxXMaxGraph = 950;
        this._canvasParameters._viewBoxYMaxGraph = this._canvasParameters._viewBoxXMaxGraph/this._aspectRatio;
        this._canvasParameters._viewXGraphOffsetLeft = (this._canvasParameters._viewBoxXMaxContainer-this._canvasParameters._viewBoxXMaxGraph);
        this._canvasParameters._viewXGraphOffsetRight = 0; //(this._canvasParameters._viewBoxXMaxContainer-this._canvasParameters._viewBoxXMaxGraph)/2;
        this._canvasParameters._viewYGraphOffsetTop = 0;//(this._canvasParameters._viewBoxYMaxContainer-this._canvasParameters._viewBoxYMaxGraph)/2;
        this._canvasParameters._viewYGraphOffsetBottom = (this._canvasParameters._viewBoxYMaxContainer-this._canvasParameters._viewBoxYMaxGraph);
        this._canvasParameters.scaleTextSizeGraph = 25/ratio; 
        /*Меняем график */
        //Задаем атрибуты-------
            //Корневой SVG
            this.shadowRoot.getElementById("idGraphic").setAttribute("viewBox",
                `0 0 ${this._canvasParameters._viewBoxXMaxContainer} ${this._canvasParameters._viewBoxYMaxContainer}`)
            //Граница
            this.shadowRoot.getElementById("idBorder").setAttribute("viewBox",
                `0 0 ${this._canvasParameters._viewBoxXMaxContainer} ${this._canvasParameters._viewBoxYMaxContainer}`)
            this.shadowRoot.getElementById("idBorderUse").setAttribute("x", 
                `${this._canvasParameters._viewXGraphOffsetLeft}`)
            this.shadowRoot.getElementById("idBorderUse").setAttribute("y", 
                `${this._canvasParameters._viewYGraphOffsetTop}`)
            this.shadowRoot.getElementById("idBorderUse").setAttribute("width", 
                `${this._canvasParameters._viewBoxXMaxGraph}`)
            this.shadowRoot.getElementById("idBorderUse").setAttribute("height", 
                `${this._canvasParameters._viewBoxYMaxGraph}`)
            //Сетка
            this.shadowRoot.getElementById("idGrid").setAttribute("viewBox",
                `0 0 ${this._canvasParameters.xGraphWidth} ${this._canvasParameters.yGraphWidth}`)
            this.shadowRoot.getElementById("idGridUse").setAttribute("x", 
                `${this._canvasParameters._viewXGraphOffsetLeft}`)
            this.shadowRoot.getElementById("idGridUse").setAttribute("y", 
                `${this._canvasParameters._viewYGraphOffsetTop}`)
            this.shadowRoot.getElementById("idGridUse").setAttribute("width", 
                `${this._canvasParameters._viewBoxXMaxGraph}`)
            this.shadowRoot.getElementById("idGridUse").setAttribute("height", 
                `${this._canvasParameters._viewBoxYMaxGraph}`)
            //Масштаб
            this.shadowRoot.getElementById("idScaleGraph").setAttribute("viewBox",
                `0 0 ${this._canvasParameters.xGraphWidth} ${this._canvasParameters.yGraphWidth}`)
            this.shadowRoot.getElementById("idScaleGraph").style.cssText = `
                font-size: ${this._canvasParameters.scaleTextSizeGraph}    
            `
            this.shadowRoot.getElementById("idScaleGraphUse").setAttribute("width", 
                `${this._canvasParameters._viewBoxXMaxContainer}`)
            this.shadowRoot.getElementById("idScaleGraphUse").setAttribute("height", 
                `${this._canvasParameters._viewBoxYMaxContainer}`)
            //График
            this.shadowRoot.getElementById("idGraph").setAttribute("viewBox",
                `0 0 ${this._canvasParameters.xGraphWidth} ${this._canvasParameters.yGraphWidth}`)
            this.shadowRoot.getElementById("idGraphUse").setAttribute("x", 
                `${this._canvasParameters._viewXGraphOffsetLeft}`)
            this.shadowRoot.getElementById("idGraphUse").setAttribute("y", 
                `${this._canvasParameters._viewYGraphOffsetTop}`)
            this.shadowRoot.getElementById("idGraphUse").setAttribute("width", 
                `${this._canvasParameters._viewBoxXMaxGraph}`)
            this.shadowRoot.getElementById("idGraphUse").setAttribute("height", 
                `${this._canvasParameters._viewBoxYMaxGraph}`)
            //events listener
            this.shadowRoot.getElementById("idGraphUseForEvents").setAttribute("x", 
                `${this._canvasParameters._viewXGraphOffsetLeft}`)
            this.shadowRoot.getElementById("idGraphUseForEvents").setAttribute("y", 
                `${this._canvasParameters._viewYGraphOffsetTop}`)
            this.shadowRoot.getElementById("idGraphUseForEvents").setAttribute("width", 
                `${this._canvasParameters._viewBoxXMaxGraph}`)
            this.shadowRoot.getElementById("idGraphUseForEvents").setAttribute("height", 
                `${this._canvasParameters._viewBoxYMaxGraph}`)
    }


    connectedCallback(){
        this.attachShadow({mode: "open"});
        this._canvasParameters = {
            gridNumVert: 10,
            gridNumHoriz: 5,
            _scaleGraphValue: 1,//Масштаб (множитель)
            _xOffsetGraphValue: 0//Смещение по X
        }
        this.shadowRoot.innerHTML = `
        <link rel="stylesheet" type="text/css" href="/javascripts/VGraph/VGraphStyle.css">
        <div id="idContainer">
            <svg id="idTemplatesContainer" style="display: none;">
                <symbol id="idBorder">
                </symbol>
                <symbol id="idGrid">
                </symbol>
                <symbol id="idScaleGraph" style="font-size: 10px">
                </symbol>
                <symbol id="idGraph">
                </symbol>
            </svg>
            <div id="idPanelContainer">
                <div id="idNowSettingContainer">
                    <v-tab id="idTabScaleSetting">
                        <div id="idScaleSettingContainer" slot="content">
                            <p>Масштаб: </p>
                            <p style="padding: 0px 5px">1</p>
                            <input id="idScaleRange" type="range" value="0" max="90">
                            <p style="padding: 0px 5px">10</p>
                        </div>
                    </v-tab>
                    <v-tab id="idTabGridSetting">
                        <div id="idGridSettingContainer" slot="content">
                            <v-input id="idInputGridSizeRow" value="${this._canvasParameters.gridNumHoriz-1}" caption="По гор." errorHidden="true" type="number" min="0" max="15"></v-input>
                            <p style="padding: 0px 5px">X</p>
                            <v-input id="idInputGridSizeColumn" value="${this._canvasParameters.gridNumVert-1}" caption="По верт." errorHidden="true" type="number" min="0" max="15"></v-input>
                        </div>
                    </v-tab>
                </div>
                <div id="idPanelButtonsContainer">
                    <div class="sPanelItemContainer">
                        <v-image-button id="idScaleChangeButton" src="/javascripts/VGraph/icons/magnifier.svg"></v-image-button>
                    </div>
                    <div class="sPanelItemContainer">
                        <v-image-button id="idGridChangeButton" src="/javascripts/VGraph/icons/grid.svg"></v-image-button>
                    </div>
                </div>
                
            </div>
            <div id="idGraphContainer">
                <svg id="idGraphic" 
                    version="1.1"
                    baseProfile="full"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg">
                    
                    <use id="idBorderUse" href="#idBorder"/>
                    <use id="idGridUse" href="#idGrid"/>
                    <use id="idScaleGraphUse" href="#idScaleGraph" x="0" 
                        y="0"/>
                    <use id="idGraphUse" href="#idGraph"/>
                    <rect id="idGraphUseForEvents" fill="transparent"/>
                </svg>
            </div>
            
        </div>
        `
        this._viewScaleRange = this.shadowRoot.getElementById("idScaleRange");
        this._nowSettingsContainer = this.shadowRoot.getElementById("idNowSettingContainer");
        this._panelButtonsContainer = this.shadowRoot.getElementById("idPanelButtonsContainer");
        this._setAspectRatio(2/1);
        //Задание событий
        for(let i = 0; i < this._panelButtonsContainer.children.length; ++i)
            this._panelButtonsContainer.children[i].onclick = () => {
                this._updateNowSetting(i);
            }
        this.shadowRoot.getElementById("idGraphUseForEvents").onmousedown = (e) => {
            this._moveStart = e.clientX;
            this._moveStart2 = this.shadowRoot.getElementById("idGraph").viewBox.baseVal.x;
        }
        this.shadowRoot.getElementById("idGraphUseForEvents").onmousemove = (e) => {
            if(e.buttons && this._moveStart != null && this._moveStart2 != null){
                e.stopPropagation();
                setTimeout(() => {
                    if(this._moveStart != null && this._moveStart2 != null){
                        const graph = this.shadowRoot.getElementById("idGraph");
                        let viewBoxXstart = this._moveStart2 - e.clientX + this._moveStart;
                        this._setOffset(viewBoxXstart);
                    }
                    
                })
                
            }
        }
        document.addEventListener("mouseup", () => {
            this._moveStart = null;
            this._moveStart2 = null;
        })
        this._viewScaleRange.onchange = () => {
            this._setScale(Number(this._viewScaleRange.value)/10 + 1);
        }
        window.addEventListener("load", ()=>{
            setTimeout(() => {
                this._resize();
            },100)
        });
        window.addEventListener("resize", () => {
            setTimeout(() => {
                this._resize();
            }, 100)
        })
        this.shadowRoot.getElementById("idInputGridSizeColumn").onchange = (v, vn) =>{
            let newVal = undefined;
            try{
                newVal = parseInt(vn);
            }catch(ex){}
            if(newVal != undefined){
                this._canvasParameters.gridNumVert = newVal + 1;//потому что gridNumVert - число областей
                this._drawGrid();
                this._drawScale();
            }
        }
        this.shadowRoot.getElementById("idInputGridSizeRow").onchange = (v, vn) =>{
            let newVal = undefined;
            try{
                newVal = parseInt(vn);
            }catch(ex){}
            if(newVal != undefined){
                this._canvasParameters.gridNumHoriz = newVal + 1;//потому что gridNumVert - число областей
                this._drawGrid();
                this._drawScale();
            }
        }
        this._updateNowSetting(0);
        this.showData(this._xyMap);
    }

    _updateNowSetting(settingId = 1){
        //Скрываем все табы
        const buttonsContainer = this.shadowRoot.getElementById("idPanelButtonsContainer");
        for(let i = 0; i < this._nowSettingsContainer.children.length; ++i){
            if(this._nowSettingsContainer.children[i].isVisible())
                this._nowSettingsContainer.children[i].hideTab();
            buttonsContainer.children[i].classList.remove("sActive");
        }
        switch(settingId){
            case 0: 
                this._nowSettingsContainer.children[0].showTab();
                buttonsContainer.children[0].classList.add("sActive");
            break;
            case 1:
                this._nowSettingsContainer.children[1].showTab();
                buttonsContainer.children[1].classList.add("sActive");
            break;
        }
    }

    _resize(){
        const ratio = this.shadowRoot.getElementById("idContainer").getBoundingClientRect().width / 
            this.shadowRoot.getElementById("idContainer").getBoundingClientRect().height;
        this._setAspectRatio(ratio)
        this.showData(this._xyMap); 
    }


    _setScale(scale){
        const graph = this.shadowRoot.getElementById("idGraph");
        this._canvasParameters._scaleGraphValue = scale;
        this._drawGraph(this._xyMap);
        this._drawScale(this._canvasParameters.gridNumVert,this._canvasParameters.gridNumHoriz);
        this._setOffset(this._canvasParameters._xOffsetGraphValue)
    }

    _setOffset(offset){
        const graph = this.shadowRoot.getElementById("idGraph");
        const scale = this.shadowRoot.getElementById("idScaleGraph");
        const grid = this.shadowRoot.getElementById("idGrid");
        if(offset < 0)
            offset = 0;
        if((offset) > (graph.viewBox.baseVal.width*this._canvasParameters._scaleGraphValue - graph.viewBox.baseVal.width/2))
            offset = (graph.viewBox.baseVal.width)*this._canvasParameters._scaleGraphValue - graph.viewBox.baseVal.width/2;
        if((offset) < (graph.viewBox.baseVal.width*this._canvasParameters._scaleGraphValue)){
            this._canvasParameters._xOffsetGraphValue = offset;
            graph.setAttribute("viewBox", `${offset} 0 ${graph.viewBox.baseVal.width} ${graph.viewBox.baseVal.height}`)
            this._drawScale(10,5);
        }

    }

    _setViewPort(xMin, xMax, yMin, yMax){
        this._canvasParameters.xMin = xMin;
        this._canvasParameters.xMax = xMax;
        this._canvasParameters.yMin = yMin;
        this._canvasParameters.yMax = yMax;
        this._canvasParameters.xRange = xMax - xMin;
        this._canvasParameters.yRange = yMax - yMin;
        this._canvasParameters.realValuesInit = true;
    }

    _getCoordinate(dot){
        if(this._canvasParameters){
            const graph = this.shadowRoot.getElementById("idGraph");
            const res = {};
            //Переворачиваем координату по y
            res.x = (dot.x-this._canvasParameters.xMin)/(this._canvasParameters.xRange) * 
                (this._canvasParameters.xGraphWidth * this._canvasParameters._scaleGraphValue);
            res.y = (dot.y-this._canvasParameters.yMin)/(this._canvasParameters.yRange) * 
                (this._canvasParameters.yGraphWidth);
            // переносим центр в НИЖНИЙ левый угол
            res.y = this._canvasParameters.yGraphWidth - res.y;
            return res;
        }
    }

    _drawBorder(){
        const border = this.shadowRoot.getElementById("idBorder");
        border.innerHTML = `
            <polyline points="
                0,0 
                0,${this._canvasParameters.yGraphWidth} 
                ${this._canvasParameters.xGraphWidth},${this._canvasParameters.yGraphWidth} 
                ${this._canvasParameters.xGraphWidth},0 
                0,0" 
            fill="none" stroke="var(--color-background-on)" stroke-width="2"/>
        `
    }

    _drawGrid(){
        if(this._canvasParameters){
            //Если установлены параметры отрисовки, рисуем сетку
            const grid = this.shadowRoot.getElementById("idGrid");
            grid.innerHTML = "";
            const xGraphStep = (this._canvasParameters.xGraphWidth)/(this._canvasParameters.gridNumVert);
            const yGraphStep = (this._canvasParameters.yGraphWidth)/(this._canvasParameters.gridNumHoriz);
            const styleGrid = `fill="none" stroke="gray" stroke-dasharray="5,5" stroke-width="1"`;
            const xStep =  (this._canvasParameters.xMax - this._canvasParameters.xMin)/this._canvasParameters.gridNumVert;
            const yStep =  (this._canvasParameters.yMax - this._canvasParameters.yMin)/this._canvasParameters.gridNumHoriz;
            let gridInnerHTML = "";
            for(let i = 0; i < this._canvasParameters.gridNumVert - 1; ++i){
                //Вертикальная линия
                gridInnerHTML += `
                    <polyline points="${(i+1)*xGraphStep},0 
                        ${(i+1)*xGraphStep},${this._canvasParameters.yGraphWidth}" 
                        ${styleGrid}/>
                `
            }
            for(let i = 0; i < this._canvasParameters.gridNumHoriz - 1; ++i){
                //Горизонтальная линия
                gridInnerHTML += `
                    <polyline points="0,${(i+1)*yGraphStep} 
                        ${this._canvasParameters.xGraphWidth},${(i+1)*yGraphStep}" 
                        ${styleGrid}/>
                `
            }
            grid.innerHTML = gridInnerHTML;
            
        }
    }

    _drawGraph(xyMap, maxX){
        if(xyMap instanceof Array){
            //Сортируем по иксу для удобного вывода и ищем максимальные и минимальные значения
            xyMap.sort((x1,x2) => {
                return x1.x - x2.x;
            })
            //настраиваем масштаб по x
            let xMax = xyMap[xyMap.length-1].x;
            if(maxX && maxX < xMax)
                xMax = maxX;
            //Настраиваем масштаб по y
            let yMax = xyMap[0].y;
            let yMin = xyMap[0].y;
            for(let i = 1; i < xyMap.length; ++i){
                if(xyMap[i].x > xMax)
                    break;
                if(yMin > xyMap[i].y){
                    yMin = xyMap[i].y;
                }
                if(yMax < xyMap[i].y){
                    yMax = xyMap[i].y;
                }
            }
            //Устанавливаем текущую область рисования
            this._setViewPort(xyMap[0].x, xMax, yMin, yMax)
            //Строим график-----
            //Конвертируем значения в масштаб графика
            const xyMapGraph = [];
            for(let i = 0; i < xyMap.length; ++i){
                if(xyMap[i].x > xMax)
                    break;
                xyMapGraph.push(this._getCoordinate(xyMap[i]));
            }
            let graphHTML = `<polyline points="`;
            const lineParameters = `fill="none" stroke="red" stroke-width="1"`
            for(let i = 0; i < xyMapGraph.length; ++i){
                graphHTML += `${xyMapGraph[i].x},${xyMapGraph[i].y} `;
            }
            graphHTML+=`" fill="none" stroke="red" stroke-width="1"/>`;
            const graph = this.shadowRoot.getElementById("idGraph");
            graph.innerHTML = graphHTML;
        }

    }

    _drawScale(){
        if(this._canvasParameters.realValuesInit){
            const xGraphStep = (this._canvasParameters._viewBoxXMaxContainer - 
                this._canvasParameters._viewXGraphOffsetLeft - this._canvasParameters._viewXGraphOffsetRight)/(this._canvasParameters.gridNumVert);
            const yGraphStep = (this._canvasParameters._viewBoxYMaxContainer -
                this._canvasParameters._viewYGraphOffsetTop - this._canvasParameters._viewYGraphOffsetBottom)/(this._canvasParameters.gridNumHoriz);
            const xOffset = (this._canvasParameters._xOffsetGraphValue)/(this._canvasParameters.xGraphWidth)*
                this._canvasParameters.xRange;
            const xMin = this._canvasParameters.xMin + 
                xOffset/this._canvasParameters._scaleGraphValue;//Учитываем смещение
            const xMax = xMin + 
                this._canvasParameters.xRange / this._canvasParameters._scaleGraphValue;//Учитываем масштаб
            const xStep =  (xMax - xMin)/this._canvasParameters.gridNumVert;
            const yStep =  (this._canvasParameters.yMax - this._canvasParameters.yMin)/this._canvasParameters.gridNumHoriz;
            //Рисуем нижний масштаб
            //Генерируем надписи
            const xFixedNums = Math.trunc(1/xStep);
            const yFixedNums = Math.trunc(1/yStep);
            const xText = [];
            const yText = [];
            for(let i = 0; i < this._canvasParameters.gridNumVert + 1; ++i){
                const val = (xStep*(i) + xMin);
                xText.push(val.toLocaleString("fullwide", {maximumFactionDigits: xFixedNums}));
            }
            for(let i = 0; i < this._canvasParameters.gridNumHoriz + 1; ++i){
                yText.push((yStep*(i) + this._canvasParameters.yMin).toLocaleString("fullwide", {maximumFactionDigits: yFixedNums}));
            }
            let textInnerHTML = "";
            for(let i = 0; i < this._canvasParameters.gridNumVert + 1; ++i){
                let temp = "middle"; 
                if(i == this._canvasParameters.gridNumVert)
                    temp = "end";
                //надпись горизонтальная
                textInnerHTML += `
                    <text x="${(i)*xGraphStep + this._canvasParameters._viewXGraphOffsetLeft}"
                        y="${this._canvasParameters._viewBoxYMaxContainer - this._canvasParameters._viewYGraphOffsetBottom +
                            this._canvasParameters.scaleTextSizeGraph}" text-anchor="${temp}"> ${xText[i]} </text>
                `
            }
            for(let i = 0; i < this._canvasParameters.gridNumHoriz + 1; ++i){
                let temp = 0; 
                if(i == 0)
                    temp = 0;
                else if(i !== this._canvasParameters.gridNumHoriz)
                    temp = 0;
                else
                    temp = this._canvasParameters.scaleTextSizeGraph;
                //надпись слева
                textInnerHTML += `
                    <text x="${this._canvasParameters._viewXGraphOffsetLeft - 5}" 
                        y="${this._canvasParameters._viewBoxYMaxContainer - yGraphStep*i + temp - 
                            this._canvasParameters._viewYGraphOffsetTop - this._canvasParameters._viewYGraphOffsetBottom}" text-anchor="end"> ${yText[i]} </text>
                `
            }
            const scaleSvg = this.shadowRoot.getElementById("idScaleGraph");
            scaleSvg.innerHTML = textInnerHTML;
        }
        
    }

    showData(data, gridNumHoriz = 5, gridNumVert = 10){
        this._xyMap = data;
        this._canvasParameters.gridNumVert = gridNumVert;
        this._canvasParameters.gridNumHoriz = gridNumHoriz;
        this._setOffset(0);
        this._drawGraph(this._xyMap);
        this._drawGrid();
        this._drawScale();
        this._drawBorder();
    }

}

customElements.define("v-graph", VGraph);
