require("./env");

// If not sync mode
if(process.argv.indexOf("--sync") === -1) {
    const HttpServer = require("./main/server/http");
    const server = new HttpServer(process.env.HOST, process.env.PORT);
    server.start();
}