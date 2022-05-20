'use strict'

class VInput extends HTMLElement {

	

	constructor() {
	  super();
	  // элемент создан
	}
  
	connectedCallback() {
		//Достаем атрибуты
		this.AType = this.getAttribute('type') || 'simpleText';//Тип проверка
		this.ACaption = this.getAttribute("caption") || null;//Заголовок над полем для ввода
		this.AValidate = this.getAttribute("validate") || "false";//Нужно ли проверять ввод и выводить ошибку
		this.AName = this.getAttribute("name") || null;//Имя поля для ввода (чтобы использовать значение в форме)
		this.AErrorHidden = this.getAttribute("errorHidden") || "false";
		this.value = this.getAttribute("value") || null;
		this._AMin = this.getAttribute("min");
		this._AMax = this.getAttribute("max");
		this._oldValue = (this.value ? this.value.slice() : undefined) || "";
		const mInput = document.createElement("input");
		if(this.AName)
			mInput.name = this.AName;
		mInput.type = "text";
		this.appendChild(mInput);
		//Создаем shadowDOM елемента
		this.attachShadow({mode: "open"});
		const style = document.createElement("style");
		style.innerHTML = `
			*{
				--up-top: 0px;
				--down-top: 17px; 
				--font-main-size: 16px; /*Только размер (без констант small, large...)*/
				--font-placeholder-size: 12px;
				--num-available-values-shown: 5;
			}
			
			/*Контейнер всего*/
			#idContainer{
				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				padding-top: 10px;
				position: relative;
				margin: 1px 0px;
			}
			
			/*Контейнер, где находятся поле ввода и доп кнопка*/
			#idInputFieldContainer{
				display: flex;
				flex-grow: 1;
				border: 1px solid transparent;
				border-bottom: 1px solid var(--color-background-on);
			}
			
			#idInputFieldContainer.sErrorInput{
				border-bottom: 1px solid red;
			}

			#idInputFieldContainer.sDisabled{
				border-bottom: 1px solid var(--color-background-placeholder);
			}
			
			#idInputFieldContainer.sFocus{
				border: 1px solid var(--color-accent);
				box-shadow: 0px 0px 2px 1px var(--color-accent);
			}
			
			
			@keyframes focusAnim {
				to{
					top: var(--up-top);
					font-size: var(--font-placeholder-size);
					color: var(--color-accent)
				}
			}
			
			@keyframes blurAnim{
				from{
					top: var(--up-top);
					font-size: var(--font-placeholder-size);
					color: var(--color-accent)
				}
			
				to{
					top: var(--down-top);
					font-size: var(--font-main-size);
					color: var(--color-background-placeholder);
				}
			}
			
			
			#idInputFieldContainer::before{
				content: attr(data-caption);
				margin-left: 2px;
				padding: 0px 5px;
				position: absolute;
				background-color: var(--color-background);
				top: var(--down-top);
				pointer-events: none;
				color: var(--color-background-placeholder);
				min-width: calc(100% - 50px)
			}
			
			
			#idInputFieldContainer.focusNoDataAnim::before{
				animation: focusAnim 0.1s linear 0s 1;
				animation-fill-mode: forwards;
				min-width: auto;
			}
			
			#idInputFieldContainer.focusNoDataWithoutAnim::before{
				top: var(--up-top);
				font-size: var(--font-placeholder-size);
				color: var(--color-accent);
				min-width: auto;
			}
			
			#idInputFieldContainer.focusWithData::before{
				top: var(--up-top);
				font-size: var(--font-placeholder-size);
				color: var(--color-accent);
				min-width: auto;
			}
			
			#idInputFieldContainer.blurNoDataAnim::before{
				animation: blurAnim 0.1s linear 0s 1;
				animation-fill-mode: forwards;
				min-width: calc(100% - 50px);
			}
			#idInputFieldContainer.blurNoDataWithoutAnim::before{
				top: var(--down-top);
				font-size: var(--font-main-size);
				color: var(--color-background-placeholder);
				min-width: calc(100% - 50px);
			}
			
			#idInputFieldContainer.blurWithData::before{
				top: var(--up-top);
				font-size: var(--font-placeholder-size);
				color: var(--color-background-placeholder);
			}
			
			/*Поле для ввода*/
			#idInput{
				flex-grow: 1;
				padding: 5px 2px 2px 2px;
				font-size: inherit;
				border: 1px solid transparent;
				outline: none;
				font-size: var(--font-main-size);
			}

			#idInput:disabled{
				background: transparent;
				-webkit-touch-callout: none; /* iOS Safari */
				-webkit-user-select: none;   /* Chrome/Safari/Opera */
				-khtml-user-select: none;    /* Konqueror */
				-moz-user-select: none;      /* Firefox */
				-ms-user-select: none;       /* Internet Explorer/Edge */
				user-select: none; 
			}
			
			/*Доп кнопка (исп при вводе паролей)*/
			#idAdditionalButton{
				align-self: center;
				width: calc(var(--font-main-size) + 6px);
				height: calc(var(--font-main-size) + 6px);
				background-color: var(--color-background-placeholder);
			}
			#idAdditionalButton:hover{
				background-color: var(--color-background-on);
			}
			
			#idAdditionalButton.sPasswordHidden{
				-webkit-mask-size: cover;
				mask-size: cover;
				  -webkit-mask-image: url(views/VInput/imgs/password_hidden.svg);
				  mask-image: url(views/VInput/imgs/password_hidden.svg);
			}
			
			#idAdditionalButton.sPasswordShown{
				-webkit-mask-size: cover;
				  mask-size: cover;
				  -webkit-mask-image: url(views/VInput/imgs/password_shown.svg);
				  mask-image: url(views/VInput/imgs/password_shown.svg);
			}
			
			/*Возможные значения*/
			#idAvailableValuesContainer{
				display: flex;
				flex-direction: column;
				position: absolute;
				width: 75%;
				top: calc(var(--font-main-size) + 27px);
				background-color: var(--color-background);
				z-index: 1;
				visibility: collapse;
				max-height: calc(var(--num-available-values-shown)*(var(--font-main-size)*0.75 + 13px));
				overflow-y: auto;
				overflow-x: hidden;
				border: 1px solid var(--color-primary);
				border-radius: 3px;
			}
			
			.sAvailableValue{
				padding: 5px;
				font-size: calc(var(--font-main-size)*0.75);
				background-color: var(--color-background-dark);
				border-bottom: 1px solid var(--color-primary);
				border-right: 1px solid var(--color-primary);
			}
			#idAvailableValuesContainer.sAvailableValue{
				border: none;
			}
			.sAvailableValue.sFocus, .sAvailableValue:hover{
				background-color: var(--color-primary-dark);
			}
			
			
			.cFindText{
				background-color: yellow;
			}
		`
		this.shadowRoot.innerHTML = `
		<!-- <link rel="stylesheet" type="text/css" href="/javascripts/VInput/VInputStyle.css"> -->
		<div id="idContainer">
			<div id="idInputFieldContainer"  data-caption="${this.ACaption}">
				<input id="idInput" type="text">
				<bтutton id="idAdditionalButton" class="sPasswordHidden"></button>
			</div>
			<div id="idAvailableValuesContainer">
			</div>
			<v-error id="idError" font-size="7px"></v-error>
		</div>`
		this.shadowRoot.appendChild(style);
		this._viewInputContainer = this.shadowRoot.getElementById("idInputFieldContainer");
		this._viewInput = this.shadowRoot.getElementById("idInput");
		this._viewContainer = this.shadowRoot.getElementById("idContainer");
		this._viewAdditionalButton = this.shadowRoot.getElementById("idAdditionalButton");
		this._viewError = this.shadowRoot.getElementById("idError");
		this._viewAvailableValuesContainer = this.shadowRoot.getElementById("idAvailableValuesContainer");
		//Настраиваем поле ввода
		if(this._viewInput instanceof HTMLInputElement){
			
			this.setValue(this.value)
			this._viewInput.oninput = (inputEvent) => {
				if(this.AType == "number"){
					if(this._validateFunc(this._viewInput.value, true)){
						inputEvent.preventDefault();
						return;
					}
				}
				if(inputEvent.data)
					this._viewInput.value = this._viewInput.value.substring(0, this._viewInput.value.length-1);
				if(this.onInput && this.onInput(inputEvent) != false){
					if(inputEvent.data)
						this._viewInput.value += inputEvent.data;
					this.setValue(this._viewInput.value);
				}
				else{
					if(this.onInput)
						return;
					else{
						if(inputEvent.data)
							this._viewInput.value += inputEvent.data;
						this.setValue(this._viewInput.value);
					}
				}
				if(this.onchange){
					//Вызываем событие изменения с значения до значения
					this.onchange(this._oldValue, this._viewInput.value);
				}
				
				this._validateFunc(this._viewInput.value, this.AValidate === "true");
				//Проверяем возможные значения и инициализируем
				if(!this._hiddenAvailableValueView)
					this._initAvailablesValues();
			}
			if(this.AType == 'password'){
				this._viewInput.type = "password";
			}else if (this.AType === "date"){
				this._viewInput.type = "date";
			}else if(this.AType === "datetime"){
				this._viewInput.type = "datetime-local";
			}else if(this.AType === "number"){
				this._viewInput.type = "number";
				
				if(this._AMin != undefined)
					this._viewInput.min = this._AMin;
				if(this._AMax != undefined)
					this._viewInput.max = this._AMax;
			}
			if(this.AName){
				this._viewInput.name = this.AName;
			}
		}

		this._viewInput.onfocus = () => {
			if(this._actChangePasswordVisibility){
				this._actChangePasswordVisibility = false;
				return;
			}
			this._focus = true;
			this._initAvailablesValues();
			this._onFocusChange(true, this.value);
		}
		this._viewInput.onblur = (e) => {
			if(this._actChangePasswordVisibility)
				return;
			this._focus = false;
			this._hideAvailablesValuesView();
			this._onFocusChange(false, this.value);
		}
		//Настраиваем поле ошибки
		if(this.AErrorHidden === "true"){
			this._viewError.hidden = true;
		}
		this._viewError.setFontSize("10px");
		//Настраиваем дополнительную кнопку
		this._viewAdditionalButton.hidden = !(this.AType === "password");
		this._viewAdditionalButton.onmousedown = () => {
			this._actChangePasswordVisibility = true;
		}
		this._viewAdditionalButton.onclick = (e) => {
			if(this._passwordShown){
				this._passwordShown = false;
				this._viewAdditionalButton.className = "sPasswordHidden";
				this._viewInput.type = "password";
			}else{
				this._passwordShown = true;
				this._viewAdditionalButton.className = "sPasswordShown";
				this._viewInput.type = "text";
			}
			this._viewInput.focus();
		};
		this.focus = () => {
			this._viewInput.focus()
		}
	}

	setValue(val){
		if((typeof val) === "string"){
			if(this.AType === "date"){
				//Переводим в yyyy-mm-dd
				val = val.substring(0,10);
			}else if(this.AType === "datetime"){
				//val = val.substring(0,val.lastIndexOf(":"))
			}
			this.value = val;
			this._viewInput.value = this.value;
			this.firstElementChild.value = val;
			this._onFocusChange(this._focus == true, val, false);
		}else if(val instanceof Date){
			let dateIso = CDate.dateTimeToIsoString(val);
			if(this.AType === "date"){
				//Переводим в yyyy-mm-dd
				dateIso = dateIso.substring(0,10);
				this.value = dateIso;
				this._viewInput.value = this.value;
				this.firstElementChild.value = dateIso;
				this._onFocusChange(this._focus == true, dateIso, false);
			}else if(this.AType === "datetime"){
				this.value = dateIso;
				this._viewInput.value = this.value;
				this.firstElementChild.value = dateIso;
				this._onFocusChange(this._focus == true, dateIso, false);
			}
		}else{
			this.value = "";
			this._viewInput.value = this.value;
			this.firstElementChild.value = "";
			this._onFocusChange(this._focus == true, "", false);
		}
	}

	getValue(){
		return this._viewInput.value;
	}

	_hideAvailablesValuesView(){
		//this._viewAvailableValuesContainer.innerHTML = "";
		this._viewAvailableValuesContainer.style.visibility = "hidden";
		this._indexAvailableValueFocus = null;
		this._valueAvailableValueFocus = null;
		this._hiddenAvailableValueView = true;
	}

	_showAvailablesValuesView(){
		this._viewAvailableValuesContainer.style.visibility = "visible";
		this._indexAvailableValueFocus = null;
		this._valueAvailableValueFocus = null;
		this._hiddenAvailableValueView = false;
	}

	_initAvailablesValues(){
		const funcDecodeValueView = function(v){
			if(v instanceof HTMLElement){
				if(v.firstElementChild){
					let res = "";
					for(let i = 0; i<v.children.length; ++i){
						res += v.children[i].innerHTML;
					}
					return res;
				}else{
					return v.innerHTML;
				}
				
			}
			return "";
		} 
		if(this._mAvailablesValues){
			this._viewAvailableValuesContainer.scrollTo(0,0);//Возвращаемся в начало при каждой инициализации
			//Инициализируем события нажатия клавиатуры
			this._viewInput.onkeydown = (e) => {
				if(!this._hiddenAvailableValueView){
					if(e.code === "Enter"){
						console.log(this._valueAvailableValueFocus)
						if(this._valueAvailableValueFocus)
							this.setValue(this._valueAvailableValueFocus);
						this._hideAvailablesValuesView();
						e.preventDefault();
						return false;
					}
					if(e.code === "Escape"){
						this._hideAvailablesValuesView();
						e.preventDefault();
						return false;
					}
					
					if(e.code === "ArrowDown" || e.code === "ArrowUp"){
						const previousIndex = this._indexAvailableValueFocus;
						if(this._indexAvailableValueFocus != undefined && this._indexAvailableValueFocus != null){
							if(e.code === "ArrowUp" && (this._indexAvailableValueFocus == 0)){
								//Игнорируем если уже находимся на нуливом варианте, или вообще еще не выбирали ничего
								e.preventDefault();
								return false;
							}
								
							if(e.code === "ArrowDown"){
								if(this._indexAvailableValueFocus < this._viewAvailableValuesContainer.firstElementChild.children.length)
									++this._indexAvailableValueFocus;
							}else if(this._indexAvailableValueFocus)
								--this._indexAvailableValueFocus;//Минусуем, если больше нуля
						}else{
							if(e.code === "ArrowUp"){
								//Игнорируем если вообще еще не выбирали ничего
								e.preventDefault();
								return false;
							}
							this._indexAvailableValueFocus = 0;
						}
						const numTrueValues = this._viewAvailableValuesContainer.firstElementChild.children.length;
						if(this._indexAvailableValueFocus >= numTrueValues){
								//Игнорируем, если перешли за количество доступных вариантов
								this._indexAvailableValueFocus = numTrueValues - 1;
								e.preventDefault();
								return false;
							}
						//Сбрасываем класс
						if(previousIndex != undefined && previousIndex != null)
							this._viewAvailableValuesContainer.firstElementChild
								.children[previousIndex].className = "sAvailableValue";
						//Прокручиваем, если нужно
						if(this._viewAvailableValuesContainer.firstElementChild.children[this._indexAvailableValueFocus]){
							const row = this._viewAvailableValuesContainer.firstElementChild.children[this._indexAvailableValueFocus];
							this._viewAvailableValuesContainer.firstElementChild.children[this._indexAvailableValueFocus].className += " sFocus";
							const nowOnScreenFrom = this._viewAvailableValuesContainer.scrollTop;
							const nowOnScreenTo = this._viewAvailableValuesContainer.scrollTop + this._viewAvailableValuesContainer.clientHeight;
							const nowSizeCellFrom = row.clientHeight*this._indexAvailableValueFocus;
							const nowSizeCellTo = (row.clientHeight+1)*(this._indexAvailableValueFocus+1);
							if(nowOnScreenTo < nowSizeCellTo)
								this._viewAvailableValuesContainer.firstElementChild.children[this._indexAvailableValueFocus].scrollIntoView(false);
							if(nowOnScreenFrom > nowSizeCellFrom)
								this._viewAvailableValuesContainer.firstElementChild.children[this._indexAvailableValueFocus].scrollIntoView(true);
							this._valueAvailableValueFocus = funcDecodeValueView(row.firstElementChild);
						}
						//Модифицируем дополнение в input
						this._viewInput.value = this._valueAvailableValueFocus;
						//Игнорируем нажатие на стрелки
						e.preventDefault();
						return false
					}
				}

			};
			const search = new cSearch();
			search.setCommonContainerClass("idAvailableValuesContainer");
			search.setRowContainerClass("sAvailableValue");
			//Инициализируем событие клика по варианту
			const onClickRow = (val) => {
				this.value = val;
				this.setValue(val);
				//this._initAvailablesValues();
			}
			search.setOnClickRow((val)=>{
				onClickRow(val);
			})
			//if(this.value !== ""){
				search.search(this._mAvailablesValues, [true], this.value, false, (res, resView) => {
					//Проверяем нашли ли что-то вообще
					let flagFindSmth = false;
					for(let i = 0; i < res.length; ++i){
						if(res[i].flagSmthFindInRow){
							flagFindSmth = true;
							break;
						}
					}
					if(flagFindSmth){
						//Если что-то нашли, строим подсказки
						if(this._viewAvailableValuesContainer.firstElementChild){
							//Если уже есть просто меняем innerHTML
							this._viewAvailableValuesContainer.replaceChild(resView, this._viewAvailableValuesContainer.firstElementChild);
						}else{
							this._viewAvailableValuesContainer.appendChild(resView);
						}	
						this._showAvailablesValuesView();
					}else{
						this._hideAvailablesValuesView();
					}
				})
			/*}else{
				this._hideAvailablesValuesView();
			}*/
		}else{
			this._hideAvailablesValuesView();
		}
	}

	_onFocusChange(focus, content, anim = true){
		this._viewInputContainer.classList.remove("sFocus");
		this._viewInputContainer.classList.remove("focusNoDataAnim");
		this._viewInputContainer.classList.remove("focusNoDataWithoutAnim");
		this._viewInputContainer.classList.remove("focusWithData");
		this._viewInputContainer.classList.remove("blurWithData");
		this._viewInputContainer.classList.remove("blurNoDataAnim");
		this._viewInputContainer.classList.remove("blurNoDataWithoutAnim");
		if(focus)
			this._viewInputContainer.classList.add("sFocus");
		content = content || "";
		if(focus){
			//Если есть фокус
			if(content === ""){
				//Если ничего не введено, то делаем анимацию
				if(anim){
					this._viewInputContainer.classList.add("focusNoDataAnim");
				}else{
					this._viewInputContainer.classList.add("focusNoDataWithoutAnim");
				}
			}else{
				//Если что-то введено, просто меняем цвет заголовка
				this._viewInputContainer.classList.add("focusWithData");
			}
			
		}else if(content !== ""){
			//Если нет фокуса и есть контент, то оставляем заголовок вверху, меняя цвет текста
			this._viewInputContainer.classList.add("blurWithData");	
		}else{
			//если нет фокуса и нет контента возвращаем заголовок по центру
			if(anim){
				this._viewInputContainer.classList.add("blurNoDataAnim");
			}else{
				this._viewInputContainer.classList.add("blurNoDataWithoutAnim");
			}	
		}
	}

	/**
	 * Показать ошибку внизу input
	 * @param {string} error - текс ошибки 
	 */
	showError(error, globalShowError = false){
		if(this._viewError instanceof VError){
			if(error && this.AErrorHidden !== "true"){
				this._globalShowError = globalShowError;
				this._viewError.hidden = false;
				this._viewError.showError(error);
				this._error = error;
			}
		}
		//Индицируем наличие ошибки
		this._viewInputContainer.classList.add("sErrorInput");
	}

	hideError(){
		this._hideError();
		this._error = undefined;
	}
	_hideError(){
		this._globalShowError = false;
		this._viewInputContainer.classList.remove("sErrorInput");
		this._viewError.hideError();
	}

	_validateFunc(input, check){
		if((input instanceof String) || ((typeof input) === 'string')){
			//в зависимости от типа проверяем ввод
			let error = undefined;
			if(check){
				switch (this.AType) {
					case "simpleText":
						//Если просто текст ничего не делаем
						break;
					case "password":
						//Если пароль, то проверяем
						if(input.length < 6 && input.length!=0){
							error = 'Пароль должен быть не менее 6 символов';
						}
						break;
					case "login":
						const err = input.search('[^a-z^A-Z^0-9_.@]');
						if(err != -1){
							//Если есть какая-то ошибка, выводим ее
							error = "Логин не должен содержать символы !#$%^&*()-+= и т.д.";
						}
						break;
					case "number":
						const val = parseInt(input);
						if(val < this._AMin)
							error = "Значение должно быть больше " + this._AMin;
						if(val > this._AMax)
							error = "Значение должно быть меньше " + this._AMax;
					default:
						break;
				}
			}
			
			if(error){
				//Если есть какая-то ошибка, выводим ее
				if(this._viewError instanceof VError){
					this.showError(error)
				}
			}else{
				//Если ошибки нет
				if(this._viewError instanceof VError && (this._globalShowError !== true)){
					this.hideError();
				}
			}
			return error;
		}else{
			this.hideError();
		}
	}


	/**
	 * Задания возможных значений для подстановки в поле ввода
	 * @param {array} availableValues - одномерны массив возможных значений для подстановки
	 */
	setAvailableValues(availableValues){
		this._mAvailablesValues = availableValues;
	}

	setEnabled(enabled){
		if(enabled){
			this._viewInput.disabled = "";
			this._viewInputContainer.classList.remove("sDisabled");
			if(this._error)
				this.showError(this._error);
		}else{
			this._viewInput.disabled = "disabled";
			this._viewInputContainer.classList.add("sDisabled");
			this._hideError();
		}
		
	}

  }
customElements.define("v-input", VInput);


