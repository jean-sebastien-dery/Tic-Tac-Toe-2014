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
      otherwise({
        redirectTo: '/home'
      });
}]);

var Tic = angular.module('tictactoe', []);

Tic.controller('IndexController', ['$scope', function ($scope) {

}]);

Tic.controller('LobbyController', ['$scope', function ($scope) {

}]);