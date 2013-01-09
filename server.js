var port = process.env.port || 8080;
var express = require('express'),
	passport = require('passport'),
	TwitterStrategy = require('passport-twitter').Strategy;

var users = [];

passport.use(new TwitterStrategy({
		consumerKey: 'twitter-app-consumer-key',
		consumerSecret: 'twitter-app-consumer-secret',
		callbackURL: 'http://test.passport-twitter.com:3000/auth/twitter/callback'
	},
	function(token, tokenSecret, profile, done) {
		var user = users[profile.id] ||
					(users[profile.id] = { id: profile.id, name: profile.username});
		done(null, user);
	}
));

application = express();

application.configure(function() {
	application.use(express.bodyParser());
	application.use(express.methodOverride());
	application.use(express.cookieParser());
	application.use(express.session({ secret: '498f993bbee4ae3a075eada02488464' }));
	application.use(passport.initialize());
	application.use(passport.session());
	application.use(application.router);
	application.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
	application.set('view engine', 'jade');
});

application.get('/auth/twitter', passport.authenticate('twitter'));

application.get('/auth/twitter/callback',
	passport.authenticate('twitter',
		{ successRedirect: '/',
		  failureRedirect: '/auth/twitter' }));
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deseriallizeUser(function(id, done) {
	var user = users[id];
	done(null, user);
});

application.listen(port);


/* // require('./api/LeaguesApi.js');
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
	console.log('test');
	// console.log('%s listening at %s', server.name, server.url);
	// console.log('net.Server.address() === ' + require('util').inspect(server.server.address()));
}); */