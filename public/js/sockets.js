var socket = io('/participants');

$('form').submit(function (event) {
  socket.emit('note', parseInt($('#note').val()));
  event.preventDefault();
});