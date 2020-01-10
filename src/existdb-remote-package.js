// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/paper-ripple/paper-ripple.js';

import '../assets/@polymer/iron-icons/iron-icons.js';
import '../assets/@polymer/paper-icon-button/paper-icon-button.js';
import '../assets/@polymer/paper-progress/paper-progress.js';


import {settings} from "./settings.js";

// todo
class ExistdbRemotePackage extends LitElement {

    static get styles() {
        return css`
            :host {
                display: block;
                padding: 30px;
                position: relative;
                background: white;
                margin:4px;
                

                --paper-icon-button: {
                    color: var(--paper-blue-700);
                };
                box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),0 3px 1px -2px rgba(0, 0, 0, 0.2);
                cursor: pointer;
                
                --paper-progress-active-color:var(--existdb-highlight-bg);



            }
            :host:focus{
                box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
                0 3px 14px 2px rgba(0, 0, 0, 0.12),
                0 5px 5px -3px rgba(0, 0, 0, 0.4);
            }
            
            .wrapper{
                display: grid;
                grid-template-columns:128px auto 100px;
            }
            
            .icon{
                width:64px;
                grid-column: 1 / 2;
            }
            .info{
                grid-column: 2 / 3;
            }
            
            .info .type{
                text-transform:uppercase;
                border:thin solid var(--existdb-drawer-icon-color);
                border-radius:14px;
                width:100px;
                padding:2px;
                text-align:center;
                font-size:12px;
                color:var(--existdb-drawer-icon-color);
            }
            .info .title{
                font-size:22px;
                font-weight:500;
                padding:10px 0;
            }
            .info .version:before{
                content:'Version ';
            }
            
            #progress{
                position: absolute;
                top:0;
                left:0;
                width:100%;
                display: block;
            }


            paper-icon-button {
                min-height: 36px;
                min-width: 36px;
                color:var(--existdb-drawer-icon-color);
                width:48px;
                height:48px;
            }

            #info{
                display:inline-block;
                z-index:100;
            }
            #install:not([hidden]){
                display: inline-block;
                top:10px;
                right:40px;
            }

            existdb-package-remove-action{
                top:10px;
                right:40px;
                display: inline-block;
            }

            .actions{
                align-self:center;
                text-align:center;
            }
            
            .actions > *{
                display:inline-block;
                text-align:center;
            
            }

            @media only screen and (min-width: 768px) {
                :host{
                    min-width:300px;
                }
            }
            
        `;
    }

    render() {
        return html`

        <iron-ajax id="installPackage"
                   verbose with-credentials
                   method="post" 
                   handle-as="text"
                   @response="${this._handleResponse}"
                   @error="${this._handleError}"></iron-ajax>

        <paper-progress id="progress" class="slow"></paper-progress>

        <div id="wrapper" class="wrapper" url="${this.url}">
            
            <img class="icon grid-item" src="${this.icon}">
            <div class="info grid-item">
                <div class="type">${this.type}</div>
                <div class="title">${this.title}</div>
                <div class="version">${this.version}</div>
                <div class="details">
                </div>           
            </div>
            <div class="actions">
                <paper-icon-button icon="cloud-download" @click="${this._install}"></paper-icon-button>
                <paper-icon-button icon="info-outline" @click="${this._showDetails}"></paper-icon-button>
            </div>
            
        </div>
        
        `;
    }


    static get properties() {
        return {
            item: {
                type: Object
            },
            abbrev: {
                type: String,
                reflect: true
            },
            authors: {
                type: String
            },
            available: {
                type: String
            },
            changes: {
                type: String
            },
            description: {
                type: String
            },
            icon: {
                type: String
            },
            installed: {
                type: String
            },
            license: {
                type: String
            },
            name: {
                type: String
            },
            note: {
                type: String
            },
            path: {
                type: String,
                reflect: true
            },
            readonly: {
                type: String
            },
            requires: {
                type: String
            },
            status: {
                type: String
            },
            title: {
                type: String
            },
            type: {
                type: String,
                reflect: true
            },
            url: {
                type: String,
                reflect: true
            },
            version: {
                type: String
            },
            website: {
                type: String
            }
        };
    }

    constructor() {
//                console.log('constructor Packagemanager-app')
        super();
        this.item = {};
        this.running = false;

    }


    connectedCallback() {
        super.connectedCallback();
    }

    firstUpdated(changedProperties) {
        this.tabIndex = 0;

        // console.log('this.item is ', this.item);

        this.addEventListener('click', this._openApp);
        this.addEventListener('keyup', this._handleEnter);

        this.progress = this.shadowRoot.getElementById('progress');

    }

    async _install() {
        /*
                        console.log('install action install');
                        console.log('install action install url ', this.url);
                        console.log('install action install version ', this.version);
        */

        this.progress.hidden = false;
        this.progress.indeterminate = true;


        const installPackage = this.shadowRoot.getElementById('installPackage');
        installPackage.params = {
            "package-url": this.url,
            "action": "install",
            "abbrev": this.abbrev,
            "version": this.version
        };
        installPackage.url = new URL(settings.packageActionPath, document.baseURI).href;
        installPackage.generateRequest();
    }

    _hide() {
        this.hidden = true;
    }

    _handleResponse(data) {
//                console.log("response: ", data);
//                console.log("install response: ", JSON.parse(this.$.installPackage.lastResponse).err);

        const install = this.shadowRoot.getElementById('installPackage');
        const resp = JSON.parse(install.lastResponse);
        // var error = resp.error;
//                console.log("_handleResponse ", error);

        this.progress.hidden = true;

        /*
                const anim = anime.timeline({
                    easing:'easeInOutCirc',
                    duration:300
                });

                anim.add({
                   targets:this,
                   height:['80px','0px'],
                   padding:0,
                    margin:0,
                    border:0,
                    opacity:0,
                    translateX:-3000,
                   duration:300
                });

                anim.finished.then(this._hide(this));
        */


        if (Reflect.has(resp, 'error')) {
            this.dispatchEvent(new CustomEvent('package-install-error', {
                bubbles: true,
                composed: true,
                detail: {error: resp.error, trace: resp.trace}
            }));
        } else {
            this.dispatchEvent(new CustomEvent('package-installed', {
                bubbles: true,
                composed: true,
                detail: {abbrev: this.abbrev}
            }));
            this.hidden = true;
        }



    }

    _handleError(e) {
        //does fire only in case there's a real server error
        this.dispatchEvent(new CustomEvent('package-install-error', {
            bubbles: true,
            composed: true,
            detail: {error: e.detail}
        }));
    }


    _showDetails(e) {
        e.preventDefault();
        e.stopPropagation();

        console.error('todo');
        this.progress.hidden = true;

    }


    _handleStatus() {
        if (this.status == 'installed') {
            this.install.hidden = true;
            this.remove.hidden = false;
        } else {
            this.remove.hidden = true;
            this.install.hidden = false;
        }
    }

    _showInfo(e) {
//                console.log('_showInfo ', e);
        e.stopPropagation();
        //    todo

    }


    /*
        _installOtherVersion(e) {
            //todo
            this.install.version = e.detail.version;
            this.install.submit(e);

        }
    */


}

customElements.define('existdb-remote-package', ExistdbRemotePackage);