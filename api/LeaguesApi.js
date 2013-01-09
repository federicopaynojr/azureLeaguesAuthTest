var application_root = __dirname,
express = require("express"),
path = require("path"),
mongoose = require('mongoose');

var app = express();
// global checking
// var loggedUser = {};

// connect to database
mongoose.connect('mongodb://localhost/leaguesDB');

// User Model
var User = mongoose.model('user', new mongoose.Schema({
	email: String,
	password: String
	/* ToDo: Add the following
		First Name
		Last Name
		Born
		Sex
	*/
	
}));

var Game = mongoose.model('games', new mongoose.Schema({
	TournamentID: Number,
	Team1Name: String,
	Team2Name: String,
	Date: Date,
	ArenaID: Number,
	Result: String,
	Winner: Number,
	WinnerPoints: Number,
	LooserPoints: Number
}));

// All Games are registered here
var Tournament = mongoose.model('tournament', new mongoose.Schema({
	URLName: String,
	Name: String,
	LeagueID: Number,
	SportID: Number,
	ArenaTypeID: Number,
	Active: Boolean,
	RequireApproval: Boolean,
	AllowTeams: Boolean,
	AllowIndividuals: Boolean,
	Players: Number,
	Substitutes: Number,
	SexID: Number,
	PointsAlgorithm: String,
	StartPoints: Number
}));

// League List Model
var League = mongoose.model('league', new mongoose.Schema({
	ID: Number,
	Name: String,
	Logo: String
}));

// All invited users to participate in a game are registered here
var GameParticipants = mongoose.model('game_participants', new mongoose.Schema({
	UserName: String, // user email
	GameID: Number,
	Status: String, // accepted/rejected/pending
	GameName: String,
	GameHost: String
}));

app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(application_root, "../public")));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get('/', function(req, res){
  res.send('Hello World');
});
/********
All Get
********/
// get list of Active Leagues
app.get('/api/leagues/:id', function(req, res){
	console.log('----------------------------------------');
	console.log('         Getting List of Leagues');
	// console.log('User Name: ' + loggedUser.name);
	console.log('id: ' + req.params.id);
	return League.find({ID: req.params.id}, function(err, leagues) {
		console.log('Logged user ID' + req.params.id);
		if (!err) {
			// check if returned array is not empty
			if (leagues.length > 0) {
				console.log('-----------------------------------------');
				console.log('          List of Leagues');
				// console.log(leagues);
				console.log('-----------------------------------------');
				// console.log(user.password);
				console.log(leagues);
				console.log('----------------------------------------');
				console.log('    ');
				return res.send(leagues);
			} else {
				console.log('Cannot find user in the database');
				console.log('----------------------------------------');
				console.log('    ');
			}
		}
	});
});
// Get all game invitaions for the logged in user
app.get('/api/leagues/tournaments/games/:UserName/invitation.json', function(req, res) {
	console.log('Show game invites request recieved.');
	console.log('         Getting list of Games');
	console.log('id: ' + req.params.UserName);
	return GameParticipants.find({UserName: req.params.UserName}, function(err, games) {
		if (!err) {
			if (games.length > 0) {
				console.log('-------------------------------------------');
				console.log('               List of Games');
				console.log('-------------------------------------------');
				console.log(games);
				console.log('-------------------------------------------');
				console.log(' ');
				return res.send(games);
			} else {
				console.log('No game invitations found in the database');
				console.log('-------------------------------------------');
				console.log('  ');
				res.send('No game invitations found in the database');
			}
		}
	});
});
// Get all coming and historic games
app.get('/api/leagues/tournaments/games/:lid/all.json', function(req, res) {
	console.log('         Getting list of All Tournament Games ');
	console.log('id: ' + req.params.lid);
	return Tournament.find({LeagueID: req.params.lid}, function(err, allGames) {
		if (!err) {
			if (allGames.length > 0) {
				console.log('-------------------------------------------');
				console.log('      List of all Tournament Games');
				console.log('-------------------------------------------');
				console.log(allGames);
				console.log('-------------------------------------------');
				console.log(' ');
				return res.send(allGames);
			} else {
				console.log('No game invitations found in the database');
				console.log('-------------------------------------------');
				console.log('  ');
				res.send('No game invitations found in the database');
			}
		}
	});
});
// Get game details
app.get('/api/leagues/tournaments/games/:id/gamedetails.json', function(req, res, next) {
	console.log('          Getting game details');
	console.log('_id: ' + req.params.id);
	return Tournament.find({_id: req.params.id}, function(err, gameDetails) {
		if (!err) {
			if (gameDetails.length > 0) {
				console.log('---------------------------------------------');
				console.log('                   Game details');
				console.log('gameDetails');
				console.log('---------------------------------------------');
				console.log(' ');
				console.log(gameDetails);
				return res.send(gameDetails);
			}
		} else {
			console.log('Cannot find game in the database');
			console.log('-----------------------------------------------');
			console.log(' ');
			next(err);
		}
	})
});
/********
All POST's
********/
// Login
// handle post. Triggered by League.create
app.post('/api/leagues/login.json', function(req, res, next) {
	return User.find({email: req.body.email,password: req.body.password}, function(err, user) {
		if (!err) {
			// check if returned array is not empty
			if (user.length > 0) {
				console.log('----------------------------------------');
				console.log('              USER DETAILS');
				console.log(req.body.email);
				console.log(req.body.password);
				console.log(user);
				console.log('----------------------------------------');
				console.log('   ');
				// global checking
				/* if (req.body.email == 'federico@sprintforce.com') {
					loggedUser = {id: 1, name: 'test'};
				} else {
					loggedUser = {id: 2, name: 'test'};
				} */
				return res.send(user);
			} else {
				console.log('----------------------------------------');
				console.log('             USER NOT FOUND');
				console.log('----------------------------------------');
				console.log('   ');
				next(err);
			}
		}
	});
});
// Create Game
app.post('/api/leagues/tournaments/games.json', function(req, res) {
	var tournament;
	tournament = new Tournament({
		Name: req.body.Name,
		LeagueID: '2',
		Active: 'true',
		Players: '5',
	});
	tournament.save(function(err) {
		if (!err) {
			console.log('Game Created');
			console.log(req.body.Name);
		}
	});
	res.send(tournament);
});
// save invited players
app.post('/api/leagues/tournaments/inviteplayers.json', function(req, res) {
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
app.put('/api/leagues/tournaments/games/:UserName/invitation.json/:id', function(req, res) {
	console.log('Initializing update...');
	return GameParticipants.findById(req.params.id, function(err, game) {
		game.UserName = req.body.UserName;
		game.GameID = req.body.GameID;
		game.Status = req.body.Status;
		game.GameName = req.body.GameName;
		game.GameHost = req.body.GameHost;
		return game.save(function(err) {
			if (!err) {
				console.log('Updating status to ' + req.body.Status);
				console.log('successfully updated status');
			}
			return res.send(game);
		});
	});
});

app.put('/api/leagues/tournaments/:tid/games.json', function(req, res) {
	return Tournament.findById(req.params.id, function(err, tournament) {
	    tournament.Name = req.params.Name;
	    tournament.LeagueID = req.params.LeagueID;
	    tournament.SportID = req.params.SportID;
	    tournament.ArenaTypeID = req.params.ArenaTypeID;
	    tournament.Active = req.params.Active;
	    tournament.RequireApproval = req.params.RequireApproval;
	    tournament.AllowTeams = req.params.AllowTeams;
	    tournament.AllowIndividuals = req.params.AllowIndividuals;
	    tournament.Players = req.params.Players;
	    tournament.Substitutes = req.params.Substitutes;
	    tournament.SexID = req.params.SexID;
	    tournament.PointsAlgorithm = req.params.PointsAlgorithm;
	    tournament.StartPoints = req.params.StartPoints;
	    tournament.done = req.body.done;
	    tournament.order = req.body.order;
	    return tournament.save(function(err) {
	      if (!err) {
	        console.log("updated");
	      }
	      return res.send(tournament);
	    });
	});
});

app.delete('/api/leagues/:id', function(req, res){
  return User.findById(req.params.id, function(err, user) {
    return user.remove(function(err) {
      if (!err) {
        console.log("removed");
        return res.send('')
      }
    });
  });
});
//var socket = require('socket.io');
//var io = socket.listen(app);
/* io = require('socket.io').listen(app);
// creating a new websocket to keep the content updated without any AJAX request
io.sockets.on('connection', function(socket) {
 
  socket.on('User Name', function(userName) {
    // Save a variable 'userName'
    socket.set('userName', userName, function() {
      console.log('Connect', userName);
      var connected_msg = '<b>' + userName + ' is now connected.</b>';
 
      io.sockets.volatile.emit('broadcast_msg', connected_msg);
    });
  });
 
  socket.on('emit_msg', function (msg) {
    // Get the variable 'userName'
    socket.get('userName', function (err, userName) {
      console.log('Chat message by', userName);
      io.sockets.volatile.emit( 'broadcast_msg' , userName + ': ' + msg );
    });
  });
 
  // Handle disconnection of clients
  socket.on('disconnect', function () {
    socket.get('userName', function (err, userName) {
      console.log('Disconnect', userName);
      var disconnected_msg = '<b>' + userName + ' has disconnected.</b>'
 
      // Broadcast to all users the disconnection message
      io.sockets.volatile.emit( 'broadcast_msg' , disconnected_msg);
    });
  });
}); */

app.listen(3002);
console.log('\n   Leagues API \n   App Login 2 is now online \n   Listening at http://localhost:3002/\n   Home Page: http://localhost:3002/index.html\n');
