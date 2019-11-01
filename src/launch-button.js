// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/paper-card/paper-card.js';

// todo
class LaunchButton extends LitElement {

    static get styles(){
        return css`
            :host {
                display: inline-block;
                width:150px;
                height:150px;
                text-align: center;
                background:transparent;                
            }
            :host(:focus){
                outline:none;
                background:transparent;
                opacity:1;
            }
            :host(:focus) .abbrev{
                font-weight:700;
                color:var(--existdb-highlight-color);
                padding:0 6px;
            }

            .wrapper{
                width:100%;
                height:100%;
                display:table;
                text-align:center;
                transition: all 0.2s ease-in-out;
                opacity:0.8;
                transform:scale(1);
            }
            :host(:focus) .wrapper, :host(:hover) .wrapper{
                opacity:1;
                transform:scale(1.4);
            }
            
            :host(:focus) wrapper{
                opacity:1;
            }
            .card-content{
                display:table-cell;
                vertical-align: middle;
                display: table-cell;
                background: transparent;
                text-align:center;
            }
            .appIcon{
                width: 64px;

            }
            .abbrev{
                position:absolute;
                bottom:10px;
                width:100%;
                text-align:center;
                font-size:12px;
                letter-spacing:2px;
            }
        `;
    }

    render(){
        return html`
            <paper-ripple class="circle" recenters></paper-ripple> 
            <div id="wrapper" class="wrapper">
                <div class="card-content">
                    <img class="appIcon" src="${this.icon}"/>
                    <div class="abbrev">${this.abbrev}</div>
                </div>
            </div>        
        `;
    }

    static get properties() {
        return {
            abbrev:{
                type:String
            },
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
            },
            icon:{
                type: String
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        // this.setAttribute('tabindex',-1);
        this.setAttribute('tabindex','0');
    }


    firstUpdated(changedProperties) {
        this.addEventListener('click',this._openApp);
        this.addEventListener('keyup',this._handleEnter);
        // this.shadowRoot.getElementById('wrapper').tabIndex=0;
    }


    _handleTap (e) {
//                console.log('handleTap ', e);
        e.stopPropagation();
        this._openApp();
    }


    _handleEnter(e) {
        console.log('handleEnter')
        if ( e.keyCode == 13) {
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
customElements.define('launch-button', LaunchButton);