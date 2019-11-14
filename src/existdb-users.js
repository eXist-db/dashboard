// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import {ExistdbDashboardBase} from './existdb-dashboard-base.js'
import '../assets/@polymer/iron-ajax/iron-ajax.js';
import '../assets/@vaadin/vaadin-grid/vaadin-grid.js';
import '../assets/@vaadin/vaadin-grid/vaadin-grid-column.js';
import {settings} from './settings.js';


// Extend the LitElement base class
class ExistdbUsers extends ExistdbDashboardBase {

    static get styles(){
        return css`
            :host{
                background:orange;
            }
            
            #pages, #main, #detail{
                width:100%;
                height:100%;
            }
            
            #main{
                background:blue;
            }
            #detail{
                background:red;
            }
            vaadin-grid{
                height:100%;
            }
        `;
    }

    static get properties() {
        return {
            userUrl: {
                type:String,
                reflect:true
            },
            groupUrl:{
                type:String,
                reflect: true
            },
            users:{
                type:Array
            },
            count:{
                type:Number
            }
        };
    }

    constructor() {
        super();
        this.viewName = 'Users';
        this.userUrl = new URL(settings.userPath, document.baseURI).href;
        this.groupUrl = new URL(settings.groupPath, document.baseURI).href;
        this.users = [];
        this.count = 0;
    }

    render(){
        return html`
            <iron-ajax id="loadUserList"
               with-credentials
               method="get"
               handle-as="json"
               @response="${this._handleUsers}"
               @error="${this._handleUserListError}"></iron-ajax>
               
               
            <div id="pages">
                <div id="main">
                    <vaadin-grid id="userlist">
                        <vaadin-grid-column path="user"></vaadin-grid-column>
                        <vaadin-grid-column path="fullName"></vaadin-grid-column>
                        <vaadin-grid-column path="description"></vaadin-grid-column>
                        <vaadin-grid-column path="disabled"></vaadin-grid-column>
                    </vaadin-grid>
                    <button @click="${this._changePage}">change page</button>
                </div>
                <div id="detail">
                    <button @click="${this._changePage}">change page</button>
                </div>
            </div>
        `;
    }

    _changePage(){
        const main = this.shadowRoot.getElementById('main');
        const hidden = main.hidden;
        main.hidden = !main.hidden;

    }

    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);
        this.userloader = this.shadowRoot.getElementById('loadUserList');

        this.userloader.url = this.userUrl;
        this.userloader.generateRequest();
    }


    _handleUsers(){
        //todo: apply error-handling
        this.users = this.userloader.lastResponse;
        console.log('users ', this.users);
        this.count = this.users.length;
        this.shadowRoot.getElementById('userlist').items = this.users;
        this.dispatchEvent(new CustomEvent('users-loaded',
            {
                bubbles: true,
                composed: true,
                detail:
                    {
                        scope:"users",
                        count:this.count
                    }
            }));

    }

    _handleUserListError(){

    }


}
customElements.define('existdb-users', ExistdbUsers);