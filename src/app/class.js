const { Class, Account } = require("../main/db/models");
const ApiError = require("../main/error/apiError");
const { verifyToken } = require("./account");

/**
 * Calculate actuality act for class by year education
 */
const getCurrentClassAct = (act) => {
    let currentDate = new Date(Date.now());
    act = currentDate.getFullYear() - act;

    if(currentDate.getMonth() > 9)
        act += 1;

    return act;
}

const getAllClass = async (req) => {

    const account = await verifyToken(req);


    console.log(`Account ${account.id} get all class`);


    let allClass = await Class.findAll();
    let sendArray = [];
    allClass.forEach(el => {
        sendArray.push({
            id: el.id,
            char: el.char,
            act: getCurrentClassAct(el.act),
            //countStudents: await Account.findAll({where: {classId: el.id}}).length
        });
    });
    
    return { 
      classes: sendArray 
    }
}

const setClass = async (req) => {

  const account = await verifyToken(req);
  if(account.role !== "admin") {
    throw new ApiError(403, `You are not eligible for this action`);
  }

  
  let act = req.query.act;
  let char = req.query.char;

  if(typeof char === "undefined") {
    throw new ApiError(400, `Char value undefined`);
  }
  else if (char.length > 1) {
    throw new ApiError(400, `More than 1 character`);
  }
  if(typeof act === "undefined") {
    throw new ApiError(400, `Act value undefined`);
  }
  
  if(
    await Class.findOne({ where: {char, act}})
  ) {
    throw new ApiError(400, `Class already exists!`)
  }


  console.log((new Date(Date.now())), `: Account ${account.id} set class`);


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