// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';

// Extend the LitElement base class
class MyElement extends LitElement {

    static get styles(){
        return css`
            :host {
                display: block;

                --paper-icon-button: {
                    color: var(--paper-blue-700);
                }
            }
        `;
    }



    render(){
        return html`
        
        `;
    }


}
customElements.define('my-element', MyElement);