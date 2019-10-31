let $authRoute := 'settings'
let $groups := ("dba","packagemanager")
let $permissions :=     <auth>
                           <group name="dba">
                               <permission>packagemanager</permission>
                               <permission>usermanager</permission>
                               <permission>backup</permission>
                               <permission>settings</permission>
                           </group>
                           <group name="packagemanager">
                               <permission>packagemanager</permission>
                           </group>
                       </auth>

let $authorized :=  exists($permissions//group[@name=$groups]/permission[.=$authRoute])
return $authorized