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
xquery version "3.0";

declare namespace exist = "http://exist.sourceforge.net/NS/exist";

import module namespace request = "http://exist-db.org/xquery/request";
import module namespace util = "http://exist-db.org/xquery/util";

import module namespace usermanager = "http://exist-db.org/apps/dashboard/userManager2" at "userManager2.xqm";
import module namespace jsjson = "http://johnsnelson/json" at "jsjson.xqm";

declare variable $exist:path external;
    if(starts-with($exist:path, "/api/"))then(
        
        (: API is in JSON :)
        util:declare-option("exist:serialize", "method=json media-type=application/json"),
        
        (: debugging :)
        if($exist:path eq "/api/user/" and request:get-method() eq "GET")then
            if(request:get-parameter("user", ()))then
                usermanager:list-users(request:get-parameter("user", ()))
            else
                usermanager:list-users()
        
        else if(starts-with($exist:path, "/api/user/"))then
            let $user := replace($exist:path, "/api/user/", "") return
                
                if(request:get-method() eq "DELETE")then (
                    usermanager:delete-user($user),
                    <deleted>
                        <user>{$user}</user>
                    </deleted>
                )
                
                else if(request:get-method() eq "POST")then 
                (
                    response:set-status-code(405),
                    <error>expected PUT for User from dojox.data.JsonRestStore and not POST</error>
                )
                
                else if(request:get-method() eq "PUT") then
                    let $body := util:binary-to-string(request:get-data()) return
                        if(usermanager:user-exists($user))then
                            (: update user:)
                            if(usermanager:update-user($user, jsjson:parse-json($body)))then
                            (
                                response:set-header("Location", concat("/exist/apps/dashboard/plugins/userManager2/api/user/", $user)),
                                response:set-status-code(200),
                                
                                (: TODO ideally would like to set 204 above and not return and content in the body
                                however the controller.xql is not capable of doing that, as there is no dispatch/ignore
                                that just returns processing with an empty body.
                                :)
                                
                                (: send back updated group json :)
                                usermanager:get-user($user)
                            ) else (
                                response:set-status-code(500),
                                <error>could not update group</error>
                            )
                        else
                            (: create user :)
                            let $user := usermanager:create-user(jsjson:parse-json($body)) return
                                if($user)then
                                (
                                    response:set-header("Location", concat("/exist/apps/dashboard/plugins/userManager2/api/user/", $user)),
                                    response:set-status-code(201),
                                    
                                    (: send back updated user json :)
                                    usermanager:get-user($user)
                                ) else (
                                    response:set-status-code(500),
                                    <error>could not create user</error>
                                )
                else
                    if(usermanager:user-exists($user))then
                        usermanager:get-user($user)
                    else
                    (
                        response:set-status-code(404),
                        <error>No such user: {$user}</error>
                    )    
        
        else if($exist:path eq "/api/group/")then
            usermanager:list-groups()
        
        else if(starts-with($exist:path, "/api/group/"))then
            let $group := replace($exist:path, "/api/group/", "") return
            
            if(request:get-method() eq "DELETE")then (
                usermanager:delete-group($group),
                <deleted>
                    <group>{$group}</group>
                </deleted>
            )
            
            else if(request:get-method() eq "POST")then
            (
                response:set-status-code(405),
                <error>expected PUT for Group from dojox.data.JsonRestStore and not POST</error>
            )
            
            else if(request:get-method() eq "PUT") then
                let $body := util:binary-to-string(request:get-data()) return
                    if(usermanager:group-exists($group))then
                        (: update group :)
                        if(usermanager:update-group($group, jsjson:parse-json($body)))then
                        (
                            response:set-header("Location", concat("/exist/apps/dashboard/plugins/userManager2/api/group/", $group)),
                            response:set-status-code(200),
                            
                            (: TODO ideally would like to set 204 above and not return and content in the body
                            however the controller.xql is not capable of doing that, as there is no dispatch/ignore
                            that just returns processing with an empty body.
                            :)
                            
                            (: send back updated group json :)
                            usermanager:get-group($group)
                        ) else (
                            response:set-status-code(500),
                            <error>could not update group</error>
                        )
                    else
                        (: create group :)
                        let $group := usermanager:create-group(jsjson:parse-json($body)) return
                            if($group)then
                            (
                                response:set-header("Location", concat("/exist/apps/dashboard/plugins/userManager2/api/group/", $group)),
                                response:set-status-code(201),
                                
                                (: send back updated group json :)
                                usermanager:get-group($group)
                            ) else (
                                response:set-status-code(500),
                                <error>could not create group</error>
                            )
            else
                if(usermanager:group-exists($group))then
                    usermanager:get-group($group)
                else
                (
                    response:set-status-code(404),
                    <error>No such group: {$group}</error>
                )
        else
            <pathWas>{$exist:path}</pathWas>
    )else
        <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
            <cache-control cache="yes"/>
        </dispatch>