xquery version "3.0";

declare namespace exist = "http://exist.sourceforge.net/NS/exist";

import module namespace usermanager = "http://exist-db.org/apps/dashboard/userManager2" at "userManager2.xqm";

declare variable $exist:path external;

if(starts-with($exist:path, "/api/"))then(
    
    (: API is in JSON :)
    util:declare-option("exist:serialize", "method=json media-type=application/json"),
    
    if($exist:path eq "/api/user/")then
        usermanager:list-users()
    else if($exist:path eq "/api/group/")then
        usermanager:list-groups()
    else
        <pathWas>{$exist:path}</pathWas>
)else
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <cache-control cache="yes"/>
    </dispatch>