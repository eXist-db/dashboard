define([ "dojo/_base/declare", "dojo/_base/array",  "dojo/ready", "dojo/query", "dojo/_base/fx", "dijit/registry", "dojo/parser", "dojox/widget/Standby","dojo/domReady!" ],
function(declare, array, ready, query, fx, registry, parser) {
    
    /**
     * Base class for all plugins
     */
    var klass = declare(null, {

        pluginName:"No Name", /* should be overwritten by each plugin to provide a display name */
        container: null,
        standby: null,
        
        constructor: function(div) {
            this.container = div;
        },
        
        init: function() {
            parser.parse(this.container);
            this.standby = new dojox.widget.Standby({target: this.container});
            document.body.appendChild(this.standby.domNode);
            this.standby.startup();
        },
        
        /**
         * fade in the plugin. call this from the constructor once the plugin
         * has initialized its UI.
         */
        ready: function(callback) {
            // console.debug("base.ready");
            var div = query(".inline-app", this.container)[0];
            var anim = fx.fadeIn({
                node: div,
                duration: 200,
                onEnd: function() {
                    if (callback) {
                        callback();
                    }
                }
            });
            anim.play();
        },
        
        close: function() {
            this.standby.destroyRecursive();
            var widgets = registry.findWidgets(this.container);
            array.forEach(widgets, function(widget) {
                widget.destroyRecursive();
            });
            this.container.innerHTML = "";
        },
        
        actionStart: function() {
            this.standby.show();
        },
        
        actionEnd: function() {
            // console.debug("baseActionEnd");
            this.standby.hide();
        },
        
        /**
         * Dynamically load a CSS stylesheet.
         */
        loadCSS: function(path) {
            console.debug("loadCSS",path);

            //todo: check this code - still needed?
            var head = document.getElementsByTagName("head")[0];
            query("link", head).forEach(function(elem) {
                var href = elem.getAttribute("href");
                if (href === path) {
                    // already loaded
                    return;
                }
            });
            var link = document.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            link.setAttribute("href", path);
            head.appendChild(link);
        }
    });


    return klass;
});