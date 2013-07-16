xquery version "3.0";

import module namespace backups="http://exist-db.org/xquery/backups"
    at "java:org.exist.backup.xquery.BackupModule";

declare namespace backup="http://exist-db.org/apps/dashboard/backup";
declare namespace json="http://www.json.org";

declare option exist:serialize "method=json media-type=application/json";


declare variable $backup:BACKUP_DIR := "export";

declare function backup:list() {
    let $backups := backups:list($backup:BACKUP_DIR)/exist:backup
    return (
        response:set-header("Content-Range", "items 0-" || count($backups) || "/" || count($backups)),
        if (empty($backups)) then
            <json:value><json:value json:array="true"></json:value></json:value>
        else
            <json:value>
            {
                for $backup in $backups
                return
                    <json:value json:array="true">
                        <name>{$backup/@file/string()}</name>
                        <created>{$backup/exist:date/string()}</created>
                        <incremental>{$backup/exist:incremental/text()}</incremental>
                    </json:value>
            }
            </json:value>
    )
};

declare function backup:trigger() {
    let $zip := request:get-parameter("zip", ())
    let $incremental := request:get-parameter("inc", ())
    let $params :=
        <parameters>
            <param name="output" value="{$backup:BACKUP_DIR}"/>
            <param name="backup" value="yes"/>
            <param name="incremental" value="{if ($incremental) then 'yes' else 'no'}"/>
            <param name="zip" value="{if ($zip) then 'yes' else 'no'}"/>
        </parameters>
    return (
        system:trigger-system-task("org.exist.storage.ConsistencyCheckTask", $params),
        <response status="ok"/>
    )
};

declare function backup:retrieve() {
    let $archive := request:get-parameter("archive", ())
    return (
        request:set-attribute("betterform.filter.ignoreResponseBody", "true"),
        if ($archive) then (
            response:set-header("Content-Disposition", concat("attachment; filename=", $archive)),
            backups:retrieve($backup:BACKUP_DIR, $archive)
        ) else
            ()
    )

};

let $action := request:get-parameter("action", ())
return
    if ($action = "trigger") then
        backup:trigger()
    else if ($action = "retrieve") then
        backup:retrieve()
    else
        backup:list()