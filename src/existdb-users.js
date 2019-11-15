// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import {ExistdbDashboardBase} from './existdb-dashboard-base.js'
import '../assets/@polymer/paper-input/paper-input.js';
import '../assets/@polymer/iron-icons/iron-icons.js';
import '../assets/@polymer/iron-icons/iron-icons.js';
import '../assets/@polymer/paper-input/paper-input.js';
import '../assets/@polymer/paper-button/paper-button.js';
import '../assets/@cwmr/paper-password-input/paper-password-input.js';
import '../assets/@cwmr/paper-password-input/match-passwords-validator.js';
import '../assets/@polymer/paper-dialog/paper-dialog.js';
import '../assets/@polymer/iron-form/iron-form.js';


import './existdb-ajax.js';
import {settings} from './settings.js';


// Extend the LitElement base class
class ExistdbUsers extends ExistdbDashboardBase {

    static get styles(){
        return css`
            :host{
                display:flex;
                flex-direction:column;
                height:100vh;
                margin:4px;
                background: var(--existdb-content-bg);
            }
            
            .wrapper{
                flex:1 1 auto;
                display:grid;
                grid-template-columns:128px auto;
                padding:30px;
               box-shadow: rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px, rgba(0, 0, 0, 0.2) 0px 3px 1px -2px;
               margin:4px;
               background:white;
            }
            .wrapper.opened {
                box-shadow: 0 16px 24px 2px rgba(0, 0, 0, 0.14),
                    0  6px 30px 5px rgba(0, 0, 0, 0.12),
                    0  8px 10px -5px rgba(0, 0, 0, 0.4);
                margin:20px 0;
            }  
            div.pic{
                font-size:32px;
                border-radius:32px;
                background:var(--paper-grey-300);
                width:64px;
                height:64px;
                display:table-cell;
                text-align:center;
                line-height:60px;
            }
            
            .user{
                font-size:22px;
                font-weight:500;
            }
                
            .fullname, .description{
                font-size:12px;
            }
            
            .details{
                // display:flex;
                // flex-direction:column;
            }
            .detail-wrapper{
                display:flex;
                flex-direction:column;
            }
            
            
            paper-button.deleteUser{
                background:var(--paper-red-500);
                color:white;
            }
            
            paper-dialog{
                background:var(--paper-red-500);
                color:white;
                --iron-icon-width:64px;
                --iron-icon-height:64px;
                font-size:18px;
                font-weight:500;
                text-align:center;
            }
        `;
    }

    static get properties() {
        return {
            url: {
                type:String,
                reflect:true
            },
            users:{
                type:Array
            },
            count:{
                type:Number
            },
            currentUser:{
                type:String
            },
            password:{
                type: String,
                reflect:true
            },
            password2:{
                type:String
            }
        };
    }

    constructor() {
        super();
        this.viewName = 'Users';
        this.userUrl = new URL(settings.userPath, document.baseURI).href;
        this.users = [];
        this.count = 0;
        this.currentUser = '';
        this.password='';
        this.password2='';
    }

    render(){
        return html`

            <iron-ajax id="saveUser"
                   with-credentials
                   method="put"
                   handle-as="json"
                   @response="_handleUserSaved"
                   content-type="application/json"
                   @error="_handleSaveUserError"></iron-ajax>

            <existdb-ajax id="loader"
                          url="${settings.userPath}"  
                          @response="${this._handleResponse}">
                          
            </existdb-ajax>  
            <paper-dialog id="warningmessage">
                <iron-icon icon="warning"></iron-icon>
                <p>Connection is not secure!</p>
                <p>You shouldn't change passwords as these are transferred in clear-text.</p>
            </paper-dialog>
           
            ${this.users.map((item) =>
            html`
                <div class="wrapper" style="position: relative;" @click="${(e) => this._editUser(e,item.user, this)}" tabindex="0">
                    <div class="pic">${item.user.charAt(0)}</div>
                    <div class="entry">
                        <div class="user">${item.user}</div>
                        <div class="fullname">${item.fullName}</div>
                        <div class="description">${item.description}</div>

                        <div class="details" hidden>
                            <div class="detail-wrapper">
                                <iron-form id="userForm" allow-redirect="false">
                                    <form action="" method="">
                                        <paper-input id="user" label="User Name" value="${item.user}" autofocus></paper-input>
                                        <paper-input label="Full Name" value="${this._getValue(item.fullName)}"></paper-input>
                                        <paper-input label="Description" value="${this._getValue(item.description)}"></paper-input>
                                        
                                        <match-passwords-validator id="match-passwords-validator"
                                                                   password="${this.password}"></match-passwords-validator>
                                                       
                                        <paper-password-input id="password" label="Password" 
                                                                   value="${this.password}"
                                                                   @input="${this._handlePass}"></paper-password-input>
                                                              
                                        <paper-password-input id="confirm" label="Confirm" 
                                                              value="${this.password2}" 
                                                              @input="${this._handlePass2}"
                                                              validator="match-passwords-validator"
                                                              auto-validate
                                                              error-message="Passwords need to match"
                                                              ></paper-password-input>
            
                                        <paper-input label="umask" value="{{selectedUser.umask}}" type="number" max="777"></paper-input>
            
                                        <div class="actions" style="align-self: flex-end;">
                                            <paper-button style="align-self: flex-end;" raised @click="${this._save}">Save</paper-button>
                                            <paper-button class="deleteUser" style="align-self: flex-end;" raised>Delete User</paper-button>
                                        </div>
                                    </form>
                                </iron-form>
                            </div>
                        </div>
                    </div>               
            `)}
        `;
    }

    firstUpdated(changedProperties) {
        // super.firstUpdated(changedProperties);
        if(document.location.hostname !== 'localhost' && document.location.protocol !== 'https'){
            this.shadowRoot.getElementById('warningmessage').open();
        }

        this.loader = this.shadowRoot.getElementById('loader');
        this.loader.generateRequest();
    }

    _save(e){
        e.preventDefault();
        e.stopPropagation();
        var valid = this.shadowRoot.getElementById('userForm').validate();

        if (valid) {
            console.log("saving... ", this.currentUser);

            //merge in new password if any
            if(this.validPass){
                const userObj = this._getUser(this.currentUser);
                userObj['password'] = this.password;
                console.log('user obj ', userObj);
            }


/*
            this.$.saveUser.body = JSON.stringify(this.selectedUser);
            console.log('body ', this.$.saveUser.body);

            this.$.saveUser.url = this.importPath + this.userUrl + this.selectedUser.user;
            this.$.saveUser.generateRequest();
*/
        }

    }
    _handleUserSaved(e){
        //todo
    }
    _handleSaveUserError(e){
        //todo
    }

    _handlePass(e){
        this.password = e.target.value;
    }
    _handlePass2(e){
        this.password2 = e.target.value;
        this.validPass = !e.target.invalid;
        console.log('is it fucking valid? ', this.valid);
    }

    _getValue(val){
        if(val == null){
            return '';
        }else{
            return val;
        }
    }

/*
    _validate(){
        // console.log('_validate called');
        return this.password === this.password2;
    }
*/

    _getUser(user){
        return this.users.find( user => user === user);
    }

    _editUser(e, user){
        this.currentUser = user;
        const userobj = this.users.find(x => x.user == this.currentUser);

        this.focus();

        console.log('current ', this.currentUser);
        console.log('userobj ', userobj);
        this._switchDetails(e);
    }

    _handleResponse(){
        //todo: apply error-handling
        this.users = this.loader.lastResponse;
        this.count = this.users.length;

        this.updateComplete.then(() => {
            this._animateList();
        });

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

    _animateList(){
        const wrappers =  this.shadowRoot.querySelectorAll('.wrapper');

        anime({
            targets: wrappers,
            opacity: [0,1],
            translateY:[-100,0],
            scaleY:[0.5,1],
            delay: anime.stagger(30),
            duration:300,
            easing: 'easeInOutCirc'
        });

    }

    _switchDetails(e){
        const wrapper = e.composedPath()[0].closest('.wrapper');
        if (wrapper) {
            const details = wrapper.querySelector('.details');
            if (details.hidden) {
                details.hidden = false;

                const t1 = anime.timeline({
                    easing: 'easeInOutCirc',
                    duration: 300
                });

                t1.add({
                    targets: wrapper,
                    duration: 300,
                    margin: [4, 20]
                });

                t1.add({
                    targets: details,
                    duration: 200,
                    opactiy: [0, 1]
                });

                wrapper.classList.add('opened')

            } else {
                anime({
                    targets: wrapper,
                    duration: 300,
                    margin: [20, 4],
                    easing: 'easeInOutCirc',

                }, '-=200');
                details.hidden = true;
                wrapper.classList.remove('opened');
            }
        }
    }



}
customElements.define('existdb-users', ExistdbUsers);