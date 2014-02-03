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
        controllerAs  : 'wrController'
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

Tic.controller('LobbyController', ['WebSocketFactory', function (WebSocketFactory) {
  var controller = this;

  // Model
  this.players = [];
  this.games   = [];

  // Initialize the list when browser is refreshed
  WebSocketFactory.emit('update-players', {});
  WebSocketFactory.emit('update-games', {});

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



}]);

Tic.controller('SPController', ['$location', function ($location) {

}]);

Tic.controller('WRController', ['$location', function ($location) {

}]);

Tic.controller('RegisterController', ['$location', function ($location) {

}]);

Tic.controller('MainMenuController', ['$location', function ($location) {

}]);

Tic.controller('CreateGameController', ['$location', 'WebSocketFactory', 'UserInfoService', function ($location, WebSocketFactory, UserInfoService) {
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
