define([
        "plugins/base",
        "dojo/_base/declare", 
        "dojo/dom",
        "dojo/on",
        "dojo/_base/array",
        "dojo/query",
        "dojox/fx",
        "dojo/parser",
        "dijit/registry",
        "dojox/grid/DataGrid",
        "dojox/data/JsonRestStore",
        "dijit/form/CheckBox",
        "dijit/Toolbar",
        "dojox/widget/Standby",
        "dijit/layout/TabContainer",
        "dijit/layout/ContentPane"
    ], 
    function(plugin, declare, dom, on, array, query, fx, parser, registry) {
    
    /**
     * Profiling plugin.
     */
    return declare(plugin, {
    
        constructor: function(div) {
            this.inherited(arguments);
        },
        
        init: function() {
            this.inherited(arguments);
            this.loadCSS("plugins/profiling/profiling.css");
            
            var $this = this;
            
            this.ready();
        },
        
        close: function() {
            this.inherited(arguments);
        },
        
        refresh: function() {
        }
    });
});