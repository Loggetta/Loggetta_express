var fs = require('fs');
const lineByLine = require('n-readlines');

module.exports = function(app) {

	/**
	 * Load a list of the logfiles
	 */
	app.get('/logfiles', function(req, res) {
		var file = '../savedata/logfiles.json';

		if(!fs.existsSync(file)) {
			console.log("File not found");
			return;
		}
		let rawdata = fs.readFileSync(file);
		let student = JSON.parse(rawdata); // FIXME rename
		
		res.json(student);
		res.end();
	});


/** 
 * Load the first line of a local log
*/
app.get('/localLogFirstLine', function(req, res) {
	console.log(req.query.path)
	let path = req.query.path;
	console.log(">" + path)
	//let fl = readFirstLineOfFile(path);
	const liner = new lineByLine(path);

	res.send(liner.next());
	res.end();
});



// log adder
/**
 * see 
 * https://stackoverflow.com/questions/28747719/what-is-the-most-efficient-way-to-read-only-the-first-line-of-a-file-in-node-js
 * @param {*} path 
 */
function readFirstLineOfFile(path) {
  console.log("fn path: " + path);
  var file = path;
var line_no = 1;
//  function(file, line_no, cb){
    var stream = fs.createReadStream(file, {
        flags: 'r',
        encoding: 'utf-8',
        fd: null,
        mode: '0666',
        bufferSize: 64 * 1024
    });
     
    var fileData = '';
    stream.on('data', function(data){
        fileData += data;
     
        var lines = fileData.split('\n');
     
        if(lines.length >= +line_no){
            stream.destroy();
            cb(null, lines[+line_no]);
        }
        // Add this else condition to remove all unnecesary data from the variable
        else
            fileData = Array(lines.length).join('\n');
     
    });
     
    stream.on('error', function(){
        cb('Error', null);
    });
     
    stream.on('end', function(){
        cb('File end reached without finding line', null);
    });
//};

}

/**
 * TODO
 * @param req.query.path: path to the logfile
 * @returns
 */
app.get('/addLocalLogfile', function(req, res) {
	console.log("add a local logfile")
	let name = req.query.name;
	let location = req.query.location;
	let regex = req.query.regex;
	let simpleDateFormat = req.query.simpleDateFormat;
	let loglevelList=  req.query.loglevelList;


	var file = '../savedata/logfiles.json';
	let student = [];
	
	if(!fs.existsSync(file)) {
		console.log("File not found, create it");
		fs.mkdir('../savedata', (err) => {
			if (err) throw err;
		});
		console.log("folder created")
		fs.closeSync(fs.openSync(file, 'w'));
		console.log("file created")
		//return;
	} else {
		let rawdata = fs.readFileSync(file);
		student = JSON.parse(rawdata); // FIXME rename
	}


	let newlogdata = {
		id: getID(),
		name: name,
		path: location,
		regex:regex,
		simpleDateFormat:simpleDateFormat,
		isLocal: true,
		server: '',
		loglevelList:loglevelList
	}

	student.push(newlogdata);
	fs.writeFile(file, JSON.stringify(student), function (err) {
		if (err) return console.log(err);
		console.log('Hello World > helloworld.txt');
	});

	res.json(student);
	res.end();
});


// https://gist.github.com/gordonbrander/2230317
function getID() {
	return Math.random().toString(36).substr(2, 9);
};


// server

/*
let data = JSON.stringify(student);
fs.writeFileSync('student-2.json', data);
*/
app.get('/saveServer', function(req, res) {
	console.log("saveServer");
	const server = {
		"name":	req.query.name,
		"host": req.query.host,
		"user":req.query.user,
		"port":req.query.port,
		"ppkPath":	req.query.ppkPath
	}
	
	let rawdata = fs.readFileSync('./server.json');
	let savedServer = JSON.parse(rawdata);
	savedServer.push(server);
	let data = JSON.stringify(savedServer);

	fs.writeFileSync('server.json', data);
	res.json(savedServer);
	res.end();
});

/**
 * Get Server
 */
app.get('/getServer', function(req, res) {
  //let rawdata = fs.readFileSync('./server.json'); // TODO fixme
  let rawdata = [];
  let server = JSON.parse(rawdata);
  res.json(server);
  res.end();
});

/**
 * Test connection
 */
app.get('/testConnection', function(req, res) {
	// TODO

  });


}
