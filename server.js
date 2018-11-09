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

let curNote;

/*
MAX CLIENTS
*/
let maxClients = io.of('/maxclients');
maxClients.on('connection', (socket) => {
  console.log('a Max client connected');
  socket.emit('note', curNote);
});



/*
PARTICIPANTS
*/
let participants = io.of('/participants');
participants.on('connection', (socket) => {
  // TODO: PROTECT AGAINST MALICIOUS SOCKET CONNECTIONS
  console.log('a participant connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('note', (noteNum) => {
    curNote = noteNum;
    maxClients.emit('note', noteNum);
  });
});