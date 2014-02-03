var express         	= require('express')
  , http            	= require('http')
  , io                = require('socket.io')
  , path            	= require('path')
  , passport 			    = require('passport')
  , mongoose          = require('mongoose')
  , userManager       = require('./server/routes/userManager.js')
  , LocalStrategy     = require('passport-local').Strategy;

// serialize and deserialize
passport.serializeUser(function(user, done) {
  console.log('serializeUser: ' + user._id);
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  userManager.findById(id, done);
});

//Passport-local strategy
passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
  },

  function(username, password, done) {

    //asynchronous verificatoin, for effect...
    process.nextTick(function () {

      userManager.findUserByUsername(username, function (err, user) {
        if (err) { return done(err); }
        if (!user) { 
                    //Invalid username
          return done(null, false, { message: 'Unknown user ' + username});
        } 
          if (user.password == password) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Invalid password'})
          }
      })

    });
    }
));

function ensureAuthenticated (req, res, next) {
    if (req.params.name == 'home') {
      return res.render('views/home');

    } else if (req.params.name == 'singleplayer') {
      return res.render('views/singleplayer');

    } else if (req.params.name == 'waitingroom') {
      return res.render('views/waitingroom');

    } else if (req.params.name == 'register') {
      return res.render('views/register');
    }

    if (req.isAuthenticated()) { 
      console.log("I am authenticated");
      return next(); 
    }
    res.redirect('/');
}

mongoose.connect('mongodb://localhost/tictac');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("Connected to MongoDB");
});

var app = express();

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/app');
app.set('view engine', 'ejs');
app.use(express.favicon(__dirname + '/app'));
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.session({ secret: 'my_precious' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'app')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// routes
app.post('/api/v1/login/', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            return res.redirect('/')
        }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            return res.redirect('#/mainmenu');
        });
    })(req, res, next);
});

app.post('/api/v1/register', function (req, res) {
    userManager.registerUser(req, res);
});

app.get('/', function (req, res) {
  res.redirect('/tictac');
})

app.get('/tictac', function (req, res) {
    res.render('index');
});

app.get('/tictac-partials/:name', ensureAuthenticated, function (req, res) {
    var name = req.params.name;
    res.render('views/' + name);
});

/***** Dynamic Files *****/

var socket = require('socket.io').listen(app.listen(app.get('port')));
var people  = {};

socket.sockets.on('connection', function (clientSocket) {
  console.log('connected', clientSocket.id);
  clientSocket.on('join', function (userId) {
    //console.log('Join',userId);
    people[clientSocket.id] = { userId : userId, isAvailable : false};  
  });

  clientSocket.on('disconnect', function () {
    delete people[clientSocket.id];
  });
});
