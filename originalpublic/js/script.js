// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){
  checkCookie();
  
  /*******
  League model
  ********/
  window.League = Backbone.Model.extend({
    idAttribute: "_id",
  });
  
  // The collection of League
  // server, but now uses our /api/leagues backend for persistance.
  window.LeagueList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: League,

    url: function() {
      return '/api/leagues/'+this.id;
    }
  });

  // Global collection of League
  window.League = new LeagueList;

  
  /********
  Create Game/Show all Games Model
  *********/
  window.Tournament = Backbone.Model.extend({
    idAttribute: "_id",
  });
	
  window.TournamentList = Backbone.Collection.extend({
    model: Tournament,
    url: '/api/leagues/tournaments/games.json'
  });
  // Global collection of Games
  window.Tournament = new TournamentList;
  
  /********
  Game Participant Model  
  ********/
 window.GameParticipant = Backbone.Model.extend({
    idAttribute: "ID",
  });
  
  window.GameParticipantList = Backbone.Collection.extend({
    model: GameParticipant,
	//url: '/api/leagues/tournaments/'+this.id+'/gameparticipants.json'
	// url: '/api/leagues/tournaments/games/invitation.json'
	url: function() {
	  return '/api/leagues/tournaments/games/'+this.Player_ID+'/invitation.json';
	}
  });
  // Global collection of participant
  window.GameParticipant = new GameParticipantList;
  

  /********
  Coming and Historic games
  ********/
 window.AllGames = Backbone.Model.extend({
    idAttribute: "ID",
  });
  
  window.GameList = Backbone.Collection.extend({
    model: AllGames,
	//url: '/api/leagues/tournaments/'+this.id+'/gameparticipants.json'
	// url: '/api/leagues/tournaments/games/invitation.json'
	url: function() {
	  return '/api/leagues/tournaments/games/'+this.lid+'/all.json';
	}
  });
  // Global collection of participant
  window.AllGames = new GameList;
  
  /********
  Game Details
  *******/
  window.GameDetails = Backbone.Model.extend({
    idAttribute: "ID",
	url: function() {
	  return '/api/leagues/tournaments/games/'+this.ID+'/gamedetails.json';
	}
  });
  
  window.GameDetails = new GameDetails;
  
  /*******
  Invite Players
  ********/
  window.Player = Backbone.Model.extend({
    idAttribute: "ID",
  });
  
  window.PlayerList = Backbone.Collection.extend({
    model: Player,
	url: '/api/leagues/tournaments/inviteplayers.json'
  });
  
  // Global collection of player
  window.Player = new PlayerList;
  /********
  User model
  *********/
  window.User = Backbone.Model.extend({
    idAttribute: "ID",
  });
  window.UserList = Backbone.Collection.extend({
    model: User,
    url: '/api/leagues/login.json'
  });

  // Global Collection of user
  window.User = new UserList;

  /********
        Views
  ********/
  // The DOM element for a LeagueView item...
  window.LeagueView = Backbone.View.extend({
    //... is a list tag.
    tagName:  "tr",
    // Cache the template function for a single item.
    template: _.template($('#LeagueItem-template').html()),
    // The DOM events specific to an item.
    events: {},
    // The LeagueView listens for changes to its model, re-rendering.
    initialize: function() {
      this.model.bind('change', this.render, this);
	  // alert('league view init');
    },
    // Re-render the contents of the League item.
    render: function() {
	  $(this.el).html(this.template(this.model.toJSON()));
	  this.setTexts();
	  return this;
    },

    // To avoid XSS (not that it would be harmful in this particular app),
    // we use `jQuery.text` to set the contents of the item.
    // this will append text on the page.
    setTexts: function() {
	  var lid = this.model.get('ID');
	  var lname = this.model.get('Name');
	  var llogo = this.model.get('Logo');
	  var text = '' + lid + ' ' + lname + ' ' + llogo + ' ';
	  this.$('.league-text-lid').text(lid);
	  this.$('.league-text-lname').text(lname);
	  this.$('.league-text-llogo').text(llogo);
    }
  });
  // The DOM element for the GameView item.
  window.GameInvitationView = Backbone.View.extend({
	tagName: "li",
	// Cash the template function for a single item.
	template: _.template($('#GameItem-template').html()),
	// the DOM events specific to an item.
	events: {},
	// The GameView listens for changes to its model, re-rendering.
	initialize: function() {
	  this.model.bind('change', this.render, this);
	},
	render: function() {
	  $(this.el).html(this.template(this.model.toJSON()));
	  this.setTexts();
	  return this;
	},
	setTexts: function() {
	  // var gid = this.model.get('GameID');
	  // var guname = this.model.get('UserName');
	  var gid = this.model.get('Game_ID');
	  var team = this.model.get('Team');
	  var Status = this.model.get('Confirmed');
	  // don't show accept and reject buttons if request is not pending
	  if (Status == 'approved' || Status == 'rejected') {
		this.$('#AcceptGameInvitation').remove();
	    this.$('#RejectGameInvitation').remove();
	  }
	  var text = 'Game ID: ' + gid + ' Team: ' + team + ' Status: ' + Status;
	  this.$('.game-text').text(text);

	  this.inputAccept = this.$('#AcceptGameInvitation');
      this.inputAccept.bind('click', _.bind(this.approveInvitation, this)).val(text);
	  this.inputReject = this.$('#RejectGameInvitation');
	  this.inputReject.bind('click', _.bind(this.rejectInvitation, this)).val(text);
	},
	// approve invitation
	approveInvitation: function() {
	  this.model.save({Confirmed: 'approved'});
	  this.$('#AcceptGameInvitation').remove();
	  this.$('#RejectGameInvitation').remove();
	},
	rejectInvitation: function() {
	  this.model.save({Confirmed: 'rejected'});
	}
  });
  // The DOM element for the TournamentGamesView item - will show all Tournament games
  window.TournamentGamesView = Backbone.View.extend({
    tagName: "div",
	// Cashe the template function for a single item.
	template: _.template($('#AllGameItem-template').html()),
	// the DOM event specific to an item.
	events: {},
	// The TournamentGamesView listens for changes to its model, re-rendering.
	initialize: function() {
	  $(this.el).html(this.template(this.model.toJSON()));
	  // $(this.el).attr('class', 'btn btn-success btn-block allgames'); 
	  this.setTexts(this);
	  return this;
	},
	setTexts: function(parent) {
	  var text = this.model.get('ID');
	  // $(parent.el).attr('id', this.model.get('Players'));
	  // var tgLeagueID = this.model.get('LeagueID');
	  //var tgActive = this.model.get('Active');
	  // var tgPlayers= this.model.get('Players');

	  //var text = tgName + ' ' + tgLeagueID + ' ' + tgActive + ' ' + tgPlayers;
	  text2 = this.model.get('ID');
	  this.$('.allGames-text').text(text);
	  this.$('.aGid-text').text(text2);
	}
  });
  // The DOM element for the GameDetailsView item
  window.GameDetailsView = Backbone.View.extend({
    tagName: "div",
    // cache the template function for a single item
	template: _.template($('#GameDetailsItem-template').html()),
	// the DOM event specific to an item
	events: {},
	// The GameDetailsView listens for changes to its model, re-rendering
	initialize: function() {
	  $(this.el).html(this.template(this.model.toJSON()));
	  this.setTexts(this);
	  return this;
	},
	setTexts: function(){
	  var str = JSON.stringify(this.model, 2, null);
	  strLength = str.length-6;
	  str = str.substr(5,strLength);
	  text = JSON.parse(str);
	  alert('ID: ' + text.ID + 
		'\n Tournament ID: ' + text.Tournament_ID + 
		'\n Team 1 Name: ' + text.Team_1_Name + 
		'\n Team 2 Name: ' + text.Team_2_Name + 
		'\n Date: ' + text.Date + 
		'\n Time: ' + text.Time + 
		'\n Arena ID: ' + text.Arena_ID + 
		'\n Result: ' + text.Result + 
		'\n Winner: ' + text.Winner + 
		'\n Winner Points: ' + text.Winner_Points + 
		'\n Looser Points: ' + text.Looser_Points);
	}
  });

  // The Application
  // Overall **AppView** is the top-level piece of UI.
  window.AppView = Backbone.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#LeagueApp"),

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events
    events: {
	  "keypress #login-email": "loginByKeypress",
	  "keypress #login-password": "loginByKeypress",
	  "keypress #game-name": "createGameByKeypress",
	  "click #showLeagues": "showActiveLeages",
  	  "click #login": "login",
	  "click #logout": "logout",
	  "click #createGame": "createGame",
	  "click #invitePlayers": "invitePlayers",
	  "click #showGameInvitations": "showAllGameInvitations",
	  "click #showAllGames": "showAllGames",
	  "click .gameDetails": "showGameDetails",
	  "click #showCreateGameForm": "showCreateGame",
	  "click #showInvitePlayersForm": "showInvitePlayers"
    },

    // At initialization we bind to the relevant events on the `League`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting items that might be saved in *localStorage*.
    initialize: function() {
	  that = this;
	  // signup inputs
	  this.inputEmail 	= this.$("#login-email");
	  this.inputPassword 	= this.$("#login-password");
    },

    // Add a single item item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    showEachLeagueItem: function(item) {
	  var LeagueItemView = new LeagueView({model: item});
	  $("#main-list").append(LeagueItemView.render().el);
    },

    // Add all items in the Leagues collection at once.
    showActiveLeages: function() {
	  // reset the list(UL) before loading the new set
	  if (checkCookie()) {
	    // change to user id when the login auth is implemented
		window.League.id = '1';
		// window.League.fetch({success: function() { alert(model.toJSON) },error: function(e) {alert(e.toJSON)}});
		that = this;
		// make sure that collection will load before calling the method that displays the items
		window.League.fetch({
		  success: function(){
		    // alert('success'); 
		    $("table#main-list").text('');
			$("#league-form").text('');
			$(".main-content").css('display', 'block');
		    window.League.each(that.showEachLeagueItem);
		  },
		  error: function() {
		    alert('error getting list of Leagues');return false;
		  }
		})
	  }
    },
	// add single item to the list by creating a view for it, and
	// appending its element to the `<ul>`
	showEachGameInvitationItem: function(item) {
	  var GameInvitationItemView = new GameInvitationView({model: item});
	  $("#main-list").append(GameInvitationItemView.render().el);
	},
	// Add all items in the Game list collection at once
	showAllGameInvitations: function() {
	  if (checkCookie()) {
	    // ToDo: change to the ID of the logged in user
	    window.GameParticipant.Player_ID = "1"; // hardcoded for now while auth is not yet implemented
		that = this;
		window.GameParticipant.fetch({
		  success: function() {
		    $('.main-content').css('display', 'block');
	        $("#league-form").text('');
	        $("table#main-list").text('');
			test = window.GameParticipant;
		    window.GameParticipant.each(that.showEachGameInvitationItem);
		  },
		  error: function() {
		    alert('Error getting list of Game invitations');
		  }
	    })
	  }
	},
	// add single item to the list by creating a view for it, and
	// appending its element to the `<ul>`
	showEachGame: function(item) {
	  var AllGamesItemView = new TournamentGamesView({model: item});
	  $("#main-list").append(AllGamesItemView.render().el);
	},
	
	// Show all coming and historic games
	showAllGames: function() {
	  if (checkCookie()) {
	    window.AllGames.lid = "2"; // hardcoded for now while auth is not yet implemented
		that = this;
		window.AllGames.fetch({
		  success: function() {
			$(".main-content").css('display', 'block');
		    $("table#main-list").text('');
			$("#league-form").text('');
		    window.AllGames.each(that.showEachGame);
		  },
		  error: function() {
		    alert('Error getting list of Game invitations');
		  }
	    })
	  }
	},
	
	showGameDetailsView: function(item) {
	  //alert(JSON.stringify(item, 2, null));
	  var GameDetailsItemView = new GameDetailsView({model: item});
	  $("#Game-detals").append(GameDetailsItemView.el);
	},
	
	showGameDetails: function(e) {
	  id = $(e.target).siblings('.aGid-text').text();
	  window.GameDetails.ID = id;
	  that = this;
	  window.GameDetails.fetch({
	    success: function() {
		  // alert(JSON.stringify(window.GameDetails, 2, null));
		  that.showGameDetailsView(window.GameDetails);
		  // window.GameDetails(that.showGameDetails);
		},
		error: function() {
		  alert('error');
		}
	  })
	},
	
	// check if enter is pressed then
	// call checkUserBySubmit
	loginByKeypress: function(e) {
	  if (e.keyCode != 13) return;
	  this.login();
	},

	login: function(e) {
	  var email = this.inputEmail.val();
	  var password = this.inputPassword.val();
	  User.create({Email: email, Password: password}, {
	    success: function(e) {
		  alert('login successful');
		 this.$('#LeagueApp .content').hide('slow');
		  this.$('#mainPage').show('slow');
		  setCookie('email',email,1);
	    },
	    error: function(e) {
		  alert('Login Error :' + JSON.stringify(e, 2, null) + ' :');
	    }
	  });
	  this.inputEmail.val('');
	  this.inputPassword.val('');
	},

	showCreateGame: function() {
	  $('.main-content').css('display', 'block');
	  $('#league-form').css('display', 'block');
	  $("table#main-list").text('');
	  $('#league-form').html('<h4>Create Game</h4><form class="form-horizontal"><input type="text" id="tournamentID" class="input-large" placeholder="Tournament ID" /><input type="text" id="team1Name" class="input-large" placeholder="Team 1 Name" /><input type="text" id="team2Name" class="input-large" placeholder="Team 2 Name" /><button id="createGame" type="button" class="btn btn-success">Create Game</button></form>');
	},
	
	showInvitePlayers: function() {
	  $('.main-content').css('display', 'block');
	  $('#league-form').css('display', 'block');
	  $("table#main-list").text('');
	  $('#league-form').html('<h4>Invite Players</h4><form class="form-horizontal"><textarea id="invite-players" rows="3"></textarea><button id="invitePlayers" type="button" class="btn btn-success">Invite</button></form>');
	},
	
	createGameByKeypress: function (e) {
	  if (e.keyCode != 13) return;
	  this.createGame();
	},
	
	createGame: function() {
	  var tid = $('#tournamentID').val();
	  var t1n = $('#team1Name').val();
	  var t2n = $('#team2Name').val();
	  if ($.trim(tid) != '') {
	    Tournament.create({tid: tid, t1n: t1n, t2n: t2n}), {
	      success: function(a,b) {
		    alert('Game Created Successfully!');
		  },
		  error: function(a,b) {
		    alert('Error Creating Game!');
		  }
	    }
	  } else {
	    alert('Game Name is empty!');
	  }
	},

	invitePlayers: function() {
	  invitedPlayers = $('#invite-players').val();
	  alert(invitedPlayers);
	  invitedPlayers = invitedPlayers.replace(/[\r\n]+/,'');
	  alert(invitedPlayers);
	  if ($.trim(invitedPlayers) != '') {
	    individualEmail = invitedPlayers.split(';');
	    for (i = 0; i < individualEmail.length; i++) {
		  alert('inviting'+individualEmail[i])
		  Player.create({email: individualEmail[i], gid: 5, team: 1, rid: 2}), {
			success: function(a,b) {
			  alert('Successfully invited player');
			},
			error: function(a,b) {
			  alert('Error inviting a player');
			}
		  }
		}
	  }
	},

	

	logout: function() {
	  $("ul#Leagues-list").text('');
	  del_cookie();
	  document.location.reload(true);
	}
});

// Finally, we kick things off by creating the **App**.
window.App = new AppView;

});

function setCookie(c_name,value,exdays) {
  var exdate=new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
  document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name) {
  var i,x,y,ARRcookies=document.cookie.split(";");
  for (i=0;i<ARRcookies.length;i++) {
    x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
	y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
	x=x.replace(/^\s+|\s+$/g,"");
	if (x==c_name) {
	  return unescape(y);
	}
  }
}

function checkCookie() { 
  var email=getCookie('email');
  if (email!=null && email!="") {
	// $('#LeagueApp .content').css('display', 'none');
	$('#mainPage').css('display', 'block');
    return true;
  } else {
    $('#LeagueApp .content').css('display', 'block');
	return false;
  }
}

function del_cookie() {
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf("=");
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}