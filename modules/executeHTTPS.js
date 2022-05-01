import { createRequire } from 'module';
const require = createRequire(import.meta.url); // allows use of require in file
const net = require('net');

// Execute the HTTPS requests
export function executeRequest(req, socket, bodyhead, hostDomain, hostPort) {
  // node.js net.socket creates a TCP client which allows us intercept the HTTPS requests
  const proxySocket = new net.Socket();

  // If website is on blocklist, hostDomain was set to null, .end() will stop the request and continue to next
  if (hostDomain == null) {
    proxySocket.end();
  }

  proxySocket.connect(hostPort, hostDomain, () => {
    proxySocket.write(bodyhead);
    // Writing to head needed for website to load. HTTP Headers
    socket.write('HTTP/' + req.httpVersion + ' 200 Connection established\r\n\r\n');
  });

  proxySocket.on('data', (chunk) => {
    socket.write(chunk);
  });

  proxySocket.on('end', () => {
    socket.end();
  });

  proxySocket.on('error', function () {
    // Writing to head needed for website to load. HTTP Headers
    socket.write('HTTP/' + req.httpVersion + ' 500 Connection error\r\n\r\n');
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
}
