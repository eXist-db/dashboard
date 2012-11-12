xquery version "3.0";

let $delay := request:get-parameter("delay", "2") cast as xs:long
return
    system:shutdown($delay * 1000)