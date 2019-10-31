// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import {ExistdbDashboardBase} from './existdb-dashboard-base.js'


// Extend the LitElement base class
class ExistdbUsermanager extends ExistdbDashboardBase {

    static get styles(){
        return css``;
    }
    constructor() {
        super();

        this.viewName = 'UserManager';
    }

    render(){
        return html`
        
        `;
    }


}
customElements.define('existdb-usermanager', ExistdbUsermanager);