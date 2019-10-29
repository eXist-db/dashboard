// Import the LitElement base class and html helper function
import { LitElement, html, css } from '../assets/lit-element/lit-element.js';

/**
 * todo:
 */
export class ExistdbDashboardBase extends LitElement {

    static get properties() {
        return {
            viewName:{
                type: String
            }
        };
    }

    constructor(){
        super();
    }

    firstUpdated(changedProperties) {
        // super.firstUpdated(changedProperties);

        this.dispatchEvent(new CustomEvent(
            'set-title',
            {
                composed: true,
                bubbles: true,
                detail: {'view': this.viewName}
            }));

    }


}
customElements.define('existdb-dashboard-base', ExistdbDashboardBase);