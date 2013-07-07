xquery version "3.0";

module namespace service="http://exist-db.org/apps/dashboard/service";

import module namespace sm = "http://exist-db.org/xquery/securitymanager";

declare namespace json="http://www.json.org";
declare namespace output="http://www.w3.org/2010/xslt-xquery-serialization";
declare namespace rest="http://exquery.org/ns/restxq";

declare
    %rest:DELETE
    %rest:path("/contents/running/{$id}")
    %output:media-type("application/json")
    %output:method("json")
function service:kill($id) {
    system:kill-running-xquery(xs:int($id)),
    <response status="ok"/>
};

declare
    %rest:GET
    %rest:path("/contents/running/")
    %output:media-type("application/json")
    %output:method("json")
function service:get-running-xqueries() {
    let $xqueries := system:get-running-xqueries()//system:xquery
    
    return 
    if (count($xqueries) > 0) then
    (
        response:set-header("Content-Range", "items 1-" || count($xqueries) || "/" || count($xqueries)),
        <json:value>
        {
        
            for $xquery in $xqueries
            
            let $id 	:= $xquery/@id
            let $type 	:= $xquery/@sourceType
            let $key 	:= $xquery/system:sourceKey/text()
            let $src    := if( $type != "String" or string-length( $key ) < 1024 ) then $key else concat( substring( $key, 0, $xqueries:MAX-STRING-KEY-LENGTH - 1 ), "..." )
            let $started  := $xquery/@started
            let $status := if( $xquery/@terminating = "true" ) then "terminating" else "running"
                
            order by $id 
            return
                    <json:value json:array="true">
                        <id>{xs:string($id)}</id>
                        <type>{xs:string($type)}</type>
                        <source>{$src}</source>
                        <started>{ xs:string($started) }</started>
                        <status>{ $status }</status>
                    </json:value>
        }
        </json:value>
    )
        else         
    (
        response:set-header("Content-Range", "items 1-1/1"),
        <json:value>
                    <json:value json:array="true">
                        <id></id>
                        <type></type>
                        <source>No running XQueries</source>
                        <started></started>
                        <status></status>
                    </json:value>
        </json:value>
    )
};

declare
    %rest:GET
    %rest:path("/contents/jobs/")
    %output:media-type("application/json")
    %output:method("json")
function service:get-running-jobs() {
	let $processes := system:get-running-jobs()//system:job
	return
	if (count($processes) > 0) then
	(
        response:set-header("Content-Range", "items 0-" || count($processes) || "/" || count($processes)),
        <json:value>
        {
            for $proc in $processes
            let $id 	:= $proc/@id
                
            order by $id 
            return
                    <json:value json:array="true">
                		<id>{$proc/@id/string()}</id>
                		<action>{$proc/@action/string()}</action>
                		<info>{$proc/@info/string()}</info>
                		<start>{$proc/@start/string()}</start>
                    </json:value>
        }
        </json:value>
    )
    else
    (
        response:set-header("Content-Range", "items 0-1/1"),
        <json:value>
            <json:value json:array="true">
                <id>0</id>
                <action>1</action>
                <info>No running jobs</info>
                <start>1</start>
            </json:value>
        </json:value>
    )
};


declare
    %rest:GET
    %rest:path("/contents/scheduled/")
    %output:media-type("application/json")
    %output:method("json")
function service:get-scheduled-jobs() {
	let $processes := system:get-scheduled-jobs()//system:job
	return
	(
        response:set-header("Content-Range", "items 0-" || count($processes) || "/" || count($processes)),
        <json:value>
        {
            for $proc in $processes
            let $id 	:= $proc/@name/string()
                
            order by $id 
            return
                    <json:value json:array="true">
                        <group>{$proc/@group/string()}</group>
                        <id>{$proc/@name/string()}</id>
                        <startTime>{$proc/@startTime/string()}</startTime>
                        <endTime>{$proc/@endTime/string()}</endTime>
                        <fireTime>{$proc/@fireTime/string()}</fireTime>
                        <nextFireTime>{$proc/@nextFireTime/string()}</nextFireTime>
                        <finalFireTime>{$proc/@finalFireTime/string()}</finalFireTime>
                        <triggerExpression>{$proc/@triggerExpression/string()}</triggerExpression>
                        <triggerState>{$proc/@triggerState/string()}</triggerState>
                        <running>{$proc/@running/string()}</running>
                    </json:value>
        }
        </json:value>
    )
};
