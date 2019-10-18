// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';

// todo
class LauncherApp extends LitElement {

    static get styles(){
        return css`
            :host {
                display: table;
                width:100%;
                height:100%;
                /*margin:10px;*/
                /*border:thin solid red;*/
                text-align: center;
            }

            ::slotted(repo-icon){
                width: 100%;
                height: 100%;
                vertical-align: middle;
                display: table-cell;
                background: transparent;
                text-align:center;

            }
            .wrapper{
                width:100%;
                height:100%;
                display:table;
            }
        `;
    }

    render(){
        return html`
            <paper-ripple></paper-ripple> 
            <div id="wrapper" class="wrapper">
                <slot></slot>
            </div>        
        `;
    }

    static get properties() {
        return {
            type: {
                type: String
            },
            status: {
                type: String
            },
            packageTitle: {
                type: String
            },
            path: {
                type: String
            },
            readonly:{
                type: String
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this.setAttribute('tabindex','0');
    }


    firstUpdated(changedProperties) {
        this.addEventListener('click',this._openApp);
        this.addEventListener('keyup',this._handleEnter);
    }


    _handleTap (e) {
//                console.log('handleTap ', e);
        e.stopPropagation();
        this._openApp();
    }


    _handleEnter(e) {
        var originalTarget = e.composedPath()[0];
        if (originalTarget.nodeName == "LAUNCHER-APP" && e.keyCode == 13) {
            this._openApp(e);
        }
    }

    _openApp(e){
        var isApp = this.type == 'application';
        if(isApp && this.status == "installed"){
            var targetUrl = this.path;
            setTimeout(function(){
                window.open(targetUrl);
            },300);
        }
    }


}
customElements.define('launcher-app', LauncherApp);