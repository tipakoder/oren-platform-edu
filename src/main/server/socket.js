const http = require('http');
const cors = require("cors");
const colors = require("colors");
const express = require('express');
const { Server } = require("socket.io");
const ApiError = require("../error/apiError");

const {verifyToken} = require("../../app/account");

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
            try{
                let req = socket.handshake;
                let account = verifyToken(req);

                const theme_id = req.query.theme_id;

                if(typeof theme_id === "undefined") {
                    throw new ApiError(404, "Theme id invalid");
                }

                socket.on("comment new", (msg) => {
                    let text = msg.text;
                    if(typeof text === "undefined")
                        throw new ApiError(404, "Text is undefined");
                    this.#io.to(theme_id).emit("comment new", {text});
                });

                socket.join(theme_id);
            } catch (e) {
                let errorDetails = e.toString();
                if (e.getJson())
                    errorDetails = e.getJson();

                socket.emit("error", errorDetails);
                socket.disconnect();
            }
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