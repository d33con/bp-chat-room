const io = require("./index.js").io;

const {
  VERIFY_USER,
  USER_CONNECTED,
  USER_DISCONNECTED,
  COMMUNITY_CHAT,
  LOGOUT,
  MESSAGE_RECEIVED,
  MESSAGE_SENT,
  TYPING
} = require("../Events");

const { createUser, createMessage, createChat } = require("../Factories");

let connectedUsers = {};

let communityChat = createChat();

module.exports = function(socket) {
  let sendMessageToChatFromUser;
  let sendTypingFromUser;

  // verify username
  socket.on(VERIFY_USER, (nickname, callback) => {
    if (isUser(connectedUsers, nickname)) {
      callback({ isUser: true, user: null });
    } else {
      callback({ isUser: false, user: createUser({ name: nickname }) });
    }
  });

  // user connects with username
  socket.on(USER_CONNECTED, user => {
    connectedUsers = addUser(connectedUsers, user);
    socket.user = user;
    sendMessageToChatFromUser = sendMessageToChat(user.name);
    sendTypingFromUser = sendTypingToChat(user.name);
    io.emit(USER_CONNECTED, connectedUsers);
  });

  // user disconnects
  socket.on("disconnect", () => {
    if ("user" in socket) {
      connectedUsers = removeUser(connectedUsers, socket.user.name);
      io.emit(USER_DISCONNECTED, connectedUsers);
    }
  });

  // user logs out
  socket.on(LOGOUT, () => {
    connectedUsers = removeUser(connectedUsers, socket.user.name);
    io.emit(USER_DISCONNECTED, connectedUsers);
  });

  // get Community chat
  socket.on(COMMUNITY_CHAT, callback => {
    callback(communityChat);
  });

  // user sends message
  socket.on(MESSAGE_SENT, ({ chatId, message }) => {
    sendMessageToChatFromUser(chatId, message);
  });

  // user is typing
  socket.on(TYPING, ({ chatId, isTyping }) => {
    sendTypingFromUser(chatId, isTyping);
  });
};

/*
returns a function that will take a chat id and boolean isTyping
then emit a broadcast to the chat id that a user is typing
param sender: STring username of sender
return function(chatId, message)
*/

function sendTypingToChat(user) {
  return (chatId, isTyping) => {
    io.emit(`${TYPING}-${chatId}`, { user, isTyping });
  };
}

/*
returns a function that will take a chat id and message
and emit a broadcast to the chat id
param sender: String username of sender
return function(chatId, message)
*/
function sendMessageToChat(sender) {
  return (chatId, message) => {
    io.emit(
      `${MESSAGE_RECEIVED}-${chatId}`,
      createMessage({ sender, message })
    );
  };
}

/* 
adds user to list passed in
param userList: object with key value pairs of Users
param username: {Object} user to be added
return userList: object with key value pairs of Users
*/
function addUser(userList, user) {
  let newList = Object.assign({}, userList);
  newList[user.name] = user;
  return newList;
}

/* 
removes user from list passed in
param userList: object with key value pairs of Users
param username: string name of user to be removed
return userList: object with key value pairs of Users
*/
function removeUser(userList, username) {
  let newList = Object.assign({}, userList);
  delete newList[username];
  return newList;
}

/* 
checks if user is in list passed in
param userList: object with key value pairs of Users
param username: string
return userList: object with key value pairs of Users
*/
function isUser(userList, username) {
  return username in userList;
}
