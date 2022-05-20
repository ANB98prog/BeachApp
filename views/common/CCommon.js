class CCommon{
    static STYLE_SCROLLBARS = `
        *::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        *::-webkit-scrollbar-track {
            background: rgba(var(--color-primary-components), 0.5);
        }
        *::-webkit-scrollbar-thumb {
            background-color: var(--color-primary);
            border-radius: 5px;
        }
    `

    static URL = "http://localhost:3000";

    
}

class CDate extends Date{

    constructor(val){
        if(val)
            super(val)
        else
            super()
    }

    toStringOutConvert(){
        return CDate.dateToOutString(this)
    }

    toIsoString2(){
        return CDate.dateTimeToIsoString(this);
    }

    static dateTimeToIsoString = (date) => {
        if(date instanceof Date){
            function pad(number) {
                if (number < 10) {
                  return '0' + number;
                }
                return number;
              }
              return date.getFullYear() +
              '-' + pad(date.getMonth() + 1) +
              '-' + pad(date.getDate()) +
              'T' + pad(date.getHours()) +
              ':' + pad(date.getMinutes()) + ":00.000";
        }
    }

    static dateToIsoString = (date) => {
        if(date instanceof Date){
            function pad(number) {
                if (number < 10) {
                  return '0' + number;
                }
                return number;
              }
              return date.getFullYear() +
              '-' + pad(date.getMonth() + 1) +
              '-' + pad(date.getDate());
        }
    }

    static dateTimeToOutString = (date) => {
        if(date instanceof Date){
            function pad(number) {
                if (number < 10) {
                  return '0' + number;
                }
                return number;
              }
              return pad(date.getDate())  + 
              "." + pad(date.getMonth() + 1) +
              "." + date.getFullYear() +
              " " + pad(date.getHours()) +
              ":" + pad(date.getMinutes());
        }
    }

    static dateToOutString = (date) => {
        if(date instanceof Date){
            function pad(number) {
                if (number < 10) {
                  return '0' + number;
                }
                return number;
              }
              return pad(date.getDate())  + 
              "." + pad(date.getMonth() + 1) +
              "." + date.getFullYear();
        }
    }
}