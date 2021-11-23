// Link .env variables
require("dotenv").config();

// Set root directory constant
global.rootDirectory = __dirname;
// Database global variable initialization
global.dbConnection = require("./main/db/connection");
global.dbModels = require("./main/db/models");

// Sync database
if(process.argv.indexOf("--sync") !== -1) {
    global.dbConnection.sync({force: true}).then(() => {
        global.dbConnection.close();
    });
    return true;
}