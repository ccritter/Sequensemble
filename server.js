const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');

const bodyParser = require('body-parser');
const favicon = require('serve-favicon');

const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

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
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render("error"); TODO Make this error page
});


///////////////////////////////
//          SOCKETS          //
///////////////////////////////

let freq = 110;

/*
MAX CLIENTS
*/
let maxClients = io.of('/maxclients');
maxclients.on('connection', (socket) => {
  console.log('a Max client connected');
  socket.emit('freq', freq);
});



/*
PARTICIPANTS
*/
let participants = io.of('/participants');
participants.on('connection', (socket) => {
  // TODO: PROTECT AGAINST MALICIOUS SOCKET CONNECTIONS
  console.log('a participant connected');
  
  freq *= 2;

  maxClients.emit('freq', freq);

  socket.on('disconnect', () => {
    console.log('user disconnected');
    freq = freq / 2;
    maxClients.emit('freq', freq);
  });
});

http.listen(port, () => {
  console.log('ready');
});