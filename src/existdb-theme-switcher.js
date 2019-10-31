// Import the LitElement base class and html helper function
import {LitElement, html, css} from '../assets/lit-element/lit-element.js';
import '../assets/@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '../assets/@polymer/paper-listbox/paper-listbox.js';
import '../assets/@polymer/paper-item/paper-item.js';


/**
 * Component to switch CSS stylesheets for theming purposes.
 *
 * Stylesheet use standard <link> elements that MUST have a 'title' attribute.
 *
 * If no stylesheet has been selected before this is used as the default stylesheet.
 *
 * Example:
 *    <code><link rel="stylesheet" href="resources/default-theme.css" title="default"/></code>
 *
 *
 *  Alternate stylesheets use rel="alternate stylesheet" and a 'title' for identification.
 *
 *  Example:
 *    <code><link rel="alternate stylesheet" href="resources/blue-theme.css" title="blue-theme"/></code>
 *
 * The component displays a list box of all <link> elements that have a 'title' and lets users select from them.
 *
 * When a selection has been made the selected stylesheets' title will be saved to a cookie named 'existdbTheme' by
 * default. Whenever the component is loaded it will check for the cookie and activate the appropriate theme.
 *
 */
class ExistdbThemeSwitcher extends LitElement {

    static get styles() {
        return css``;
    }

    render() {
        return html`
            <paper-dropdown-menu label='active theme' no-animations>
                <paper-listbox slot="dropdown-content" class="dropdown-content" selected="${this.currentTheme}" attr-for-selected="name">
                    ${this.themes.map(i => html`<paper-item @click="${this._setStyle}" name="${i.title}">${i.title}</paper-item>`)}
                </paper-listbox>
            </paper-dropdown-menu>
        `;
    }

    static get properties() {
        return {
            /**
             * list of themes
             */
            themes:{
                type: Array
            },
            currentTheme:{
                type:String,
                reflect:true
            }

        };
    }



    constructor(){
        super();
        this._loadThemes();
        this.cookieName = 'existdbTheme';
        this.currentTheme = 'default';
        this.validFor = 30;

        this._loadStyle();
    }


    firstUpdated(changedProperties) {
    }

    _loadThemes(){
        const el = document.getElementsByTagName('link');
        const allThemes = [];
        for (var i = 0; i < el.length; i++ ) {
            if (el[i].getAttribute("rel").indexOf("style") != -1 && el[i].getAttribute("title")) {
                allThemes.push(el[i]);
            }
        }
        this.themes = allThemes;
    }

    _switchStyle(s) {
/*
        this.themes.forEach(s => {
            if (s.getAttribute("rel").indexOf("style") != -1 && s.getAttribute("title")) {
                s.disabled = true;
                if (s.getAttribute("title") == s) s.disabled = false;
            }
        });
*/

        if (!document.getElementsByTagName) return;
        var el = document.getElementsByTagName("link");
        for (var i = 0; i < el.length; i++ ) {
            if (el[i].getAttribute("rel").indexOf("style") != -1 && el[i].getAttribute("title")) {
                el[i].disabled = true;
                if (el[i].getAttribute("title") == s) el[i].disabled = false;
            }
        }
    }

    _loadStyle(){
        var c = this._getStyleCookie();
        if (c && c != this.currentTheme) {
            this._switchStyle(c);
            this.currentTheme = c;
        }
    }

     _setStyle(e) {
        const s = e.target.attributes['name'].textContent;
        if (s != this.currentTheme) {
            this._switchStyle(s);
            this.currentTheme = s;
            this._setStyleCookie();
        }
    }

    _setCookie(name, value, expdays) {   // g�ltig expdays Tage
        var now = new Date();
        var exp = new Date(now.getTime() + (1000*60*60*24*expdays));
        document.cookie = name + "=" + escape(value) + ";" +
            "expires=" + exp.toGMTString() + ";" +
            "path=/";
    }

    _delCookie(name) {   // expires ist abgelaufen
        var now = new Date();
        var exp = new Date(now.getTime() - 1);
        document.cookie = name + "=;" +
            "expires=" + exp.toGMTString() + ";" +
            "path=/";
    }

    _getCookie(name) {
        var cname = name + "=";
        var dc = document.cookie;
        if (dc.length > 0) {
            var start = dc.indexOf(cname);
            if (start != -1) {
                start += cname.length;
                var stop = dc.indexOf(";", start);
                if (stop == -1) stop = dc.length;
                return unescape(dc.substring(start,stop));
            }
        }
        return null;
    }

    _setStyleCookie() {
        this._setCookie(this.cookieName, this.currentTheme, this.validFor);
    }

    _getStyleCookie() {
        return this._getCookie(this.cookieName);
    }

    _delStyleCookie() {
        delCookie(this.cookieName);
    }



}

customElements.define('existdb-theme-switcher', ExistdbThemeSwitcher);