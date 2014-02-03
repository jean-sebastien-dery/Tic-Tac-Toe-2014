Tic.factory('WebSocketFactory', function ($rootScope) {
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

    return Service;
});

Tic.factory('UserInfoService', function ($http, $q) {

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
            $http.get('/api/v1/whoAmI/').then( function (me) {
                user.username = me.data;
                deferred.resolve(user.username);
            }, function (err) {
                console.log(err);
                deferred.reject(err);
            });
        }

        return deferred.promise;
    }

    return Service;
})