// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import {ExistdbDashboardBase} from './existdb-dashboard-base.js'


// Extend the LitElement base class
class ExistdbUsermanager extends ExistdbDashboardBase {

    static get styles(){
        return css`
            :host{
                background:orange;
            }
        `;
    }
    constructor() {
        super();

        this.viewName = 'UserManager';
    }

    render(){
        return html`
            <div style="height: 4000px;">foo</div>
        `;
    }


}
customElements.define('existdb-usermanager', ExistdbUsermanager);