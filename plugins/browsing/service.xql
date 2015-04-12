xquery version "3.0";

module namespace service="http://exist-db.org/apps/dashboard/service";

import module namespace sm = "http://exist-db.org/xquery/securitymanager";
import module namespace jsjson = "http://johnsnelson/json" at "../userManager/jsjson.xqm";

declare namespace json="http://www.json.org";
declare namespace output="http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace rest="http://exquery.org/ns/restxq";

declare
    %rest:DELETE
    %rest:path("/contents/")
    %rest:form-param("resources", "{$resources}")
    %output:media-type("application/json")
    %output:method("json")
function service:delete-resources($resources as xs:string*) {
    try {
        for $resource in $resources
        return
            if (xmldb:collection-available($resource)) then
                xmldb:remove($resource)
            else
                let $split := analyze-string($resource, "^(.*)/([^/]+)$")//fn:group/string()
                return
                    xmldb:remove($split[1], $split[2]),
        <response status="ok"/>
    } catch * {
        <response status="fail">
            <message>{$err:description}</message>
        </response>
    }
};

declare
    %rest:GET
    %rest:path("/contents/")
    %rest:query-param("collection", "{$collection}")
    %output:media-type("application/json")
    %output:method("json")
function service:resources($collection as xs:string) {
    let $collection := $collection
    let $user := if (request:get-attribute('org.exist.login.user')) then request:get-attribute('org.exist.login.user') else "guest"
    let $start := number(request:get-parameter("start", 0)) + 1
    let $endParam := number(request:get-parameter("end", 1000000)) + 1
    let $resources := service:list-collection-contents($collection, $user)
    let $end := if ($endParam gt count($resources)) then count($resources) else $endParam
    let $subset := subsequence($resources, $start, $end - $start + 1)
    let $parent :=
        if (matches($collection, "^/db/?$")) then
            "/db"
        else
            replace($collection, "^(.*)/[^/]+/?$", "$1")
    let $totalcount := count($resources) + (if($collection eq "/db") then 0 else 1)
    return (
        response:set-header("Content-Range", "items 0-" || count($subset) + 1 || "/" || $totalcount),
        <json:value> {
            if($collection ne "/db")then
                service:resource-xml($parent, "..", true(), $user)
            else(),  
        
            for $resource in $subset
            let $is-collection := local-name($resource) eq "collection"
            let $path := string-join(($collection, $resource), "/")
            return
                service:resource-xml($path, (), $is-collection, $user)
        }
        </json:value>
    )
};

declare
    %private
function service:resource-xml($path as xs:string, $name as xs:string?, $is-collection as xs:boolean, $user as xs:string) as element(json:value) {
    let $permission := sm:get-permissions(xs:anyURI($path))/sm:permission,
    $collection := replace($path, "(.*)/.*", "$1"),
    $resource := replace($path, ".*/(.*)", "$1"),
    $created := 
        if($is-collection) then
            format-dateTime(xmldb:created($path), "[MNn] [D00] [Y0000] [H00]:[m00]:[s00]")
        else
            format-dateTime(xmldb:created($collection, $resource), "[MNn] [D00] [Y0000] [H00]:[m00]:[s00]")
       ,
    $last-modified :=
                if($is-collection) then
                    $created
                else
                    format-dateTime(xmldb:last-modified($collection, $resource), "[MNn] [D00] [Y0000] [H00]:[m00]:[s00]")
                ,
    $internet-media-type :=
        if($is-collection) then
            "<Collection>"
        else
            xmldb:get-mime-type(xs:anyURI($path))
        ,
    $can-write :=
        if($is-collection) then
            service:canWrite($path, $user)
        else
            service:canWriteResource($collection, $resource, $user)
    return
    
        <json:value json:array="true">
            <name>{if($name)then $name else replace($path, ".*/(.*)", "$1")}</name>
            <id>{$path}</id>
            <permissions>{if($is-collection)then "c" else "-"}{string($permission/@mode)}{if($permission/sm:acl/@entries ne "0")then "+" else ""}</permissions>
            <owner>{string($permission/@owner)}</owner>
            <group>{string($permission/@group)}</group>
            <internetMediaType>{$internet-media-type}</internetMediaType>
            <created>{$created}</created>
            <lastModified>{$last-modified}</lastModified>
            <writable json:literal="true">{$can-write}</writable>
            <isCollection json:literal="true">{$is-collection}</isCollection>
        </json:value>
};

declare
    %private
function service:permissions-classes-xml($permission as element(sm:permission)) as element(class)+ {
    let $chars := for $ch in string-to-codepoints($permission/@mode)
        return codepoints-to-string($ch)
    return
    (
        <class>
            <id>User</id>
            <read json:literal="true">{$chars[1] = "r"}</read>
            <write json:literal="true">{$chars[2] = "w"}</write>
            <execute json:literal="true">{$chars[3] = ("x", "s")}</execute>
            <special json:literal="true">{$chars[3] = ("s", "S")}</special>
            <specialLabel>SetUID</specialLabel>
        </class>,
        <class>
            <id>Group</id>
            <read json:literal="true">{$chars[4] = "r"}</read>
            <write json:literal="true">{$chars[5] = "w"}</write>
            <execute json:literal="true">{$chars[6] = ("x", "s")}</execute>
            <special json:literal="true">{$chars[6] = ("s", "S")}</special>
            <specialLabel>SetGID</specialLabel>
        </class>,
        <class>
            <id>Other</id>
            <read json:literal="true">{$chars[7] = "r"}</read>
            <write json:literal="true">{$chars[8] = "w"}</write>
            <execute json:literal="true">{$chars[9] = ("x", "t")}</execute>
            <special json:literal="true">{$chars[9] = ("t", "T")}</special>
            <specialLabel>Sticky</specialLabel>
        </class>
    )
};

declare
    %rest:POST
    %rest:path("/contents/{$target}")
    %rest:form-param("action", "{$action}", "copy")
    %rest:form-param("resources", "{$sources}")
    %output:media-type("application/json")
    %output:method("json")
function service:copyOrMove($target as xs:string, $sources as xs:string*, $action as xs:string) {
    let $target := concat("/", $target)
    let $user := if (request:get-attribute('org.exist.login.user')) then request:get-attribute('org.exist.login.user') else "guest"
    return
        if ($action = "reindex") then
            let $reindex := xmldb:reindex($target)
            return
                <response status="ok"/>
        else
            if (service:canWrite($target, $user)) then (
                for $source in $sources
                let $isCollection := xmldb:collection-available($source)
                return
                    if ($isCollection) then
                        switch($action)
                            case "move" return
                                xmldb:move($source, $target)
                            default return
                                xmldb:copy($source, $target)
                    else
                        let $split := analyze-string($source, "^(.*)/([^/]+)$")//fn:group/string()
                        return
                            switch ($action)
                                case "move" return
                                    xmldb:move($split[1], $target, $split[2])
                                default return
                                    xmldb:copy($split[1], $target, $split[2]),
                    <response status="ok"/>
            ) else
                <response status="fail">
                    <message>You are not allowed to write to collection {$target}.</message>
                </response>
};

declare
    %rest:PUT
    %rest:path("/contents/{$create}")
    %rest:query-param("collection", "{$collection}")
    %output:media-type("application/json")
    %output:method("json")
function service:create-collection($collection as xs:string, $create as xs:string) {
    let $user := if (request:get-attribute('org.exist.login.user')) then request:get-attribute('org.exist.login.user') else "guest"
    let $log := util:log("DEBUG", ("creating collection ", $collection))
    return
        if (service:canWrite($collection, $user)) then
            (xmldb:create-collection($collection, $create), <response status="ok"/>)[2]
        else
            <response status="fail">
                <message>You are not allowed to write to collection {$collection}.</message>
            </response>
};

declare
    %rest:GET
    %rest:path("/permissions/{$id}/{$class}")
    %output:media-type("application/json")
    %output:method("json")
function service:get-permissions($id as xs:string, $class as xs:string) as element(json:value) {
    let $path := service:id-to-path($id),
    $permissions := sm:get-permissions(xs:anyURI($path))/sm:permission
    return
       <json:value>
        { 
            for $c in service:permissions-classes-xml($permissions)[if(string-length($class) eq 0)then true() else id = $class] return
                <json:value json:array="true">{
                    $c/child::element()
                }</json:value>
        }
        </json:value>
};

declare
    %rest:PUT
    %rest:path("/permissions/{$id}/{$class}")
    %output:media-type("application/json")
    %output:method("json")
function service:save-permissions($id as xs:string, $class as xs:string) {
    let $recv-permissions := jsjson:parse-json(util:base64-decode(request:get-data())),
    $path := service:id-to-path($id)
    return
    
        let $cs :=
            if($recv-permissions/pair[@name eq "id"] eq "User") then
                ("u", if($recv-permissions/pair[@name eq "special"] eq "true") then "+s" else "-s")
            else if($recv-permissions/pair[@name eq "id"] eq "Group") then
                ("g", if($recv-permissions/pair[@name eq "special"] eq "true") then "+s" else "-s")
            else if($recv-permissions/pair[@name eq "id"] eq "Other") then
                ("o", if($recv-permissions/pair[@name eq "special"] eq "true") then "+t" else "-t")
            else(),
            
        $c := $cs[1], (: received class :)
        $s := $cs[2], (: received special :)
            
        $r := 
            concat(if($recv-permissions/pair[@name eq "read"] eq "true") then
                "+"
            else 
                "-"
            ,"r"),
        
        $w :=
            concat(if($recv-permissions/pair[@name eq "write"] eq "true") then
                "+"
            else 
                "-"
            ,"w"),
            
        $x :=
            concat(if($recv-permissions/pair[@name eq "execute"] eq "true") then
                "+"
            else 
                "-"
            ,"x")
            
        return
            if(not(empty($cs))) then
            (
                sm:chmod(xs:anyURI($path), $c || $r || "," || $c || $w || "," || $c || $x || "," || $c || $s),
                <response status="ok"/>
            )
            else
                <response status="fail">
                    <message>Invalid class to set permissons for!</message>
                </response>
};

declare
    %rest:GET
    %rest:path("/acl/{$id}/{$acl-id}")
    %output:media-type("application/json")
    %output:method("json")
function service:get-acl($id as xs:string, $acl-id as xs:string) as element(json:value) {
    let $path := service:id-to-path($id),
    $permissions := sm:get-permissions(xs:anyURI($path))/sm:permission
    return
       <json:value>
        { 
            for $ace in $permissions/sm:acl/sm:ace[if(string-length($acl-id) eq 0)then true() else @index eq $acl-id] return
                <json:value json:array="true">
                    <id>{$ace/string(@index)}</id>
                    <target>{$ace/string(@target)}</target>
                    <who>{$ace/string(@who)}</who>
                    <access_type>{$ace/string(@access_type)}</access_type>
                    <read json:literal="true">{$ace/contains(@mode, "r")}</read>
                    <write json:literal="true">{$ace/contains(@mode, "w")}</write>
                    <execute json:literal="true">{$ace/contains(@mode, "x")}</execute>
                </json:value>
        }
        </json:value>
};

declare
    %private
function service:id-to-path($id as xs:string) as xs:string {
    replace($id, "\.\.\.", "/")
};

declare
    %rest:POST
    %rest:path("/properties/")
    %rest:form-param("owner", "{$owner}")
    %rest:form-param("group", "{$group}")
    %rest:form-param("resources", "{$resources}")
    %rest:form-param("mime", "{$mime}")
    %output:media-type("application/json")
    %output:method("json")
function service:change-properties($resources as xs:string, $owner as xs:string?, $group as xs:string?, $mime as xs:string?) {
    for $resource in $resources
    let $uri := xs:anyURI($resource)
    return (
        sm:chown($uri, $owner),
        sm:chgrp($uri, $group),
        sm:chmod($uri, service:permissions-from-form()),
        xmldb:set-mime-type($resource, $mime)
    ),
    <response status="ok"/>
};

(:declare:)
(:    %rest:POST:)
(:    %rest:path("/upload/"):)
(:    %output:media-type("application/json"):)
(:    %output:method("json"):)
(:function service:upload() {:)
(:    let $collection := request:get-parameter("collection", "/db/abc"):)
(:    let $names := request:get-uploaded-file-name("uploadedfiles[]"):)
(:    let $files := request:get-uploaded-file-data("uploadedfiles[]"):)
(:    let $log := util:log("DEBUG", ("files: ", $files)):)
(:    return:)
(:        <result>:)
(:        {:)
(:            map-pairs(function($name, $file) {:)
(:                let $stored := xmldb:store($collection, xmldb:encode-uri($name), $file):)
(:                let $log := util:log("DEBUG", ("Uploaded: ", $stored)):)
(:                return:)
(:                    <json:value>:)
(:                        <file>{$stored}</file>:)
(:                        <size>xmldb:size($collection, $name)</size>:)
(:                        <type>xmldb:get-mime-type($stored)</type>:)
(:                    </json:value>:)
(:            }, $names, $files):)
(:        }:)
(:        </result>:)
(:};:)

declare %private function service:permissions-from-form() {
    string-join(
        for $type in ("u", "g", "w")
        for $perm in ("r", "w", "x")
        let $param := request:get-parameter($type || $perm, ())
        return
            if ($param) then
                $perm
            else
                "-",
        ""
    )
};

declare %private function service:list-collection-contents($collection as xs:string, $user as xs:string) {
    
    (
        for $child in xmldb:get-child-collections($collection)
        order by $child ascending
        return
            <collection>{$child}</collection>
        ,
        for $resource in xmldb:get-child-resources($collection)
        order by $resource ascending
        return
            <resource>{$resource}</resource>
    )
    
    (:
    let $subcollections := 
        for $child in xmldb:get-child-collections($collection)
        where sm:has-access(xs:anyURI(concat($collection, "/", $child)), "r")
        return
            $child
    let $resources :=
        for $r in xmldb:get-child-resources($collection)
        where sm:has-access(xs:anyURI(concat($collection, "/", $r)), "r")
        return
            $r
    for $resource in ($subcollections, $resources)
    order by $resource ascending
	return
		$resource
	:)
};

declare %private function service:canWrite($collection as xs:string, $user as xs:string) as xs:boolean {
    if (xmldb:is-admin-user($user)) then
    	true()
	else
    	let $permissions := xmldb:permissions-to-string(xmldb:get-permissions($collection))
    	let $owner := xmldb:get-owner($collection)
    	let $group := xmldb:get-group($collection)
    	let $groups := xmldb:get-user-groups($user)
    	return
        	if ($owner eq $user) then
            	substring($permissions, 2, 1) eq 'w'
        	else if ($group = $groups) then
            	substring($permissions, 5, 1) eq 'w'
        	else
            	substring($permissions, 8, 1) eq 'w'
};

declare %private function service:canWriteResource($collection as xs:string, $resource as xs:string, $user as xs:string) as xs:boolean {
    if (xmldb:is-admin-user($user)) then
		true()
	else
		let $permissions := xmldb:permissions-to-string(xmldb:get-permissions($collection, $resource))
		let $owner := xmldb:get-owner($collection, $resource)
		let $group := xmldb:get-group($collection, $resource)
		let $groups := xmldb:get-user-groups($user)
		return
			if ($owner eq $user) then
				substring($permissions, 2, 1) eq 'w'
			else if ($group = $groups) then
				substring($permissions, 5, 1) eq 'w'
			else
				substring($permissions, 8, 1) eq 'w'
};

declare %private function service:merge-properties($maps as map(*)) {
    map:new(
        for $key in map:keys($maps[1])
        let $values := distinct-values(for $map in $maps return $map($key))
        return
            map:entry($key, if (count($values) = 1) then $values[1] else "")
    )
};

declare %private function service:get-property-map($resource as xs:string) as map(*) {
    let $isCollection := xmldb:collection-available($resource)
    return
        if ($isCollection) then
            map {
                "owner" := xmldb:get-owner($resource),
                "group" := xmldb:get-group($resource),
                "last-modified" := format-dateTime(xmldb:created($resource), "[MNn] [D00] [Y0000] [H00]:[m00]:[s00]"),
                "permissions" := xmldb:permissions-to-string(xmldb:get-permissions($resource)),
                "mime" := xmldb:get-mime-type(xs:anyURI($resource))
            }
        else
            let $components := analyze-string($resource, "^(.*)/([^/]+)$")//fn:group/string()
            return
                map {
                    "owner" := xmldb:get-owner($components[1], $components[2]),
                    "group" := xmldb:get-group($components[1], $components[2]),
                    "last-modified" := 
                        format-dateTime(xmldb:last-modified($components[1], $components[2]), "[MNn] [D00] [Y0000] [H00]:[m00]:[s00]"),
                    "permissions" := xmldb:permissions-to-string(xmldb:get-permissions($components[1], $components[2])),
                    "mime" := xmldb:get-mime-type(xs:anyURI($resource))
                }
};

declare %private function service:get-properties($resources as xs:string*) as map(*) {
    service:merge-properties(for $resource in $resources return service:get-property-map($resource))
};

declare %private function service:get-users() {
    distinct-values(
        for $group in sm:get-groups()
        return
            sm:get-group-members($group)    
    )
};

declare
    %private
function service:checkbox($name as xs:string, $test as xs:boolean) {
    <input type="checkbox" name="{$name}"
        data-dojo-type="dijit.form.CheckBox">
    {
        if ($test) then attribute checked { 'checked' } else ()
    }
    </input>
};

declare %private function service:force-json-array($nodes as node()*, $element-names as xs:QName+) {
   for $node in $nodes
   return 
      typeswitch($node)
        case document-node()
        return
            document {
                for $child in $node
                return
                    service:force-json-array($child/node(), $element-names)
            }
        case element()
        return
              element { name($node) } {
                if(node-name($node) = $element-names)then
                    attribute json:array { "true" }
                else(),
 
                for $att in $node/@*
                return
                    attribute {name($att)} {$att}
                ,
                for $child in $node
                return
                    service:force-json-array($child/node(), $element-names)
              }
        default
        return
            $node
};

declare %private function service:path-to-col-res-path($path as xs:string) {
    (replace($path, "(.*)/.*", "$1"), replace($path, ".*/", ""))
};
