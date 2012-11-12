xquery version "3.0";

module namespace packages="http://exist-db.org/apps/dashboard/packages/rest";

import module namespace config="http://exist-db.org/xquery/apps/config" at "../../modules/config.xqm";

declare namespace json="http://www.json.org";
declare namespace output="http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace rest="http://exquery.org/ns/restxq";
declare namespace expath="http://expath.org/ns/pkg";
declare namespace repo="http://exist-db.org/xquery/repo";
declare namespace http="http://expath.org/ns/http-client";

declare variable $packages:DEFAULTS := doc($config:app-root || "/defaults.xml")/apps;

declare variable $packages:REPO := xs:anyURI("http://demo.exist-db.org/exist/apps/public-repo");

declare variable $packages:HIDE := ("dashboard");

declare
    %rest:GET
    %rest:path("/packages")
    %rest:query-param("format", "{$format}")
    %rest:query-param("plugins", "{$plugins}")
    %rest:query-param("type", "{$type}")
function packages:get($type as xs:string?, $format as xs:string?, $plugins as xs:string?) {
    let $apps := packages:default-apps($plugins) | packages:installed-apps($format)
    let $apps := 
        if ($type = "local") then $apps else packages:public-repo-contents($apps)
    for $app in $apps
    return
       packages:display($packages:REPO, $app, $format)
};

declare %private function packages:default-apps($plugins as xs:string?) {
    if ($plugins) then
        $packages:DEFAULTS/app
    else
        filter(function($app as element(app)) {
            if ($app/type = 'plugin') then
                ()
            else
                $app
        }, $packages:DEFAULTS/app)
};

declare %private function packages:installed-apps($format as xs:string?) as element(app)* {
    packages:scan-repo(
        function ($app, $expathXML, $repoXML) {
            if ($format = "manager" or $repoXML//repo:type = "application") then
                let $icon := repo:get-resource($app, "icon.png")
                let $app-url :=
                    if ($repoXML//repo:target) then
                        concat(
                            request:get-context-path(), "/apps",
                            substring-after($repoXML//repo:target, "/db"), "/"
                        )
                    else
                        ()
                return
                    <app status="installed" path="{$expathXML//@name}">
                        <title>{$expathXML//expath:title/text()}</title>
                        <description>{$repoXML//repo:description/text()}</description>
                        {
                            for $author in $repoXML//repo:author
                            return
                                <author>{$author/text()}</author>
                        }
                        <abbrev>{$expathXML//@abbrev/string()}</abbrev>
                        <website>{$repoXML//repo:website/text()}</website>
                        <version>{$expathXML//@version/string()}</version>
                        <license>{$repoXML//repo:license/text()}</license>
                        <icon>{if (exists($icon)) then 'modules/get-icon.xql?package=' || $app else 'resources/images/package.png'}</icon>
                        <url>{$app-url}</url>
                        <type>{$repoXML//repo:type/text()}</type>
                    </app>
            else
                ()
        }
    )
};

declare %private function packages:scan-repo($callback as function(xs:string, element(), element()?) as item()*) {
    for $app in repo:list()
    let $expathMeta := packages:get-package-meta($app, "expath-pkg.xml")
    let $repoMeta := packages:get-package-meta($app, "repo.xml")
    return
        $callback($app, $expathMeta, $repoMeta)
};

declare %private function packages:get-package-meta($app as xs:string, $name as xs:string) {
    let $meta := repo:get-resource($app, $name)
    let $data := if (exists($meta)) then util:binary-to-string($meta) else ()
    return
        if (exists($data)) then
            util:parse($data)
        else
            ()
};

declare %private function packages:public-repo-contents($installed as element(app)*) {
    try {
        let $url := "http://demo.exist-db.org/exist/apps/public-repo/public/apps.xml"
        (: EXPath client module does not work properly. No idea why. :)
(:        let $request :=:)
(:            <http:request method="get" href="{$url}" timeout="10">:)
(:                <http:header name="Cache-Control" value="no-cache"/>:)
(:            </http:request>:)
(:        let $data := http:send-request($request):)
        let $data := httpclient:get($url, false(), ())
        let $status := xs:int($data/@statusCode)
        return
            if ($status != 200) then
                response:set-status-code($status)
            else
                map(function($app as element(app)) {
                    (: Ignore apps which are already installed :)
                    if ($installed/abbrev = $app/abbrev) then
                        if ($installed/version = $app/version) then
                            ()
                        else
                            element { node-name($app) } {
                                attribute available { $app/version/string() },
                                attribute installed { $installed[abbrev = $app/abbrev]/version/string() },
                                $app/@*,
                                $app/*
                            }
                    else
                        $app
                }, $data/httpclient:body//app)
    } catch * {
        util:log("WARN", "Error while retrieving app packages: " || $err:description)
    }
};

declare %private function packages:display($repoURL as xs:anyURI?, $app as element(app), $format as xs:string?) {
    let $icon :=
        if ($app/icon) then
            if ($app/@status) then
                $app/icon
            else
                $repoURL || "/public/" || $app/icon
        else
            "resources/images/package.png"
    let $url :=
        if ($app/url) then
            $app/url
        else
            $app/@path
    return
        switch ($format)
            case "manager" return
                <li tabindex="0" class="package {if ($app/@status = 'installed') then 'installed' else 'notInstalled'} {$app/type}">
                    <div class="packageIconArea">
                    {
                        if ($app/@status = "installed" and $app/type = 'application') then
                            <a href="{$url}" target="_blank" title="click to open application"><img src="{$icon}"/></a>
                        else
                            <img src="{$icon}"/>
                    }
                    </div>
                    {
                        switch ($app/type)
                            case ('application') return
                                <img src="resources/images/app.gif" class="ribbon" alt="application" title="This is an application"/>
                            case ('library') return
                                <img src="resources/images/library2.gif" class="ribbon" alt="library" title="This is a library"/>
                            case ('plugin') return
                                <img src="resources/images/plugin2.gif" class="ribbon" alt="plugin" title="This is a plugin"/>
                            default return ()
                    }
                    <div class="shortTitle">
                        <h3>{$app/title/text()}</h3>
                        {
                            if ($app/@available) then
                                <p class="upgrade">Installed version: {$app/@installed/string()}. Available: {$app/@available/string()}</p>
                            else
                                <p>Version: {$app/version/text()}</p>
                        }
                    </div>
                    <table>
                        <tr class="title">
                            <th>Title:</th>
                            <td>{ $app/title/text() }</td>
                        </tr>
                        <tr>
                            <th>Short:</th>
                            <td>{ $app/abbrev/text() }</td>
                        </tr>
                        <tr>
                            <th>Description:</th>
                            <td>{ $app/description/text() }</td>
                        </tr>
                        <tr>
                            <th>Author(s):</th>
                            <td>
                                <ul>
                                {
                                    for $author in $app/author
                                    return
                                        <li>{$author/text()}</li>
                                }
                                </ul>
                            </td>
                        </tr>
                        <tr>
                            <th>Version:</th>
                            <td>{ $app/version/text() }</td>
                        </tr>
                        <tr>
                            <th>License:</th>
                            <td>{ $app/license/text() }</td>
                        </tr>
                        <tr>
                            <th>Website:</th>
                            <td><a href="{$app/website}">{ $app/website/text() }</a></td>
                        </tr>
                    </table>
                    {
                        if ($app/@status = "installed") then
                            <div class="toolbar">
                                <form action="">
                                    <input type="hidden" name="package-url" value="{$app/@path}"/>
                                    <input type="hidden" name="abbrev" value="{$app/abbrev}"/>
                                    <input type="hidden" name="action" value="remove"/>
                                    <input type="hidden" name="type" value="application"/>
                                    <button class="toobarBtn deleteApp" title="Uninstall">
                                        <img src="plugins/packageManager/images/Remove-32.png"/>
                                    </button>
                                </form>
                                
                            </div>
                        else
                            <div class="toolbar">
                                <form action="">
                                    <input type="hidden" name="server-url" value="{$repoURL}"/>
                                    <input type="hidden" name="package-url" value="{$app/@path}"/>
                                    <input type="hidden" name="abbrev" value="{$app/abbrev}"/>
                                    <input type="hidden" name="action" value="install"/>
                                    <input type="hidden" name="type" value="application"/>
                                    <button class="toobarBtn installApp" title="Install">
                                        <img src="plugins/packageManager/images/Upload-32.png" alt="Install" title="Install"/>
                                    </button>
                                </form>
                            </div>
                    }
                </li>
            default return
                if ($app/abbrev = $packages:HIDE) then
                    ()
                else
                    <li class="package dojoDndItem {$app/type}" style="opacity: 0;">
                        <button id="{util:uuid()}" title="{$app/title/text()}" data-exist-appUrl="{$app/url}"
                            data-exist-requireLogin="{$app/@role = 'dba'}">
                            {
                                if ($app/url) then
                                    <a href="{$app/url}" target="_blank"><img src="{$icon}"/></a>
                                else
                                    <img src="{$icon}"/>
                            }
                            <h3>{$app/title/text()}</h3>
                        </button>
                    </li>
};