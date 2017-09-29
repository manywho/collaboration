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

    const execute = (handler, data, ack) => {
        if (socket.isAuthenticated) {
            handler(data);
            if (ack)
                ack();
        }
    };

    const join = data => {
        console.log('User: ' + data.user + ' joined room: ' + data.stateId);
        
        socket.join(data.stateId);

        const users = socket.adapter.rooms[data.stateId];
        if (users)
            data.users = Object.keys(users).length;
        else
            data.users = 1;

        socket.broadcast.to(data.stateId).emit('joined', data);
    }

    const left = data => {
        console.log('User: ' + data.user + ' left room: ' + data.stateId);

        const users = socket.adapter.rooms[data.stateId];
        if (users)
            data.users = Object.keys(users).length - 1;
        else
            data.users = 1;

        socket.leave(data.stateId);
        socket.broadcast.to(data.stateId).emit('left', data);
    };

    const change = data =>  {
        console.log('Change to: ' + data.id + ' in room: ' + data.stateId);
        socket.broadcast.to(data.stateId).emit('change', data);
    };

    const sync = data => {
        console.log('Sync state: ' + data.stateId + ' in room: ' + data.stateId);
        socket.broadcast.to(data.stateId).emit('sync', data);
    };

    const move = data => {
        console.log('Move in room: ' + data.stateId);
        socket.broadcast.to(data.stateId).emit('move', data);
    };

    const done = data => {
        console.log('Done in room: ' + data.stateId);
        socket.broadcast.to(data.stateId).emit('done', data);
    };

    const flowOut = data => {
        console.log('FlowOut to: ' + data.subStateId);
        
        socket.leave(data.stateId);
        socket.broadcast.to(data.stateId).emit('flowOut', data);
    };

    const returnToParent = data => {
        console.log('Returning to parent: ' + data.parentStateId);
        
        socket.leave(data.stateId);
        socket.broadcast.to(data.stateId).emit('returnToParent', data);
    };

    const getValues = data => {
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
    };

    const setValues = data => {
        console.log('Set values for user: ' + data.id + ' in room: ' + data.stateId);
        socket.broadcast.to(data.id).emit('setValues', data);
    };

    const syncFeed = data => {
        console.log('Sync Feed in room: ' + data.stateId);
        socket.broadcast.to(data.stateId).emit('syncFeed', data);
    };

    socket.on('join', (data, ack) => execute(join, data, ack));
    socket.on('left', (data, ack) => execute(left, data, ack));
    socket.on('change', (data, ack) => execute(change, data, ack));
    socket.on('sync', (data, ack) => execute(sync, data, ack));
    socket.on('move', (data, ack) => execute(move, data, ack));
    socket.on('done', (data, ack) => execute(done, data, ack));
    socket.on('flowOut', (data, ack) => execute(flowOut, data, ack));
    socket.on('returnToParent', (data, ack) => execute(returnToParent, data, ack));
    socket.on('getValues', (data, ack) => execute(getValues, data, ack));
    socket.on('setValues', (data, ack) => execute(setValues, data, ack));
    socket.on('syncFeed', (data, ack) => execute(syncFeed, data, ack));
}