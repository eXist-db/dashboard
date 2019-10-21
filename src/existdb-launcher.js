// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/iron-ajax/iron-ajax.js';
import {settings} from './settings.js';
import './repo-app.js';
import './repo-icon.js';
import './launcher-app.js';
import './existdb-branding.js';

// Extend the LitElement base class
class ExistdbLauncher extends LitElement {

    static get styles(){
        return css`
            :host {
                display: block;
                position:relative;
                background:transparent;
            }

            [launcher] repo-packages{
                display:flex;
                flex-direction: row;
                flex-wrap: wrap;
                align-items: center;
            }

            [launcher] repo-app{
                width:150px;
                height:150px;
                position:relative;
                cursor: pointer;
                margin:10px;
            }
            [launcher] repo-title{
                font-size:12px;
                display:block;
                position: absolute;
                bottom:4px;
                /*left: 15px;*/
                left: 0px;
                width: 100%;
                text-align: center;
                height:36px;
                text-shadow: -2px 2px 2px rgba(108,98,98,0.3);
                color:var(--paper-grey-900);
            }
            [launcher] repo-icon{
                width: 100%;
                height: 100%;
                vertical-align: middle;
                display: table-cell;
                background: transparent;
            }

            [launcher] repo-name,
            [launcher] repo-version,
            [launcher] repo-type,
            [launcher] repo-authors,
            [launcher] repo-abbrev,
            [launcher] repo-description,
            [launcher] repo-website,
            [launcher] repo-url,
            [launcher] repo-license {
                display:none;
            }

            [hidden]{
                display: none;
            }
        `;
    }


    static get properties() {
        return {
            /**
             * list of packagenames to be excluded from display. Loaded from settings.js
             */
            ignores:{
                type: Array
            },
            /**
             * resolved absolute URL for loading app packages from packageservice app
             */
            appPackageURL:{
                type: String
            }
        };
    }

    constructor(){
        super();

        this.ignores = settings.ignoredPackages;
        this.appPackagePath = settings.appPackagePath;
        this.appPackageURL = new URL(settings.appPackagePath, document.baseURI).href;
    }

    /**
     * Implement `render` to define a template for your element.
     *
     * You must provide an implementation of `render` for any element
     * that uses LitElement as a base class.
     */
    render() {
        /**
         *
         */
        return html`
            <iron-ajax id="loadApplications"
                       method="get"
                       handle-as="text"
                       @response="${this._displayApplications}"
                       url="${this.appPackageURL}"
                       on-error="_handleError">
            </iron-ajax>
    
            <div id="apps" class="apps" launcher type="launcher">
                <div id="logo"></div>
                <slot id="slot"></slot>
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
       console.log('ExistdbLauncher connected ', this);
    }

    firstUpdated(changedProperties) {
        this.shadowRoot.getElementById('loadApplications').generateRequest();
        this.focus();
    }

    _displayApplications(e){
        console.log('_displayApplications ', e);
        this.shadowRoot.getElementById('apps').innerHTML = this.shadowRoot.getElementById('loadApplications').lastResponse;

        // show branding unless we're embedded in dashboard
        if(!this._isEmbedded()){
            var branding = document.createElement('existdb-branding');
            var packageRoot = this.shadowRoot.getElementById('apps').querySelector('repo-packages');
            packageRoot.insertBefore(branding, packageRoot.querySelector('repo-app'));
        }

        var apps = this.shadowRoot.querySelectorAll('repo-app');
//                console.log("apps: ", apps);

        // filtering out ignored apps
        for (var i=0; i < apps.length; i++) {
            var abbrev = apps[i].attributes.abbrev.value;
//                    console.log('current ', abbrev);

            if(this.ignores != undefined && this.ignores.indexOf(abbrev) != -1){
//                        console.log('ignoring ', abbrev);
                apps[i].style.display='none';
            }
        }
    }

    _isEmbedded(){
        return document.querySelector('existdb-dashboard') != null;
    }


}

// Register the new element with the browser.
customElements.define('existdb-launcher', ExistdbLauncher);