import React, { Component } from "react";
import LoginForm from "./LoginForm";
import io from "socket.io-client";
import { USER_CONNECTED, LOGOUT } from "../Events";

const socketUrl = "http://172.21.24.141:3231/";

class Layout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      socket: null,
      user: null
    };
  }

  componentWillMount() {
    this.initialiseSocket();
  }

  // connect to and initialise the socket
  initialiseSocket = () => {
    const socket = io(socketUrl);
    socket.on("connect", () => console.log("connected"));
    this.setState({ socket });
  };

  // set the user property {id: number, name: string} in state
  setUser = user => {
    const { socket } = this.state;
    socket.emit(USER_CONNECTED, user);
    this.setState({ user });
  };

  // set user property to null on user logout
  logout = () => {
    const { socket } = this.state;
    socket.emit(LOGOUT);
    this.setState({ user: null });
  };

  render() {
    const { socket } = this.state;
    return (
      <div className="container">
        <LoginForm socket={socket} setUser={this.setUser} />
      </div>
    );
  }
}

export default Layout;
