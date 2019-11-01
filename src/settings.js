export const settings = {
    /**
     * list of packages to be ignored in existdb-launcher when displaying apps
     */
    ignoredPackages:["packagemanager","packageservice","launcher","usermanager","dashboard"],
    /**
     * relative path to packageservice for loading of apps. Value is relative to
     * dashboard's base URI (usually '/exist/apps/dashboard/'
     */
    appPackagePath:"../packageservice/packages/apps/json",
    localPackagePath:"../packageservice/packages/local/json",
    remotePackagePath:"../packageservice/packages/remote/json",

    loginUrl:"login"

}