// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/iron-ajax/iron-ajax.js';


// Extend the LitElement base class
class ExistdbAjax extends LitElement {

    static get styles(){
        return css`
            :host {
                display: block;
            }
        `;
    }
    static get properties() {
        return {
            url:{
                type:String
            },
            method:{
                type: String
            },
            contentType:{
                type: String
            }
        };
    }

    constructor(){
        super();
        this.url='';
        this.method='get';//default
        this.contentType = 'application/json';
    }

    render(){
        return html`
            <iron-ajax id="ajax"
                       method="${this.method}"
                       content-type="${this.contentType}"
                       with-credentials
                       handle-as="json"
                       @response="${this._handleResponse}"
                       @error="_handleError">
            </iron-ajax>
        `;
    }

    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);
        this.ajax = this.shadowRoot.getElementById('ajax');
    }

    async generateRequest(){
        this.updateComplete.then(() => {
            this.ajax.url = new URL(this.url, document.baseURI).href;;
            this.ajax.generateRequest();
        });

    }

    _handleResponse(e){
        const resp = this.ajax.lastResponse;

        if (Reflect.has(resp, 'error')) {
            this._dispatchError(error);
        } else {

            this.lastResponse = this.ajax.lastResponse;
            this.dispatchEvent(new CustomEvent('existdb-response', {
                bubbles: true,
                composed: true,
                detail: {}
            }));
        }


    }

    _handleError(e){
        this._dispatchError(e.message);
    }

    _dispatchError(error){
        console.error(this, ' an error occurred: ', error);
        this.dispatchEvent(new CustomEvent('existdb-response-error', {
            bubbles: true,
            composed: true,
            detail: {error: error}
        }));
    }

}
customElements.define('existdb-ajax', ExistdbAjax);