var express = require('express');
var app = express();
var fs = require('fs');
const lineByLine = require('n-readlines');

// TODO in save file
var loglevelList = {
	DEBUG : {background:"#fff",color:"#000", active:true},
	ERROR  : {background:"#ffc7ce",color:"#9c0006", active:true},
	FATAL  : {background:"#ffc7ce",color:"#9c0006", active:true},
	INFO  : {background:"#fff",color:"#fa7d00", active:true},
	TRACE : { background:"#fff",color:"#000", active:true},
	WARN : {background:"#ffeb9c",color:"#9c6500", active:true}
};

module.exports = function(app) {

/**
 * Checks the groups of a logline depending on the regex
 * @param {*} line the line of the log
 * @param {*} regex the regex
 * @returns array of groups of the logline
 */
function checkGroups(line, regex) {
	const string = line;
	const regexp = regex;
	const groups = [];

	var entry = [];
	const matches = string.matchAll(regexp);    
	for (const match of matches) {		
		for(var i = 1; i < match.length; i++) {
			entry.push(match[i])
		}
	}
	return entry;
}

var liner;
var lineLimit = 20000; // Init value
let tmpCounter = 0; // Init value

app.get('/init', function (req, res) {
	let id = req.query.id;
	console.log("try to open log with id " + id);
	let savefiledata = getSaveFileContent();
	let filePath = getFilePathByID(id, savefiledata);
	console.log("path to log file: " + filePath)
	liner = new lineByLine(filePath);

	countLines(res, filePath); // continue in sub method
});


app.get('/getlog', function (req, res) {
	var sponse = [];
	let id = req.query.id;
	let reset = req.query.reset; // TODO implement reset
	let textFilter = req.query.textFilter;
	let levelFilter = JSON.parse(req.query.appLevelFilter);
	let savefiledata = getSaveFileContent();
	console.log("--- get log" + id)
	let regex = getRegexByID(id, savefiledata);

	// TODO
	let logLevelFilter = {};
	for(var i = 0; i < levelFilter.length; i++) {
		logLevelFilter[levelFilter[i].logLevel] = {
			color: levelFilter[i].color,
			background: levelFilter[i].background,
			active: levelFilter[i].active
		}
	}
	
	console.log("-- loglevelFilter --");
	console.log(logLevelFilter);
	console.log("---");

	tmpCounter = 0;
	lineLimit = 20000;
	while(tmpCounter < lineLimit) {
		let line = liner.next();
		tmpCounter++;
		if(line === false) {
			console.log("end reached!");
			break;
		}
		var ret = checkGroups(line.toString('ascii'), regex);// TODO rename		
	
		if(ret === undefined) {
			console.log("can not handle the following line:")
			console.log(line);
			continue;
		}
		let logLineObj = {
			level: {
				display:ret[0],
				backgroundColor:loglevelList[ret[0]].background,
				color:loglevelList[ret[0]].color
			},
			timestamp:ret[1],
			message:ret[2]
		}

		if(logLevelFilter[ret[0]].active) {
			sponse.push(logLineObj);
		}
	}
	lineLimit += 10000;
	res.json(sponse);
    res.end();
});

/**
 * Count files in logfile
 * @param {} res response object to send after counting is done
 * @param {*} filePath path to logfile
 */
function countLines(res, filePath) {
	var i;
	var count = 0;
	require('fs').createReadStream(filePath).on('data', function(chunk) {
		for (i=0; i < chunk.length; ++i) {
			if (chunk[i] == 10) {
				count++;
			}
		}
	}).on('end', function() {
		console.log("selected logfile has "+count+ " lines.");
		res.json(count);
		res.end();
	});
}

function getRegexByID(id, savefiledata) {
	let regex = "";
	for(var i = 0; i < savefiledata.length; i++) {
		if(savefiledata[i].id == id) {
			regex = savefiledata[i].regex;
		}
	}
	return regex;
}

function getFilePathByID(id, savefiledata) {
	let path = "";
	for(var i = 0; i < savefiledata.length; i++) {
		if(savefiledata[i].id === id) {
			path = savefiledata[i].path;
		}
	}
	return path;
}

function getSaveFileContent() {
	var file = '../savedata/logfiles.json';

	if(!fs.existsSync(file)) {
		console.log("File not found");
		return;
	}
	let rawdata = fs.readFileSync(file);
    let savefiledata = JSON.parse(rawdata); 
	return savefiledata;
}


} // close export



