const { Theme } = require("../main/db/models");
const ApiError = require("../main/error/apiError");
const { verifyToken } = require("./account");

const getAllTheme = async (req) => {
  let account = await verifyToken(req);
  let themes = await Theme.findAll();
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

  let themes = await Theme.findAll({ where: { moduleId: module_id } });
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

module.exports = {
  getAllTheme,
  getThemesModule,
  setTheme
}