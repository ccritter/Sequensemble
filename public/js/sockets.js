var socket = io('/participants');
socket.on('full', () => alert('Server is full.'));

//////////////////////////////
////    OCTAVE BUTTONS    ////
//////////////////////////////
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
  value:'Octave: ' + octave
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

octavebuttons.add(downOctave, octaveLabel, upOctave);

//////////////////////////////
////      SEQUENCER       ////
//////////////////////////////

var sequencer = new Interface.Panel({ container:("#sequencer") });

var sequencerButtons = new Interface.MultiButton({
  rows:13, columns:16,
  bounds:[0,0,.999,.75],
  onvaluechange : function(row, col, value) {
    socket.emit('note', {x: col, y: row, val: value});
  },
});

var velocities = new Interface.MultiSlider({ 
  count:16,
  bounds:[0,.75,.999,.249],
  onvaluechange : function(number, value) {
    socket.emit('vel', {col: number, val: value});
  }
});

sequencer.add(sequencerButtons, velocities);

//////////////////////////////
////   INSTRUMENT PANEL   ////
//////////////////////////////
var curInst;

var instruments = new Interface.Panel({ container:("#instruments") });

var instrumentSelector = new Interface.Menu({ 
  bounds:[.25,0,.5,1],
  options:['Single Oscillator','AM','FM','Subtractive', 'Plucked String', 'Drums'],
  oninit: function () { this.value = this.options[0]; this.onvaluechange(); },
  onvaluechange: function() { 
    setInstrument(this.options.indexOf(this.value) + 1);
  }
});

function setInstrument(idx) {
  socket.emit('ins', {type:'inschange', vals:[idx]});
  $('#instrumentsettings').children().hide()
  instList = [null, 'osc','am','fm','sub','pluck','drum'];
  curInst = instList[idx];
  
  switch (curInst) {
    case 'osc':
      $('#oscsettings').show();
      break;
    case 'am':
      $('#amsettings').show();
      break;
    case 'fm':
      $('#fmsettings').show();
      break;
    case 'sub':
      $('#subsettings').show();
      break;
    case 'pluck':
      $('#plucksettings').show();
      break;
    case 'drum':
      break;
  }
}

// Single Oscillator
var oscPanel = new Interface.Panel({ container:('#oscsettings') });

var oscMenu = new Interface.Menu({
  bounds:[.25, .35, .5, .25],
  options: ['Sine','Triangle','Saw','Square'],
  oninit: function () { this.value = this.options[0]; this.onvaluechange(); },
  onvaluechange: function() { 
    socket.emit('ins', {type:'osc', vals:[this.options.indexOf(this.value) + 1]});
  }
});

oscPanel.add(oscMenu);
$('#oscsettings').hide();


// Amplitude Modulation
var amData = [null, null, null];
var amPanel = new Interface.Panel({ container:('#amsettings') });

var amCarrier = new Interface.Menu({
  bounds:[.05, .35, .5, .25],
  options: ['Sine','Triangle','Saw','Square'],
  oninit: function () { this.value = this.options[0]; this.onvaluechange(); },
  onvaluechange: function() { 
    amData[0] = this.options.indexOf(this.value) + 1;
    sendAM();
  }
});

var amModRate = new Interface.Knob({
  // 0 to 1000 logarithmic
  bounds:[.65,.05,.1],
  value:.25,
  usesRotation:false,
  centerZero: false,
  oninit: function () { this.onvaluechange() },
  onvaluechange: function () {
    amData[1] = logScale(this.value, 1000);
    amModRateLabel.setValue('Mod Rate: ' + amData[1] + 'Hz');
    sendAM();
  }
});

var amModRateLabel = new Interface.Label({
  bounds:[.6, .75, .2, .5],
  value:"",
});

var amModDepth = new Interface.Knob({
  // 0 to 1
  bounds:[.85,.05,.1],
  value:.75,
  usesRotation:false,
  centerZero: false,
  oninit: function () { this.onvaluechange() },
  onvaluechange: function () {
    amData[2] = roundTwoDecimalPlaces(this.value);
    amModDepthLabel.setValue('Mod Depth: ' + amData[2]);
    sendAM();
  }
});

var amModDepthLabel = new Interface.Label({
  bounds:[.8, .75, .2, .5],
  value:"",
});

function sendAM() {
  socket.emit('ins', {type:'am', vals:amData});
}

amPanel.add(amCarrier, amModRate, amModRateLabel, amModDepth, amModDepthLabel);
$('#amsettings').hide();



// Frequency Modulation
var fmData = [null, null];
var fmPanel = new Interface.Panel({ container:('#fmsettings') });

var fmRatio = new Interface.Knob({
  // 0 to 5
  bounds:[.25,.05,.1],
  value:.4,
  usesRotation:false,
  centerZero: false,
  oninit: function () { this.onvaluechange() },
  onvaluechange: function () {
    fmData[0] = roundTwoDecimalPlaces(this.value * 5);
    fmRatioLabel.setValue('Ratio: ' + fmData[0]);
    sendFM();
  }
});

var fmRatioLabel = new Interface.Label({
  bounds:[.2, .75, .2, .5],
  value:"",
});

var fmIndex = new Interface.Knob({
  // 0 to 10
  bounds:[.65,.05,.1],
  value:.75,
  usesRotation:false,
  centerZero: false,
  oninit: function () { this.onvaluechange() },
  onvaluechange: function () {
    fmData[1] = roundTwoDecimalPlaces(this.value * 10);
    fmIndexLabel.setValue('Index: ' + fmData[1]);
    sendFM();
  }
});

var fmIndexLabel = new Interface.Label({
  bounds:[.60, .75, .2, .5],
  value:"",
});

function sendFM() {
  socket.emit('ins', {type:'fm', vals:fmData});
}

fmPanel.add(fmRatio, fmRatioLabel, fmIndex, fmIndexLabel);
$('#fmsettings').hide();



// Subtractive
var subData = [null, null, null, null];
var subPanel = new Interface.Panel({ container:('#subsettings') });

var subOsc = new Interface.Menu({
  bounds:[.05, .05, .5, .25],
  options: ['Triangle','Saw','Square'],
  oninit: function () { this.value = this.options[0]; this.onvaluechange(); },
  onvaluechange: function() { 
    subData[0] = this.options.indexOf(this.value) + 1;
    sendSub();
  }
});

var subFilterType = new Interface.Menu({
  bounds:[.05, .55, .5, .25],
  options: ['Lowpass', 'Highpass', 'Bandpass', 'Bandstop', 'Peaknotch', 
            'Lowshelf', 'Highshelf', 'Resonant'],
  oninit: function () { this.value = this.options[0]; this.onvaluechange(); },
  onvaluechange: function() { 
    subData[1] = this.options.indexOf(this.value);
    sendSub();
  }
});

var subCenterFreq = new Interface.Knob({
  // 1.2 to 15
  bounds:[.65,.05,.1],
  value:.25,
  usesRotation:false,
  centerZero: false,
  oninit: function () { this.onvaluechange() },
  onvaluechange: function () {
    subData[2] = roundTwoDecimalPlaces(this.value * 13.8 + 1.2);
    subCenterFreqLabel.setValue('Center: ' + subData[2]);
    sendSub();
  }
});

var subCenterFreqLabel = new Interface.Label({
  bounds:[.6, .75, .2, .5],
  value:"",
});

var subQ = new Interface.Knob({
  // 1 to 5
  bounds:[.85,.05,.1],
  value:.75,
  usesRotation:false,
  centerZero: false,
  oninit: function () { this.onvaluechange() },
  onvaluechange: function () {
    subData[3] = roundTwoDecimalPlaces(this.value * 4 + 1);
    subQLabel.setValue('Q: ' + subData[3]);
    sendSub();
  }
});

var subQLabel = new Interface.Label({
  bounds:[.8, .75, .2, .5],
  value:"",
});

function sendSub() {
  socket.emit('ins', {type:'sub', vals:subData});
}

subPanel.add(subOsc, subFilterType, subCenterFreq, subCenterFreqLabel, subQ, subQLabel);
$('#subsettings').hide();


// Plucked String
var pluckPanel = new Interface.Panel({ container:('#plucksettings') });

var pluckMenu = new Interface.Menu({
  bounds:[.25, .35, .5, .25],
  options: ['White','Pink','Rand'],
  oninit: function () { this.value = this.options[0]; this.onvaluechange(); },
  onvaluechange: function() { 
    socket.emit('ins', {type:'pm', vals:[this.options.indexOf(this.value) + 1]});
  }
});

pluckPanel.add(pluckMenu);
$('#plucksettings').hide();



instruments.add(instrumentSelector)


//////////////////////////////
////    ADSR ENVELOPE     ////
//////////////////////////////

var adsr = new Interface.Panel({ container:("#adsr") });

var a = new Interface.Knob({ 
  bounds:[.05,.05,.1],
  value:.25,
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
  // Scales from 0 to 1 -> 0 to max logarithmically
  var maxv = Math.log(max);

  return Math.round(Math.exp(maxv*num));
}

function roundTwoDecimalPlaces(val) {
  return Math.round(val * 100) / 100;
}


//////////////////////////////
////       HELPERS        ////
//////////////////////////////

$(window).resize(function () {
  octavebuttons.redoBoundaries();
  sequencer.redoBoundaries();
  instruments.redoBoundaries();
  oscPanel.redoBoundaries();
  amPanel.redoBoundaries();
  fmPanel.redoBoundaries();
  subPanel.redoBoundaries();
  pluckPanel.redoBoundaries();
  adsr.redoBoundaries();
});