xquery version "3.1";

import module namespace login="http://exist-db.org/xquery/login" at "resource:org/exist/xquery/modules/persistentlogin/login.xql";
import module namespace functx = "http://www.functx.com";


declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare option output:method "html5";
declare option output:media-type "text/html";

declare variable $exist:path external;
declare variable $exist:resource external;
declare variable $exist:controller external;
declare variable $exist:prefix external;
declare variable $exist:root external;

let $permissions :=
    <auth>
       <group name="dba">
           <permission>packagemanager</permission>
           <permission>usermanager</permission>
           <permission>backup</permission>
           <permission>settings</permission>
       </group>
       <group name="packagemanager">
           <permission>packagemanager</permission>
           <permission>/package/install</permission>
       </group>
   </auth>


return
(:
let $log := util:log("info", "path " || $exist:path)
let $log := util:log("info", "resource " || $exist:resource)
let $log := util:log("info", "controller " || $exist:controller)
let $log := util:log("info", "")

return
:)
if ($exist:path eq '') then
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <redirect url="{request:get-uri()}/"/>
    </dispatch>
else if ($exist:path = "/") then(
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="index.html"/>
    </dispatch>
)
else if ($exist:path = "/launcher") then(
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="index.html"/>
    </dispatch>
)
else if (ends-with($exist:path,"existdb-packagemanager.js")) then(
    let $authRoute := 'packagemanager'
    let $loggedIn := login:set-user("org.exist.login", (), false())
    let $user := request:get-attribute("org.exist.login.user")
    return
    if($user)then(
        let $groups := sm:get-user-groups($user)
        let $log := util:log('info','authRoute:' || $authRoute)
        let $log := util:log('info','groups:' || $groups)

        let $authorized :=  exists($permissions//group[@name=$groups]/permission[.=$authRoute])
        let $log := util:log('info','authorizued:' || $authorized)
        return

            if($authorized) then(
                <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
                    <cache-control cache="no"/>
                    <set-header name="Cache-Control" value="no-cache"/>
                </dispatch>
            )else(
                response:set-status-code(403),
                <status>not authorized</status>
            )

    )else(
        response:set-status-code(403),
        <status>not logged in</status>
    )


)
else if ($exist:path = "/packagemanager") then(
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="index.html"/>
    </dispatch>
)
else if ($exist:path = "/usermanager") then(
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="index.html"/>
    </dispatch>
)
else if ($exist:path = "/backup") then(
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="index.html"/>
    </dispatch>
)
else if ($exist:path = "/settings") then(
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="index.html"/>
    </dispatch>
)

(:
 : Login a user via AJAX. Just returns a 401 if login fails.
 :)
else if ($exist:resource eq 'login') then
    let $loggedIn := login:set-user("org.exist.login", (), false())
    let $user := request:get-attribute("org.exist.login.user")
    return (
        util:declare-option("exist:serialize", "method=json"),
        try {
            <status xmlns:json="http://www.json.org">
                <user>{$user}</user>
                {
                    if ($user) then (
                        <groups json:array="true">{sm:get-user-groups($user)}</groups>,
                        <views>
                            <json:value>packagemanager</json:value>
                            <json:value>usermanager</json:value>
                            <json:value>backup</json:value>
                            <json:value>settings</json:value>
                        </views>,
                        <dba>{sm:is-dba($user)}</dba>
                    ) else
                        ()
                }
            </status>
        } catch * {
            response:set-status-code(401),
            <status>{$err:description}</status>
        }
    )
else if ($exist:path = "/admin") then (
    login:set-user("org.exist.login", (), true()),
    let $user := request:get-attribute("org.exist.login.user")

    let $route := request:get-parameter("route","")
    (:
    let $log := util:log("info", "path " || $exist:path)
    let $log := util:log("info", "route " || $route)
    let $log := util:log("info", "login matched " || $exist:controller)
    :)

    return
    if($user and sm:is-dba($user)) then(

(:
        let $log := util:log("info", "user is dba")
        let $log := util:log("info", "effective " || request:get-uri())
        let $log := util:log("info", "uri " || request:get-uri())
        let $log := util:log("info", "pathinfo " || request:get-path-info())
        let $log := util:log("info", "url " || request:get-url())
        return
:)


        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            <forward url="index.html?route={$route}">
                <cache-control cache="no"/>
                <set-header name="Cache-Control" value="no-cache"/>
            </forward>
        </dispatch>
    )
    else(
(:
        let $log := util:log("info", "user is not logged in")
        return
:)
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            (:<forward url="{$exist:controller}/index.html"></forward>:)
            <redirect url="login.html">
                <cache-control cache="no"/>
                <set-header name="Cache-Control" value="no-cache"/>
            </redirect>
        </dispatch>
        )
)
else
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <cache-control cache="yes"/>
    </dispatch>
