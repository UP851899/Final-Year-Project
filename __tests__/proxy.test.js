/* eslint-disable */
const proxy = require('../modules/getHostInfo.js');

// Testing host and port extraction
describe('Testing reg-edit for hostname and port extraction', () => {
    test('Retrieving hostname from regex function', () => {
        const host = 'www.paddypower.com:443';
        const expectedHost = 'www.paddypower.com';
        const expectedPort = 443;
        const array = proxy.getHostInfo(host, 443);
        expect(array[0]).toEqual('www.paddypower.com')
    })
})