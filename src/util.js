export function resolveUrl(url){
    return new URL(url, document.baseURI).href;
}