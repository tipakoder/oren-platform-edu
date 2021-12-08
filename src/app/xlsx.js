const ApiError = require("../main/error/apiError");
const { verifyToken } = require("./account");
const XLSX = require("xlsx");
const fs = require("fs");
const { resolve } = require("path");
const { Charter, Module, Theme, Question, ThemeModule, ThemeQuestion, ResponseQuestion } = require("../main/db/models");


const unloadingQuestions = async (req) => {

    let account = await verifyToken(req);
    if(account.role !== "admin") {
        throw new ApiError(403, `Not enough rights`);
    }

    let xlsx_read = req.body.xlsx;
    if(typeof xlsx_read === "undefined") {
        throw new ApiError(400, `XLSX file undefined`);
    }

    fs.promises.mkdir(`${resolve(__dirname, "../../")}/public/xlsx`)
        .catch(e => {
            return;
        });

    let workbook = XLSX.readFile(xlsx_read.path);

    let logError = XLSX.utils.book_new();

    let chartersError = [];
    let moduleError = [];
    let themeError = [];
    let questionError = [];
    let responseOneError = [];

    let worksheets = {};

    for(const sheetName of workbook.SheetNames) {
        worksheets[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }

    for (let i = 0; i < worksheets.Charters.length; i++) {
        const el = worksheets.Charters[i];
        await Charter.create({
            name: el.name,
            rank_number_max: el.rank_number_max,
            progress_max: el.progress_max
        }).catch(e => {
            chartersError.push({
                charter_name: el.name,
                charter_rank_number_max: el.rank_number_max,
                charter_progress_max: el.progress_max,
                error_code: e.original.errno,
                error_message: e.original.sqlMessage
            });
            return;
        });
    }
    for (let i = 0; i < worksheets.Modules.length; i++) {
        const el = worksheets.Modules[i];
        let charter = await Charter.findOne({
            where: {
                name: el.charter_name
            }
        });
        if(charter === null) {
            moduleError.push({
                module_name: el.name,
                module_charter_name: el.charter_name,
                error_code: 404,
                error_message: `Chartert undefined`
            });
            break;
        }
        await Module.create({
            name: el.name,
            charter_id: charter.id,
            time_round: el.time_round
        }).catch(e => {
            moduleError.push({
                module_name: el.name,
                module_charter_name: el.charter_name,
                error_code: e.original.errno,
                error_message: e.original.sqlMessage
            });
            return;
        });
    }

    for (let i = 0; i < worksheets.Themes.length; i++) {
        const el = worksheets.Themes[i];
        let moduleO = await Module.findOne({
            where: {
                name: el.module_name
            }
        });
        if(moduleO === null) {
            themeError.push({
                theme_name: el.name,
                theme_module_name: el.module_name,
                error_code: 404,
                error_message: `Module undefined`
            });
            break;
        }
        let newTheme = await Theme.create({
            name: el.name,
        }).catch(e => {
            themeError.push({
                theme_name: el.name,
                theme_module_name: el.module_name,
                error_code: e.original.errno,
                error_message: e.original.sqlMessage
            });
            return;
        });
        if(moduleO && newTheme) {
            await ThemeModule.create({
                module_id: moduleO.id,
                theme_id: newTheme.id
            });
        }
    }


    // question
    for (let i = 0; i < worksheets.Questions.length; i++) {
        const el = worksheets.Questions[i];
        let themeO = await Theme.findOne({
            where: {
                name: el.theme_name
            }
        });
        if(themeO === null) {
            questionError.push({
                question_description: el.description,
                question_theme_name: el.theme_name,
                question_type: el.type,
                question_lvl: el.lvl,
                question_cost: el.cost,
                error_code: 404,
                error_message: `Theme undefined`
            });
            break;
        }
        let newQuestion = await Question.create({
            description: el.description,
            type: el.type,
            lvl: el.lvl,
            cost: el.cost
        }).catch(e => {
            questionError.push({
                question_description: el.description,
                question_theme_name: el.theme_name,
                question_type: el.type,
                question_lvl: el.lvl,
                question_cost: el.cost,
                error_code: e.original.errno,
                error_message: e.original.sqlMessage
            });
            return;
        });
        if(themeO && newQuestion) {
            await ThemeQuestion.create({
                theme_id: themeO.id,
                question_id: newQuestion.id
            });
        }
    }

    for (let i = 0; i < worksheets.Responses_oneCurrent.length; i++) {
        const el = worksheets.Responses_oneCurrent[i];
        let questionO = await Question.findOne({
            where: {
                description: el.question_description
            }
        });
        if(questionO === null) {
            responseOneError.push({
                res_question_description: el.question_description,
                res_description: el.description,
                res_is_correct: el.is_correct,
                error_code: 404,
                error_message: `Question undefined`
            });
            break;
        }

        let newRes = ResponseQuestion.create({
            description: el.description,
            question_id: questionO.id,
            is_correct: el.is_correct
        }).catch(e => {
            responseOneError.push({
                res_question_description: el.question_description,
                res_description: el.description,
                res_is_correct: el.is_correct,
                error_code: e.original.errno,
                error_message: e.original.sqlMessage
            });
            return;
        });
    }


    if(chartersError.length > 0) {
        let newSheet = XLSX.utils.json_to_sheet(chartersError);
        XLSX.utils.book_append_sheet(logError, newSheet, `Charter_Error`);
    }
    if(moduleError.length > 0) {
        let newSheet = XLSX.utils.json_to_sheet(moduleError);
        XLSX.utils.book_append_sheet(logError, newSheet, `Module_Error`);
    }
    if(themeError.length > 0) {
        let newSheet = XLSX.utils.json_to_sheet(themeError);
        XLSX.utils.book_append_sheet(logError, newSheet, `Theme_Error`);
    }
    if(questionError.length > 0) {
        let newSheet = XLSX.utils.json_to_sheet(questionError);
        XLSX.utils.book_append_sheet(logError, newSheet, `Question_Error`);
    }
    if(responseOneError.length > 0) {
        let newSheet = XLSX.utils.json_to_sheet(responseOneError);
        XLSX.utils.book_append_sheet(logError, newSheet, `Response_One_Error`);
    }

    if(chartersError.length > 0 | moduleError.length > 0 | themeError.length > 0 | questionError.length > 0 | responseOneError.length > 0) {
        XLSX.writeFile(logError, `${resolve(__dirname, "../../")}/public/xlsx/log_error.xlsx`);
    }
    return { tables: worksheets }
}

module.exports = {
    unloadingQuestions
}