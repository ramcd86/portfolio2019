declare global {
    interface Window {
        // scroll: any;
        // scrollBy: any;
    }
    interface HTMLElement {
        scrollIntoView: any;
    }
}

export class GlobalComponent {

    public string: string;
    public number: number;
    public boolean: boolean;

    public aboutAnchor: HTMLElement;
    public techAnchor: HTMLElement;
    public companiesAnchor: HTMLElement;

    public aboutLink: HTMLElement;
    public techLink: HTMLElement;
    public companiesLink: HTMLElement;
    public contactLink: HTMLElement;

    constructor() {

        this.aboutAnchor = document.querySelector('#aboutAnchor');
        this.techAnchor = document.querySelector('#techAnchor');
        this.companiesAnchor = document.querySelector('#companiesAnchor');

        this.aboutLink = document.querySelector('#about');
        this.techLink = document.querySelector('#technologies');
        this.companiesLink = document.querySelector('#companies');
        this.contactLink = document.querySelector('#contact');
        
        this.init()
    }

    public init() {

        this.aboutLink.addEventListener('click', () => {
            this.aboutAnchor.scrollIntoView({
                behavior: 'smooth'
            })
        })

        this.techLink.addEventListener('click', () => {
            this.techAnchor.scrollIntoView({
                behavior: 'smooth'
            })
        })

        this.companiesLink.addEventListener('click', () => {
            this.companiesAnchor.scrollIntoView({
                behavior: 'smooth'
            })
        })


    }

}