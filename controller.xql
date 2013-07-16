xquery version "3.0";

declare namespace json="http://www.json.org";
declare namespace control="http://exist-db.org/apps/dashboard/controller";
declare namespace output="http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace rest="http://exquery.org/ns/restxq";

import module namespace restxq="http://exist-db.org/xquery/restxq" at "modules/restxq.xql";
import module namespace login-helper="http://exist-db.org/apps/dashboard/login-helper" at "modules/login-helper.xql";

declare variable $exist:path external;
declare variable $exist:resource external;
declare variable $exist:controller external;
declare variable $exist:prefix external;
declare variable $exist:root external;

declare variable $login := login-helper:get-login-method();

request:set-attribute("betterform.filter.ignoreResponseBody", "true"),
if ($exist:path eq '') then
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <redirect url="{concat(request:get-uri(), '/')}"/>
    </dispatch>
    
else if ($exist:path = "/") then
    (: forward root path to index.xql :)
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <redirect url="index.html"/>
    </dispatch>

else if ($exist:resource = "get-icon.xql") then
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <cache-control cache="yes"/>
    </dispatch>
    
else if (matches($exist:path, ".xql/?$")) then
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        { $login("org.exist.login", (), true()) }
        <set-attribute name="$exist:path" value="{$exist:path}"/>
    </dispatch>

else if ($exist:resource = "login") then (
    util:declare-option("exist:serialize", "method=json media-type=application/json"),
    try {
        let $loggedIn := $login("org.exist.login", (), true())
        return
            if (xmldb:get-current-user() != "guest") then
                <response>
                    <user>{xmldb:get-current-user()}</user>
                    <isDba json:literal="true">true</isDba>
                </response>
            else (
                <response>
                    <fail>Wrong user or password</fail>
                </response>
            )
    } catch * {
        <response>
            <fail>{$err:description}</fail>
        </response>
    }

) else if (ends-with($exist:resource, ".html")) then
    (:~
     : Pages ending with .html are run through view.xql to
     : expand templates.
     :)
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <view>
            <forward url="{$exist:controller}/modules/view.xql">
                {$login("org.exist.login", (), true())}
                <set-attribute name="$exist:prefix" value="{$exist:prefix}"/>
                <set-header name="Cache-Control" value="no-cache"/>
            </forward>
        </view>
    	<error-handler>
			<forward url="{$exist:controller}/error-page.html" method="get"/>
			<forward url="{$exist:controller}/modules/view.xql"/>
		</error-handler>
    </dispatch>

else if (starts-with($exist:path, "/_shared/")) then
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="/shared-resources/{substring-after($exist:path, '/_shared/')}"/>
    </dispatch>

else
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <cache-control cache="yes"/>
    </dispatch>
