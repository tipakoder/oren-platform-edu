const { Question, ThemePostQuestion, ResponseQuestion, Theme, QuestionAddition, ThemeQuestion } = require("../main/db/models");
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
  for (let i = 0; i < allQuestion.length; i++) {
    const el = allQuestion[i];
    let themeQuestionArray = []
    let themePostQuestions = await ThemePostQuestion.findAll({
      where: {
        question_id: el.id 
      }
    });
    themePostQuestions.forEach(theme => {
      themeQuestionArray.push({
        theme_id: theme.theme_id,
        is_milestone: theme.is_milestone
      });
    });

    let responses = []
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
    });
    sendArray.push({
      id: el.id,
      name: el.name,
      description: el.description,
      theme_ids: themeQuestionArray.length > 0 ? themeQuestionArray : null,
      type: el.type,
      level: el.level,
      cost: el.cost,
      question_addition: {
        images_url: imgUrl.length > 0 ? imgUrl : null
      },
      responses: responses
    });
  }
  allQuestion.forEach(el => {
    
  });

  return { 
    theme_id: theme_id,
    questions: sendArray 
  }
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
    
    // theme array
    let themeQuestionArray = []
    el.theme_post_questions.forEach(theme => {
      themeQuestionArray.push({
        theme_id: theme.theme_id,
        is_milestone: theme.is_milestone
      });
    });

    // responses array
    let responses = []
    el.response_questions.forEach(response => {
      responses.push({
        id: response.id,
        description: response.description
      });
    });
    
    // images url array
    let imgUrl = []
    if(el.question_additions.length > 0) {
      el.question_additions.forEach(el => {
        imgUrl.push(el.media_path);
      });
    }


    sendArray.push({
      id: el.id,
      name: el.name,
      description: el.description,
      theme_ids: themeQuestionArray.length > 0 ? themeQuestionArray : null,
      type: el.type,
      level: el.level,
      cost: el.cost,
      question_addition: {
        images_url: imgUrl.length > 0 ? imgUrl : null
      },
      responses: responses
    });
  });

  return {
    questions: sendArray 
  }
}

const setQuestion = async (req) => {

  let account = await verifyToken(req);

  let description = req.body.description;
  let level = req.body.level;
  let name = req.body.name;
  let type = req.body.type;
  let cost = req.body.cost;
  let theme_ids;
  try {
    theme_ids = JSON.parse(req.body.theme_ids);
  } catch {
    theme_ids = undefined;
  }
  let responses;
  try {
    responses = JSON.parse(req.body.responses);
  } catch {
    responses = undefined;  
  }
  let images;
  try{
    images = JSON.parse(req.body.images);

  } catch {
    images = req.body.images;
  }
  

  if(typeof theme_ids === "undefined") {
    throw new ApiError(400, `Theme ids undefined`);
  }
  if(typeof type === "undefined") {
    throw new ApiError(400, `Type undefined`);
  }
  if(typeof description === "undefined") {
    throw new ApiError(400, `Description undefined`);
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
  if(typeof name === "undefined") {
    throw new ApiError(400, `Name directory undefined`);
  }

  let checkImg = false;
  if(typeof images !== "undefined") {
    checkImg = true
  }


  let imagesDB = []
  if(checkImg && images.length) {
    for (let i = 0; i < images.length; i++) {
      const el = images[i];
      let data = fs.readFileSync(img.path);

      if(!data) {
        throw new ApiError(83, `No data read image file`);
      }

      fs.promises.mkdir(`${resolve(__dirname, "../../")}/public/imageQuestions/${name}`, { recursive: true }).then(() => {
        fs.writeFile(`${resolve(__dirname, "../../")}/public/imageQuestions/${name}/${i+1}.png`, data, {}, (e) => {
          if(e) {
            throw new ApiError(83, `Error write image file`);
          }
          else {          
            imagesDB.push(`/public/imageQuestions/${name}/${i+1}.png`);
          }
        });
      });
    }
  }
  else if(checkImg) {
    let data = fs.readFileSync(images.path);

    if(!data) {
      throw new ApiError(83, `No data read image file`);
    }

    fs.promises.mkdir(`${resolve(__dirname, "../../")}/public/imageQuestions/${name}`, { recursive: true }).then(() => {
      fs.writeFile(`${resolve(__dirname, "../../")}/public/imageQuestions/${name}/${1}.png`, data, {}, (e) => {
        if(e) {
          throw new ApiError(83, `Error write image file`);
        }
        else {          
          imagesDB.push(`/public/imageQuestions/${name}/${1}.png`);
        }
      });
    });
  }
  
  for (let i = 0; i < theme_ids.length; i++) {
    const el = theme_ids[i];
    let themeCheck = await Theme.findOne({ where: { id: el.theme_id }});
    if(!themeCheck) {
      throw new ApiError(500, `The theme is not found`);
    }
  }

  let newQuestion = await Question.create({
    description,
    type,
    level,
    cost
  });

  if(checkImg) {
    for (let i = 0; i < imagesDB.length; i++) {
      const el = imagesDB[i];
      await QuestionAddition.create({
        question_id: newQuestion.id,
        media_path: el
      });
    }
  }

  let arrayTheme = [];
  for (let i = 0; i < theme_ids.length; i++) {
    const el = theme_ids[i];
    let conTheme = await ThemeQuestion.create({
      theme_id: el.theme_id,
      question_id: newQuestion.id,
      is_milestone: el.is_milestone
    });  
    arrayTheme.push({
      theme_id: conTheme.theme_id,
      is_milestone: conTheme.is_milestone
    });
  }


  let sendArrayResponses = []
  for (let i = 0; i < responses.length; i++) {
    const element = responses[i];
    let responseQuestion = await ResponseQuestion.create({
      description: element.description,
      is_current: element.is_current,
      question_id: newQuestion.id
    });
    if(responseQuestion) {
      sendArrayResponses.push({
        id: responseQuestion.id,
        description: responseQuestion.description
      });
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
      responses: sendArrayResponses
    } 
  }
}

module.exports = {
  getAllQuestion,
  setQuestion,
  getQuestionsTheme
}