const fs = require("fs");
const path = require("path");
const colors = require("colors");
const express = require("express");
const Response = require("./response");

class HttpServer {
    #host;
    #port;
    #app;

    /**
     * Constructor
     * @param host
     * @param port
     */
    constructor(host = '127.0.0.1', port = 8181) {
        this.#host = host;
        this.#port = port;

        this.#app = express();

        this.#app.use("/:module/:action", async(req, res, next) => {
            return await this.routing(req, res, next);
        });

        this.#app.use((req, res) => {
            res.json({type: "error", code: 404, message: "Incorrect request"}).end();
        });
    }

    /**
     * Routing of methods
     * @param req
     * @param res
     * @param next
     */
    async routing(req, res, next) {
        let moduleName = req.params.module;
        let actionName = req.params.action;
        let modulePath = path.join(global.rootDirectory, "app", `${moduleName}.js`);

        if(fs.existsSync(modulePath)) {
            let module = require(modulePath);

            if(module[actionName]) {
                try {
                    return res.json(Response.send(await module[actionName](req))).end();
                } catch (e) {
                    if(e["getJson"])
                        return res.json(e.getJson()).end();

                    return res.end(e.toString());
                }
            }
        }

        next();
    }

    /**
     * Start express server
     */
    start() {
        this.#app.listen(this.#port, this.#host, () => {
            console.log(colors.green("> HTTP SERVER COPY STARTED"), colors.bgYellow(`(pid: ${process.pid})`));
        });
    }
}

module.exports = HttpServer;