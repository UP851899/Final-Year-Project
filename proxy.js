const res = require('express/lib/response');
const http = require('http');
const https = require('https');
const url = require('url');
const express = require('express');
const app = express();

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
    path: requestParse.path,
  };

  console.log(`${options.method} : http://${options.host}${options.path}`);

  // Test website block
  const hostName = (requestParse.hostname).toString();
  if (hostName.indexOf('cern')) {
    console.log('Website blocked');
    clientRequest.destroy();
  } else {
    executeRequest(options, clientRequest, clientResponse);
  }
});


// Execute HTTP Requests
const executeRequest = (options, clientRequest, clientResponse) => {
  const externalRequest = http.request(options, (externalResponse) => {
    // Response from external web server
    clientResponse.writeHead(externalResponse.statusCode, externalResponse.headers);

    externalResponse.on('data', (chunk) => {
      clientResponse.write(chunk);
    });

    externalResponse.on('end', () => {
      clientResponse.end();
    });
  });

  clientRequest.on('end', () => {
    externalRequest.end();
  });

  clientRequest.on('data', (chunk) => {
    externalRequest.write(chunk);
  });
};

// Port and IP assignments for proxy server
const port = 8080;
const hostIP = '0.0.0.0';

// Express assignments
const expressPort = 8082;

// Listen for HTTP request on port 8080
server.listen(port, hostIP, () => {
  console.log('HTTP proxy running on port 8080');
});

app.get('/', function (req, res) {
  res.send('Test server');
});

app.listen(expressPort, function () {
  console.log(`testing on port ${expressPort}`);
});

// Listen for HTTPS request on port 8081
// httpsServer.listen(8081, () => {
//     console.log("HTTPS proxy running on port 8081");
// });
