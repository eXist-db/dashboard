xquery version "3.1";

declare namespace output="http://exquery.org/ns/rest/annotation/output";

import module namespace login="http://exist-db.org/xquery/login" at "resource:org/exist/xquery/modules/persistentlogin/login.xql";

declare variable $exist:path external;
declare variable $exist:resource external;
declare variable $exist:controller external;
declare variable $exist:prefix external;
declare variable $exist:root external;

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

return (
    util:log('info', ($user, $exist:path, $exist:resource, $exist:controller)),
    request:set-attribute("betterform.filter.ignoreResponseBody", "true"),
    if ($exist:path = '/login')
    then (
          <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
              <forward url="login.html"/>
              <cache-control cache="no"/>
          </dispatch>
    )
    else if (not(local:user-allowed($user)))
    then (
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            <redirect url="/exist/apps/{$exist:controller}/login"/>
        </dispatch>
    )
    else if ($exist:path = '')
    then (
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            <redirect url="/exist/apps/{$exist:controller}/"/>
        </dispatch>
    )
    else if ($exist:path = "/")
    then (
        (: forward root path to index.xql :)
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            <redirect url="/exist/apps/{$exist:controller}/index.html"/>
        </dispatch>
    )
    else if (matches($exist:path, ".xql/?$"))
    then (
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            { $user }
            <set-attribute name="$exist:path" value="{$exist:path}"/>
        </dispatch>
    )
(:
    else if (starts-with($exist:path, "/packages/"))
    then (
        let $log := util:log("info", $exist:path)
        let $funcs := util:list-functions("http://exist-db.org/apps/dashboard/packages/rest")
        return (
          response:set-header("Cache-Control", "no-cache"),
          restxq:process($exist:path, $funcs)
        )
    )
:)
    else if(starts-with($exist:path, "/resources")) then
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            <cache-control cache="yes"/>
        </dispatch>

    else (
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist" />
    )
)
