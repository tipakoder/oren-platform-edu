const { Charter } = require("../main/db/models");
const ApiError = require("../main/error/apiError");
const { verifyToken } = require("./account");


const getAllCharter = async (req) => {
  
  const account = await verifyToken(req);

  
  console.log((new Date)+`: Account ${account.id} get all charter`);
  
  
  let allCharter = await Charter.findAll(); 
  let sendArray = [];
  allCharter.forEach(el => {
    sendArray.push({
      id: el.id,
      name: el.name,
      rank_number_max: el.rank_number_max,
      progress_max: el.progress_max
    });
  }); 
  
  return { 
    charters: sendArray 
  }
}

const setCharter = async (req) => {

  const account = await verifyToken(req);
  if(account.role !== "admin" | account.role !== "teacher") {
    throw new ApiError(403, `You are not eligible for this action`);
  }

  let name = req.query.name;
  let rank_number_max = req.query.rank_number_max;
  let progress_max = req.query.progress_max;

  if(typeof name === "undefined") {
    throw new ApiError(400, `Name value undefined`);
  } 
  else if(
    await Charter.findOne({ where: {name}})
  ) {
    throw new ApiError(400, `Charter already exists!`);
  }
  if(typeof rank_number_max === "undefined") {
    throw new ApiError(400, `Rank number max value undefined`);
  }
  if(typeof progress_max === "undefined") {
    throw new ApiError(400, `Progress max value undefined`);
  }

  
  console.log((new Date(Date.now())), `: Account ${account.id} set charter`);
  
  
  let newCharter = await Charter.create({
    name: name,
    rank_number_max: rank_number_max,
    progress_max: progress_max
  })
  
  return { 
    charter: {
      id: newCharter.id,
      name: newCharter.name,
      rank_number_max: newCharter.rank_number_max,
      progress_max: newCharter.progress_max
    }
  }
}

module.exports = {
  getAllCharter,
  setCharter
}