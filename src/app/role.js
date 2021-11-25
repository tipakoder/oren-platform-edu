const { Role } = require("../main/db/models");
const { verifyToken } = require("./account");


const getAllRole = async (req) => {
  const account = verifyToken(req);
  console.log(`Account ${account.id} get all role`);
  let allRole = await Role.findAll(); 
  let sendArray = [];
  allRole.forEach(el => {
    sendArray.push({
      id: el.id,
      name: el.name
    });
  }); 
  return sendArray
}


module.exports = {
  getAllRole
}