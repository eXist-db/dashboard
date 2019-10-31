// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';

// todo
class PackagemanagerApp extends LitElement {

    static get styles(){
        return css`
            :host {
                display: block;
                padding: 30px;
                position: relative;
                background: white;
                margin-bottom:2px;

                --paper-icon-button: {
                    color: var(--paper-blue-700);
                };
                box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),0 3px 1px -2px rgba(0, 0, 0, 0.2);
                cursor: pointer;

            }
            :host:focus{
                box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
                0 3px 14px 2px rgba(0, 0, 0, 0.12),
                0 5px 5px -3px rgba(0, 0, 0, 0.4);
            }
            #progress{
                position: absolute;
                top:0;
                left:0;
                width:100%;
                display: block;
            }

            :host ::slotted(*){
                @apply(--paper-font-common-base);
            }

            paper-icon-button {
                min-height: 36px;
                min-width: 36px;
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
                position: absolute;
                right:0;
                top:0;
                padding:10px;
            }
            /* styles for metadata elements */
            .wrapper ::slotted(repo-icon){
                width:64px;
                display: inline-block;
                position: absolute;
                top:30px;
                left:30px;
            }

            .wrapper{
                display: flex;
                flex-direction: column ;
                padding-left:100px;
            }

            /* hiding meta information for a package by default */
            .wrapper ::slotted(repo-name),
            .wrapper ::slotted(repo-description),
            .wrapper ::slotted(repo-authors),
            .wrapper ::slotted(repo-abbrev),
            .wrapper ::slotted(repo-license),
            .wrapper ::slotted(repo-website),
            .wrapper ::slotted(repo-url),
            .wrapper ::slotted(repo-requires),
            .wrapper ::slotted(repo-changelog),
            .wrapper ::slotted(repo-other),
            .wrapper ::slotted(repo-note)
            {
                display:none;
            }

            /* 'application' or 'library' label */
            .wrapper ::slotted(repo-type){
                display:block;
                color:var(--paper-blue--700);
                font-size:14px;
                text-transform:uppercase;
            }
            :host[type='library'] .wrapper ::slotted(repo-type){
                color:var(--paper-green-700);
            }

            .wrapper ::slotted(repo-title){
                font-size:22px;
                font-weight:500;
                margin:10px 0;
                display: inline-block;
                @apply(--paper-font-common-base);
            }


            .wrapper[show-all] ::slotted(repo-name),
            .wrapper[show-all] ::slotted(repo-description),
            .wrapper[show-all] ::slotted(repo-authors),
            .wrapper[show-all] ::slotted(repo-abbrev),
            .wrapper[show-all] ::slotted(repo-license),
            .wrapper[show-all] ::slotted(repo-website),
            .wrapper[show-all] ::slotted(repo-url),
            .wrapper[show-all] ::slotted(repo-requires),
            .wrapper[show-all] ::slotted(repo-changelog),
            .wrapper[show-all] ::slotted(repo-change),
            .wrapper[show-all] ::slotted(repo-other),
            .wrapper[show-all] ::slotted(repo-note)
            {

                display:var(--app-details);
                margin-bottom: 6px;
            }

            [hidden]{
                display: none;
            }

            @media only screen and (min-width: 768px) {
                :host{
                    min-width:300px;
                }
            }
        `;
    }

    render(){
        return html`
        <paper-progress id="progress" class="slow"></paper-progress>

        <paper-ripple></paper-ripple>
        <div id="wrapper" class="wrapper" url="${this.url}">
            <slot id="slot"></slot>
            <div class="actions">
                <existdb-package-install-action
                        id="install"
                        url="${this.url}"
                        abbrev="${this.abbrev}"
                        type="${this.type}"
                        version="${this.version}"
                        hidden></existdb-package-install-action>

                <existdb-package-remove-action id="remove" url="${this.url}" abbrev="${this.abbrev}" package-title="${this.packageTitle}" no-remove="${this.readonly}"></existdb-package-remove-action>
                <paper-icon-button id="info" icon="info" @click="${this._showInfo}"></paper-icon-button>
            </div>
        </div>
        
        `;
    }

    static get properties() {
        return {
            type: {
                type: String,
                reflect: true
            },
            abbrev: {
                type: String,
                reflect: true
            },
            version: {
                type: String,
                reflect: true
            },
            action: {
                type: String,
                reflect: true
            },
            status: {
                type: String,
                reflect: true,
                notify: true,
                observer: '_handleStatus'
            },
            installed: {
                type: String
            },
            available: {
                type: String
            },
            url: {
                type: String,
                reflect: true
            },
            packageTitle: {
                type: String,
                reflect: true,
                notify: true
            },
            /*
                                showAll: {
                                    type: Boolean,
                                    reflect: true
                                },
            */
            path: {
                type: String,
                reflect: true
            },
            readonly:{
                type: String,
                reflect:true
            }
        };
    }

    constructor() {
//                console.log('constructor Packagemanager-app')
        super();


    }



    connectedCallback() {
        super.connectedCallback();
    }

    firstUpdated(changedProperties) {

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

    }

    _handleTap (e) {
        e.stopPropagation();

        var t = e.target.nodeName.toLowerCase();
//                console.log('_handleTap ',e);
//                console.log('_handleTap ',e.b[0].id);
//                console.log('_handleTap ',e.path);

        // ugly special case handling for Chrome and FF but don't know how to solve better yet.
        if(e.path != undefined){
            console.log('########',e.path[0].nodeName);
            if(e.path[0].nodeName == 'EXISTDB-PACKAGE-REMOVE-ACTION') return;
        }
        if(e.b != undefined && e.b[0].id == 'remove') return;

        if(t == 'existdb-package-remove') return;
        if(t == "paper-icon-button") return;
        if(t == "iron-icon") return;

        this._openApp();
    }

    _handleEnter(e) {
//                console.log("_handleEnter key ", e);
//                console.log("_handleEnter key original", e.composedPath()[0]);
        var originalTarget = e.composedPath()[0];

//                console.log("node ", originalTarget.nodeName);

        if(originalTarget.nodeName == 'PAPER-ICON-BUTTON') return;
        if (e.target.nodeName.toLowerCase() == "packagemanager-app" && e.keyCode == 13) {
//                    console.log('_handleEnter key enter fired');
            this._openApp()
        }
    }

    _openApp () {
        var isApp = this.type == 'application';
//                console.log("######## is App: ", isApp);

        if(isApp && this.status == "installed"){
            var targetUrl = this.path;
            window.open(targetUrl)
        }
    }

    _handleStatus () {
//                console.log("_handleStatus ",this.status);

        if(this.status == 'installed'){
            this.install.hidden = true;
            this.remove.hidden = false;
        }else{
            this.remove.hidden = true;
            this.install.hidden = false;
        }
    }

    _showInfo(e){
//                console.log('_showInfo ', e);
        e.stopPropagation();
//                e.preventDefault();
        var showsAll = this.wrapper.getAttribute('show-all');

        if(!showsAll){
            this.wrapper.setAttribute('show-all','true');
//                    this.$.wrapper.classList.add('show');
            this.updateStyles({'--app-details': 'table-row'});

        }else{
            this.wrapper.removeAttribute('show-all');
//                    this.$.wrapper.classList.remove('show');
            this.updateStyles({'--app-details': 'none'});
        }

//                this.updateStyles();

    }

    _onInstalled (e) {
//                console.log('_onInstalled ', e);
        this.progress.indeterminate=false;
        this.progress.value=100;
//                this.dispatchEvent(new CustomEvent('package-installed', {detail: {packageUrl:e.detail.package}}));

    }

    _onInstallStarted (e) {
//                console.log('_onInstallStarted ', e);
        this.progress.hidden=false;
        this.progress.indeterminate=true;
        this.install.install();
    }

    _onRemove (e){
//                console.log('_onRemoveStarted ', e);
        this.progress.hidden=false;
        this.progress.indeterminate=true;
        this.remove.removeIt();
    }

    _installOtherVersion (e) {
//                console.log("###################### install other version", e.detail.version);
        this.install.version = e.detail.version;
        this.install.submit(e);
    }




}
customElements.define('packagemanager-app', PackagemanagerApp);