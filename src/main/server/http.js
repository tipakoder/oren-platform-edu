const fs = require("fs");
const os = require("os");
const path = require("path");
const cors = require("cors");
const colors = require("colors");
const morgan = require('morgan');
const express = require("express");
const Response = require("./response");
const bodyParser = require("body-parser");
const expressFormData = require("express-form-data");

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

        this.#app.use(cors());
        this.#app.use(morgan("dev"));
        this.#app.use(bodyParser.json())
        this.#app.use(bodyParser.urlencoded({ extended: true }));

        this.#app.use(expressFormData.parse(
            {
                uploadDir: os.tmpdir(),
                autoClean: true
            }
        ));

        this.#app.use(expressFormData.format());
        this.#app.use(expressFormData.stream());
        this.#app.use(expressFormData.union());

        global.publicDirectory = path.join(global.rootDirectoryStart, "public");

        if(!fs.existsSync(global.publicDirectory))
            fs.mkdirSync(global.publicDirectory);

        this.#app.use("/public", express.static(global.publicDirectory));

        this.#app.use("/:module/:action", async(req, res, next) => {
            return await this.routing(req, res, next);
        });

        this.#app.use((req, res) => {
            res.status(404).json({type: "error", code: 404, message: "Incorrect request"}).end();
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
                    if(e["getJson"]) {
                        let errorJson = e.getJson();
                        return res.status(errorJson.code).json(errorJson).end();
                    }

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