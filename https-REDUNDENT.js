const httpProxy = require('http-proxy');
const http = require('http');
const url = require('url');
const net = require('net');

const server = http.createServer(function (req, res) {
  const urlObj = url.parse(req.url);
  const target = urlObj.protocol + '//' + urlObj.host;

  console.log('Proxy HTTP request for:', target);

  const proxy = httpProxy.createProxyServer({});
  proxy.on('error', function (err, req, res) {
    console.log('proxy error', err);
    res.end();
  });

  proxy.web(req, res, { target });
}).listen(443); // this is the port your clients will connect to

const regex_hostport = /^([^:]+)(:([0-9]+))?$/;

const getHostPortFromString = function (hostString, defaultPort) {
  let host = hostString;
  let port = defaultPort;

  const result = regex_hostport.exec(hostString);
  if (result != null) {
    host = result[1];
    if (result[2] != null) {
      port = result[3];
    }
  }

  return ([host, port]);
};

server.addListener('connect', function (req, socket, bodyhead) {
  const hostPort = getHostPortFromString(req.url, 443);
  const hostDomain = hostPort[0];
  const port = parseInt(hostPort[1]);
  console.log('Proxying HTTPS request for:', hostDomain, port);

  const proxySocket = new net.Socket();
  proxySocket.connect(port, hostDomain, function () {
    proxySocket.write(bodyhead);
    socket.write('HTTP/' + req.httpVersion + ' 200 Connection established\r\n\r\n');
  },
  );

  proxySocket.on('data', function (chunk) {
    socket.write(chunk);
  });

  proxySocket.on('end', function () {
    socket.end();
  });

  proxySocket.on('error', function () {
    socket.write('HTTP/' + req.httpVersion + ' 500 Connection error\r\n\r\n');
    socket.end();
  });

  socket.on('data', function (chunk) {
    proxySocket.write(chunk);
  });

  socket.on('end', function () {
    proxySocket.end();
  });

  socket.on('error', function () {
    proxySocket.end();
  });
});
