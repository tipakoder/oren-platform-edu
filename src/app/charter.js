const { Charter } = require("../main/db/models");
const ApiError = require("../main/error/apiError");
const { verifyToken } = require("./account");


const getAllCharter = async (req) => {
  const account = verifyToken(req);
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
  return { charters: sendArray }
}

const setCharter = async (req) => {
  let name = req.query.name;
  if(typeof name === "undefined") {
    throw new ApiError(400, `Name value undefined`);
  } 
  else if(
    await Charter.findOne({ where: {name}})
  ) {
    throw new ApiError(400, `Charter already exists!`);
  }
  let rank_number_max = req.query.rank_number_max;
  if(typeof rank_number_max === "undefined") {
    throw new ApiError(400, `Rank number max value undefined`);
  }
  let progress_max = req.query.progress_max;
  if(typeof progress_max === "undefined") {
    throw new ApiError(400, `Progress max value undefined`);
  }
  const account = verifyToken(req);
  console.log((new Date)+`: Account ${account.id} set charter`);
  let newCharter = await Charter.create({
    name: name,
    rank_number_max: rank_number_max,
    progress_max: progress_max
  })
  return { 
    charter: {
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