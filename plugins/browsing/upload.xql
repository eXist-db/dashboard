xquery version "3.0";

declare namespace json="http://www.json.org";

declare option exist:serialize "method=json media-type=application/json";

let $collection := request:get-parameter("collection", ())
let $names := request:get-uploaded-file-name("uploadedfiles[]")
let $files := request:get-uploaded-file-data("uploadedfiles[]")
return
    <response>
    {
        map-pairs(function($name, $file) {
            let $stored := xmldb:store($collection, xmldb:encode-uri($name), $file)
            let $log := util:log("DEBUG", ("Uploaded: ", $stored))
            return
                <json:value json:array="true">
                    <file>{$stored}</file>
                    <size>xmldb:size($collection, $name)</size>
                    <type>xmldb:get-mime-type($stored)</type>
                </json:value>
        }, $names, $files)
    }
    </response>