// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import {ExistdbDashboardBase} from './existdb-dashboard-base.js'

import '../assets/@polymer/iron-ajax/iron-ajax.js';
import '../assets/@polymer/iron-icons/iron-icons.js';
import '../assets/@polymer/iron-icon/iron-icon.js';
import '../assets/@polymer/paper-card/paper-card.js';
import './existdb-version.js';
import './existdb-theme-switcher.js';

import {resolveUrl} from "./util.js";

// Extend the LitElement base class
class ExistdbSettings extends ExistdbDashboardBase {

    static get styles() {
        return css`
          :host {
            display: block;
            width:100%;
            height:100%;
            margin:0;
            /*padding:0;*/
            color:white;
            padding:30px;
            background:var(--existdb-content-bg);            
            
          }
       
          h1{
            color:var(--paper-grey-900);
          }
    
          paper-card{
            max-width: 600px;
            min-width: 320px;
            padding: 20px;
            margin:50px auto;
            width: 100%;
            display: block;
          }
          .hint{
            color:var(--paper-grey-900);
            font-size:14px;
            font-style: italic;
          }
          .content{
            display: block;
          }
          .card-content{
            color:var(--paper-grey-900);
          }
          .highlight, .highlight a {
            color:var(--existdb-text-emphasize-color);
            font-size: 18px;
            padding: 10px 0;
          }
    
          @media only screen and (max-width: 768px) {
            [main-title]{
              font-size:18px;
            }
            .x{
              display:none;
            }
            app-toolbar{
              padding-right:0;
            }
    
          }
          
          existdb-version{
            font-weight:700;
          }
        `;
    }

    constructor() {
        super();

        this.viewName = 'Settings';
    }


    render() {
        return html`
            <iron-ajax id="getPublicUrl"
                       verbose with-credentials
                       method="get" handle-as="text"
                       @response="${this._handleRepoUrl}"
                       url="../packageservice/packages/public-url/"
                       auto></iron-ajax>
        
             
          <div class="content">
            <paper-card heading="Server Version">
              <div class="card-content">
                <div class="highlight"> You are running <existdb-version></existdb-version></div>
              </div>
            </paper-card>
    
            <paper-card heading="Public Repository URL">
              <div class="card-content">
                <!--<paper-input id="publicUrl" label="Public Repository URL" aria-readonly="true" readOnly></paper-input>-->
<!--                Public Repository URL-->
                <div class="highlight" id="publicUrl"><a href="${this.publicRepoUrl}" target="_blank">${this.publicRepoUrl}</a></div>
                <span class="hint">URL from which publicly available eXist-db apps and libraries are loaded.</span>
              </div>
            </paper-card>
            
            <paper-card heading="Theme">
                <div class="card-content">
                    <existdb-theme-switcher></existdb-theme-switcher>
                </div>
            </paper-card>
          </div>
        `;
    }

    static get properties() {
        return {
            /**
             * URL of the public eXist-db repo which hosts public apps and libs
             */
            publicRepoUrl:{
                type: String
            }
        };
    }


    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);
        const cards = this.shadowRoot.querySelectorAll('paper-card');
        anime({
            targets: cards,
            opacity: [0, 1],
            scale: [0.5, 1],
            duration: 300,
            delay: anime.stagger(30),
            easing:'easeInOutCirc'
        });


        this.ajax = this.shadowRoot.getElementById('getPublicUrl');
        const url = resolveUrl(this.ajax.url);
        this.ajax.url = url;
        this.ajax.generateRequest();

    }

    _handleRepoUrl(){
        this.publicRepoUrl = this.ajax.lastResponse;
    }


}

customElements.define('existdb-settings', ExistdbSettings);