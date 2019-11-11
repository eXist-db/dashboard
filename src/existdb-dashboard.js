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
                position:relative;
            }

            app-toolbar {
                background: var(--existdb-header-bg-color);
                width: 100%;
                margin: 0;
            }
            
            app-drawer-layout{
                width:100%;
                height:100%;
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

            .brand {
                width: 256px;
                height: 128px;
                display: table-cell;
                vertical-align: middle;
                background:var(--existdb-brand-bg);
                color:var(--existdb-brand-color);
            }

            
            paper-icon-button[drawer-toggle]{
                color:var(--existdb-header-color);
            }
            
            app-drawer-layout:not([narrow]) [drawer-toggle] {
                display: none;
            }
            
            app-header{
                background:var(--existdb-header-bg-color);
            }

            [main-title]{
                color:var(--existdb-header-color);
            }
            
            #title{
                display:inline-block;
            }
          
            
/*
            app-drawer-layout ::slotted(#contentContainer){
                background:var(--paper-grey-200);
            }
*/


/*
            #pages{
                height: 100%;
            }
*/

            .righttool {
                margin-right: 20px;
            }

            .logo {
                width: 134px;
            }

/*
            a {
                color: var(--paper-blue-900);
            }
*/

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

/*
            #versionDialog {
                text-align: center;
            }
*/

/*
            #settings {
                padding: 20px;
            }
*/

/*
            .item-img {
                width: 36px;
                height: 36px;
                margin-right: 8px;
                color:red;
                fill:red;
                stroke:red;
            }
*/
/*
            .currentUser{
                padding:4px 0;
                font-size:12px;
            }
            .currentUser [icon='social:person']{
                margin:0;
            }
*/
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
                --iron-icon-fill-color:var(--existdb-drawer-icon-color);
                margin-right: 20px;

            }
            
            
            .badge{
                border-radius:10px;
                background:var(--existdb-header-bg-color);
                color:var(--existdb-header-color);
                padding:0 4px;
                height:20px;
                font-size:14px;
                padding-bottom:2px;
                font-weight:bold;
                margin-left:4px;
                display:inline-block;
                position:absolute;
                right:10px;                
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
            },
            permissions:{
                type:Array
            },
            localcount:{
                type:Number
            },
            remotecount:{
                type:Number
            }
        };
    }

    constructor(){
        super();
        this.loggedIn = false;
        this.permissions = [];
        this.localcount=0;
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
                        <div class="brand">
                            <img class="logo" src="resources/images/existdb-web.svg">
                            <existdb-version> </existdb-version>
                            <div class="user">User: ${this.user}</div>
                            <div class="subitem">Dashboard</div>
                        </div>
                        <div class="nav">
                        
                        <a href="./" tabindex="-1">
                            <paper-item id="launcher" role="menuitem">
                                <iron-icon icon="inline:launcher"></iron-icon>                           
                                <span class="menuitem">Launcher</span>
                                <paper-ripple></paper-ripple>
                            </paper-item>
                        </a>
                        
                        ${this.permissions.includes('packages') ?
                            html`
                            <a href="./packages" tabindex="-1">
                                <paper-item class="subNav" role="menuitem">
                                    <iron-icon icon="apps"></iron-icon>
                                    <span id="packagenav" class="menuitem">Packages</span>
                                    
                                    <span class="badge">${this.localcount}</span>                               

                                    <paper-ripple></paper-ripple>
                                </paper-item>
                            </a>
                            `:''
                        }
                            
                            
                        ${this.permissions.includes('repository') ?
                            html`
                            <a href="./repository">
                                <paper-item class="subNav" role="menuitem">
                                    <iron-icon icon="cloud-download"></iron-icon>
                                    <span class="menuitem">Repository</span>
                                    <span class="badge">${this.remotecount}</span>                               
                                    <paper-ripple></paper-ripple>
                                </paper-item>
                            </a>
                            `:''
                        }
                        
                        ${this.permissions.includes('usermanager') ?
                            html`
                            <a href="./usermanager" tabindex="-1">
                                <paper-item id="usermanager" role="menuitem">
                                    <iron-icon icon="social:person"></iron-icon>
                                    <span class="menuitem">Users</span>
                                    <paper-ripple></paper-ripple>
                                </paper-item>
                                <paper-item id="usermanager" role="menuitem">
                                    <iron-icon icon="social:people"></iron-icon>
                                    <span class="menuitem">Groups</span>
                                    <paper-ripple></paper-ripple>
                                </paper-item>
                            </a>
                            `:''
                        }
    
                        ${this.permissions.includes('backup') ?
                            html`
                            <a href="./backup" tabindex="-1">
                                <paper-item id="backup" role="menuitem">
                                    <iron-icon icon="restore"></iron-icon>
                                    <span class="menuitem">Backup</span>
                                    <paper-ripple></paper-ripple>
                                </paper-item>
                            </a>
                            `:''
                        }
                        
                        ${this.permissions.includes('settings') ?
                            html`
                                <a href="./settings" tabindex="-1">
                                    <paper-item id="settings" role="menuitem">
                                        <iron-icon icon="settings"></iron-icon>
                                        <span class="menuitem">Settings</span>
                                        <paper-ripple></paper-ripple>
                                    </paper-item>
                                </a>
                            `:''
                        }
                        
                        
                        </div>
                    </div>
                </app-drawer>`
                : ''
            }
        `;


        return html`
           
           <app-drawer-layout id="layout" fullbleed>
                ${drawer}
                <app-header-layout fullbleed>
                    <app-header id="header" slot="header" fixed condenses>
                        <app-toolbar>
                            <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
                            <div main-title>
                                <span id="title">${this.currentView}</span>
                            </div>
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
        this.addEventListener('packages-loaded', this._updateCount);



    }


    initRouter(){
        const router = new Router(document.querySelector('main'));

        const loadPackages = (context, commands) => {
            return import('./existdb-packages.js');
        };
        const loadRepository = (context, commands) => {
            return import('./existdb-repository.js');
        };
        const loadPackagemanager = (context, commands) => {
            // this._lazyImport('existdb-packagemanager');
            import('./existdb-packagemanager.js');
            console.log('comp ', commands.component('existdb-packagemanager'));
            commands.component('existdb-packagemanager').setAttribute('type','local');
            // return import('./existdb-packagemanager.js');
        };
        const loadUsermanager = (context, commands) => {
            // this._lazyImport('existdb-usermanager');
            return import('./existdb-usermanager.js');
        };
        const loadBackup = (context, commands) => {
            // this._lazyImport('existdb-backup');
            return import('./existdb-backup.js');
        };
        const loadSettings = (context, commands) => {
            return import('./existdb-settings.js');
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
                path: '/packages',
                component: 'existdb-packages',
                action: loadPackages
            },
            {
                path: '/repository',
                component: 'existdb-repository',
                action: loadRepository
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

    _lazyImport(componentName){
        const module = './' + componentName + '.js';
        import(module)
        .then((module) => {
            return commands.component(componentName);
        })
        .catch((err) => {
            console.log('error while fetching ' + componentName, err);
        });
    }


    _handleLogin(e){
        this.user = e.detail.user;
        if(e.detail.permissions){
            this.loggedIn = true;
            this.permissions = e.detail.permissions;
            const launcher = this.querySelector('existdb-launcher');
            if(launcher){
                launcher.hideBranding();
            }
        }
        this.render();

    }

    _handleLogout(e){
        if(this.loggedIn === true){
            this.loggedIn = false;
            this.permissions = [];
            window.location.href='./'; //force reload of page
        }
    }

    _setTitle(e){
        this.currentView = e.detail.view;
    }

    _navigate(e){
        const layout = this.shadowRoot.getElementById('layout');
        const drawer = this.shadowRoot.getElementById('drawer');
        if(layout.narrow){
            drawer.close();
        }
    }

    _updateCount(e){
        console.log('updateCount ', e.detail);
        if(e.detail.scope == 'local' || e.detail.scope == 'apps'){
            this.localcount = e.detail.count;
        }
        if(e.detail.scope == 'remote'){
            this.remotecount = e.detail.count;
        }
        console.log('dashbaord count ', this.count);
    }


}
customElements.define('existdb-dashboard', ExistdbDashboard);