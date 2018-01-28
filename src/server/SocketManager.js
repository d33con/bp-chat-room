const io = require("./index.js").io;

const { VERIFY_USER, USER_CONNECTED, LOGOUT } = require("../Events");

const { createUser, createMessage, createChat } = require("../Factories");

let connectedUsers = {};

module.exports = function(socket) {
  console.log(`Socket ID: ${socket.id}`);

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
    io.emit(USER_CONNECTED, connectedUsers);
    console.log(connectedUsers);
  });
};

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
