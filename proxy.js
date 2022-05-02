import { createRequire } from 'module';
import * as ex from './modules/executeHTTPS.js';
import * as db from './modules/dbHandler.js';
import * as ghi from './modules/getHostInfo.js';

const require = createRequire(import.meta.url); // allows use of require in file

const httpProxy = require('http-proxy');
const http = require('http');
const url = require('url');
const proxyPort = 443; // Port for proxy running on this machines local IP
const hostIP = '0.0.0.0'; // Local IP of machine running

// Express front end server setup & auth \\
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app = express();
const expressPort = 8080; // Port for express server

app.listen(expressPort, hostIP, (e) => {
  console.log(`web server ${e ? 'failed to start' : `listening on port ${expressPort}`}`);
});

app.use(express.json()); // Parse incoming JSON requests into req.body

// ------------------------ \\
// ---- Authentication ---- \\
// ------------------------ \\

const session = require('express-session');
const __dirname = path.resolve(); // setup __dirname to be used

app.use(session({
  secret: 'dashboard', // Secret key
  saveUninitialized: true, // Forces uninitialized sessions to be saved
  resave: true, // Forces session to be saved
}));

app.use(express.urlencoded({
  extended: true, // Parses incoming requests
}));

app.use(express.static(path.join(__dirname, '/frontend/style'))); // set style folder
app.use(express.static(path.join(__dirname, '/frontend/images'))); // set images folder
app.use(express.static(path.join(__dirname, '/frontend/script'))); // set script folder

app.get('/', (req, res, next) => { // Users will only get login
  if (!req.session.admin) { // If not admin, load login form
    res.sendFile(__dirname + '/frontend/login.html'); // Login page in HTML
  } else { // If admin session is already set, move to blocking page
    res.redirect(301, '/blocking.html');
  }
});

app.post('/authenticate', async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const result = await findUsers(username, password);

  if (result.length > 0) {
    console.log('correct');

    req.session.admin = true; // Set sessions logged in status for verification
    req.session.user = username;
    req.session.save(); // Save needed so it works in app.post functions

    await res.redirect(301, '/blocking.html'); // Redirect to default page
  } else {
    console.log('incorrect');
    res.send('Username and/or Password incorrect');
  }
  res.end(); // End response process
});

app.get('/blocking.html', function (req, res, next) {
  // If the user is admin
  if (req.session.admin) {
    return res.sendFile(__dirname + '/frontend/blocking.html');
  } else {
    res.redirect('/'); // Redirect to login if user is not logged in
  }
  res.end();
});

app.get('/logout', (req, res, next) => {
  req.session.admin = false; // Changes session details to false
  res.redirect('/');
});

// -------------------- \\
// --- Proxy Server --- \\
// -------------------- \\

// body-parser config for express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// // Collect array of website blocking parameters
// let blockList;

// // Functionality to refresh the blockList array with any changes made by user
// async function setBlockList() {
//   console.log('Blocklist updated');
//   console.log(blockList)
//   blockList = await getWebsites();
// }
// setBlockList();
// setInterval(setBlockList, 5000);

// Collect array of website blocking parameters
let blockList;
await getWebsites();

// Function to refresh the blockList array with any changes made by user
const refreshBlocklist = setInterval(async () => {
  await getWebsites();
  console.log('blocklist updated'); // Testing update
}, 60000); // 60000ms


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

server.addListener('connect', (req, socket, bodyhead) => {
  /*
  hostSplitArray uses the getHostInfo function to return an array of data from the URL
  what is returned is the domain & the port (usually 433 for https)
  Extracting these individual elements allows us to properly connect to the site
  */
  const hostSplitArray = ghi.getHostInfo(req.url, 443);
  let hostDomain = hostSplitArray[0];
  const hostPort = parseInt(hostSplitArray[1]);
  console.log('HTTPS request:', hostDomain);

  // Comparing the domain to each blocked site in the database array
  for (const url of blockList) {
    if ((hostDomain).indexOf(url) > -1) {
      console.log('Blocked!', hostDomain);
      hostDomain = null; // Remove domain address from request
      break; // breaks loop to execute the request with null domain value
    }
  }
  // Executes the HTTPS request in executeHTTPS script in modules
  ex.executeRequest(req, socket, bodyhead, hostDomain, hostPort);
});

server.listen(proxyPort, hostIP, () => { // Proxy will run on port 443 and will be accessible on the local PCs IP
  console.log('Proxy running of port 443');
}); // this is the port your clients will connect to

// ------------------------------------------- \\
// --- Database functionality with express --- \\
// ------------------------------------------- \\

// Get websites for blocking functionality
async function getWebsites() {
  const result = await db.getURLS();
  const array = result.map((value) => value.address); // .map used to extract specific values, .address in response
  blockList = array;
}

// Get websites and corresponding filter for dashboard display
async function getWebsitesJson(req, res) {
  let result = [];
  result = await db.siteFilter();
  return res.json(result); // Return as JSON for HTTP POST
}

// Get filters for dashboard display
async function getFiltersJson(req, res) {
  const result = await db.getFilters();
  const array = result.map((value) => value.filter); // .map used to extract specific values, .filter in response
  return res.json(array); // Return as JSON for HTTP POST
}

// Database query to find a user with given usernames and password
async function findUsers(username, password) {
  let result = [];
  result = await db.findUser(username, password);
  return result;
}

// async wrap for functions, deals with promises and errors with database queries
// Could possibly be replaced with express-async-wrap - Look at in future to reduce code use
function asyncWrap(f) {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next))
      .catch((e) => next(e || new Error()));
  };
}

app.get('/websites', asyncWrap(getWebsitesJson));
app.get('/filters', asyncWrap(getFiltersJson));

// Grabs values when user saves on "add website"
app.post('/newWebsite', (req, res, next) => {
  try {
    db.newWebsite(req.body.website, req.body.id);
    // console.log(req.body.website); // For testing
    // console.log(req.body.id);
    res.redirect('/blocking.html');
    next();
  } catch (err) {
    console.log(err);
    res.redirect('/blocking.html');
  }
});

// Grabs values when user saves on "add filter"
app.post('/newFilter', (req, res, next) => {
  try {
    db.newFilter(req.body.filter);
    // console.log(req.body.filter); // For testing
    res.redirect('/blocking.html');
    next();
  } catch (err) {
    console.log(err);
    res.redirect('/blocking.html');
  }
});

app.post('/updateWebsite', (req, res, next) => {
  try {
    db.updateWebsite(req.body.originalWebsite, req.body.newWebsite, req.body.newFilter);
    res.redirect('/blocking.html');
    next();
  } catch (err) {
    console.log(err);
    res.redirect('/blocking.html');
  }
});

app.post('/deleteWebsite', (req, res, next) => {
  try {
    db.removeWebsite(req.body.website);
    res.redirect('/blocking.html');
    next();
  } catch (err) {
    console.log(err);
    res.redirect('/blocking.html');
  }
});

// --------------------------------------------- \\
