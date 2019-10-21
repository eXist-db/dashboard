// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';

// Extend the LitElement base class
class RepoIcon extends LitElement {

    static get styles(){
        return css`
            :host {
                display:inline-block;
                position: relative;
            }
            img{
                display: inline-block;
                width: 64px;
            }
        `;
    }

    static get properties() {
        return{
            src:{
                type:String,
                reflectToAttribute:true,
                notify:true
            }
        };
    }

    render(){
        return html`
            <img id="img" on-click="_openApp">
            <slot></slot>
        `;
    }

    firstUpdated(changedProperties) {
        this.shadowRoot.getElementById('img').src = this.src;

    }



    }
customElements.define('repo-icon', RepoIcon);