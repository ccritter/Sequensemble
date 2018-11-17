var socket = io('/participants');

var sequencer = new Interface.Panel({ container:("#sequencer") });
sequencer.background = 'black';

var octave = 3;

var octavebuttons = new Interface.Panel({ container:("#octavebuttons") });

var downOctave = new Interface.Button({ 
  bounds:[0,0,.125,1],
  label:'◀',
  mode:'momentary', 
  ontouchmouseup: function() {
    if (octave > 0) {
      octave--;
      sendOctave();
      octaveLabel.setValue('Octave: ' + octave);
    }
  }
});

var octaveLabel = new Interface.Label({
  bounds:[.125,0.3,.125,.5],
  value:'Octave: 3'
});

var upOctave = new Interface.Button({ 
  bounds:[.25,0,.125,1],
  label:'▶',
  mode:'momentary',
  ontouchmousedown: function() {
    if (octave < 7) {
      octave++;
      sendOctave();
      octaveLabel.setValue('Octave: ' + octave);
    }
  }
});

function sendOctave() {
  socket.emit('oct', octave); 
}

octavebuttons.background = 'black';
octavebuttons.add(downOctave, octaveLabel, upOctave);



var sequencerButtons = new Interface.MultiButton({
  rows:13, columns:16,
  bounds:[0,0,.999,.75],
  onvaluechange : function(row, col, value) {
    socket.emit('note', {x: col, y: row, val: value});
  },
});
// // TODO Remove these
// var multiButtonLabel = new Interface.Label({ 
//   bounds:[.05,.5, .9, .1],
//   hAlign:"left",
//   value:""
// });

var velocities = new Interface.MultiSlider({ 
  count:16,
  bounds:[0,.75,.999,.249],
  onvaluechange : function(number, value) {
    socket.emit('vel', {col: number, val: value});
    // multiSliderLabel.setValue( 'num : ' + number + ' , value : ' + value);
  }
});

// sequencer.add(sequencerButtons, multiButtonLabel, velocities, multiSliderLabel);
sequencer.add(sequencerButtons, velocities);

// TODO: Oninit set/send values?
var adsr = new Interface.Panel({ container:("#adsr") });
adsr.background = 'black';

var a = new Interface.Knob({ 
  bounds:[.05,.05,.1], // TODO: put lower on the panel so that when you drag up it doesn't leave panel and go odd. alternatively, put everything on the same panel
  value:.25, // TODO: Set initial values
  usesRotation:false,
  centerZero: false,
  oninit: function () { this.onvaluechange() },
  onvaluechange: function () {
    // Max attack time is 1000 ms.
    alabel.setValue('Attack: ' + scaleAndSend('atk', this.value, 1000) + 'ms');
  }
});
var alabel = new Interface.Label({
  bounds:[0, .75, .2, .5],
  value:"",
});
var d = new Interface.Knob({ 
  bounds:[.25,.05,.1],
  value:.25,
  usesRotation:false,
  centerZero: false,
  oninit: function () { this.onvaluechange() },
  onvaluechange: function () {
    // Max decay time is 500 ms.
    dlabel.setValue('Decay: ' + scaleAndSend('dec', this.value, 500) + 'ms');
  }
});
var dlabel = new Interface.Label({
  bounds:[.2, .75, .2, .5],
  value:"",
});
var s = new Interface.Knob({ 
  bounds:[.45,.05,.1],
  value:.9,
  usesRotation:false,
  centerZero: false,
  oninit: function () { this.onvaluechange() },
  onvaluechange: function () { 
    slabel.setValue('Sustain: ' + sendEnvelopeData('sus', roundTwoDecimalPlaces(this.value)));
  }
});  
var slabel = new Interface.Label({
  bounds:[.4, .75, .2, .5],
  value:"",
});
var slen = new Interface.Knob({ 
  bounds:[.65,.05,.1],
  value:.75,
  usesRotation:false,
  centerZero: false,
  oninit: function () { this.onvaluechange() },
  onvaluechange: function () { 
    slenlabel.setValue('Sustain Length: ' + scaleAndSend('suslen', this.value, 2000) + 'ms');
  }
});
var slenlabel = new Interface.Label({
  bounds:[.6, .75, .2, .5],
  value:"",
});
var r = new Interface.Knob({ 
  bounds:[.85,.05,.1],
  value:.25,
  usesRotation:false,
  centerZero: false,
  oninit: function () { this.onvaluechange() },
  onvaluechange: function () { 
    rlabel.setValue('Release: ' + scaleAndSend('rel', this.value, 1000) + 'ms');
  }
});
var rlabel = new Interface.Label({
  bounds:[.8, .75, .2, .5],
  value:"",
});

adsr.add(a, alabel, d, dlabel, s, slabel, slen, slenlabel, r, rlabel);

function scaleAndSend(type, val, max) {
  var toMs = logScale(val, max);
  return sendEnvelopeData(type, toMs);
}

function sendEnvelopeData(type, val) {
  socket.emit('env', {type: type, val: val});
  return val;
}

function logScale(num, max) {
  // Scales from 0 to 1 to 0 to max logarithmically
  var maxv = Math.log(max);

  return Math.round(Math.exp(maxv*num));
}

function roundTwoDecimalPlaces(val) {
  return Math.round(val * 100) / 100;
}


$(window).resize(function () {
  octavebuttons.redoBoundaries();
  octavebuttons.refresh();
  sequencer.redoBoundaries();
  sequencer.refresh();
  adsr.redoBoundaries();
  adsr.refresh();
});