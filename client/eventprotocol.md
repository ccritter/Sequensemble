An id is a positive int representing the sequencer voice.
['newuser', id] -> either create or unmute that poly voice
['userleft', id] -> mute that poly voice to be utilized by a future user
['note', [id, x, y, val]] -> the value of the note at the given matrix position.
['vel', [id, col, val]] -> Velocity of all notes in given column. Value is a float 0 to 1, to be scaled to 0 to 127. 0 is off.
['oct', id, val]
['env', ADSR]
An ADSR is:
- [id, 'atk', int] -> attack in ms
- [id, 'dec', int] -> decay in ms
- [id, 'sus', float] -> float from 0 to 1 representing percent of peak
- [id, 'suslen', int] -> length of sustain section in ms
- [id, 'rel', int] -> release in ms
['ins', [id, instype, params]]
['ins', [id, 'inschange', int]]

An instype, param is:
- 'osc' : [int]
  - 1 -> Sine
  - 2 -> Saw
  - 3 -> Square
- 'am' : [int, int, float]
  - see 'osc'
  - mod rate -> 20 to 1000
  - mod depth -> 0 to 0.5
- 'fm' -> Frequency Modulation of Sines
- 'grain' -> Async Granular Synthesis
- 'sub' -> Subtractive Synthesis of Saw?
- 'pluck' -> Plucked string physical model that we did that one time?
- 'drum'