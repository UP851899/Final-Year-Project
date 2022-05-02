// import { createRequire } from 'module';
import sqlite from 'sqlite3';
import { open } from 'sqlite';
// For testing, must be included to work with babel
import 'core-js/stable';
import 'regenerator-runtime/runtime';
// const require = createRequire(import.meta.url);

// Async function to setup database from file. Try catch to detect issues without breaking program
async function init() {
  try {
    const db = await open({
      filename: './websites.sqlite',
      driver: sqlite.Database,
    });
    await db.migrate({ migrationsPath: './migrations' });
    return db;
  } catch (err) {
    console.log(err);
  }
}

const dbConnect = init();

// Queries variable assignment
let q;

// Return array of site addresses
export async function getURLS() {
  const db = await dbConnect;
  q = 'SELECT DISTINCT site_address address FROM blockedSites;';
  return db.all(q);
}

// Return array of filters
export async function getFilters() {
  const db = await dbConnect;
  q = 'SELECT DISTINCT filter_name filter FROM websiteFilters;';
  return db.all(q);
}

// Get filter by ID
export async function getFilterByID(id) {
  const db = await dbConnect;
  return db.all('SELECT filter_name filter FROM websiteFilters where filter_ID = (?)', [id]);
}

// Return Website with filter name
export async function siteFilter() {
  const db = await dbConnect;
  q = 'SELECT blockedSites.site_address address, websiteFilters.filter_name filter FROM blockedSites, websiteFilters WHERE blockedSites.filter_ID=websiteFilters.filter_ID';
  return db.all(q);
}

export async function newWebsite(website, index) {
  // console.log(website, index);
  const db = await dbConnect;
  db.run('INSERT INTO blockedSites(site_address, filter_ID) VALUES (?, ?)', [website, index]);
}

// Add new filter to db
export async function newFilter(filter) {
  const db = await dbConnect;
  db.run('INSERT INTO websiteFilters(filter_name) VALUES (?)', [filter]);
}

// Delete a website from the db
export async function removeWebsite(website) {
  const db = await dbConnect;
  db.run('DELETE FROM blockedSites WHERE site_address = (?)', [website]);
}

// Update a website and its filter
export async function updateWebsite(websiteOriginal, websiteNew, indexNew) {
  const db = await dbConnect;
  db.run('UPDATE blockedSites SET site_address = (?), filter_ID = (?) WHERE site_address = (?)',
    [websiteNew, indexNew, websiteOriginal]);
}

// Verify username and password
export async function findUser(username, password) {
  const db = await dbConnect;
  // q = 'SELECT * FROM admin WHERE admin_username = (?) AND admin_password = (?)';
  // return db.run(q, [username, password]);
  // console.log(db.all('SELECT * FROM admin WHERE admin_username = (?) AND admin_password = (?)', [username, password]));
  return db.all('SELECT * FROM admin WHERE admin_username = (?) AND admin_password = (?)', [username, password]);
}

export async function findUsernames() {
  const db = await dbConnect;
  return db.all('SELECT admin_username FROM admin');
}
