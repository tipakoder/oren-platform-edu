const { Question, ThemePostQuestion, TypeQuestion, ResponseQuestion, Theme } = require("../main/db/models");
const Sequelize = require("sequelize");
const { verifyToken } = require("./account");
const ApiError = require("../main/error/apiError");

const getQuestionsTheme = async (req) => {
  let account = await verifyToken(req);
  let theme_id = req.query.theme_id;
  if(typeof theme_id === "undefined") {
    throw new ApiError(400, `Theme id undefined`);
  }

  let allQuestion = await Question.findAll({
    include: [
      { 
        model: ThemePostQuestion, 
        where: {
          theme_id: theme_id
        }
      },
      { model: TypeQuestion, where: {} },
      { model: ResponseQuestion, where: {} }
    ]
  });
  
  let sendArray = []
  allQuestion.forEach(el => {
    let themeQuestionArray = []
    el.theme_post_questions.forEach(theme => {
      themeQuestionArray.push({
        theme_id: theme.theme_id,
        question_id: theme.question_id,
        is_milestone: theme.is_milestone
      });
    });
    let responses = []
    let currentRes = []
    el.response_questions.forEach(response => {
      responses.push({
        id: response.id,
        description: response.description
      });
      if(response.is_current) {
        currentRes.push({
          id: response.id,
          description: response.description
        });
      }
    });
    sendArray.push({
      name: el.name,
      description: el.description,
      theme_id: themeQuestionArray,
      type: {
        id: el.type_question.id,
        name: el.type_question.name
      },
      level: el.level,
      cost: el.cost,
      responses: responses,
      current_responses: currentRes
    });
  });

  console.log(allQuestion);

  return { questions: sendArray }
}

const getAllQuestion = async (req) => {
  let account = await verifyToken(req);
  let allQuestion = await Question.findAll({
    include: [
      { model: ThemePostQuestion, where: {} },
      { model: TypeQuestion, where: {} },
      { model: ResponseQuestion, where: {} }
    ]
  });
  
  let sendArray = []
  allQuestion.forEach(el => {
    let themeQuestionArray = []
    el.theme_post_questions.forEach(theme => {
      themeQuestionArray.push({
        theme_id: theme.theme_id,
        question_id: theme.question_id,
        is_milestone: theme.is_milestone
      });
    });
    let responses = []
    let currentRes = []
    el.response_questions.forEach(response => {
      responses.push({
        id: response.id,
        description: response.description
      });
      if(response.is_current) {
        currentRes.push({
          id: response.id,
          description: response.description
        });
      }
    });
    sendArray.push({
      name: el.name,
      description: el.description,
      theme_id: themeQuestionArray,
      type: {
        id: el.type_question.id,
        name: el.type_question.name
      },
      level: el.level,
      cost: el.cost,
      responses: responses,
      current_responses: currentRes
    });
  });

  console.log(allQuestion);

  return { questions: sendArray }
}

const setQuestion = async (req) => {
  let account = await verifyToken(req);

  let theme_id = req.body.theme_id;
  let is_milestone = req.body.is_milestone;
  let name = req.body.name;
  let description = req.body.description;
  let type = req.body.type;
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
  if(typeof type === "undefined") {
    throw new ApiError(400, `Type undefined`);
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

  let newQuestion = await Question.create({
    name,
    description,
    type,
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

  for (let i = 0; i < responses.length; i++) {
    const element = responses[i];
    let responseQuestion = await ResponseQuestion.create({
      description: element.description,
      is_current: element.isTrue,
      question_id: newQuestion.id
    });
    if(responseQuestion) {
      sendArrayResponses.push({
        description: responseQuestion.description,
        question_id: responseQuestion.question_id
      });
      if(responseQuestion.is_current) {
        sendCurrentResponses.push({
          description: responseQuestion.description,
          question_id: responseQuestion.question_id
        });
      }
    }
  }

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
      current_res: sendCurrentResponses > 1 ? sendCurrentResponses : sendCurrentResponses === 0 ? "" : sendCurrentResponses[0]
    } 
  }
}

module.exports = {
  getAllQuestion,
  setQuestion,
  getQuestionsTheme
}