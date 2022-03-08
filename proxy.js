const httpProxy = require("http-proxy"),
    http = require("http"),
    url = require("url"),
    net = require('net'),
    port = 443, //Port for proxy running on this machines local IP
    hostIP = '0.0.0.0',
    expressPort = 8080;

const server = http.createServer((req, res) => {
    let url = url.parse(req.url);
    let target = url.protocol + "//" + url.host;

    console.log("HTTP request:", target);

    const proxy = httpProxy.createProxyServer({});

    proxy.on("error", function (err, req, res) {
        console.log("Something went wrong with the proxy - ", err);
        res.end();
    });

    proxy.web(req, res, { target: target });
})

// Regular expression to remove hostname, url and just be left with the port
const regexForPort = /^([^:]+)(:([0-9]+))?$/;

const getPortFromURL = (hostString, defaultPort) => {
    let host = hostString;
    let port = defaultPort; // Being 443, assuming its HTTPS

    let result = regexForPort.exec(host);
    if (result[2] != null) {
        port = result[3]; // Port of host replaces default for try value
    }
    return (port);
};

server.addListener('connect', (req, socket, bodyhead) => {
    let hostPort = parseInt(getPortFromURL(req.url, 443)); // Retrieve port of host in from of INT
    let hostDomain = req.url; // Gathers domain from request
    console.log("HTTPS request:", hostDomain, hostPort);

    /* 
    node.js net.socket creates a TCP client which allows us intercept the HTTPS requests
    */
    let proxySocket = new net.Socket();
    proxySocket.connect(port, hostDomain, () => {
        proxySocket.write(bodyhead);
        socket.write("HTTP/" + req.httpVersion + " 200 Connection established\r\n\r\n");
    }
    );

    proxySocket.on('data', (chunk) => {
        socket.write(chunk);
    });

    proxySocket.on('end', () => {
        socket.end();
    });

    socket.on('data', (chunk) => {
        proxySocket.write(chunk);
    });

    socket.on('end', () => {
        proxySocket.end();
    });
});

server.listen(port, hostIP, () => { // Proxy will run on port 443 and will be accessible on the local PCs IP
    console.log("Proxy running of port 8080");
});  //this is the port your clients will connect to