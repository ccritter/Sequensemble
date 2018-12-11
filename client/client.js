const Max = require('max-api');
const path = require('path');
const io = require('socket.io-client');
const url = 'http://cm.chriscritter.com';
// const url = 'http://localhost:3000';
const socket = io(`${url}/maxclients`);

socket.on('connect', () => Max.post('Connection successful.'));

socket.on('newuser', id => Max.outlet('newuser', id));
socket.on('userleft', id => Max.outlet('userleft', id));
socket.on('note', note => Max.outlet('note', ...note));
socket.on('oct', oct => Max.outlet('oct', ...oct));
socket.on('vel', vel => Max.outlet('vel', ...vel));
socket.on('env', adsr => Max.outlet('env', ...adsr));
socket.on('ins', ins => Max.outlet('ins', ...ins));