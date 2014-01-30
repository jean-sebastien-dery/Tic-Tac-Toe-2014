var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	username:{
		type	: String,
		unique	: true	},
	password 	: {type:String},
});

var User = mongoose.model('User', userSchema);

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

exports.registerUser = function (req, res) {
	var user = new User(req.body);

	user.save(function (err) {
		if (err){
			res.send(500, err);
		}else{
			res.redirect('/');
		}
	});
};
