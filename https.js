const httpProxy = require("http-proxy"),
    http = require("http"),
    url = require("url"),
    net = require('net'),
    port = 443, //Port for proxy running on this machines local IP
    hostIP = '0.0.0.0',
    expressPort = 8080;

const server = http.createServer(function (req, res) {
    let urlObj = url.parse(req.url);
    let target = urlObj.protocol + "//" + urlObj.host;

    console.log("HTTP request for:", target);

    const proxy = httpProxy.createProxyServer({});
    proxy.on("error", function (err, req, res) {
        console.log("proxy error", err);
        res.end();
    });

    proxy.web(req, res, { target: target });
})

const regexForPort = /^([^:]+)(:([0-9]+))?$/;

const getPortFromURL = function (hostString, defaultPort) {
    let host = hostString;
    let port = defaultPort;

    let result = regexForPort.exec(host);
    if (result != null) {
        host = result[1];
        if (result[2] != null) {
            port = result[3];
        }
    }

    return ([host, port]);
};

server.addListener('connect', function (req, socket, bodyhead) {
    let hostPort = getPortFromURL(req.url, 443);
    let hostDomain = hostPort[0];
    let port = parseInt(hostPort[1]);
    console.log("HTTPS request for:", hostDomain, port);

    let proxySocket = new net.Socket();
    proxySocket.connect(port, hostDomain, function () {
        proxySocket.write(bodyhead);
        socket.write("HTTP/" + req.httpVersion + " 200 Connection established\r\n\r\n");
    }
    );

    proxySocket.on('data', function (chunk) {
        socket.write(chunk);
    });

    proxySocket.on('end', function () {
        socket.end();
    });

    socket.on('data', function (chunk) {
        proxySocket.write(chunk);
    });

    socket.on('end', function () {
        proxySocket.end();
    });
});

server.listen(port, hostIP, () => {
    console.log("Proxy running of port 8080");
});  //this is the port your clients will connect to