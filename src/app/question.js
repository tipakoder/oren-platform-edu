const { Question, ThemePostQuestion, TypeQuestion, ResponseQuestion, Theme } = require("../main/db/models");
const Sequelize = require("sequelize");
const { verifyToken } = require("./account");
const ApiError = require("../main/error/apiError");

const getAllQuestion = async (req) => {
  let account = await verifyToken(req);

  return { questions: [] }
}

const setQuestion = async (req) => {
  let account = await verifyToken(req);

  let theme_id = req.body.theme_id;
  let is_milestone = req.body.is_milestone;
  let name = req.body.name;
  let description = req.body.description;
  let type_id = req.body.type_id;
  let level = req.body.level;
  let cost = req.body.cost;
  let responses = JSON.parse(req.body.responses);
  
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

  let themeCheck = await Theme.findOne({ where: { id: theme_id }});
  if(!themeCheck) {
    throw new ApiError(500, `The theme is not found`);
  }
  
  let type = await TypeQuestion.findOne({ where: { id: type_id } });
  if(!type) {
    throw new ApiError(500, `The type is not found`);
  }

  let newQuestion = await Question.create({
    name,
    description,
    type_id,
    level,
    cost
  });

  await ThemePostQuestion.create({
    theme_id,
    question_id: newQuestion.id,
    is_milestone
  });

  let sendArrayResponses = []
  let sendCurrentResponses = []
  responses.forEach(el => {
    let responseQuestion = ResponseQuestion.create({
      description: el.description,
      is_current: el.isTrue
    });
    sendArrayResponses.push({
      id: responseQuestion.id,
      description: responseQuestion.description
    });
    if(el.isTrue) {
      sendCurrentResponses.push({
        id: responseQuestion.id,
        description: responseQuestion.description
      });
    }
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
      cost: newQuestion.cost,
      responses: sendArrayResponses,
      current_res: sendCurrentResponses > 1 ? sendCurrentResponses : sendCurrentResponses[0] 
    } 
  }
}

module.exports = {
  getAllQuestion,
  setQuestion
}