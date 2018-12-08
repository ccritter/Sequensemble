const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const server = app.listen(port)
const path = require('path');

const bodyParser = require('body-parser');
const favicon = require('serve-favicon');

const io = require('socket.io').listen(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');  

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/*
app.post('/', (req, res) => {
  res.end();

  if (req.body.hasOwnProperty('type')  && (req.body.type === ?) ) {

  }
});
*/

// Serve the main page
app.get('/', (req, res) => {
  res.render('index', {title: 'Test'});
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render("error"); TODO Make this error page
});


///////////////////////////////
//          SOCKETS          //
///////////////////////////////

const MAX_NUM_USERS = 32;
// List of booleans, denoting if they are currently in use. Init first elem to true so no one has 0 id
let activeSeqs = [true].concat([...Array(MAX_NUM_USERS)].map(e => false));
let numConnected = 0;

/*
MAX CLIENTS
*/
let maxClients = io.of('/maxclients');
maxClients.on('connection', (socket) => {
  console.log('a Max client connected');
  // Send new client instance all user data.
});

/*
PARTICIPANTS
*/
let participants = io.of('/participants');
participants.on('connection', (socket) => {
  // TODO: PROTECT AGAINST MALICIOUS SOCKET CONNECTIONS
  console.log(`a participant connected`);
  numConnected++;
  // TODO: Send the user a notification that they were booted because the site is full
  if (numConnected > MAX_NUM_USERS) socket.disconnect(true);

  // Find the first inactive voice
  let thisSeq = activeSeqs.findIndex(active => !active);
  if (thisSeq < 0) {
    // Invariant: This will never happen because we prevent going over the max connections, so there should always be an open seq.
    throw "This should never be thrown"
  }

  activeSeqs[thisSeq] = true;
  maxClients.emit('newuser', thisSeq);

  socket.on('disconnect', () => {
    numConnected--;
    activeSeqs[thisSeq] = false;
    maxClients.emit('userleft', thisSeq);
    console.log('user disconnected');
  });

  // TODO: Ratelimit requests, only emit every so often (or only have the client emit every so often)
  socket.on('note', note => maxClients.emit('note', [thisSeq, note.x, note.y, note.val]));
  socket.on('oct', oct => maxClients.emit('oct', [thisSeq, oct]));
  socket.on('vel', vel => maxClients.emit('vel', [thisSeq, vel.col, vel.val]));
  socket.on('env', adsr => maxClients.emit('env', [thisSeq, adsr.type, adsr.val]));
  socket.on('ins', ins => maxClients.emit('ins', [thisSeq, ins.type, ...ins.vals]))
});