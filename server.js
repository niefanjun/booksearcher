var http = require("http");
var url = require("url");
function start(route,handle){
    function onRequest(request,response){
        var pathname = url.parse(request.url).pathname;
        var arg = url.parse(request.url,true).query;
        console.log("Request for"+pathname+"recevide");
        route(handle, pathname, response, request);        
    }
    http.createServer(onRequest).listen(8000);
    console.log("server start");
}
exports.start=start;
