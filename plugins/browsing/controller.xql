xquery version "1.0";

declare namespace json="http://www.json.org";
declare namespace control="http://exist-db.org/apps/dashboard/controller";
declare namespace output="http://exquery.org/ns/rest/annotation/output";
declare namespace rest="http://exquery.org/ns/restxq";

import module namespace login="http://exist-db.org/xquery/app/wiki/session" at "../../modules/login.xql";
import module namespace restxq="http://exist-db.org/xquery/restxq" at "../../modules/restxq.xql";
import module namespace service="http://exist-db.org/apps/dashboard/service" at "service.xql";

declare variable $exist:path external;
declare variable $exist:resource external;
declare variable $exist:controller external;
declare variable $exist:prefix external;
declare variable $exist:root external;

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
            <forward url="../../modules/view.xql">
                {login:set-user("org.exist.login", (), true())}
                <set-header name="Cache-Control" value="no-cache"/>
            </forward>
        </view>
    	<error-handler>
			<forward url="../../error-page.html" method="get"/>
			<forward url="../../modules/view.xql"/>
		</error-handler>
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

let $funcs := (util:list-functions(), util:list-functions("http://exist-db.org/apps/dashboard/service"))
let $login := login:set-user("org.exist.login", (), true())
return
    restxq:process($exist:path, $funcs)