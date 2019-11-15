// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import {ExistdbDashboardBase} from './existdb-dashboard-base.js'
import '../assets/@polymer/iron-ajax/iron-ajax.js';
import '../assets/@polymer/paper-input/paper-input.js';
import '../assets/@vaadin/vaadin-grid/vaadin-grid.js';
import '../assets/@vaadin/vaadin-grid/vaadin-grid-column.js';

import '../assets/@polymer/iron-icons/iron-icons.js';
import '../assets/@polymer/iron-icons/iron-icons.js';
import '../assets/@polymer/iron-icons/editor-icons.js';

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
            }
            #details{
                background:red;
            }
            vaadin-grid{
                height:100%;
                background-color:inherit;
            }
            
            vaadin-grid-column{
                background:inherit;
            }
            
            .details{
                // background:blue;
                padding:50px;
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
               
               
                <div id="main">
                    <vaadin-grid id="grid" autoselect>
                    
                        <template class="row-details">
                            <div class="details">
                                <paper-input label="User Name"></paper-input>
                                <paper-input label="Full Name"></paper-input>
                                <paper-input label="Description"></paper-input>
                            </div>
                        </template>
                        
                        <vaadin-grid-column path="user"></vaadin-grid-column>
                        <vaadin-grid-column path="fullName"></vaadin-grid-column>
                        <vaadin-grid-column path="description"></vaadin-grid-column>
                        <vaadin-grid-column path="disabled"></vaadin-grid-column>
                        
<!--
                        <vaadin-grid-column style="width:50px;">
                            <template class="header"></template>
                            <template>
                              <paper-icon-button icon="editor:mode-edit"></paper-icon-button>
                            </template>
                        </vaadin-grid-column>
-->
                    </vaadin-grid>
                    <button @click="${this._changePage}">change page</button>
                </div>
        `;
    }
    _editRow(e){
        console.log('edit row ',e);
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

        this.grid = this.shadowRoot.getElementById('grid');
        this.grid.addEventListener('click',function (e) {
           const item = this.grid.getEventContext(e).item;
           console.log('grid item clicked ', item);
           console.log('grid item clicked ', e);

           const target = e.composedPath()[0];
           // if(target.nodeName.toLowerCase() == 'iron-icon'){
               if(this.grid.getEventContext(e).detailsOpened){
                   this.grid.closeItemDetails(item);

               }else{
                   this.grid.openItemDetails(item);
               }
           // }
        }.bind(this));

        this.grid.addEventListener('active-item-changed', function(event) {
            const item = event.detail.value;
            this.grid.closeItemDetails(this.grid.activeItem);
            this.grid.selectedItems = item ? [item] : [];
        }.bind(this));

        this.grid.cellClassNameGenerator = function(column, rowData) {
            let classes = rowData.item.gender;
            classes += ' foo';
            return classes;
        };

    }


    _handleUsers(){
        //todo: apply error-handling
        this.users = this.userloader.lastResponse;
        console.log('users ', this.users);
        this.count = this.users.length;
        this.shadowRoot.getElementById('grid').items = this.users;
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