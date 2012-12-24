define([
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-form",
    "dojo/_base/connect",
    "dojo/query",
    "dijit/registry",
    "dijit/Dialog"
],
function(dom, construct, domForm, connect, query, registry) {
    
    return {
        
        confirm: function(title, message, callback) {
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
            var okButton = new dijit.form.Button({
                label: "Yes",
                onClick: function() {
                    dialog.hide();
                    dialog.destroyRecursive();
                    callback();
                }
            });
            div.appendChild(okButton.domNode);
            var cancelButton = new dijit.form.Button({
                label: "No",
                onClick: function() {
                    dialog.hide();
                    dialog.destroyRecursive();
                }
            });
            div.appendChild(cancelButton.domNode);

            dialog.show();
        },
        
        message: function(title, message, callback) {
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
            var closeButton = new dijit.form.Button({
                label: "Close",
                onClick: function() {
                    dialog.hide();
                    dialog.destroyRecursive();
                    if (callback) {
                        callback();
                    }
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