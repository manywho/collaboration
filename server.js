var app = require('http').createServer(handler);
var io = require('socket.io')(app);

function handler(req, res) {

}

var extraStartupMessage = '';

process.argv.forEach(function (value, index, array) {

    if (value.indexOf('--redis') === 0) {

        var redis = require('socket.io-redis');

        var redisConnectionString = value.substring(8);

        io.adapter(redis(redisConnectionString, {
            key: 'collaboration:'
        }));

        extraStartupMessage += ', connected to Redis at ' + redisConnectionString;

    }

});

app.listen(4444);
console.log('Collaboration server listening on 4444' + extraStartupMessage);

io.on('connection', function (socket) {

    socket.on('join', function (data) {

        console.log('User: ' + data.user + ' joined room: ' + data.stateId);

        socket.join(data.stateId);

        var users = io.sockets.adapter.rooms[data.stateId];
        if (users)
            data.users = Object.keys(users).length;
        else
            data.users = 1;

        socket.broadcast.to(data.stateId).emit('joined', data);

    });

    socket.on('left', function (data) {

        console.log('User: ' + data.user + ' left room: ' + data.stateId);

        socket.leave(data.stateId);

        var users = io.sockets.adapter.rooms[data.stateId];
        if (users)
            data.users = Object.keys(users).length;
        else
            data.users = 1;

        socket.broadcast.to(data.stateId).emit('left', data);

    });

    socket.on('change', function (data) {

        console.log('Change to: ' + data.id + ' in room: ' + data.stateId);

        socket.broadcast.to(data.stateId).emit('change', data);

    });

    socket.on('sync', function (data) {

        console.log('Sync state: ' + data.stateId + ' in room: ' + data.stateId);

        socket.broadcast.to(data.stateId).emit('sync', data);

    });

    socket.on('move', function (data) {

        console.log('Move in room: ' + data.stateId);

        socket.broadcast.to(data.stateId).emit('move', data);

    });

    socket.on('flowOut', function (data) {

        console.log('FlowOut to: ' + data.subStateId);

        socket.leave(data.stateId);
        socket.broadcast.to(data.stateId).emit('flowOut', data);

    });

    socket.on('returnToParent', function (data) {

        console.log('Returning to parent: ' + data.parentStateId);

        socket.leave(data.stateId);
        socket.broadcast.to(data.stateId).emit('returnToParent', data);

    });

    socket.on('getValues', function (data) {

        console.log('Get values for user: ' + data.id + ' in room: ' + data.stateId);

        var targetId = data.owner;

        // If a user isn't specified to get the latest values from then go to the first user in the room
        if (!targetId) {

            var clients = io.nsps['/'].adapter.rooms[data.stateId];
            if (clients) {

                var clientIds = Object.keys(clients);
                if (clientIds.length > 0) {
                    targetId = clientIds[0];
                }

            }

        }

        if (targetId) {
            io.to(targetId).emit('getValues', data);
        }

    });

    socket.on('setValues', function (data) {

        console.log('Set values for user: ' + data.id + ' in room: ' + data.stateId);

        io.to(data.id).emit('setValues', data);

    });

    socket.on('syncFeed', function(data) {

        console.log('Sync Feed in room: ' + data.stateId);

        socket.broadcast.to(data.stateId).emit('syncFeed', data);

    });

});
