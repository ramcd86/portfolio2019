declare global {
    interface Window {
        MSInputMethodContext: any;
    }
    
    interface Document {
        documentMode: any;
    }
}

export class BrowserUtility {

    public isEdge(): boolean {
        return (typeof CSS !== 'undefined' && CSS.supports("(-ms-ime-align:auto)"));
    }

    public isIE11(): boolean {
        return !!window.MSInputMethodContext && !!document.documentMode;
    }

    public isFirefox(): boolean {
        let isFF: boolean = false;
        if (navigator.userAgent.indexOf("Firefox") != -1) {
            isFF = true;
        }
        return isFF;
    }

}