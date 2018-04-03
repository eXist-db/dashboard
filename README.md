# eXist-db Admin Dashboard

Admin Dashboard is a replacement of the older [Dashboard](https://github.com/eXist-db/dashboard) and will replace it from eXist-db 5.0.0 onwards.

## Building

The application is build with Apache Ant by executing

```ant xar```

### A note on client-side dependencies

Admin Dashboard is made of [Web Components](https://webcomponents.org) using [bower](https://bower.io/) for handling 
client-side dependency management. bower builds upon the nodejs stack and therefore require a nodejs installation to work.
 
Usually when using dependency tools the dependent modules are loaded dynamically from remote repositories. This has certainly 
advantages but also introduce the danger of undetected deep version changes and other problems when sources become unavailable for 
some reason. A discussion on this topic can be found [here](https://addyosmani.com/blog/checking-in-front-end-dependencies/). Furthermore
it requires the installation of npm and bower.

As nodejs (npm) is not available or common to everyone the dependencies are therefore kept in the repo which eases building the app.


## What it does

Admin Dashboard provides a common UI for adminitration tools in a responsive sidebar layout. The layout uses the 
Material Design Guidelines to provide a common UI across a wide range of devices.

Currently it contains:
* Launcher (not strictly an admin tool but here for convenience)
* PackageManager
* UserManager
* Settings

More modules can be plugged later on.

## Features

* made of modular Web Components
* making use of latest HTML5 standard features like Custom Elements, Shadow DOM and HTML Templates
* responsive sidebar layout following Material Design
* the modules (like Packagemanager and Usermanager...) can be bookmarked for direct access
* allows to install, upload, update and remove packages (PackageManager component)
* manage users and groups (UserManager component)
* Settings panel showing eXist-db version and public repo URL. This will likely be extended for configuration.


## Architecture

Admin Dashboard composes a set of Web Components into a common UI. As Web Component support is not on the same level in 
all browsers [Polymer](https://polymer-project.org) is used to polyfill the gaps. E.g. while Chrome already fully
implements the current state of Web Components natively Firefox does not have a shadowDOM implementation at the time
of this writing. Polymer bridges this gap as good as possible and provides cross-browser compatibility for all modern browsers.


For more information see https://webcomponents.org 

To truly understand the impact of Web Components just a few points should be mentioned:
Web Components provide truly encapsulated custom HTML elements that behave as any other HTML element but may attach
styling, logic and shadowDOM to the element. As part of HTML5 they'll become native browser functionality once fully 
estabilshed.

### Use of components in Admin Dashboard

Admin Dashboard is made of a lot of Web Components that can be found in 'bower_components' directory. 

Most of those are publicly available components available from webcomponents.org but there is also a set of
components specifically developed for eXist-db. These are organised in logical groups that are hosted in their own
repositories.

Usually you don't have to deal with these details as this is done via bower (see bower.json) but this information is just 
provided for developers that want to enhance Admin Dashboard.

Here's a list repositories involved:

* [PackageManager](https://github.com/eXist-db/packagemanager)
* [UserManager](https://github.com/eXist-db/usermanager)
* [Launcher](https://github.com/eXist-db/launcher)
* [Repo Elements](https://github.com/eXist-db/repo-elements)
* [Package Service](https://github.com/eXist-db/existdb-packageservice). This is no component but required by PackageManager and Launcher

### Hybrid Components

PackageManager, UserManager and Launcher are not just Web Components but fully functional as a standalone xar application
in eXist-db. As such each of them can be checked out and build separatly. This allows to have eXist-db installations that have no
Admin Dashboard at all but just e.g. a Launcher. On production system however you might want no launcher at all and only a PackageManager.

These scenarios are made possible by these hybrid components. 

## Compatibility

The application has been tested on:

* Chrome 65.0.3325.181 / OSX 10.13.3
* Firefox 59.0.2 / OSX 10.13.3
* Safari 11.0.3 / OSX 10.13.3

Admin Dashboard is built with [Polymer 2](https://polymer-project.org). See their compatibility table [here](https://www.polymer-project.org/2.0/docs/browsers).





