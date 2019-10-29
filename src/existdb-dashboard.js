// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/iron-icons/iron-icons.js';
import '../assets/@polymer/iron-icons/iron-icons.js';
import '../assets/@polymer/iron-iconset-svg/iron-iconset-svg.js';
import '../assets/@polymer/iron-icon/iron-icon.js';
import '../assets/@polymer/iron-icons/social-icons.js';
import '../assets/@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '../assets/@polymer/app-layout/app-drawer/app-drawer.js';
import '../assets/@polymer/app-layout/app-header-layout/app-header-layout.js';
import '../assets/@polymer/app-layout/app-header/app-header.js';
import '../assets/@polymer/app-layout/app-toolbar/app-toolbar.js';
import '../assets/@polymer/paper-styles/color.js';
import '../assets/@polymer/paper-styles/typography.js';
import '../assets/@polymer/paper-item/paper-item.js';
import '../assets/@polymer/paper-ripple/paper-ripple.js';
import {Router} from '../assets/@vaadin/router/dist/vaadin-router.js';
import '../assets/@polymer/paper-icon-button/paper-icon-button.js';

import './existdb-login.js';
import './existdb-launcher.js';
// import './existdb-settings.js';

/*
import { connect } from '../assets/pwa-helpers/connect-mixin.js';
import { store } from './redux/store.js';
import './redux/reducer.js';
*/

// Extend the LitElement base class
class ExistdbDashboard extends LitElement {

    static get styles(){
        return css`
            :host {
                display: block;
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
                font-family: var(--existdb-font-family);

                color: var(--existdb-text-color);
                --app-drawer-scrim-background: rgba(0, 0, 0, 0.3);

                --existdb-login-theme: {
                    text-decoration: none;
                    color: black;
                };
                
                --app-drawer-width:250px;
                
                --app-drawer-content-container:{
                    background:green;
                };

            }

            paper-item {
                --paper-item-focused: {
                    background: white;
                };
                --paper-item-selected: {
                    background: white;
                };
                --paper-item-focused-before: {
                    background: white;
                }
            }

            app-toolbar {
                background: var(--existdb-header-bg-color);
                width: 100%;
                margin: 0;
            }

            app-drawer {
                z-index: 100;
                text-align: center;
                color: black;
                background: white;
                
            }
            app-drawer .wrapper{
                width:100%;
                height:100%;
                background:var(--existdb-drawer-bg);
                color:var(--existdb-drawer-color);
            }

            app-drawer a{
                text-decoration:none;
                color:inherit;
            }
            
            .nav{
                height:100%;
                // background:linear-gradient(180deg, rgba(245,245,245,1) 0%, rgba(245,245,245,1) 11%, rgba(255,255,255,1) 33%);
                background:transparent;
            }

            .drawerbar {
                width: 256px;
                height: 128px;
                display: table-cell;
                vertical-align: middle;
            }

            
            paper-icon-button[drawer-toggle]{
                color:var(--existdb-header-color);
            }
            
            app-drawer-layout:not([narrow]) [drawer-toggle] {
                display: none;
            }
            
            app-header{
                background:var(--existdb-header-bg-color);
                height:60px;
            }

            [main-title]{
                color:var(--existdb-header-color);
            }
          
            
            app-drawer-layout ::slotted(#contentContainer){
                background:var(--paper-grey-200);
            }


            #pages{
                height: 100%;
            }

            .righttool {
                margin-right: 20px;
            }

            app-drawer iron-icon {
                /*color: rgb(0, 136, 204);*/
                color: var(--paper-blue-500);
                margin-right: 20px;

            }
            paper-item img{
                /*margin-right: 20px;*/
            }

            .logo {
                width: 134px;
            }

            a {
                color: var(--paper-blue-900);
            }

            .user{
                font-size:16px;
                margin-top:-6px;
            }
            .subitem {
                font-weight: 300;
                font-size: larger;
                letter-spacing: 4.5px;
                margin-top:10px;
            }

            h1 {
                color: blue;
            }

            #versionDialog {
                text-align: center;
            }

/*
            #settings {
                padding: 20px;
            }
*/

            .item-img {
                width: 36px;
                height: 36px;
                margin-right: 8px;
                color:red;
                fill:red;
                stroke:red;
            }
            .currentUser{
                padding:4px 0;
                font-size:12px;
            }
            .currentUser [icon='social:person']{
                margin:0;
            }
            existdb-version{
                font-size: small;
                display: block;
                margin-bottom:6px;
                width: 100%;
            }
            
            :host ::slotted(existdb-login){
                margin-right:30px;
            }
            
            
            iron-icon{
                --iron-icon-fill-color:var(--existdb-icon-color);
            }


        `;
    }


    static get properties() {
        return {
            loggedIn:{
                type:Boolean
            },
            user:{
                type:String
            },
            currentView:{
                type: String
            }
        };
    }

    constructor(){
        super();
        this.loggedIn = false;
    }


    render(){
        const drawer = html` 
            ${this.loggedIn ?
                html`

                <iron-iconset-svg name="inline" size="20">
                    <svg>
                        <defs>
                            <g id="launcher">
                              <path d="m 2.81,14.12 c 1.6359258,-2.123142 2.8900094,-2.84186 5.36,-3.33 3.22,-4.38 9.38,-6.57 11.61,-6.57 0,2.23 -2.19,8.39 -6.57,11.61 -0.104496,2.591397 -1.585449,3.615449 -3.33,5.36 L 9.17,17.66 c -1.41,0 -1.41,0 -2.12,-0.71 C 6.34,16.24 6.34,16.24 6.34,14.83 L 2.81,14.12 M 4.22,15.54 5.46,15.71 3,18.16 v -1.42 l 1.22,-1.2 m 4.07,3 0.17,1.24 L 7.26,21 H 5.84 l 2.45,-2.46" />
                              <g id="layer1" style="display:inline">
                                <ellipse style="fill:#ffffff;fill-opacity:1;stroke-width:0.88836658" id="path4977" cx="14.048673" cy="9.7224817" rx="1.9767697" ry="1.9229802"/>
                              </g>           
                            </g>             
                        </defs>
                    </svg>
                </iron-iconset-svg>
                <app-drawer id="drawer" slot="drawer" @click="${this._navigate}">
                    <div class="wrapper">
                    <div class="drawerbar">
                        <img class="logo" src="resources/images/existdb-web.svg">
                        <existdb-version> </existdb-version>
                        <div class="user">User: ${this.user}</div>
                        
                        
                        <div class="subitem">Dashboard</div>
                    </div>
                    <div class="nav">
                    <a href="./" tabindex="-1">
                        <paper-item id="launcher" on-click="_showLauncher" role="menuitem">
<!--                            <img class="item-img" src="resources/images/launcher.svg"> -->
                            <iron-icon icon="inline:launcher"></iron-icon>

                            
                            <span class="menuitem">Launcher</span>
                            <paper-ripple></paper-ripple>
                        </paper-item>
                    </a>
                    <a href="./packagemanager" tabindex="-1">
                        <paper-item id="packagemanager" on-click="_showPackageManager" role="menuitem">
                            <iron-icon icon="apps"></iron-icon>
                            <span class="menuitem">Package Manager</span>
                            <paper-ripple></paper-ripple>
                        </paper-item>
                    </a>
                    <a href="./usermanager" tabindex="-1">
                        <paper-item id="usermanager" on-click="_showUserManager" role="menuitem">
                            <iron-icon icon="social:people"></iron-icon>
                            <span class="menuitem">User Manager</span>
                            <paper-ripple></paper-ripple>
                        </paper-item>
                    </a>
                    <a href="./backup" tabindex="-1">
                        <paper-item id="backup" on-click="_showBackup" role="menuitem">
                            <iron-icon icon="restore"></iron-icon>
                            <span class="menuitem">Backup</span>
                            <paper-ripple></paper-ripple>
                        </paper-item>
                    </a>
                    <a href="./settings" tabindex="-1">
                        <paper-item id="settings" on-click="_showSettings" role="menuitem">
                            <iron-icon icon="settings"></iron-icon>
                            <span class="menuitem">Settings</span>
                            <paper-ripple></paper-ripple>
                        </paper-item>
                    </a>
                    </div>
                    </div>
                </app-drawer>`
                : ''
            }
        `;


        return html`
           
           <app-drawer-layout id="layout" fullbleed>
                ${drawer}
                <app-header-layout>
                    <app-header id="header" slot="header">
                    <app-toolbar>
                        <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
                        <div main-title>${this.currentView}</div>
                        <slot name="login"></slot>
                    </app-toolbar>
                </app-header>
                    
                    <slot></slot>

                </app-header-layout>
    
            </app-drawer-layout>    
        `;
    }


    connectedCallback() {
        super.connectedCallback();
    }

    firstUpdated(changedProperties) {
        // const drawer = this.shadowRoot.getElementById('drawer');
        // console.log("drawer ", drawer);

        // drawer.close();
        window.addEventListener('load',() => {
           this.initRouter();
        });
        this.addEventListener('logged-in', this._handleLogin);
        this.addEventListener('logged-out', this._handleLogout);
        this.addEventListener('set-title', this._setTitle);



    }

    initRouter(){
        console.log('initRouter');
        // const router = new Router(this.shadowRoot.querySelector('main'));
        const router = new Router(document.querySelector('main'));

/*
        router.setRoutes([
            {
                path:'index.html',
                animate:true,
                children:[
                    {
                        path: '',
                        component: 'existdb-launcher'
                    },
                    {
                        path: 'index.html/:settings',
                        component: 'existdb-settings'
                    }
                ]
            }
        ]);
*/

        const loadSettings = (context, commands) => {
            return import('./existdb-settings.js');
        };
        const loadPackagemanager = (context, commands) => {
            return import('./existdb-packagemanager.js');
        };
        const loadUsermanager = (context, commands) => {
            return import('./existdb-usermanager.js');
        };
        const loadBackup = (context, commands) => {
            return import('./existdb-backup.js');
        };
        router.setRoutes([
            {
                path:'/',
                redirect:'/launcher'
            },
            {
                path: '/launcher',
                component: 'existdb-launcher'
            },
            {
                path: '/packagemanager',
                component: 'existdb-packagemanager',
                action: loadPackagemanager
            },
            {
                path: '/usermanager',
                component: 'existdb-usermanager',
                action: loadUsermanager
            },
            {
                path: '/backup',
                component: 'existdb-backup',
                action: loadBackup
            },
            {
                path: '/settings',
                component: 'existdb-settings',
                action:loadSettings
            }

        ]);
    }



    _handleLogin(e){
        console.log('user logged in ',e.detail);
        this.user = e.detail.user;

        console.log('user view ',e.detail.views[0]);

        this.loggedIn = true;
        // this.render();

        const launcher = this.querySelector('existdb-launcher');
        if(launcher){
            launcher.hideBranding();
        }
    }

    _handleLogout(e){
        console.log('user logged out');
        if(this.loggedIn === true){
            this.loggedIn = false;
            this.shadowRoot.getElementById('layout').resetLayout();
            this.shadowRoot.getElementById('layout').notifyResize();
            this.render();
            // window.location.reload(false);
            //todo: not nice but problem with refreshing DOM when drawer is deleted still persists - need a better way but
            //at least this is safe
            window.location.href='./';
        }
    }

    _setTitle(e){
        console.log('settitle');

        this.currentView = e.detail.view;
    }

    _navigate(e){
        const layout = this.shadowRoot.getElementById('layout');
        const drawer = this.shadowRoot.getElementById('drawer');
        if(layout.narrow){
            drawer.close();
        }
    }


}
customElements.define('existdb-dashboard', ExistdbDashboard);