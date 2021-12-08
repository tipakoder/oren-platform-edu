require("./env");

let SocketServer = require("./main/server/socket");
let socketServer = new SocketServer();
socketServer.start();