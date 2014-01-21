var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	username:{
		type	: String,
		unique	: true	},
	password 		: {type:String},
});

var tutorSchema = new Schema({
  userId:  {type:Schema.ObjectId, required:true, unique:true},
  tags: [Schema.ObjectId] 
});

var User = mongoose.model('User', userSchema);

exports.findById = function (id, done) {
	User.findById(id, function(err, user){
		if(!err) done(null, user);
		else done(err, null);
	})
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

exports.createUser = function (req, res) {
	var user = new User(req.body);

	var promise = new mongoose.Promise;

	user.save(function (err) {
		if (err){
			promise.resolve(err);
		}else{
			promise.resolve(null, user);
		}
	});
	return promise;
};
