define([ 
    "plugins/base", 
    "dojo/_base/declare", 
    "dojo/dom", 
    "dojo/_base/array", 
    "dojo/query",
    "dojo/_base/fx", 
    "dijit/registry", 
    "dojo/parser", 
    "dojox/grid/DataGrid",
    "dojo/data/ObjectStore",
    "dojo/store/JsonRest",
    "dijit/layout/TabContainer", 
    "dijit/layout/ContentPane" ], 
    function(plugin, declare, dom, array, query, baseFx, registry, parser, DataGrid, ObjectStore, JsonRest, TabContainer, ContentPane) {

        //todo: fix intial value for breadcrumb - currently will be updated when dblclick occurs - when using keyboard it will never updated
        /**
         * Scheduler plugin.
         */
        return declare(plugin, {

            pluginName:"Scheduler",
            tab: null,
            collection: "/db",
            runningStore: null,
            runningGrid: null,
            jobsStore: null,
            jobsGrid: null,
            scheduledStore: null,
            scheduledGrid: null,
            
            constructor: function(div) {
                this.inherited(arguments);
            },
            
            init: function() {
                this.inherited(arguments);
                var $this = this;

                this.loadCSS("plugins/scheduler/scheduler.css");
                this.tabContainer = registry.byId("scheduler-tab-container");
                // json data store
                var restStore = new dojo.store.JsonRest({ target: "plugins/scheduler/contents/running/" });
                console.log("Running Data: ", restStore);
                this.runningStore = new dojo.data.ObjectStore({ objectStore: restStore });
                console.log("Running Store: ", this.runningStore);

                /*set up layout*/
                var layout = [[
                    {name: 'ID', field: 'id', width: '10%'},
                    {name: 'Type', field: 'type', width: '10%'},
                    {name: 'Source', field: 'source', width: '50%'},
                    {name: 'Started', field: 'started', width: '20%'},
                    {name: 'Status', field: 'status', width: '10%'}
                ]];

                /*create a new grid:*/
                this.runningGrid = new dojox.grid.DataGrid(
                    {
                        id: 'running-xqueries-grid',
                        title: 'Running XQueries',
                        style: 'height:100%',
                        structure: layout,
                        autoWidth: false,
                        autoHeight: true,
                        escapeHTMLInData: false
                    },
                    document.createElement('div'));
                
                this.runningGrid.setStore(this.runningStore);
                
                /*append the new grid to the div*/
                this.tabContainer.addChild(this.runningGrid);

                // json data store
                var jobsRestStore = new dojo.store.JsonRest({ target: "plugins/scheduler/contents/jobs/" });
                console.log("jobs Data: ", jobsRestStore);
                this.jobsStore = new dojo.data.ObjectStore({ objectStore: jobsRestStore });
                console.log("jobs Store: ", this.jobsStore);

                /*set up layout*/
                var layout = [[
                    {name: 'ID', field: 'id', width: '10%'},
                    {name: 'Action', field: 'action', width: '10%'},
                    {name: 'Info', field: 'info', width: '50%'},
                    {name: 'Start', field: 'start', width: '30%'}
                ]];

                /*create a new grid:*/
                this.jobsGrid = new dojox.grid.DataGrid(
                    {
                        id: 'running-jobs-grid',
                        title: 'Running Jobs',
                        style: 'height:100%',
                        noDataMessage: 'There are no running jobs!',
                        structure: layout,
                        autoWidth: false,
                        autoHeight: true,
                        escapeHTMLInData: false
                    },
                    document.createElement('div'));
                
                this.jobsGrid.setStore(this.jobsStore);
                
                /*append the new grid to the div*/
                this.tabContainer.addChild(this.jobsGrid);

                // json data store
                var scheduledRestStore = new dojo.store.JsonRest({ target: "plugins/scheduler/contents/scheduled/" });
                console.log("Running Data: ", scheduledRestStore);
                this.scheduledStore = new dojo.data.ObjectStore({ objectStore: scheduledRestStore });
                console.log("Running Store: ", this.scheduledStore);

                /*set up layout*/
                var layout = [[
                    {name: 'id', field: 'id', width: '50%'},
                    {name: 'group', field: 'group', width: '10%'},
                    {name: 'triggerExpression', field: 'triggerExpression', width: '10%'},
                    {name: 'triggerState', field: 'triggerState', width: '20%'},
                    {name: 'running', field: 'running', width: '10%'}
                ]];

                /*create a new grid:*/
                this.scheduledGrid = new dojox.grid.DataGrid(
                    {
                        id: 'scheduled-xqueries-grid',
                        title: 'Scheduled Jobs',
                        style: 'height:100%',
                        noDataMessage: 'No scheduled jobs found!',
                        structure: layout,
                        autoWidth: false,
                        autoHeight: true,
                        escapeHTMLInData: false
                    },
                    document.createElement('div'));
                
                this.scheduledGrid.setStore(this.scheduledStore);

                /*append the new grid to the div*/
                this.tabContainer.addChild(this.scheduledGrid);

               //var arr = parser.instantiate([dom.byId("scheduler-tab-container")], {data-dojo-type: "dijit.layout.TabContainer"});
                this.tabContainer.watch("selectedChildWidget", function(name, oval, nval){
                   console.log("selected child changed from ", oval, " to ", nval); 
                });             

                this.ready(function() {
                    // resizing and grid initialization after plugin becomes visible
                    $this.tabContainer.startup();
                    $this.tabContainer.resize();
                });
            },

            refresh: function() {
                if (this.runningStore != null) {
                    this.runningStore.close();
//                    // json data store
//                    var restStore = new dojo.store.JsonRest({ target: "plugins/scheduler/contents/running/" });
//                    this.runningStore = new dojo.data.ObjectStore({ objectStore: restStore });
                    this.runningGrid.setStore(this.runningStore, { collection: this.collection });
                }
            },

            close: function() {
                console.log("Closing down");

                this.inherited(arguments);
                console.log("Closed");
            }
        });
        
    });