const { Role } = require("../main/db/models");
const ApiError = require("../main/error/apiError");
const { verifyToken } = require("./account");


const getAllRole = async (req) => {
  const account = await verifyToken(req);
  console.log(`Account ${account.id} get all role`);
  let allRole = await Role.findAll(); 
  let sendArray = [];
  allRole.forEach(el => {
    sendArray.push({
      id: el.id,
      name: el.name
    });
  }); 
  return { roles: sendArray }
}

const setRole = async (req) => {
  let name = req.query.name
  if(typeof name === "undefined") {
    throw new ApiError(400, `Name value undefined`)
  }
  const account = await verifyToken(req);
  console.log((new Date(Date.now())), `: Account ${account.id} set charter`);
  let newRole = await Role.create({
    name: name
  });
  return {
    role: {
      id: newRole.id,
      name: newRole.name
    }
  }
}

module.exports = {
  getAllRole,
  setRole
}