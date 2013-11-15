define([
    "plugins/base",
    "plugins/util",
    "plugins/uploader",
    "dojo/_base/declare",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/on",
    "dojo/_base/fx",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/query",
    "dojo/parser",
    "dijit/registry",
    "dojo/dom-geometry",
    "dojo/dom-form",
    "dijit/layout/ContentPane",
    "dijit/layout/StackContainer",
    "dijit/layout/StackController",
    "dojo/data/ItemFileWriteStore",
    "dojox/grid/DataGrid",
    "dojox/grid/EnhancedGrid",
    "dojox/grid/enhanced/plugins/Menu",
    "dojo/data/ObjectStore",
    "dojo/store/Memory",
    "dojo/store/Cache",
    "dojo/store/JsonRest",
    "dijit/form/CheckBox",
    "dijit/form/Select",
    "dijit/Toolbar",
    "dojox/widget/Standby",
    "dijit/Dialog",
    "dojox/fx"
],
    function(plugin, util, Uploader, declare, dom, domConstruct, domStyle, on, fx, lang, array, query, parser, registry, geometry, forms) {

        function permissionsFormatter(permissions){
            
            if(permissions) {
                return "<span class='permissionsCell'>" + permissions + "</span>";
            } else {
                return null;    
            }
        }

        //todo: fix intial value for breadcrumb - currently will be updated when dblclick occurs - when using keyboard it will never updated
        /**
         * Collection browser plugin.
         */
        return declare(plugin, {

            pluginName:"Collection Browser",
            store: null,
            grid: null,
            standby: null,
            collection: "/db",
            clipboard: null,
            clipboardCut: false,
            editor: null,
            contentHeight: 0,
            permissionsStore : null,
            permissionsGrid: null,
            aclStore: null,
            aclGrid: null,
            
            constructor: function(div) {
                this.inherited(arguments);
            },
            
            init: function() {
                this.inherited(arguments);
                var $this = this;

                this.loadCSS("plugins/browsing/browsing.css");
                
                // json data store
                var restStore = new dojo.store.JsonRest({ target: "plugins/browsing/contents/" });
                this.store = new dojo.data.ObjectStore({ objectStore: restStore });

                /*set up layout*/
                var layout = [[
                    {name: 'Name', field: 'name', width: '30%'},
                    {name: 'Permissions', field: 'permissions', width: '20%', 'formatter': permissionsFormatter},
                    {name: 'Owner', field: 'owner', width: '10%'},
                    {name: 'Group', field: 'group', width: '10%'},
                    {name: 'Last-modified', field: 'lastModified', width: '30%'}
                ]];

                /*create a new grid:*/
                this.grid = new dojox.grid.DataGrid(
                    {
                        id: 'browsing-grid',
                        selectionMode: "multi",
                        structure: layout,
                        autoWidth: false,
                        autoHeight: true,
                        onStyleRow: function(row) {
                            $this.styleRow($this.grid, row);
                        },
                        escapeHTMLInData: false
                    },
                    document.createElement('div'));
                
                this.grid.setStore(this.store, { collection: this.collection });

                on(this.grid, "rowDblClick", function(ev) {
                    var item = $this.grid.getItem(ev.rowIndex);
                    if (item.isCollection) {
                        $this.collection = item.id;
                        // console.debug("collection: ", $this.collection);
                        dom.byId("breadcrumb").innerHTML = $this.collection;
                        $this.grid.selection.deselectAll();
                        $this.grid.focus.setFocusIndex(0, 0);
                        $this.store.close();
                        $this.grid.setStore($this.store, { collection: $this.collection });
                    } else {
                        $this.openResource(item.id);
                    }
                });

                on(this.grid, "keyUp", function(e) {
                    if ($this.grid.edit.isEditing()) {
                        return;
                    }
                    if (!e.shiftKey && !e.altKey && !e.ctrlKey) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                        var idx = $this.grid.focus.rowIndex;
                        switch (e.which) {
                            case 13: // enter
                                $this.changeCollection(idx);
                                break;
                            case 8: // backspace
                                $this.changeCollection(0);
                                break;
                        }
                    }
                });

                /*append the new grid to the div*/
                dom.byId("browsing-grid-container").appendChild(this.grid.domNode);

                /* on(dom.byId("browsing-toolbar-properties"), "click", lang.hitch(this, "properties")); */
                query("#browsing-toolbar-properties").on("click", function(ev) {
                    var items = $this.grid.selection.getSelected();
                    if(items.length && items.length > 0) {
                        setupPropertiesForm(items[0], $this);
                        changePage("propertiesPage");
                    }
                });
                
                query("#saveProperties").on("click", function(ev) {
                   
                    //do we need to save basic permissions?
                    if($this.permissionsStore.isDirty()) {
                    
                        //save basic properties
                        $this.permissionsStore.save({
                            onComplete: function() {
                                
                                //do we also need to save ACEs
                                if($this.aclStore.isDirty()) {
                                    //save ACEs
                                    $this.aclStore.save({
                                       onComplete: function() {
                                           $this.grid._refresh(); //update the main grid
                                           changePage("browsingPage");
                                       } 
                                    });
                                } else {
                                    //no changes to ACEs
                                    $this.grid._refresh(); //update the main grid (as basic permissions have changed)
                                    changePage("browsingPage");
                                }
                            }
                        });
                    } else {
                    
                        //do we need to save ACEs?
                        if($this.aclStore.isDirty()) {
                            
                            //save ACEs
                            $this.aclStore.save({
                               onComplete: function() {
                                   $this.grid._refresh(); //update the main grid
                                    changePage("browsingPage");
                               } 
                            });
                        } else {
                            //no changes to ACEs
                            changePage("browsingPage");
                        }
                    }
                });
                
                query("#closeProperties").on("click", function(ev) {
                   changePage("browsingPage"); 
                });
                
                on(dom.byId("browsing-toolbar-delete"), "click", lang.hitch(this, "delete"));
                on(dom.byId("browsing-toolbar-new"), "click", lang.hitch(this, "createCollection"));

                on(dom.byId("browsing-toolbar-add"), "click", lang.hitch(this, "upload"));

                on(dom.byId("browsing-toolbar-copy"), "click", function(ev) {
                    ev.preventDefault();
                    var resources = $this.getSelected();
                    if (resources) {
                        console.log("Copy %d resources", resources.length);
                        $this.clipboard = resources;
                        $this.clipboardCut = false;
                    }
                });
                on(dom.byId("browsing-toolbar-cut"), "click", function(ev) {
                    ev.preventDefault();
                    var resources = $this.getSelected();
                    if (resources) {
                        console.log("Cut %d resources", resources.length);
                        $this.clipboard = resources;
                        $this.clipboardCut = true;
                    }
                });
                on(dom.byId("browsing-toolbar-paste"), "click", function(ev) {
                    ev.preventDefault();
                    if ($this.clipboard && $this.clipboard.length > 0) {
                        console.log("Paste: %d resources", $this.clipboard.length);
                        $this.actionStart();
                        dojo.xhrPost({
                            url: "plugins/browsing/contents" + $this.collection,
                            content: { resources: $this.clipboard, action: $this.clipboardCut ? "move" : "copy" },
                            handleAs: "json",
                            load: function(data) {
                                if (data.status != "ok") {
                                    util.message("Paste Failed!", "Some resources could not be copied.");
                                }
                                $this.refresh();
                                $this.actionEnd();
                            },
                            error: function() {
                                $this.refresh();
                                $this.actionEnd();
                            }
                        });
                    }
                });
                on(dom.byId("browsing-toolbar-reload"), "click", lang.hitch(this, "refresh"));
                on(dom.byId("browsing-toolbar-reindex"), "click", lang.hitch(this, "reindex"));
                
                new Uploader(dom.byId("browsing-upload"), lang.hitch(this, "refresh"));
                
                /* start permissions grid */
                this.permissionsStore = new dojo.data.ItemFileWriteStore({
                    data: {
                        label: "class",
                        items: [
                            {
                                "id": "User",
                                read: false,
                                write: false,
                                execute: false,
                                special: false,
                                specialLabel: 'SetUID:'
                            },
                            {
                                "id": "Group",
                                read: false,
                                write: false,
                                execute: false,
                                special: false,
                                specialLabel: 'SetGID:'
                            },
                            {
                                "id": "Other",
                                read: false,
                                write: false,
                                execute: false,
                                special: false,
                                specialLabel: 'Sticky:'
                            }
                        ]
                    },
                    clearOnClose: true
                });
    
                var permissionsLayout = [[
                  {name: 'Permission', field: 'id', width: '25%'},
                  {name: 'Read', field: 'read', width: '10%', type: dojox.grid.cells.Bool, editable: true },
                  {name: 'Write', field: 'write', width: '10%', type: dojox.grid.cells.Bool, editable: true },
                  {name: 'Execute', field: 'execute', width: '25%', type: dojox.grid.cells.Bool, editable: true },
                  {name: 'Special', field: 'specialLabel', width: '10%', editable: false },
                  {name: ' ', field: 'special', width: '15%', type: dojox.grid.cells.Bool, editable: true }
                ]];
                
                this.permissionsGrid = new dojox.grid.DataGrid(
                    {
                        id: 'permissions-grid',
                        store: this.permissionsStore,
                        structure: permissionsLayout,
                        autoWidth: false,
                        autoHeight: true,             //TODO setting to true seems to solve the problem with them being shown and not having to click refresh, otherwise 12 is a good value
                        selectionMode: "single"
                    },
                    document.createElement('div')
                );
                dojo.byId("permissions-grid-container").appendChild(this.permissionsGrid.domNode);
                this.permissionsGrid.startup();
                /* end permissions grid */
                
                /* start acl grid */
                this.aclStore = new dojo.data.ItemFileWriteStore({
                    data: {
                        label: "index",
                        identifier: "index",
                        items: []
                    },
                    clearOnClose: true
                });
    
                var aclLayout = [[
                  {name: 'Target', field: 'target', width: '20%'},
                  {name: 'Subject', field: 'who', width: '30%'},
                  {name: 'Access', field: 'access_type', width: '20%'},
                  {name: 'Read', field: 'read', width: '10%', type: dojox.grid.cells.Bool, editable: true },
                  {name: 'Write', field: 'write', width: '10%', type: dojox.grid.cells.Bool, editable: true },
                  {name: 'Execute', field: 'execute', width: '10%', type: dojox.grid.cells.Bool, editable: true }
                ]];
                
                this.aclGrid = new dojox.grid.EnhancedGrid(
                    {
                        id: 'acl-grid',
                        store: this.aclStore,
                        structure: aclLayout,
                        autoWidth: false,
                        autoHeight: true,             //TODO setting to true seems to solve the problem with them being shown and not having to click refresh, otherwise 12 is a good value
                        selectionMode: "single",
                        plugins: {
                            menus: {
                                rowMenu:"acl-grid-Menu"
                            }
                        }
                    },
                    document.createElement('div')
                );
                dojo.byId("acl-grid-container").appendChild(this.aclGrid.domNode);
                this.aclGrid.startup();
                /* end acl grid */
                
                this.ready(function() {
                    // resizing and grid initialization after plugin becomes visible
                    $this.resize();
                    $this.grid.startup();

                    $this.grid.domNode.focus();
                    $this.grid.focus.setFocusIndex(0, 0);
                    $this.grid.focus.focusGrid();
                });
            },

            getSelected: function(collectionsOnly) {
                var items = this.grid.selection.getSelected();
                if (items.length && items.length > 0) {
                    var resources = [];
                    array.forEach(items, function(item) {
                        if (!collectionsOnly || item.isCollection)
                            resources.push(item.id);
                    });
                    return resources;
                }
                return null;
            },

            /*
            properties: function() {
                var $this = this;
                var items = $this.grid.selection.getSelected();
                if (items.length && items.length > 0) {
                    var resources = [];
                    array.forEach(items, function(item) {
                        resources.push(item.id);
                    });
                    var title = resources.length == 1 ? resources[0] : "selection";
                    dojo.xhrGet({
                        url: "plugins/browsing/properties/",
                        content: { resources: resources },
                        load: function(data) {
                            var dlg = registry.byId("browsing-dialog");
                            dlg.set("content", data);
                            dlg.set("title", "Properties for " + title);
                            dlg.show();

                            var form = dom.byId("browsing-dialog-form");
                            on(form, "submit", function(ev) {
                                ev.preventDefault();
                                $this.applyProperties(dlg, resources);
                            });
                        }
                    });
                }
            },*/

            applyProperties: function(dlg, resources) {
                console.debug("applyProperties");
                var $this = this;
                var form = dom.byId("browsing-dialog-form");
                var params = forms.toObject(form);
                params.resources = resources;
                $this.actionStart();
                dojo.xhrPost({
                    url: "plugins/browsing/properties/",
                    content: params,
                    handleAs: "json",
                    load: function(data) {
                        $this.refresh();
                        $this.actionEnd();
                        if (data.status == "ok") {
                            registry.byId("browsing-dialog").hide();
                        } else {
                            util.message("Changing Properties Failed!", "Could not change properties on all resources!");
                        }
                    },
                    error: function() {
                        $this.actionEnd();
                        util.message("Server Error", "An error occurred while communicating to the server!");
                    }
                });
            },

            refresh: function() {
                if (this.store != null) {
                    this.store.close();
                    this.grid.setStore(this.store, { collection: this.collection });
                }
            },

            resize: function() {
                var box = geometry.getContentBox(query(".browsing")[0]);
                var gridDiv = dom.byId("browsing-grid-container");
                domStyle.set("browsing-grid", "height", (box.h - gridDiv.offsetTop) + "px");
            },

            changeCollection: function(idx) {
                console.debug("Changing to item %d %o", idx, this.grid);
                var item = this.grid.getItem(idx);
                if (item.isCollection) {
                    this.collection = item.id;
                    this.grid.selection.deselectAll();
                    this.store.close();
                    this.grid.setStore(this.store, { collection: this.collection });
                    this.grid.focus.setFocusIndex(0, 0);
                }
            },

            createCollection: function() {
                var $this = this;
                util.input("Create Collection", "Create a new collection",
                    "<label for='name'>Name:</label><input type='text' name='name'/>",
                    function(value) {
                        dojo.xhrPut({
                            url: "plugins/browsing/contents/" + value.name,
                            content: { "collection": $this.collection },
                            handleAs: "json",
                            load: function(data) {
                                $this.refresh();
                                if (data.status != "ok") {
                                    util.message("Creating Collection Failed!", "Could not create collection " + value.name);
                                }
                            },
                            error: function() {
                                util.message("An error occurred", "Failed to create collection " + value.name);
                            }
                        });
                    }
                );
            },

            delete: function(ev) {
                ev.preventDefault();
                var $this = this;
                var resources = $this.getSelected();
                if (resources) {
                    util.confirm("Delete Resources?", "Are you sure you want to delete the selected resources?",
                        function() {
                            $this.actionStart();
                            dojo.xhrDelete({
                                url: "plugins/browsing/contents/",
                                content: { resources: resources },
                                handleAs: "json",
                                load: function(data) {
                                    $this.refresh();
                                    $this.actionEnd();
                                    if (data.status != "ok") {
                                        util.message("Deletion Failed!", "Some resources could not be deleted.");
                                    } else {
                                        $this.grid.selection.deselectAll();
                                    }
                                },
                                error: function() {
                                    util.message("Server error!", "Error while communicating to the server.");
                                }
                            });
                        });
                }
            },

            upload: function() {
                dom.byId("browsing-upload-collection").value = this.collection;
                var uploadDlg = registry.byId("browsing-upload-dialog");
                uploadDlg.show();
            },

            reindex: function() {
                var self = this;
                var target = this.collection;
                var resources = this.getSelected(true);
                if (resources && resources.length > 0) {
                    if (resources.length > 1) {
                        util.message("Reindex", "Please select a single collection or none to reindex the current root collection");
                        return;
                    }
                    target = resources[0];
                }
                
                util.confirm("Reindex collection?", "Are you sure you want to reindex collection " + 
                    target + "?",
                    function() {
                        self.actionStart();
                        dojo.xhrPost({
                            url: "plugins/browsing/contents" + target,
                            content: { action: "reindex" },
                            handleAs: "json",
                            load: function(data) {
                                if (data.status != "ok") {
                                    util.message("Reindex Failed!", "Reindex of collection " + target + " failed");
                                }
                                self.refresh();
                                self.actionEnd();
                            },
                            error: function() {
                                self.refresh();
                                self.actionEnd();
                            }
                        });
                    });
            },
            
            styleRow: function(grid, row) {
                var item = grid.getItem(row.index);
                if(item) {
                
                    if(row.over) {
                        row.customClasses += " dojoxGridRowOver";
                    }
                    
                    if(row.selected) {
                        row.customClasses += " dojoxGridRowSelected";
                    }
                
                    if(item.isCollection) {
                        if(!row.selected) {
                            row.customClasses = "collectionRow " + row.customClasses;
                        }
                    } else {
                        row.customClasses += " dojoxGridRow";
                        if(row.odd) {
                            row.customClasses += " dojoxGridRowOdd";
                        }
                    }
                }
                grid.focus.styleRow(row);
                grid.edit.styleRow(row);
            },

            openResource: function(path) {
                var exide = window.open("", "eXide");
                if (exide && !exide.closed) {
                    
                    // check if eXide is really available or it's an empty page
                    var app = exide.eXide;
                    if (app) {
                        // eXide is there
                        exide.eXide.app.findDocument(path);

                        exide.focus();
                        setTimeout(function() {
                            if (dojo.isIE ||
                                (typeof exide.eXide.app.hasFocus == "function" && !exide.eXide.app.hasFocus())) {
                                util.message("Open Resource", "Opened code in existing eXide window.");
                            }
                        }, 200);
                    } else {
                        window.eXide_onload = function() {
                            exide.eXide.app.findDocument(path);
                        };
                        // empty page
                        var href = window.location.href;
                        href = href.substring(0, href.indexOf("/dashboard")) + "/eXide/index.html";
                        exide.location = href;
                    }
                } else {
                    util.message("Open Resource", "Failed to start eXide in new window.");
                }
            },
            
            close: function() {
                console.log("Closing down");

                // Dialog needs to be destroyed explicitely
                registry.byId("browsing-dialog").destroyRecursive();
                registry.byId("browsing-upload-dialog").destroyRecursive();
                this.store.close();
                this.grid.destroyRecursive();
                this.store = null;
                this.grid = null;

                this.inherited(arguments);
                console.log("Closed");
            }
        });
        
        function changePage(pageId) {
            var stack = registry.byId("browsingStack");
            var page = registry.byId(pageId);
            stack.selectChild(page);
        };
        
        function setupPropertiesForm(item, $this) {
            
            registry.byId("resourceName").set("value", item.name);
            registry.byId("internetMediaType").set("value", item.internetMediaType);
            registry.byId("created").set("value", item.created);
            registry.byId("lastModified").set("value", item.lastModified);
            registry.byId("owner").set("value", item.owner);
            registry.byId("group").set("value", item.group);
            
            //reload the permissions store and grid
            $this.permissionsStore.close();
            var propertiesStore = new dojo.store.Cache(
                new dojo.store.JsonRest({
                    target: "plugins/browsing/permissions/" + item.id.replace(/\//g, '...') + "/"
                }),
                new dojo.store.Memory()
            );
            $this.permissionsStore = new dojo.data.ObjectStore({
                objectStore: propertiesStore
            });
            $this.permissionsGrid.setStore($this.permissionsStore);
            
            
            //reload the acl store and grid
            $this.aclStore.close();
            var aclPropertiesStore = new dojo.store.Cache(
                new dojo.store.JsonRest({
                    target: "plugins/browsing/acl/" + item.id.replace(/\//g, '...') + "/"
                }),
                new dojo.store.Memory()
            );
            $this.aclStore = new dojo.data.ObjectStore({
                objectStore: aclPropertiesStore
            });
            $this.aclGrid.setStore($this.aclStore);

        };
    });