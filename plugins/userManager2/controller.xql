xquery version "3.0";

declare namespace exist = "http://exist.sourceforge.net/NS/exist";

import module namespace request = "http://exist-db.org/xquery/request";
import module namespace util = "http://exist-db.org/xquery/util";

import module namespace usermanager = "http://exist-db.org/apps/dashboard/userManager2" at "userManager2.xqm";

declare variable $exist:path external;

if(starts-with($exist:path, "/api/"))then(
    
    (: API is in JSON :)
    util:declare-option("exist:serialize", "method=json media-type=application/json"),
    
    (: debugging :)
    if($exist:path eq "/api/user/" and request:get-method() eq "GET")then
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
                util:log("debug", "USERMANAGER2 received POST")
            else if(request:get-method() eq "PUT") then
                util:log("debug", "USERMANAGER2 received PUT")
            else
                usermanager:get-user($user)
    
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
            util:log("debug", "USERMANAGER2 GROUP received POST")
        else if(request:get-method() eq "PUT") then
            util:log("debug", "USERMANAGER2 GROUP received PUT")
        else
            usermanager:get-group($group)
    else
        <pathWas>{$exist:path}</pathWas>
)else
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <cache-control cache="yes"/>
    </dispatch>