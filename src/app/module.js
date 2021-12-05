const { Module, Account, ModuleCheckAccount } = require("../main/db/models");
const ApiError = require("../main/error/apiError");
const { verifyToken } = require("./account");

export const checkAccount = async (check_account, base, checkBase) => {
  let docs = null
  if(typeof check_account !== "undefined" && check_account) {
    let checked = await checkBase.findAll({
      where: {
        account_id: account.id
      }
    });
    let whereArray = [];
    checked.forEach(el => {
      whereArray.push(el.module_id);
    })
    docs = await base.findAll({ 
      where: {
        id: whereArray
      }
    });
  }
  else {
    docs = await base.findAll();
  }
  
  return docs;
}

const getAllModule = async (req) => {

  let account = await verifyToken(req);

  let check_account = req.query.check_account;
  let modules = await checkAccount(check_account, Module, ModuleCheckAccount);

  let sendArray = [];
  modules.forEach(el => {
    sendArray.push({
      id: el.id,
      name: el.name,
      charter_id: el.charter_id
    });
  });
  return { 
    modules: sendArray 
  }
}

const getModulesCharter = async (req) => {
  
  let account = await verifyToken(req);
  
  let charter_id = req.query.charter_id;
  let check_account = req.query.check_account;
  
  if(typeof charter_id === "undefined") {
    throw new ApiError(400, `Charter id undefined`);
  }

  let modules = await checkAccount(check_account, Module, ModuleCheckAccount);

  let sendArray = [];
  modules.forEach(el => {
    sendArray.push({
      id: el.id,
      name: el.name
    });
  });

  return { 
    charter_id: charter_id,
    modules: sendArray
  }
}

const setModule = async (req) =>{

  let account = await verifyToken(req);
  if(account.role !== "admin") {
    throw new ApiError(403, `You are not eligible for this action`);
  }
  
  let name = req.query.name;
  let charter_id = req.query.charter_id;

  if(typeof name === "undefined") {
    throw new ApiError(400, `Name undefined`);
  }
  if(typeof charter_id === "undefined") {
    throw new ApiError(400, `Charter id undefined`);
  }

  let newModule = await Module.create({
    name: name,
    charter_id: charter_id
  });
  
  return {
    module: {
      id: newModule.id,
      name: newModule.name,
      charter_id: newModule.charter_id
    }
  }
}

const getModulesAccount = async (req) => {
  
  let account = await verifyToken(req);

  let accountModules = await ModuleCheckAccount.findAll({
    where: {
      account_id: account.id
    }
  });

  let sendArray = [];
  accountModules.forEach(el => {
    sendArray.push({
      module_id: el.module_id
    });
  });
  return { 
    modules: sendArray 
  } 
}

const setAccessModule = async (req) => {
  
  let account = await verifyToken(req);
  if(account.role !== "admin") {
    throw new ApiError(288,`Not enough rights`);
  } 
  
  let module_id = req.query.module_id;
  let account_id = req.query.account_id;
  
  if(typeof module_id === "undefined") {
    throw new ApiError(400, `Module id undefined`);
  }
  if(typeof account_id === "undefined") {
    throw new ApiError(400, `Account id undefined`);
  }

  if(!(await Module.findOne({ where: { id: module_id } }))) {
    throw new ApiError(500, `The module is not found`);
  }
  if(!(await Account.findOne({ where: { id: account_id } }))) {
    throw new ApiError(500, `The account is not found`);
  }
  if((await ModuleCheckAccount.findOne({ where: { account_id, module_id }}))) {
    throw new ApiError(409, `Such a connection already exists`);
  }

  let conModule = await ModuleCheckAccount.create({
    module_id: module_id,
    account_id: account_id
  });

  return { 
    connectModule: conModule 
  }
}

module.exports = {
  getAllModule,
  getModulesCharter,
  setModule,
  getModulesAccount,
  setAccessModule
}