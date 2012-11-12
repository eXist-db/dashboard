xquery version "1.0";

(:~ Retrieve package list from server. Needed to work around cross-site-scripting browser restrictions. :)
declare option exist:serialize "method=html media-type=text/html";

import module namespace dash="http://exist-db.org/apps/dashboard" at "dashboard.xql";

let $url := request:get-parameter("url", ())
let $baseURL := substring-before($url, "apps.xml")
return
    if ($url) then
        let $data := httpclient:get($url, false(), ())
        let $status := xs:int($data/@statusCode)
        return
            if ($status != 200) then
                response:set-status-code($status)
            else
                for $app in $data/httpclient:body//app
                return
                    dash:display-app($baseURL, $app, true())
    else
        for $app in dash:installed-apps()
        return
            dash:display-app((), $app, false())