// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/iron-icons/iron-icons.js';
import '../assets/@polymer/iron-icon/iron-icon.js';
import '../assets/@polymer/iron-icons/social-icons.js';
import '../assets/@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '../assets/@polymer/app-layout/app-drawer/app-drawer.js';
import '../assets/@polymer/app-layout/app-header-layout/app-header-layout.js';
import '../assets/@polymer/app-layout/app-header/app-header.js';
import '../assets/@polymer/app-layout/app-toolbar/app-toolbar.js';
import '../assets/@polymer/app-route/app-location.js';
import '../assets/@polymer/app-route/app-route.js';
import '../assets/@polymer/paper-styles/color.js';
import '../assets/@polymer/paper-styles/typography.js';
import '../assets/@polymer/paper-item/paper-item.js';

import './existdb-login.js';
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
                @apply(--paper-font-common-base);
                color: var(--google-grey-900);
                --app-drawer-scrim-background: rgba(0, 0, 0, 0.3);

                --existdb-login-theme: {
                    text-decoration: none;
                    color: black;
                };
                
                --app-drawer-width:250px;
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
                background: rgb(0, 136, 204);
                width: 100%;
                margin: 0;
            }

            app-drawer {
                /*background: rgba(245, 245, 245, 0.5);*/
                z-index: 100;
                text-align: center;
                color: black;
                /*background: url('resources/images/x.svg') no-repeat;*/
            }

            .drawerbar {
                width: 256px;
                height: 128px;
                display: table-cell;
                vertical-align: middle;
            }

            app-drawer-layout:not([narrow]) [drawer-toggle] {
                display: none;
            }
            
            app-header{
                background:var(--existdb-header-bg-color);
                height:60px;
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

            .subitem {
                font-weight: 300;
                font-size: larger;
                letter-spacing: 4.5px;
            }

            h1 {
                color: blue;
            }

            #versionDialog {
                text-align: center;
            }

            #settings {
                padding: 20px;
            }

            .item-img {
                width: 36px;
                height: 36px;
                margin-right: 8px;
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
                margin-top:-6px;
                margin-bottom:6px;
                width: 100%;
            }
            
        `;
    }


/*    renderDrawer(){

      return html`
        ${this.loggedIn 
            ? html`
            
            `: nothing
      `;
    }*/
    static get properties() {
        return {
            loggedIn:{
                type:Boolean
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
                <app-drawer id="drawer" slot="drawer">
                    <div class="drawerbar">
                        <img class="logo" src="resources/images/existdb-web.svg">
                        <existdb-version> </existdb-version>
                        <div class="subitem">Dashboard</div>
                    </div>
    
                    <paper-item id="launcherItem" on-click="_showLauncher" role="menuitem">
                        <img class="item-img" src="resources/images/launcher.svg">
                        <span class="menuitem">Launcher</span>
                        <paper-ripple></paper-ripple>
                    </paper-item>
                    <paper-item id="packageManagerItem" on-click="_showPackageManager" role="menuitem">
                        <iron-icon icon="apps"></iron-icon>
                        <span class="menuitem">Package Manager</span>
                        <paper-ripple></paper-ripple>
                    </paper-item>
                    <paper-item id="userManagerItem" on-click="_showUserManager" role="menuitem">
                        <iron-icon icon="social:people"></iron-icon>
                        <span class="menuitem">User Manager</span>
                        <paper-ripple></paper-ripple>
                    </paper-item>
                    <paper-item id="backupItem" on-click="_showBackup" role="menuitem">
                        <iron-icon icon="restore"></iron-icon>
                        <span class="menuitem">Backup</span>
                        <paper-ripple></paper-ripple>
                    </paper-item>
                    <paper-item id="settingsItem" on-click="_showSettings" role="menuitem">
                        <iron-icon icon="settings"></iron-icon>
                        <span class="menuitem">Settings</span>
                        <paper-ripple></paper-ripple>
                    </paper-item>
                </app-drawer>`
                : ''
            }
        `;


        return html`
            <app-location id="location" route="{{route}}" use-hash-as-path></app-location>
            <app-route id="router"
                       route="{{route}}"
                       pattern="/:page"
                       data="{{routeData}}"></app-route>
           
           <app-drawer-layout fullbleed>
                ${drawer}
           
                
                <app-header-layout>
                    <app-toolbar>
                        <div main-title></div>
                        <slot name="login"></slot>
                    </app-toolbar>
                    
                    <main>
                        <slot></slot>
                    </main>

                </app-header-layout>
    
            </app-drawer-layout>    
        `;
    }



    firstUpdated(changedProperties) {
        // const drawer = this.shadowRoot.getElementById('drawer');
        // console.log("drawer ", drawer);

        // drawer.close();
        this.addEventListener('logged-in', this._handleLogin)
    }

    _handleLogin(e){
        console.log('user logged in ',e.detail.user);
        this.loggedIn = true;
        this.render();
        // this.shadowRoot.getElementById('drawer').forceNarrow = false;
    }


}
customElements.define('existdb-dashboard', ExistdbDashboard);