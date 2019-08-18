xquery version "3.1";

string-join((system:get-product-name(), system:get-version(), system:get-revision(), system:get-build()), " ")
