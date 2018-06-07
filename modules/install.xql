xquery version "3.0";

import module namespace apputil="http://exist-db.org/xquery/apps";
import module namespace config="http://exist-db.org/xquery/apps/config" at "config.xqm";
import module namespace request="http://exist-db.org/xquery/request";
import module namespace response="http://exist-db.org/xquery/response";
import module namespace util="http://exist-db.org/xquery/util";
import module namespace xmldb="http://exist-db.org/xquery/xmldb";

declare namespace err="http://www.w3.org/2005/xqt-errors";
declare namespace exist="http://exist.sourceforge.net/NS/exist";
declare namespace expath="http://expath.org/ns/pkg";
declare namespace install="http://exist-db.org/apps/dashboard/install";
declare namespace json="http://www.json.org";
declare namespace repo="http://exist-db.org/xquery/repo";

declare option exist:serialize "method=json media-type=application/json";

declare %private function install:require-dba($func as function() as item()*) {
    if (xmldb:is-admin-user(xmldb:get-current-user())) then
        $func()
    else (
        response:set-status-code(403),
        <status><error>{xmldb:get-current-user()}</error></status>
    )
};

declare %private function install:timestamp() as xs:integer {
    let $dayZero := xs:dateTime('1970-01-01T00:00:00-00:00')
    return
        (current-dateTime() - $dayZero) div xs:dayTimeDuration('PT1S')
};

let $action := request:get-parameter("action", "install")
let $package-url := request:get-parameter("package-url", ())
let $version := request:get-parameter("version", ())
let $server-url := $config:REPO
let $upload := request:get-uploaded-file-name("uploadedfiles[]")
return
    install:require-dba(function() {
        if (exists($upload) and not($action = ("upgrade-self", "finish-upgrade-self"))) then
            try {
                let $pkg-metadata := apputil:store-upload()
                let $package := $pkg-metadata//expath:package/string(@name)
                return
                    if ($package eq "http://exist-db.org/apps/dashboard") then
                        (: we are trying to upgrade ourselves i.e. the Dashboard, so we need to take some extra steps :)
                        let $_ := util:log("info", ("Detected self-upgrade of package: " || $package || ", redirecting..."))

                        let $dashboard-col := "/db/apps/" || $pkg-metadata//repo:target
                        let $modules-col := $dashboard-col || "/modules"
                        let $upgrade-name := "upgrade_" || install:timestamp()
                        let $upgrade-query-name := $upgrade-name || ".xq"

                        (: we have no copy rename facility to we have to copy, then rename, then copy back, and finally cleanup :)
                        let $tmp-col := xmldb:create-collection($modules-col, $upgrade-name)
                        let $_ := xmldb:copy($modules-col, $tmp-col, "install.xql")
                        let $_ := xmldb:rename($tmp-col, "install.xql", $upgrade-query-name)
                        let $_ := xmldb:copy($tmp-col, $modules-col, $upgrade-query-name)
                        let $_ := sm:chmod(xs:anyURI($modules-col || "/" || $upgrade-query-name), "rwxr-xr-x")
                        let $_ := xmldb:remove($tmp-col)

                        return
                            response:redirect-to(xs:anyURI($upgrade-query-name || "?action=upgrade-self"
                                || "&amp;package=" || encode-for-uri($package)
                                || "&amp;repo-path=" || encode-for-uri($pkg-metadata/@repo-path)
                                || "&amp;file-name=" || encode-for-uri($pkg-metadata/@file-name)
                            ))
                    else
                        let $doc-name := apputil:deploy-upload($pkg-metadata, xs:anyURI($server-url))
                        return
                            <result>
                                <json:value json:array="true">
                                    <file>{$doc-name}</file>
                                </json:value>
                            </result>

            } catch * {
                let $_ := util:log("error", ($err:code || " " || $err:description, $err:module || " [" || $err:line-number || ":" || $err:column-number || "]"))
                return
                    <result>
                        <json:value json:array="true">
                            <error>{($err:description, $err:value)[1]}</error>
                        </json:value>
                    </result>
            }
        else
            switch ($action)
                case "upgrade-self"
                return
                    let $package := request:get-parameter("package", ())
                    let $repo-path := request:get-parameter("repo-path", ())
                    let $file-name := request:get-parameter("file-name", ())
                    return
                        let $doc-name := apputil:deploy-upload($package, $repo-path, $file-name, xs:anyURI($server-url))
                        return
                            response:redirect-to(xs:anyURI("install.xql" || "?action=finish-upgrade-self"
                                || "&amp;doc-name=" || encode-for-uri($doc-name)
                            ))

                case "finish-upgrade-self"
                return
                    let $doc-name := request:get-parameter("doc-name", ())
                    return
                        <result>
                            <json:value json:array="true">
                                <file>{$doc-name}</file>
                            </json:value>
                        </result>

                case "remove"
                return
                    try {
                        let $type := request:get-parameter("type", ())
                        let $removed := apputil:remove($package-url)
                        return
                            if ($removed) then
                                <status><ok/></status>
                            else
                                <status><error>Failed to remove package {$package-url}</error></status>
                    } catch * {
                        <status><error>{($err:description, $err:value)[1]}</error></status>
                    }

                default
                return
                    (: Use dynamic lookup for backwards compatibility :)
                    let $func := function-lookup(xs:QName("apputil:install-from-repo"), 4)
                    return
                        try {
                            if (empty($func)) then
                                apputil:install-from-repo($package-url, (), $server-url)
                            else
                                $func($package-url, (), $server-url, $version)
                        } catch * {
                            <status>
                                <error>{($err:description, $err:value)[1]}</error>
                                <trace>{$exerr:xquery-stack-trace}</trace>
                            </status>
                        }
    })