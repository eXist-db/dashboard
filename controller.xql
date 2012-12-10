xquery version "1.0";

declare namespace json="http://www.json.org";
declare namespace control="http://exist-db.org/apps/dashboard/controller";
declare namespace output="http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace rest="http://exquery.org/ns/restxq";

import module namespace login="http://exist-db.org/xquery/app/wiki/session" at "modules/login.xql";
import module namespace restxq="http://exist-db.org/xquery/restxq" at "modules/restxq.xql";

declare variable $exist:path external;
declare variable $exist:resource external;
declare variable $exist:controller external;
declare variable $exist:prefix external;
declare variable $exist:root external;

declare
    %rest:GET
    %rest:path("/")
function control:root() {
    (: forward root path to index.xql :)
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <redirect url="index.html"/>
    </dispatch>
};

declare
    %rest:GET
    %rest:path("{$query}.xql")
function control:query-resource() {
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <set-attribute name="$exist:path" value="{$exist:path}"/>
        <cache-control cache="yes"/>
    </dispatch>
};

declare 
    %rest:POST
    %rest:path("/login")
    %output:media-type("application/json")
    %output:method("json")
function control:login() {
    let $loggedIn := login:set-user("org.exist.login", (), true())
    return
        if (exists($loggedIn)) then
            <ok>
                <user>{$loggedIn[@name="org.exist.login.user"]/@value/string()}</user>
                <isDba json:literal="true">true</isDba>
            </ok>
        else (
            response:set-status-code(401),
            <fail/>
        )
};

(:~
 : Pages ending with .html are run through view.xql to
 : expand templates.
 :)
declare
    %rest:GET
    %rest:path("{$page}.html")
function control:html($page as xs:string) {
    (: the html page is run through view.xql to expand templates :)
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <view>
            <forward url="{$exist:controller}/modules/view.xql">
                {login:set-user("org.exist.login", (), true())}
                <set-attribute name="$exist:prefix" value="{$exist:prefix}"/>
                <set-header name="Cache-Control" value="no-cache"/>
            </forward>
        </view>
    	<error-handler>
			<forward url="{$exist:controller}/error-page.html" method="get"/>
			<forward url="{$exist:controller}/modules/view.xql"/>
		</error-handler>
    </dispatch>
};

declare
    %rest:GET
    %rest:path("/plugins/{$plugin}/{$page}.html")
function control:plugin-html($page as xs:string) {
    control:html($page)
};

declare
    %rest:GET
    %rest:path("/_shared/{$path}")
function control:shared($path as xs:string) {
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="/shared-resources/{$path}"/>
    </dispatch>
};

(:~
 : Fallback: this function is called for any GET request
 : not matching any of the previous functions in this module.
 : 
 : Just let the URL rewriting controller handle the request.
 :)
declare
    %rest:GET
function control:default() {
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <cache-control cache="yes"/>
    </dispatch>
};

let $funcs := (util:list-functions())
let $login := login:set-user("org.exist.login", (), true())
return
    restxq:process($exist:path, $funcs)