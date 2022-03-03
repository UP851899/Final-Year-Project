const http = require('http');
const url = require('url');

// Simple HTTP server
const server = http.createServer((clientRequest, clientResponse) => {
    // parsing
    const requestParse = url.parse(clientRequest.url);

    // Frame the request
    const options = {
        method: clientRequest.method,
        headers: clientRequest.headers,
        host: requestParse.hostname,
        port: requestParse.port || 80,
        path: requestParse.path
    };

    console.log(`${options.method} : http://${options.host}${options.path}`);

    // Execute request
    executeRequest(options, clientRequest, clientResponse)
});

const executeRequest = (options, clientRequest, clientResponse) => {
    const externalRequest = http.request(options, (externalResponse) => {
        // Response from external web server
        clientResponse.writeHead(externalResponse.statusCode, externalResponse.headers);

        externalResponse.on("data", (chunk) => {
            clientResponse.write(chunk)
        })

        externalResponse.on("end", () => {
            clientResponse.end();
        })
    })

    clientRequest.on("end", () => {
        externalRequest.end();
    })

    clientRequest.on("data", (chunk) => {
        externalRequest.write(chunk);
    })
}

server.listen(8080, () => {
    console.log("Proxy running on port 8080");
})