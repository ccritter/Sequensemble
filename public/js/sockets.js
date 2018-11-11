var socket = io('/participants');

// $('form').submit(function (event) {
//   socket.emit('note', parseInt($('#note').val()));
//   event.preventDefault();
// });

var sequencer = new Interface.Panel({ container:("#sequencer") });
sequencer.background = 'black';
var sequencerButtons = new Interface.MultiButton({
  rows:12, columns:16,
  bounds:[.05,.05,.9,.5],
  onvaluechange : function(row, col, value) {
    socket.emit('note', {x: col, y: row, val: value});
    multiButtonLabel
    .setValue( 'row : ' + row + ' , col : ' + col + ' , value : ' + value);
  },
});
// TODO Remove these
var multiButtonLabel = new Interface.Label({ 
  bounds:[.05,.5, .9, .1],
  hAlign:"left",
  value:""
});


var velocities = new Interface.MultiSlider({ 
  count:16,
  bounds:[.05,.55,.9,.2],
  onvaluechange : function(number, value) {
    socket.emit('vel', {col: number, val: value});
    multiSliderLabel.setValue( 'num : ' + number + ' , value : ' + value);
  }
});

var multiSliderLabel = new Interface.Label({ 
  bounds:[.05, .9, .9, .1],
  hAlign:"left",
  value:" ",
});

// a.background = 'black';
// a.add(multiSlider, multiSliderLabel);

sequencer.add(sequencerButtons, multiButtonLabel, velocities, multiSliderLabel);
