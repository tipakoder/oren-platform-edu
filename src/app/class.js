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

    let allClass = await Class.findAll();
    let sendArray = [];

    for(let el of allClass){
        sendArray.push({
            id: el.id,
            char: el.char,
            act: getCurrentClassAct(el.act),
            countStudents: await Account.count({where: {class_id: el.id}})
        });
    }

    return { 
      classes: sendArray 
    }
}

const getStudentsByClass = async (req) => {
    const account = await verifyToken(req);

    const class_id = req.query.class_id;
    if(typeof class_id === "undefined")
        throw new ApiError(400, "Class id is undefined");
    if(!(await Class.findOne({where: {id: class_id}})))
        throw new ApiError(400, "Class was not found");

    let studentsClass = await Account.findAll({where: {class_id, role: "student"}});
    let sendArray = [];
    for(let el of studentsClass){
        sendArray.push({
            id: el.id,
            name: el.name,
            surname: el.surname,
            email: el.email,
            nickname: el.nickname
        });
    }

    return {
        class_id,
        students: sendArray
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
    setClass,
    getStudentsByClass
}