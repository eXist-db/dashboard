(:
    Rewrite/Refactoring by Joern Turner, 2017
:)
(:
Copyright (c) 2012, Adam Retter
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of Adam Retter Consulting nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL Adam Retter BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
:)
xquery version "3.1";

declare namespace exist = "http://exist.sourceforge.net/NS/exist";
declare namespace json = "http://www.json.org";

import module namespace request = "http://exist-db.org/xquery/request";
import module namespace util = "http://exist-db.org/xquery/util";
import module namespace usermanager = "http://exist-db.org/apps/userManager" at "modules/userManager.xqm";
import module namespace jsjson = "http://johnsnelson/json" at "modules/jsjson.xqm";
import module namespace login="http://exist-db.org/xquery/login" at "resource:org/exist/xquery/modules/persistentlogin/login.xql";
import module namespace functx = "http://www.functx.com";

(:declare namespace output="http://www.w3.org/2010/xslt-xquery-serialization";:)
(:declare option output:method "json";:)
(:declare option output:media-type "application/json";:)


declare variable $local:HTTP_OK := xs:integer(200);
declare variable $local:HTTP_CREATED := xs:integer(201);
declare variable $local:HTTP_NO_CONTENT := xs:integer(204);
declare variable $local:HTTP_BAD_REQUEST := xs:integer(400);
declare variable $local:HTTP_FORBIDDEN := xs:integer(403);
declare variable $local:HTTP_NOT_FOUND := xs:integer(404);
declare variable $local:HTTP_METHOD_NOT_ALLOWED := xs:integer(405);
declare variable $local:HTTP_INTERNAL_SERVER_ERROR := xs:integer(500);

declare variable $exist:controller external;
declare variable $exist:resource external;
declare variable $exist:path external;
declare variable $exist:prefix external;


(:declare variable $exist:user external;:)



declare variable $local:HTTP_API_BASE := replace(string-join((request:get-context-path(), $exist:prefix, $exist:controller, "api"), "/"), "//", "/");


declare function local:get-user-location($user) as xs:string {
    local:get-location(("user", $user))
};

declare function local:get-group-location($group) as xs:string {
    local:get-location(("group", $group))
};

declare function local:get-location($postfix as xs:string+) {
    string-join(($local:HTTP_API_BASE, $postfix), "/")
};

declare function local:list-users($user as xs:string?) {
    try{
        if($user)then
            usermanager:list-users($user)
        else
            usermanager:list-users()
    } catch * {
        if(contains($err:description, "You must be an authenticated user")) then
            (
                response:set-status-code($local:HTTP_FORBIDDEN),
                <error>Access denied</error>
            )
        else
            (
                response:set-status-code($local:HTTP_INTERNAL_SERVER_ERROR),
                <error>{$err:description}</error>
            )
    }
};

declare function local:list-groups($group as xs:string?) as element(json:value) {
    try{
        if($group)then
            usermanager:list-groups($group)
        else
            usermanager:list-groups()
    } catch * {
        if(contains($err:description, "You must be an authenticated user")) then
            (
                response:set-status-code($local:HTTP_FORBIDDEN),
                <error>Access denied</error>
            )
        else
            (
                response:set-status-code($local:HTTP_INTERNAL_SERVER_ERROR),
                <error>{$err:description}</error>
            )
    }
};

declare function local:delete-user($user as xs:string) as element(deleted) {
    (
        usermanager:delete-user($user),
        <deleted>
            <user>{$user}</user>
        </deleted>
    )
};

declare function local:delete-group($group as xs:string) as element(deleted) {
    (
        usermanager:delete-group($group),
        <deleted>
            <group>{$group}</group>
        </deleted>
    )
};

declare function local:update-user($user as xs:string, $request-body as xs:string) as element() {
    if(usermanager:update-user($user, jsjson:parse-json($request-body)))then
        (
            response:set-header("Location", local:get-user-location($user)),
            response:set-status-code($local:HTTP_OK),

            (: TODO ideally would like to set 204 above and not return and content in the body
    however the controller.xql is not capable of doing that, as there is no dispatch/ignore
    that just returns processing with an empty body.
    :)

            (: send back updated group json :)
            usermanager:get-user($user)
        ) else (
        response:set-status-code($local:HTTP_INTERNAL_SERVER_ERROR),
        <error>could not update group</error>
    )
};

declare function local:update-group($group as xs:string, $request-body) as element() {
    if(usermanager:update-group($group, jsjson:parse-json($request-body)))then
        (
            response:set-header("Location", local:get-group-location($group)),
            response:set-status-code($local:HTTP_OK),

            (: TODO ideally would like to set 204 above and not return and content in the body
        however the controller.xql is not capable of doing that, as there is no dispatch/ignore
        that just returns processing with an empty body.
        :)

            (: send back updated group json :)
            usermanager:get-group($group)
        ) else (
        response:set-status-code($local:HTTP_INTERNAL_SERVER_ERROR),
        <error>could not update group</error>
    )
};

declare function local:create-user($user as xs:string, $request-body) as element() {
    let $body := parse-json($request-body)
    let $user := usermanager:create-user(jsjson:parse-json($request-body)) return

        if($user)then
            (
                response:set-header("Location", local:get-user-location($user)),
                response:set-status-code($local:HTTP_CREATED),

                (: send back updated user json :)
                usermanager:get-user($user)
            ) else (
            response:set-status-code($local:HTTP_INTERNAL_SERVER_ERROR),
            <error>could not create user</error>
        )
};

declare function local:create-group($user as xs:string, $request-body) as element() {
    let $group := usermanager:create-group(jsjson:parse-json($request-body)) return
        if($group)then
            (
                response:set-header("Location", local:get-group-location($group)),
                response:set-status-code($local:HTTP_CREATED),

                (: send back updated group json :)
                usermanager:get-group($group)
            ) else (
            response:set-status-code($local:HTTP_INTERNAL_SERVER_ERROR),
            <error>could not create group</error>
        )
};

declare function local:get-user($user as xs:string) as element() {
    if(usermanager:user-exists($user))then
        usermanager:get-user($user)
    else
        (
            response:set-status-code($local:HTTP_NOT_FOUND),
            <error>No such user: {$user}</error>
        )
};

declare function local:get-group($group as xs:string) as element() {
    if(usermanager:group-exists($group))then
        usermanager:get-group($group)
    else
        (
            response:set-status-code($local:HTTP_NOT_FOUND),
            <error>No such group: {$group}</error>
        )
};

let $log := util:log("info", "exist path: " || $exist:path)
let $log := util:log("info", "request URI: " || request:get-uri())
let $log := util:log("info", "resource: " || $exist:resource)
return
if ($exist:path eq '') then
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <redirect url="{request:get-uri()}/"/>
    </dispatch>
else if ($exist:path = "/") then
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <redirect url="index.html"/>
    </dispatch>

(:
else if (contains(request:get-uri(), "bower_components")) then
    let $log := util:log("info", "exist forward: "  || $exist:controller || '/bower_components/' || functx:substring-after-last($exist:path, 'bower_components/'))
    return
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/bower_components/{functx:substring-after-last($exist:path, 'bower_components')}"/>
        <cache-control cache="no"/>
    </dispatch>
:)

else if (ends-with($exist:path, "index.html")) then (
        login:set-user("org.exist.login", (), true()),
        let $user := request:get-attribute("org.exist.login.user")
        let $userParam := request:get-parameter("user","")
        let $signout := request:get-parameter("logout",())

        return
            if ($signout = "true") then(
                <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
                    <redirect url="login.html"/>
                </dispatch>
            )
            else if ($user and sm:is-dba($user)) then
                <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
                    <cache-control cache="no"/>
                </dispatch>
           else
                <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
                    <forward url="login.html"/>
                    <cache-control cache="no"/>
                </dispatch>
    )
else if(starts-with($exist:path, "/api/"))then(
        util:declare-option("exist:serialize", "method=json media-type=application/json"),
        login:set-user("org.exist.login", (), false()),
        let $user := request:get-attribute("org.exist.login.user")
        return

            (: API is in JSON :)
        if(not(exists($user)) or not(sm:is-dba($user))) then
            <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
                <redirect url="login.html"/>
                <cache-control cache="no"/>
            </dispatch>
        else if($exist:path eq "/api/user/" and request:get-method() eq "GET")then
            (
                local:list-users(request:get-parameter("user", ()))
            )
        else if(starts-with($exist:path, "/api/user/"))then
            let $user := replace($exist:path, "/api/user/", "") return
                if(request:get-method() eq "DELETE")then
                    local:delete-user($user)
                else if(request:get-method() eq "POST")then
                    (
                        response:set-status-code($local:HTTP_METHOD_NOT_ALLOWED),
                        <error>expected PUT for User and not POST</error>
                    )
                else if(request:get-method() eq "PUT") then
                        let $body := util:binary-to-string(request:get-data()) return
                            if(usermanager:user-exists($user))then
                            (: update user:)
                                local:update-user($user, $body)
                            else
                                if(string-length($user) != 0) then
                                    local:create-user($user, $body)
                                else(
                                    response:set-status-code($local:HTTP_BAD_REQUEST),
                                    <error>user name is missing</error>
                                )
                    else if(request:get-method() eq "GET") then (
                            local:get-user($user)
                        )
                        else
                            (
                                response:set-status-code($local:HTTP_METHOD_NOT_ALLOWED),
                                <error>Unsupported method: {request:get-method()}</error>
                            )


        else if($exist:path eq "/api/group/")then (
                login:set-user("org.exist.login", (), false()),
                local:list-groups(request:get-parameter("group", ()))
            )
            else if(starts-with($exist:path, "/api/group/"))then (
                    login:set-user("org.exist.login", (), false()),
                    let $group := replace($exist:path, "/api/group/", "") return

                        if(request:get-method() eq "DELETE")then
                            local:delete-group($group)

                        else if(request:get-method() eq "POST")then
                            (
                                response:set-status-code($local:HTTP_METHOD_NOT_ALLOWED),
                                <error>expected PUT for Group from dojox.data.JsonRestStore and not POST</error>
                            )

                        else if(request:get-method() eq "PUT") then
                                let $data := util:binary-to-string(request:get-data())
                                let $body := $data return
                                    if(usermanager:group-exists($group))then
                                        local:update-group($group, $body)
                                    else
                                        local:create-group($group, $body)
                            else if(request:get-method() eq "GET") then
                                    local:get-group($group)

                                else
                                    (
                                        response:set-status-code($local:HTTP_METHOD_NOT_ALLOWED),
                                        <error>Unsupported method: {request:get-method()}</error>

                                    )
                )
                else
                (: unkown URI path, not part of the API :)
                    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
                        <cache-control cache="yes"/>
                    </dispatch>
    ) else
        (: not an API URI path :)
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            <cache-control cache="yes"/>
        </dispatch>
