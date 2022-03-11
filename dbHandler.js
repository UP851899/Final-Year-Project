// // import { createRequire } from 'module';
// import sqlite from 'sqlite3';
// import { open } from 'sqlite';
// // const require = createRequire(import.meta.url);

// // async function init() {
// //   const db = await open({
// //     filename: './fileDB.sqlite',
// //     driver: sqlite.Database,
// //   });
// //   await db.migrate({ migrationPath: './migrations' });
// //   return db;
// // }

// async function init() {
//   try {
//     const db = await open({
//       filename: './websites.sqlite',
//       driver: sqlite.Database,
//     });
//     await db.migrate({ migrationsPath: './migrations' });
//     return db;
//   } catch (err) {
//     console.log(err);
//   }
// }

// const dbConnect = init();

// // Queries
// let q;

// // Return array of site addresses
// export async function getURLS() {
//   const db = await dbConnect;
//   q = 'SELECT DISTINCT site_address FROM blockedSites;';
//   return db.all(q);
// }
