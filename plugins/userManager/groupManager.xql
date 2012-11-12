xquery version "3.0";

declare namespace groupManager="http://exist-db.org/apps/dashboard/groupManager";
declare namespace config="http://exist-db.org/Configuration";
declare namespace json="http://www.json.org";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=json media-type=application/json"; 
(: declare option exist:serialize "method=xml media-type=application/xml"; :)

declare variable $groupManager:all-groups {
    collection("/db/system/security/exist/groups")/config:group
};

declare variable $groupManager:current-groups {
    $groupManager:all-groups[util:collection-name(.) ne '/db/system/security/exist/groups/removed']
};

declare function groupManager:listGroupsXML() {
    <groups>
        {
            for $group in $groupManager:current-groups
            return
                <group>
                    <name>{$group/config:name/text()}</name>
                </group>
        }
    </groups>
};

declare function groupManager:saveGroup() {
    let $groupName := request:get-parameter("groupName", ())
    let $groupManagerLocal := request:get-parameter("groupManager", "")
    
    return
        if ($groupName) then (
            if (not ($groupManagerLocal eq "")) then (
                xmldb:create-group($groupName, $groupManagerLocal)
            ) else (
                xmldb:create-group($groupName)
            )
        ) else () 
        
    
};

declare function groupManager:listGroups() {
    (: This is still a HACK! have to find out howto use store with just one item ... :)
    response:set-header("Content-Range", "items 0-" || count($groupManager:current-groups) || "/" || count($groupManager:current-groups)),
        if (count($groupManager:current-groups) > 1) then (
            <json:value>
            {
                for $group in $groupManager:current-groups
                return
                    <json:value>
                        <name>{$group/config:name/text()}</name>
                        <ident>{$group/@id/string()}</ident>
                        <value>{$group/config:name/text()}</value>
                    </json:value>
            }
            </json:value>
        ) else (
            <json:value>
                <json:value>
                    <name>{$groupManager:current-groups[1]/config:name/text()}</name>
                    <ident>{$groupManager:current-groups[1]/@id/string()}</ident>
                    <value>{$groupManager:current-groups[1]/config:name/text()}</value>
                </json:value>
                <json:value>
                    <name>nogroup</name>
                    <ident>nogroup</ident>
                    <value>nogroup</value>
                    <disabled>true</disabled>
                </json:value>
            </json:value>
        )
};

let $action := request:get-parameter("action", ())
return
    if ($action = "save") then (groupManager:saveGroup())
    else
        groupManager:listGroups()