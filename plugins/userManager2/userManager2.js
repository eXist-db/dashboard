define([ "plugins/base",
        "dojo/_base/declare", 
        "dojo/dom",
        "dojo/dom-style",
        "dojo/on",
        "dojo/_base/array",
        "dojo/query",
        "dojox/fx",
        "dojo/parser",
        "dijit/registry",
        "dojox/grid/DataGrid",
        "dijit/Toolbar",
        "dojox/data/JsonRestStore",
        "dijit/form/CheckBox",
        "dijit/form/ComboBox",
        "dijit/layout/TabContainer",
        "dijit/layout/ContentPane",
        "dijit/layout/StackContainer",
        "dijit/layout/StackController",
        "dijit/form/Button"
],
function(plugin, declare, dom, domStyle, on, array, query, fx, parser, registry) {

    /*
    * functions for user manager plugin
    * author: Adam Retter
    */

    return declare(plugin, {
        pluginName:"User Manager2",
        
        constructor: function(div) {
            this.inherited(arguments);
            this.loadCSS("plugins/userManager2/userManager2.css");

            var $this = this;
            
            /* User Store and Grid */
            this.usersStore = new dojox.data.JsonRestStore({target:"plugins/userManager2/api/user", idAttribute:"id"});

            var userslayout = [[
              {'name': 'User', 'field': 'user', 'width': '15%'},
              {'name': 'Full Name', 'field': 'fullName', 'width': '30%'},
              {'name': 'Description', 'field': 'description', 'width': '55%'}
            ]];
            
            this.usersGrid = new dojox.grid.DataGrid(
                {
                    id: 'userManager-grid',
                    store: this.usersStore,
                    structure: userslayout,
                    autoWidth: false,
                    autoHeight: true,
                    selectionMode: "single"
                },
                document.createElement('div'));
            dojo.byId("userManager-grid-container").appendChild(this.usersGrid.domNode);
            this.usersGrid.startup();
            
            /* Group Store and Grid */
            this.groupsStore = new dojox.data.JsonRestStore({target:"plugins/userManager2/api/group", idAttribute:"id"});

            var groupslayout = [[
              {'name': 'Group', 'field': 'group', 'width': '15%'},
              {'name': 'Description', 'field': 'description', 'width': '85%'}
            ]];
            
            this.groupsGrid = new dojox.grid.DataGrid(
                {
                    id: 'groupManager-grid',
                    store: this.groupsStore,
                    structure: groupslayout,
                    autoWidth: false,
                    autoHeight: true,
                    selectionMode: "single"
                },
                document.createElement('div'));
            dojo.byId("groupManager-grid-container").appendChild(this.groupsGrid.domNode);
            this.groupsGrid.startup();
            
            this.ready();
        },
    });
    
});