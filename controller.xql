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


declare function local:manglePath($path as xs:string){
    let $before := substring-before($path,"bower_components")
    return $before || "bower_components/" || functx:substring-after-last($path,"bower_components/")
};

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
                <forward url="{$exist:controller}/admin.html"></forward>
                <cache-control cache="no"/>
            </dispatch>
        else
            <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
                <forward url="{$exist:controller}/guest.html"></forward>
            </dispatch>
            )
(:
else if(functx:number-of-matches($exist:path,"bower_components") = 2) then

    let $before := substring-before($exist:path,"bower_components")
    let $componentPath := $before || "bower_components/" || functx:substring-after-last($exist:path,"bower_components/")
    return
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$componentPath}"></forward>
    </dispatch>
:)
else if(starts-with($exist:path,"/apps/local")) then
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="../modules/local-applications.xql"></forward>
    </dispatch>
else if($exist:path eq '/login') then
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="login.html"/>
    </dispatch>
else
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <cache-control cache="yes"/>
    </dispatch>
