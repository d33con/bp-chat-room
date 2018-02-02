import React, { Component } from "react";
import SideBar from "./SideBar";
import ChatHeading from "./ChatHeading";
import Messages from "../messages/Messages";
import MessageInput from "../messages/MessageInput";
import {
  COMMUNITY_CHAT,
  MESSAGE_RECEIVED,
  MESSAGE_SENT,
  TYPING
} from "../Events";

class ChatContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chats: [],
      activeChat: null
    };
  }

  componentDidMount() {
    const { socket } = this.props;
    socket.emit(COMMUNITY_CHAT, this.resetChat);
  }

  /*
  reset the chat back to only the chat passed in
  param chat: {Chat}
  */
  resetChat = chat => {
    return this.addChat(chat, true);
  };

  /*
  Adds chat to chat continer, if reset is true it removes all chats and sets chat to main chat
  Sets the message and typing socket events for the chat
  param chat {Chat} chat to be added
  reset: boolean if true will set the chat as only chat
  */
  addChat = (chat, reset) => {
    const { socket } = this.props;
    const { chats } = this.state;
    const newChats = reset ? [chat] : [...chats, chat];
    this.setState({
      chats: newChats,
      activeChat: reset ? chat : this.state.activeChat
    });

    const messageEvent = `${MESSAGE_RECEIVED}-${chat.id}`;
    const typingEvent = `${TYPING}-${chat.id}`;

    socket.on(typingEvent, this.updateTypingInChat(chat.id));
    socket.on(messageEvent, this.addMessageToChat(chat.id));
  };

  /*
  Returns a function that will add message to chat eith chatId
  param chatId: number
  */
  addMessageToChat = chatId => {
    return message => {
      const { chats } = this.state;
      let newChats = chats.map(chat => {
        if (chat.id === chatId) {
          chat.messages.push(message);
        }
        return chat;
      });
      this.setState({ chats: newChats });
    };
  };

  /* updates the typing of chat with id passed in
  param chatId:  number
  */
  updateTypingInChat = chatId => {
    return ({ isTyping, user }) => {
      if (user !== this.props.user.name) {
        const { chats } = this.state;

        let newChats = chats.map(chat => {
          if (chat.id === chatId) {
            if (isTyping && !chat.typingUsers.includes(user)) {
              chat.typingUsers.push(user);
            } else if (!isTyping && chat.typingUsers.includes(user)) {
              chat.typingUsers = chat.typingUsers.filter(u => u !== user);
            }
          }
          return chat;
        });
        this.setState({
          chats: newChats
        });
      }
    };
  };

  /*
  Add a message to the specified chat
  param chatId: number
  param message: String message to be added
*/
  sendMessage = (chatId, message) => {
    const { socket } = this.props;
    socket.emit(MESSAGE_SENT, { chatId, message });
  };

  /*
    send typing status to server
    param chatId: number
    param isTyping: boolean
*/
  sendTyping = (chatId, isTyping) => {
    const { socket } = this.props;
    socket.emit(TYPING, { chatId, isTyping });
  };

  setActiveChat = activeChat => {
    this.setState({ activeChat });
  };

  render() {
    const { user, logout } = this.props;
    const { chats, activeChat } = this.state;
    return (
      <div className="container">
        <SideBar
          logout={logout}
          chats={chats}
          user={user}
          activeChat={activeChat}
          setActiveChat={this.setActiveChat}
        />
        <div className="chat-room-container">
          {activeChat !== null ? (
            <div className="chat-room">
              <ChatHeading name={activeChat.name} />
              <Messages
                messages={activeChat.messages}
                user={user}
                typingUsers={activeChat.typingUsers}
              />
              <MessageInput
                sendMessage={message => {
                  this.sendMessage(activeChat.id, message);
                }}
                sendTyping={isTyping => {
                  this.sendTyping(activeChat.id, isTyping);
                }}
              />
            </div>
          ) : (
            <div className="chat-room choose">
              <h3>Choose a chat!</h3>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default ChatContainer;
