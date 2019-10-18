// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';

// Extend the LitElement base class
class RepoApp extends LitElement {
    static get styles(){
        return css`
            :host {
                display: block;
                /*border:thin solid blue;*/
                position: relative;
                cursor:pointer;
            }
            :focus{
                border:none;
                outline:0;

                box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
                0 3px 14px 2px rgba(0, 0, 0, 0.12),
                0 5px 5px -3px rgba(0, 0, 0, 0.4);
                background:white;

                /*margin:10px 0;*/
            }

            :host(.update) packagemanager-app ::slotted(repo-version){
                display: none;
            }
        `;
    }

    render(){
        if(this._isLauncher()){
            return html`
                <launcher-app id="launcherItem" path="${this.path}" type="${this.type}" status="${this.status}">
                    <slot></slot>
                    <slot name="icon"></slot>
                </launcher-app>        
            `;
        }else {
            return html`
                <packagemanager-app type="${this.type}"
                                    abbrev="${this.abbrev}"
                                    version="${this.version}"
                                    action="${this.action}"
                                    status="${this.status}"
                                    installed="${this.installed}"
                                    available="${this.available}"
                                    url="${this.url}"
                                    package-title="${this.packageTitle}"
                                    path="${this.path}"
                                    readonly="${this.readonly}">
                    <slot></slot>
                </packagemanager-app>
            `;
        }
    }

    static get properties() {
        return {
            type: {
                type: String
            },
            abbrev: {
                type: String
            },
            version: {
                type: String
            },
            action: {
                type: String
            },
            status: {
                type: String
            },
            installed: {
                type: String
            },
            available: {
                type: String
            },
            url: {
                type: String
            },
            packageTitle: {
                type: String
            },
            path: {
                type: String
            },
            readonly: {
                type: String
            }
        }
    }


    _isLauncher() {
//                console.log('RepoApp connected parent ', this.parentNode.parentNode);
        if(this.parentNode.parentNode.getAttribute('type') == 'launcher') {
            return true;
        }else{
            return false;
        }
    }

/*
    _isPackageManager() {
        if(this.parentNode.parentNode.getAttribute('type') == 'packagemanager') {
            return true;
        }else{
            return false;
        }
    }
*/

}
// Register the new element with the browser.
customElements.define('repo-app', RepoApp);