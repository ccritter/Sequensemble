const Max = require('max-api');
const path = require('path');
const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
	Max.post('Connection successful.');
});

socket.on('freq', (hz) => {
  Max.post(hz);
	Max.outlet('freq', hz);
});

// This will be printed directly to the Max console
Max.post(`Loaded the ${path.basename(__filename)} script`);

// Use the 'addHandler' function to register a function for a particular message
Max.addHandler('bang', () => {
	Max.post("Who you think you bangin'?");
});

// Use the 'outlet' function to send messages out of node.script's outlet
Max.addHandler('echo', (msg) => {
	Max.outlet(msg);
});