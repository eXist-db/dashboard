xquery version "3.1";

module namespace dashboard="http://exist-db.org/apps/existdb-dashboard";

import module namespace packages="http://exist-db.org/apps/existdb-packages" at "packages/packages.xqm";

declare function dashboard:display-applications(){
    let $packages := packages:get-local-applications()
    for $package in $packages
        order by upper-case($package/title/text())
        return
            dashboard:display-package($package)

};

declare function dashboard:display-package($app as element(app)) {
(: todo - how to handle 'hasDetailsLevel? Needed at all ? :)
    let $hasDetailsLevel := true()

    let $icon :=
        if ($app/icon) then
            if ($app/@status) then
                $app/icon[1]
            else
                packages:get-repo-locations() || "/public/" || $app/icon[1]
        else
            "resources/images/package.png"
    let $url :=
        if ($app/url) then
            $app/url
        else
            $app/@path
    return
        let $installed := $app/@installed/string()
        let $available := $app/@available/string()
        let $hasNewer :=
            if ($app/@available) then
                packages:is-newer($available, $installed)
            else
                false()
        let $status := if ($app/@status = 'installed') then 'installed' else 'notInstalled'

        return
            <existdb-package-descriptor tabindex="0" url="{$url}" data-name="{$app/name/string()}" status="{$status}" type="{$app/type}" installed="{$installed}" available="{$available}" abbrev="{$app/abbrev}" short-title="{$app/title/text()}">
                { if ($hasNewer) then attribute data-update { "true" } else () }

                {
                    if ($app/@status = "installed" and $app/type = 'application') then
                        <existdb-app-icon>
                            <a href="{$url}" target="_blank" title="click to open application" tabindex="-1"><img class="appIcon" src="{$icon}"/></a>
                        </existdb-app-icon>
                    else
                        <existdb-app-icon>
                            <img class="appIcon" src="{$icon}"/>
                        </existdb-app-icon>
                }
                <existdb-app-title>{$app/title/text()}</existdb-app-title>
                {
                    if ($hasDetailsLevel and $app/@available) then
                        if ($hasNewer) then (

                            <existdb-app-update installed="{$installed}" available="{$available}">
                                {
                                    if ($app/changelog/change[@version = $available]) then
                                        <a href="#" class="show-changes" data-version="{$available}">Changes</a>
                                    else
                                        ()
                                }
                            </existdb-app-update>,
                            <existdb-app-changes>
                                {$app/changelog/change[@version = $available]/node()}
                            </existdb-app-changes>
                        ) else
                            ()
                    else
                        <existdb-app-version>Version: {$app/version/text()}</existdb-app-version>
                }
            </existdb-package-descriptor>
};
