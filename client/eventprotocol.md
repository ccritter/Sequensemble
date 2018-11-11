An id is a positive int representing the sequencer voice.
['newuser', id] -> either create or unmute that poly voice
['userleft', id] -> mute that poly voice to be utilized by a future user
['note', [id, x, y, val]] -> the value of the note at the given matrix position.
['vel', [id, col, val]] -> Velocity of all notes in given column. Value is a float 0 to 1, to be scaled to 0 to 127. 0 is off.
['env', ADSR]
An ADSR is: TODO Define ranges
- [id, 'atk', int] -> attack in ms
- [id, 'dec', int] -> decay in ms
- [id, 'sus', float] -> float from 0 to 1 representing percent of peak
- [id, 'suslen', int] -> length of sustain section in ms
- [id, 'rel', int] -> release in ms