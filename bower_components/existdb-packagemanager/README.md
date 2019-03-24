# eXist-db Packagemanager

This application allows to browse local and remote packages, install, upload or remove packages.

## Requirements 

 What will be needed up-front:
 
 1. an installation of eXist-db (3.0 or above recommended) 
 1. a nodejs installation (see below for instructions) 
 1. an installation of the Polymer CLI for optimized builds 
 1. Apache Ant configured 
 
IMPORTANT NOTE: JavaScript dependencies are managed by bower which dynamically loads those into a 'bower_components' folder.
However to ease the building process, the bower components have been added to the repo. This way it is not necessary
to have a NodeJS installation to build PackageManager. If you want to just  want to build an un-optimized version you can skip
the steps under 'Preparation' and just all 'ant dev-xar'.


## Preparation
* execute `npm install` in the root directory to install bower and other tools used for building and development
* execute `bower install` the the root directory
* make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) installed if you intend to build a compressed production version



## Building eXist-db app

### for production 


```sh
ant
```
creates build/packagemanager-x.x.x.xar


***Please note that this task might take a moment as the whole dependency tree is analysed and the compressed
version is stored into a single file.*** 

### for development

```sh
ant dev-xar
```

creates build/packagemanager-dev-x.x.x.xar


## Using gulp assistance

There's additional development support through gulp. Most prominently with

`gulp deploy`

pushes the local workspace into the app collection in eXist-db on localhost.


`
gulp watch
`

synchronizes the local workspace with the app deployed in eXist-db. Changed files will be
automatically deployed when stored.

***Please note that the app must be installed in eXist-db first before these task work.***



## More information

Please refer to the [tools document](tools.md) for more information on effective use of the 
bundled tools.  
