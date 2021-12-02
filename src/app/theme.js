const { Theme, ThemeCheckAccount, Account } = require("../main/db/models");
const ApiError = require("../main/error/apiError");
const { verifyToken } = require("./account");

const getAllTheme = async (req) => {
  let account = await verifyToken(req);
  let check_account = req.query.check_account;
  
  let themes = null
  if(typeof check_account !== "undefined" && check_account) {
    let checked = await ThemeCheckAccount.findAll({
      where: {
        account_id: account.id
      }
    });
    let whereArray = [];
    checked.forEach(el => {
      whereArray.push(el.theme_id)
    })
    themes = await Theme.findAll({ 
      where: {
        id: whereArray
      }
    });
  }
  else {
    themes = await Theme.findAll();
  }

  let sendArray = []
  themes.forEach(el => {
    sendArray.push({
      id: el.id,
      name: el.name,
      module_id: el.module_id
    });
  });

  return { themes: sendArray }
}

const getThemesModule = async (req) => {
  let account = await verifyToken(req);
  let module_id = req.query.module_id;

  if(typeof module_id === "undefined") {
    throw new ApiError(400, `Module id undefined`);
  }

  let themes = await Theme.findAll({ where: { module_id: module_id } });
  let sendArray = []
  themes.forEach(el => {
    sendArray.push({
      id: el.id,
      name: el.name,
      module_id: el.module_id
    });
  });

  return { 
    module_id: module_id,
    themes: sendArray
  }
}

const setTheme = async (req) => {
  let account = await verifyToken(req);
  let name = req.query.name;
  let module_id = req.query.module_id;

  if(typeof name === "undefined") {
    throw new ApiError(400, `Name undefined`);
  }
  if(typeof module_id === "undefined") {
    throw new ApiError(400, `Module id undefined`);
  }

  let newTheme = await Theme.create({
    name: name,
    module_id: module_id
  });

  return {
    theme: {
      id: newTheme.id,
      name: newTheme.name,
      module_id: newTheme.module_id
    }
  }
}

const getThemesAccount = async (req) => {
  let account = await verifyToken(req);
  let accountThemes = await ThemeCheckAccount.findAll({
    where: {
      account_id: account.id
    }
  });
  let sendArray = [];
  accountThemes.forEach(el => {
    sendArray.push({
      theme_id: el.theme_id
    });
  });
  return { themes: sendArray } 
}

const setAccessTheme = async (req) => {
  let account = await verifyToken(req);
  let theme_id = req.query.theme_id;
  let account_id = req.query.account_id;
  
  if(account.role !== "admin") {
    throw new ApiError(288,`Not enough rights`);
  } 
  if(typeof theme_id === "undefined") {
    throw new ApiError(400, `Theme id undefined`);
  }
  if(typeof account_id === "undefined") {
    throw new ApiError(400, `Account id undefined`);
  }

  if(!(await Theme.findOne({ where: { id: theme_id } }))) {
    throw new ApiError(500, `The theme is not found`);
  }
  if(!(await Account.findOne({ where: { id: account_id } }))) {
    throw new ApiError(500, `The account is not found`);
  }
  if((await ThemeCheckAccount.findOne({ where: { account_id, theme_id }}))) {
    throw new ApiError(409, `Such a connection already exists`);
  }

  let conModule = await ThemeCheckAccount.create({
    theme_id: theme_id,
    account_id: account_id
  });

  return { connectTheme: conModule }
}

module.exports = {
  getAllTheme,
  getThemesModule,
  setTheme,
  getThemesAccount,
  setAccessTheme
}