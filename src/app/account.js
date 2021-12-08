const bcrypt = require("bcrypt");
const ApiError = require("../main/error/apiError");
const Response = require("../main/server/response");
const {Account, AccountSession} = require("../main/db/models");

/**
 * Create session
 * @return {*}
 * @param object
 */
const createSession = (account_id) => {
    let token = bcrypt.hashSync(`${account_id}.${Date.now()}`, 2);

    AccountSession.create(
        {
            account_id,
            token
        }
    );

    return token;
}

/**
 * Generation random password
 * @param length
 * @return {string}
 */
const generationPassword = (length = 6) => {
    const symbols = "abcdefghijklmnopqrstuvwxyz1234567890@*&^%$#!()+_-:.<>,";
    let password = "";
    for(let i = 0; i < length; i++) {
        let randSymbol = Math.floor(Math.random() * symbols.length);
        password += symbols[randSymbol];
    }
    return password;
}

/**
 * Registration account by code
 * @param req
 * @return {Promise<{data: {}, type: string}>}
 */
const registerByCode = async(req) => {
    let name = req.query.name;
    let surname = req.query.surname;
    let nickname = req.query.nickname;
    let email = req.query.email;
    let password = req.query.password;
    let code = req.query.code;

    // Check code
    if(process.env.REGISTRATION_CODE !== code) {
        throw new ApiError(403, "Code invalid");
    }

    // Check accounts with repeat nickname and email
    if(
        await Account.findOne({where: {nickname}}) ||
        await Account.findOne({where: {email}})
    ) {
        throw new ApiError(400, "Nickname or email already exists!");
    }

    if(name.length > 120)
        throw new ApiError(400, "Name more 120 symbols");

    if(surname.length > 120)
        throw new ApiError(400, "Surname more 120 symbols");

    if(nickname.length > 120 || nickname.length < 4)
        throw new ApiError(400, "Nickname more 120 or less 4 symbols");

    if(email.length > 120)
        throw new ApiError(400, "Email more 120 symbols");

    if(password.length < 6)
        throw new ApiError(400, "Password less 6 symbols");

    password = bcrypt.hashSync(password, 2);

    let accountCreate = await Account.create(
        {
            name,
            surname,
            nickname,
            email,
            password,
            role: "admin"
        }
    );

    let account = accountCreate.dataValues;
    let token = createSession(account.id);

    return {
        id: account.id,
        token
    };
};

/**
 * Auth account
 * @param req
 * @return {Promise<{id, token: *}>}
 */
const auth = async(req) => {
    let emailOrNickname = req.query.login;
    let password = req.query.password;
    
    if(typeof emailOrNickname === "undefined") {
        throw new ApiError(400, `Login or email undefined`);
    }
    if(typeof password === "undefined") {
        throw new ApiError(400, `Password undefined`);
    }

    let accountByLogin;
    if(!(accountByLogin = await Account.findOne({where: {email: emailOrNickname}}))) {
        if(!(accountByLogin = await Account.findOne({where: {nickname: emailOrNickname}}))) {
            throw new ApiError(400, "Nickname or email not find!");
        }
    }

    let passwordCheck = bcrypt.compareSync(password, accountByLogin.dataValues.password);

    if(!passwordCheck) {
        throw new ApiError(403, "Password incorrect!");
    }

    let token = createSession(accountByLogin.dataValues.id);

    return {
        id: accountByLogin.dataValues.id,
        token
    };
};

/**
 * Verify token
 * @param req
 * @return {Promise<*|{data: {}, type: string}>}
 */
const verifyToken = async(req) => {
    if(!req.headers.token)
        throw new ApiError(403, "Token invalid");

    let token = req.headers.token;
    let verify;
    if(!(verify = await Account.findOne(
        {
            include: {
                model: AccountSession,
                where: {
                    token
                }
            }
        }
    ))) {
        throw ApiError.forbidden();
    }

    return verify.dataValues;
}

/**
 * Generation accounts for students
 * @param req
 * @return {Promise<void>}
 */
const generationStudents = async(req) => {
    let adminAccount = await verifyToken(req);

    // If not admin
    if(adminAccount.role !== "admin") {
        throw ApiError.forbidden();
    }

    let listStudents = JSON.parse(req.body.listStudents);
    let studentsInDB = [];
    let resultStudents = [];
    for(let student of listStudents) {
        let nickname = /(.+)@(\w+)\.(\w+)/.exec(student.email)[1];
        let password = generationPassword();

        // In insert db
        studentsInDB.push(
            {
                name: student.name,
                surname: student.surname,
                nickname: nickname,
                email: student.email,
                password: bcrypt.hashSync(password, 2),
            }
        );

        // In out response
        resultStudents.push(
            {
                name: student.name,
                surname: student.surname,
                nickname: nickname,
                email: student.email,
                password: password
            }
        );
    }

    Account.bulkCreate(studentsInDB);

    return {
        students: resultStudents
    }
}

module.exports = {
    registerByCode,
    auth,
    verifyToken,
    generationStudents
}