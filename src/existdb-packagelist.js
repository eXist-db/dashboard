// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/paper-spinner/paper-spinner.js';


import('./existdb-packageloader.js');
import('./existdb-local-package.js');
import('./existdb-remote-package.js');

// Extend the LitElement base class
class ExistdbPackagelist extends LitElement {

    static get styles(){
        return css`
            :host {
                position: relative;
                background: whitesmoke;
                height: 100vh;
                width: 100%;
                
                display:flex;
                flex-direction:column;

                --paper-icon-button: {
                    color: var(--paper-blue-300);
                };

            }
            
            .wrapper{
                flex:1 1 auto;
                width:100%;
                height:100%;
                overflowX:auto;
            }
            #localItemList{
                /*width:100%;*/
                /*display: block;*/
                padding: 10px;
                margin:0;
                background: whitesmoke;
                display: flex;
                flex-direction:row;
                flex-wrap:wrap;
                justify-content:center;
            }

            @media only screen and (max-width: 768px) {
                #localItemList{
                    display: block;
                }
            }


            ::slotted(repo-packages){
                display: block;
                width: 100%;
            }
            paper-progress.paper-progress{
                width: 100%;
                display: block;
                margin-top: -2px;
                flex-grow:5;

                --paper-progress-active-color: var(--paper-blue-500);
                --paper-progress-height: 5px;

            }
            [hidden]{
                display:none;
            }
            .spin-wrapper{
                position: relative;
                width: 100%;
                text-align: center;
                height: 1px;
                z-index: 10;
                top: 20px;
            }
            paper-spinner{
                padding: 10px;
                background: var(--paper-grey-200);
                border-radius: 24px;
                box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
                0 1px 10px 0 rgba(0, 0, 0, 0.12),
                0 2px 4px -1px rgba(0, 0, 0, 0.4);
            }
            iron-icon{
                width:80px;
                height:80px;
            }
        `;
    }

    _getPackage(item){
        if(this.type === 'local'){
            return html`
                <existdb-local-package    
                    abbrev="${item.abbrev}"
                    authors='${item.authors}'
                    available="${item.available}"
                    description="${item.description}"
                    icon="${item.icon}"
                    installed="${item.installed}"
                    name="${name}"
                    path="${item.path}"
                    readonly="${item.readonly}"
                    status="${item.status}"
                    title="${item.title}"
                    type="${item.type}"
                    url="${item.url}"
                    version="${item.version}"
                    website='{item.website}'>
                </existdb-local-package>
            `;
        }else{
            return html`
                <existdb-remote-package
                    abbrev="${item.abbrev}"
                    authors='${item.authors}'
                    available="${item.available}"
                    changes="${item.changes}"
                    description="${item.description}"
                    icon="${item.icon}"
                    installed="${item.installed}"
                    name="${item.name}"
                    note="${item.note}"
                    path="${item.path}"
                    readonly="${item.readonly}"
                    requires="${item.requires}"
                    status="${item.status}"
                    title="${item.title}"
                    type="${item.type}"
                    url="${item.url}"
                    version="${item.version}"
                    website='{item.website}'>
                </existdb-remote-package>
            `;
        }
    }

    render(){
        return html`

        <existdb-packageloader  id="loader"
                                scope="${this.type}"
                                @response="${this._handleList}"></existdb-packageloader>
        <div class="wrapper">
                 ${this.packages.map((item) =>
                    html`
                        ${this._getPackage(item)}
                    `)}
         </div>
        `;
    }

    static get properties() {
        return {
            url: {
                type:String,
                reflect:true
            },
            autoLoad:{
                type:Boolean
            },
            count:{
                type:Number,
                reflect:true
            },
            type:{
                type: String
            },
            packages:{
                type:Array
            }
        };
    }


    constructor() {
        super();
        this.autoLoad = false;
        this.count = 0;
        this.packages = [];
    }

    firstUpdated(changedProperties) {
        // super.firstUpdated(changedProperties);

        // console.log('firstUpdated ', this);

        this.spinner = this.shadowRoot.getElementById('spinner');
        this.loader = this.shadowRoot.getElementById('loader');

        if(this.autoLoad){
            this.loadPackages();
        }

/*
        window.addEventListener('package-removed', function(e){
            this.loadPackages();
        }.bind(this));

        window.addEventListener('package-installed', function (e) {
            console.log('package-installed ', e);
            this.loadPackages();
        }.bind(this));

*/
        /*
        window.addEventListener('package-remove-error', function (e) {
            this._toastError(e.detail.error.error.message)
        }.bind(this));

        window.addEventListener('package-installed', function (e) {
            console.log('package-installed ', e);
            this._toast('Package has been installed: ' + e.detail.abbrev)
            this.loadPackages();
        }.bind(this));
        window.addEventListener('package-install-error', function (e) {
            this._toastError(e.detail.error.error.message)
        }.bind(this));
*/

    }


    loadPackages(){
        // this.$.spinner.hidden=false;
        // this._toggleSpinner();
        this.loader.generateRequest();
    }


    getPackages(){
        return this.packages;
    }

    async _handleList(e){
        console.log('handleList ',e);
        this.packages = this.loader.lastResponse;

        console.log('handleList items ', this.packages);

        this.updateComplete.then(() => { this._animate() });

    }

    async _animate(){

        let packages;
        if(this.type === 'local'){
            packages =  this.shadowRoot.querySelectorAll('existdb-local-package');
        }else {
            packages =  this.shadowRoot.querySelectorAll('existdb-remote-package');
        }
        // var apps = this.shadowRoot.querySelectorAll('existdb-local-package');

        console.log('packages to animate ', packages);
/*
        anime({
            targets: this.shadowRoot.querySelector('.wrapper'),
            opacity: [0.7,1],
            translateY:[-1000,0],
            // scale:[0.1,1],
            // delay: anime.stagger(30),
            duration:400,
            easing: 'easeInOutQuad'
        });
*/
        anime({
            targets: packages,
            opacity: [0,1],
            translateY:[-100,0],
            scaleY:[0.5,1],
            delay: anime.stagger(30),
            duration:300,
            easing: 'easeInOutCirc'
        });


    }

    _handlePackages (data) {
//                console.log('existdb-packages._handlePackages');

        // this.appList = this.loader.lastResponse;

        // this.innerHTML = this.loader.lastResponse


//                console.log('repo-packages ', this.shadowRoot.querySelector('repo-packages'));
        this.packages = this.querySelectorAll('existdb-package')
        this.count = this.packages.length;

        this.dispatchEvent(new CustomEvent('packages-loaded', {bubbles: true, composed: true, detail: {type:this.id}}));
        this._toggleSpinner();
    }

    _handleLocalError(e) {
//                console.log("loading of available packages failed", e.detail.error)
        this._toggleSpinner();

        this.dispatchEvent(new CustomEvent('packages-load-error', {bubbles: true, composed: true, detail: {error:'loading of available packages failed'}}));
    }

    _toggleSpinner(){
        return !this.spinner.hidden;
    }

    _handleCount(newValue, oldValue){
//                console.log("_handleCount ", newValue, oldValue)
    }




}
customElements.define('existdb-packagelist', ExistdbPackagelist);