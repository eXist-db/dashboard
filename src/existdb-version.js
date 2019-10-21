// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/iron-ajax/iron-ajax.js';

// Extend the LitElement base class
class ExistdbVersion extends LitElement {

    static get styles(){
        return css`
            :host {
                display: inline;
            }
        `;
    }

    static get properties() {
        return {
            shortVersion:{
                type: String,
                reflect:true
            },
            fullVersion:{
                type: String,
                reflect:true
            }
        }
    }

    render(){
        return html`
        <iron-ajax id="getVersion"
                   method="get"
                   handle-as="text"
                   @response="${this._handleVersion}"
                   auto></iron-ajax>
        <span title="${this.fullVersion}">${this.shortVersion}</span>
        `;
    }

    firstUpdated(changedProperties) {
        const ajax = this.shadowRoot.getElementById('getVersion');
        ajax.url = document.baseURI + 'modules/getVersion.xql';
        // ajax.generateRequest();
    }


    _handleVersion(){
        console.log('handleVersion called');
        const version =  this.shadowRoot.getElementById('getVersion').lastResponse;
        this.fullVersion = version;
        const tokens = version.split(' ');
        this.shortVersion = tokens[0] + ' ' + tokens[1];
    }


}
customElements.define('existdb-version', ExistdbVersion);