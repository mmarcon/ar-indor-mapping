var static = require('node-static');

var file = new(static.Server)('./frontend');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response);
    });
}).listen(9001);