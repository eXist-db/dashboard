IMPORTAN NOTE: Dashboard is deprecated and will be replaced by a new version independent of Dojo. The repository of the new version will be available here soon.

![Dashboard logo](/eXist-db/dashboard/raw/master/icon.png)

eXist-db Dashboard
==================

The eXist-db Dashboard is the central application launchpad and administration facility for eXist-db.

This repository contains the source code of the dashboard application.

Building
--------

The dashboard is distributed as a single .xar file, which can be installed into an eXist-db instance via the package manager. To build the .xar, you need to have Apache Ant installed. Alternatively you can use the Ant version which comes with eXist-db (call build.sh/build.bat from the eXist-db directory). 

Clone the dashboard repository to a local directory:

	git clone git://github.com/eXist-db/dashboard.git dashboard

Change into the created directory and call

	ant

This should create a .xar file in the build directory.
