const { Question, ThemePostQuestion, ResponseQuestion, Theme, QuestionAddition } = require("../main/db/models");
const Sequelize = require("sequelize");
const { verifyToken } = require("./account");
const ApiError = require("../main/error/apiError");
const fs = require("fs");
const { resolve } = require("path");

const getQuestionsTheme = async (req) => {
  let account = await verifyToken(req);
  let theme_id = req.query.theme_id;
  
  if(typeof theme_id === "undefined") {
    throw new ApiError(400, `Theme id undefined`);
  }

  let allQuestion = await Question.findAll({
    where: {},
    include: [
      { model: QuestionAddition },
      { 
        model: ThemePostQuestion, 
        where: {
          theme_id: theme_id
        } 
      },
      { model: ResponseQuestion, where: {} }
    ]
  });
  
  let sendArray = []
  allQuestion.forEach(el => {
    let themeQuestionArray = []
    el.theme_post_questions.forEach(theme => {
      themeQuestionArray.push({
        theme_id: theme.theme_id,
        is_milestone: theme.is_milestone
      });
    });
    let responses = []
    let currentRes = []
    let imgUrl = []
    if(el.question_additions.length > 0) {
      el.question_additions.forEach(el => {
        imgUrl.push(el.media_path);
      });
    }
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
      id: el.id,
      name: el.name,
      description: el.description,
      theme_id: themeQuestionArray,
      type: el.type,
      level: el.level,
      cost: el.cost,
      question_addition: {
        images_url: imgUrl.length > 0 ? imgUrl : null
      },
      responses: responses,
      current_responses: currentRes
    });
  });

  return { questions: sendArray }
}

const getAllQuestion = async (req) => {
  let account = await verifyToken(req);
  let allQuestion = await Question.findAll({
    where: {},
    include: [
      { model: QuestionAddition },
      { model: ThemePostQuestion, where: {} },
      { model: ResponseQuestion, where: {} }
    ]
  });
  
  let sendArray = []
  allQuestion.forEach(el => {
    let themeQuestionArray = []
    el.theme_post_questions.forEach(theme => {
      themeQuestionArray.push({
        theme_id: theme.theme_id,
        is_milestone: theme.is_milestone
      });
    });
    let responses = []
    let currentRes = []
    let imgUrl = []
    if(el.question_additions.length > 0) {
      el.question_additions.forEach(el => {
        imgUrl.push(el.media_path);
      });
    }
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
      id: el.id,
      name: el.name,
      description: el.description,
      theme_id: themeQuestionArray,
      type: el.type,
      level: el.level,
      cost: el.cost,
      question_addition: {
        images_url: imgUrl.length > 0 ? imgUrl : null
      },
      responses: responses,
      current_responses: currentRes
    });
  });

  return { questions: sendArray }
}

const setQuestion = async (req) => {
  let account = await verifyToken(req);

  let theme_ids = JSON.parse(req.body.theme_ids);
  let is_milestone = req.body.is_milestone;
  let name = req.body.name;
  let description = req.body.description;
  let type = req.body.type;
  let level = req.body.level;
  let cost = req.body.cost;
  let images = req.body.images;
  let responses = JSON.parse(req.body.responses);
  
  if(typeof theme_ids === "undefined") {
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
  let checkImg = false;
  if(typeof images !== "undefined") {
    console.log(images.length);
    checkImg = true
  }

  let imagesDB = []
  if(checkImg) {
    images.forEach(img => {
      // file
      let data = fs.readFileSync(img.path);
      if(!data) {
        throw new ApiError(83, `No data read image file`);
      }
  
      fs.promises.mkdir(`${resolve(__dirname, "../../")}/public/imageQuestions/${name}`, { recursive: true }).then(file => {
        fs.writeFile(`${resolve(__dirname, "../../")}/public/imageQuestions/${name}/${images.indexOf(img)+1}.png`, data, {}, (e) => {
          if(e) {
            throw new ApiError(83, `Error write image file`);
          }
          else {          
            imagesDB.push(`/public/imageQuestions/${name}/${images.indexOf(img)+1}.png`);
          }
        });
      });
    });
  }
  
  theme_ids.forEach(async (el) => {
    let themeCheck = await Theme.findOne({ where: { id: el.theme_id }});
    if(!themeCheck) {
      throw new ApiError(500, `The theme is not found`);
    }
  })

  let newQuestion = await Question.create({
    name,
    description,
    type,
    level,
    cost
  });

  if(checkImg) {
    imagesDB.forEach( async (url) => {
      await QuestionAddition.create({
        question_id: newQuestion.id,
        media_path: url
      });
    });
  }

  let arrayTheme = [];
  theme_ids.forEach( async (el) => {
    let conTheme = await ThemePostQuestion.create({
      theme_id: el.theme_id,
      question_id: newQuestion.id,
      is_milestone: el.is_milestone
    });  
    arrayTheme.push({
      theme_id: conTheme.theme_id,
      is_milestone: conTheme.is_milestone
    });
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
        id: responseQuestion.id,
        description: responseQuestion.description
      });
      if(responseQuestion.is_current) {
        sendCurrentResponses.push({
          id: responseQuestion.id,
          description: responseQuestion.description
        });
      }
    }
  }

  return { 
    question: {
      id: newQuestion.id,
      description: newQuestion.description,
      theme_ids: arrayTheme,
      type: newQuestion.type,
      level: newQuestion.level,
      cost: newQuestion.cost,
      question_addition: {
        images_url: checkImg ? imagesDB : null
      },
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