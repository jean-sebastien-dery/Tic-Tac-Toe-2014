var App = angular.module('app', [
  'ngRoute',
  'tictactoe'
]);
 
App.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl: 'views/home.html',
        controller: 'IndexController'
      }).
      when('/lobby', {
        templateUrl: 'views/lobby.html',
        controller: 'LobbyController'
      }).
      when('/singleplayer', {
        templateUrl: 'views/singleplayer.html',
        controller: 'SPController'
      }).
      when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      }).
      when('/mainmenu', {
        templateUrl: 'views/mainmenu.ejs',
        controller: 'MenuController'
      }).
      otherwise({
        redirectTo: '/home'
      });
}]);

var Tic = angular.module('tictactoe', []);

Tic.controller('IndexController', ['$scope', function ($scope) {

}]);

Tic.controller('LobbyController', ['$scope', function ($scope) {

}]);

Tic.controller('SPController', ['$scope', function ($scope) {

}]);

Tic.controller('LoginController', ['$scope', function ($scope) {

}]);

Tic.controller('MenuController', ['$scope', function ($scope) {

}]);