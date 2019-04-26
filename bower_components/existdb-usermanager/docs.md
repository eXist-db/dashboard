DON'T CLONE THIS BUT USE THE DOWNLOAD OPTION TO SAVE AN ARCHIVE VERSION.

# Blueprint for componentized eXistdb apps

## Purpose of this blueprint

THe purpose of this blueprint is to provide a quick way to create new apps and at the same time components (or buidling blocks)
that are commonly and repeatedly used within applications.


This differs from the eXide wizard in the following aspects:

* allows to be deployed as a xar app
* can be consumed by bower for usage in other apps

## What's in the box

* a common directory structure
* all needed configuration files
* useful tooling

## Before you start

What will be needed up-front:

* a nodejs installation (see below) 
* if using Polymer an installation of the Polymer CLI (highly recommended)

## Setting up a new application

1. download this blueprint as a zip
2. create a new directory for your app
3. unpack the zip to that directory
4. start over by setting up the toolchain
5. call `ant init`. This will ask for a new project name to be used as the app name. The target will substitute all occurences of the string 'existdb-usermanager' with your project name (shouldn't contain spaces) 

## Setup the toolchain

### nodejs

Note: This is a one-timer - you can skip this step if you got mpm on your system already.

Though not strictly required for development it is recommended that you have an installation of nodejs on your system.
It is recommended to use ['nvm'](https://github.com/creationix/nvm) to install nodejs as this eases the process of installation and 
allows to keep different versions of it on your system without conflicts.

Nodejs is used within this project to drive the gulp tasks. These allow to:
 
 * build CSS from less
 * sync your local files into eXistdb with `gulp deploy` or 
 * sync your changed files into eXistdb with `gulp watch`
 
Please refer to the nvm page for installation instruction or use an installation method described
on the nodejs.org homepage.

### Setup gulp and bower tooling

Execute

`npm install`

This will download and install all packages listed in packages.json.


### Installation and usage of the Polymer-CLI

Note: as with Nodejs you need to install this only once globally. If you have worked with polymer CLI
before skip this step.

The Polymer CLI is another tool for development and is not needed at runtime. It provides:

* quick project setup
* quick creation of Polymer elements or a complete application
* supports the building of an optimized version of the app

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) installed. Then run `polymer serve` to serve your application locally.

#### Viewing Your Application

```
$ polymer serve
```

This is good enough as long as your app just uses client-side code. Once you want to connect 
those to some server-side XQuery you'll want to deploy the app as a xar.

#### Building Your Application

```
$ polymer build
```

This will create a `build/` folder with `bundled/` and `unbundled/` sub-folders
containing a bundled (Vulcanized) and unbundled builds, both run through HTML,
CSS, and JS optimizers.

You can serve the built versions by giving `polymer serve` a folder to serve
from:

```
$ polymer serve build/bundled
```

#### Running Tests

```
$ polymer test
```

Your application is already set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester). Run `polymer test` to run your application's test suite locally.

### Installation and usage of gulp assistance

Once you've executed `npm install` you will have gulp with additional plugins installed.

There's additional development support through gulp. 

Most prominently with

```
gulp watch
```

you can synchronize the local workspace with the app deployed in eXistdb.

Every changed file will automatically deployed into the `target' collection
 
 `/db/apps/[target]`
 
 To make this and other goodies work you'll need to have Nodejs installed
 and call
 
 ```
 npm install
 ```
  
  once.
   
NOTE: You'll need to deploy your xar application once via the eXistdb PackageManager before you can call
either `gulp deploy` or `gulp watch`.

The deployment via the PackageManager makes sure that the target collection is created as well as 
execute some pre/post-install scripts to create users or set permissions. 


## Kick-off development

To start the actual development with Polymer execute:

```
polymer init
```

This will interactively create a new component or even a complete app layout container for you and load
all needed dependencies into bower_components directory.

Once you're done you should:

Build a xar with

```
ant xar
```

Deploy the newly created xar into eXistdb.

### Add new dependency

New libraries are loaded via bower with the command:

```
bower install --save [DEPENDENCY]   
```

where [DEPENDENCY] might e.g. be 'PolymerElements/paper-button'. Please refer to [bower docs](http://bower.io) for other
possible options.




  