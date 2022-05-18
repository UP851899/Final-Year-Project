import { createRequire } from 'module';
const require = createRequire(import.meta.url); // allows use of require in file

const net = require('net');

// Export blockList to proxy, can be read and adjusted
export const blockList = new net.BlockList();

// Add test IP to blockList
blockList.addAddress('192.168.1.216');
