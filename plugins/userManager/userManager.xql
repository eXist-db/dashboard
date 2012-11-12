xquery version "3.0";

declare namespace userManager="http://exist-db.org/apps/dashboard/userManager";
declare namespace config="http://exist-db.org/Configuration";
declare namespace json="http://www.json.org";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";

declare option exist:serialize "method=json media-type=application/json"; 
(: declare option exist:serialize "method=xml media-type=application/xml"; :)

declare variable $userManager:all-users {
    collection("/db/system/security/exist/accounts")/config:account
};

declare variable $userManager:current-users {
    $userManager:all-users[util:collection-name(.) ne '/db/system/security/exist/accounts/removed']
};

declare function userManager:listUsersXML() {
    <users>
        {
            for $user in $userManager:current-users
            return
                <user>
                    <name>{$user/config:name/text()}</name>
                    <groups>{string-join($user/config:group/@name, ", ")}</groups>
                    <home>{if ($user/config:home ne "") then $user/config:home/text() else "not set"}</home>
                </user>
        }
    </users>
};


declare function userManager:saveUser() {
    let $userName := request:get-parameter("userName", ())
    let $userPassword := request:get-parameter("userPassword", ())
    let $userPasswordRepeat := request:get-parameter("userPasswordRepeat", ())
    let $userGroups := request:get-parameter("userGroups", ())
    let $userHome := if (request:get-parameter("userHome", ()) eq "not set") then "" else request:get-parameter("userHome", ())

    return
        if ($userPassword != $userPasswordRepeat) then (
            <div class="error">Passwords are not identical.</div>
        )
        else if (empty($userGroups)) then (
            <div class="error">Please specify one group at least.</div>
        )
        else if (xmldb:exists-user($userName)) then (
            xmldb:change-user($userName, $userPassword, $userGroups, $userHome)
        ) 
        else (
            xmldb:create-user($userName, $userPassword, $userGroups, $userHome)
        )
    
};

declare function userManager:listUsers() {
        response:set-header("Content-Range", "items 0-" || count($userManager:current-users) || "/" || count($userManager:current-users)),
        <json:value>
        {
            for $user in $userManager:current-users
            return
                <json:value>
                    <name>{$user/config:name/text()}</name>
                    <groups>{string-join($user/config:group/@name, ", ")}</groups>
                    <home>{if ($user/config:home ne "") then $user/config:home/text() else "not set"}</home>
                </json:value>
        }
        </json:value>
};


let $action := request:get-parameter("action", ())
return
    if ($action = "save") then (userManager:saveUser())
    else
        userManager:listUsers()