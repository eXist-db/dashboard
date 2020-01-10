// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/paper-ripple/paper-ripple.js';

import '../assets/@polymer/iron-icons/iron-icons.js';
import '../assets/@polymer/paper-icon-button/paper-icon-button.js';
import '../assets/@polymer/paper-ripple/paper-ripple.js';


import {settings} from "./settings.js";

// todo
class ExistdbLocalPackage extends LitElement {

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

        <iron-ajax id="removePackage"
                   verbose with-credentials
                   method="post" 
                   handle-as="text"
                   @response="${this._handleDeleteResponse}"
                   @error="${this._handleDeleteError}"></iron-ajax>

        <paper-progress id="progress" class="slow"></paper-progress>
        <paper-ripple></paper-ripple>

        <div id="wrapper" class="wrapper" url="${this.url}">
            
            <img class="icon grid-item" src="${this.icon}">
            <div class="info grid-item">
                <div class="type">${this.type}</div>
                <div class="title">${this.title}</div>
                <div class="version">${this.version}</div>
                <details class="details">
                    <summary>foobar</summary>
                </details>           
            </div>
            <div class="actions">
                <paper-icon-button icon="delete-forever" @click="${this._deletePackage}" title="delete package"></paper-icon-button>
                <paper-icon-button icon="info-outline" @click="${this._showDetails}" title="show details"></paper-icon-button>
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
            description: {
                type: String
            },
            icon: {
                type: String
            },
            installed: {
                type: String
            },
            name: {
                type: String
            },
            path: {
                type: String,
                reflect: true
            },
            readonly: {
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

        /*
                this.addEventListener('keyup',this._handleEnter);

                this.install = this.shadowRoot.getElementById('install');
                this.remove = this.shadowRoot.getElementById('remove');
                this.progress = this.shadowRoot.getElementById('progress');
                this.wrapper = this.shadowRoot.getElementById('wrapper');

                this.install.addEventListener('package-install-started',e => this._onInstallStarted(e));
                this.install.addEventListener('package-installed',e => this._onInstalled(e));
                this.remove.addEventListener('package-remove-started',e => this._onRemove(e));
                this.addEventListener('click',e => this._handleTap(e));
                this.addEventListener('requestInstall', this._installOtherVersion);
        */

    }

    _handleTap(e) {
        e.stopPropagation();

        var t = e.target.nodeName.toLowerCase();
//                console.log('_handleTap ',e);
//                console.log('_handleTap ',e.b[0].id);
//                console.log('_handleTap ',e.path);

        // ugly special case handling for Chrome and FF but don't know how to solve better yet.
        if (e.path != undefined) {
            console.log('########', e.path[0].nodeName);
            if (e.path[0].nodeName == 'EXISTDB-PACKAGE-REMOVE-ACTION') return;
        }
        if (e.b != undefined && e.b[0].id == 'remove') return;

        if (t == 'existdb-package-remove') return;
        if (t == "paper-icon-button") return;
        if (t == "iron-icon") return;

        this._openApp();
    }

    _handleEnter(e) {
        console.log("_handleEnter key ", e);
//                console.log("_handleEnter key original", e.composedPath()[0]);
        var originalTarget = e.composedPath()[0];

//                console.log("node ", originalTarget.nodeName);

        if (originalTarget.nodeName == 'PAPER-ICON-BUTTON') return;
        if (e.target.nodeName.toLowerCase() == "existdb-package" && (e.keyCode == 13)) {
//                    console.log('_handleEnter key enter fired');
            this._openApp()
        }
    }

    _openApp(e) {

        var isApp = this.type == 'application';
        console.log("######## is App: ", isApp);

        if (isApp && this.status == "installed") {
            var targetUrl = this.path;
            window.open(targetUrl)
        }
    }

    async _deletePackage(e) {
        console.log('delete package');
        e.preventDefault();
        e.stopPropagation();

        this.progress.hidden = false;
        this.progress.indeterminate = true;

        const removeAction = this.shadowRoot.getElementById('removePackage');
        removeAction.params = {
            "package-url": this.url,
            "action": "remove"
        };
        removeAction.url = new URL(settings.packageActionPath, document.baseURI).href;
        removeAction.generateRequest();
    }


    _showDetails(e) {
        console.log('show details');
        e.preventDefault();
        e.stopPropagation();
    }


    _handleStatus() {
//                console.log("_handleStatus ",this.status);

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
//                e.preventDefault();
        var showsAll = this.wrapper.getAttribute('show-all');

        if (!showsAll) {
            this.wrapper.setAttribute('show-all', 'true');
//                    this.$.wrapper.classList.add('show');
            this.updateStyles({'--app-details': 'table-row'});

        } else {
            this.wrapper.removeAttribute('show-all');
//                    this.$.wrapper.classList.remove('show');
            this.updateStyles({'--app-details': 'none'});
        }

//                this.updateStyles();

    }

    _handleDeleteResponse(e) {
        // this.progress.hidden = true;

        const remove = this.shadowRoot.getElementById('removePackage');
        const resp = JSON.parse(remove.lastResponse);

        if (Reflect.has(resp, 'error')) {
            this.dispatchEvent(new CustomEvent('package-remove-error', {
                bubbles: true,
                composed: true,
                detail: {error: error}
            }));
        } else {

/*
            anime({
                targets:this,
                duration:300,
                opacity:[1,0],
                display:'none'
            });
*/

            this.hidden=true;

            this.dispatchEvent(new CustomEvent('package-removed', {
                bubbles: true,
                composed: true,
                detail: {abbrev: this.abbrev}
            }));
        }

        this.progress.value = 100;
        this.progress.indeterminate = false;
        setTimeout(function () {
            this.progress.hidden = true;
        },500);


    }

    _handleDeleteError(e) {
        console.error('Error while deleting package: ', e.message);
        this.dispatchEvent(new CustomEvent('package-remove-error', {
            bubbles: true,
            composed: true,
            detail: {error: e.message}
        }));

    }

    _onInstalled(e) {
//                console.log('_onInstalled ', e);
        this.progress.indeterminate = false;
        this.progress.value = 100;
//                this.dispatchEvent(new CustomEvent('package-installed', {detail: {packageUrl:e.detail.package}}));

    }

    _onInstallStarted(e) {
//                console.log('_onInstallStarted ', e);
        this.progress.hidden = false;
        this.progress.indeterminate = true;
        this.install.install();
    }

    _onRemove(e) {
//                console.log('_onRemoveStarted ', e);
        this.progress.hidden = false;
        this.progress.indeterminate = true;
        this.remove.removeIt();
    }

    _installOtherVersion(e) {
//                console.log("###################### install other version", e.detail.version);
        this.install.version = e.detail.version;
        this.install.submit(e);
    }


}

customElements.define('existdb-local-package', ExistdbLocalPackage);