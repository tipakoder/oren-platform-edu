// Link .env variables
require("dotenv").config();

// Set root directory constant
global.rootDirectory = __dirname;
// Database global variable initialization
global.dbConnection = require("./main/db/connection");
global.dbModels = require("./main/db/models");

// Sync database
if(process.argv.indexOf("--sync") !== -1) {
    global.dbConnection.sync({force: true}).then(async() => {
        await global.dbModels.Role.create({name: "user"});
        await global.dbModels.Role.create({name: "teacher"});
        await global.dbModels.Role.create({name: "admin"});
    }).then(() => {
        global.dbModels.Account.create({name: "Герман", surname: "Парасовченко", nickname: "german", email: "admin@dolbaeb.oksei.ru", password: require("bcrypt").hashSync("сосичлен228", 2), roleId: 1}).then(() => {
            global.dbConnection.close();
        });
    });
    return true;
}