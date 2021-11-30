require("./env");

const test = async() => {
    console.log(global.dbModels.Account)
    console.log(await global.dbModels.Account.findAll({where: {classId: 1}}));
};

test();