/*
 Copyright (c) 2012, Adam Retter
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 * Neither the name of Adam Retter Consulting nor the
 names of its contributors may be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL Adam Retter BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
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
    "dojo/data/ItemFileWriteStore",
    "dojox/data/JsonRestStore",
    /* dojo/data/ObjectStore",*/      /* switch from JsonRestStore to Json Rest when Dojo 1.8 is used */
    /* "dojo/store/JsonRest", */
    "dijit/form/CheckBox",
    "dijit/form/ComboBox",
    "dijit/form/NumberSpinner",
    "dijit/Declaration",
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

        /**
         * functions for user manager plugin
         * author: Adam Retter <adam.retter@googlemail.com>
         * date: 2013-01-22
         */

        /**
         * TODO
         *  1) Add validation to form fields!
         */


        return declare(plugin, {
            pluginName:"User Manager2",
            usersStore: null,
            usersGrid: null,
            groupsStore: null,
            groupsGrid: null,
            groupMembersStore: null,
            groupMembersGrid: null,

            constructor: function(div) {
                this.inherited(arguments);
                this.loadCSS("plugins/userManager/userManager.css");
            },

            init: function() {
                this.inherited(arguments);

                var $this = this;

                /* users */
                this.usersStore = new dojox.data.JsonRestStore({
                    target: "plugins/userManager/api/user",
                    idAttribute:"user",
                    schema: {
                        description: "JSON Schema for a User",
                        type: "object",
                        properties: {
                            user: {
                                description: "The username of the User",
                                type: "string",
                                required: true
                            },
                            fullName: {
                                description: "The full name of the User",
                                type: "string",
                                required: false
                            },
                            description: {
                                description: "A description of the User",
                                type: "string",
                                required: false
                            },
                            password: {
                                description: "The user's password",
                                type: "string",
                                required: false
                            },
                            disabled: {
                                description: "Is the user's account disabled?",
                                type: "boolean",
                                required: true
                            },
                            umask: {
                                description: "The umask of the user's account",
                                type: "integer",
                                minimum: 18,
                                maximum: 511,
                                required: true
                            },
                            groups: {
                                description: "The groups the user is a member of",
                                type: "array",
                                required: true,
                                items: {
                                    type: "string"
                                }
                            }
                        }
                    }
                });
                //this.usersStore = new dojo.store.JsonRest({target:"plugins/userManager/api/user", idAttribute:"user"});

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
                        autoHeight: true,             //TODO setting to true seems to solve the problem with them being shown and not having to click refresh, otherwise 12 is a good value
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
                this.groupsStore = new dojox.data.JsonRestStore({
                    target: "plugins/userManager/api/group",
                    idAttribute:"group",
                    schema: {
                        description: "JSON Schema for a User",
                        type: "object",
                        properties: {
                            group: {
                                description: "The name of the Group",
                                type: "string",
                                required: true
                            },
                            description: {
                                description: "A description of the Group",
                                type: "string",
                                required: false
                            },
                            members: {
                                description: "The members of the group",
                                type: "array",
                                required: true,
                                items: {
                                    type: "object",
                                    properties: {
                                        member: {
                                            description: "The name of the account which is a member of this group",
                                            type: "string",
                                            required: true
                                        },
                                        isManager: {
                                            description: "Is the member a manager of this group?",
                                            type: "boolean",
                                            required: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                });

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
                        autoHeight: true,             //TODO setting to true seems to solve the problem with them being shown and not having to click refresh, otherwise 12 is a good value
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
                        // registry.byId("editUserItem").setDisabled(restricted);
//                        registry.byId("removeUserItem").setDisabled(restricted);
                    } else {
//                    registry.byId("editUserItem").setDisabled(true);
//                    registry.byId("removeUserItem").setDisabled(true);
                    }
                });

                query("#removeUserItem").on("click", function(ev){
                    var items = $this.usersGrid.selection.getSelected();
                    if(items.length) {
                        if(!restrictedUsername(items)) {
                            dojo.forEach(items, function(selectedItem) {
                                if(selectedItem !== null) {
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
//                        registry.byId("editGroupItem").setDisabled(false);
                        var restricted = restrictedGroupname(items);
                        // registry.byId("removeGroupItem").setDisabled(restricted);
                    } else {
                        // registry.byId("editGroupItem").setDisabled(true);
//                        registry.byId("removeGroupItem").setDisabled(true);
                    }
                });

                query("#removeGroupItem").on("click", function(ev){
                    var items = $this.groupsGrid.selection.getSelected();
                    if(items.length) {
                        if(!restrictedGroupname(items)) {
                            dojo.forEach(items, function(selectedItem) {
                                if(selectedItem !== null) {
                                    $this.groupsStore.deleteItem(selectedItem);
                                    $this.groupsStore.save();
                                }
                            });
                        }
                    }
                });

                this.groupMembersStore = new dojo.data.ItemFileWriteStore({
                    data: {
                        label: "member",
                        identifier: "member",
                        items: []
                    },
                    clearOnClose: true
                });

                var groupMembersLayout = [[
                    {name: 'Username', field: 'member', width: '70%'},
                    {name: 'Group Manager', field: 'isManager', width: '30%', type: dojox.grid.cells.Bool, editable: true }
                ]];

                this.groupMembersGrid = new dojox.grid.EnhancedGrid(
                    {
                        id: 'groupMembers-grid',
                        store: this.groupMembersStore,
                        structure: groupMembersLayout,
                        autoWidth: false,
                        autoHeight: true,             //TODO setting to true seems to solve the problem with them being shown and not having to click refresh, otherwise 12 is a good value
                        selectionMode: "single",
                        plugins: {
                            menus: {
                                rowMenu:"groupMembers-grid-Menu"
                            }
                        }
                    },
                    document.createElement('div')
                );
                dojo.byId("groupMembers-grid-container").appendChild(this.groupMembersGrid.domNode);
                this.groupMembersGrid.startup();

                var comboBox = new dijit.form.ComboBox({
                    id: "newgroupmember",
                    name: "newgroupmember",
                    store: $this.usersStore,
                    searchAttr: "user"
                }, "newgroupmember");

                //enable/disable group members grid context menu items appropriately
                on(this.groupMembersGrid, "RowContextMenu", function(ev){
                    var items = $this.groupMembersGrid.selection.getSelected();
                    if(items.length) {
                        registry.byId("groupManagerItem").setDisabled(false);
                        registry.byId("removeGroupMemberItem").setDisabled(false);
                    } else {
                        // registry.byId("groupManagerItem").setDisabled(true);
                        // registry.byId("removeGroupMemberItem").setDisabled(true);
                    }
                });

                query('#groupManagerItem').on("click", function(ev) {
                    var items = $this.groupMembersGrid.selection.getSelected();
                    var item = items[0];

                    $this.groupMembersStore.fetchItemByIdentity({
                        identity: item.member,
                        onItem: function(member) {

                            //Note for some reason we seem to get an array here when I would expect an atomic value
                            //possibly a bug in Dojo ItemFileWriteDataStore? -- so handle both cases!
                            var isManager = $this.groupMembersStore.getValue(member, "isManager");
                            if(isManager.constructor === Array) {
                                $this.groupMembersStore.setValue(member, "isManager", [!isManager[0]]);
                            } else {
                                $this.groupMembersStore.setValue(member, "isManager", !isManager);
                            }

                            $this.groupMembersStore.save();
                        }
                    });
                });

                query('#removeGroupMemberItem').on("click", function(ev) {
                    var items = $this.groupMembersGrid.selection.getSelected();
                    var item = items[0];

                    $this.groupMembersStore.deleteItem(item);
                    $this.groupMembersStore.save();
                });

                query('#addGroupMember').on("click", function(ev) {
                    setupAddUserToGroupForm();
                    changePage("addUserToGroupPage");
                });

                query('#addUserToGroup').on("click", function(ev) {

                    var addUserToGroupData = dijit.byId("addUserToGroup-form").get("value");
                    var newMember = addUserToGroupData.newgroupmember;

                    var fnAddUserAndClose = function() {
                        $this.groupMembersStore.newItem({
                            member: newMember,
                            isManager: false
                        });

                        $this.groupMembersStore.save({
                            onComplete: function() {
                                $this.groupMembersGrid._refresh();
                                changePage("newGroupPage");
                            }
                        });
                    };

                    $this.groupMembersStore.fetchItemByIdentity({
                        identity: newMember,
                        onItem: function(user) {
                            if(user) {
                                //user is already a group member, dont re-add just close page
                                changePage("newGroupPage");
                            } else {
                                //user is not yet a group member, add them
                                fnAddUserAndClose();
                            }
                        },
                        onError: function() {
                            //user is not yet a group member, add them
                            fnAddUserAndClose();
                        }
                    });
                });

                query('#cancelAddUserToGroup').on("click", function(ev) {
                    changePage("newGroupPage");
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

                    var newUserData = dijit.byId("newUser-form").get("value");
                    var createPersonalGroup = hasPersonalGroup(newUserData.personalGroup);
                    var items = $this.usersGrid.selection.getSelected();
                    var oldUser = items[0];
                    var personalGroupName = oldUser.user;

                    var fnEditUser = function() {

                        $this.usersStore.changing(oldUser); //prepare to change the user

                        var disabled = isUserDisabled(newUserData.disabled);
                        var memberOfGroups = getMemberOfGroups(createPersonalGroup, oldUser.user);

                        oldUser.fullName = newUserData.fullName;
                        oldUser.description = newUserData.userdescription;

                        if(newUserData.password.length == 0 || newUserData.password == "password") {
                            oldUser.password = null;
                        } else {
                            oldUser.password = newUserData.password;
                        }
                        oldUser.disabled = disabled;
                        oldUser.umask = parseInt(newUserData.umask.toString(), 8); //need to convert from octal for display back to int
                        oldUser.groups = memberOfGroups;

                        //save the updated user
                        $this.usersStore.save({
                            onComplete: function() {
                                resetNewUserForm();
                                changePage("userGroupPage");
                            }
                        });
                    }

                    //callback here adds the user as a manager of their personal group
                    var fnSetGroupManager = function() {
                        setGroupManager($this.groupsStore, personalGroupName, oldUser.user, fnEditUser);
                    };

                    //if a personal group does not exist and the user now wants one, we must create one first
                    //and add them as a manager to that group!
                    if(createPersonalGroup) {
                        $this.groupsStore.fetchItemByIdentity({
                            identity: personalGroupName,
                            onItem: function(group) {
                                if(group) {
                                    //personal group already exists
                                    //edit the user directly
                                    fnEditUser();
                                } else {
                                    //personal group does not exist
                                    //create the personal group... and then call above callbacks on success to edit the user
                                    _createNewGroup($this.groupsStore, personalGroupName, "Personal group for " + newUserData.username, [], fnSetGroupManager);
                                }
                            },
                            onError: function() {
                                //personal group does not exist
                                //create the personal group... and then call above callbacks on success to edit the user
                                _createNewGroup($this.groupsStore, personalGroupName, "Personal group for " + newUserData.username, [], fnSetGroupManager);
                            }
                        });
                    } else {
                        //edit the user directly
                        fnEditUser();
                    }
                });

                query("#createNewUser").on("click", function(ev) {
                    var newUserData = dijit.byId("newUser-form").get("value");
                    var createPersonalGroup = hasPersonalGroup(newUserData.personalGroup);

                    //callback here changes the screen back after creating the user
                    var fnAfterCreateUser = function() {
                        resetNewUserForm();
                        changePage("userGroupPage");
                    };

                    /* 1) create user with personal group if required? */
                    var personalGroupName = newUserData.username;
                    var newGroup;
                    if(createPersonalGroup) {

                        //callback here adds the user as a manager of their personal group
                        var fnSetGroupManager = function() {
                            setGroupManager($this.groupsStore, personalGroupName, newUserData.username, fnAfterCreateUser);
                        };

                        //callback here creates the new user
                        var fnCreateNewUser = function() {
                            createNewUser($this.usersStore, newUserData, createPersonalGroup, fnSetGroupManager);
                        };

                        //create the personal group... and then call above callbacks on success
                        _createNewGroup($this.groupsStore, personalGroupName, "Personal group for " + newUserData.username, [], fnCreateNewUser);

                    } else {

                        /* 2) otherwise, directly create the user */
                        $this.groupsStore.save(createNewUser($this.usersStore, newUserData, createPersonalGroup, fnAfterCreateUser));
                    }
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
                        setupEditUserForm(items[0], $this.groupsStore);
                        changePage("newUserPage");
                    }
                });

                query("#createGroup").on("click", function(ev) {
                    dojo.style(dojo.byId("saveEditedGroup"), "display", "none");
                    dojo.style(dojo.byId("createNewGroup"), "display", "block");
                    setupNewGroupForm($this.groupMembersStore, $this.groupMembersGrid);
                    changePage("newGroupPage");
                });

                query("#newGroupItem").on("click", function(ev) {
                    dojo.style(dojo.byId("saveEditedGroup"), "display", "none");
                    dojo.style(dojo.byId("createNewGroup"), "display", "block");
                    setupNewGroupForm($this.groupMembersStore, $this.groupMembersGrid);
                    changePage("newGroupPage");
                });

                query("#editGroupItem").on("click", function(ev) {
                    dojo.style(dojo.byId("createNewGroup"), "display", "none");
                    dojo.style(dojo.byId("saveEditedGroup"), "display", "block");
                    var items = $this.groupsGrid.selection.getSelected();
                    if(items.length) {
                        setupEditGroupForm(items[0], $this.groupMembersStore, $this.groupMembersGrid);
                        changePage("newGroupPage");
                    }
                });

                query("#createNewGroup").on("click", function(ev) {
                    var newGroupData = dijit.byId("newGroup-form").get("value");

                    //callback here changes the screen back after creating the user
                    var fnAfterCreateGroup = function() {
                        resetNewGroupForm();
                        changePage("userGroupPage");
                    };

                    createNewGroup($this.groupsStore, newGroupData, $this.groupMembersStore, fnAfterCreateGroup);
                });

                query("#saveEditedGroup").on("click", function(ev) {
                    var newGroupData = dijit.byId("newGroup-form").get("value");

                    var fnAfterEditGroup = function() {
                        resetNewGroupForm();
                        changePage("userGroupPage");
                    };

                    var items = $this.groupsGrid.selection.getSelected();
                    var oldGroup = items[0];

                    $this.groupsStore.changing(oldGroup);

                    oldGroup.description = newGroupData.groupdescription;

                    getGroupMembersFromStore($this.groupMembersStore, function(members) {
                        oldGroup.members = members;
                        $this.groupsStore.save({onComplete: fnAfterEditGroup});
                    });
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
                    resetNewGroupForm();
                    closeMe();
                });

                query("#closeNewUser").on("click", function(ev) {
                    resetNewUserForm();
                    changePage("userGroupPage");
                });

                query("#closeNewGroup").on("click", function(ev) {
                    resetNewGroupForm();
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
            var stack = registry.byId("userManagerstack");
            var page = registry.byId(pageId);
            stack.selectChild(page);
        };

        function resetNewUserForm() {
            registry.byId("username").set("value", "");
            registry.byId("username").set("disabled", false);

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
            registry.byId("username").set("disabled", true);

            registry.byId("fullName").set("value", user.fullName);
            registry.byId("userdescription").set("value", user.description);
            registry.byId("password").set("value", "password");
            registry.byId("passwordRepeat").set("value", "password");
            registry.byId("disabled").set("checked", user.disabled);
            registry.byId("umask").set("value", zeroPadUmaskString(parseInt(user.umask).toString(8))); //need to convert from int to octal for display

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

            setAvailableGroups(groupsStore, user.groups);
        };

        function setupNewGroupForm(groupMembersStore, groupMembersGrid) {

            //clear the members grid
            groupMembersStore.close();
            groupMembersStore.data = {
                label: "member",
                identifier: "member",
                items: []
            };

            groupMembersStore.fetch();
            groupMembersGrid._refresh();
        };

        function setupEditGroupForm(group, groupMembersStore, groupMembersGrid) {
            registry.byId("groupname").set("value", group.group);
            registry.byId("groupname").set("disabled", true);

            registry.byId("groupdescription").set("value", group.description);

            //reload the members grid
            groupMembersStore.close();


            var groupMembers = new Array();
            for(var i = 0; i < group.members.length; i++) {
                groupMembers[i] = {
                    member: group.members[i].member,
                    isManager: group.members[i].isManager
                };
            }

            groupMembersStore.data = {
                label: "member",
                identifier: "member",
                items: groupMembers
            };

            groupMembersStore.fetch();
            groupMembersGrid._refresh();
        };

        function resetNewGroupForm() {
            registry.byId("groupname").set("value", "");
            registry.byId("groupname").set("disabled", false);

            registry.byId("groupdescription").set("value", "");
        };

        function setupAddUserToGroupForm() {
            registry.byId("newgroupmember").set("value", "");
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
                var groupname = groups[i].group
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

                var memberOfGroupsWithPersonal = new Array();
                memberOfGroupsWithPersonal[0] = personalGroupName;

                //copy from memberOfGroups to memberOfGroupsWithPersonal
                var j = 1;
                for(var i = 0; i < memberOfGroups.length; i++) {
                    if(memberOfGroups[i] != personalGroupName) {    //dont copy an existing personal group, otherwise we will have the entry twice!
                        memberOfGroupsWithPersonal[j++] = memberOfGroups[i];
                    }
                }

                memberOfGroups = memberOfGroupsWithPersonal;
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
            var newUser = new User({
                user: newUserData.username,
                fullName: newUserData.fullName,
                description: newUserData.userdescription,
                password: newUserData.password,
                disabled: disabled,
                umask: parseInt(newUserData.umask.toString(), 8), //need to convert from octal for display back to int
                groups: memberOfGroups
            });

            usersStore.save({onComplete: onSuccessCallback});
        };

        function getGroupMembersFromStore(groupMembersStore, fnMembersCallback) {
            var fnGroupMembersStoreItems = function(items, request) {
                var members = new Array();

                for(var i = 0; i < items.length; i++) {

                    //Note for some reason we seem to get an array here when I would expect an atomic value
                    //possibly a bug in Dojo ItemFileWriteDataStore? -- so handle both cases!
                    var member;
                    if(items[i].member.constructor === Array) {
                        member = items[i].member[0];
                    } else {
                        member = items[i].member;
                    }

                    //Note for some reason we seem to get an array here when I would expect an atomic value
                    //possibly a bug in Dojo ItemFileWriteDataStore? -- so handle both cases!
                    var isManager;
                    if(items[i].isManager.constructor === Array) {
                        isManager = items[i].isManager[0];
                    } else {
                        isManager = items[i].isManager;
                    }

                    members[i] = {
                        member: member,
                        isManager: isManager
                    };
                }

                fnMembersCallback(members);
            };

            groupMembersStore.fetch({onComplete: fnGroupMembersStoreItems});
        }

        function createNewGroup(groupsStore, newGroupData, groupMembersStore, onSuccessCallback) {
            getGroupMembersFromStore(groupMembersStore, function(members){
                _createNewGroup(groupsStore, newGroupData.groupname, newGroupData.groupdescription, members, onSuccessCallback);
            });
        };

        function _createNewGroup(groupsStore, groupName, description, members, onSuccessCallback) {
            Group = groupsStore.getConstructor();
            newGroup = new Group({
                group: groupName,
                description: description,
                members: members
            });

            groupsStore.save({onComplete: onSuccessCallback});
        };

        function setGroupManager(groupsStore, groupName, managerUserName, onSuccessCallback) {

            groupsStore.fetchItemByIdentity({
                identity: groupName,
                onItem: function(group) {

                    groupsStore.changing(group); //prepare to change the group

                    var members = group.members;

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

                    group.members = members;

                    groupsStore.save({onComplete: onSuccessCallback}); //save the updated group
                }
            });
        };
    });

function octalAdjust(val, delta, constraints) {
    var tc = constraints,
        v = isNaN(val),
        gotMax = !isNaN(tc.max),
        gotMin = !isNaN(tc.min)
        ;
    if(v && delta != 0){ // blank or invalid value and they want to spin, so create defaults
        val = (delta > 0) ?
            gotMin ? tc.min : gotMax ? tc.max : 0 :
            gotMax ? constraints.max : gotMin ? tc.min : 0
        ;
    }

    var newval;
    var sVal = val.toString();
    var ews = sVal.indexOf("7", sVal.length - 1) != -1; //ends with a 7?
    var ewss = sVal.length >= 2 && sVal.indexOf("77", sVal.length - 2) != -1; //ends with a 77?
    var ewz = sVal.indexOf("0", sVal.length - 1) != -1; //ends with a 0?
    var ewzz = sVal.length >= 2 && sVal.indexOf("00", sVal.length - 2) != -1; //ends with a 00?

    //calulate integer for octal number representation
    if(delta == 1) {
        if(ewss) {
            newval = val + 23;
        } else if(ews) {
            newval = val + 3;
        } else {
            newval = val + 1;
        }
    } else if(delta == -1) {
        if(ewzz) {
            newval = val - 23;
        } else if(ewz) {
            newval = val - 3;
        } else {
            newval = val - 1;
        }
    }

    if(v || isNaN(newval)){ return val; }
    if(gotMax && (newval > tc.max)){
        newval = tc.max;
    }
    if(gotMin && (newval < tc.min)){
        newval = tc.min;
    }

    return zeroPadUmaskString(newval.toString());
};

function zeroPadUmaskString(umask) {
    if(umask.length < 2) {
        return "00" + umask;
    } else if(umask.length < 3) {
        return "0" + umask;
    } else {
        return umask;
    }
};
