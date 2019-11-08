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

declare function local:checkAuth($request as xs:string, $permissions as element(*)) {
    let $loggedIn := login:set-user("org.exist.login", (), false())
    let $user := request:get-attribute("org.exist.login.user")
    return
        if($user)then(
            let $groups := sm:get-user-groups($user)
            let $authorized :=  exists($permissions//group[@name=$groups]/permission[.=$request])
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
};


let $permissions := doc($exist:root || $exist:controller || '/config.xml')/*
return
if ($exist:path eq '') then
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <redirect url="{request:get-uri()}/"/>
    </dispatch>
else if ($exist:path = "/") then(
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="index.html"/>
    </dispatch>
)
(:
    ### these make sure that every route is ending up at index.html
:)
else if ($exist:path = "/launcher") then(
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="index.html"/>
    </dispatch>
)
else if ($exist:path = "/packages") then(
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="index.html"/>
    </dispatch>
)
else if ($exist:path = "/repository") then(
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

(:
    ### these rules additionally assert that a specific submodule can be loaded if user has required permission
:)
)else if (ends-with($exist:path,"existdb-packages.js")) then(
     local:checkAuth('packages',$permissions)
)else if (ends-with($exist:path,"existdb-repository.js")) then(
     local:checkAuth('repository',$permissions)
)else if (ends-with($exist:path,"existdb-usermanager.js")) then(
     local:checkAuth('usermanager',$permissions)
)else if (ends-with($exist:path,"existdb-backup.js")) then(
     local:checkAuth('backup',$permissions)
)else if (ends-with($exist:path,"existdb-settings.js")) then(
     local:checkAuth('settings',$permissions)
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
                        <permissions>
                        {
                        for $item in distinct-values(data($permissions//permission[parent::node()/@name = sm:get-user-groups($user)]))
                            return <json:value>{$item}</json:value>
                        }
                        </permissions>,
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
else
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <cache-control cache="yes"/>
    </dispatch>
