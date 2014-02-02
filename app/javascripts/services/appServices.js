Tic.factory('WebSocketFactory', function ($rootScope) {
    var socket = io.connect('/');

    var Service = {};

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

    Service.emit('test', {
        type: 'client-event',
    }, function (err, timeframes) {
        if (err) {
            cb('ERROR: not able to get period timeframes ' + err);
        } else {
            console.log('emiting test worked');
        }
    });

    return Service;
});