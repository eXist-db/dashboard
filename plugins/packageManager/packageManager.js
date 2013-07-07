define(["dijit/registry",
        "plugins/base",
        "plugins/util",
        "plugins/uploader",
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
        "dojo/NodeList-fx"
],
function(registry, plugin, util, Uploader, declare, lang, dom, domConstruct, on, topic, aspect, baseFx, parser, domClass, domStyle, query, fx, dialog) {


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
        },
        
        init: function() {
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

            var uploader = new Uploader(dom.byId("package-upload"), lang.hitch(this, "uploadCompleted"));
            
            var self = this;
            
            //>>>>>>>>>>> upload
            // connect the upload icon
            this.uploadAppListener = on(dom.byId("uploadApp"),"click",function(){
                uploader.clear();
                var uploadDlg = registry.byId("package-upload-dialog");
                uploadDlg.show();
            });
            
            this.update();
        },
        
        initHandlers: function() {
            var self = this;
            query("#packageList li").forEach(function (app) {
                self.initToolbar(app);
                query(".show-changes", app).connect("onclick", function (ev) {
                    var changes = query(".changes", app)[0];
                    util.message("Changes in " + this.getAttribute("data-version"), changes.innerHTML, "OK");
                });
            });
        },
        
        /**
         * Handle toolbar actions like uninstall etc.
         */
        initToolbar: function(app) {
            // console.debug("initToolbar");
            if (domClass.contains(app, "initialized")) {
                return;
            }
            var self = this;
            domClass.add(app, "initialized");
            
/*
            on(app, "click", function() {
                query("#packageList li").forEach(function (app) {
                    domClass.remove(app, "active");
                });
                domClass.add(app, "active");
            });
*/

            // handle form submit
            query("form", app).connect("onsubmit", function (ev) {
                // console.debug("form.onsubmit ");
                ev.preventDefault();
                //console.log("Form submitted");
                self.installOrRemove(app, this);
            });
        },


        installOrRemove: function(app, form) {
            // console.debug("packageManager.installOrRemove");
            var self = this;
            var myApp = app;
            var action = query("input[name = 'action']", form).val();
            var name = query("input[name = 'abbrev']", form).val();
            var dlg = registry.byId("actionDialog");
            if (action === "install") {
                self.actionStart();
                dlg.set("title", "Install Application");
                dlg.set("content", "<p>Installing application <abbrev>" + name + "</abbrev> ...");
                var note = query(".installation-note", app)[0];
                if (note) {
                    util.message("Installation Note", note.innerHTML, "Continue", function() {
                        self.doInstallOrRemove(form, dlg);
                    });
                } else {
                    self.doInstallOrRemove(form, dlg);
                }
            } else {
                util.confirm("Remove package", "Are you sure you want to remove package " + name + "?",
                    function() {
                        self.actionStart();
                        var anim = fx.wipeOut({ node: myApp , duration: 300 });
                        aspect.after(anim, "onEnd", function() {
                            dlg.set("title", "Remove Application");
                            dlg.set("content", "<p>Removing application <abbrev>" + name + "</abbrev> ...");
                            self.doInstallOrRemove(form, dlg);
                        });
                        anim.play();
                });
            }
        },

        doInstallOrRemove: function(form, dlg) {
           // console.debug("doInstallOrRemove: form: ",form, " dlg:",dlg);
            var self = this;
            dlg.show();
            dojo.xhrPost({
                url: "modules/install.xql",
                form: form,
                handleAs: "json",
                load: function(data) {
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
            // console.debug("packageManager.update");
            var self = this;
            
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
                                query("li", appListElement).forEach(function (app) {
                                    var name = app.getAttribute("data-name");
                                    var update = app.getAttribute("data-update");
                                    if (name && update) {
                                        app.parentNode.removeChild(app);
                                        query("li[data-name='" + name + "']", appListElement).forEach(function(old) {
                                            domConstruct.place(app, appListElement, "first");
                                        });
                                    }
                                });
                                self.initHandlers();
                            }
                        });
                    }
                });
            });
            anim.play();
        },
        
        uploadCompleted: function(errorsFound) {
            var upload = registry.byId("package-upload-dialog");
            if (upload && !errorsFound) {
                upload.hide();
            }
            topic.publish("packages-changed");
            this.update();
        },
        
        close: function() {
            console.log("Closing down");

            registry.byId("package-upload-dialog").destroyRecursive();
            
            this.detailsListener.remove();
            this.allListener.remove();
            this.installedListener.remove();
            this.availableListener.remove();
            this.uploadAppListener.remove();
            this.inherited(arguments);
        }

    });
});