const Max = require('max-api');
const express = require('express');
const path = require('path');
const bodyParser = require('bodyParser');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(express.static(/*TODO*/));

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


// This will be printed directly to the Max console
Max.post(`Loaded the ${path.basename(__filename)} script`);

// Use the 'addHandler' function to register a function for a particular message
Max.addHandler('bang', () => {
	Max.post("Who you think you bangin'?");
});

// Use the 'outlet' function to send messages out of node.script's outlet
Max.addHandler('echo', (msg) => {
	Max.outlet(msg);
});

app.listen(port, () => {
	console.log('ready');
});