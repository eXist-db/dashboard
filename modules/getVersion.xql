xquery version "3.1";

string-join(("eXist-db", system:get-version(), system:get-revision(), system:get-build()), " ")