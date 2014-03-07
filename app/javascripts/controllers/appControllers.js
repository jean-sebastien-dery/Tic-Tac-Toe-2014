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
      when('/avatarmenu', {
        templateUrl   : 'tictac-partials/avatarmenu',
        controller    : 'AvatarMenuController',
        controllerAs  : 'avatarMenu'
      }).
      otherwise({
        redirectTo: '/home'
     });
}]);

var Tic = angular.module('tictactoe', []);
var timeout;

Tic.controller('HomeController', ['$http', '$q', '$location', 'UserInfoService', function ($http, $q, $location, UserInfoService) {
  var controller = this;

  controller.user = {
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

    return deferred.promise;
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
        alert("cannot join this game");f
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

Tic.controller('AvatarMenuController', ['UserInfoService', 'WebSocketFactory', '$scope', '$http', '$location', function (UserInfoService, WebSocketFactory, $scope, $http, $location) {
  var controller = this;
  var imageIsSelected = false;
  var selectedImage;

  // Handles the action of pressing on the 'Upload news' button.
  this.uploadNew = function() {
    console.log("The function uploadNew() was called.");

    // Uploads the picture to the server.
    if (typeof controller.imageIsSelected == 'undefined' || controller.imageIsSelected == false) {
      console.log("The user selected no picture to upload.");
      alert("You must select a picture first!");
    } else {
      console.log("Uploading the new avatar to the server.");

      $http.post('/api/v1/uploadImage', {"Image" : controller.selectedImage}).success(function () {

      // There is nothing else to do here if the request is successfull.

      }).error(function () {
        $location.path('/');
        // Not able to login
        alert('An error occured while setting up the default avatar.');
      });

      // // Uploads the picture to the server.
      // $http.uploadFile({
      //   url: 'my/upload/url',
      //   file: controller.selectedImage
      // }).then(function(data, status, headers, config) {
      //   // file is uploaded successfully
      //   console.log(data);
      // });

      // Modifies the attribute in the server.
      controller.changeDefaultAvatarSetting('false');
    }
  }

  // Reference for this part of the program: http://stackoverflow.com/questions/16631702/file-pick-with-angular-js
  // http://www.w3schools.com/jsref/event_onchange.asp
  // https://code.google.com/p/angular-file-upload/
  // http://stackoverflow.com/questions/16631702/file-pick-with-angular-js
  // http://stackoverflow.com/questions/13373834/upload-image-using-javascript

  // Very usefull API for manipulating images:
  // http://www.w3.org/TR/file-upload/
  // http://www.html5rocks.com/en/tutorials/file/dndfiles/

  // When a change occurs in the input object, this function is called.
  $scope.inputSelectChange = function() {
    console.log("The user changed the file input.");

    // Gets the file from the input form in the HTML.
    var file = document.getElementById('selectedImage').files[0];
    if(file) { // Verifies that a file was selected.
      console.log("A file was selected.");
      if (file.type != "image/png") { // Ensures that the file is of the right type.
        controller.imageIsSelected = false;
        alert("The selected file must be of type 'png'!");
      } else { // If everything is all right, defines the 'selectedImage' variable and set 'imageIsSelected' to true.
        console.log("Name: " + file.name + ". Size: " + file.size + ". Type: " + file.type);
        controller.imageIsSelected = true;
        controller.selectedImage = file;
      }
    } else { // If no file is selected switch the 'imageIsSelected' to false.
      console.log("No file is selected.");
      controller.imageIsSelected = false;
    }
    console.log("Current value of 'imageIsSelected': " + controller.imageIsSelected);
  }

  // Handles the action of pressing on the 'Use default' button.
  // So here the server should get notified that the attribute 'defaultAvatar' in the database
  // will be changed to 'true' for the current user.
  this.useDefault = function () {
    controller.changeDefaultAvatarSetting('true');
  }

  // Changes the 'defaultAvatar' variable of the user in the database (it is either 'true' or 'false').
  this.changeDefaultAvatarSetting = function(isUsingDefaultAvatar) {
    console.log("Function changeDefaultAvatarSetting() was called with the 'isUsingDefaultAvatar' set to '" + isUsingDefaultAvatar + "'.");
    // The first thing to do is to get the username of the current user.
    UserInfoService.getUsername().then(function (username) {
      // Then, as soon as we have the username we can send the POST request.

      // Sends the POST message that sets the 'useDefault' variable to 'true'.
      // The POST link '/api/v1/setDefaultAvatar' will be executed in 'web.js'.
      $http.post('/api/v1/setDefaultAvatar', {"username" : username, "defaultAvatar" : isUsingDefaultAvatar}).success(function () {

      // There is nothing else to do here if the request is successfull.

      }).error(function () {
        $location.path('/');
        // Not able to login
        alert('An error occured while setting up the default avatar.');
      });

    }, function (err) { // Handles any error that could occur while identifying the current user.
      alert('Enable to get the username of the current user.');
    });
  }

  // Handles the action of pressing on the 'Back' button.
  // The only thing that needs to be done is going back to the 'mainmenu'.
  this.back = function() {
    $location.path('/mainmenu');
  }

}]);

Tic.controller('WRController', ['$timeout', '$location', 'UserInfoService', 'WebSocketFactory', function ( $timeout, $location, UserInfoService, WebSocketFactory) {
  var controller = this;
  UserInfoService.validateLogin();

  //Model
  this.gameStarted = false;
  this.counter = 5;
  this.rounds = 0;
  this.timer= 0;
  this.creator = '';
  this.newPlayer = '';
  this.lock = false; // Allows two players to play on the same computer (different windows)

  function startGame() {
    
    if (controller.lock == false) {
      controller.lock = true;
      /* This is probably not the best way to do it but it works.
         Feel free to change it if you want! */
      $timeout(function() { controller.counter--; }, 1000);
      $timeout(function() { controller.counter--; }, 2000);
      $timeout(function() { controller.counter--; }, 3000);
      $timeout(function() { controller.counter--; }, 4000);
      $timeout(function() { controller.counter--; 
                            WebSocketFactory.emit("start-game");
                            $location.path("/game"); 
                                                  }, 5000);
    }
    else {
      $timeout(function() { $location.path("/game"); }, 5000);
    }

  }

  this.exitGame = function() {
    controller.gameStarted = false;
    WebSocketFactory.emit("cancel-game", {}, function(){
      $location.path("/lobby");
    });
  }

  function refreshGame(game) {
    controller.rounds  = game.rounds;
    controller.timer   = game.timer;
    controller.creator = game.creator;
    if(game.players.length == 2){
      controller.gameStarted = true;
      controller.newPlayer = game.players[1].username;
      startGame();
    } else {
      controller.gameStarted = false;
      controller.newPlayer = '';
    }
  }

  WebSocketFactory.emit("get-game", {});

  WebSocketFactory.receive("get-game", function(game){
    refreshGame(game);
  });

  WebSocketFactory.receive('goto-game', function(){
    $location.path("/game");
  });

  WebSocketFactory.receive("join-game", function(game){
    
    controller.newPlayer=game.players[1].username;
    refreshGame(game);
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

Tic.controller('RegisterController', ['$location', 'UserInfoService', function ($location, UserInfoService) {
  this.cancel = function () {
    $location.path("/home");
  }
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

Tic.controller('MainController', ['UserInfoService', function (UserInfoService) {
    this.toggleFullScreen = function () {
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }   
}])

Tic.controller('GameController', ['$location', 'UserInfoService', 'WebSocketFactory', function ($location, UserInfoService, WebSocketFactory) {
    //UserInfoService.validateLogin();
    var controller = this;

    // 0 when nothing in the grid
    // 1 when X in the grid
    // 2 when O in the grid
    this.grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    this.token = 2;
    this.settings = {};
    this.starter = '';
    this.timer = 0;
    this.round = 0;
    this.creator = '';
    this.newPlayer = '';
    this.lock = false;
    this.turn = 2;
    this.wins = [0, 0];

    // Change load to false when you dev environment
    this.load = true;

    // Comment this out if you want to avoid matching to player when you develop!
    WebSocketFactory.emit('load-game', function (game) {
        controller.token = game.userToken;
        controller.settings = game;
    });

    // Until here

    WebSocketFactory.receive('players-ready', function () {
        controller.load = false;
    });

    WebSocketFactory.receive('update-grid', function(data) {
        controller.grid = data.grid;
        controller.turn = data.token;
    });

    WebSocketFactory.receive('game-status', function(data){
        if(data == 1 || data == 2){
            alert("")
            controller.round++;
            controller.turn = data;
            resetGrid(controller.grid);
            controller.wins[data]++;
        } else if(data == 3) {
            controller.round++;
            controller.turn = Math.ceil(Math.random()*2);
            resetGrid(controller.grid);
        }
        WebSocketFactory.emit('update-grid', controller.grid, function (err, data) {
            if (err) {
              alert(err);
            } else {
              if(data!=3){
                alert(controller.recentWinner + " wins!");
              } else {
                alert("it is a tie!");
              }
            }
        });
    });

    function resetGrid(grid){
        var i, j;
        for(i = 0; i < 3; i++){
          for(j=0; j<3; j++){
            grid[i][j] = 0;
          }
        }
    }


    this.placeToken = function (x, y) {
      UserInfoService.getUsername().then(function (username) {

        if (controller.grid[x][y] != 0) {
            // The spot is already taken
            alert("You can't place your token here");
        } else if(controller.token != controller.turn) {
            alert("it is not your turn!");
        } else {
           controller.grid[x][y] = controller.token;
           WebSocketFactory.emit('update-grid', controller.grid, function (err, game) {
              if (err) {
                alert(err);
              } else {
                // FIXME: to add else statement
              }
            });
        }
      });
    };

    this.exitGame = function () {
        WebSocketFactory.emit("cancel-game", {}, function () {
            $location.path("/lobby");
        });
    };

    function refreshGame(game) {
        controller.rounds = game.rounds;
        controller.timer = game.timer;
        controller.creator = game.creator;
        controller.starter = game.players[Math.round(Math.random())].username;
        if (game.players.length == 2) {
            controller.newPlayer = game.players[1].username;

        } else {
            controller.newPlayer = '';
        }
    }

    WebSocketFactory.emit("get-game", {});

    WebSocketFactory.receive("get-game", function (game) {
        refreshGame(game);
    });



} ]);

Tic.controller('CreateGameController', ['$location', 'WebSocketFactory', 'UserInfoService', function ($location, WebSocketFactory, UserInfoService) {
  UserInfoService.validateLogin();
  var controller = this;

  this.time   = 2;
  this.rounds = 3;

  this.setTimer = function (time) {
    controller.time = time;
  }

  this.setRounds = function (rounds) {
    controller.rounds = rounds;
  }

  this.cancel = function () {
    $location.path("/lobby");
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
          alert(err);
        } else {
          $location.path('/waitingroom');
        }
      });

    }, function (err) {
      alert('Unable to join the lobby');
    });
  }


}]);
