xquery version "3.0";

module namespace usermanager = "http://exist-db.org/apps/dashboard/userManager2";

import module namespace secman = "http://exist-db.org/xquery/securitymanager";

declare namespace json="http://www.json.org";

declare variable $usermanager:METADATA_FULLNAME_KEY := xs:anyURI("http://axschema.org/namePerson");
declare variable $usermanager:METADATA_DESCRIPTION_KEY := xs:anyURI("http://exist-db.org/security/description");

declare function usermanager:list-users() {
    <json:value>
        {
            for $user in secman:list-users() return
                <json:value>
                    <user>{$user}</user>
                    <fullName>{secman:get-account-metadata($user, $usermanager:METADATA_FULLNAME_KEY)}</fullName>
                    <description>{secman:get-account-metadata($user, $usermanager:METADATA_DESCRIPTION_KEY)}</description>
                </json:value>
        }
    </json:value>
};

declare function usermanager:list-groups() {
    <json:value>
        {
            for $group in secman:list-groups() return
                <json:value>
                    <group>{$group}</group>
                    <description>{secman:get-group-metadata($group, $usermanager:METADATA_DESCRIPTION_KEY)}</description>
                </json:value>
        }
    </json:value>
};