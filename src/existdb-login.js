// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/iron-ajax/iron-ajax.js';
import '../assets/@polymer/iron-icons/iron-icons.js';
import '../assets/@polymer/iron-icon/iron-icon.js';
import '../assets/@polymer/paper-styles/color.js';
import '../assets/@polymer/paper-dialog/paper-dialog.js';
import '../assets/@polymer/paper-button/paper-button.js';
import '../assets/@polymer/paper-input/paper-input.js';

// Extend the LitElement base class
//todo: how to handle invalid logins? Currently i get back an 200 even if the user does not exists
class ExistdbLogin extends LitElement {
    static get styles(){
        return css`
            :host {
                display: block;
            }

            paper-dialog {
                min-width: 320px;
                max-width: 640px;
                min-height: 128px;
            }

            paper-dialog h2 {
                background-color: var(--existdb-header-bg-color);
                padding: 16px 24px;
                margin-top: 0;
                color: var(--existdb-header-color);

            }

            a, a:link {
                text-decoration: none;
                color:var(--existdb-header-color);

            }

            @media (max-width: 1024px) {
                .label {
                    display: none;
                }
            }

            #message {
                color: var(--paper-red-800);
                min-height:20px;
            }        
        `;
    }

    static get properties() {
        return {
            /** True if user is currently logged in */
            loggedIn: {
                type: Boolean
            },
            /**
             * The currently logged in user.
             */
            user: {
                type: 'value'
            },
            /**
             * If set, only users being members of the specified group are
             * allowed to log in.
             */
            group: {
                type: String
            },
            /**
             * Array of groups the current user is a member of.
             */
            groups: {
                type: Array
            },
            /**
             * If set to true, automatically show login dialog if user is not logged in
             */
            auto: {
                type: Boolean
            },
            /**
             * Label to show if not logged in
             */
            loginLabel: {
                type: String
            },
            /**
             * Label to show before user name if logged in
             */
            logoutLabel: {
                type: String
            },
            loginIcon: {
                type: String
            },
            logoutIcon: {
                type: String
            },
            password: {
                type: String
            },
            loginUrl: {
                type: String
            },
            logoutUrl: {
                type: String
            },
            _invalid: {
                type: Boolean
            },
            _hasFocus: {
                type: Boolean
            }
        };
    }

    constructor(){
        super();

        // setting default values
        this.loggedIn = false;
        this.auto = false;
        this.groups = [];
        this.loginIcon = 'account-circle';
        this.logoutIcon = 'supervisor-account';
        this._hasFocus = true;
        this.user="";
        this.password = "";
    }

    get loginLink(){
        if(this.loggedIn){
            return html`
                    <a href="#" @click="${this._show}" title="${this.user}">
                        <iron-icon icon="${this.logoutIcon}"></iron-icon>
                        <span class="label">${this.logoutLabel} ${this.user}</span>
                    </a>
                `;
        }else{
            return html`
                    <a href="#" @click="${this._show}" title="${this.loginLabel}">
                        <iron-icon icon="${this.loginIcon}"></iron-icon>
                        <span class="label">${this.loginLabel}</span>
                    </a>
                `;
        }
    }
    /**
     * Implement `render` to define a template for your element.
     *
     * You must provide an implementation of `render` for any element
     * that uses LitElement as a base class.
     */
    render(){
        /**
         *
         */
        return html`
            ${this.loginLink}
            <paper-dialog id="loginDialog">
                <h2>${this.loginLabel}</h2>
                    <form action="login">
                        <paper-input name="user"
                                     label="User"
                                     .value="${this.user}"
                                     @input="${this._handleUser}"
                                     autofocus></paper-input>
                        <paper-input name="password" label="Password" type="password" .value="${this.password}"></paper-input>
                        <input id="logout" type="hidden" name="logout"></input>
                    </form>
                    <p id="message">
                        ${this._invalid?html`Wrong username or password`: html``}
                    </p>
                    <template is="dom-if" if="${this._invalid}">
                        <p id="message">Wrong password or invalid user
                            <template is="dom-if" if="${this.group}">(must be member of group ${this.group})</template>
                        </p>
                    </template>
                <div class="buttons">
                    <paper-button autofocus @click="${this._confirmLogin}">Login</paper-button>
                </div>
            </paper-dialog>
    
            <iron-ajax id="checkLogin" 
                       url="/exist/apps/dashboard3/login"
                       handle-as="json"
                       @response="${this._handleResponse}"
                       content-type="application/x-www-form-urlencoded"
                       method="POST"></iron-ajax>

        `;

    }

    /**
     * todo: shouldn't the eventlisteners be removed on disconnectedCallback?
     */
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('blur', () => {
            this._hasFocus = false;
        });
        window.addEventListener('focus', () => {
            if (!this._hasFocus) {
                this._hasFocus = true;
                const checkLogin = this.shadowRoot.getElementById('checkLogin');
                // checkLogin.url = document.baseURI + 'login';
                checkLogin.body = null;
                checkLogin.generateRequest();
            }
        });
    }

    firstUpdated(changedProperties) {
        const login = this.shadowRoot.getElementById('checkLogin');
        login.body = null;
        login.generateRequest();
    }

    _handleUser(e){
        this.user = e.target.value;
    }
    _handlePass(e){
        this.password = e.target.value;
    }

    _show(ev) {
        ev.preventDefault();
        if (this.loggedIn) {
            this.shadowRoot.getElementById('checkLogin').body = {
                logout: this.user
            };
            this.shadowRoot.getElementById('checkLogin').generateRequest();
        } else {
            this.shadowRoot.getElementById('loginDialog').open();
        }
    }

    _confirmLogin() {
        const checkLogin = this.shadowRoot.getElementById('checkLogin');
        checkLogin.body = {
            user: this.user,
            password: this.password
        };
        checkLogin.generateRequest();
    }


    _handleResponse() {
        const wasLoggedIn = this.loggedIn;
        const resp = this.shadowRoot.getElementById('checkLogin').lastResponse;
        if (resp.user && this._checkGroup(resp)) {
            this.loggedIn = true;
            this.user = resp.user;
            this.groups = resp.groups;
            this._invalid = false;
            if (!wasLoggedIn && this.shadowRoot.getElementById('loginDialog').opened && this.loginUrl) {
                window.location = this.loginUrl;
            }
            this.shadowRoot.getElementById('loginDialog').close();
        } else {
            this.loggedIn = false;
            this.password = "";
            if (this.shadowRoot.getElementById('loginDialog').opened) {
                this._invalid = true;
            } else if (this.auto) {
                this.shadowRoot.getElementById('loginDialog').open();
            } else if (wasLoggedIn && this.logoutUrl) {
                console.log('redirecting to %s', this.logoutUrl);
                window.location = this.logoutUrl;
            }
        }
    }

    _checkGroup(info) {
        if (this.group) {
            return info.groups && info.groups.indexOf(this.group) > -1;
        }
        return true;
    }


}
// Register the new element with the browser.
customElements.define('existdb-login', ExistdbLogin);