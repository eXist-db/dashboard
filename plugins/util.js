define([
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-form",
    "dojo/_base/connect",
    "dojo/on",
    "dojo/query",
    "dijit/registry",
    "dijit/Dialog",
    "dijit/form/Button",
    "dojo/_base/lang"
],
    function(dom, construct, domForm, connect, on, query, registry,Dialog,button,lang) {

        return {

            confirm: function(title, message, callback) {
                // console.debug("create new Dialog");
                var callbackToExecute = callback;
                var dialog = new Dialog({
                    title: title
                });
                var div = construct.create('div', { style: 'width: 400px;' }, dialog.containerNode, "last");
                var msg = construct.create("p", { innerHTML: message });
                div.appendChild(msg);
                var okButton = new button({
                    label: "Yes"
                });
                on(okButton, "click", lang.hitch(this, function() {
                    console.debug("execute callback and hide dialog") ;
                    dialog.hide();
                    //dialog.destroyRecursive();
                    callbackToExecute();
                }));
                div.appendChild(okButton.domNode);

                var cancelButton = new button({
                    label: "No"
                });
                on(cancelButton, "click", lang.hitch(this, function() {
                    console.debug("do nothing, simply hide dialog") ;
                    dialog.hide();
                    // dialog.destroyRecursive();
                }));
                div.appendChild(cancelButton.domNode);
                dialog.show();
            },

            message: function(title, message, label, callback) {
                if (!label || typeof label == "function") {
                    callback = label;
                    label = "Close";
                }
                var dialog = new dijit.Dialog({
                    title: title
                });
                on(dialog, "hide", function(ev) {
                    dialog.destroyRecursive();
                    if (callback) {
                        callback();
                    }
                });
                var div = construct.create('div', {
                    style: 'width: 400px;'
                }, dialog.containerNode, "last");
                var msg = construct.create("div", {
                    innerHTML: message
                });
                div.appendChild(msg);
                var closeButton = new dijit.form.Button({
                    label: label,
                    onClick: function() {
                        dialog.hide();
                    }
                });
                div.appendChild(closeButton.domNode);
                dialog.show();
            },

            input: function(title, message, controls, callback) {
                var dialog = new dijit.Dialog({
                    title: title
                });
                var div = construct.create('div', {
                    style: 'width: 400px;'
                }, dialog.containerNode, "last");
                var msg = construct.create("p", {
                    innerHTML: message
                });
                div.appendChild(msg);
                var form = construct.create("form", {
                    innerHTML: controls
                }, div, "last");
                var closeButton = new dijit.form.Button({
                    label: "Cancel",
                    onClick: function() {
                        dialog.hide();
                        dialog.destroyRecursive();
                    }
                });
                div.appendChild(closeButton.domNode);
                var okButton = new dijit.form.Button({
                    label: "Ok",
                    onClick: function() {
                        dialog.hide();
                        dialog.destroyRecursive();
                        var value = domForm.toObject(form);
                        callback(value);
                    }
                });
                div.appendChild(okButton.domNode);
                dialog.show();
            }
        };
    });