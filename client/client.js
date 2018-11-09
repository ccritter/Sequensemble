const Max = require('max-api');
const path = require('path');
const io = require('socket.io-client');
// const url = 'http://cm.chriscritter.com';
const url = 'http://localhost:3000';
const socket = io(`${url}/maxclients`);

socket.on('connect', () => {
	Max.post('Connection successful.');
});

socket.on('note', (noteNum) => {
  // Max.post(hz);
	Max.outlet('note', noteNum);
  // Max.outlet('test', {a: 1, b: 2});
});

// Use the 'addHandler' function to register a function for a particular message
Max.addHandler('bang', () => {
	Max.post("Who you think you bangin'?");
});

// Use the 'outlet' function to send messages out of node.script's outlet
Max.addHandler('echo', (msg) => {
	Max.outlet(msg);
});