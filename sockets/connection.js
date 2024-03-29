var socketRepo = getRepos('sockets')();

module.exports = Connection;
/**
 * handle the socket.io connection
 * @param base
 * @returns {Connection}
 * @constructor
 */
function Connection (base) {
    'use strict';

    if (!(this instanceof Connection)) {
        return new Connection(base);
    }

    var localSockets = {};
    localSockets[process.pid] = [];

    var cleanUpSockets = function (signal, callback) {
        for (var i in localSockets[process.pid]) {
            if (localSockets[process.pid][i]) {
                socketRepo.disconnect(localSockets[process.pid][i]);
            }
        }
        console.info('[GC]', process.pid , signal);

        callback();
    };

    [ 'SIGTERM', 'SIGINT', 'SIGHUP', 'SIGQUIT', 'exit' ].forEach( function(signal) {
        process.on(signal, function () {
            cleanUpSockets(signal, function () {
                process.exit(1);
            });
        });
    });

    base.io.on('connection', function (socket) {
        socketRepo.connect(socket.session.user._id, socket.id).then(function () {
            localSockets[process.pid].push(socket.id);

            socket.on('disconnect', function () {
                socketRepo.disconnect(socket.id).then(function () {
                    localSockets[process.pid].remove(localSockets[process.pid].indexOf(socket.id));
                }, function (err) {
                    console.error(err);
                });
            });
        }, function (err) {
            console.error(err);
        });
    });
}
