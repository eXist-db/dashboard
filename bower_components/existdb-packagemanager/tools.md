## Tooling Reference

### What gulp does for you

[gulpjs](http://gulpjs.com/) is a JavaScript build tool and knows hundreds of 'tasks' to help client-side development.

For eXistdb application development there is a custom existdb plugin (task) that can talk to eXistdb and deploy files
from a local disk into eXistdb.

#### Commands

```
gulp deploy
```

will transfer all local files on disk to the target collection in eXistdb. If you've used ´ant init` the target collection
will already be configured for you.

IMPORTANT: the app MUST be deployed once into eXistdb before ´gulp deploy´ or `gulp watch` are run. This is to setup
the application correctly (creating collection, users etc.).

```
gulp watch
```

can be started in a terminal once (in the root of your project) and will then watch all files on disk and deploy them into eXistdb
ONCE THEY'VE CHANGED. This is very convenient if you prefer a workflow 'from workspace to database'.

### What [Polymer CLI](https://www.polymer-project.org/2.0/start/toolbox/set-up) does for you

Polymer CLI is a powerful tool when working with Polymer. 

#### Commands:

```
polymer init
```

With this command you can create a single new Polymer Web Component or even a whole new application. It must be executed
in the root of your project. 

IMPORANT: when run initially the Polymer CLI will download all JavaScript dependencies it needs for Polymer development. When run
to create new components later on (after setup) you should answer all 'overwrite' questions of the CLI with 'n' to keep the originals.

```
polymer serve -o
```

can be used to start a local server that open the index page. This is fine for a quick view if the component is running
as expected. For serious development i recommend to use gulp for deployment (see above).

```
polymer build
```


will create a production version of all your Polymer Web Components compressed into index.html. It also will remove
all unneeded dependencies from 'bower_components'. This command should be executed once the app is ready for production as
 it reduces the footprint dramatically.
 
```
polymer test
```

will run Polymer tests found in directory 'test'. 

NOTE: this is not working perfectly for now so please be aware that it might fail due to browser loading/shutdown problems. The
actuals tests however should pass. We'll have to look for a more stable solution in the future.

The relevant test framework can be found here: [web-component-tester](https://github.com/Polymer/web-component-tester)

You can serve the built versions by giving `polymer serve` a folder to serve
from:

```
$ polymer serve build/bundled
```


### What [Ant](https://ant.apache.org/) does for you

Ant (as always in eXistdb app development) does the final packaging as a xar app. In this app template the standard build.xml
is extended to wrap the ´build` command of the Polymer CLI when the target 'production-xar' is called.

```
ant init
```

As described above this must be called once you create your project to rename the relevant parts of the various config-files.


```
ant xar
```

This is the default and creates a xar file for deployment into eXistdb. Run this and use eXistdb Package Manager to
install the app into eXistdb before ever calling ´gulp deploy` or `gulp watch`.

```
ant production-xar
```

will call ´polymer init´ to make sure all Web Components are optimized before packaging the xar. This is highly recommended to prepare
your app for production deployment.



### What bower does for you

bowerjs is a client-side dependency management tool. It's widely adapted in the web development world. It works with a 'bower.json' file
that contains all necessary information. By default all client-side dependencies are kept in a directory called 'bower_components'. In app template
this file will be created by Polymer CLI.

bower.json will also serve as a meta-information provider when you want to distribute a component
for use with bower in an external application. If you're interested in this use case please be aware
that the ignores found in 'bower.json.ignores' are added to bower.json.

#### Commands

```
bower install
```

this will read the 'bower.json' file and load all dependencies found there into the local 'bower_components' directory.
Note that it will only load dependencies if they are not yet present so it does some caching.

```
bower search [string]
```

this can be used to localize a dependency you want to use. It will return a list of available resources which then can be installed.

```
bower install --save [resource]
```

this will download the resource and put it into 'bower_components' for usage. Please always use ´--save´ to store the dependency
in bower.json. if you're installing a development time dependency use ´--save-dev´ instead.



### Notes on setting up nodejs

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

## Final remark

If you find problems with the information provided above please use the issue-tracker and file a ticket. Same applies to
 extensions of the app template that you'd like to suggest.

