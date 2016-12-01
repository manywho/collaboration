ManyWho Collaboration Server
============================

[![Build Status](https://travis-ci.org/manywho/ManyWho_Collaboration_Server.svg)](https://travis-ci.org/manywho/ManyWho_Collaboration_Server)

This project is a lightweight Node.js server that enables realtime collaboration for Flows running on the ManyWho
Platform. It's built using [socket.io](http://socket.io/) and uses Websockets for bi-directional communication and 
synchronization.

## Running

The server is written using Node.js and socket.io, so it's a doddle to get running.

### Locally

#### Requirements

* Node.js 4+
* npm

To get the server up and running locally, follow these steps:

1. Install all the dependencies

````bash
$ npm install
````

2. Run the server, optionally supplying a location for Redis if you want to support multiple instances running

````bash
$ node server.js (--redis-host=<hostname> --redis-port=<port>)
````

3. The server should now be running on `0.0.0.0:4444`

## Contributing

Contributions are welcome to the project - whether they are feature requests, improvements or bug fixes! Refer to 
[CONTRIBUTING.md](CONTRIBUTING.md) for our contribution requirements.

## License

This project is released under the [MIT License](https://opensource.org/licenses/MIT).