define([
    "plugins/base",
    "plugins/util",
    "dojo/_base/declare",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/on",
    "dojo/_base/fx",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/query",
    "dojo/parser",
    "dijit/registry",
    "dojo/dom-geometry",
    "dojo/dom-form",
    "dojox/grid/DataGrid",
    "dojo/data/ObjectStore",
    "dojo/store/Memory",
    "dojo/store/Cache",
    "dojo/store/JsonRest",
    "dijit/form/CheckBox",
    "dijit/form/Select",
    "dijit/Toolbar",
    "dojox/widget/Standby",
    "dijit/Dialog",
    "dojox/fx",
    "dojox/form/Uploader",
    "dojox/form/uploader/FileList",
    "dojox/form/uploader/plugins/Flash",
],
    function(plugin, util, declare, dom, domConstruct, on, fx, lang, array, query, parser, registry, geometry, forms) {

        //todo: fix intial value for breadcrumb - currently will be updated when dblclick occurs - when using keyboard it will never updated
        /**
         * Collection browser plugin.
         */
        var klass = declare(plugin, {

            pluginName:"Collection Browser",
            store: null,
            grid: null,
            standby: null,
            collection: "/db",
            clipboard: null,
            clipboardCut: false,
            onUploadCompleteListener: null,
            editor: null,
            
            constructor: function(div) {
                this.inherited(arguments);
                var $this = this;

                this.loadCSS("plugins/browsing/browsing.css");

                // json data store
                var restStore = new dojo.store.JsonRest({ target: "plugins/browsing/contents/" });
                this.store = new dojo.data.ObjectStore({ objectStore: restStore });

                /*set up layout*/
                var layout = [[
                    {'name': 'Name', 'field': 'name', 'width': '30%'},
                    {'name': 'Permissions', 'field': 'permissions', 'width': '20%'},
                    {'name': 'Owner', 'field': 'owner', 'width': '10%'},
                    {'name': 'Group', 'field': 'group', 'width': '10%'},
                    {'name': 'Last-modified', 'field': 'last-modified', 'width': '30%'}
                ]];

                /*create a new grid:*/
                this.grid = new dojox.grid.DataGrid(
                    {
                        id: 'browsing-grid',
                        selectionMode: "multi",
                        structure: layout,
                        autoWidth: false,
                        autoHeight: false
//                    onStyleRow: function(row) { $this.styleRow(row); }
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
                        $this.openResource(item);
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

                this.grid.startup();

                this.resize();

                this.grid.domNode.focus();
                this.grid.focus.setFocusIndex(0, 0);
                this.grid.focus.focusGrid();

                on(dom.byId("browsing-toolbar-properties"), "click", lang.hitch(this, "properties"));
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

                jQuery("#browsing-upload").fileupload({
                	sequentialUploads: true,
                    dataType: "json",
                    add: function(e, data) {
                        console.log("filed: %d", data.files.length);
                        var rows = "";
                        for (var i = 0; i < data.files.length; i++) {
                            rows += "<tr>";
                            rows += "<td class='name'>" + data.files[i].name + "</td>";
                            rows +="<td>" + Math.ceil(data.files[i].size / 1024) + "k</td>";
                            rows += "<td class='error'></td>";
                            rows += "</tr>";
                        }
                        domConstruct.place(rows, dom.byId("files"), "last");
                        data.submit();
                    },
                    progressall: function (e, data) {
                        var progress = parseInt(data.loaded / data.total * 100, 10);
                        query('#file_upload .progress .bar').forEach(function(div) {
                            domStyle.set(div, "width", progress + '%');
                        });
                    },
                    done: function(e, data) {
                        //query("#files tr:first").remove();
                        query('#file_upload .progress .bar').forEach(function(div) {
                            domStyle.set(div, "width", '0%');
                        });
                    },
                    fail: function(e, data) {
                        query("#files tr:first .error").innerHTML(data.jqXHR.statusText);
                        query('#file_upload .progress .bar').forEach(function(div) {
                            domStyle.set(div, "width", '0%');
                        });
                        query("#file_upload .progress").fadeOut().play();
                    }
                });
            
//                var uploader = registry.byId("browsing-uploader");
//                this.onUploadCompleteListener = on(uploader, "complete", function() {
//                    $this.refresh();
//                    registry.byId("browsing-upload-dialog").hide();
//                });

                this.ready();
            },

            getSelected: function() {
                console.debug("getSelected");
                var items = this.grid.selection.getSelected();
                if (items.length && items.length > 0) {
                    var resources = [];
                    array.forEach(items, function(item) {
                        resources.push(item.id);
                    });
                    return resources;
                }
                return null;
            },

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
            },

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
                this.store.close();
                this.grid.setStore(this.store, { collection: this.collection });
            },

            resize: function() {
                var gridContainer = dom.byId("browsing-grid-container");
                var gridDiv = dom.byId("browsing-grid");
                var box = geometry.getContentBox(gridContainer);
                gridDiv.style.height = (box.h - gridContainer.offsetTop) + "px";
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

            styleRow: function(row) {
                var item = this.grid.getItem(row.index);
                if (item && item.isCollection) {
                    row.customClasses += " collection";
                }
                this.grid.focus.styleRow(row);
            },

            openResource: function(item) {
                if (!this.editor) {
                    this.editor = window.open("../eXide/index.html", "eXide");
                    this.editor.eXide_onload = function(eXide) {
                        eXide.findDocument(item.id);
                    };
                } else {
                    this.editor.eXide.app.findDocument(item.id);
                }
            },
            
            close: function() {
                console.log("Closing down");

                this.onUploadCompleteListener.remove();
                registry.byId("browsing-uploader").destroyRecursive();
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

        return klass;
    });