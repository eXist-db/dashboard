// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/iron-icons/iron-icons.js';
import '../assets/@polymer/iron-icons/iron-icons.js';
import '../assets/@polymer/paper-icon-button/paper-icon-button.js';
import '../assets/@polymer/paper-ripple/paper-ripple.js';

// Extend the LitElement base class
class ExistdbFavorite extends LitElement {

    static get styles(){
        return css`
            :host {
                display: block;

                --iron-icon-width:16px;
                --iron-icon-height:16px;
            }
            a{
                color:var(--existdb-text-color);
                text-decoration:none;
            }
            paper-item{
                display:grid;
                grid-template-columns:40px auto 24px;
                grid-column-gap:6px;
            }
            paper-icon-button{
                color:var(--existdb-drawer-icon-color);
            }

            img{
                width:40px;
            }

        `;
    }

    static get properties() {
        return {
            abbrev:{
                type:String
            },
            icon:{
                type:String
            },
            link:{
                type:String
            }
        };
    }

    constructor(){
        super();
        this.abbrev="";
        this.icon="";
        this.link="";
    }

    render(){
        return html`
            <a href="${this.link}" target="_blank" tabindex="-1">
                <paper-item role="menuitem">
                    <img src="${this.icon}">
                    <span class="menuitem">${this.abbrev}</span>
                    <paper-icon-button icon="remove-circle-outline" @click="${this._removeFav}"></paper-icon-button>
                    <paper-ripple></paper-ripple>
                </paper-item>
            </a>        
        `;
    }

    firstUpdated(changedProperties) {
        // this.addEventListener('click', this._openApp);

    }

    _removeFav(e){
        e.preventDefault();
        e.stopPropagation();
        console.log('removeFav ',this);

        // this.parentNode.removeChild(this);
        this.dispatchEvent(new CustomEvent('remove-favorite',
            {
                bubbles: true,
                composed: true,
                detail:
                    {
                        abbrev:this.abbrev
                    }
            }));

    }


}
customElements.define('existdb-favorite', ExistdbFavorite);