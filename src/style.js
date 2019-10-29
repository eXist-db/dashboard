





var Stil = "Standard";
var Keks = "Layout";
var Tage = 30;

// Style Switcher

function switchStyle(s) {
    if (!document.getElementsByTagName) return;
    var el = document.getElementsByTagName("link");
    for (var i = 0; i < el.length; i++ ) {
        if (el[i].getAttribute("rel").indexOf("style") != -1 && el[i].getAttribute("title")) {
            el[i].disabled = true;
            if (el[i].getAttribute("title") == s) el[i].disabled = false;
        }
    }
}

function loadStyle() {
    var c = getStyleCookie();
    if (c && c != Stil) {
        switchStyle(c);
        Stil = c;
    }
}

function setStyle(s) {
    if (s != Stil) {
        switchStyle(s);
        Stil = s;
    }
}

window.onload = loadStyle;


// Cookie-Funktionen

function setCookie(name, value, expdays) {   // g�ltig expdays Tage
    var now = new Date();
    var exp = new Date(now.getTime() + (1000*60*60*24*expdays));
    document.cookie = name + "=" + escape(value) + ";" +
        "expires=" + exp.toGMTString() + ";" +
        "path=/";
}

function delCookie(name) {   // expires ist abgelaufen
    var now = new Date();
    var exp = new Date(now.getTime() - 1);
    document.cookie = name + "=;" +
        "expires=" + exp.toGMTString() + ";" +
        "path=/";
}

function getCookie(name) {
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

function setStyleCookie() {
    setCookie(Keks, Stil, Tage);
}

function getStyleCookie() {
    return getCookie(Keks);
}

function delStyleCookie() {
    delCookie(Keks);
}


// Stylesheet f�r Netscape 4

if(document.layers)
    document.writeln("<link rel='stylesheet' type='text/css' href='/nn4.css' />");
