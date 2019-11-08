// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/iron-ajax/iron-ajax.js';
import '../assets/@polymer/iron-icons/iron-icons.js';
import '../assets/@polymer/iron-icon/iron-icon.js';
import '../assets/@polymer/iron-form/iron-form.js';
import '../assets/@polymer/paper-icon-button/paper-icon-button.js';

import {settings} from './settings.js';

// Extend the LitElement base class
// @deprecated
class ExistdbRemovePackage extends LitElement {

    static get styles(){
        return css`
            :host{
                display: inline-block;
                
            }
            :host ::slotted(*){
                width:100%;
                height:100%;
            }            

            paper-icon-button.install: {
                display:table-cell;
                vertical-align:middle;
                width:100%;
                height:100%;
                
                --paper-icon-button:{
                    width:100%;
                    height:100%;
                };
            }
            
            
        
        `;
    }

    render(){
        return html`
        <iron-ajax id="installPackage"
                   verbose with-credentials
                   method="post" handle-as="text"
                   @response="${this._handleResponse}"
                   @error="${this._handleError}"></iron-ajax>


        <paper-icon-button id="button" tabindex="0" style="color:var(--paper-grey-700);width:48px;height:48px;" class="install" icon="delete-forever" title="download and install latest version" @click="${this.submit}"></paper-icon-button>
        `;
    }

    static get properties(){
        return {
            url: {
                type: String,
                reflect:true
            },
            abbrev: {
                type: String,
                reflect:true
            },
            action: {
                type: String,
                reflect:true
            },
            version:{
                type: String,
                reflect:true
            },
            type: {
                type: String,
                reflect:true
            }
        };
    }

    constructor(){
        super();

        this.url = new URL(settings.packageActionPath, document.baseURI).href;

    }

    firstUpdated(changedProperties) {
        this.tabIndex = 0;

        this.addEventListener('iron-form-response', e => this.handleResponse);
        this.addEventListener('iron-form-error', e => this.handleError);
        this.addEventListener('focus', function(e){
            console.log('move focus to icon button');
            const btn = this.shadowRoot.getElementById('button');
            btn.focus();
        });
    }

    submit (e) {
       console.log("install action submit ",e);
        e.stopPropagation();
        e.preventDefault();
        this.dispatchEvent(new CustomEvent('package-install-started', {bubbles: true, composed: true, detail: {}}));
    }

    async install(){
        /*
                        console.log('install action install');
                        console.log('install action install url ', this.url);
                        console.log('install action install version ', this.version);
        */
        const installPackage = this.shadowRoot.getElementById('installPackage');
        installPackage.params = {
            "package-url":this.url,
            "action":"install",
            "abbrev":this.abbrev,
            "version":this.version,
        };
        installPackage.generateRequest();
    }

    _handleResponse (data) {
//                console.log("response: ", data);
//                console.log("install response: ", JSON.parse(this.$.installPackage.lastResponse).err);

        var error = JSON.parse(this.$.installPackage.lastResponse).error;
//                console.log("_handleResponse ", error);

        if(error != undefined){
            this.dispatchEvent(new CustomEvent('package-remove-error', {bubbles: true, composed: true, detail: {error:error}}));
        }else{
            this.dispatchEvent(new CustomEvent('package-removed', {bubbles: true, composed: true, detail: {abbrev:this.abbrev}}));
        }
    }

    _handleError (e) {
//                console.log("error: ", e)
        //todo: this seems to be never triggered since we get 200 even in case of errors
        this.dispatchEvent(new CustomEvent('package-remove-error', {bubbles: true, composed: true, detail: {error:e.detail}}));

    }

    _moveFocus(e){
        console.log('moveFocus');
    }



}
customElements.define('existdb-remove-package', ExistdbRemovePackage);