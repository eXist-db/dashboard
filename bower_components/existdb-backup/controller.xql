xquery version "3.1";

declare namespace output="http://exquery.org/ns/rest/annotation/output";

import module namespace login="http://exist-db.org/xquery/login" at "resource:org/exist/xquery/modules/persistentlogin/login.xql";

declare variable $exist:path external;
declare variable $exist:resource external;
declare variable $exist:controller external;
declare variable $exist:prefix external;
declare variable $exist:root external;
declare variable $exist:context external;

(: todo: fix url pathes to work in root context :)

declare variable $local:login-domain := "org.exist.login";
declare function local:user-allowed ($user) as xs:boolean {
    (
        not(empty($user)) and
        not($user = "guest") and
        sm:is-dba($user)
    )
};

let $login := login:set-user($local:login-domain, (), false())
let $user := request:get-attribute($local:login-domain || ".user")
(:
let $log := util:log("info", "root " || $exist:root)
let $log := util:log("info", "controller " || $exist:controller)
let $log := util:log("info", "requesturi " || request:get-uri())
let $log := util:log("info", "prefix " || $exist:prefix)
let $log := util:log("info", "context " || $exist:context)
:)

return (
    request:set-attribute("betterform.filter.ignoreResponseBody", "true"),
    if ($exist:path = '/login')
    then (
          <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
              <forward url="login.html">
                  <cache-control cache="no"/>
                  <set-header name="Cache-Control" value="no-cache"/>
              </forward>
          </dispatch>
    )
    else if (not(local:user-allowed($user)))
    then (
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            <redirect url="{$exist:context}{$exist:prefix}{$exist:controller}/login"/>
        </dispatch>
    )
    else if ($exist:path = '')
    then (
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            (:<redirect url="/exist/apps/{$exist:controller}/"/>:)
            <redirect url="{$exist:context}{$exist:prefix}{$exist:controller}/login"/>

        </dispatch>
    )
    else if ($exist:path = "/")
    then (
        (: forward root path to index.xql :)
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            (:<redirect url="/exist/apps/{$exist:controller}/index.html"/>:)
            <redirect url="{$exist:context}{$exist:prefix}{$exist:controller}/login"/>
        </dispatch>
    )
    else if (matches($exist:path, ".xql/?$"))
    then (
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            { $user }
            <set-attribute name="$exist:path" value="{$exist:path}"/>
        </dispatch>
    )
    else if(starts-with($exist:path, "/resources")) then
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            <cache-control cache="yes"/>
        </dispatch>

    else (
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist" />
    )
)
