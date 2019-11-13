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
import '../assets/@vaadin/vaadin-upload/vaadin-upload.js';
import '../assets/@polymer/paper-button/paper-button.js';
import '../assets/@polymer/paper-tabs/paper-tabs.js';
import '../assets/@polymer/paper-tabs/paper-tab.js';
import '../assets/@polymer/iron-pages/iron-pages.js';
import '../assets/@polymer/paper-toast/paper-toast.js';
import '../assets/@polymer/paper-icon-button/paper-icon-button.js';

import '../assets/@polymer/paper-fab/paper-fab.js';
import './existdb-switchpage.js';

import './existdb-packagelist.js';


// Extend the LitElement base class
//@deprecated
class ExistdbPackagemanager extends ExistdbDashboardBase {

    static get styles() {
        return css`
            :host {
                display: block;

                position: relative;
                background: whitesmoke;
                padding: 0;
                margin: 0;
                width: 100%;
                height:100%;
                overflow:auto;
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
            }
            
            app-toolbar{
                height:64px;
            }

            #pages{
                margin-top:-63px;
            }
            #pages, existdb-packagelist, iron-list{
                display: block;
                width:100%;
                height:100vh;
            }
            #pages > div{
                width: 100%;
                height:100%;
            }
            
            .page{
                position:relative;
            }
            
          

            [icon="apps"],[icon="search"],[icon="more-vert"]{
                --iron-icon-fill-color:white;
                --iron-icon-stroke-color:white;
            }
            [icon="chevron-left"]{
                --iron-icon-fill-color:var(--paper-blue-100);
                --paper-icon-button:{
                    width: 64px;
                    height:52px;
                }
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

            vaadin-upload{
                background: var(--existdb-subheader-bg-color);
                padding:4px;
                color: var(--existdb-subheader-color);
                display:block;
                whitespace:nowrap;
                height:42px;
                font-size:16px;
            }
            vaadin-upload:not([nodrop]){
                border:none;
            }
            
            vaadin-upload .drop-icon{
                display:none;
            }

            [slot="drop-label"] {
                padding:11px 0;
                color:var(--existdb-subheader-color);
                font-weight:300;
                display: inline-block;
            }
            [slot="drop-label-icon"] {
                margin: 0 1em;
                width: 40px;
                color:var(--paper-blue-500);
                height:36px;
            }

            [slot="add-button"] {
                background: var(--existdb-control-bg);
                color:var(--existdb-control-color);
                margin: 0 ;
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

            paper-listbox{
                z-index:10;
            }
            paper-card{
                position:fixed;
                z-index:101;
                width:340px;
                padding:10px;
                top:10px;
                right:30px;
                --paper-card-background-color:var(--paper-orange-500);
            }
            .card-content{
                background:var(--paper-orange-300);
            }
            paper-card td:first-child{
                padding:10px 10px 10px 0;
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
                margin-top:64px;
                border-bottom: solid 1px var(--existdb-header-bg-color);
            }
            
            existdb-switchpage{
                position:absolute;
                bottom:50px;
                right:80px;
            }
            
        `;
    }

    get page(){
        if(this.selected == 0){
            return html`<div id="localPage" class="local page">
                            <existdb-packagelist id="localService" type="apps" autoLoad></existdb-packagelist>
                        </div>`;

        } else{
            return html`<div id="repoPage" class="repo page">
                            <existdb-packagelist id="remoteService" type="remote"></existdb-packagelist>
                        </div>`;
        }
    }

    render() {
        return html`

        <app-header-layout id="layout" fullbleed>
            <app-header slot="header" class="app-header" fixed>

                <app-toolbar id="maintool" static fixed>
                    <!--<iron-icon icon="apps"></iron-icon>-->
                    <slot name="toggleIcon"></slot>
                    
                    <vaadin-upload id="uploader" accept=".xar" method="post" target="${this.targetUrl}">
                        <iron-icon class="drop-icon" slot="drop-label-icon" icon="image:adjust"></iron-icon>
                        <div slot="drop-label">DROPZONE - put your package(s) here.</div>
                        <paper-button id="uploadBtn" slot="add-button">upload</paper-button>
                    </vaadin-upload>


                    <div main-title></div>


                    <paper-input-container no-label-float>
                        <iron-input slot="input">
                            <input id="filterLocal" class="filter" type="text" name="query"
                                   tabindex="0" @keyup="${this._handleFilter}" autofocus placeholder="type here to filter" title="type here to filter - ESC to reset">
                        </iron-input>
                    </paper-input-container>


                </app-toolbar>
            </app-header>


            <exis   tdb-packagelist id="localService" type="apps" autoLoad></existdb-packagelist>
        </app-header-layout>
        
        <existdb-switchpage></existdb-switchpage>
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
            localCount: {
                type: Number,
                value: 0
            },
            remoteCount: {
                type: Number,
                value: 0
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
            type:{
                type:String
            }

        };
    }

    constructor(){
        super();
        this.viewName = 'Packagemanager';
        this.selected = 0;
        this.type = 'apps'
    }

    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);

        this.pages = this.shadowRoot.getElementById('pages');
        this.addEventListener('toggle-page',(e) => {this._togglePages(e)});

    }



    _togglePages(e){
        console.log('_togglePages e ', e.detail);
        console.log('_togglePages e index ', e.detail.index);
        console.log('_togglePages e index ', this.pages);

        if(this.selected == 0){
            this.pages.selected=1;
            // this.shadowRoot.getElementById('remoteService').loadPackages();
        }else{
            this.pages.selected=0;
            // this.shadowRoot.getElementById('localService').loadPackages();
        }
        this.render();
    }


}

customElements.define('existdb-packagemanager', ExistdbPackagemanager);