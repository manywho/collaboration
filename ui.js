const request = require('request');

module.exports = function (socket, url, authenticate) {
    
    socket.isAuthenticated = !authenticate;

    if (authenticate)
        socket.on('authentication', data => {
            const options = {
                uri: `${url}/api/run/1/authorization/${data.stateId}`,
                headers: {
                    authorization: data.authorization,
                    manywhoTenant: data.tenantId
                }
            };
            request(options, (err, res, body) => {            
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    socket.emit('authenticated', res);
                    socket.isAuthenticated = true;
                    setupHandlers(socket);
                }
                else
                    socket.emit('unauthorized', null, () => socket.disconnect());
            });
        });
    else
        setupHandlers(socket);
};

const setupHandlers = function(socket) {

    const isAuthenticated = (handler) => {
        if (socket.isAuthenticated)
            return handler
        else
            return null;
    }

    socket.on('join', isAuthenticated(function (data) {
        console.log('User: ' + data.user + ' joined room: ' + data.stateId);

        socket.join(data.stateId);

        const users = socket.adapter.rooms[data.stateId];
        if (users)
            data.users = Object.keys(users).length;
        else
            data.users = 1;

        socket.broadcast.to(data.stateId).emit('joined', data);
    }));

    socket.on('left', isAuthenticated(function (data) {
        console.log('User: ' + data.user + ' left room: ' + data.stateId);

        const users = socket.adapter.rooms[data.stateId];
        if (users)
            data.users = Object.keys(users).length - 1;
        else
            data.users = 1;

        socket.leave(data.stateId);
        socket.broadcast.to(data.stateId).emit('left', data);
    }));

    socket.on('change', isAuthenticated(function (data) {
        console.log('Change to: ' + data.id + ' in room: ' + data.stateId);
        socket.broadcast.to(data.stateId).emit('change', data);
    }));

    socket.on('sync', isAuthenticated(function (data) {
        console.log('Sync state: ' + data.stateId + ' in room: ' + data.stateId);
        socket.broadcast.to(data.stateId).emit('sync', data);
    }));

    socket.on('move', isAuthenticated(function (data) {
        console.log('Move in room: ' + data.stateId);
        socket.broadcast.to(data.stateId).emit('move', data);
    }));

    socket.on('done', isAuthenticated(function(data) {
        console.log('Done in room: ' + data.stateId);
        socket.broadcast.to(data.stateId).emit('done', data);
    }));

    socket.on('flowOut', isAuthenticated(function (data) {
        console.log('FlowOut to: ' + data.subStateId);

        socket.leave(data.stateId);
        socket.broadcast.to(data.stateId).emit('flowOut', data);
    }));

    socket.on('returnToParent', isAuthenticated(function (data) {
        console.log('Returning to parent: ' + data.parentStateId);

        socket.leave(data.stateId);
        socket.broadcast.to(data.stateId).emit('returnToParent', data);
    }));

    socket.on('getValues', isAuthenticated(function (data) {
        console.log('Get values for user: ' + data.id + ' in room: ' + data.stateId);

        let targetId = data.owner;

        // If a user isn't specified to get the latest values from then go to the first user in the room
        if (!targetId) {
            const clients = socket.adapter.rooms[data.stateId];
            if (clients) {
                const clientIds = Object.keys(clients);
                if (clientIds.length > 0)
                    targetId = clientIds[0];
            }
        }

        if (targetId)
            socket.broadcast.to(targetId).emit('getValues', data);
    }));

    socket.on('setValues', isAuthenticated(function (data) {
        console.log('Set values for user: ' + data.id + ' in room: ' + data.stateId);
        socket.broadcast.to(data.id).emit('setValues', data);
    }));

    socket.on('syncFeed', isAuthenticated(function(data) {
        console.log('Sync Feed in room: ' + data.stateId);
        socket.broadcast.to(data.stateId).emit('syncFeed', data);
    }));

    socket.on('cursor', isAuthenticated(function(data) {
        console.log('Cursor: ' + data.x + ' ' + data.y);
        socket.broadcast.to(data.stateId).emit('cursor', data);
    }));
}