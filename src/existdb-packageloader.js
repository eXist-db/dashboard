// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/iron-ajax/iron-ajax.js';
import {settings} from './settings.js';

/**
 * component to load eXist-db xar packages.
 *
 * Supports ignores (configured in settings.js) that are filtered out from the response.
 */
class ExistdbPackageloader extends LitElement {

    static get styles(){
        return css``;
    }

    render(){
        return html`
            <iron-ajax id="loader"
                       method="get"
                       handle-as="json"
                       @response="${this._handleResponse}"
                       @error="${this._handleError}">
            </iron-ajax>
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
             * the scope of packages to load. One of 'apps', 'local' or 'remote'.
             * - 'apps' will request just locally installed apps.
             * - 'local' will request all local packages (including other types)
             * - 'remote' will request all remotely available packages
             */
            scope:{
                type: String,
                reflect:true
            },
            packages:{
                type:Array
            },
            count:{
                type:Number,
                reflect:true
            }
        };
    }

    constructor(){
        super();

        this.scope = 'apps'; // defaults to loading local apps
        this.ignores = settings.ignoredPackages;
        this.packages = [];
    }

    async generateRequest(){
        let url;
        switch (this.scope) {
            case 'local':
                url = settings.localPackagePath;
                break;
            case 'remote':
                url = settings.remotePackagePath;
                break;
            default:
                url = settings.appPackagePath;
        }
        const resolved = new URL(url, document.baseURI).href;

        this.updateComplete.then(() => {
            const loader = this.shadowRoot.getElementById('loader');
            loader.url = resolved;
            loader.generateRequest();
        });

    }

    _handleResponse(e){
        const response = this.shadowRoot.getElementById('loader').lastResponse;
        //filter list
        const filtered = response.filter(pkg => {
            return !this.ignores.includes(pkg.abbrev);
        });

        this.count = filtered.length;
        this.lastResponse = filtered;
        // this.lastResponse = response;
/*
        this.dispatchEvent(new CustomEvent(
            'response',
            {
                composed: true,
                bubbles: true,
                detail: {}
            }));
*/

    }

    _handleError(e){
        console.error(e);
        this.dispatchEvent(new CustomEvent(
            'response-error',
            {
                composed: true,
                bubbles: true,
                detail: {'detail':e.detail}
            }));

    }


}
customElements.define('existdb-packageloader', ExistdbPackageloader);