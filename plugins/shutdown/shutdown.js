define([ "plugins/base", "dojo/_base/declare", "dojo/dom", "dojo/_base/connect", "dojo/_base/array", "dojo/_base/fx", "dijit/registry", "dojo/parser" ], 
    function(plugin, declare, dom, connect, array, baseFx, registry, parser) {
    
    return declare(plugin, {

        pluginName:"Shutdown",

        constructor: function(div) {
            this.inherited(arguments);
        },
        
        init: function() {
            this.inherited(arguments);
            
            var form = dom.byId("shutdown-form");
            connect.connect(form, "onsubmit", function(e) {
                e.preventDefault();
                var message = dom.byId("shutdown-message");
                dojo.xhrGet({
                    url: "plugins/shutdown/shutdown.xql",
                    load: function(data) {
                        var anim = baseFx.fadeIn({ node: message });
                        anim.play();
                    },
                    error: function(error, ioargs) {
                        message.innerHTML = "An error occurred while communicating to the server";
                        var anim = baseFx.fadeIn({ node: message });
                        anim.play();
                    }
                });
            });
            this.ready();
        }
    });
});