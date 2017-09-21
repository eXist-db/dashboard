xquery version "3.1";

import module namespace login="http://exist-db.org/xquery/login" at "resource:org/exist/xquery/modules/persistentlogin/login.xql";

declare namespace json = "http://www.json.org";
declare namespace control = "http://exist-db.org/apps/dashboard/controller";
declare namespace rest = "http://exquery.org/ns/restxq";


declare variable $exist:path external;
declare variable $exist:resource external;
declare variable $exist:controller external;
declare variable $exist:prefix external;
declare variable $exist:root external;


if ($exist:path eq '') then
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <redirect url="{request:get-uri()}/"/>
    </dispatch>
else if ($exist:path = "/") then(
(: forward root path to index.html :)
    login:set-user("org.exist.login", (), true()),
    let $user := request:get-attribute("org.exist.login.user")
    return
        if($user and sm:is-dba($user)) then
            <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
                <forward url="{$exist:controller}/admin.html">
                </forward>
            </dispatch>
        else
            <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
                <forward url="{$exist:controller}/guest.html">
                </forward>
            </dispatch>
            )

else if($exist:path eq '/login') then
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="login.html"/>
    </dispatch>
else
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <cache-control cache="no"/>
    </dispatch>
