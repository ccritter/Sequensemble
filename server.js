const path = require('path');
// const bodyParser = require('body-parser');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json());
// app.use(express.static(/*TODO*/));

// app.use((req, res) => {
//   res.setHeader('Content-Type', 'text/plain')
//   res.write('you posted:\n')
//   res.end(JSON.stringify(req.body, null, 2))
// });

app.post('/', (req, res) => {
  res.end();

  if (req.body.hasOwnProperty('type') /* && (req.body.type === ?) */) {
    // Max.post(`points ${req.body.data.length}`);
    Max.outlet(req.body);
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/temp.html');
});

let freq = 110;

// TODO: PROTECT AGAINST MALICIOUS SOCKET CONNECTIONS
io.on('connection', (socket) => {
  console.log('a user connected');
  
  freq *= 2;

  io.emit('freq', freq);

  socket.on('disconnect', () => {
    console.log('user disconnected');
    freq = freq / 2;
    io.emit('freq', freq);
  });
});

io.on('disconnect', () => {

});

http.listen(port, () => {
  console.log('ready');
});