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
        "dojox/data/JsonRestStore",
        "dijit/form/CheckBox",
        "dijit/form/NumberSpinner",
        "dijit/form/MultiSelect",
        "dijit/Toolbar",
        "dijit/layout/TabContainer",
        "dijit/layout/ContentPane",
        "dijit/layout/StackContainer",
        "dijit/layout/StackController",
        "dojox/widget/Standby",
        "dojox/grid/EnhancedGrid",
        "dojox/grid/enhanced/plugins/Menu",
        "dijit/Menu",
        "dijit/MenuItem"
],
function(plugin, declare, dom, domStyle, on, array, query, fx, parser, registry) {

    /*
    * functions for user manager plugin
    * author: Adam Retter
    */

    return declare(plugin, {
        pluginName:"User Manager2",
        usersStore: null,
        usersGrid: null,
        groupsStore: null,
        groupsGrid: null,
        
        constructor: function(div) {
            this.inherited(arguments);
            this.loadCSS("plugins/userManager2/userManager2.css");
        },
        
        init: function() {
            this.inherited(arguments);
            
            var $this = this;
            
            /* users */
            this.usersStore = new dojox.data.JsonRestStore({target:"plugins/userManager2/api/user", idAttribute:"id"});

            var usersLayout = [[
              {'name': 'User', 'field': 'user', 'width': '15%'},
              {'name': 'Full Name', 'field': 'fullName', 'width': '30%'},
              {'name': 'Description', 'field': 'description', 'width': '55%'}
            ]];
            
            this.usersGrid = new dojox.grid.EnhancedGrid(
                {
                    id: 'userManager-grid',
                    store: this.usersStore,
                    structure: usersLayout,
                    autoWidth: false,
                    autoHeight: 8,
                    selectionMode: "single",
                    plugins: {
                        menus: {
                            rowMenu:"userManager-grid-Menu"
                        }
                    }
                },
                document.createElement('div')
            );
            dojo.byId("userManager-grid-container").appendChild(this.usersGrid.domNode);
            this.usersGrid.startup();
            
            /* groups */
            this.groupsStore = new dojox.data.JsonRestStore({target:"plugins/userManager2/api/group", idAttribute:"id"});

            var groupsLayout = [[
              {'name': 'Group', 'field': 'group', 'width': '15%'},
              {'name': 'Description', 'field': 'description', 'width': '85%'}
            ]];
            
            this.groupsGrid = new dojox.grid.DataGrid(
                {
                    id: 'groupManager-grid',
                    store: this.groupsStore,
                    structure: groupsLayout,
                    autoWidth: false,
                    autoHeight: true,
                    selectionMode: "single",
                    plugins: {
                        menus: {
                            rowMenu:"groupManager-grid-Menu"
                        }
                    }
                },
                document.createElement('div')
            );
            dojo.byId("groupManager-grid-container").appendChild(this.groupsGrid.domNode);
            this.groupsGrid.startup();
            
            //enable/disable group grid context menu items appropriately
            on(this.usersGrid, "RowContextMenu", function(ev){
                  var items = $this.usersGrid.selection.getSelected();
                  if(items.length) {
                    var restricted = restrictedUsername(items);
                    registry.byId("editUserItem").setDisabled(restricted);
                    registry.byId("removeUserItem").setDisabled(restricted);
                  } else {
                    registry.byId("editUserItem").setDisabled(true);
                    registry.byId("removeUserItem").setDisabled(true);
                  }
            });
            
            query("#removeUserItem").on("click", function(ev){
                var items = $this.usersGrid.selection.getSelected();
                if(items.length) {
                    if(!restrictedUsername(items)) {
                        dojo.forEach(items, function(selectedItem) {
                            if(selectedItem !== null) {
                                $this.usersStore.deleteItem(selectedItem);
                            }
                        });
                    }
                }    
            });
            
            //enable/disable user grid context menu items appropriately
            on(this.groupsGrid, "RowContextMenu", function(ev){
                  var items = registry.byId("groupManager-grid").selection.getSelected();
                  if(items.length) {
                    var restricted = restrictedGroupname(items);
                    registry.byId("editGroupItem").setDisabled(restricted);
                    registry.byId("removeGroupItem").setDisabled(restricted);
                  } else {
                    registry.byId("editGroupItem").setDisabled(true);
                    registry.byId("removeGroupItem").setDisabled(true);  
                  }
            });
            
            query("#removeGroupItem").on("click", function(ev){
                var items = $this.groupsGrid.selection.getSelected();
                if(items.length) {
                    if(!restrictedGroupname(items)) {
                        dojo.forEach(items, function(selectedItem) {
                            if(selectedItem !== null) {
                                $this.groupsStore.deleteItem(selectedItem);
                            }
                        });
                    }
                }    
            });
            
            on(registry.byId("userManager-grid-Menu"), "Open", function(ev){
                console.debug("adam context menu opened"); //for debug
            });
            
            query("#createUser").on("click", function(ev) {
                changePage("newUserPage");
            });
            
            query("#newUserItem").on("click", function(ev) {
                changePage("newUserPage");
            });
            
            query("#createGroup").on("click", function(ev) {
                changePage("newGroupPage");
            });
            
            query("#newGroupItem").on("click", function(ev) {
                changePage("newGroupPage");
            });
            
            /* events */
            query(".refreshUsers", this.container).on("click", function(ev) {
                ev.preventDefault();
                $this.refreshUsers();
            });
            
            query(".refreshGroups", this.container).on("click", function(ev) {
                ev.preventDefault();
                $this.refreshGroups();
            });
            
            query("#uCloseButton", this.container).on("click", function(ev) {
                closeMe();
            });
            
            query("#gCloseButton", this.container).on("click", function(ev) {
                closeMe();
            });
            
            query("#closeNewUser").on("click", function(ev) {
               changePage("userGroupPage"); 
            });
            
            query("#closeNewGroup").on("click", function(ev) {
               changePage("userGroupPage"); 
            });
            
            this.ready();
        },
        
        close: function() {
            console.log("Closing down");
            this.inherited(arguments);
            
            usersGrid = null;
            usersStore = null;
            groupGrid = null;
            groupStore = null;
        },
        
        refreshUsers: function() {
            this.usersStore.close();
            this.usersGrid.setStore(this.usersStore);
        },
        
        refreshGroups: function() {
            this.groupsStore.close();
            this.groupsGrid.setStore(this.groupsStore);
        }
    });
    
    function closeMe() {
        console.debug("Closing UserManager2");
        console.error("TODO implement close button functionality");
        //plugin.close(); ///???
    };
    
    function changePage(pageId) {
        var stack = registry.byId("userManager2stack");
        var page = registry.byId(pageId);
        stack.selectChild(page);
    };
    
    //expects array of json user objects
    function restrictedUsername(users) {
        for(var i = 0; i < users.length; i++) {
            var username = users[i].user
            if(username == "SYSTEM" || username == "admin" || username == "guest") {
                return true;
            }
        }
        return false;
    }
    
    //expects array of json group objects
    function restrictedGroupname(groups) {
        for(var i = 0; i < groups.length; i++) {
            var groupname = groups[i].user
            if(groupname == "dba" || groupname == "guest") {
                return true;
            }
        }
        return false;
    }
});