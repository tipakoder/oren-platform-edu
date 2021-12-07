const { Message, ThemeMessage, Theme, LikeCheck, Account } = require("../main/db/models");
const ApiError = require("../main/error/apiError");
const { verifyToken } = require("./account")

const getMessageTheme = async (req) => {
  let account = await verifyToken(req);

  let theme_id = req.query.theme_id;

  if(typeof theme_id === "undefined") {
    throw new ApiError(400, `Theme id undefined`);
  }

  let messagesTheme = await Message.findAll({
    include: [
      { 
        model: ThemeMessage, 
        where : {
          theme_id: theme_id
        } 
      },
      {
        model: Account, 
        where: {}
      }
    ]
  });

  let sendArray = []

  for (let i = 0; i < messagesTheme.length; i++) {
    const el = messagesTheme[i];
    
    let like_check = await LikeCheck.findAll({
      where: {
        message_id: el.id,
      }
    });
  
    sendArray.push({
      text: el.text,
      author: {
        id: el.account.id,
        nickname: el.account.nickname
      },
      like_count: (like_check.length > 0) ? like_check.length : 0 
    })
  }

  return {
    theme_id: theme_id,
    messages: sendArray
  }
}

const likedMessage = async (req) => {
  let account = await verifyToken(req);
  
  let message_id = req.query.message_id;

  if(typeof message_id === "undefined") {
    throw new ApiError(400, `Message id undefined`);
  }

  if(await LikeCheck.findOne({
    where: {
      message_id: message_id,
      account_id: account.id
    }
  })) {
    await LikeCheck.destroy({
      where:{
        message_id: message_id,
        account_id: account.id
      }
    });
    return { message_id: message_id, liked: false }
  }
  else {
    await LikeCheck.create({
      message_id: message_id,
      account_id: account.id
    });
    return { message_id: message_id, liked: true }
  }
}

const setMessageTheme = async (req) => {
  let account = await verifyToken(req);

  let theme_id = req.query.theme_id;
  let text = req.query.text;

  if(typeof theme_id === "undefined") {
    throw new ApiError(400, `Theme id undefined`);
  }
  if(typeof text === "undefined") {
    throw new ApiError(400, `Text message undefined`);
  }

  let theme = await Theme.findOne({
    where: {
      id: theme_id
    }
  });
  if(!theme) {
    throw new ApiError(400, `Theme undefined`);
  }

  let newMessage = await Message.create({
    text: text,
    author: account.id
  });

  await ThemeMessage.create({
    theme_id: theme.id,
    message_id: newMessage.id
  });

  let like_check = await LikeCheck.findAll({
    where: {
      message_id: newMessage.id
    }
  });
  
  return {
    message: {
      text: newMessage.text,
      theme: {
        id: theme.id,
        name: theme.name
      },
      like_count: like_check.length > 0 ? like_check.length : 0 
    }
  }
}

module.exports = {
  setMessageTheme,
  getMessageTheme,
  likedMessage
}