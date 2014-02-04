var express         	= require('express')
  , http            	= require('http')
  , io                = require('socket.io')
  , path            	= require('path')
  , passport 			    = require('passport')
  , mongoose          = require('mongoose')
  , userManager       = require('./server/routes/userManager.js')
  , LocalStrategy     = require('passport-local').Strategy
  , gameManager       = require('./server/lib/gameManager.js');

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
    } else {
      //res.render('views/home');
      
    }
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
            return res.send(400);
        }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            return res.send(200);
        });
    })(req, res, next);
});

app.get('/api/v1/whoAmI/', function (req, res) {
  res.send(200, req.user._doc.username);
});

app.get('/api/v1/isLoggedIn', function (req, res) {
  if (req.user != undefined) {
    res.send(200);
  } else {
    res.send(400);
  }
});

app.post('/api/v1/register', function (req, res) {
    userManager.registerUser(req, res);
});

app.post('/api/v1/registerGame', function (req, res) {
    userManager.registerGame(req, res);
});

app.post('/api/v1/findGameByUser', function (req, res) {
    userManager.FindGameByUsername(req, res);
});

app.post('/api/v1/getAllGames', function (req, res) {
    userManager.getAllGames(req, res);
});

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('#/login');
});

app.get('/', function (req, res) {
  res.redirect('/tictac');
})

app.get('/tictac', function (req, res) {
    res.render('index');
});

app.get('/tictac-partials/mainmenu', ensureAuthenticated, function (req, res) {
    res.render('views/mainmenu');
});

app.get('/tictac-partials/:name', ensureAuthenticated, function (req, res) {
    var name = req.params.name;
    res.render('views/' + name);
});

/***** Dynamic Files *****/

var socket = require('socket.io').listen(app.listen(app.get('port')));

var people  = {};
var games   = {};
//var clients = [];

socket.on('connection', function (client) {
  client.on('join', function(name) {

    if (name != "") {
      gameID = null;
      people[client.id] = {username : name, game : gameID};
      client.emit("update", "Connected to the lobby");

      socket.sockets.emit('update', people[client.id].username + "joined the lobby room");

      socket.sockets.emit('update-players', people);
      client.emit('game-lists', {games : games});

      console.log('username joined the lobby', name);


      //clients.push(client);
    }
  });

  client.on('update-players', function () {
    socket.emit('update-players', people);
  });

  client.on('update-games', function () {
    socket.emit('update-games', games);
  });

  client.on('disconnect', function () {
    if (people[client.id]) {

      // Handle cancelling during waiting room scenario 
      var gameID = people[client.id].game;

      if(gameID != null){ // check if disconnector is waiting for a game
        var game = games[gameID];
        if(game.players[0].playerID == client.id){ // disconnector is creator
          if(game.players.length > 1){ //check if there are multiple players in game
            socket.sockets.in(gameID).emit('game-cancelled');
          }
          delete games[gameID];
          socket.sockets.emit('update-game', games);
        }
        // check if disconnector is someone who joined a game
        if(game.players.length > 1 && game.players[1].playerID == client.id){ 
          game.players.slice(1,1);
          socket.sockets.in(gameID).emit('joiner-left');
          game.waiting = true;
        }
      }

      // Handle the lobby scenario
      delete people[client.id];
      socket.sockets.emit('update-players', people);


      // Handle the in game scenario

    }
  });

  client.on('create-game', function (game, cb) {

    gameManager.parseGame(game, client.id, function (err, game) {
      if (err) {
        cb(err);

      } else {

        // Save the game
        games[game.id] = game;
        people[client.id].game = game.id;
        client.join(game.id);
        // Broadcast new game
        //emit to everyone
        socket.sockets.emit('update-games',games);

        cb(null, game);
      }
    })

  });

  client.on('get-game', function(){
    var game= games[people[client.id].game];

    client.emit("get-game", game);

  });

  client.on('join-game', function(game, cb){
    people[client.id].game = game.id;
    client.join(game.id);
    games[game.id].players.push({clientID: client.id, username: people[client.id].username});

    socket.sockets.in(game.id).emit('join-game', games[game.id]);

    cb(null);


  })

});



