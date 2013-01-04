xquery version "3.0";

module namespace service="http://exist-db.org/apps/dashboard/service";

import module namespace sm = "http://exist-db.org/xquery/securitymanager";

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
                let $split := text:groups($resource, "^(.*)/([^/]+)$")
                return
                    xmldb:remove($split[2], $split[3]),
        <response status="ok"/>
    } catch * {
        <response status="fail">
            <message>{$err:message}</message>
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
    return (
        response:set-header("Content-Range", "items 0-" || count($subset) + 1 || "/" || count($resources) + 1),
        <json:value>
            <json:value json:array="true">
                <name>..</name>
                <id>{$parent}</id>
                <permissions></permissions>
                <owner></owner>
                <group></group>
                <last-modified></last-modified>
                <writable json:literal="true"></writable>
                <isCollection json:literal="true">true</isCollection>
            </json:value>
        {
            for $resource in $subset
            let $isCollection := local-name($resource) eq "collection"
            let $path := string-join(($collection, $resource), "/")
            (: where sm:has-access(xs:anyURI($path), "r") :) (: TODO: why this check? should be on opening the thing not listing it! :)
            (: order by $resource ascending :) (: already ordered by service:list-collection-contents(...) :)
            return
                let $permissions := sm:get-permissions(xs:anyURI($path))/sm:permission
                let $owner := string($permissions/@owner)
                let $group := string($permissions/@group)
                let $lastMod := 
                    if ($isCollection) then
                        format-dateTime(xmldb:created($path), "[MNn] [D00] [Y0000] [H00]:[m00]:[s00]")
                    else
                        format-dateTime(xmldb:created($collection, $resource), "[MNn] [D00] [Y0000] [H00]:[m00]:[s00]")
                let $canWrite :=
                    if ($isCollection) then
                        service:canWrite($path, $user)
                    else
                        service:canWriteResource($collection, $resource, $user)
                return
                    <json:value json:array="true">
                        <name>{$resource/text()}</name>
                        <id>{$path}</id>
                        <permissions>{if($isCollection)then "c" else "-"}{string($permissions/@mode)}{if($permissions/sm:acl/@entries ne "0")then "+" else ""}</permissions>
                        <owner>{$owner}</owner>
                        <group>{$group}</group>
                        <last-modified>{$lastMod}</last-modified>
                        <writable json:literal="true">{$canWrite}</writable>
                        <isCollection json:literal="true">{$isCollection}</isCollection>
                    </json:value>
        }
        </json:value>
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
                        let $split := text:groups($source, "^(.*)/([^/]+)$")
                        return
                            switch ($action)
                                case "move" return
                                    xmldb:move($split[2], $target, $split[3])
                                default return
                                    xmldb:copy($split[2], $target, $split[3]),
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
    %rest:path("/properties/")
    %rest:query-param("resources", "{$resources}")
    %output:media-type("application/json")
    %output:method("json")
function service:edit-properties($resources as xs:string+) as element(json:value) {
    
    <json:value>
    {
        for $resource in $resources
        let $permissions := sm:get-permissions(xs:anyURI($resource))
        let $col-res-path := service:path-to-col-res-path($resource)
        return
            <json:value json:array="true">
                <path>{$resource}</path>
                <internetMediaType>{xmldb:get-mime-type($resource)}</internetMediaType>
                {
                    if(xmldb:collection-available($resource))then
                        <created>{xmldb:created($resource)}</created>
                    else
                        <created>{xmldb:created($col-res-path[1], $col-res-path[2])}</created>
                }
                <lastModified>{xmldb:last-modified($col-res-path[1], $col-res-path[2])}</lastModified>
                { service:force-json-array($permissions, xs:QName("sm:ace")) }
            </json:value>
    }
    </json:value>
    
    (:
    let $props := service:get-properties($resources)
    let $users := service:get-users()
    return
        <form id="browsing-dialog-form" action="" data-dojo-type="dijit.form.Form">
            {
                if ($props("mime") != "") then
                    <div class="control-group">
                        <label for="mime">Mime:</label>
                        <input type="text" data-dojo-type="dijit.form.TextBox" name="mime"
                            value="{$props('mime')}"/>
                    </div>
                else
                    ()
            }
            <div class="control-group">
                <label for="owner">Owner:</label>
                <select data-dojo-type="dijit.form.Select" name="owner">
                {
                    for $user in $users
                    order by $user
                    return
                        <option value="{$user}">
                        {
                            if ($user = $props("owner")) then
                                attribute selected { "selected" }
                            else
                                (),
                            $user
                        }
                        </option>
                }
                </select>
            </div>
            <div class="control-group">
                <label for="group">Group:</label>
                <select data-dojo-type="dijit.form.Select" name="group">
                {
                    for $group in sm:get-groups()
                    order by $group
                    return
                        <option value="{$group}">
                        {
                            if ($group = $props("group")) then
                                attribute selected { "selected" }
                            else
                                (),
                            $group
                        }
                        </option>
                }
                </select>
            </div>
            <fieldset>
                <legend>Permissions</legend>
                { service:get-permissions($props("permissions")) }
            </fieldset>
            <div class="control-group">
                <button type="submit" data-dojo-type="dijit.form.Button">Apply</button>
            </div>
        </form>
        :)
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
            let $components := text:groups($resource, "^(.*)/([^/]+)$")
            return
                map {
                    "owner" := xmldb:get-owner($components[2], $components[3]),
                    "group" := xmldb:get-group($components[2], $components[3]),
                    "last-modified" := 
                        format-dateTime(xmldb:created($components[2], $components[3]), "[MNn] [D00] [Y0000] [H00]:[m00]:[s00]"),
                    "permissions" := xmldb:permissions-to-string(xmldb:get-permissions($components[2], $components[3])),
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

declare %private function service:checkbox($name as xs:string, $test as xs:boolean) {
    <input type="checkbox" name="{$name}"
        data-dojo-type="dijit.form.CheckBox">
    {
        if ($test) then attribute checked { 'checked' } else ()
    }
    </input>
};

declare %private function service:get-permissions($perms as xs:string) {
    <table>
        <tr>
            <th>User</th>
            <th>Group</th>
            <th>World</th>
        </tr>
        <tr>
            <td>
                { service:checkbox("ur", substring($perms, 1, 1) = "r") }
                read
            </td>
            <td>
                { service:checkbox("gr", substring($perms, 4, 1) = "r") }
                read
            </td>
            <td>
                { service:checkbox("wr", substring($perms, 7, 1) = "r") }
                read
            </td>
        </tr>
        <tr>
            <td>
                { service:checkbox("uw", substring($perms, 2, 1) = "w") }
                write
            </td>
            <td>
                { service:checkbox("gw", substring($perms, 5, 1) = "w") }
                write
            </td>
            <td>
                { service:checkbox("ww", substring($perms, 8, 1) = "w") }
                write
            </td>
        </tr>
        <tr>
            <td>
                { service:checkbox("ux", substring($perms, 3, 1) = "x") }
                execute
            </td>
            <td>
                { service:checkbox("gx", substring($perms, 6, 1) = "x") }
                execute
            </td>
            <td>
                { service:checkbox("wx", substring($perms, 9, 1) = "x") }
                execute
            </td>
        </tr>
    </table>
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
