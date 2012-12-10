define(["dijit/registry",
        "plugins/base",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/on",
        "dojo/topic",
        "dojo/aspect",
        "dojo/_base/fx",
        "dojo/parser",
        "dojo/dom-class",
        "dojo/dom-style",
        "dojo/query",
        "dojo/fx",
        "dijit/Dialog",
        "dojox/form/Uploader",
        "dojox/form/uploader/FileList",
        "dojox/form/uploader/plugins/Flash",
        "dojo/NodeList-fx"
],
function(registry,plugin, declare, lang, dom, domConstruct, on, topic, aspect, baseFx, parser, domClass, domStyle, query, fx, dialog, uploader, fileList) {


    /*
    * Functions for package manager plugin
    * author: Joern Turner
    * author: Wolfgang Meier
    */

/*
    function removeInstalledFilter(n){
        if(domClass.contains(n,"hideInstalled")){
            domClass.remove(n,"hideInstalled");
        }
    }
    function removeNotInstalledFilter(n){
        if(domClass.contains(n,"hideNotInstalled")){
            domClass.remove(n,"hideNotInstalled");
        }
    }
*/

    return declare(plugin, {

        pluginName:"Package Manager",
        detailsListener:null,
        allListener:null,
        installedListener:null,
        availableListener:null,
        uploadAppListener:null,
        escapeListener:null,
        
        constructor: function(div) {
            this.inherited(arguments);

            this.loadCSS("plugins/packageManager/packageManager.css");

            //handler for 'show details' checkbox
            this.detailsListener = on(dom.byId("details"), "click", function() {
                if(this.checked) {
                    domClass.remove(dom.byId("packageList"),"shortView");
                } else{
                    domClass.add(dom.byId("packageList"),"shortView");
                }
            });
 
            // *** handlers for filtering radios
            // handler for 'all' radio removes hide* classes
            this.allListener = on(dom.byId("all"),"click",function(){
                var packageList = dom.byId("packageList");
                if(domClass.contains(packageList,"hideInstalled")){
                    domClass.remove(packageList,"hideInstalled");
                }
                if(domClass.contains(packageList,"hideNotInstalled")){
                    domClass.remove(packageList,"hideNotInstalled");
                }
            });

            // handler to filter installed apps
            this.installedListener = on(dom.byId("installed"),"click",function(){
                var packageList = dom.byId("packageList");
                if(domClass.contains(packageList,"hideInstalled")){
                    domClass.remove(packageList,"hideInstalled");
                }
                domClass.add (packageList,"hideNotInstalled");
            });

            //handler to filter available apps
            this.availableListener = on(dom.byId("available"),"click",function(){
                var packageList = dom.byId("packageList");
                if(domClass.contains(packageList,"hideNotInstalled")){
                    domClass.remove(packageList,"hideNotInstalled");
                }
                domClass.add(packageList,"hideInstalled");
            });

            //>>>>>>>>>>> upload
            // connect the upload icon
            this.uploadAppListener = on(dom.byId("uploadApp"),"click",function(){
                var uploadDlg = registry.byId("uploadDialog");
                uploadDlg.show();
            });
            
//            var uploader = registry.byId("uploader");
//            on(uploader, "complete", lang.hitch(this, "uploadCompleted"));
            
            jQuery("#package_upload").fileupload({
        		sequentialUploads: true,
                dataType: "json",
                add: function(e, data) {
                    var rows = "";
                    for (var i = 0; i < data.files.length; i++) {
                        if (/\.xar$/i.test(data.files[i].name)) {
                            console.log("file: %o", data.files[i]);
                            rows += "<tr>";
                            rows += "<td class='name'>" + data.files[i].name + "</td>";
                            rows +="<td>" + Math.ceil(data.files[i].size / 1024) + "k</td>";
                            rows += "<td class='error'></td>";
                            rows += "</tr>";
                        } else {
                            domConstruct.place("<tr><td>Not a .xar archive: " + data.files[i].name + "</td></tr>", dom.byId("package-files"), "only");
                            return;
                        }
                    }
                    domConstruct.place(rows, dom.byId("package-files"), "last");
                    var deferred = data.submit();
                    query("#package_upload .progress").fadeIn().play();
                },
                progressall: function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    query('#package_upload .progress .bar').forEach(function(div) {
                        domStyle.set(div, "width", progress + '%');
                    });
                },
                done: function(e, data) {
                    query("#package-files tr:first").remove();
                    query('#package_upload .progress .bar').forEach(function(div) {
                        domStyle.set(div, "width", '0%');
                    });
                    query("#package_upload .progress").fadeOut().play();
                },
                fail: function(e, data) {
                    query("#package-files tr:first .error").innerHTML(data.jqXHR.statusText);
                    query('#package_upload .progress .bar').forEach(function(div) {
                        domStyle.set(div, "width", '0%');
                    });
                    query("#package_upload .progress").fadeOut().play();
                }
            });
            
            this.update();
        },
        
        initHandlers: function() {
            console.log("Init handlers");
            var self = this;
            query("#packageList li").forEach(function (app) {
                self.initToolbar(app);
            });
        },
        
        /**
         * Handle toolbar actions like uninstall etc.
         */
        initToolbar: function(app) {
            if (domClass.contains(app, "initialized")) {
                return;
            }
            var self = this;
            domClass.add(app, "initialized");
            
            on(app, "click", function() {
                query("#packageList li").forEach(function (app) {
                    domClass.remove(app, "active");
                });
                domClass.add(app, "active");
            });
            
            // handle form submit
            query("form", app).connect("onsubmit", function (ev) {
                ev.preventDefault();
                console.log("Form submitted");
                self.installOrRemove(app, this);
            });
        },


        installOrRemove: function(app, form) {
            var self = this;
            var action = query("input[name = 'action']", form).val();
            var name = query("input[name = 'abbrev']", form).val();
            var dlg = registry.byId("actionDialog");
            self.actionStart();
            if (action === "install") {
                dlg.set("title", "Install Application");
                dlg.set("content", "<p>Installing application <abbrev>" + name + "</abbrev> ...");
                self.doInstallOrRemove(form, dlg);
            } else {
                var anim = fx.wipeOut({ node: app, duration: 300 });
                aspect.after(anim, "onEnd", function() {
                    dlg.set("title", "Remove Application");
                    dlg.set("content", "<p>Removing application <abbrev>" + name + "</abbrev> ...");
                    self.doInstallOrRemove(form, dlg);
                });
                anim.play();
            }
        },

        doInstallOrRemove: function(form, dlg) {
            var self = this;
            dlg.show();
            dojo.xhrPost({
                url: "modules/install.xql",
                form: form,
                handleAs: "json",
                load: function(data) {
                    console.log("response: %o", data);
                    if (data && data.error) {
                        dlg.set("content", "<p>" + data.error + "</p>");
                    } else {
                        dlg.hide();
                        self.update();
                        topic.publish("packages-changed");
                    }
                    self.actionEnd();
                },
                error: function(error, ioargs) {
                    var message = "";
                    switch(ioargs.xhr.status) {
                        case 403:
                            message = "Permission denied. You must be a member of the dba group.";
                            break;
                        case 500:
                            message = "The server reported an error: " || error;
                            break;
                        default:
                            message = "Unknown error: " || error;
                    }
                    dlg.set("content", "<p>" + message + "</p>");
                    self.actionEnd();
                }
            });
        },
        
        /**
         * Update the list of packages.
         */
        update: function() {
            var self = this;
            
            registry.byId("uploadDialog").hide();
            var appListElement = dom.byId("packageList");
            var anim = baseFx.fadeOut({node: appListElement, duration: 200});
            aspect.after(anim, "onEnd", function() {
                query("li", appListElement).remove(".package");
                domStyle.set(appListElement, "display: none");
                domConstruct.empty(appListElement);
                dojo.xhrGet({
                    url: "plugins/packageManager/packages/?format=manager&type=local",
                    handleAs: "text",
                    load: function(data) {
                        domConstruct.place(data, appListElement, "only");
                        var anim = baseFx.fadeIn({node: appListElement, duration: 200});
                        anim.play();
                        self.initHandlers();
                        
                        dojo.xhrGet({
                            url: "plugins/packageManager/packages/?format=manager&type=remote",
                            handleAs: "text",
                            load: function(data) {
                                domConstruct.place(data, appListElement, "last");
                                self.initHandlers();
                            }
                        });
                    }
                });
            });
            anim.play();
        },
        
        uploadCompleted: function() {
            topic.publish("packages-changed");
            this.update();
        },
        
        close: function() {
            console.log("Closing down");

            this.detailsListener.remove();
            this.allListener.remove();
            this.installedListener.remove();
            this.availableListener.remove();
            this.uploadAppListener.remove();
            this.inherited(arguments);
        }

    });
});