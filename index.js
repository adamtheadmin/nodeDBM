/*//=== 
	(C) 2015
*///===

var express = require('express'),
	fs = require('fs'),
	mysql = require('mysql'),
	jade = require('jade'),
	cookies = require('cookies')
	$sessions = {},
	md5 = function($str){
		var cpto = require('crypto').createHash('md5')
		cpto.update($str);
		return cpto.digest('hex');
	}

process.on('uncaughtException', function (err) {
    console.log( "UNCAUGHT EXCEPTION " );
    console.log( "[Inside 'uncaughtException' event] " + err.stack || err.message );
});



config = JSON.parse(fs.readFileSync('config.json'));
app = express();

//static
app.use(express.static(__dirname + '/static'));

//sessions
app.use(function(req, res, next){
	req.cookies = cookies(req, res);

	var $id = req.cookies.get('track');

	if(!$id || !($id in $sessions)){
		do var $sessionID = md5(Math.round(Math.random()*100000).toString() + 'mySQL-DBA' + (Math.random()*100000).toString());
		while($sessionID in $sessions);
		$sessions[$sessionID] = {};
		req.cookies.set('track', $sessionID);
		req.session = $sessions[$sessionID];
		req.sessionID = $sessionID;
	} else {
		req.session = $sessions[$id];
		req.sessionID = $id;
	}

	req.endSession = (function(sessionID){
		return function(){
			if(sessionID in $sessions)
				delete $sessions[sessionID];
		}
	})(req.sessionID)

	if(!('connections' in req.session))
		req.session.connections = [];

	next();
})

app.get('/', function(req, res){
	var fn = jade.compileFile(__dirname + '/views/index.jade')
	res.end(fn());
})

app.listen(config.port);


//include API
require(__dirname + '/api');