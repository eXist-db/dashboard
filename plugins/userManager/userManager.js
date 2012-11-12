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
        "dojox/data/JsonRestStore",
        "dijit/form/CheckBox",
        "dijit/form/ComboBox",
        "dijit/Toolbar",
        "dojox/widget/Standby",
        "dojox/form/CheckedMultiSelect"
],
function(plugin, declare, dom, domStyle, on, array, query, fx, parser, registry) {


    /*
    * functions for user manager plugin
    * author: tobi krebs
    */

    return declare(plugin, {
        pluginName:"User Manager",
        usersStore: null,
        usersGrid: null,
        groupsStore: null,
        groupsGrid: null,

        constructor: function(div) {
            this.inherited(arguments);
            this.loadCSS("plugins/userManager/userManager.css");

            var $this = this;
            
            /*Stores and Layout*/
            this.usersStore = new dojox.data.JsonRestStore({target:"plugins/userManager/userManager.xql", idAttribute:"id"});

            var userslayout = [[
              {'name': 'Name', 'field': 'name', 'width': '40%%'},
              {'name': 'Groups', 'field': 'groups', 'width': '40%'},
              {'name': 'Home', 'field': 'home', 'width': '20%'}
            ]];
            
            this.groupsStore = new dojox.data.JsonRestStore({target:"plugins/userManager/groupManager.xql", idAttribute:"ident"});
            
            /*
            var groupsLayout = [[
              {'name': 'Name', 'field': 'name', 'width': '50%%'},
              {'name': 'ID', 'field': 'ident', 'width': '50%'},
            ]];
            */
            
            /* USER MANAGEMENT */
            this.usersGrid = new dojox.grid.DataGrid(
                {
                    id: 'userManager-grid',
                    store: this.usersStore,
                    structure: userslayout,
                    autoWidth: false,
                    autoHeight: 8,
                    selectionMode: "single"
                },
                document.createElement('div'));
            dojo.byId("userManager-grid-container").appendChild(this.usersGrid.domNode);
            this.usersGrid.startup();
            
            var comboBox = new dijit.form.ComboBox({
                    id: "userGroups",
                    name: "userGroups",
                    store: this.groupsStore,
                    placeHolder: "Select a group"
            }, dojo.byId("userGroups"));
            
            comboBox.startup();

            /* Doesn´t work right now as wished. Woul be nice to be able to select multiple Groups.
             * Should then replace the above ComboBox.
             */
            /*
                var checkedMultiSelect = new dojox.form.CheckedMultiSelect({
                        id: "checkedMultiSelect",
                        name: "checkedMultiSelect",
                        store: this.groupsStore,
                        multiple: true,
                        selected: null
                }, dojo.byId("test"));
                checkedMultiSelect.startup();
            */
            

            /*Users buttons*/
            query(".refreshUsers", this.container).on("click", function(ev) {
                ev.preventDefault();
                $this.refreshUsers();
            });
            
            // edit button
            query(".editUser", this.container).on("click", function(ev) {
                ev.preventDefault();
                var items = $this.usersGrid.selection.getSelected();
                
                var userName = dijit.byId("userName");
                var userHome = dijit.byId("userHome");
                var userGroups = dijit.byId("userGroups");
  
                userName.set("value", items[0].name);
                userHome.set("value", items[0].home);
                userGroups.set("value", items[0].groups);
              
                domStyle.set(dojo.byId("editUserMask"), "display", "block");
            });
            
            query(".newUser", this.container).on("click", function(ev) {
                $this.clearUserInput(true);              
                domStyle.set(dojo.byId("editUserMask"), "display", "block");
            });
            
            query(".cancelUser", this.container).on("click", function(ev) {
                $this.clearUserInput(false);
              
                domStyle.set(dojo.byId("editUserMask"), "display", "none");
            });
            
            var form = dom.byId("editUser-form");
            on(form, "submit", function(ev) {
                ev.preventDefault();
                $this.actionStart();
                dojo.xhrPost({
                    url: "plugins/userManager/userManager.xql",
                    form: form,
                    handleAs: "json",
                    load: function(data) {
                        $this.actionEnd();
                        $this.showMessage();
                        $this.refreshUsers();
                    },
                    error: function(error, ioargs) {
                        $this.actionEnd();
                        $this.showMessage("An error occurred while communicating with the server!");
                    }
                });
                
                domStyle.set(dojo.byId("editUserMask"), "display", "none");
            });
            
            /* GROUP MANAGEMENT */
            
            /*Groups List*/
            /*
            this.groupsGrid = new dojox.grid.DataGrid(
                {
                    id: 'groupsManager-grid',
                    store: this.groupsStore,
                    structure: groupsLayout,
                    autoWidth: false,
                    autoHeight: 8,
                    selectionMode: "single"
                },
                document.createElement('div'));
            dojo.byId("groupsManager-grid-container").appendChild(this.groupsGrid.domNode);
            this.groupsGrid.startup();
        
            query(".refreshGroups", this.container).on("click", function(ev) {
                ev.preventDefault();
                $this.refreshGroups();
            });
            */
            
            // edit button
            
            /*
            query(".editGroup", this.container).on("click", function(ev) {
                ev.preventDefault();
                var items = $this.groupsGrid.selection.getSelected();
                
                var groupName = dijit.byId("groupName");
                groupName.set("value", items[0].name);
                              
                domStyle.set(dojo.byId("editGroupMask"), "display", "block");
            });
            */
            
            query(".cancelGroup", this.container).on("click", function(ev) {
                dijit.byId("groupName").set("value", "");
                dijit.byId("groupManager").set("value", "");
              
                domStyle.set(dojo.byId("editGroupMask"), "display", "none");
            });
            
            query(".newGroup", this.container).on("click", function(ev) {
                var clear = false;
                
                var groupName = dijit.byId("groupName");
                
                if (groupName.get("value") !== "") {
                    alert("TODO: confirm group");
                    clear = true;
                }
                
                if (clear) {
                    groupName.set("value", "");
                    dijit.byId("groupManager").set("value", "");
                }
              
                domStyle.set(dojo.byId("editGroupMask"), "display", "block");
            });
            
            var groupform = dom.byId("editGroup-form");
            on(groupform, "submit", function(ev) {
                ev.preventDefault();
                
                
                $this.actionStart();
                dojo.xhrPost({
                    url: "plugins/userManager/groupManager.xql",
                    form: groupform,
                    handleAs: "json",
                    load: function(data) {
                        $this.actionEnd();
                        $this.showMessage();
                        $this.refreshUsers();
                    },
                    error: function(error, ioargs) {
                        $this.actionEnd();
                        $this.showMessage("An error occurred while communicating with the server!");
                    }
                });
                
                domStyle.set(dojo.byId("editGroupMask"), "display", "none");
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
        },
        
        clearUserInput: function(askUser) {
            console.debug("clearUserInput: START.");
            var userName = dijit.byId("userName");
            var userHome = dijit.byId("userHome");
            var userPassword = dijit.byId("userPassword");
            var userPasswordRepeat = dijit.byId("userPasswordRepeat");
            var reallyClear = false;
            
            
            if (askUser) {
                if ( userName.get("value") !== "" ||  userHome.get("value") !== "" || userPassword.get("value") !== "" || userPasswordRepeat.get("value") !== "") {
                    alert("TODO: Confirmation!");
                    reallyClear = true;
                }
            }
                        
            if ( !askUser || reallyClear) {
                userName.set("value", "");
                userHome.set("value", "");
                userPassword.set("value", "");
                userPasswordRepeat.set("value", ""); 
            }
            
        },
        
        showMessage: function(message) {
            var msg = query(".message", this.container);
            if (message) {
                msg[0].innerHTML = message;
            }
            var anim = msg.fadeIn();
            anim.play();
        }
        
        

    });
});