// Useful Documentation:
// Resource on how to use the GET and POST parsing: http://expressjs.com/api.html

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	username:{ type	: String, unique : true	},
	password 	: {type:String},
	gameWon		: {type:Number},
	gameLose	: {type:Number},
	defaultAvatar : {type:Boolean},
});

//username of the player who created this game
var gameSchema = new Schema({
	createdByUsername: {
		type : String,
		unique: true
	},
	gameName : {type:String},

});

var User = mongoose.model('User', userSchema);
var Game = mongoose.model('Game', gameSchema);


exports.getAllGames = function (req, res){
	var games = {};

    User.find({}, function (err, game) {
        games[game._id] = game;
    });

    res.send(games);

}


exports.FindGameByUsername = function (username, cb){
	Game.findOne({'username': username}, function(err, user) {
		if(err){
			cb(err);
		}
		else{
			cb(null,user);
		}
	});

};

exports.findById = function (id, done) {
	User.findById(id, function(err, user){
		if(!err) done(null, user);
		else done(err, null);
	});
};

exports.findUserByUsername = function (username, cb) {

	User.findOne({'username' : username }, function (err, user) {
		if (err) {
			cb(err);
		} else {
			cb(null, user);
		}
	});
};

exports.logUser = function (profile, done) {

	User.findById(profile.id, function(err, user) {
	    if(err) { console.log(err); }
	    if (!err && user != null) {
	    	done(null, user);
	    } else {
			var user = new User({
				_id: mongoose.Types.ObjectId(id),
				firstName: profile.name.givenName,
				lastName: profile.name.familyName,
				location: profile._json.location.name,
				created: Date.now()
			});
			user.save(function(err) {
				if(err) {
				 	console.log(err);
				} else {
					  console.log("saving user ...");
					  done(null, user);
				};
			});
	    };
	});
};

// This function will set the user's avatar to default.
exports.setDefaultAvatar = function(req, res) {

	// Fetches the value of these two parameters that will be used later.
	var currentUser = req.param('username');
	var defaultAvatarValue = req.param('defaultAvatar');

	// Checks if both variables have an assigned value.
	if(typeof currentUser === 'undefined' || typeof defaultAvatarValue === 'undefined'){
		res.send(500);
		throw { name: 'FatalError', message: "The 'username' or 'defaultAvatar' is undefined." };
 	};

	console.log("User '" + currentUser + "' will have its 'defaultAvatar' variable set to '" + defaultAvatarValue + "'.");

	// Searches for the user in the database, 'user' will be the found user.
	User.findOne({'username' : currentUser }, function (err, user) {
		// If there is an error, include the error in the response.
		if (err) {
			res(err);
		} else {
			// If the user is present we change the 'defaultAvatar' variable to passed in the post request.

			user.defaultAvatar = defaultAvatarValue;

			// This will save the user object in the database.
			user.save(function (errsave) {
				if (errsave){
					// If there was an error saving the user, sent back response
					// code 500 to the client (Internal Server error).
					res.send(500, errsave);
				}
			});

			// Sends the OK 200 to the client.
			res.send(200);
		}
	});
};

exports.registerUser = function (req, res) {
	var user = new User(req.body);

	// This will save the user object in the database.
	user.save(function (err) {
		if (err){
			res.send(500, err);
		}else{
			res.redirect('/');
		}
	});
};

exports.registerGame = function(req, res){

	var game= new Game(req.body);

	game.save(function (err) {
		if (err){
			res.send(500, err);
		}else{
			res.redirect('/');
		}
	});
};

exports.findHighestWinningUsers = function () {
	
	//return users in descending order of games won
	User.find()
	.sort('-gameWon' )
	.limit(1)
	.exec( function (err, data) {
		if (err) {
			console.log('Error', err);
		} else {
			console.log('NEW data', data);
		}
	}); 
};

exports.registerWonGame = function(name){

	User.update( {username: name },
                    { $inc: { gameWon: 1 } }, function (err, data) {
                    	console.log('increment game won', data);
                    } );
};

exports.registerLostGame = function(name){

	User.update( {username: name }, { $inc: { gameLose: 1 } }, function (err, data) {
		console.log(' increment game lost', data);
	} );

};


