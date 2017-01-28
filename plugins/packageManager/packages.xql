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
    let $apps := if ($format = "manager") then $apps except $apps[@removable="no"] else $apps
    for $app in $apps
    order by upper-case($app/title/text())
    return
       packages:display($config:REPO, $app, $format)
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
                let $icon :=
                    let $iconRes := repo:get-resource($app, "icon.png")
                    let $hasIcon := exists($iconRes)
                    return
                        $hasIcon
                let $app-url :=
                    if ($repoXML//repo:target) then
                        let $target := 
                            if (starts-with($repoXML//repo:target, "/")) then
                                replace($repoXML//repo:target, "^/.*/([^/]+)", "$1")
                            else
                                $repoXML//repo:target
                        return
                            replace(
                                request:get-context-path() || "/" || request:get-attribute("$exist:prefix") || "/" || $target || "/",
                                "/+", "/"
                            )
                    else
                        ()
                return
                    <app status="installed" path="{$expathXML//@name}">
                        <title>{$expathXML//expath:title/text()}</title>
                        <name>{$expathXML//@name/string()}</name>
                        <description>{$repoXML//repo:description/text()}</description>
                        {
                            for $author in $repoXML//repo:author
                            return
                                <author>{$author/text()}</author>
                        }
                        <abbrev>{$expathXML//@abbrev/string()}</abbrev>
                        <website>{$repoXML//repo:website/text()}</website>
                        <version>{$expathXML//expath:package/@version/string()}</version>
                        <license>{$repoXML//repo:license/text()}</license>
                        <icon>{if ($icon) then 'modules/get-icon.xql?package=' || $app else 'resources/images/package.png'}</icon>
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
    let $data :=
        let $meta := repo:get-resource($app, $name)
        return
            if (exists($meta)) then util:binary-to-string($meta) else ()
    return
        if (exists($data)) then
            try {
                util:parse($data)
            } catch * {
                <meta xmlns="http://exist-db.org/xquery/repo">
                    <description>Invalid repo descriptor for app {$app}</description>
                </meta>
            }
        else
            ()
};

declare %private function packages:public-repo-contents($installed as element(app)*) {
    try {
        let $url := $config:REPO || "/public/apps.xml?version=" || packages:get-version() ||
            "&amp;source=" || util:system-property("product-source")
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
                    if ($app/abbrev = $installed/abbrev) then
                        if (packages:is-newer($app/version/string(), $installed[abbrev = $app/abbrev]/version)) then
                            element { node-name($app) } {
                                attribute available { $app/version/string() },
                                attribute installed { $installed[abbrev = $app/abbrev]/version/string() },
                                $app/@*,
                                $app/*
                            }
                        else
                            ()
                    else
                        $app
                }, $data/httpclient:body//app)
    } catch * {
        util:log("WARN", "Error while retrieving app packages: " || $err:description)
    }
};

declare %private function packages:get-version() {
    (util:system-property("product-semver"), util:system-property("product-version"))[1]
};

declare %private function packages:display($repoURL as xs:anyURI?, $app as element(app), $format as xs:string?) {
    let $icon :=
        if ($app/icon) then
            if ($app/@status) then
                $app/icon[1]
            else
                $repoURL || "/public/" || $app/icon[1]
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
                let $installed := $app/@installed/string()
                let $available := $app/@available/string()
                let $hasNewer := 
                    if ($app/@available) then
                        packages:is-newer($available, $installed)
                    else
                        false()
                return
                    <li tabindex="0" data-name="{$app/name/string()}"
                        class="package {if ($app/@status = 'installed') then 'installed' else 'notInstalled'} {$app/type}">
                        { if ($hasNewer) then attribute data-update { "true" } else () }
                        <div class="packageIconArea">
                        {
                            if ($app/@status = "installed" and $app/type = 'application') then
                                <a href="{$url}" target="_blank" title="click to open application"><img class="appIcon" src="{$icon}"/></a>
                            else
                                <img class="appIcon" src="{$icon}"/>
                        }
                        <div class="appFunctions">
                        {
                            
                            if ($app/@status = "installed") then
                                    <form action="">
                                        <input type="hidden" name="package-url" value="{$app/@path}"/>
                                        <input type="hidden" name="abbrev" value="{$app/abbrev}"/>
                                        <input type="hidden" name="action" value="remove"/>
                                        <input type="hidden" name="type" value="application"/>
                                        <button class="toobarBtn deleteApp" title="Uninstall">
                                            <img src="plugins/packageManager/images/deleteApp1.png"/>
                                        </button>
                                    </form>
                            else
                                    <form action="">
                                        <input type="hidden" name="package-url" value="{$app/name}"/>
                                        <input type="hidden" name="abbrev" value="{$app/abbrev}"/>
                                        <input type="hidden" name="version" value="{$app/version}"/>
                                        <input type="hidden" name="action" value="install"/>
                                        <input type="hidden" name="type" value="application"/>
                                        <button class="toobarBtn installApp" title="Install">
                                            <img src="plugins/packageManager/images/dbplus2.png" alt="Install" title="Install"/>
                                        </button>
                                    </form>
    
                        }
                        </div>
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
                                    if ($hasNewer) then (
                                        <p class="upgrade">Installed version: {$installed}. Available: {$available}.
                                        {
                                            if ($app/changelog/change[@version = $available]) then
                                                <a href="#" class="show-changes" data-version="{$available}">Changes</a>
                                            else
                                                ()
                                        }
                                        </p>,
                                        <div class="changes" style="display: none;">
                                        { $app/changelog/change[@version = $available]/node() }
                                        </div>
                                    ) else
                                        ()
                                else
                                    <p>Version: {$app/version/text()}</p>
                            }
                            {
                                if ($app/@size) then
                                    <p>Size: { $app/@size idiv 1024 }k</p>
                                else
                                    ()
                            }
                            {
                                if ($app/requires) then
                                    <p class="requires">Requires eXist-db {packages:required-version($app/requires)}</p>
                                else
                                    ()
                            }
                        </div>
                        {
                            if ($app/note) then
                                (: Installation notes are shown if user clicks on install :)
                                <p class="installation-note" style="display: none">{ $app/note/node() }</p>
                            else
                                ()
                        }
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
                                <th>Name (URI):</th>
                                <td>{ $app/name/string() }</td>
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
                            {
                                if ($app/website != "") then
                                    <tr>
                                        <th>Website:</th>
                                        <td><a href="{$app/website}">{ $app/website/text() }</a></td>
                                    </tr>
                                else
                                    ()
                            }
                            {
                                if ($app/other/version) then
                                    <tr>
                                        <th colspan="2">Other Versions:</th>
                                    </tr>
                                else
                                    ()
                            }
                            {
                                for $version in $app/other/version
                                return
                                    <tr>
                                        <th>{$version/@version/string()}</th>
                                        <td>
                                            <form action="">
                                                <input type="hidden" name="package-url" value="{$app/name}"/>
                                                <input type="hidden" name="abbrev" value="{$app/abbrev}"/>
                                                <input type="hidden" name="version" value="{$version/@version}"/>
                                                <input type="hidden" name="action" value="install"/>
                                                <input type="hidden" name="type" value="application"/>
                                                <button class="installApp" title="Install">Install</button>
                                            </form>
                                        </td>
                                    </tr>
                            }
                        </table>
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
                                    <a href="{$app/url}" target="_blank"><img class="appIcon" src="{$icon}"/></a>
                                else
                                    <img class="appIcon" src="{$icon}"/>
                            }
                            <h3>{$app/title/text()}</h3>
                        </button>
                    </li>
};

declare %private function packages:required-version($required as element(requires)) {
    string-join((
        if ($required/@semver-min) then
            " > " || $required/@semver-min
        else
            (),
        if ($required/@semver-max) then
            " < " || $required/@semver-max
        else
            (),
        if ($required/@version) then
            " " || $required/@version
        else
            ()
    ))
};

declare %private function packages:is-newer($available as xs:string, $installed as xs:string) as xs:boolean {
    let $verInstalled := tokenize($installed, "\.")
    let $verAvailable := tokenize($available, "\.")
    return
        packages:compare-versions($verInstalled, $verAvailable)
};

declare %private function packages:compare-versions($installed as xs:string*, $available as xs:string*) as xs:boolean {
    if (empty($installed)) then
        exists($available)
    else if (empty($available)) then
        false()
    else if (head($available) = head($installed)) then
        packages:compare-versions(tail($installed), tail($available))
    else
        number(head($available)) > number(head($installed))
};