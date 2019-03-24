xquery version "3.0";

module namespace login-helper="http://exist-db.org/apps/dashboard/login-helper";

(: Determine if the persistent login module is available :)
declare function login-helper:get-login-method() as function(*) {
    let $tryImport :=
        try {
            util:import-module(xs:anyURI("http://exist-db.org/xquery/login"), "login", xs:anyURI("resource:org/exist/xquery/modules/persistentlogin/login.xql")),
            true()
        } catch * {
            false()
        }
    return
        if ($tryImport) then
            function-lookup(xs:QName("login:set-user"), 3)
        else
            login-helper:fallback-login#3
};

(:~
    Fallback login function used when the persistent login module is not available.
    Stores user/password in the HTTP session.
 :)
declare %private function login-helper:fallback-login($domain as xs:string, $maxAge as xs:dayTimeDuration?, $asDba as xs:boolean) {
    let $durationParam := request:get-parameter("duration", ())
    let $user := request:get-parameter("user", ())
    let $password := request:get-parameter("password", ())
    let $logout := request:get-parameter("logout", ())
    return
        if ($durationParam) then
            error(xs:QName("login"), "Persistent login module not enabled in this version of eXist-db")
        else if ($logout) then
            session:invalidate()
        else 
            if ($user) then
                let $isLoggedIn := xmldb:login("/db", $user, $password, true())
                return
                    if ($isLoggedIn and (not($asDba) or xmldb:is-admin-user($user))) then (
                        session:set-attribute("eXide.user", $user),
                        session:set-attribute("eXide.password", $password),
                        request:set-attribute($domain || ".user", $user),
                        request:set-attribute("xquery.user", $user),
                        request:set-attribute("xquery.password", $password)
                    ) else
                        ()
            else
                let $user := session:get-attribute("eXide.user")
                let $password := session:get-attribute("eXide.password")
                return (
                    request:set-attribute($domain || ".user", $user),
                    request:set-attribute("xquery.user", $user),
                    request:set-attribute("xquery.password", $password)
                )
};