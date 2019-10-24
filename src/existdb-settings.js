// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/iron-ajax/iron-ajax.js';
import '../assets/@polymer/app-layout/app-header-layout/app-header-layout.js';
import '../assets/@polymer/app-layout/app-header/app-header.js';
import '../assets/@polymer/app-layout/app-toolbar/app-toolbar.js';
import '../assets/@polymer/iron-icons/iron-icons.js';
import '../assets/@polymer/iron-icon/iron-icon.js';
import '../assets/@polymer/paper-card/paper-card.js';

// Extend the LitElement base class
class ExistdbSettings extends LitElement {

    static get styles(){
        return css`
          :host {
            display: block;
            width:100%;
            height:100%;
            margin:0;
            /*padding:0;*/
            @apply(--paper-font-common-base);
            color:white;
            padding:30px;
          }
    
          app-header-layout {
            position: absolute;
            top: 0px;
            right: 0px;
            bottom: 0px;
            left: 0px;
            /*height: calc(100% - 200px);*/
            background-color: ghostwhite;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
          }
    
    
          app-header {
            /*background: rgb(0, 136, 204);*/
            background: var(--paper-blue-500);
            padding: 0px;
            color: white;
            height: 60px;
          }
    
          h1{
            color:var(--paper-grey-900);
          }
    
          paper-card{
            max-width: 600px;
            min-width: 320px;
            padding: 20px;
            margin:50px auto;
          }
          .hint{
            color:var(--paper-grey-900);
            font-size:14px;
            font-style: italic;
          }
          .content{
            display: block;
          }
          paper-card{
            width: 100%;
            display: block;
    
          }
          .card-content{
            color:var(--paper-grey-900);
          }
          .highlight{
            color:var(--paper-blue-500);
            font-size: 18px;
            padding: 10px;
          }
    
          [icon="settings"]{
            --iron-icon-fill-color:white;
            margin-right:10px;
            --iron-icon-width: 30px;
            --iron-icon-height: 30px;
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
        `;
    }

    render(){
        return html`
            <iron-ajax id="getPublicUrl"
                       verbose with-credentials
                       method="get" handle-as="text"
                       on-response="_handleUrl"
                       auto></iron-ajax>
        
            <iron-ajax id="getVersion"
                       with-credentials
                       method="get"
                       handle-as="text"
                       on-response="_handleVersion"
                       auto></iron-ajax>
        
        
            <app-header-layout id="outer" fullbleed>
              <app-header slot="header" fixed>
                <app-toolbar>
                  <iron-icon icon="settings" class="x"></iron-icon>
                  <slot name="toggleIcon"></slot>
        
                  <div main-title>Settings</div>
                </app-toolbar>
              </app-header>
        
              <div class="content">
                <paper-card heading="Server Version">
                  <div class="card-content">
                    You are running
                    <div class="highlight">[[versionString]]</div>
                  </div>
                </paper-card>
        
                <paper-card heading="General Settings">
                  <div class="card-content">
                    <!--<paper-input id="publicUrl" label="Public Repository URL" aria-readonly="true" readOnly></paper-input>-->
                    Public Repository URL
                    <div class="highlight" id="publicUrl"></div>
                    <span class="hint">URL from which publicly available eXist-db apps and libraries are loaded.</span>
                  </div>
                </paper-card>
              </div>
            </app-header-layout>        
        `;
    }


}
customElements.define('existdb-settings', ExistdbSettings);