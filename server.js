var app = require('http').createServer(handler)
var io = require('socket.io')(app);

function handler(req, res) {
    
}

app.listen(4444);
console.log('Collaboration server listening on 4444');

io.on('connection', function (socket) {

    socket.on('join', function (data) {

        console.log('User: ' + data.user + ' joined room: ' + data.stateId);
        
        socket.join(data.stateId);
        socket.broadcast.to(data.stateId).emit('joined', data);

    });

    socket.on('left', function (data) {

        console.log('User: ' + data.user + ' left room: ' + data.stateId);

        socket.leave(data.stateId);
        socket.broadcast.to(data.stateId).emit('left', data);

    });

    socket.on('change', function (data) {

        console.log('Change to: ' + data.id + ' in room: ' + data.stateId);

        socket.broadcast.to(data.stateId).emit('change', data);

    });

    socket.on('sync', function (data) {

        console.log('Sync: ' + data.stateId + ' in room: ' + data.stateId);

        socket.broadcast.to(data.stateId).emit('sync', data);

    });

    socket.on('move', function (data) {

        console.log('Move: ' + data.flowstateIdKey + ' in room: ' + data.stateId);

        socket.broadcast.to(data.stateId).emit('move', data);

    });

    socket.on('getValues', function (data) {

        console.log('Get values for socket: ' + data.id + ' in room: ' + data.stateId);

        var targetId = data.owner;

        // If a user isn't specified to get the latest values from then go to the first user in the room
        if (!targetId) {

            var clientIds = Object.keys(io.nsps['/'].adapter.rooms[data.stateId]);
            if (clientIds.length > 1) {

                targetId = clientIds[0];

            }

        }

        io.to(targetId).emit('getValues', data);

    });

    socket.on('setValues', function (data) {

        console.log('Set values for socket: ' + data.id + ' in room: ' + data.stateId);

        io.to(data.id).emit('setValues', data);

    });

});