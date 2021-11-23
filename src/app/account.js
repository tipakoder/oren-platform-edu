const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ApiError = require("../main/error/apiError");
const {Account} = require("../main/db/models");

const createSession = (id, email, role) => {
    return jwt.sign({id, email, role}, process.env.JWT_SECRET_KEY, {expiresIn: '24h'});
}

const create = async(req) => {
    let name = req.query.name;
    let surname = req.query.surname;
    let nickname = req.query.nickname;
    let email = req.query.email;
    let password = req.query.password;

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
    let token = createSession(account.id, account.email, account.role);

    return {
        id: account.id,
        token
    };
};

const auth = async(req) => {
    return {method: "accountAuth"};
};

module.exports = {
    create,
    auth
}