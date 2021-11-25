const { Class } = require("../main/db/models");
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
  return sendArray
}


module.exports = {
  getAllClass
}