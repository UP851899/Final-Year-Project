import { createRequire } from 'module';
const require = createRequire(import.meta.url); // allows use of require in file

const net = require('net');
const date = require('date-and-time');

// Export blockList to proxy, can be read and adjusted
export const timeControlBlock = new net.BlockList();

// Date object
const now = new Date();
// const hourStyle = date.compile('H');
// const minuteStyle = date.compile('m');
const hourMinuteStyle = date.compile('HH:mm');

// Log current Hour and Minute in HH:mm 24hr format, eg 14:29
console.log(date.format(now, hourMinuteStyle));
if ((date.format(now, hourMinuteStyle)) === '09:09') {
  console.log('Time matches');
}

export function checkTime() {
  const now = new Date();
  if ((date.format(now, hourMinuteStyle)) === '09:21') { // Can be replaced with variable from db
    console.log('Blocking device due to time');
    timeControlBlock.addAddress('192.168.1.216'); // Adds IP to timeControl blocklist
  }
}
