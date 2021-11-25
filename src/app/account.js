const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ApiError = require("../main/error/apiError");
const Response = require("../main/server/response");
const {Account} = require("../main/db/models");

/**
 * Create session
 * @return {*}
 * @param object
 */
const createSession = (object) => {
    return jwt.sign(object, process.env.JWT_SECRET_KEY, {expiresIn: '24h'});
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
        throw new ApiError(403, "Nickname or email already exists!");
    }

    if(name.length > 120)
        throw new ApiError(403, "Name more 120 symbols");

    if(surname.length > 120)
        throw new ApiError(403, "Surname more 120 symbols");

    if(nickname.length > 120 || nickname.length < 4)
        throw new ApiError(403, "Nickname more 120 or less 4 symbols");

    if(email.length > 120)
        throw new ApiError(403, "Email more 120 symbols");

    if(password.length < 6)
        throw new ApiError(403, "Password less 6 symbols");

    password = bcrypt.hashSync(password, 2);

    let accountCreate = await Account.create(
        {
            name,
            surname,
            nickname,
            email,
            password
        }
    );

    let account = accountCreate.dataValues;
    let token = createSession(account);

    return Response.send(
        {
            id: account.id,
            token
        }
    );
};

/**
 * Auth account
 * @param req
 * @return {Promise<{method: string}>}
 */
const auth = async(req) => {
    return {method: "accountAuth"};
};

/**
 * Verify token
 * @param req
 * @param isVerify
 * @return {Promise<*|{data: {}, type: string}>}
 */
const verifyToken = async(req, isVerify = false) => {
    let token = (req.method.toUpperCase() === "GET") ? req.query.token : req.body.token;
    let verify = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    if(verify) {
        return (isVerify) ? verify : Response.send(verify);
    } else {
        throw ApiError.forbidden();
    }
}

module.exports = {
    registerByCode,
    auth,
    verifyToken
}