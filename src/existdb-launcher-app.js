// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/app-layout/app-header-layout/app-header-layout.js';
import '../assets/@polymer/app-layout/app-header/app-header.js';
import '../assets/@polymer/app-layout/app-toolbar/app-toolbar.js';
import '../assets/@polymer/paper-styles/color.js';
import './existdb-launcher.js';
import './settings.js';

// Extend the LitElement base class
class ExistdbLauncherApp extends LitElement {

    static get styles(){
        return css`
            :host{
                background: ghostwhite;
                font-family: var(--existdb-font-family);
                -webkit-font-smoothing: antialiased;
                padding: 0;
                margin: 0;
                width: 100%;
                height: 100%;
            }
            app-header-layout {
                position: absolute;
                top: 0px;
                right: 0px;
                bottom: 0px;
                left: 0px;
                /*height: calc(100% - 200px);*/
                background-color: var(--existdb-content-bg);
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            }


            app-header {
                /*background: rgb(0, 136, 204);*/
                background: var(--existdb-header-bg-color);
                padding: 0px;
                color: var(--existdb-header-color);
                height: 60px;
            }
            
            .logout{
                color:white;
                font-size:18px;
                font-weight:300;
                margin-right:20px;
            }
            #login{
                color:white;
                margin-right:10px;
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

    /**
     * Implement `render` to define a template for your element.
     *
     * You must provide an implementation of `render` for any element
     * that uses LitElement as a base class.
     */
    render() {
        /**
         *
         */
        return html`
            <app-header-layout id="outer" fullbleed has-scrolling-region>
                <app-header slot="header" fixed>
                    <app-toolbar>
                        <img class="x" src="icon.svg" style="width:36px;height:36px;margin-right:10px;">
                        <slot name="toggleIcon"></slot>
                        <div main-title>Launcher 3</div>
                        <slot></slot>
                    </app-toolbar>
                </app-header>
                <existdb-launcher></existdb-launcher>
            </app-header-layout>
        `;
    }

    static get properties() {
        return {
        };
    }

    constructor(){
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        console.log('ExistdbLauncherApp connected ', this);
        // this.querySelector('#outer').resetLayout();
    }


}

// Register the new element with the browser.
customElements.define('existdb-launcher-app', ExistdbLauncherApp);