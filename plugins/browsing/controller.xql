xquery version "1.0";

declare namespace json="http://www.json.org";
declare namespace control="http://exist-db.org/apps/dashboard/controller";
declare namespace output="http://exquery.org/ns/rest/annotation/output";
declare namespace rest="http://exquery.org/ns/restxq";

import module namespace login-helper="http://exist-db.org/apps/dashboard/login-helper" at "../../modules/login-helper.xql";
import module namespace restxq="http://exist-db.org/xquery/restxq" at "../../modules/restxq.xql";
import module namespace service="http://exist-db.org/apps/dashboard/service" at "service.xql";

declare variable $exist:path external;
declare variable $exist:resource external;
declare variable $exist:controller external;
declare variable $exist:prefix external;
declare variable $exist:root external;

declare variable $login := login-helper:get-login-method();

(:~
 : Pages ending with .html are run through view.xql to
 : expand templates.
 :)
if (ends-with($exist:resource, ".html")) then
    (: the html page is run through view.xql to expand templates :)
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <view>
            <forward url="../../modules/view.xql">
                {$login("org.exist.login", (), true())}
                <set-header name="Cache-Control" value="no-cache"/>
            </forward>
        </view>
    	<error-handler>
			<forward url="../../error-page.html" method="get"/>
			<forward url="../../modules/view.xql"/>
		</error-handler>
    </dispatch>

else if (ends-with($exist:resource, ".xql")) then
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        { $login("org.exist.login", (), true()) }
        <set-attribute name="$exist:path" value="{$exist:path}"/>
    </dispatch>
    
else if (starts-with($exist:path, "/contents") or starts-with($exist:path, "/properties") or starts-with($exist:path, "/permissions") or starts-with($exist:path, "/acl")) then
    let $funcs := (util:list-functions(), util:list-functions("http://exist-db.org/apps/dashboard/service"))
    let $login := $login("org.exist.login", (), true())
    return
        restxq:process($exist:path, $funcs)

else
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <cache-control cache="yes"/>
    </dispatch>
