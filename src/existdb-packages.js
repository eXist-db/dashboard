// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/paper-spinner/paper-spinner.js';
import '../assets/@polymer/iron-ajax/iron-ajax.js';

import('./repo-app.js');

// Extend the LitElement base class
class ExistdbPackages extends LitElement {

    static get styles(){
        return css`
            body{
                margin:0;
                padding:0;
            }
            :host {
                position: relative;
                background: whitesmoke;
                margin:0;
                padding:0;
                height: 100%;
                width: 100%;

                --paper-icon-button: {
                    color: var(--paper-blue-300);
                };

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

        `;
    }

    render(){
        return html`
        <iron-ajax id="loadPackages"
                   verbose with-credentials
                   method="get" handle-as="text"
                   @response="${this._handlePackages}"
                   @error="${this._handleLocalError}"></iron-ajax>


        <div class="spin-wrapper" id="spinner">
            <paper-spinner id="spinner" active></paper-spinner>
        </div>

        <div id="localItemList" class="items" type="packagemanager">

        </div>        
        `;
    }

    static get properties() {
        return {
            url: {
                type:String,
                reflect:true
            },
            service:{
                type: String,
                reflect:true
            },
            autoLoad:{
                type:Boolean
            },
            count:{
                type:Number,
                reflect:true,
                observer:'_handleCount'
            }
        };
    }


    constructor() {
        super();
        this.autoLoad = false;
        this.count = 0;


    }

    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);

        const resolved = this._resolveService();
        console.log('resolved service url: ', resolved);


        this.spinner = this.shadowRoot.getElementById('spinner');
        this.loader = this.shadowRoot.getElementById('loadPackages');

        if(this.autoLoad){
            this.loadPackages();
        }

        window.addEventListener('package-removed', function(e){
            this.loadPackages();
        }.bind(this));

        window.addEventListener('package-installed', function (e) {
            console.log('package-installed ', e);
            this.loadPackages();
        }.bind(this));

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

    _resolveService(){
        return new URL(this.service, document.baseURI).href;
    }

    loadPackages(){
        // this.$.spinner.hidden=false;
        this._toggleSpinner();
        this.loader.url = this._resolveService();
        this.loader.generateRequest();
    }


    getPackages(){
        return this.packages;
    }


    _handlePackages (data) {
//                console.log('existdb-packages._handlePackages');

        // this.appList = this.loader.lastResponse;

        // this.innerHTML = this.loader.lastResponse


//                console.log('repo-packages ', this.shadowRoot.querySelector('repo-packages'));
        this.packages = this.querySelectorAll('repo-app')
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
customElements.define('existdb-packages', ExistdbPackages);