// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/iron-icons/iron-icons.js';
import '../assets/@polymer/iron-icon/iron-icon.js';
import '../assets/@polymer/paper-icon-button/paper-icon-button.js';
import '../assets/@polymer/paper-fab/paper-fab.js';

// Extend the LitElement base class
class ExistdbSwitchpage extends LitElement {

    static get styles(){
        return css`
            :host {
                display: block;
                border-radius:50%;
                background:transparent;
                color:white;
            }
            
            paper-fab{
                --iron-icon-fill-color: var(--paper-grey-50);
                --iron-icon-width:30px;
                --iron-icon-height:30px;
                --iron-icon-stroke-color:var(--paper-grey-50);
                width:60px;
                height:60px;
                color:white;                
            }
            
        `;
    }

    render(){
        return html`
            <paper-fab id="toggle" icon="${this.icon}" @click="${this._toggle}"/></paper-fab>
        `;
    }

    static get properties() {
        return {
            defaultIcon: {
                type: String
            },
            alternateIcon:{
                type: String
            },
            icon:{
                type: String
            },
            index:{
                type:Number
            }

        };
    }

    constructor(){
        super();
        this.index=0;
        this.defaultIcon = 'cloud-download';
        this.icon = this.defaultIcon;
        this.alternateIcon = 'arrow-back';
    }

    firstUpdated(changedProperties) {
        this.fab = this.shadowRoot.getElementById('toggle');
    }

    _toggle(e){
        console.log('_toggle ', e);
        const fab = this.shadowRoot.getElementById('toggle');
        if(fab.icon === this.defaultIcon){
            this.icon = this.alternateIcon;
            this.index = 1;
        }else{
            this.icon = this.defaultIcon;
            this.index = 0;
        }
        this.dispatchEvent(new CustomEvent(
            'toggle-page',
            {
                composed:true,
                bubbles:true,
                detail: {index:this.index}
            }));
    }

}
customElements.define('existdb-switchpage', ExistdbSwitchpage);