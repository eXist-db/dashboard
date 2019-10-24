// Import the LitElement base class and html helper function
import { LitElement } from '../assets/lit-element/lit-element.js';

/**
 * Extend the LitElement base class to render into lightDOM
 */
export class ExistdbBase extends LitElement {

    /**
     * Base class that uses lightDOM instead of shadowDOM to attach template nodes to
     * @returns {ExistdbBase}
     */
    createRenderRoot() {
        return this;
    }


}
customElements.define('existdb-base', ExistdbBase);