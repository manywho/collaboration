const app = require('http').createServer((req, res) => {});
const io = require('socket.io')(app);
const ui = require('./ui.js');

let extraStartupMessage = '';
let port = null;
let host = null;
let url = null;

process.argv.forEach(value => {
    const argument = value.split('=');

    switch (argument[0].toUpperCase()) {
        case '--REDIS-HOST':
            host = argument[1];
            break;

        case '--REDIS-PORT':
            port = argument[1];
            break;

        case '--URL':
            url = argument[1];
            break;
    }
});

if (port && host) {
    const adapter = require('socket.io-redis');
    const ioredis = require('ioredis');

    const pub = new ioredis({
        sentinels: [{ host: host, port: port }],
        name: 'manywho'
    });

    const sub = new ioredis({
        sentinels: [{ host: host, port: port }],
        name: 'manywho'
    });

    io.adapter(adapter({
        pubClient: pub,
        subClient: sub,
        subEvent: 'messageBuffer',
        key: 'collaboration:'
    }));

    extraStartupMessage += ' and connected to Redis at ' + host + ':' + port;
}

io.of('/').on('connection', socket => ui(socket, url, false, io));
io.of('/ui').on('connection', socket => ui(socket, url, true, io));

app.listen(4444, '0.0.0.0');
console.log('Collaboration server listening on 4444' + extraStartupMessage);
