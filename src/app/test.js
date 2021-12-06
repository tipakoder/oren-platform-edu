const { Module, Test, ThemeCheckAccount, Theme, ThemeModule, Question, ThemeQuestion, AnswerQuestion, ResponseQuestion, ModuleCheckAccount } = require("../main/db/models");
const ApiError = require("../main/error/apiError");
const { verifyToken } = require("./account")

function shuffle(array) {
  array.sort(() => Math.round(Math.random() * 100) - 50);
}

const startTest = async (req) => {
  let account = await verifyToken(req);

  let module_id = req.query.module_id;
  let lvl = req.query.lvl;
  let start_date = new Date();

  if(typeof module_id === "undefined") {
    throw new ApiError(400, "Module id undefined");
  }
  if(typeof lvl === "undefined") {
    lvl = 1;
  }
  if(!(await Module.findOne({
    where: {
      id: module_id
    }
  }))) {
    throw new ApiError(400, `Module does not exist`);
  }

  if(!(await ModuleCheckAccount.findOne({
    where: {
      module_id: module_id,
      account_id: account.id
    }
  }))) {
    throw new ApiError(403, `No access to the module`);
  }
  let newTest = await Test.create({
    account_id: account.id,
    module_id: module_id,
    start_date: start_date
  });

  let themesTest = await Theme.findAll({
    include: [
      {  
        model: ThemeModule, 
        where: {
          module_id: module_id
        } 
      },
      {
        model: ThemeCheckAccount, 
        where: {
          account_id: account.id
        }
      }
    ]
  });

  let questionArray = [];

  for (let i = 0; i < themesTest.length; i++) {
    const el = themesTest[i];
    let questionsTheme = await Question.findAll({
      where: {
        type: "oneCurrent",
        lvl: lvl
      },
      include: [
        {
          model: ThemeQuestion,
          where: {
            theme_id: el.id
          }
        }
      ]
    });
    if(questionsTheme.length > 1) {
      let questionTest = questionsTheme[Math.floor(Math.random() * questionsTheme.length)];

      let responses = await ResponseQuestion.findAll({
        where: {
          question_id: questionTest.id
        }
      })
      if(responses.length === 0) {
        continue;
      }

      let arrayRes = [];

      let ifs = false
      responses.forEach(element => {
        if(element.is_current && !ifs) {
          arrayRes.push({
            id: element.id,
            description: element.description
          });
          ifs = true;
        }
      });

      if(responses.length < 4) {
        throw new ApiError(404, `Responses no 4 length`);
      }
      for (let i = 0; i < 3; i++) {
        let res = responses[Math.floor(Math.random() * questionsTheme.length)]; 
        arrayRes.push({
          id: res.id,
          description: res.description
        });
      }

      await AnswerQuestion.create({
        account_id: account.id,
        test_id: newTest.id,
        question_id: questionTest.id,
        response_question_id: null
      });

      questionArray.push({
        question_id: questionTest.id,
        question_description: questionTest.description,
        responses: arrayRes
      });
    }
    else if(questionsTheme.length === 1) {

      let responses = await ResponseQuestion.findAll({
        where: {
          question_id: questionsTheme[0].id
        }
      })
      if(responses.length === 0) {
        continue;
      }

      let arrayRes = [];

      let ifs = false;
      responses.forEach(element => {
        if(element.is_current && !ifs) {
          arrayRes.push({
            id: element.id,
            description: element.description
          });
          ifs = true;
        }
      });

      if(responses.length < 4) {
        throw new ApiError(404, `Responses no 4 length`);
      }
      for (let i = 0; i < 3; i++) {
        let res = responses[Math.floor(Math.random() * questionsTheme.length)]; 
        arrayRes.push({
          id: res.id,
          description: res.description
        });
      }

      await AnswerQuestion.create({
        account_id: account.id,
        test_id: newTest.id,
        question_id: questionsTheme[0].id,
        response_question_id: null
      });

      questionArray.push({
        question_id: questionTest.id,
        question_description: questionTest.description,
        responses: arrayRes
      });
    }
  }

  return {
    test: {
      module_id: newTest.module_id,
      start_date: newTest.start_date,
      questions: questionArray
    }
  }
}


module.exports = {
  startTest
}