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

    /**
     * TODO
     *  1) deleting a user does not send a DELETE to the Server
     *  2) UMASK currently expressed as an Integer - need to subclass the NumberSpinner - how to do that? see: http://dojotoolkit.org/reference-guide/1.8/dijit/Declaration.html
     *  3) Add validation to form fields!
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
            this.usersStore = new dojox.data.JsonRestStore({target:"plugins/userManager2/api/user", idAttribute:"user"});

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
            this.groupsStore = new dojox.data.JsonRestStore({target:"plugins/userManager2/api/group", idAttribute:"group"});

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
                                $this.usersStore.deleteItem(selectedItem); //TODO this doesnt seem to send a DELETE to the server?
                                $this.usersStore.save();
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
                                $this.groupsStore.deleteItem(selectedItem); //TODO this doesnt seem to send a DELETE to the server?
                                $this.usersStore.save();
                            }
                        });
                    }
                }    
            });
            
            query("#createUser").on("click", function(ev) {
                dojo.style(dojo.byId("saveEditedUser"), "display", "none");
                dojo.style(dojo.byId("createNewUser"), "display", "block");
                setupNewUserForm($this.groupsStore);
                changePage("newUserPage");
            });
            
            query("#newUserItem").on("click", function(ev) {
                dojo.style(dojo.byId("saveEditedUser"), "display", "none");
                dojo.style(dojo.byId("createNewUser"), "display", "block");
                setupNewUserForm($this.groupsStore);
                changePage("newUserPage");
            });
            
            query("#createNewUser").on("click", function(ev) {
                var newUserData = dijit.byId("newUser-form").get("value");
                
                var hasPersonalGroup = false;
                var personalGroupName = "";
                if(newUserData.personalGroup) {
                    if(newUserData.personalGroup == "true") {
                        hasPersonalGroup = true
                        personalGroupName = newUserData.username
                    }
                }
                
                /* 1) create the personal group if required? */

                //TODO should have the groupname personalGroupName
                
                /* 2) create the user */
                
                //get member of groups
                var memberOfGroups = new Array();
                var memberOfGroupsOptions = dijit.byId("memberOfGroups").domNode.options;
                for(var i = 0; i < memberOfGroupsOptions.length; i++) {
                    memberOfGroups[i] = memberOfGroupsOptions[i].innerHTML;
                }
                
                //if they are to have a personal group make sure their first group is their personal group
                if(hasPersonalGroup) {
                    memberOfGroups = memberOfGroups.reverse();
                    memberOfGroups.push(personalGroupName);
                    memberOfGroups = memberOfGroups.reverse();
                }
                
                var disabled = false;
                if(newUserData.disabled) {
                    if(newUserData.disabled == "true") {
                        disabled = true
                    }
                }
                
                var newUser = {
                   user: newUserData.username,
                   fullName: newUserData.fullName,
                   description: newUserData.userdescription,
                   password: newUserData.password,
                   disabled: disabled,
                   umask: newUserData.umask,
                   groups: memberOfGroups
                };
                
                $this.usersStore.newItem(newUser);  //TODO does not seemt to PUT/POST to server?
                //$this.usersGrid.update(); //probably not needed?
                
                /* 3) Add the user as a group manager of their personal group */
                //TODO
                
                //if we uncomment the lines below, the new store entry doesnt seemt to show up in the grid? why?
                //reset form and move back to first form
                //resetNewUserForm();
                //changePage("userGroupPage"); 
            });
            
            query("#switchLeft").on("click", function(ev) {
        	    dijit.byId("availableGroups").addSelected(dijit.byId("memberOfGroups"));
    		});
    		
    		query("#switchRight").on("click", function(ev) {
        	    dijit.byId("memberOfGroups").addSelected(dijit.byId("availableGroups"));
    		});
            
            query("#editUserItem").on("click", function(ev) {
                dojo.style(dojo.byId("createNewUser"), "display", "none");
                dojo.style(dojo.byId("saveEditedUser"), "display", "block");
                var items = $this.usersGrid.selection.getSelected();
                if(items.length) {
                    if(!restrictedUsername(items)) {
                        setupEditUserForm(items[0], $this.groupsStore);
                        changePage("newUserPage");       
                    }
                }
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
                resetNewUserForm();
                closeMe();
            });
            
            query("#gCloseButton", this.container).on("click", function(ev) {
                closeMe();
            });
            
            query("#closeNewUser").on("click", function(ev) {
               resetNewUserForm();
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
    
    function resetNewUserForm() {
        registry.byId("username").set("value", "");
        registry.byId("fullName").set("value", "");
        registry.byId("userdescription").set("value", "");
        registry.byId("password").set("value", "");
        registry.byId("passwordRepeat").set("value", "");
        registry.byId("disabled").set("checked", false);
        registry.byId("umask").set("value", "022");
        registry.byId("personalGroup").set("checked", true);
        
        query("#availableGroups").forEach(function(node) {
            var count = node.options.length;
            for(var i = 0; i < count; i++) {
                dojo.destroy(node.options[0]); //always remove the first node, which will change as we remove nodes!
            }
        });
        registry.byId("availableGroups").set("value", []);
        
        query("#memberOfGroups").forEach(function(node) {
            var count = node.options.length;
            for(var i = 0; i < count; i++) {
                dojo.destroy(node.options[0]); //always remove the first node, which will change as we remove nodes!
            }
        });
        registry.byId("memberOfGroups").set("value", []);
    };
    
    function setupNewUserForm(groupsStore) {
        setAvailableGroups(groupsStore, {});
    };
    
    function setupEditUserForm(user, groupsStore) {
        registry.byId("username").set("value", user.user);
        registry.byId("fullName").set("value", user.fullName);
        registry.byId("userdescription").set("value", user.description);
        registry.byId("password").set("value", "password");
        registry.byId("passwordRepeat").set("value", "password");
        registry.byId("disabled").set("checked", user.disabled);
        registry.byId("umask").set("value", parseInt(user.umask).toString(8)); //need to convert from int to octal for display?

        var memberOfGroups = query("#memberOfGroups");
        dojo.forEach(user.groups, function(group) {
            if(group == user.name) {
                //tick if there is a group which we are a member of with the same name as our username
                registry.byId("personalGroup").set("checked", true);       
            }
            
            memberOfGroups.forEach(function(node){
                var option = dojo.create('option');
                option.innerHTML = group;
                option.value = group;
                node.appendChild(option);
            });
        });
        //registry.byId("memberOfGroups").set("value", user.groups);
        
        setAvailableGroups(groupsStore, user.groups);
        //registry.byId("availableGroups").set("value", []);
    };
    
    function setAvailableGroups(groupsStore, memberOfGroups) {
        var availableGroups = query("#availableGroups");
        var fnGroupsStoreItems = function(items, request) {
            items.forEach(function(item) {
                var group = item.group;
                var found = false;
                if(memberOfGroups) {
                    for(var i = 0; i < memberOfGroups.length; i++) {
                        if(group == memberOfGroups[i]) {
                            found = true;
                            break;
                        }
                    }
                }
                if(!found) {
                    availableGroups.forEach(function(node) {
                        var option = dojo.create('option');
                        option.innerHTML = group;
                        option.value = group;
                        node.appendChild(option);
                    });
                }
            });
        };
        groupsStore.fetch({onComplete: fnGroupsStoreItems});
    }
    
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