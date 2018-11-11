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

// Socket id -> Sequencer id
let idToSeq = new Map();
// List of booleans, denoting if they are currently in use. Init first elem to true so no one has 0 id
let activeSeqs = [true];

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
  console.log(`a participant with id ${socket.id} connected`);

  // Find the first inactive voice
  let newSeq = activeSeqs.findIndex(active => !active);
  if (newSeq < 0) {
    newSeq = activeSeqs.length;
    activeSeqs.push(true);
  }

  activeSeqs[newSeq] = true;
  idToSeq.set(socket.id, newSeq);
  maxClients.emit('newuser', newSeq);

  socket.on('disconnect', () => {
    let seq = idToSeq.get(socket.id);
    activeSeqs[seq] = false;
    idToSeq.delete(socket.id);
    maxClients.emit('userleft', seq);
    console.log('user disconnected');
  });

  // TODO: Ratelimit requests, only emit every so often (or only have the client emit every so often)
  socket.on('note', (note) => maxClients.emit('note', [idToSeq.get(socket.id), note.x, note.y, note.val]));
  socket.on('vel', (vel) => maxClients.emit('vel', [idToSeq.get(socket.id), vel.col, vel.val]));
});