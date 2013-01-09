// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

	  // checkCookie();
  
	  // League model
	  window.League = Backbone.Model.extend({
		idAttribute: "_id",
	  });

	  // The collection of League
	  // server, but now uses our /api/leagues backend for persistance.
	  window.LeagueList = Backbone.Collection.extend({

      // Reference to this collection's model.
  	  model: League,
      // id: 1,
	  // url: '/api/leagues'
		
	  //url: 'api/leagues/'+this.id
	  
	  url: function() {
	    alert(this.id);
	    alert('url started');
		alert('this internal id: ' + this.id);
		return '/api/leagues/'+this.id;
	  }
	    
	  /* url : function() {
		var base = '/api/leagues/1';
	    // if (this.isNew()) return base;
		return base;
	    // return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
	  } */
	});

	// Create our global collection of League
	window.League = new LeagueList;

	window.User = Backbone.Model.extend({
		idAttribute: "_id",
	});
	
	window.UserCollection = Backbone.Collection.extend({
		model: User,
		url: '/api/leagues/user'
	});
	
	// Create our golbal collection of User
	window.User = new UserCollection;
	
	
	
	/* window.ActiveLeague = Backbone.Model.extend({
		idAttribute: "_id",
	});

	window.ActiveLeagueList = Backbone.Collection.extend({

		model: ActiveLeague,

		url: '/api/leagues/'+this.ID,
	}); */

// The DOM element for a LeagueView item...
window.LeagueView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {},

    // The LeagueView listens for changes to its model, re-rendering.
    initialize: function() {
		this.model.bind('change', this.render, this);
		alert('league view init');
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
		var text = lid + ' ' + lname + ' ' + llogo;
		this.$('.league-text').text(text);
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

    // Delegated events for creating new items, and clearing completed ones.
    events: {
		"keypress #new-email": "checkUserByKey",
		"keypress #new-password": "checkUserByKey",
		"click #showLeague": "showActiveLeages",
		"click #submit": "checkUserBySubmit",
		"click #logout": "logout"
    },

    // At initialization we bind to the relevant events on the `League`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting items that might be saved in *localStorage*.
    initialize: function() {
		// signup inputs
		this.inputEmail 	= this.$("#new-email");
		this.inputPassword 	= this.$("#new-password");
		// creating game inputs
		this.inputName = this.$("game-name");
		/* this.inputLeagueID = this.$("game-leagueID");
		this.inputSportID = this.$("game-sportID");
		this.inputArenaTypeID = this.$("game-arenaTypeID");
		this.inputActive = this.$("game-Active");
		this.inputRequireApproval = this.$("game-requestApproval");
		this.inputAllowTeams = this.$("game-allowTeams");
		this.inputAllowIndividuals = this.$("game-allowIndividuals");
		this.inputPlayers = this.$("game-players");
		this.inputSubstitues = this.$("game-substitues");
		this.inputSexID = this.$("game-sexID");
		this.inputPointsAlgorithm = this.$("game-pointsAlgorithm");
		this.inputStartPoints = this.$("game-startPoints"); */
		// League.fetch();
		alert('initialize');
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
		this.$('#league-stats').html(this.statsTemplate({
			total:      League.length,
			done:       League.done().length,
			remaining:  League.remaining().length
		}));
    },

    // Add a single item item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    showEachLeagueItem: function(item) {
		alert('each league item method');
		var view = new LeagueView({model: item});
		$("#Leagues-list").append(view.render().el);
    },

    // Add all items in the Leagues collection at once.
    showActiveLeages: function() {
		// reset the list(UL) before loading the new set
		if (checkCookie()) {
			// League.set({ id: '111'}, {silent: true });
			/* League.read({id:'2'}, {
				success: function(a,b) {
					alert('test');
				}
			}); */
			/* that = this;
			alert('check complete');
			$.get("/api/leagues/2", function(data, textStatus, jqXHR) {
				// alert(listModel);
				console.log("Post resposne:");
				console.dir(data);
				console.log(textStatus);
				console.dir(jqXHR);
				$("ul#Leagues-list").text('');
				alert('col 1 - ' + that.collection.get(1));
				console.log(that.collection.get(1));
				//League = data;
				League.each(that.showEachLeagueItem);
			}); */
			// alert(JSON.stringify(superdata.ddata, null, 2));
			alert('button clicked');
			// window.League = new LeagueList({id: 2});
			// League.set();
			// League.fetch({id: 2});
			/* window.League = new LeagueList();
			*/
			window.League.id = parseInt(2);
			//window.League.fetch(); 
			// window.League.fetch({success: function() { alert(model.toJSON) },error: function(e) {alert(e.toJSON)}});
			that = this;
			window.League.fetch({success: function(){
				alert('success'); // => 2 (collection have been populated)
				$("ul#Leagues-list").text('');
				window.League.each(that.showEachLeagueItem);
			}})
			// window.League.each(this.showEachLeagueItem);
			alert('bottom');
			// alert(checkCookie());
		}
    },

	// check if enter is pressed then
	// call checkUserBySubmit
	checkUserByKey: function(e) {
		if (e.keyCode != 13) return;
		this.checkUserBySubmit();
	},

	checkUserBySubmit: function(e) {
		var email = this.inputEmail.val();
		var password = this.inputPassword.val();
		User.create({email: email, password: password}, {
			success: function(a,b) {
				
				// League.set({ id: parseInt(1)});
				/* $.get("/api/leagues/2", function(data, textStatus, jqXHR) {
					alert(JSON.stringify(data, null, 2));
					console.log("Post resposne:");
					console.dir(data);
					console.log(textStatus);
					console.dir(jqXHR);
					$("ul#Leagues-list").text('');
					League.model.set({data: data});
				}); */
				alert('login successful');
				this.$('#LeagueApp .content').hide('slow');
				this.$('#showLeague').show('slow');
				this.$('#logout').show('slow');
				setCookie('email',email,1);
			},
			error: function(a,b) {
				alert('error');
			}
		});
		this.inputEmail.val('');
		this.inputPassword.val('');
	},

	createGame: function() {
		var Name = this.inputName.val();
		/* var LeagueID = this.inputLeagueID.val();
		var SportID = this.inputSportID.val();
		var ArenaTypeID = this.inputArenaTypeID.val();
		var Active = this.inputActive.val();
		var RequireApproval = this.inputRequireApproval.val();
		var AllowTeams = this.inputAllowTeams.val();
		var AllowIndividuals = this.inputAllowIndividuals.val();
		var Players = this.inputPlayers.val();
		var Substitutes = this.inputSubstitues.val();
		var SexID = this.inputSexID.val();
		var PointsAlgorithm = this.inputPointsAlgorithm.val();
		var StartPoints = this.inputStartPoints.val(); */
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
	var username=getCookie('email');
	if (username!=null && username!="") {
		// alert("Welcome again " + username);
		return true;
	} else {
		return false;
		/* username=prompt("Please enter your name:","");
		if (username!=null && username!="") {
			setCookie("username",username,365);
		} */
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


Port 3001 = Login App 
Port 3002 = Login2 App - check user if exist in the database and create cookie for that user
	File Location: Fepa/LeaguesApi
	File to run: LeaguesApi.js
Port 3005 = Socket.io Test App - testing for Socket IO
Port 3006 = Login App3 - testing for showing Tournament Leagues joined by a logged in user
Port 3007 = Auth Login - testing for authentication
	File Location: FePa/auth/socketio/node_modules/everyauth/example
        Tutorial Location: https://github.com/bnoguchi/everyauth
	File to run: node loginserver.js
	normal(with register) login and other credentials from other sites like Facebook, Google, Yahoo, etc,...
	removed other type of logins and retained the normal login(with register)
Port 3008 = Socket.io Test App - A test for sending and recieving messages
Port 3009 = Passport Test App for Authentication
	File Location: FePa/login/examples/login
	Tutorial URL: http://passportjs.org/guide/username-password.html
	File to run: node app.js
	working but not yet storing session
	
	
Leagues Sprint 1 - https://meet.sprintforce.com/Module/QA.aspx?cr=755&pr=68&sp=198&msg=67826
	Database Design: https://meet.sprintforce.com/Module/QA.aspx?cr=755&pr=68&sp=198&msg=67826
	1068, 0617, 0521
https://meet.sprintforce.com/Module/QA.aspx?cr=763&pr=68&sp=200