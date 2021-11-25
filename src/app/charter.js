const { Charter } = require("../main/db/models");
const { verifyToken } = require("./account");


const getAllCharter = async (req) => {
  const account = verifyToken(req);
  console.log(`Account ${account.id} get all charter`);
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
  return sendArray
}


module.exports = {
  getAllCharter
}