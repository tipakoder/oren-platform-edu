const { Class } = require("../main/db/models");
const ApiError = require("../main/error/apiError");
const { verifyToken } = require("./account");


const getAllClass = async (req) => {
  const account = verifyToken(req);
  console.log(`Account ${account.id} get all class`);
  let allClass = await Class.findAll(); 
  let sendArray = [];
  allClass.forEach(el => {
    sendArray.push({
      id: el.id,
      char: el.char,
      act: el.act
    });
  }); 
  return { classes: sendArray }
}

const setClass = async (req) => {
  let char = req.query.char;
  if(typeof char === "undefined") {
    throw new ApiError(400, `Char value undefined`);
  }
  else if (char.length > 1) {
    throw new ApiError(400, `More than 1 character`);
  }
  let act = req.query.act;
  if(typeof act === "undefined") {
    throw new ApiError(400, `Act value undefined`);
  }
  if(
    await Class.findOne({ where: {char, act}})
  ) {
    throw new ApiError(400, `Class already exists!`)
  }
  let newClass = await Class.create({
    char: char,
    act: act
  });
  return {
    class: {
      id: newClass.id,
      char: newClass.char,
      act: newClass.act
    }
  }
}

module.exports = {
  getAllClass,
  setClass
}