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

  // chat
  this.newMsg = "";
  this.messages = [];

  WebSocketFactory.receive('new-message', function (msg) {
    controller.messages.push(msg);
  });

  this.sendMessages = function (msg) {

    if (controller.newMsg != "") {
      WebSocketFactory.emit('new-message', controller.newMsg);
    } else {
      alert('Empty message');
    }
  }

  
  this.showChat = function() {
      document.getElementById("chatbox").style.display = "initial";
  }

  this.hideChat = function() {
      document.getElementById("chatbox").style.display = "none";
  }
    


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

  this.mainmenu = function () {
    $location.path('/mainmenu');
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
  var selectedImageMetadata;
  var fileSystem = null; // This will contain a reference to the file systme later on.
  var gameWon;
  var gameLost;
  var gameRatio;
  var gameRank;

  UserInfoService.getUsername().then(function(username) {
    controller.picture = username;

    $http.post('/api/v1/getUserHistory', {"username" : username}).success(function (data) {
      console.log("Was able to get the user history.");

      console.log(data);
      
      if (data.gameWon == undefined) {
        console.log("The value 'gameWon' was not defined, set to 0.");
        controller.gameWon = 0;
      } else {
        controller.gameWon = data.gameWon;
      }

      if (data.gameLose == undefined) {
        console.log("The value 'gameLose' was not defined, set to 0.");
        controller.gameLost = 0;
      } else {
        controller.gameLost = data.gameLose;
      }

      if (controller.gameLost == 0) {
        controller.gameRatio = controller.gameWon/1;
      } else {
        controller.gameRatio = controller.gameWon/controller.gameLost;
      }

      if (data.gameRank == undefined) {
        console.log("The value 'gameRank' was not defined, set to 0.");
        controller.gameRank = "unknown";
      } else {
        controller.gameRank = data.gameRank;
      }
    }).error(function () {
      $location.path('/');
      alert('An error occured while getting the user history');
    });
  });

  // Reference for this part of the program: http://stackoverflow.com/questions/16631702/file-pick-with-angular-js
  // http://www.w3schools.com/jsref/event_onchange.asp
  // https://code.google.com/p/angular-file-upload/
  // http://stackoverflow.com/questions/16631702/file-pick-with-angular-js
  // http://stackoverflow.com/questions/13373834/upload-image-using-javascript

  // Very usefull API for manipulating images:
  // http://www.w3.org/TR/file-upload/
  // http://www.html5rocks.com/en/tutorials/file/dndfiles/
  // http://nodejs.org/api/fs.html
  // http://www.html5rocks.com/en/tutorials/file/filesystem/
  // http://dev.w3.org/2009/dap/file-system/pub/FileSystem/
  // http://blog.teamtreehouse.com/building-an-html5-text-editor-with-the-filesystem-apis
  // https://developer.mozilla.org/en-US/docs/Web/API/FileReader
  // http://blog.teamtreehouse.com/reading-files-using-the-html5-filereader-api

  // Handles the action of pressing on the 'Upload news' button.
  this.uploadNew = function() {
    console.log("The function uploadNew() was called.");

    // Uploads the picture to the server.
    if (typeof controller.imageIsSelected == 'undefined' || controller.imageIsSelected == false) { // Verifies if the user selected an image.
      console.log("The user selected no picture to upload.");
      alert("You must select a picture first!");
    } else {
      console.log("Uploading the new avatar to the server.");

      // Determines if the browser supports the FileSystem API that will be used to read the image locally.
      window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
      if (window.requestFileSystem) {
        console.log("The current browser supports the FileSystem API.");
        controller.loadTheSelectedImage();
      } else {
        alert('Sorry! Your browser does not support the FileSystem API! You will not be able to upload your avatar!');
      }

    }
  }

  // Handles the action of pressing on the 'Use default' button.
  // So here the server should get notified that the attribute 'defaultAvatar' in the database
  // will be changed to 'true' for the current user.
  this.useDefault = function () {
    controller.changeDefaultAvatarSetting('true');
  }

  // Handles the action of pressing on the 'Back' button.
  // The only thing that needs to be done is going back to the 'mainmenu'.
  this.back = function() {
    $location.path('/mainmenu');
  }

  this.resetHistory = function() {
    console.log("About to reset the user's history.");

    UserInfoService.getUsername().then(function(username) {

      $http.post('/api/v1/resetUserHistory', {"username" : username}).success(function () {
        console.log("Was able to reset the user history.");
        $location.path('/mainmenu');
      }).error(function () {
        $location.path('/');
        alert('An error occured while resetting the user history');
      });

    });
    
  }

  // Handles the error that might happen with the FS API.
  this.fileSystemErrorHandler = function(error) {
    alert("Something went wrong with the file system on the front-end of the application.");
    console.log(error);
  }

  this.loadTheSelectedImage = function() {
    navigator.webkitPersistentStorage.requestQuota(1024 * 1024 * 5, function(grantedSize) {
      // Request a file system with the new size.
      window.requestFileSystem(window.PERSISTENT, grantedSize, function(fs) {
        // Set the filesystem variable.
        controller.filesystem = fs;
        console.log("The file system was acquired.");

        var reader = new FileReader();
        reader.onload = function(e) { //  Defines the callback function that will be called once the image is loaded.
          console.log("The selected file has been loaded.");
          var currentImage = reader.result;
          controller.sendTheLoadedImage(currentImage);
        }

        console.log("About to read the image the user selected.");
        reader.readAsBinaryString(controller.selectedImageMetadata); 
      }, controller.fileSystemErrorHandler);
    }, controller.fileSystemErrorHandler);
  }

  this.sendTheLoadedImage = function(imageToSend) {

    UserInfoService.getUsername().then(function (username) {
      
      console.log("About to send the image.");
      // Sends the image to the server.
      $http.post('/api/v1/uploadImage', {"image" : imageToSend, "username" : username}).success(function () {
        console.log("The upload was a success.");
        // Modifies the attribute in the server.
        controller.changeDefaultAvatarSetting('false');
      }).error(function () {
        $location.path('/');
        alert('An error occured while setting up the default avatar.');
      });

    }, function (err) { // Handles any error that could occur while identifying the current user.
      alert('Enable to get the username of the current user.');
    });

  }

  // When a change occurs in the input object, this function is called.
  $scope.inputSelectChange = function() {
    console.log("The user changed the file input.");

    var file = document.getElementById('selectedImageMetadata').files[0]; // Gets the image metadata from the 'input' embedded in the HTML.
    if(file) { // Verifies that a file was selected.
      console.log("A file was selected.");
      if (file.type != "image/png") { // Ensures that the file is of the right type (we only accept PNGs).
        controller.imageIsSelected = false;
        alert("The selected file must be of type 'png'!");
      } else { // If everything is all right, defines the 'selectedImageMetadata' variable and set 'imageIsSelected' to true.
        if (file.size < 20000) {
          console.log("Name: " + file.name + ". Size: " + file.size + ". Type: " + file.type);
          controller.imageIsSelected = true;
          controller.selectedImageMetadata = file;
        } else {
          alert("The file is too big, it needs to be smaller than 20KB (try 100px*100px).");
        }
      }
    } else { // If no file is selected switch the 'imageIsSelected' to false.
      console.log("No file is selected.");
      controller.imageIsSelected = false;
    }
    console.log("Current value of 'imageIsSelected': " + controller.imageIsSelected);
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

      $location.path('/mainmenu');

      }).error(function () {
        $location.path('/');
        alert('An error occured while setting up the default avatar.');
      });

    }, function (err) { // Handles any error that could occur while identifying the current user.
      alert('Enable to get the username of the current user.');
    });
  }

}]);

Tic.controller('WRController', ['$timeout', '$location', 'UserInfoService', 'WebSocketFactory', function ( $timeout, $location, UserInfoService, WebSocketFactory) {
  var controller = this;
  UserInfoService.validateLogin();

  //Model
  this.gameStarted = false;
  this.counter = 5;
  this.rounds = 0;
  this.timer = 0;
  this.creator = '';
  this.newPlayer = "unknown-player-avatar";
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
      $timeout(function() {
        if ($location.path() == "/waitingroom") {
          $location.path("/game"); 
        } 
      }, 5000);
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
      controller.newPlayer = "unknown-player-avatar";
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

Tic.controller('MainMenuController', ['$scope', '$location', 'UserInfoService', 'WebSocketFactory', function ($scope, $location, UserInfoService, WebSocketFactory) {
  UserInfoService.validateLogin();

  var top = io.connect('/top');

  $scope.top = {};
  $scope.top.list = [];

  top.on('connect', function (top10) {
    console.log('connected to top 10 list');
  });

  top.on('update-top', function (top) {
    console.log("function update-top has been called.");
    var players = [];

    for (var i = 0, player; player = top[i]; i++) {
      var win = 1, lose = 1;

      if (player.gameWon == undefined) {
        win = 1;
      } else if (player.gameWon != 0) {
        win = player.gameWon;
      }

      if (player.gameLose == undefined) {
        lose = 1;
      } else if (player.gameLose != 0) {
        lose = player.gameLose;
      }

      // if ( player.gameWon != 0) {
      //   win = player.gameWon;
      // } else {
      //   win = 0;
      // }

      // if ( player.gameLose != 0) {
      //   lose = player.gameLose;
      // } else if (player.gameLose == undefined) {
      //   lose = 1;
      // }

      console.log("Number of won games: " + win);
      console.log("Number of lost games: " + lose);

      player.ratio = win/lose;

      players.push(player);
    }

    $scope.$apply(function () {
      $scope.top.list = players;
    });
  });

  $scope.test = function () {
    $scope.top.list.push({
      username: 'allo',
      ratio : 3
    });
  }

  // this.joinLobby = function () {
  //   WebSocketFactory.init().then(function () {
  //     $location.path('/lobby');
  //     WebSocketFactory.emit('update-games', {});
  //   }, function (err) {
  //     alert('Not able to join the lobby');
  //   });
  // }

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

Tic.controller('GameController', ['$interval', '$location', 'UserInfoService', 'WebSocketFactory', function ($interval, $location, UserInfoService, WebSocketFactory) {
    //UserInfoService.validateLogin();
    var controller = this;
    this.soundOn = true;
    this.soundIcon = "../../images/sound_on.png";
    // 0 when nothing in the grid
    // 2 when X in the grid
    // 1 when O in the grid
    this.grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    this.token = 2;
    this.settings = {};
    this.starter = '';
    this.timer = 0;
    this.countdown = 0;
    this.round = 0;
    this.creator = '';
    this.newPlayer = '';
    this.lock = false;
    this.turn = 2;
    this.wins = [0, 0];
    this.players = [];
    var myUsername = '';
    var timerId;

    // Change load to false when you dev environment
    this.load = true;

    function startCountdown () {
      if (timerId) stopCountdown();

      controller.countdown = controller.timer;
      timerId = $interval(countDown, 1000);
      countDown();
    }

    function stopCountdown () {
      $interval.cancel(timerId);
      timerId = null;
      controller.countdown = controller.timer;
    }


    this.toggleSound = function () { 
      if (this.soundOn == true) {
        controller.soundOn = false;
        controller.soundIcon = "../../images/sound_off.png";
      }
      else {
        controller.soundOn = true;
        controller.soundIcon = "../../images/sound_on.png";
      }

    }
 
    function countDown () {
      controller.countdown--;
      
      // Count has not reached zero
      if (controller.countdown <= 0) {

        if (controller.countdown == 0) {

          stopCountdown();

          //Time is up
          if (controller.turn == controller.token) {
            alert('Your time is up, you losed the round');
            WebSocketFactory.emit('times-up', {});
          }
        }


        controller.countdown = controller.timer;
      }
    };

    // Comment this out if you want to avoid matching to player when you develop!
    WebSocketFactory.emit('load-game', function (game) {
        controller.token = game.userToken;
        controller.settings = game;
    });

    // Until here

    WebSocketFactory.receive('players-ready', function () {
        controller.load = false;
        startCountdown();
    });

    WebSocketFactory.receive('update-grid', function(data) {
        controller.grid = data.grid;
        controller.turn = data.token;
        startCountdown();
    });

    WebSocketFactory.receive('game-status', function(data){
        stopCountdown();
        controller.grid = data.grid;
        var winnerToken = data.win;
        var loserToken = ( winnerToken == 1 ? 2 : 1);

        if(data.win == 1 || data.win == 2){
            alert(controller.players[winnerToken].username + " has won round #" + (controller.round + 1));
            controller.round++;
            controller.turn = loserToken;
            controller.starter = loserToken;//the loser starts
            resetGrid(controller.grid);
            controller.wins[winnerToken]++;
            controller.recentWinner = controller.players[winnerToken].username;//this player won
            controller.recentLoser = controller.players[loserToken].username;//this player goes first next round

        } else if(data.win == 3) {
            controller.round++;
            controller.starter = (controller.starter == 1 ? 2 : 1);
            controller.turn = controller.starter;
            resetGrid(controller.grid);
        }

        startCountdown();
    });

    WebSocketFactory.receive('game-done', function(winner) {
      stopCountdown();
      if (winner == 1 || winner == 2) {
        if(controller.soundOn==true){
        if(winner==2){
          if(myUsername==controller.players[2].username){
            var audio = new Audio('../../audio/win.mp3');
            audio.play();
          }
          else{
            var audio = new Audio('../../audio/lose.mp3');
            audio.play();
          }
        }
        else if(winner == 1){
          if(myUsername==controller.players[1].username){
            var audio = new Audio('../../audio/win.mp3');
            audio.play();
          }
          else{
            var audio = new Audio('../../audio/lose.mp3');
            audio.play();
          }
        }
        }
        else{
          alert("you are muted");
        }
        alert("Player " + (winner == 1 ? controller.players[1].username : controller.players[2].username) + " won the game");       
      } else {
        alert("The game is tie");    
      }
      var restart = confirm("Would you like to play again?");
      if (restart == true){
        restartGame();
      } else {
        exitGame();
      }
    })

    function resetGrid(grid){
        var i, j;
        for(i = 0; i < 3; i++){
          for(j=0; j<3; j++){
            grid[i][j] = 0;
          }
        }
    }

    this.placeToken = function (x, y) {
      stopCountdown();
      UserInfoService.getUsername().then(function (username) {
        myUsername = username;
        if (controller.grid[x][y] != 0) {
            // The spot is already taken
            if(controller.token != controller.turn){// to prevent annoying popups
            alert("You can't place your token here");} 
        } else if(controller.token != controller.turn) {
            alert("it is not your turn!");
        } else {
           controller.grid[x][y] = controller.token;
           WebSocketFactory.emit('update-grid', controller.grid);
        }
      });
    };
 
  this.exitGame = function() {
    controller.gameStarted = false;
    stopCountdown();
    
    WebSocketFactory.emit("cancel-game", {}, function(){
      $location.path("/lobby");
    });
  }

    function refreshGame(game) {

      controller.rounds  = game.rounds;
      controller.timer   = game.timer;
      controller.creator = game.creator;
      controller.token = game.userToken;
      controller.players[2] = game.players[0];
      controller.players[1] = game.players[1];
      if(game.players.length == 2){
        controller.newPlayer = game.players[1].username;
      } else {
        controller.newPlayer = '';
      }
    }


     function restartGame() {
      controller.round = 0;
      resetGrid(controller.grid);
      wins[0] = 0;
      wins[1] = 0;
      WebSocketFactory.emit("restart-game",{});
    }

    WebSocketFactory.emit("get-game", {});

    WebSocketFactory.receive("get-game", function (game) {
        refreshGame(game);
    });



} ]);

Tic.controller('CreateGameController', ['$location', 'WebSocketFactory', 'UserInfoService', function ($location, WebSocketFactory, UserInfoService) {
  UserInfoService.validateLogin();
  var controller = this;

  this.time   = 10;
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
