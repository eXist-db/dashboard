xquery version "1.0";

let $repo := request:get-parameter("package", ())
let $iconSvg := repo:get-resource($repo, "icon.svg")
return
if(exists($iconSvg))
then response:stream-binary($iconSvg, "image/svg+xml", ()) 
else (
	let $icon := repo:get-resource($repo, "icon.png")
    return response:stream-binary($icon, "image/png", ())
	)