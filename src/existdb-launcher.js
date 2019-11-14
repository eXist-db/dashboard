// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import {ExistdbDashboardBase} from './existdb-dashboard-base.js'
import {settings} from './settings.js';
import './existdb-branding.js';
import './existdb-launch-button.js';
import './existdb-packageloader.js';

/**
 * loads and displays a list of locally installed eXist-db apps.
 *
 * Supports a list of ignored apps to be hidden from display (e.g. Launcher itself shall not be displayed
 * by Launcher). List of ignored apps can be configured in settings.js
 */
// class ExistdbLauncher extends LitElement {
class ExistdbLauncher extends ExistdbDashboardBase {

    static get styles(){
        return css`
            :host {
                display: block;
                position:relative;
                background:var(--existdb-content-bg);
                color:var(--existdb-content-color);
                height:100%;
                width:100%;
            }
            .apps{
                display:flex;
                flex-direction: row;
                flex-wrap: wrap;
                align-items: center;
                height:100%;
            }
            repo-packages{
                height:100%;
            }
            existdb-launch-button{
                width:150px;
                height:150px;
                position:relative;
                cursor: pointer;
                margin:10px;
                float:left;
                display:table-cell;
            }
            repo-title{
                font-size:12px;
                display:block;
                position: absolute;
                bottom:4px;
                /*left: 15px;*/
                left: 0px;
                width: 100%;
                text-align: center;
                height:36px;
                text-shadow: -2px 2px 2px rgba(108,98,98,0.3);
                color:var(--paper-grey-900);
            }
            repo-icon{
                width: 100%;
                height: 100%;
                vertical-align: middle;
                display: table-cell;
                background: transparent;
            }
            #logo, repo-packages{
                display:inline-block;
                float:left;
            }

            [hidden]{
                display: none;
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

            <existdb-packageloader id="loader"
                @response="${this._display}"
                scope="apps"></existdb-packageloader>
                
            
            <div id="apps" class="apps">
                <repo-packages id="packages">
                    <div id="logo"></div>
                 ${this.packages.map((item) => 
                    html`
                        <existdb-launch-button  path="${item.path}"
                                        type="${item.type}" 
                                        status="${item.status}" 
                                        icon="${item.icon}"
                                        abbrev="${item.abbrev}"
                                        tabindex="-1"
                                        ></existdb-launch-button>
                    `)}
                 </repo-packages>
            </div>
        `;
    }

    static get properties() {
        return {
            branding:{
                type:Object
            },
            packages:{
                type:Array
            }
        };
    }

    constructor(){
        super();

        this.viewName='Launcher';
        // this.appList = {};
        this.packages = [];
    }

    get listApps(){
        return html`
            ${this.appList}
        `;
    }

    connectedCallback() {
        super.connectedCallback();
       console.log('ExistdbLauncher connected ', this);

    }

    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);


        this.shadowRoot.getElementById('loader').generateRequest();
        this.focus();
    }

    hideBranding(){
        if(this.branding){
            this.branding.hidden = true;
        }
    }
    async _animate(){
        var apps = this.shadowRoot.querySelectorAll('launch-button');
        // show branding unless we're embedded in dashboard

        if(!this._isLoggedIn()){
            this.branding = document.createElement('existdb-branding');
            var packageRoot = this.shadowRoot.getElementById('logo');
            packageRoot.appendChild(this.branding);
        }

        console.log('apps ', apps);
        const t1 = anime.timeline({
            easing:'easeInOutCirc',
            duration:300
        });

        t1.add({
            targets: this.branding,
            // translateX:[-400,0],
            opacity:[0.5,1],
            duration:200
        });
        t1.add({
            targets: apps,
            opacity: [0,1],
            // translateX:[-500,0],
            // translateY:[-500,0],
            scale:[0,1],
            delay: anime.stagger(10),
            duration:200,
            complete:function(anim){
                // brand.animate()
            }
        },'-=200');

    }

    async _display(e){
        console.log('_display');
        this.packages = this.shadowRoot.getElementById('loader').lastResponse;
        this.updateComplete.then(() => { this._animate() });
    }


    _isLoggedIn(){
        return document.querySelector('existdb-dashboard').loggedIn;
    }



}

// Register the new element with the browser.
customElements.define('existdb-launcher', ExistdbLauncher);