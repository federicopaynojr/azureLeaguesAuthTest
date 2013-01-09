// require('./api/LeaguesApi.js');
var port = process.env.port || 8080;
var express = require("express");
var server = express();

var crypto = require('crypto');


server.configure(function(){
	server.use(express.bodyParser());
	server.use(express.methodOverride());
	server.use(server.router);
	server.use(express.static("public"));
	server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

/* var port = process.env.port || 8080;
var restify = require('restify');
var server = restify.createServer(); */

var sql = require('node-sqlserver');
var conn_str = "Driver={SQL Server Native Client 10.0};Server=tcp:j7r7n29w15.database.windows.net,1433;Database=leaguesAU8HC419a;Uid=ss4zul3refge@j7r7n29w15;Pwd=le445u7eges2!;Encrypt=yes;Connection Timeout=30;";

// ToDo: remove this sample function
function processor(req, res, next) {
	// update game results
	if (req.params.tid == 1) {
		sql.query(conn_str, "UPDATE RESULT SET Points_Team_1 = '10101', Points_Team_2 = '8989' WHERE GameID = '1' AND Game_Set = '1'",function(err, results) {
			res.send('Successfully updated Game Results');
		});
	} // Invite game participants
	else if (req.params.tid == 2) {
		// res.writeHead(200, {'Content-Type': 'text/plain'});
		res.send('Successfully invited participants');
		//res.end();
	} else {
		// res.writeHead(200, {'Content-Type': 'text/plain'});
		res.send('Tournament ID not found');
		//res.end();
	}
}

/********
All Get
********/
// get list of Active Leagues
server.get('/api/leagues/:id', function(req, res){
	// ToDo: change the tp.Participant value to the ID of the logged in user
	sql.query(conn_str, "SELECT * FROM TOURNAMENT as t, TOURNAMENT_PARTICIPANT as tp where t.ID = tp.Tournament_ID AND tp.Participant_ID = 1", function(err, results) {
		if (results.length > 0) {
			res.send(results);
		} else {
			res.next(err);
		}
	});
});

// Get all game invitaions for the logged in user
server.get('/api/leagues/tournaments/games/:PID/invitation.json', function(req, res, next) {
	sql.query(conn_str, "SELECT * FROM GAME_PARTICIPANT WHERE Player_ID = '"+ req.params.PID +"'", function(err, results) {
		if (results.length > 0) {
			res.send(results);
		} else {
			res.next(err);
		}
	});
});
// Get all coming and historic games
server.get('/api/leagues/tournaments/games/:lid/all.json', function(req, res, next) {
	// ToDo: change the Tournament_ID to the ID of selected Tournament by the user
	sql.query(conn_str, "SELECT ID FROM GAME WHERE Tournament_ID = 1", function(err, results) {
		if (results.length > 0) {
			res.send(results);
		} else {
			res.next(err);
		}
	});
});
// Get game details
server.get('/api/leagues/tournaments/games/:id/gamedetails.json', function(req, res, next) {
	sql.query(conn_str, "SELECT * FROM GAME WHERE ID = '"+ req.params.id +"'", function(err, results) {
		if (results.length > 0) {
			res.send(results);
		} else {
			res.next(err);
		}
	});
});

server.get('/', function(req, res) {
	res.send('This page muste be redirected to index.html');
	console.log('test');
});

server.get('/league', function(req, res, next) {
	res.send('League Page');
});

/********
All POST's
********/
// Login
// handle post. Triggered by League.create
server.post('/api/leagues/login.json', function(req, res, next) {
	// res.send([{Email: 'asdf', Password: 'ffff'}]);
	password = crypto.createHash('md5').update(req.body.Password).digest("hex");
	sql.query(conn_str, "SELECT * FROM PARTICIPANT WHERE Email = '"+ req.body.Email +"' and Password = '"+ password + "'", function(err, results) {
		if (results.length > 0) {
			res.send(results);
			// res.send('test---aaa');
		} else {
			res.next(err);
		}
	});
});
// Create Game
server.post('/api/leagues/tournaments/games.json', function(req, res, next) {
	sql.query(conn_str, "INSERT INTO GAME (Tournament_id, Team_1_Name, Team_2_Name) VALUES ('"+ req.body.tid +"','"+ req.body.t1n +"','"+ req.body.t2n +"');", function(err, results) {
		if (results.length > 0) {
			res.send(results);
		} else {
			res.next(err);
		}
	});
});
// save invited players
server.post('/api/leagues/tournaments/inviteplayers.json', function(req, res, next) {
	// get the the ID of the invited user
	sql.query(conn_str, "SELECT ID FROM PARTICIPANT WHERE Email = '"+ req.body.email +"'", function(err, results) {
		if (results.length > 0) {
			// insert the ID
			sql.query(conn_str, "INSERT INTO GAME_PARTICIPANT (Player_ID, Game_ID, Team, Confirmed, Role_ID) VALUES ('"+ results[0].ID +"','"+ req.body.gid +"','"+ req.body.team +"','pending','"+req.body.rid+"');", function(err2, results2) {
				if (results2.length > 0) {
					res.send(results2);
				} else {
					res.next(err2);
				}
			});
		} // if user does not exist, insert the user as new user to PARTICIPANT table then insert its ID into GAME_PARTICIPANT table
		else {
			// res.next(err);
		}
	});
	var player;
	player = new GameParticipants({
		UserName: req.body.UserName,
		GameID: req.body.GameID,
		Status: req.body.Status,
	});
	player.save(function(err) {
		if (!err) {
			console.log('Invitation Started');
			console.log(req.body.UserName);
			console.log(req.body.GameID);
			console.log(req.body.Status);
			console.log('Invitations Ended');
		}
	});
	res.send(player);
});
/*******
All Updates
*******/
// Update Game Participants
// if a user click on a accept/reject button, the model will be updated for the game on that button
server.put('/api/leagues/tournaments/games/:PID/invitation.json/:id', function(req, res, next) {
	sql.query(conn_str, "UPDATE GAME_PARTICIPANT SET Confirmed = '"+ req.body.Confirmed +"' WHERE ID = '"+ req.params.id +"'", function(err, results) {
		res.send('Successfully updated invitation status.');
		/* if (results.length > 0) {
			res.send(results);
		} else {
			res.next(err);
		} */
	});
});

server.get('/league/api/v1/tournaments/:tid/games/:gameid', processor);
server.get('/league/api/v1/tournaments/:tn/games/:game/participants/:pid', processor);
server.listen(port, function() {
	console.log(port);
	// console.log('%s listening at %s', server.name, server.url);
	// console.log('net.Server.address() === ' + require('util').inspect(server.server.address()));
});