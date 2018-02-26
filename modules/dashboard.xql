xquery version "3.1";
declare namespace output="http://www.w3.org/2010/xslt-xquery-serialization";
declare option exist:serialize "method=html media-type=text/html";

declare option output:method "json";
declare option output:media-type "application/json";

let $components := doc("/db/apps/existdb-dashboard/config.xml")//component


return
    array{
     for $component in $components
        let $name := data($component/@name)
        let $label := data($component/@label)
        let $icon := data($component/@icon)
        return
            map{
                "name":$name,
                "label":$label,
                "icon": $icon
            }
}