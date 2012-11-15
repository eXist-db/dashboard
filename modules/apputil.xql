xquery version "3.0";

(:~
 : Utility functions to find, install, upload and remove packages from the
 : package repository.
 :)
module namespace apputil="http://exist-db.org/xquery/apps";

declare namespace expath="http://expath.org/ns/pkg";
declare namespace repo="http://exist-db.org/xquery/repo";

declare variable $apputil:collection := "/db/system/repo";

declare variable $apputil:BAD_ARCHIVE := xs:QName("apputil:BAD_ARCHIVE");
declare variable $apputil:NOT_FOUND := xs:QName("apputil:NOT_FOUND");
declare variable $apputil:DEPENDENCY := xs:QName("apputil:DEPENDENCY");

(:~
 : Try to find an application by its unique name and return the path to which it
 : has been deployed inside the database.
 : 
 : @param $pkgURI unique name of the application
 : @return the database path to the application or the empty sequence if it could
 : not be found or is not deployed into the db
 :)
declare function apputil:get-application-path($pkgURI as xs:string) as xs:string? {
    let $repo := apputil:get-resource($pkgURI, "repo.xml")
    return
        $repo//repo:target
};

(:~
 : Retrieve an XML resource from the application package identified by the unique
 : name given in the first parameter. The resource is parsed an returned as an
 : XML document node.
 : 
 : @param $app the unique name of the application
 : @param $name relative path to the resource to retrieve
 : 
 :)
declare function apputil:get-resource($app as xs:string, $path as xs:string) as document-node()? {
    let $meta := repo:get-resource($app, $path)
    let $data := if (exists($meta)) then util:binary-to-string($meta) else ()
    return
        if (exists($data)) then
            util:parse($data)
        else
            ()
};

(:~
 : Check if the application identified by the given unique name is installed. Returns
 : the package descriptor of the application if found or the empty sequence otherwise.
 : 
 : @param $pkgURI unique name of the application
 :)
declare function apputil:is-installed($pkgURI as xs:anyURI) as element(expath:package)? {
    apputil:scan-repo(function($uri, $expath, $repo) {
        if ($uri = $pkgURI) then
            $expath/*
        else
            ()
    })
};

(:~
 : Install a package from the public repository. The package is either specified by its unique name
 : in the first parameter or its file name, e.g. "dashboard-0.1.xar".
 : 
 : @param $name unique name of the package to install (optional)
 : @param $package-path the file name of the package to install (optional)
 : @param $serverUri the URI of the public-repo app on the server
 : @return the empty sequence
 :)
declare function apputil:install-from-repo($name as xs:string?, $package-path as xs:anyURI?, $serverUri as xs:anyURI) {
    let $package-url := 
        if (exists($name)) then
            "modules/find.xql?name=" || $name
        else
            $package-path
    return
        if (exists($package-url)) then
            apputil:download-and-install($package-url, $serverUri)
        else
            ()
};

declare %private function apputil:download-and-install($uri as xs:anyURI, $serverUri as xs:anyURI) {
    let $tempColl := xmldb:create-collection("/db/system", "repo")
    let $http-response := httpclient:get(xs:anyURI($serverUri || "/" || $uri), false(), ())
    let $status := $http-response/@statusCode/string()
    return
        if ($status != "200") then
            error($apputil:NOT_FOUND, "Application package not found: " || $uri)
        else
            let $name := tokenize($uri, "/")[last()]
            let $package-mimetype := "application/xar"
            let $package-data := xs:base64Binary($http-response/httpclient:body/text())
            let $stored := xmldb:store($tempColl, $name, $package-data, $package-mimetype)
            let $meta :=
                try {
                    compression:unzip(
                        util:binary-doc($stored), apputil:entry-filter#3, 
                        (),  apputil:entry-data#4, ()
                    )
                } catch * {
                    error($apputil:BAD_ARCHIVE, "Failed to unpack archive: " || $err:description)
                }
            return
(:                if (apputil:check-package($meta)) then:)
                    let $dependencies := apputil:unresolved-dependencies($meta//expath:package)
                    return (
                        for $dep in $dependencies
                        return
                            apputil:install-dependency($dep, $serverUri),
                        let $package := $meta//expath:package/string(@name)
                        let $type := $meta//repo:meta//repo:type/string()
                        let $remove := apputil:remove($package)
                        let $install :=
                            repo:install-from-db($stored)
                        let $deploy :=
                            repo:deploy($package)
                        return
                            ()
                    )
(:                else:)
(:                    ():)
};

declare %private function apputil:check-package($meta as document-node()*) {
    if (count($meta) != 2) then
        error($apputil:BAD_ARCHIVE, "A package must contain an expath-repo.xml and repo.xml descriptor")
    else
        let $pkg := $meta//expath:package
        let $repo := $meta//repo:meta
        return
            if (empty($pkg)) then
                error($apputil:BAD_ARCHIVE, "Failed to load package descriptor: expath:package root element not found.")
            else if (empty($repo)) then
                error($apputil:BAD_ARCHIVE, "Failed to load deployment descriptor: repo:meta root element not found.")
            else
                ()
};

declare %private function apputil:install-dependency($name as xs:string, $serverUri as xs:string) {
    try {
        apputil:install-from-repo($name, (), $serverUri)
    } catch * {
        error($apputil:DEPENDENCY, "Failed to install dependency " || $name)
    }
};

declare function apputil:upload($serverUri as xs:anyURI) as xs:string {
    let $repocol :=  if (collection($apputil:collection)) then () else xmldb:create-collection('/db/system','repo')
    let $docName := request:get-uploaded-file-name("uploadedfiles[]")
    let $file := request:get-uploaded-file-data("uploadedfiles[]")
    return
        if ($docName) then
            let $stored := xmldb:store($apputil:collection, xmldb:encode-uri($docName), $file)
            let $meta :=
                try {
                    compression:unzip(
                        util:binary-doc($stored), apputil:entry-filter#3, 
                        (),  apputil:entry-data#4, ()
                    )
                } catch * {
                    error($apputil:BAD_ARCHIVE, "Failed to unpack archive: " || $err:description)
                }
            return
(:                if (apputil:check-package($meta)) then:)
                    let $dependencies := apputil:unresolved-dependencies($meta//expath:package)
                    return (
                        for $dep in $dependencies
                        return
                            apputil:install-dependency($dep, $serverUri),
                        let $package := $meta//expath:package/string(@name)
                        let $remove := apputil:remove($package)
                        let $install :=
                            repo:install-from-db($stored)
                        let $deployed :=
                            repo:deploy($package)
                        return
                            $docName
                    )
(:                else:)
(:                    ():)
        else
            error($apputil:BAD_ARCHIVE, "No file found")
};

(:~
 : Remove the package identified by its unique name.
 : 
 : @return true if the package could be removed, false otherwise
 :)
declare function apputil:remove($package-url as xs:string) as xs:boolean {
    if ($package-url = repo:list()) then
        let $log := util:log("DEBUG", "Removing package " || $package-url)
        let $undeploy := repo:undeploy($package-url)
        let $remove := repo:remove($package-url)
        return
            $remove
    else
        false()
};

(:~
 : Scan all installed application and library packages. Calls the provided callback function once for
 : every package, passing the package URI as first parameter, the expath pkg descriptor XML as second,
 : and the repo.xml descriptor as third.
 : 
 : @param $callback the callback function to call for every package found
 :)
declare function apputil:scan-repo($callback as function(xs:string, element(), element()?) as item()*) {
    for $app in repo:list()
    let $expathMeta := apputil:get-resource($app, "expath-pkg.xml")
    let $repoMeta := apputil:get-resource($app, "repo.xml")
    return
        $callback($app, $expathMeta, $repoMeta)
};

declare %private function apputil:unresolved-dependencies($expath as element(expath:package)) {
    for $dependency in $expath/expath:dependency[@package]
    let $package := xs:anyURI($dependency/@package/string())
    return
        if (apputil:is-installed($package)) then
            ()
        else
            $package
};

declare %private function apputil:entry-data($path as xs:anyURI, $type as xs:string, $data as item()?, $param as item()*) as item()?
{
    if (starts-with($path, "icon")) then
        <icon>{$path}</icon>
    else
        <entry>
        	<path>{$path}</path>
    		<type>{$type}</type>
    		<data>{$data}</data>
    	</entry>
};

declare %private function apputil:entry-filter($path as xs:anyURI, $type as xs:string, $param as item()*) as xs:boolean
{
	starts-with($path, "icon") or $path = ("repo.xml", "expath-pkg.xml")
};