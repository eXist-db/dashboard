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
        "dojox/widget/Standby"
    ], 
    function(plugin, declare, dom, on, array, query, fx, parser, registry) {
    
    /**
     * Backup plugin. View available backups or trigger a new one.
     */
    return declare(plugin, {
        pluginName:"Backup Central",

        store: null,
        grid: null,
    
        constructor: function(div) {
            this.inherited(arguments);
        },
        
        init: function() {
            this.inherited(arguments);
            this.loadCSS("plugins/backup/backup.css");
            
            var $this = this;
            
            // json data store
            this.store = new dojox.data.JsonRestStore({target:"plugins/backup/backup.xql", idAttribute:"id"});
            
            /*set up layout*/
            var layout = [[
              {'name': 'Name', 'field': 'name', 'width': '40%%'},
              {'name': 'Created', 'field': 'created', 'width': '40%'},
              {'name': 'Incremental', 'field': 'incremental', 'width': '20%'}
            ]];
        
            /*create a new grid:*/
            this.grid = new dojox.grid.DataGrid(
                {
                    id: 'backup-grid',
                    store: this.store,
                    structure: layout,
                    autoWidth: false,
                    autoHeight: 8,
                    selectionMode: "single"
                },
                document.createElement('div'));
            
            /*append the new grid to the div*/
            dojo.byId("backup-grid-container").appendChild(this.grid.domNode);
            
            this.grid.startup();
            
            /* connect the refresh button */
            query(".refresh", this.container).on("click", function(ev) {
                ev.preventDefault();
                $this.refresh();
            });
            /* download button */
            query(".download", this.container).on("click", function(ev) {
                ev.preventDefault();
                var items = $this.grid.selection.getSelected();
                var href = window.location.href;
                href = href.replace(/^(.*)\/exist\/(.*)\/[^\/]*$/, "$1/exist/rest/db/$2");
                window.location.href = href + "/plugins/backup/backup.xql?action=retrieve&archive=" + items[0].name;
            });
            
            var form = dom.byId("backup-form");
            on(form, "submit", function(e) {
                e.preventDefault();
                $this.actionStart();
                dojo.xhrPost({
                    url: "plugins/backup/backup.xql",
                    form: form,
                    handleAs: "json",
                    load: function(data) {
                        $this.actionEnd();
                        $this.showMessage();
                        $this.refresh();
                    },
                    error: function(error, ioargs) {
                        $this.actionEnd();
                        $this.showMessage("An error occurred while communicating with the server!");
                    }
                });
            });
            
            this.ready();
        },
        
        close: function() {
            this.inherited(arguments);
            
            grid = null;
            store = null;
        },
        
        refresh: function() {
            this.store.close();
            this.grid.setStore(this.store);
        },
        
        showMessage: function(message) {
            var msg = query(".message-info", this.container);
            if (message) {
                msg[0].innerHTML = message;
            }
            var anim = msg.fadeIn();
            anim.play();
        }
    });
});