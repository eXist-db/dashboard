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
        /* dojo/data/ObjectStore",*/      /* switch from JsonRestStore to Json Rest when Dojo 1.8 is used */
        /* "dojo/store/JsonRest", */
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
     *  1) UMASK currently expressed as an Integer - need to subclass the NumberSpinner - how to do that? see: http://dojotoolkit.org/reference-guide/1.8/dijit/Declaration.html
     *  2) Add validation to form fields!
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
            //this.usersStore = new dojo.store.JsonRest({target:"plugins/userManager2/api/user", idAttribute:"user"});

            var usersLayout = [[
              {'name': 'User', 'field': 'user', 'width': '15%'},
              {'name': 'Full Name', 'field': 'fullName', 'width': '30%'},
              {'name': 'Description', 'field': 'description', 'width': '55%'}
            ]];
            
            this.usersGrid = new dojox.grid.EnhancedGrid(
                {
                    id: 'userManager-grid',
                    //store: new dojo.data.ObjectStore({objectStore: this.usersStore}),
                    store: $this.usersStore,
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
            
            this.groupsGrid = new dojox.grid.EnhancedGrid(
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
            
            //enable/disable user grid context menu items appropriately
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
                                //$this.usersStore.remove(selectedItem.user);
                                $this.usersStore.deleteItem(selectedItem);
                                $this.usersStore.save();
                            }
                        });
                    }
                }    
            });
            
            //enable/disable group grid context menu items appropriately
            on(this.groupsGrid, "RowContextMenu", function(ev){
                  var items = $this.groupsGrid.selection.getSelected();
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
                                //$this.groupsStore.remove(selectedItem.user); //TODO this doesnt seem to send a DELETE to the server?
                                $this.groupsStore.deleteItem(selectedItem);
                                $this.groupsStore.save();
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
            
            query("#saveEditedUser").on("click", function(ev) {
                var items = $this.usersGrid.selection.getSelected();
                var oldUser = items[0];
                
                $this.usersStore.changing(oldUser); //prepare to change the user
                
                var newUserData = dijit.byId("newUser-form").get("value");
                var disabled = isUserDisabled(newUserData.disabled);
                var createPersonalGroup = hasPersonalGroup(newUserData.personalGroup);
                var memberOfGroups = getMemberOfGroups(createPersonalGroup, newUserData.username);
                
                //TODO add/remove personal group!
                
                newUser.user = newUserData.username;
                newUser.fullName = newUserData.fullName;
                newUser.description = newUserData.userdescription;
                newUser.password = newUserData.password;
                newUser.disabled = disabled;
                newUser.umask = newUserData.umask;
                newUser.groups = memberOfGroups;
                
                $this.usersStore.save(); //save the updated user
            });
            
            query("#createNewUser").on("click", function(ev) {
                var newUserData = dijit.byId("newUser-form").get("value");
                var createPersonalGroup = hasPersonalGroup(newUserData.personalGroup);
                
                /* 1) create user with personal group if required? */
                var personalGroupName = newUserData.username;
                var newGroup;
                if(createPersonalGroup) {
                    
                    //callback here adds the user as a manager of their personal group
                    var fnSetGroupManager = function() {
                        setGroupManager($this.groupsStore, personalGroupName, newUserData.username);  
                    };
                    
                    //callback here creates the new user
                    var fnCreateNewUser = function() {
                        createNewUser($this.usersStore, newUserData, createPersonalGroup, fnSetGroupManager);    
                    };
                    
                    //create the personal group... and then call above callbacks on success
                    createNewGroup($this.groupsStore, personalGroupName, "Personal group for " + newUserData.username, [], fnCreateNewUser);
                    
                } else {
                
                    /* 2) otherwise, directly create the user */
                    $this.groupsStore.save(createNewUser($this.usersStore, newUserData, createPersonalGroup, null));
                }
                
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
    
    function hasPersonalGroup(sPersonalGroup) {
        //determine if the user should have a personalGroup
        var personalGroup = false;
        if(sPersonalGroup) {
            if(sPersonalGroup == "true") {
                personalGroup = true
            }
        }
        
        return personalGroup;
    };
        
    function getMemberOfGroups(hasPersonalGroup, username) {
    
        //get member of groups
        var memberOfGroups = new Array();
        var memberOfGroupsOptions = dijit.byId("memberOfGroups").domNode.options;
        for(var i = 0; i < memberOfGroupsOptions.length; i++) {
            memberOfGroups[i] = memberOfGroupsOptions[i].innerHTML;
        }
        
        //if they are to have a personal group make sure their first group is their personal group
        if(hasPersonalGroup) {
            var personalGroupName = username;
            memberOfGroups = memberOfGroups.reverse();
            memberOfGroups.push(personalGroupName);
            memberOfGroups = memberOfGroups.reverse();
        }
        
        return memberOfGroups;
    };
        
    function isUserDisabled(sDisabled) {
        var disabled = false;
        if(sDisabled) {
            if(sDisabled == "true") {
                disabled = true
            }
        }
        return disabled;
    };
    
    function createNewUser(usersStore, newUserData, createPersonalGroup, onSuccessCallback) {
        var disabled = isUserDisabled(newUserData.disabled);
        var memberOfGroups = getMemberOfGroups(createPersonalGroup, newUserData.username);
        
        User = usersStore.getConstructor();
        var newUser = new User();
        
        newUser.user = newUserData.username;
        newUser.fullName = newUserData.fullName;
        newUser.description = newUserData.userdescription;
        newUser.password = newUserData.password;
        newUser.disabled = disabled;
        newUser.umask = newUserData.umask;
        newUser.groups = memberOfGroups;
        
        usersStore.save({onComplete: onSuccessCallback});  
    };
    
    function createNewGroup(groupsStore, groupName, description, members, onSuccessCallback) {
        Group = groupsStore.getConstructor();
        newGroup = new Group();
        
        newGroup.group = groupName;
        newGroup.description = description;
        newGroup.members = members;
        
        groupsStore.save({onComplete: onSuccessCallback});  
    };
    
    function setGroupManager(groupsStore, groupName, managerUserName) {
        groupsStore.changing(newGroup); //prepare to change the group
                    
        var members = newGroup.members;
        
        //if they are already in the members list, just change them to a manager
        var exists = false;
        for(var i = 0; i < members.length; i++) {
            if(members[i].member == managerUserName) {
                members[i].isManager = true;
                exists = true;
                break;
            }
        }
        
        //if not, add them as a member and set them as a manager
        if(!exists) {
            members.push({
                member: managerUserName,
                isManager: true
            });
        }

        newGroup.members = members;
        
        groupsStore.save(); //save the updated group
    };
});