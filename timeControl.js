const net = require('net');

// Test blockList

const blockList = new net.BlockList();
blockList.addAddress('192.168.56.1');
