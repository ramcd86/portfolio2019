
// Automatic Imports
// These imports are installed by nFrame automatically.
import { BrowserUtility } from './_source/_BrowserUtility-component'; 
import { GlobalComponent } from './_source/_Global-component'; 
import { jsRender } from './../webJS/main-js';


// Manual Imports.
// Place all manual imports below this line.


class MainComponent {

    constructor() {
        this.init();
    }

    public init()  {
        jsRender();

    // if (document.querySelector('.container--Global')) {
         new GlobalComponent(); 
    //  }; 


    }

}


window.onload = () => {
    new MainComponent();
}
