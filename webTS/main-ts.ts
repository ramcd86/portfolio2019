
import { BrowserUtility } from './_source/_BrowserUtility-component'; 
import { GlobalComponent } from './_source/_Global-component'; 
import { jsRender } from './../webJS/main-js';
class MainComponent {

    constructor() {
        this.init();
    }

    public init()  {
        jsRender();
        new GlobalComponent(); 
    }

}


window.onload = () => {
    new MainComponent();
}
