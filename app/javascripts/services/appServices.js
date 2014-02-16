Tic.factory('WebSocketFactory', function ($rootScope, $q, UserInfoService) {
    var socket = io.connect('/');

    var Service = {};

    /******************************/
    /* Messages helping functions */
    /******************************/

    Service.receive = function (event, cb) {
        console.log('RECEIVES -> ', event);
        socket.on(event, function () {
            var args = arguments;
            $rootScope.$apply(function () {
                cb.apply(socket, args);
            });
        });
    };

    Service.emit = function (eventName, data, cb) {
        console.log('EMIT -> ', eventName);
        socket.emit(eventName, data, function () {
            var args = arguments;
            $rootScope.$apply(function () {
                if (cb) {
                    cb.apply(socket, args);
                }
            });
        });
    };

    //Initialization
    Service.init = function () {

        var deferred = $q.defer();

        // Need to get the username to join the lobby
        UserInfoService.getUsername().then(function (username) {

            // Join the lobby
            Service.emit('join', username);
            deferred.resolve();

        }, function (err) {
            console.log(err);
            deferred.reject(err);
        });

        return deferred.promise;
    }


    return Service;
});

Tic.factory('UserInfoService', function ($http, $q, $location) {

    var user = {
        username : ""
    };

    var Service = {};


    Service.saveUser = function (userObj) {
        user.username = userObj.username;
    }

    Service.getUsername = function () {

        var deferred = $q.defer();

        if (user.username != undefined && user.username != "") {
            deferred.resolve(user.username);
        } else {
            $http.get('/api/v1/whoAmI/').success(function (me) {
                user.username = me.data;
                deferred.resolve(user.username);
            }).error(function (err) {
                console.log(err);
                deferred.reject(err);
            });
        }

        return deferred.promise;
    }

    Service.validateLogin = function () {

        var deferred = $q.defer();

        $http.get('/api/v1/isLoggedIn').success(function () {
            deferred.resolve();

        }).error(function (err) {
            $location.path('/home');
            deferred.reject();
        });

        return deferred.promise;
    }

    return Service;
})