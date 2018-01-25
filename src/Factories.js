const uuidv4 = require("/uuid/v4");

/*
create a user object
prop id: string
prop name: string
param object {name: string}
*/

const createUser = ({ name = "" } = {}) => ({
  id: uuidv4(),
  name
});

/*
create a message object
prop id: string
prop time: Date (time in 24hr format)
prop message: string
prop sender: string
param object
  message: string
  sender: string
*/
const createMessage = ({ message = "", sender = "" } = {}) => ({
  id: uuidv4(),
  time: getTime(new Date(Date.now())),
  message,
  sender
});

/*
create a chat object
prop id: string
prop name: string
prop messages: Array.Message
prop users: Array.string
param object
  messages: Array.Message
  name: string
  users: Array.string
*/
const createChat = ({
  messages = [],
  name = "Community",
  users = []
} = {}) => ({
  id: uuidv4(),
  name,
  messages,
  users,
  typingUsers: []
});

/*
return a string representing time in 24h format
param date: Date
*/
getTime = date => `${date.getHours()}:${("0" + date.getMinutes()).slice(-2)}`;
