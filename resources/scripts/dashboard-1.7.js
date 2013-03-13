require(["dijit/registry",
    "dojo/aspect",
    "dojo/on",
    "dojo/keys",
    "dojo/dom-construct",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/topic",
    "dojo/query",
    "dojo/dom-class",
    "dojo/_base/event",
    "dojo/_base/fx",
    "dijit/Dialog",
    "dijit/TooltipDialog",
    "dojox/fx/flip",
    "dojo/fx/easing",
    "dojo/fx",
    "dojo/dnd/Source",
    "dojo/ready",
    "dijit/popup",
    "dijit/form/Form",
    "dojo/_base/xhr",
    "dijit/form/ValidationTextBox",
    "dijit/form/DropDownButton",
    "dojo/NodeList-manipulate",
    "dojo/NodeList-fx"],
    function (registry, aspect, on, keys, domConstruct, dom, domStyle, topic, query, domClass, event, baseFx, dialog, tooltip, flip, easing, fx, source, ready, popup, form,xhr) {

        var openPlugin = null;
        var openPopup = null;
        var login = null;
        var callbackFunction = null;
        var updating = false;
        var hasFocus = true;

        // ##################### opening an app group ##########################
        // ##################### opening an app group ##########################
        // ##################### opening an app group ##########################
        var running = false; //flag used with animations to prevent them from being interrupted by new events

        /**
         * Check if user is logged in and a member of the dba group.
         */
        function requireLogin(callback) {
            if (!login) {
                status("Please login. You must be a member of the dba group for most actions.");
                registry.byId("user").openDropDown();
                query("#login-form input[name='user']")[0].focus();
                callbackFunction = callback;
            } else
                callback();
        }

        /*
         This function opens/closes app groups. It will fadeOut all li items but the one the user clicked and
         insert the hidden <ul> which is a child of the same <li> as a following sibling into the top list.
         */
        function toggleAppGroup(n){
            n.focus();
            if(!running){
                running=true;

                var appListElement= dom.byId("appList");
                var parentitem = dom.byId(n.parentNode.id); //we're fired from a button below <li>. Step up to get the list item

                if(domClass.contains(appListElement,"appGroupOpen")){
                    //go back to home screen (or parent group)
                    query("#appList > li").forEach(function(selectTag){
                        // hide all list items but the current one
                        if(selectTag != parentitem){
                            domStyle.set(selectTag,"opacity","0");
                            domStyle.set(selectTag,"display","inline-block");

                            var anim1 = baseFx.fadeIn({
                                node:selectTag,
                                duration:300,
                                onBegin:function(){
                                    domStyle.set(selectTag, {
                                        height: "150px",
                                        marginTop: "15px",
                                        marginBottom: "15px"
                                    });

                                },
                                onEnd:function(){
                                    running=false;
                                }

                                /*
                                 onEnd:function(){
                                 domStyle.set(selectTag,"display","inline-block");
                                 }
                                 */

                            });
                            anim1.play();
                        }
                    });
                    domClass.destroy(appListElement,"appGroupOpen");

                    var openGroup = query("#appList > .appGroup")[0];
                    var openGroupList = query("#appList > .appGroup > ul")[0];
                    //hide
                    domStyle.set(openGroupList,"display","none");
                    //move group back
                    domConstruct.place(openGroupList,parentitem,0);
                    domConstruct.destroy(openGroup);
                }else{
                    // hide all list items to give place for grouped apps
                    query("#appList > li").forEach(function(selectTag){
                        if(selectTag != parentitem){
                            var anim1 = baseFx.fadeOut({
                                node:selectTag,
                                duration:200
                            });
                            var anim2 = baseFx.animateProperty({
                                node: selectTag,
                                properties: {
                                    height: {start: 150, end: 0, unit: "px"},
                                    marginTop:{start:15,end:0, unit:"px"},
                                    marginBottom:{start:15,end:10, unit:"px"}
                                },
                                duration: 300  ,
                                onEnd:function() {
                                    running=false;
                                }
                            });
                            fx.combine([anim1,anim2]).play();
                        }
                    });

                    // remember we are in an app group - store value on outermost ul 'appList'
                    domClass.add(appListElement,"appGroupOpen");

                    //place and show group contents
                    //prepare a <li class="appGroup"> to hold the sublist
                    // var groupListItem = domConstruct.create("li",{class:"appGroup"});
                    var groupListItem = domConstruct.create("li",{className:"appGroup"});
                    domConstruct.place(groupListItem, parentitem, "after");

                    //look for <ul> below current appGroupItem (the one that called this function) - should be present and hidden with style="display:none;"
                    var appGroupContent = query("> ul",parentitem)[0];
                    domConstruct.place(appGroupContent, groupListItem, 0);
                    domStyle.set(appGroupContent,"display","inline-block");
                }
            }

        }

        function updateInstalledApps() {
            if (updating)
                return;
            updating = true;
            status("Retrieving list of installed apps ...");
            var appListElement = dom.byId("appList");
            var anim = query("li.package", appListElement).fadeOut({duration: 200});
            aspect.after(anim, "onEnd", function() {
                query("li", appListElement).remove(".package");
                var appListElementTmp = appListElement;
                xhr.get({
                    url: "plugins/packageManager/packages/?plugins=true&format=all&type=local",
                    handleAs:"text",
                    load: function(data){
                        // console.debug("init tooltips done  ", data);
                        // var last = query("li", appListElement);

                        domConstruct.place(data, appListElement, "last");
                        query("#appList li").forEach(function (app) {
                            initTooltips(app);
                        });
                        // console.debug("init tooltips done ");

                        var anim = query("#appList li").fadeIn();
                        anim.play();
                        hideStatus();
                        // console.debug("anim and hide status done");

                        //attach click handler to application buttons

                        query("#appList li > button").on("click",function(ev) {
                            // console.debug("add on click handler");
                            ev.preventDefault();
                            //todo: handle the opening of the app
                            var link = this.getAttribute("data-exist-appurl");
                            if (link.lastIndexOf("plugin:", 0) == 0) {
                                // inline app
                                link = link.substring(7);
                                var login = this.getAttribute("data-exist-requirelogin");
                                if (login == "true") {
                                    requireLogin(function() {
                                        openInline(link);
                                    });
                                } else {
                                    openInline(link);
                                }
                            } else {
                                window.open(link);
                            }
                        });
                        updating = false;

                    },
                    error: function(error, ioargs) {
                        // console.dirxml(error); 
                        console.debug("error:", error, " ioargs:",ioargs);
                        updating = false;
                        status("Error while retrieving package list");
                    }
                });
            });
            anim.play();
        }

        /**
         * Initialize the tooltips showing app details and
         * providing access to install/remove actions.
         */
        function initTooltips(app) {
            var details = query(".details", app);
            if (details.length == 0)
                return;
            var dlg = new dijit.TooltipDialog({
                content: details,
                onMouseLeave: function() {
                    popup.close(dlg);
                    openPopup = null;
                }
            });
            // display tooltip on mouseenter
            query("button", app).connect("onmouseenter", function() {
                popup.open({
                    popup: dlg,
                    around: this
                });
                openPopup = dlg;
            });
            // handle form submit
            details.query("form").connect("onsubmit", function (ev) {
                ev.preventDefault();
                var form = this;
                popup.close(dlg);
                openPopup = null;
                requireLogin(function() {
                    installOrRemove(app, form);
                });
            });
        }

        function showDetails(evt) {
            console.debug("showDetails for target: ", this);
            var details = query(".details", this);
            var dlg = registry.byId("detailsDialog");
            dlg.set("content", details[0].innerHTML);
            query("#detailsDialogContent form").connect("onsubmit", function(ev) {
                ev.preventDefault();

                dlg.set("content", "<p>Installing ...");
            });
            dlg.show();
//            popup.open({parent:evt.target,popup:dlg, around:dom.byId(evt.target.id)});
//          popup.open({popup:dlg, x: evt.pageX, y: evt.pageY});
        }

        function openInline(name) {
            var link = "plugins/" + name + "/" + name + ".html";
            var container = dom.byId("inlineApp");
            domConstruct.empty(container);
            xhr.get({
                url: link,
                load: function(data) {
                    domConstruct.place(data, container, "only");
                    require([ "plugins/" + name + "/" + name], function(Plugin) {
                        var plugin = new Plugin(container, this);
                        plugin.init();
                        openPlugin = plugin;
                        dom.byId("inlineAppTitle").innerHTML = openPlugin.pluginName;
                    });
                }
            });
            domStyle.set("appList","display","none");
            domStyle.set("inlineAppArea","display","inline-block");
        }

        function closeApp() {
            if (openPlugin) {
                openPlugin.close();
                openPlugin = null;
            }
            domStyle.set("appList","display","inline-block");
            domStyle.set("inlineAppArea","display","none");

        }

        function status(message) {
            var status = dom.byId("status");
            domStyle.set(status, "display", "block");
            status.innerHTML = message;
        }

        function hideStatus() {
            domStyle.set("status", "display", "none");
        }

        function upload() {
            if (openPopup)
                popup.close(openPopup);
            registry.byId("uploadDialog").show();
        }

        ready(function() {
            console.debug("ready");

            // ############## routines to handle eXist app card #####################
            // ############## routines to handle eXist app card #####################
            // ############## routines to handle eXist app card #####################
            aspect.after(dom.byId("repoConfigIcon"), "onclick", function(e){
                var existIconNode = dom.byId("existIcon");
                var anim;
                if(domClass.contains(existIconNode,"backside")){
                    console.debug("to front side");
                    anim = dojox.fx.flip({
                        node: existIconNode,
                        dir: "right",
                        depth: 0.5,
                        duration:400,
                        onEnd:domClass.toggle(existIconNode, "backside")
                    });
                } else {
                    console.debug("to back side");
                    anim = dojox.fx.flip({
                        node: existIconNode,
                        dir: "left",
                        depth: 0.5,
                        duration:400,
                        onEnd:domClass.toggle(existIconNode, "backside")
                    });
                }
                anim.play();
            });

//            on(dom.byId("addAppIcon"),"click",function(){
//                var uploadDlg = registry.byId("uploadDialog");
//                uploadDlg.show();
//            });

            /*
             todo:global close handler for open group
             aspect.after(dojo.document,"onclick",function(e){
             console.debug("click anywhere",e);
             var appListItem = dom.byId("appList");
             //if some app group is open close it
             if(dojo.containsClass(appListItem,"appGroupOpen")){
             var openGroup = query(".appGroupOpen")[0];
             console.debug("open group: ", openGroup);
             toggleAppGroup(openGroup);
             domConstruct.remove(appListItem,"appGroupOpen");
             e.preventDefault();
             e.stopPropagation();
             }
             });
             */

            // Login and logout
            login = registry.byId("user").get("label"); // get current user
            console.log("Login: %s", login);
            if (login == "Not logged in") {
                login = null;
            }
            if (login) {
                domStyle.set("login-dialog-form", "display", "none");
                domStyle.set("login-dialog-logout", "display", "block");
            }
            var form = dom.byId("login-form");
            on(form, "submit", function(e) {
                e.preventDefault();
                login = query("input[name='user']", form).val();
                dom.byId("login-message").innerHTML = "Contacting server...";
                xhr.post({
                    url: "login",
                    form: form,
                    handleAs: "json",
                    load: function(data) {
                        if (data.user) {
                            domConstruct.empty("login-message");
                            hideStatus();
                            registry.byId("user").set("label", login);
                            registry.byId("user").closeDropDown(false);
                            domStyle.set("login-dialog-form", "display", "none");
                            domStyle.set("login-dialog-logout", "display", "block");
                            if(callbackFunction){
                                callbackFunction();
                                callbackFunction = undefined;
                            }
                        } else {
                            dom.byId("login-message").innerHTML = data.fail;
                            registry.byId("user").set("label", "Not logged in");
                            login = null;
                        }
                    },
                    error: function(error) {
                        dom.byId("login-message").innerHTML = "Login failed: " + error.responseText;
                        registry.byId("user").set("label", "Not logged in");
                        login = null;
                    }
                });
            });
            on(dom.byId("logout"), "click", function(e) {
                e.preventDefault();
                xhr.post({
                    url: "login?logout=true",
                    load: function(data) {
                        login = null;
                        domStyle.set("login-dialog-form", "display", "block");
                        domStyle.set("login-dialog-logout", "display", "none");
                        registry.byId("user").set("label", "Not logged in");
                        popup.close(registry.byId("login-dialog"));
                        form.reset();
                    },
                    error: function(error) {
                        console.debug("error: ", error);
                        status("Logout failed");
                    }
                });
            });

            on(window, "focus", function(e) {
                if (!hasFocus) {
                    xhr.post({
                        url: "login",
                        handleAs: "json",
                        load: function(data) {
                            if (data.user) {
                                login = data.user;
                                registry.byId("user").set("label", login);
                                domStyle.set("login-dialog-form", "display", "none");
                                domStyle.set("login-dialog-logout", "display", "block");
                            } else {
                                domStyle.set("login-dialog-form", "display", "block");
                                domStyle.set("login-dialog-logout", "display", "none");
                                registry.byId("user").set("label", "Not logged in");
                                login = null;
                            }
                        }
                    });
                }
                hasFocus = true;
            });

            on(window, "blur", function(e) {
                hasFocus = false;
            });

            // listen to changes of installed packages
            topic.subscribe("packages-changed", updateInstalledApps);

            // display installed apps
            updateInstalledApps();

            // handler for closing inline app
            on(dom.byId("inlineClose"), "click", function(e) {
                closeApp();
            });

            //global esc key handler to close plugin
            on(document,"keypress",function(evt){
                var charCode=evt.charCode? evt.charCode : evt.keyCode;
                // console.debug("keypress: charCode: ",charCode, " keys:",keys);
                if(charCode == keys.ESCAPE) { closeApp();}
                // console.debug("default behavior e.charOrCode:",charCode, " dojo.keys.ESCAPE:",dojo.keys.ESCAPE);                
            });

            // hide the splash screen
            var splash = dom.byId("splash");
            dojo.fadeOut({
                node:splash,
                onEnd: function(){
                    domStyle.set(splash, "display", "none");
                }
            }).play();

        });
    });