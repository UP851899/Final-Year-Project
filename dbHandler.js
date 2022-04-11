// import { createRequire } from 'module';
import sqlite from 'sqlite3';
import { open } from 'sqlite';
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

export async function newFilter(filter) {
  const db = await dbConnect;
  db.run('INSERT INTO websiteFilters(filter_name) VALUES (?)', [filter]);
}
