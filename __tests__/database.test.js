/* eslint-disable */
const dbHandler = require('../modules/dbHandler.js');

// Testing for specific filter
describe('Filter retrieval test', () => {
  test('Retrieving ID 1 from filter table, should be Gambling', async () => {
    const expected = [{filter: 'Gambling'}]
    let filter = await dbHandler.getFilterByID(1);
    expect(filter).toEqual(expected);
  });
});

// Make sure blockList isn't empty
describe('Is blocklist populated as it should', () => {
  test('Retrieving blocklist table', async () => {
    let blocklist = await dbHandler.getURLS();
    expect(blocklist).not.toBe(null);
  })
})

// Make sure user is setup in database
describe('Is a admin account setup', () => {
  test('Retrieving admin table to make sure account exists', async () => {
    let blocklist = await dbHandler.findUsernames();
    expect(blocklist).not.toBe(null);
  })
})