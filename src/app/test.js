const { Module, Test, ThemeCheckAccount, Theme, ThemeModule, Question, ThemeQuestion, AnswerQuestion, ResponseQuestion, ModuleCheckAccount, AccountLvlCharter, Charter } = require("../main/db/models");
const ApiError = require("../main/error/apiError");
const { verifyToken } = require("./account")

function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}

const startTestModule = async (req) => {
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
        theme_id: null,
        start_date: start_date,
        end_date: null
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
                level: lvl
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
                if(element.is_correct && !ifs) {
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
                if(element.is_correct && !ifs) {
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
            test_id: newTest.id,
            test_lvl: lvl,
            module_id: newTest.module_id,
            start_date: newTest.start_date,
            close: newTest.close,
            questions: questionArray
        }
    }
}

const startTestTheme = async (req) => {
  let account = await verifyToken(req);

  let theme_id = req.query.theme_id;
  let lvl = req.query.lvl;
  let start_date = new Date();
  let question_round = req.query.question_round;
  
  if(typeof theme_id === "undefined") {
    throw new ApiError(400, "Theme id undefined"); 
  }
  if(typeof question_round === "undefined") {
    throw new ApiError(400, "Question round undefined"); 
  }
  if(typeof lvl === "undefined") {
    lvl = 1;
  }
  let theme;
  if(!(theme = await Theme.findOne({
    where: {
        id: theme_id
    }
  }))) {
    throw new ApiError(400, `Theme does not exist`);
  }
  if(!(await ThemeCheckAccount.findOne({
    where: {
        theme_id: theme_id,
        account_id: account.id
    }
  }))) {
    throw new ApiError(403, `No access to the theme`);
  }

  let newTest = await Test.create({
    account_id: account.id,
    module_id: null,
    theme_id: theme_id,
    time_round: theme.time_round,
    start_date: start_date,
    end_date: null
  });

  let questionsTheme = await Question.findAll({
    where: {
      level: lvl,
      type: "oneCurrent"
    },
    include: [
      { 
        model: ThemeQuestion, 
        where: {
          theme_id: theme_id
        }
      }
    ]
  }); 

  let sendQuestion = []

  if(questionsTheme.length > question_round) {
    for (let i = 0; i < question_round; i++) {
      let el = questionsTheme[Math.floor(Math.random() * questionsTheme.length)];
      while(sendQuestion.findIndex(item => item.question_id === el.id) !== -1) {
        el = questionsTheme[Math.floor(Math.random() * questionsTheme.length)];
      }

      let responses = await ResponseQuestion.findAll({
        where: {
          question_id: el.id
        }
      });

      let sendResponses = [];

      for (let y = 0; y < responses.length; y++) {
        let response = responses[y];
        if(response.is_correct) {
          sendResponses.push({
            id: response.id,
            description: response.description
          });
        }
      }

      for (let y = 0; y < 3; y++) {
        let response = responses[Math.floor(Math.random() * questionsTheme.length)];
        while(sendResponses.findIndex(item => item.question_id === response.id) !== -1) {
            response = responses[Math.floor(Math.random() * questionsTheme.length)];
        }
        sendResponses.push({
          id: response.id,
          description: response.description
        });
      }

      sendResponses = shuffle(sendResponses);

      sendQuestion.push({
        question_id: el.id,
        question_description: el.description,
        responses: sendResponses 
      });
    }
  } else {
    const len = questionsTheme.length;
    for (let i = 0; i < len; i++) {
      let el;
      if(questionsTheme.length > 1) {
        questionsTheme = shuffle(questionsTheme);
      }
      el = questionsTheme.pop();

      let responses = await ResponseQuestion.findAll({
        where: {
          question_id: el.id
        }
      });

      let sendResponses = [];

      for (let y = 0; y < responses.length; y++) {
        let response = responses[y];
        if(response.is_correct) {
          sendResponses.push({
            id: response.id,
            description: response.description
          });
          responses = responses.filter(item => item !== response);
        }
      }

      for (let y = 0; y < 3; y++) {
        responses = shuffle(responses);
        let response = responses.pop(); 
        sendResponses.push({
          id: response.id,
          description: response.description
        });
      }

      sendResponses = shuffle(sendResponses);

      await AnswerQuestion.create({
        test_id: newTest.id,
        question_id: el.id,
        response_question_id: null
      });

      sendQuestion.push({
        question_id: el.id,
        question_description: el.description,
        responses: sendResponses 
      });
    }
  }

  return {
    test: {
      test_id: newTest.id,
      test_lvl: lvl,
      theme_id: newTest.theme_id,
      start_date: newTest.start_date,
      time_round: newTest.time_round,
      close: newTest.close,
      questions: sendQuestion
    }
  }
}


const setAnswer = async (req) => {
    let account = await verifyToken(req);

    let test_id = req.query.test_id;
    let question_id = req.query.question_id;
    let response_id = req.query.response_id;

    if(typeof test_id === "undefined") {
        throw new ApiError(400, `Test id undefined`);
    }
    if(typeof question_id === "undefined") {
        throw new ApiError(400, `Question id undefined`);
    }
    if(typeof response_id === "undefined") {
        throw new ApiError(400, `Response id undefined`);
    }

    if(!(await Test.findOne({
        where: {
            account_id: account.id,
            id: test_id
        }
    }))) {
        throw new ApiError(403, `Insufficient rights to modify`);
    }

    let test;
    if(!(test = await Test.findOne({
        where: {
            id: test_id
        }
    }))) {
        throw new ApiError(400, `Test undefined`);
    }
    if((new Date()) > new Date(test.start_date+test.time_round)) {
        throw new ApiError(403, `Time is up`);
    }
    if(test.close) {
        throw new ApiError(403, `Test is closed`);
    }

    if(!(await ResponseQuestion.findOne({
        where: {
            id: response_id,
            question_id: question_id
        }
    }))) {
        throw new ApiError(400, `Response in question undefined`);
    }


    if(!(
        await AnswerQuestion.update(
            {
                response_question_id: response_id
            },
            {
                where: {
                    test_id: test_id,
                    question_id: question_id
                }
            })
    )) {
        throw new ApiError(400, `No update answer`);
    }

    return {
        test_id: test_id,
        question_id: question_id,
        answer: {
            response_id: response_id
        }
    }
}

const closeTest = async (req) => {
  let account = await verifyToken(req);

  let test_id = req.query.test_id;
  let theme_id = req.query.theme_id;

  if(typeof test_id === "undefined") {
      throw new ApiError(400, `Test id undefined`);
  }
  if(typeof theme_id === "undefined") {
    throw new ApiError(400, `Theme id undefined`);
  }
  let test;
  if(!(test = await Test.findOne({
      where: {
          id: test_id,
          account_id: account.id,
      }
  }))) {
      throw new ApiError(400, `Test is undefined`);
  }
  if(test.close) {
    throw new ApiError(400, `Test closed`);
  }

  let preTest = await AnswerQuestion.findAll({
    where: {
      test_id: test_id,
    },
    include: [
      { model: Question, where: {} },
      { model: ResponseQuestion, where: {} }
    ]
  });

  let allExp = 0;
  let correctAnswer = 0;

  for (let i = 0; i < preTest.length; i++) {
    const question = preTest[i].question;
    const response = preTest[i].response_question;

    if(response.is_correct) {
      correctAnswer++;
      allExp += question.level*question.cost;
    }
  }


  await Test.update(
      {
          close: true,
          end_date: (new Date())
      },
      {
        where: {
            account_id: account.id,
            id: test_id,
            theme_id: theme_id
        }
      }
  );

  let checkModule = await Module.findOne({
    include: [
      { 
        model: ThemeModule, 
        where: {
          theme_id: theme_id
        }
      }
    ]
  });

  let checkCharter = await Charter.findOne({
    include: [
      {
        model: Module,
        where: {
          id: checkModule.id
        }
      }
    ]
  });

  let accountLvl = await AccountLvlCharter.findOne({
    where: {
      charter_id: checkCharter.id,
      account_id: account.id
    }
  });

  if(accountLvl.progress_count+allExp >= checkCharter.progress_max) {
    if(accountLvl.rank_count+1 > checkCharter.rank_number_max) {
      await AccountLvlCharter.update(
        {
          progress_count: checkCharter.progress_max,
          rank_count: accountLvl.rank_count
        }, {
          where: {
            id: accountLvl.id
          }
        }
      );
    } else {
      await AccountLvlCharter.update(
        {
          progress_count: accountLvl.progress_count+allExp-checkCharter.progress_max,
          rank_count: accountLvl.rank_count+1
        }, {
          where: {
            id: accountLvl.id
          }
        }
      );
    }
  }
  else {
    await AccountLvlCharter.update(
      {
        progress_count: accountLvl.progress_count+allExp
      }, {
        where: {
          id: accountLvl.id
        }
      }
    );
  }


  return {
    test_id: test_id,
    theme_id: theme_id,
    allExp: allExp,
    correctAnswer: correctAnswer,
    allAnswer: preTest.length,
    close: true,
    charter_id: checkCharter.id
  }
}

module.exports = {
    startTestModule,
    setAnswer,
    closeTest,
    startTestTheme
}