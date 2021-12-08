const http = require('http');
const cors = require("cors");
const colors = require("colors");
const express = require('express');
const { Server } = require("socket.io");

class SocketServer {
    #io;
    #app;
    #port = 8080;
    #server;

    /**
     * Constructor
     * -- initializate all components
     */
    constructor(port = 8080) {
        this.#port;

        this.#app = express();
        this.#server = http.createServer(this.#app);
        this.#io = new Server(this.#server, {
            cors: {
                origin: "http://127.0.0.1:3000",
                credentials: true
            },
            transports: ['websocket']
        });

        this.#io.on('connection', (socket) => {
            socket.emit("comment new",
                {
                    name: "POG U",
                    text: "FUCK U"
                }
            )
        });
    }

    /**
     * Set port
     * @param port
     */
    setPort(port = 8080) {
        this.#port = port;
    }

    /**
     * Start socket server
     */
    start() {
        this.#server.listen(this.#port, () => {
            console.log(colors.green("> SOCKET SERVER COPY STARTED"), colors.bgYellow(`(pid: ${process.pid})`));
        });
    }
}

module.exports = SocketServer;