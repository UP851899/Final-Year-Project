import { createRequire } from 'module';
import * as db from './dbHandler.js';

const require = createRequire(import.meta.url); // allows use of require in file

const httpProxy = require('http-proxy');
const http = require('http');
const url = require('url');
const net = require('net');
const proxyPort = 443; // Port for proxy running on this machines local IP
const hostIP = '0.0.0.0';

// Express front end server setup \\
const express = require('express');
const app = express();
const expressPort = 8080;
app.listen(expressPort, hostIP, (e) => {
  console.log(`web server ${e ? 'failed to start' : `listening on port ${expressPort}`}`);
});

app.use(express.json());
// app.use('/', express.static('frontend', { extensions: ['html'] }), (req, res) => {
//   res.redirect('/index.html')
// });
app.use('/', express.static('frontend', { extensions: ['html'] }));

// Collect array of website blocking parameters
let blockList;
await getWebsites();

// Function to refresh the blockList array with any changes made by user
const refreshBlocklist = setInterval(() => {
  getWebsites();
  // console.log('blocklist updated'); // Testing update
  // console.log(blockList);
}, 60000) // 60000ms


const server = http.createServer((req, res) => {
  const urlParse = url.parse(req.url);
  const target = urlParse.protocol + '//' + urlParse.host;

  console.log('HTTP request:', target);

  const proxy = httpProxy.createProxyServer({});

  proxy.on('error', function (err, req, res) {
    console.log('Something went wrong with the proxy - ', err);
    res.end();
  });

  proxy.web(req, res, { target });
});

// Regular expression to remove hostname, url and just be left with the port
const regexForPort = /^([^:]+)(:([0-9]+))?$/;

const getHostInfo = (hostString, defaultPort) => {
  let host = hostString;
  let port = defaultPort; // Being 443, assuming its HTTPS

  const result = regexForPort.exec(host);
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
  const hostSplitArray = getHostInfo(req.url, 443);
  let hostDomain = hostSplitArray[0];
  const hostPort = parseInt(hostSplitArray[1]);
  console.log('HTTPS request:', hostDomain, hostPort);
 
  // Comparing the domain to each blocked site in the database array
  for (const url of blockList) {
    if ((hostDomain).indexOf(url) > -1) {
      console.log('Blocked!', hostDomain);
      hostDomain = null; // Remove domain address from request
      break; // breaks loop to execute the request with null domain value
    }
  }
  executeRequest();

  // Execute the HTTPS requests
  function executeRequest() {
    // node.js net.socket creates a TCP client which allows us intercept the HTTPS requests
    const proxySocket = new net.Socket();

    // If website is on blocklist, hostDomain was set to null, .end() will stop the request and continue to next
    if (hostDomain == null) {
      proxySocket.end();
    }

    proxySocket.connect(hostPort, hostDomain, () => {
      proxySocket.write(bodyhead);
      socket.write('HTTP/' + req.httpVersion + ' 200 Connection established\r\n\r\n');
    });

    proxySocket.on('data', (chunk) => {
      socket.write(chunk);
    });

    proxySocket.on('end', () => {
      socket.end();
    });

    proxySocket.on('error', function () {
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
});

server.listen(proxyPort, hostIP, () => { // Proxy will run on port 443 and will be accessible on the local PCs IP
  console.log('Proxy running of port 443');
}); // this is the port your clients will connect to

// Get websites for blocking functionality
async function getWebsites() {
  const result = await db.getURLS();
  const array = result.map((value) => value.address);
  blockList = array;
}

// Get websites and corresponding filter for dashboard display
async function getWebsitesJson(req, res) {
  let result = [];
  result = await db.siteFilter();
  return res.json(result)
}

// Get filters for dashboard display
async function getFiltersJson(req, res) {
  const result = await db.getFilters();
  const array = result.map((value) => value.filter);
  return res.json(array);
}

// async wrap for functions, deals with promises and errors with database queries
function asyncWrap(f) {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next))
      .catch((e) => next(e || new Error()));
  };
}

app.get('/websites', asyncWrap(getWebsitesJson));
app.get('/filters', asyncWrap(getFiltersJson));