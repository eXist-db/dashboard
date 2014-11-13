xquery version "3.0";

module namespace dash="http://exist-db.org/apps/dashboard";

declare namespace expath="http://expath.org/ns/pkg";
declare namespace repo="http://exist-db.org/xquery/repo";

import module namespace config="http://exist-db.org/xquery/apps/config" at "config.xqm";
import module namespace templates="http://exist-db.org/xquery/templates" at "templates.xql";
import module namespace packages="http://exist-db.org/apps/dashboard/packages/rest" at "../plugins/packageManager/packages.xql";

declare variable $dash:DEFAULTS := doc($config:app-root || "/defaults.xml")/apps;

declare %templates:wrap function dash:user($node as node(), $model as map(*)) {
    let $user := request:get-attribute("org.exist.login.user")
    return
        if ($user) then
            $user
        else
            "Not logged in"
};

declare function dash:list-apps($node as node(), $model as map(*)) {
    element { node-name($node) } {
        $node/@*,
        $node/*,
        packages:get("local", "manager", false())
    }
};

declare %templates:wrap function dash:list-repo($node as node(), $model as map(*)) {
    
    for  $repo at $index in $config:REPO
    return
        <div>
            <label for="repo-url-{$index}">{data($repo/label)}</label>
            <input id="repo-url-{$index}" type="text" readonly="" name="repo-url" data-dojo-type="dijit.form.ValidationTextBox" data-dojo-props="regExp:'(http|ftp|https):\/\/.*', required:true, invalidMessage:'Invalid URI.'" style="width: 100%;" value="{$repo/url}/public/apps.xml"/>
        </div>

};