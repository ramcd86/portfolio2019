import { jsRender } from '../../webJS/main-js'

export interface IAnimation {
    duration: number;
    action: any;
}

 export class nEngineComponent {


    public cache: any;
    public links: any;
    public main: HTMLElement;
    public head: HTMLElement;
    public currentLocation: any;
    public isIE11: boolean;

    
    constructor() {

        this.cache = [];
        this.links = [];
        this.main = document.querySelector('main');
        this.head = document.querySelector('head');
        this.currentLocation = window.location.href;
        this.isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
        this.init();

    }

    render(){};

    onNavigate(): IAnimation {

        return {
            duration: 0,
            action: () => {}
        };
        
    }

    onNavigateComplete(): IAnimation {

        return {
            duration: 0,
            action: () => {}
        };

    }

    onPageLoad(): IAnimation {

        return {
            duration: 0,
            action: () => {}
        };

    }

    onPageLoadComplete(): IAnimation {

        return {
            duration: 0,
            action: () => {}
        };

    }


    init() {


        const linkPointer = (currentLocation: string) => { 
            if (this.isIE11 === false) {
                this.linkManipulator(currentLocation, null); 
            }
            
        };

        if (this.isIE11 === false) {
            this.linkController();
        }


        this.render();

        jsRender();

        setInterval(() => {
            if (window.location.href !== this.currentLocation) {
                linkPointer(window.location.href);
                this.currentLocation = window.location.href;
            }
        }, 100)

    }



    pageStateDirector(directions: string) {

        let incomingObject: IAnimation;

        incomingObject = this.switchController(directions);

        if (!incomingObject) {
            incomingObject.duration = 0;
            incomingObject.action = null;
        }

        return new Promise<any>((resolve, reject) => {
            incomingObject.action();
            setTimeout(() => {
                resolve();
            }, incomingObject.duration);
        });

    }

    switchController(switchControl: string) {

        switch (switchControl) {
            case 'onNavigate':
                return this.onNavigate();
            break;

            case 'onNavigateComplete':
                return this.onNavigateComplete();
            break;

            case 'onPageLoad':
                return this.onPageLoad();
            break;

            case 'onPageLoadComplete':
                return this.onPageLoadComplete();
            break;
        }

    }

    fetch(url: string) {

        return new Promise<any> ((resolve: any, reject: any) => {
                const request: XMLHttpRequest = new XMLHttpRequest();
                request.onload = function () {
                    switch (this.status) {
                        case 200:
                            resolve(this.response);
                        break;
                        case 500:
                            window.location.href = '/500.html';
                            resolve(this.response);
                        break;
                        case 404:
                            resolve(this.response);
                        break;
                        default:
                            resolve(this.response);
                        break;
                    }
                };
                request.onerror = function () {
                    reject(new Error('XMLHttpRequest Error: ' + this.statusText));
                };
                request.open('GET', url);
                request.send();
            });

    }


    transitionHandler(main: string, head: string) {

        this.pageStateDirector('onPageLoad').then(() => {
            this.head.innerHTML = head;
            this.main.innerHTML = main;
            this.render();
            jsRender();
            this.linkController();
            this.pageStateDirector('onPageLoadComplete');
        })

    }

    pageStringConstructor(cachedData?: string, dataUrl?: string, incomingLink?: string, isCache?: boolean) {

        const headContent = cachedData.substring(
            cachedData.lastIndexOf("<head>") + 6,
            cachedData.lastIndexOf("</head>")
        );
        const bodyContent = cachedData.substring(
            cachedData.lastIndexOf("<main>") + 6,
            cachedData.lastIndexOf("</main>")
        );        
        const pageTitle = cachedData.substring(
            cachedData.lastIndexOf("<title>") + 7,
            cachedData.lastIndexOf("</title>")
        );

        if (isCache) {
            this.transitionHandler(bodyContent, headContent)
            window.history.pushState(headContent, pageTitle, dataUrl);
            this.currentLocation = incomingLink;
        } else {
            this.transitionHandler(bodyContent, headContent);
            window.history.pushState(headContent, pageTitle, incomingLink);
            this.currentLocation = incomingLink;
            this.cache.push({
                url: incomingLink,
                data: cachedData
            })
        }

    }

    linkManipulator(history: any = null, x: number) {

        let incomingLink: any = null;

        if (history !== null) {
            incomingLink = history;
        } else if (history === null) {
            incomingLink = this.links[x].href;
        }

        if (this.cache.filter((obj: any) => { return obj.url === incomingLink; }).length > 0) {
            let obj = this.cache.filter((obj: any) => { return obj.url === incomingLink; })
            if (obj[0].data.includes('<div id="notfound">')) {
                window.location.href = '/error.html';
            } else {
                this.pageStringConstructor(obj[0].data, obj[0].url, incomingLink, true);
                }
            } else {
            this.pageStateDirector('onNavigate').then(() => {
                this.fetch(incomingLink).then((resp: string) => {
                    if (resp.includes('<div id="notfound">')) {
                        window.location.href = '/404page';
                    } else {
                        this.pageStateDirector('onNavigateComplete').then(() => {
                            this.pageStringConstructor(resp, null, incomingLink, false);
                        })
                    }
                })
                .catch((error: any) => {
                    return error;
                })
            })
        }

    }

    linkController() {

        const divs = document.querySelectorAll('div');
        const sections = document.querySelectorAll('section');
        const headers = document.querySelectorAll('header');
        const footers = document.querySelectorAll('footer');

        this.links = [];
        this.links = document.querySelectorAll('a');

        Array.from(divs).forEach((div) => {
            if (div.classList.contains('_no-re-render')) {
                Array.from((div).querySelectorAll('a')).forEach((link) => {
                    link.classList.add('_no-re-render');
                })
            }
        })

        
        Array.from(sections).forEach((section) => {
            if (section.classList.contains('_no-re-render')) {
                Array.from(section.querySelectorAll('a')).forEach((link) => {
                    link.classList.add('_no-re-render');
                })
            }
        })

        Array.from(headers).forEach((header) => {
            if (header.classList.contains('_no-re-render')) {
                Array.from(header.querySelectorAll('a')).forEach((link) => {
                    link.classList.add('_no-re-render');
                })
            }
        })

        Array.from(footers).forEach((footers) => {
            if (footers.classList.contains('_no-re-render')) {
                Array.from(footers.querySelectorAll('a')).forEach((link) => {
                    link.classList.add('_no-re-render');
                })
            }
        })

        Array.from(this.links).forEach((link: any, index: number) => {
            if ((link.target !== "") || (link.classList.contains('_no-re-render')) || (link.classList.contains('_no-re-render.a'))) {
            } else {
                link.addEventListener('click', (e: any) => {
                    e.preventDefault();
                    this.linkManipulator(null, index);
                    return false;
                })
            }
        })

    }
}

