const { Module, Account } = require("../main/db/models");
const ApiError = require("../main/error/apiError");
const { verifyToken } = require("./account");

const getAllModule = async (req) => {
  let account = await verifyToken(req);
  let modules = await Module.findAll();
  let sendArray = [];
  modules.forEach(el => {
    sendArray.push({
      id: el.id,
      name: el.name,
      charter_id: el.charter_id
    });
  });
  return { modules: sendArray }
}

const getModulesCharter = async (req) => {
  let charter_id = req.query.charter_id;
  let account = await verifyToken(req);
  
  if(typeof charter_id === "undefined") {
    throw new ApiError(400, `Charter id undefined`);
  }

  let modules = await Module.findAll({ where: { charterId: charter_id }});
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

module.exports = {
  getAllModule,
  getModulesCharter,
  setModule
}