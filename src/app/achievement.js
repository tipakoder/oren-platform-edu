const ApiError = require("../main/error/apiError");
const { verifyToken } = require("./account");
const { Achievement, AccountAchievement } = require("../main/db/models");
const fs = require('fs');
const { resolve } = require("path");

const getAllAchievement = async (req) => {
  
  let account = await verifyToken(req);
  console.log(`Account ${account.id} get all achievement`);
  
  let achievements = await Achievement.findAll();
  let sendArray = []
  
  achievements.forEach(el => {
    sendArray.push({
      id: el.id,
      name: el.name,
      description: el.description,
      design_path: el.design_path
    });
  });
  

  return { achievements: sendArray }
}

const getAccountAchievement = async (req) => {
  let account = await verifyToken(req);

  let charter_id = req.query.charter_id;

  if(typeof charter_id === "undefined") {
    throw new ApiError(400, `Charter id undefined`);
  }

  console.log(`Account ${account.id} get all achievement`);
  
  let achievements = await Achievement.findAll({
    include: [
      {
        model: AccountAchievement,
        where: {
          account_id: account.id,
          charter_id
        }
      }
    ]
  });
  let sendArray = []
  
  achievements.forEach(el => {
    sendArray.push({
      id: el.id,
      name: el.name,
      description: el.description,
      design_path: el.design_path
    });
  });
  

  return { achievements: sendArray }
}

const setAchievement = async (req) => {
  
  let account = await verifyToken(req);
  let name = req.body.name;
  let description = req.body.description;
  let image = req.files.image;
  console.log(`Account ${account.id} set achievement`);
  
  if(typeof name === "undefined") {
    throw new ApiError(400, `Name undefined`);
  }
  if(typeof description === "undefined") {
    throw new ApiError(400, `Description undefined`);
  }
  if(typeof image === "undefined") {
    throw new ApiError(400, `Image undefined`);
  }

  // file
  data = fs.readFileSync(image.path);
  if(!data) {
    throw new ApiError(83, `No data read image file`);
  }
  fs.promises.mkdir(`${resolve(__dirname, "../../")}/public/imageAchievements`, { recursive: true }).then(file => {
    fs.writeFile(`${resolve(__dirname, "../../")}/public/imageAchievements/${name}.png`, data, {}, (e) => {
      if(e) {
        throw new ApiError(83, `Error write image file`);
      }
    });
  });
  let newAchievement = await Achievement.create({
    name: name,
    description: description,
    design_path: `/public/imageAchievements/${name}.png`
  });

  return { 
    achevement: {
      id: newAchievement.id,
      name: newAchievement.name,
      description: newAchievement.description,
      design_path: newAchievement.design_path
    }
  }
}

const setConAchievement = async (req) => {
  let account = await verifyToken(req);
  let charter_id = req.query.charter_id;
  let achievement_id = req.query.achievement_id;

  if(typeof charter_id === "undefined") {
    throw new ApiError(400, `Charter id undefined`);
  }
  if(typeof achievement_id === "undefined") {
    throw new ApiError(400, `Achievement id undefined`);
  }

  let newCon = await AccountAchievement.create({
    charter_id,
    account_id: account.id,
    achievement_id
  });
  return {
    conAchievement: newCon
  }
}

module.exports = {
  getAllAchievement,
  setAchievement,
  setConAchievement,
  getAccountAchievement
}