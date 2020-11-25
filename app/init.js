
const express = require('../node_modules/express');

module.exports = function(){
	var app = express();
	var cors = require('cors');
	app.use(cors())

	var logfilesExpress = require('./log_overview.js')(app);
	var verwalter = require('./log_view.js')(app); // TODO

	app.get('/', function (req, res) {
		res.send('Loggetta backend running!');
	});

	app.listen(3000, function () {
		console.log('Loggetta backend listening on port 3000!');
	});
}