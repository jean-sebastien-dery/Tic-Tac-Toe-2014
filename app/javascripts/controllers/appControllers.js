var App = angular.module('app', [
  'ngRoute',
  'tictactoe'
]);
 
App.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl   : 'tictac-partials/home',
        controller    : 'HomeController',
        controllerAs  : 'home'
      }).
      when('/lobby', {
        templateUrl   : 'tictac-partials/lobby',
        controller    : 'LobbyController',
        controllerAs  : 'lobby'
      }).
      when('/waitingroom', {
        templateUrl   : 'tictac-partials/waitingroom',
        controller    : 'WRController',
        controllerAs  : 'waitingroom'
      }).
      when('/singleplayer', {
        templateUrl   : 'tictac-partials/singleplayer',
        controller    : 'SPController',
        controllerAs  : 'spControl'
      }).
      when('/register', {
        templateUrl   : 'tictac-partials/register',
        controller    : 'RegisterController',
        controllerAs  : 'register'
      }).
      when('/mainmenu', {
        templateUrl   : 'tictac-partials/mainmenu',
        controller    : 'MainMenuController',
        controllerAs  : 'main'
      }).
      when('/game', {
        templateUrl   : 'tictac-partials/game',
        controller    : 'GameController',
        controllerAs  : 'game'
      }).
      when('/logout', {
        templateUrl   : 'tictac-partials/home',
        controller    : 'LogoutController',
        controllerAs  : 'logout'
      }).
      when('/creategame', {
        templateUrl   : 'tictac-partials/creategame',
        controller    : 'CreateGameController',
        controllerAs  : 'createGame'
      }).
      otherwise({
        redirectTo: '/home'
     });
}]);

var Tic = angular.module('tictactoe', []);
var timeout;

Tic.controller('HomeController', ['$http', '$q', '$location', 'UserInfoService', function ($http, $q, $location, UserInfoService) {
  var controller = this;

  this.user = {
    username : "",
    password : "",
    confirmedPassword : ""
  }

  this.login = function () {
    var deferred = $q.defer();

    $http.post('/api/v1/login/', controller.user).success(function () {

      // Redirect user to main menu
      UserInfoService.saveUser(controller.user);
      $location.path('/mainmenu');

    }).error(function () {

      $location.path('/');

      // Not able to login
      alert('error in login');
    });
  }

  this.register = function () {
    $location.path('/register');
  }

}]);

Tic.controller('LobbyController', ['WebSocketFactory', 'UserInfoService','$location', function (WebSocketFactory, UserInfoService, $location) {
  //UserInfoService.validateLogin();
  var controller = this;

  // Model
  this.players = [];
  this.games   = [];

  // Initialize the list when browser is refreshed
  WebSocketFactory.init().then(function () {

    WebSocketFactory.emit('update-players', {});
    WebSocketFactory.emit('update-games', {}, function (games) {
      controller.games.length = 0;
      $.each(games, function (id, game) {
        controller.games.push(game);
      });
    });

  }, function (err) {
    alert('Not able to join the lobby');
    $location.path('/mainmenu');
  });

  WebSocketFactory.receive('update', function (msg) {
    console.log(msg);
  });

  // Update players list
  WebSocketFactory.receive('update-players', function (players) {
    controller.players.length = 0;
    $.each(players, function (id, player) {
      controller.players.push(player);
    });
  });

  // Update games list
  WebSocketFactory.receive('update-games', function (games) {
    controller.games.length = 0;
    $.each(games, function (id, game) {
      controller.games.push(game);
    });
  });


  this.joinGame = function (game) {

    WebSocketFactory.emit('join-game', game, function(err){
      if (err){
        alert("cannot join this game");
      }
      else{
        $location.path("/waitingroom");
      }


    })
  }

  this.creategame = function () {
    $location.path('/creategame');
  }



}]);

Tic.controller('SPController', ['UserInfoService', function (UserInfoService) {

}]);

Tic.controller('LogoutController', ['WebSocketFactory', '$http', '$location', function (WebSocketFactory, $http, $location) {

  WebSocketFactory.emit('user-logout', {}, function () {
    $http.get('/api/v1/logout').success(function() {
      $location.path('/home');
    }).error(function () {
      alert('not able to logout');
    });
  });

}]);

Tic.controller('WRController', ['$timeout', '$location', 'UserInfoService', 'WebSocketFactory', function ( $timeout, $location, UserInfoService, WebSocketFactory) {
  var controller = this;
  UserInfoService.validateLogin();

  //Model
  this.gameStarted = false;
  this.counter = 5;
  this.rounds = 0;
  this.timer= 0;
  this.creator = "unknown";
  this.newPlayer = "another unknown";

  this.startGame = function () {
    this.gameStarted = true;
    this.counter = 5;

    /* This is probably not the best way to do it but it works.
       Feel free to change it if you want! */
    $timeout(function() { 
      controller.counter--; }, 1000);
    $timeout(function() { controller.counter--; }, 2000);
    $timeout(function() { controller.counter--; }, 3000);
    $timeout(function() { 
      controller.counter--; 
    }, 4000);
    $timeout(function() { controller.counter--; }, 5000);
  }

  this.exitGame = function() {
    WebSocketFactory.emit("cancel-game", {}, function(){
      $location.path("/lobby");
    });
  }

  function refreshGame(game) {
    controller.rounds  = game.rounds;
    controller.timer   = game.timer;
    controller.creator = game.creator;
    if(game.players.length==2){
      controller.newPlayer = game.players[1].username;
    } else {
      controller.newPlayer = '';
    }
  }

  WebSocketFactory.emit("get-game", {});
  WebSocketFactory.receive("get-game", function(game){
    refreshGame(game);
  });

  WebSocketFactory.receive("join-game", function(game){
    
    controller.newPlayer=game.players[1].username;


  });

  WebSocketFactory.receive('game-cancelled', function(){
    //alert("Game creator has left the game. You will return to lobby.");
    $location.path("/lobby");
  });

  WebSocketFactory.receive('joiner-left', function(game){
    //alert("Joiner left. Waiting for new joiner.");
    refreshGame(game);
  });

  
}]);

Tic.controller('RegisterController', ['UserInfoService', function (UserInfoService) {

}]);

Tic.controller('MainMenuController', ['$location', 'UserInfoService', 'WebSocketFactory', function ($location, UserInfoService, WebSocketFactory) {
  UserInfoService.validateLogin();

  this.joinLobby = function () {
    WebSocketFactory.init().then(function () {
      $location.path('/lobby');
      WebSocketFactory.emit('update-games', {});
    }, function (err) {
      alert('Not able to join the lobby');
    });
  }

}]);


Tic.controller('GameController', ['$location', 'UserInfoService', 'WebSocketFactory', function ($location, UserInfoService, WebSocketFactory) {
  UserInfoService.validateLogin();

  this.goLobby = function () {
    WebSocketFactory.init().then(function () {
      $location.path('/lobby');
      WebSocketFactory.emit('update-games', {});
    }, function (err) {
      alert('Not able to join the lobby');
    });
  }

}]);

Tic.controller('CreateGameController', ['$location', 'WebSocketFactory', 'UserInfoService', function ($location, WebSocketFactory, UserInfoService) {
  UserInfoService.validateLogin();
  var controller = this;

  this.time   = 0;
  this.rounds = 0;

  this.setTimer = function (time) {
    controller.time = time;
  }

  this.setRounds = function (rounds) {
    controller.rounds = rounds;
  }
  
  this.create = function () {


    // Joining the username to join the lobby
    UserInfoService.getUsername().then(function (username) {

      var game = {
          time    : controller.time, 
          rounds  : controller.rounds,
          creator : username
        }

      // Join the lobby
      WebSocketFactory.emit('create-game', game, function (err, game) {
        if (err) {
          alert('not able to create the game');
        } else {
          $location.path('/waitingroom');
        }
      });

    }, function (err) {
      alert('Enable to join the lobby');
    });
  }


}]);
