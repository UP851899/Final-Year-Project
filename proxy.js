const httpProxy = require("http-proxy"),
    http = require("http"),
    url = require("url"),
    net = require('net'),
    proxyPort = 443, //Port for proxy running on this machines local IP
    hostIP = '0.0.0.0',
    expressPort = 8080;

const server = http.createServer((req, res) => {
    let urlParse = url.parse(req.url);
    let target = urlParse.protocol + "//" + urlParse.host;

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

const getHostInfo = (hostString, defaultPort) => {
    let host = hostString;
    let port = defaultPort; // Being 443, assuming its HTTPS

    let result = regexForPort.exec(host);
    if (result != null) {
        host = result[1];
        if (result[2] != null) {
            port = result[3];
        }
    }

    return ([host, port]);
};

server.addListener('connect', (req, socket, bodyhead) => {
    /*
    hostSplitArray uses the getHostInfo function to return an array of data from the URL
    what is returned is the domain & the port (usually 433 for https)
    Extracting these individual elements allows us to properly connect to the site
    */
    let hostSplitArray = getHostInfo(req.url, 443);
    let hostDomain = hostSplitArray[0];
    let hostPort = parseInt(hostSplitArray[1]);
    console.log("HTTPS request:", hostDomain, hostPort);

    /* 
    node.js net.socket creates a TCP client which allows us intercept the HTTPS requests
    */
    let proxySocket = new net.Socket();
    proxySocket.connect(hostPort, hostDomain, () => {
        proxySocket.write(bodyhead);
        socket.write("HTTP/" + req.httpVersion + " 200 Connection established\r\n\r\n");
    });

    proxySocket.on('data', (chunk) => {
        socket.write(chunk);
    });

    proxySocket.on('end', () => {
        socket.end();
    });

    proxySocket.on('error', function () {
        socket.write("HTTP/" + req.httpVersion + " 500 Connection error\r\n\r\n");
        socket.end();
    });

    socket.on('data', (chunk) => {
        proxySocket.write(chunk);
    });

    socket.on('end', () => {
        proxySocket.end();
    });

    socket.on('error', function () {
        proxySocket.end();
    });
});

server.listen(proxyPort, hostIP, () => { // Proxy will run on port 443 and will be accessible on the local PCs IP
    console.log("Proxy running of port 443");
});  //this is the port your clients will connect to
