// require('./api/LeaguesApi.js');
var port = process.env.port || 8080;
var express = require("express");
var server = express();

server.configure(function(){
	server.use(express.bodyParser());
	server.use(express.methodOverride());
	server.use(server.router);
	server.use(express.static("public"));
	server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

server.listen(port, function() {
	console.log(port);
	// console.log('%s listening at %s', server.name, server.url);
	// console.log('net.Server.address() === ' + require('util').inspect(server.server.address()));
});