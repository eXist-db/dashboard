// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import {ExistdbDashboardBase} from './existdb-dashboard-base.js'
import '../assets/@polymer/iron-ajax/iron-ajax.js';
import '../assets/@vaadin/vaadin-grid/vaadin-grid.js';
import '../assets/@vaadin/vaadin-grid/vaadin-grid-column.js';
import {settings} from './settings.js';


// Extend the LitElement base class
class ExistdbGroups extends ExistdbDashboardBase {

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
            groups:{
                type:Array
            },
            count:{
                type:Number
            }
        };
    }

    constructor() {
        super();
        this.viewName = 'Groups';
        this.userUrl = new URL(settings.userPath, document.baseURI).href;
        this.groupUrl = new URL(settings.groupPath, document.baseURI).href;
        this.users = [];
        this.count = 0;
    }

    render(){
        return html`
            <iron-ajax id="loadGroupList"
               with-credentials
               method="get"
               handle-as="json"
               @response="${this._handleGroups}"
               @error="${this._handleGroupListError}"></iron-ajax>
               
               
            <div id="pages">
                <div id="main">
                    <vaadin-grid id="grouplist">
                        <vaadin-grid-column path="group"></vaadin-grid-column>
                        <vaadin-grid-column path="description"></vaadin-grid-column>
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
        this.grouploader = this.shadowRoot.getElementById('loadGroupList');

        this.grouploader.url = this.groupUrl;
        this.grouploader.generateRequest();
    }


    _handleGroups(){
        //todo: apply error-handling
        this.users = this.grouploader.lastResponse;
        console.log('users ', this.users);
        this.count = this.users.length;
        this.shadowRoot.getElementById('grouplist').items = this.users;
        this.dispatchEvent(new CustomEvent('groups-loaded',
            {
                bubbles: true,
                composed: true,
                detail:
                    {
                        scope:"groups",
                        count:this.count
                    }
            }));

    }

    _handleGroupListError(){

    }


}
customElements.define('existdb-groups', ExistdbGroups);