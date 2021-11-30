const { Question, ThemePostQuestion, TypeQuestion, ResponseQuestion } = require("../main/db/models");
const Sequelize = require("sequelize");
const { verifyToken } = require("./account");
const ApiError = require("../main/error/apiError");

const getAllQuestion = async (req) => {
  let account = await verifyToken(req);

  return { questions: [] }
}

const setQuestion = async (req) => {
  let account = await verifyToken(req);

  let theme_id = req.query.theme_id;
  let is_milestone = req.query.is_milestone;
  let name = req.query.name;
  let description = req.query.description;
  let type_id = req.query.type_id;
  let level = req.query.level;
  let cost = req.query.cost;
  let responses = req.query.responses;
  
  if(typeof theme_id === "undefined") {
    throw new ApiError(400, `Theme id undefined`);
  }
  if(typeof is_milestone === "undefined") {
    throw new ApiError(400, `Is milestone undefined`);
  }
  if(typeof name === "undefined") {
    throw new ApiError(400, `Name undefined`);
  }
  if(typeof description === "undefined") {
    throw new ApiError(400, `Description undefined`);
  }
  if(typeof type_id === "undefined") {
    throw new ApiError(400, `Type id undefined`);
  }
  if(typeof level === "undefined") {
    throw new ApiError(400, `Level undefined`);
  }
  if(typeof cost === "undefined") {
    throw new ApiError(400, `Cost undefined`);
  }
  if(typeof responses === "undefined") {
    throw new ApiError(400, `Responses undefined`);
  }

  let newQuestion = await Question.create({
    name,
    description,
    type_id,
    level,
    cost
  });

  let type = await TypeQuestion.findOne({ where: { id: type_id } });

  await ThemePostQuestion.create({
    theme_id,
    question_id: newQuestion.id,
    is_milestone
  });

  responses.forEach(el => {
    await ResponseQuestion.create({
      
    })
  });

  return { 
    question: {
      id: newQuestion.id,
      description: newQuestion.description,
      type: {
        id: type.id,
        name: type.name
      },
      level: newQuestion.level,
      cost: newQuestion.cost
    } 
  }
}

module.exports = {
  getAllQuestion,
  setQuestion
}