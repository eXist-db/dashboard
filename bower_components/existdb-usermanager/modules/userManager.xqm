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

module namespace usermanager = "http://exist-db.org/apps/userManager";

import module namespace secman = "http://exist-db.org/xquery/securitymanager";
import module namespace xmldb = "http://exist-db.org/xquery/xmldb";

declare namespace json = "http://www.json.org";
declare namespace test="http://exist-db.org/xquery/xqsuite";

declare variable $usermanager:METADATA_FULLNAME_KEY := xs:anyURI("http://axschema.org/namePerson");
declare variable $usermanager:METADATA_DESCRIPTION_KEY := xs:anyURI("http://exist-db.org/security/description");

declare function usermanager:list-users() as element(json:value) {
        <json:value>
            {
                for $user in secman:list-users()
                return
                    usermanager:get-user($user)
            }
        </json:value>
};

declare function usermanager:list-users($pattern as xs:string) as element(json:value) {
    <json:value>
        {
            for $user in secman:list-users()
            return
                if($pattern eq "*")then
                    usermanager:get-user($user)
                else if(ends-with($pattern, "*") and starts-with($user, substring-before($pattern, "*")))then
                    usermanager:get-user($user)
                else()
        }
    </json:value>
};

declare function usermanager:delete-user($user) as empty-sequence() {
    
    (: TODO implement secman module functions instead :)
    xmldb:delete-user($user)
};

declare function usermanager:get-user($user) as element(json:value) {
    <json:value>
        <user>{$user}</user>
        <fullName>{secman:get-account-metadata($user, $usermanager:METADATA_FULLNAME_KEY)}</fullName>
        <description>{secman:get-account-metadata($user, $usermanager:METADATA_DESCRIPTION_KEY)}</description>
        <password/>
        <disabled json:literal="true">{not(secman:is-account-enabled($user))}</disabled>
        <umask>{secman:get-umask($user)}</umask>
        {
            for $group in secman:get-user-groups($user)
            return
                <groups json:array="true">{$group}</groups>
        }
    </json:value>
};

declare function usermanager:user-exists($user) as xs:boolean {
    secman:list-users() = $user
};

declare function usermanager:list-groups() as element(json:value) {
    <json:value>
        {
            for $group in secman:list-groups()
            return
                usermanager:get-group($group)
        }
    </json:value>
};

declare function usermanager:list-groups($pattern as xs:string) as element(json:value) {
    <json:value>
        {
            for $group in secman:list-groups()
            return
                if($pattern eq "*")then
                    usermanager:get-group($group)
                else if(ends-with($pattern, "*") and starts-with($group, substring-before($pattern, "*")))then
                    usermanager:get-group($group)
                else()
        }
    </json:value>
};

declare function usermanager:create-user($user-json as element(json)) as xs:string? {
    
    let $user := $user-json/pair[@name eq "user"],
    $fullName := $user-json/pair[@name eq "fullName"],
    $description := $user-json/pair[@name eq "description"],
    $password := $user-json/pair[@name eq "password"],
    $disabled := xs:boolean($user-json/pair[@name eq "disabled"]),
    $umask := xs:int($user-json/pair[@name eq "umask"]),
    $groups := $user-json/pair[@name eq "groups"][@type eq "array"]/item/string(text()) return
    (
        (: TODO implement secman module functions instead, create-group returns a boolean, decide on either boolean or error - probably error! :)
        xmldb:create-user($user, $password, $groups, ()),
        if($disabled)then
            secman:set-account-enabled($user, false)       (: TODO add as an arg to secman:create-user function :)
        else(),
        secman:set-umask($user, $umask),
        secman:set-account-metadata($user, $usermanager:METADATA_FULLNAME_KEY, $fullName),
        secman:set-account-metadata($user, $usermanager:METADATA_DESCRIPTION_KEY, $description),
        $user
    )
};

declare function usermanager:update-user($user-name as xs:string, $user-json as element(json)) as xs:boolean {
    let $user := $user-json/pair[@name eq "user"] return
    
        if($user-name ne $user)then
            false()
        else
            let $fullName := $user-json/pair[@name eq "fullName"],
            $description := $user-json/pair[@name eq "description"],
            $password := $user-json/pair[@name eq "password"][@type ne "null"],     (: set empty sequence if null password :)
            $disabled := xs:boolean($user-json/pair[@name eq "disabled"]),
            $umask := xs:int($user-json/pair[@name eq "umask"]),
            $groups := $user-json/pair[@name eq "groups"][@type eq "array"]/item/string(text())
            return (
                if(secman:get-account-metadata($user, $usermanager:METADATA_FULLNAME_KEY) = $fullName)then
                    ()    
                else secman:set-account-metadata($user, $usermanager:METADATA_FULLNAME_KEY, $fullName)
                ,
                
                if(secman:get-account-metadata($user, $usermanager:METADATA_DESCRIPTION_KEY) = $description)then
                    ()
                else secman:set-account-metadata($user, $usermanager:METADATA_DESCRIPTION_KEY, $description)
                ,
                
                if(secman:is-account-enabled($user) eq $disabled)then
                    secman:set-account-enabled($user, $disabled)
                else(),
                
                if(secman:get-umask($user) ne $umask)then
                    secman:set-umask($user, $umask)
                else(),
                
                (: if a password is provided, we always change the password, as we dont know what the original password was :)
                xmldb:change-user($user, $password, $groups),           (: TODO replace with secman function :)
                
                (: success :)
                true()
            )
};

declare function usermanager:get-group($group) as element(json:value) {
    <json:value>
        <group>{$group}</group>
        <description>{secman:get-group-metadata($group, $usermanager:METADATA_DESCRIPTION_KEY)}</description>
        {
            let $managers := secman:get-group-managers($group)
            return
                for $member in secman:get-group-members($group)
                return
                    <members json:array="true">
                        <member>{$member}</member>
                        <isManager json:literal="true">{$managers = $member}</isManager>
                    </members>
        }
    </json:value>
};

declare function usermanager:group-exists($group) as xs:boolean {
    secman:list-groups() = $group
};

declare function usermanager:delete-group($group) as empty-sequence() {
    secman:delete-group($group)
};

declare function usermanager:create-group($group-json as element(json)) as xs:string? {
    
    let $group := $group-json/pair[@name eq "group"],
    $description := $group-json/pair[@name eq "description"]
    return
    
        (: TODO implement secman module functions instead :)
        if(xmldb:create-group($group))then (
            secman:set-group-metadata($group, $usermanager:METADATA_DESCRIPTION_KEY, $description),
            
            for $member in $group-json/pair[@name eq "members"][@type eq "array"]/item
            let $user := $member/pair[@name eq "member"],
            $isManager := xs:boolean($member/pair[@name eq "isManager"])
            return
                let $null := xmldb:add-user-to-group($user, $group)  (: TODO need to be able to set manager flag! :) (: TODO implement secman version instead :)
                return
                    ()            
                ,
            $group
        ) else()
};

declare function usermanager:update-group($group-name as xs:string, $group-json as element(json)) as xs:boolean {
    let $group := $group-json/pair[@name eq "group"] return
    
        if($group-name ne $group)then
            false() (: group's name is not allowed to change! :)
        else (
    
            (: 0) update the description :)
            let $existing-description := secman:get-group-metadata($group, $usermanager:METADATA_DESCRIPTION_KEY),
            $updated-description := string($group-json/pair[@name eq "description"])
            
            return
                if(not($existing-description = $updated-description))then
                    (: update the description :)
                    secman:set-group-metadata($group, $usermanager:METADATA_DESCRIPTION_KEY, $updated-description)
                else(),
    
            let $existing-managers := secman:get-group-managers($group),
            $existing-members := secman:get-group-members($group),
            $updated-managers := $group-json/pair[@name eq "members"][@type eq "array"]/item/string(pair[@name eq "member"][following-sibling::pair[@name eq "isManager"] eq "true"]),
            $updated-members :=  $group-json/pair[@name eq "members"][@type eq "array"]/item/string(pair[@name eq "member"]) return
            (
                (: 1) remove any old members :)
                for $existing-member in $existing-members
                let $existing-member-is-manager := $existing-managers = $existing-member
                return
                    if($updated-members = $existing-member)then
                        (: should we update isManager? :)
                        let $updated-member-is-manager := $updated-managers = $existing-member return
                        if($updated-member-is-manager and not($existing-member-is-manager))then
                            (: TODO set manager $existing-member as manager of $group :) ()
                        else if(not($updated-member-is-manager) and $existing-member-is-manager)then
                            (: TODO remove $existing-member as a manager of $group :) ()
                        else()
                    else
                        (: remove group member :)
                        let $null := xmldb:remove-user-from-group($existing-member, $group) return
                            ()
                ,
                (: 2) add any new members :)
                for $updated-member in $updated-members
                let $updated-member-is-manager := $updated-managers = $updated-member
                return
                    if($existing-members = $updated-member)then
                        (: should we update isManager? :)
                        let $existing-member-is-manager := $existing-managers = $updated-member return
                        if($existing-member-is-manager and not($updated-member-is-manager))then
                            (: TODO remove $existing-member as a manager of $group :) ()
                        else if(not($existing-member-is-manager) and $updated-member-is-manager)then
                            (: TODO set manager $existing-member as manager of $group :) ()
                        else()
                    else
                        (: add group member :)
                        let $null := xmldb:add-user-to-group($updated-member, $group) return (: TODO need to be able to set manager flag! :) (: TODO implement secman version instead :)
                            ()
            ),
            
            (: success! :)
            true()
        )
};
