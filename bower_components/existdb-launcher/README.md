# Launcher

A small application to start eXist-db apps similar to Launchpad on Mac.

Launcher can be used as a standalone application or embedded as a Web Component (Polymer flavor) in other apps like Dashboard.

## Building

```ant xar``` 

creates an unoptimized xar file for deploying into eXist-db.

```ant production-xar``` 

creates a compressed version.`

## Developing

If you want to add features you have to setup npm and bower in the project by

```npm install || bower install```

After completion new components can be added via bower with:

```bower install --save [COMPONENT_NAME]```

It is recommended to check new dependencies into git to avoid dependency
update problems. For a discussion on this topic see https://addyosmani.com/blog/checking-in-front-end-dependencies/

