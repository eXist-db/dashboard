// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import {ExistdbDashboardBase} from './existdb-dashboard-base.js'

// import '../assets/@polymer/iron-a11y-keys/iron-a11y-keys.js';
import '../assets/@polymer/iron-icons/iron-icons.js';
import '../assets/@polymer/iron-icon/iron-icon.js';
import '../assets/@polymer/paper-card/paper-card.js';
import '../assets/@polymer/paper-button/paper-button.js';
import '../assets/@polymer/app-layout/app-header-layout/app-header-layout.js';
import '../assets/@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
import '../assets/@polymer/app-layout/app-header/app-header.js';
import '../assets/@polymer/app-layout/app-toolbar/app-toolbar.js';
import '../assets/@polymer/paper-input/paper-input-container.js';
import '../assets/@polymer/iron-input/iron-input.js';
import '../assets/@polymer/paper-menu-button/paper-menu-button.js';
import '../assets/@polymer/paper-icon-button/paper-icon-button.js';
import '../assets/@polymer/paper-listbox/paper-listbox.js';
import '../assets/@polymer/paper-item/paper-item.js';
import '../assets/@polymer/paper-button/paper-button.js';
import '../assets/@polymer/paper-tabs/paper-tabs.js';
import '../assets/@polymer/paper-tabs/paper-tab.js';
import '../assets/@polymer/paper-toast/paper-toast.js';
import '../assets/@polymer/paper-icon-button/paper-icon-button.js';

import './existdb-packagelist.js';


// Extend the LitElement base class
class ExistdbRepository extends ExistdbDashboardBase {

    static get styles() {
        return css`
            :host {
                display: block;

                position: relative;
                background: whitesmoke;
                padding: 0;
                margin: 0;
                width: 100%;
                height:100vh;
                position: relative;
                color:var(--existdb-content-color);

                --paper-toggle-button-checked-button-color: var(--paper-blue-700);

                --app-header-background-front-layer: {
                    background: var(--existdb-control-bg);

                };
                
                
            }


            app-header-layout {
                position: absolute;
                top: 0px;
                right: 0px;
                bottom: 0px;
                left: 0px;
                background-color: #eee;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            }

            app-header {
                background: var(--existdb-header-bg-color);
                color:var(--existdb-subheader-color);
                height:64px;
            }
            
            app-toolbar{
                height:64px;
            }
            .page{
                position:relative;
                height:100%;
                padding:0; 
            }
            

            [icon="apps"],[icon="search"],[icon="more-vert"]{
                --iron-icon-fill-color:white;
                --iron-icon-stroke-color:white;
            }
            [icon="apps"]{
                width:36px;
                height: 36px;
            }

            .filter{
                display: inline-block;
                font-size: 16px;
                box-shadow: none;
                width:100%;
                border:none;
                outline:none;
                font-size:16px;
                background: var(--existdb-control-bg);
                color:var(--existdb-control-color);
                padding:10px;

                --paper-input-container-underline-focus:{
                    border:red;
                };
                --paper-input-container-input:{
                    color:var(--existdb-control-color);
                };
            }
            .filter::placeholder{
                color:var(--existdb-control-color);
            }
            ::selection{
                color:var(--existdb-control-bg);
            }


            .remote-filter-wrapper{
                margin-right:40px;
            }

            iron-icon {
                margin-right: 10px;
                --iron-icon-stroke-color: var(--paper-blue-500);
            }

            app-toolbar {
                z-index: 10;
                background: var(--existdb-subheader-bg-color);
                color:white;
            }

            #toast {
                --paper-toast-background-color: var(--paper-blue-700);
                --paper-toast-color: white;
            }

            #toastError {
                --paper-toast-background-color: var(--paper-red-700);
                --paper-toast-color: white;
            }

            #updates{
                --paper-toast-background-color: var(--paper-orange-700);
                display: table;
                font-size:18px;
            }
            #updates paper-button{
                background: var(--paper-orange-300);
                color:var(--paper-deep-orange-700);
                text-align: center;
                margin-left:20px;
            }
            #updates #label{
                display: inline-block;
                padding-right:20px;
            }
            #updates paper-icon-button{
                float:right;
            }

            [type='search'] {
                width: 140px;

            }

            aper-fab , ron-icon{
                positon:absolute;
                right: 50px;
                bottom: 50px;
                z-index: 999;
                background: var(--paper-pink-500);
                --iron-icon-fill-color: var(--paper-grey-50);
            }

            .heading {
                display: none;
            }

            .x{
                width:36px;
                height:36px;
                margin-right:10px;
            }

            @media only screen and (min-width: 768px) {
                .heading {
                    width: 100%;
                    display: inline-block;
                    font-weight: 300;
                    text-align: center;
                    flex-grow: 2;
                    color: var(--paper-blue-100);
                }
            }
            @media only screen and (max-width: 768px) {
                .filter{
                    margin-left:4px;
                }
                [main-title]{
                    font-size:18px;
                }
                [icon="apps"]{
                    display: none;
                }

                [slot="drop-label"], [slot="drop-label-icon"] {
                    display: none;
                }
                .x{
                    display:none;
                }
                app-toolbar{
                    padding-right:0;
                }

            }

            [main-title]{
                color:white;
                font-weight: 300;
            }

            [hidden]{
                display: none;
            }

            .counter{
                font-size:smaller;
            }

            paper-input-container{

                --paper-input-container-underline:{
                    border:none;
                    outline: none;

                };
                
                
                --paper-input-container-color:var(--existdb-control-color);
                --paper-input-container-focus-color:var(--existdb-control-color);
                --paper-input-container-input-color:var(--existdb-control-color);

                
            }
            
            iron-input{
                --paper-input-container-input-color:var(--existdb-control-color);
            }

            #maintool{
                border-bottom: solid 1px var(--existdb-header-bg-color);
            }
            
        `;
    }

    render() {
        return html`

        <app-header-layout id="layout" fullbleed has-scrolling-region>
            <app-header slot="header" class="app-header" fixed>

                <app-toolbar id="maintool" static fixed>
                    <!--<iron-icon icon="apps"></iron-icon>-->
                    <slot name="toggleIcon"></slot>
                    
                    <div main-title></div>

                    <paper-input-container no-label-float>
                        <iron-input slot="input">
                            <input id="filterLocal" class="filter" type="text" name="query"
                                   tabindex="0" @keyup="${this._handleFilter}" autofocus placeholder="type here to filter" title="type here to filter - ESC to reset">
                        </iron-input>
                    </paper-input-container>


                </app-toolbar>
            </app-header>


            <div class="page">
                <existdb-packagelist 
                    scope="${this.scope}"
                    autoLoad 
                    scroll-target="document" 
                    @packages-loaded="${this._updateCount}"></existdb-packagelist>
            </div>
        </app-header-layout>
        
        `;
    }

    static get properties() {
        return {
            url: {
                type: String,
                reflect: true
            },
            targetUrl: {
                type: String,
                reflect: true
            },
            filter: {
                type: String,
                reflect: true,
            },
            selected: {
                type: Number
            },
            target: {
                type: Object
            },
            currentFocus: {
                type: Number
            },
            count: {
                type: Number,
                reflect:true
            },
            local: {
                type: Array,
                value: []
            },
            remote: {
                type: Array,
                value: []
            },
            logout: {
                type: Boolean,
                value: false,
                reflect: true
            },
            scope:{
                type:String
            }

        };
    }

    constructor(){
        super();
        this.viewName = 'Repository';
        this.selected = 0;
        this.scope = 'remote';
        this.count = 0;
    }

    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);


    }

    _updateCount(e){
        console.log(this, '_updateCount ', e.detail.count);
        this.count = e.detail.count;
    }




}

customElements.define('existdb-repository', ExistdbRepository);