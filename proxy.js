const http = require('http');
const https = require('https');
const url = require('url');

// Simple HTTP server
const server = http.createServer((clientRequest, clientResponse) => {
    // parsing
    const requestParse = url.parse(clientRequest.url);

    // Frame the request for ease of use later on
    const options = {
        method: clientRequest.method,
        headers: clientRequest.headers,
        host: requestParse.hostname,
        port: requestParse.port || 80,
        path: requestParse.path
    };

    console.log(`${options.method} : http://${options.host}${options.path}`);

    // Execute request
    // executeRequest(options, clientRequest, clientResponse)

    // Test website block
    const hostName = (requestParse.hostname).toString;
    if (hostName.indexOf("cern")) {
        console.log("Website blocked")
    } else {
        executeRequest(options, clientRequest, clientResponse)
    }
});


// Execute HTTP Requests
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

// Listen for HTTP request on port 8080
server.listen(8080, () => {
    console.log("HTTP proxy running on port 8080");
});

httpsServer.listen(8081, () => {
    console.log("HTTPS proxy running on port 8081");
});
