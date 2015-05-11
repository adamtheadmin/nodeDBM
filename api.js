/*//===
	API
*///===

var fs = require("fs"),
	express = require("express"),
	qs = require("querystring"),
	mysql = require("mysql"),
	tokens = {}


var inArray = function(n, h){
	var f = false;
	for(var x in h)
		if(h[x] == n)
			f = true;
	return f;
}

var md5 = function($str){
	var cpto = require('crypto').createHash('md5')
	cpto.update($str);
	return cpto.digest('hex');
}

app.get("/Login/*", function(req, res, next){
	var $token = req.url.split('/').pop();
	if(!($token in tokens)){
		next();
		return;
	}
	tokens[$token].name = 'Local Database';
	req.session.connections.push(tokens[$token]);
	res.redirect('/');
});

app.post("/API*", function(req, res) {
	var $data = req.url.split("/").splice(2, 10),
	    $method = $data.shift().toLowerCase(),
	    $postdata = "",
	    $session = req.session

    req.on('data', function(bit){
    	$postdata += bit;
    });

    req.on('end', function(){
    	try{
    		var $post = JSON.parse($postdata);
		    switch($method){
		    	default:
		    		throw new Error("No Method Selected.");
		    	break;

		    	case "createtoken":
		    		try{
		    			if(!('db' in $post))
		    				throw new Error("DB not found in post");

		    			if(typeof $post.db != 'object')
		    				throw new Error("DB Not Object");

			    		do var $token = md5(Math.random() * Math.random() + 'nodeDBMTokenFGT');
			    		while($token in tokens)

			    		tokens[$token] = $post.db;

			    		res.json({
			    			status : true,
			    			token : $token
			    		})
		    		} catch($e){
		    			res.json({
		    				status : false,
		    				reason : $e.message
		    			})
		    		}
		    	break;

		    	case "connect":
		    		if(!('db' in $post) || typeof $post.db != 'object')
		    			throw new Error("Bad db Object");

		    		if($post.name == "")
		    			throw new Error("Bad Connection Name");

		    		var $con = mysql.createConnection($post.db)

		    		$con.connect(function(err){
		    			if(err){
		    				res.json({
		    					status : false,
		    					reason : err.code
		    				})
		    				return;
		    			}
		    			$session.connections.push($post.db)

		    			res.json({
		    				status : true
		    			})

		    			$con.destroy();
		    		})

		    	break;

		    	case "query":
		    		var $connection = parseInt($post.connection);

		    		if(isNaN($connection) || !($connection in $session.connections))
		    			throw new Error("Bad Connection ID");

		    		if($post.sql == "")
		    			throw new Error("Bad SQL");

		    		var $con = mysql.createConnection($session.connections[$connection]);

		    		$con.connect(function(err){
		    			if(err){
		    				res.json({
		    					status : false,
		    					reason : err.code
		    				})
		    				return;
		    			}

		    			var queries = $post.sql.split(';');

		    			for(var x in queries)
		    				if(queries[x] != '')
		    					var $query = $con.query(queries[x]);

		    			$query.on('result', function(row){
		    				res.write(JSON.stringify(row) + "\r\n");
		    				if(config.slow){
			    				$con.pause();
			    				setTimeout(function(){
			    					$con.resume();
			    				}, 500)
		    				}
		    			})

		    			$query.on('error', function(err){
		    				res.json(err);
		    			})

		    			$query.on('end', function(){
		    				res.end();
		    				$con.destroy();
		    			})
		    			
		    		})



		    	break;

		    	case "update":
		    		if('selected' in $post)
		    			$session.selected = $post.selected;

		    		if('database' in $post)
		    			$session.database = $post.database;

		    		if('tab' in $post)
		    			$session.tab = $post.tab;

		    		if('tabs' in $post)
		    			$session.tabs = $post.tabs;

		    		var o = {
		    			status : true,
		    			connections : $session.connections
		    		};

		    		if('selected' in $session)
		    			o.selected = $session.selected

		    		if('database' in $session)
		    			o.database = $session.database

		    		if('tab' in $session)
		    			o.tab = $session.tab

		    		if('tabs' in $session)
		    			o.tabs = $session.tabs

		    		res.json(o)
		    	break;

		    	case "terminate":
		    		req.endSession();
		    		res.json({
		    			status : true
		    		})
		    	break;
		    }
    	} catch($e){
    		res.json({
		    	status : false,
		    	reason : $e.message
		    })
    	}
    })

});