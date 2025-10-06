<<<<<<< HEAD
import { useEffect, useRef, useState } from 'react';
import { connectWS } from './ws';
import BackgroundImage from './assets/background.jpg';

export default function App() {
    const timer = useRef(null);
    const socket = useRef(null);
    const [userName, setUserName] = useState('');
    const [showNamePopup, setShowNamePopup] = useState(true);
    const [inputName, setInputName] = useState('');
    const [typers, setTypers] = useState([]);

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');

    useEffect(() => {
        socket.current = connectWS();

        socket.current.on('connect', () => {
            socket.current.on('roomNotice', (userName) => {
                console.log(`${userName} joined to group!`);
            });

            socket.current.on('chatMessage', (msg) => {
                // push to existing messages list
                console.log('msg', msg);
                setMessages((prev) => [...prev, msg]);
            });

            socket.current.on('typing', (userName) => {
                setTypers((prev) => {
                    const isExist = prev.find((typer) => typer === userName);
                    if (!isExist) {
                        return [...prev, userName];
                    }

                    return prev;
                });
            });

            socket.current.on('stopTyping', (userName) => {
                setTypers((prev) => prev.filter((typer) => typer !== userName));
            });
        });

        return () => {
            socket.current.off('roomNotice');
            socket.current.off('chatMessage');
            socket.current.off('typing');
            socket.current.off('stopTyping');
        };
    }, []);

    useEffect(() => {
        if (text) {
            socket.current.emit('typing', userName);
            clearTimeout(timer.current);
        }

        timer.current = setTimeout(() => {
            socket.current.emit('stopTyping', userName);
        }, 1000);

        return () => {
            clearTimeout(timer.current);
        };
    }, [text, userName]);

    // FORMAT TIMESTAMP TO HH:MM FOR MESSAGES
    function formatTime(ts) {
        const d = new Date(ts);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    }

    // SUBMIT NAME TO GET STARTED, OPEN CHAT WINDOW WITH INITIAL MESSAGE
    function handleNameSubmit(e) {
        e.preventDefault();
        const trimmed = inputName.trim();
        if (!trimmed) return;

        // join room
        socket.current.emit('joinRoom', trimmed);

        setUserName(trimmed);
        setShowNamePopup(false);
    }

    // SEND MESSAGE FUNCTION
    function sendMessage() {
        const t = text.trim();
        if (!t) return;

        // USER MESSAGE
        const msg = {
            id: Date.now(),
            sender: userName,
            text: t,
            ts: Date.now(),
        };
        setMessages((m) => [...m, msg]);

        // emit
        socket.current.emit('chatMessage', msg);

        setText('');
    }

    // HANDLE ENTER KEY TO SEND MESSAGE
    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }
    
    // Create the display message for typing users
    let typingDisplay = '';
    if (typers.length > 0) {
        if (typers.length === 1) {
            typingDisplay = `${typers[0]} is typing...`;
        } else if (typers.length === 2) {
            typingDisplay = `${typers[0]} and ${typers[1]} are typing...`;
        } else {
            typingDisplay = 'Several people are typing...';
        }
    }


    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 font-inter bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${BackgroundImage})` }}>
            {/* ENTER YOUR NAME TO START CHATTING */}
            {showNamePopup && (
                <div className="fixed inset-0 flex items-center justify-center z-40">
                    <div className="bg-white rounded-xl shadow-lg max-w-md p-6 w-full">
                        <h1 className="text-2xl font-bold text-center text-black">
                            Gup Shup App
                        </h1>
                        <p className="text-sm text-gray-500 mt-2 text-center">
                            Enter your name to start chatting.
                        </p>
                        <form onSubmit={handleNameSubmit} className="mt-4">
                            <input
                                autoFocus
                                value={inputName}
                                onChange={(e) => setInputName(e.target.value)}
                                className="w-full border border-gray-200 rounded-md px-4 py-3 text-lg outline-green-500 placeholder-gray-400"
                                placeholder="Your name (e.g. John Doe)"
                            />
                            <button
                                type="submit"
                                className="w-full block mt-3 px-4 py-2 rounded-full bg-green-500 text-white font-medium cursor-pointer">
                                Continue
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* CHAT WINDOW */}
            {!showNamePopup && (
                <div className="w-full max-w-2xl h-[90vh] bg-white rounded-xl shadow-md flex flex-col overflow-hidden">
                    {/* CHAT HEADER */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
                        <div className="h-10 w-10 rounded-full bg-[#075E54] flex items-center justify-center text-white font-semibold">
                            R
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-[#303030]">
                                Realtime group chat
                            </div>
                            <div className="text-xs text-gray-500 h-4">
                                {typingDisplay}
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            Signed in as{' '}
                            <span className="font-medium text-[#303030] capitalize">
                                {userName}
                            </span>
                        </div>
                    </div>

                    {/* CHAT MESSAGE LIST */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-100 flex flex-col">
                        {messages.map((m) => {
                            const mine = m.sender === userName;
                            return (
                                <div
                                    key={m.id}
                                    className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[78%] p-3 my-2 rounded-[18px] text-sm leading-5 shadow-sm ${
                                            mine
                                                ? 'bg-[#DCF8C6] text-[#303030] rounded-br-2xl'
                                                : 'bg-white text-[#303030] rounded-bl-2xl'
                                        }`}>
                                        <div className="break-words whitespace-pre-wrap">
                                            {m.text}
                                        </div>
                                        <div className="flex justify-between items-center mt-1 gap-16">
                                            <div className="text-[11px] font-bold">{m.sender}</div>
                                            <div className="text-[11px] text-gray-500 text-right">
                                                {formatTime(m.ts)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* CHAT TEXTAREA */}
                    <div className="px-4 py-3 border-t border-gray-200 bg-white">
                        <div className="flex items-center justify-between gap-4 border border-gray-200 rounded-full">
                            <textarea
                                rows={1}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                className="w-full resize-none px-4 py-4 text-sm outline-none"
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-green-500 text-white px-4 py-2 mr-2 rounded-full text-sm font-medium cursor-pointer">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
=======
import React, { useState, useEffect, useRef } from "react";
import { ZIM } from "zego-zim-web";
import Bg from "./assets/Bg.jpg";

function App() {
  const [ZimInstance, setZimInstance] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState("Rahul");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const tokenA =
    "04AAAAAGjFNUAADM/YBJ2J26K9UbDuTACwVUFQhjPt5Xz43hKeJUdfORVigov2HUKgF7nG7X/LeR0RcQeBj4pPq62gpL+A+/hh/DeZ/0vJSsok39g7NilGpMG+ULYQmmsdP9IVcySqbfThTOfDTGLn9x2OV99b/TT1/zqhgRPDpbuKsCK2EXLk/N5yJv/zqdyllGOuFv202KEicRYPL0cRBlAFseuOWk63h0FKxj8d1GjQOKhX5GHOJPASWYh3fFSjtgPHVeAY6fcB";
  const tokenB =
    "04AAAAAGjFNVQADJ+dcdfxSAQENE+mDACvv/Jf7wDT3nu1svJ+pl0Jn1M/GaCM1Hfx11XNudtvtMjsiYTFHUfMnVDigkbizhJ5mUCIHIl0OT+baBCjs2RYzzS5inFBNBe/8jrf+GGUKa7tRT8ZbRrKicE1pp3+ZopVyIxjn0ZVHDmbdhrXiZyQ1ZnP+Pj8LMk2811QoPR7IrlrRuM6JlK0Wi9oYs7rJ32y6RVhUBnnDt0jHbRf3XQTt3eCmTDnqm5ozqlybDk5NwE=";

  const appID = 1980347456;
  const messageEndRef = useRef(null);

  useEffect(() => {
    const instance = ZIM.create({ appID });
    setZimInstance(instance);

    instance.on("error", function (zim, errorInfo) {
      console.log("error", errorInfo.code, errorInfo.message);
    });

    instance.on("connectionStateChanged", function (zim, { state, event }) {
      console.log("connectionStateChanged", state, event);
    });

    instance.on("peerMessageReceived", function (zim, { messageList }) {
      setMessages((prevMessages) => [...prevMessages, ...messageList]);
    });

    instance.on("tokenWillExpire", function (zim, { second }) {
      console.log("tokenWillExpire", second);
      const newToken = selectedUser === "Rahul" ? tokenA : tokenB;
      instance
        .renewToken(newToken)
        .then(() => {
          console.log("token-renewed");
        })
        .catch(function (err) {
          console.error("token-renew-error", err);
        });
    });

    return () => {
      instance.destroy();
    };
  }, [appID, selectedUser]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleLogin = () => {
    const info = {
      userID: selectedUser,
      userName: selectedUser === "Rahul" ? "Rahul" : "Ishan",
    };
    setUserInfo(info);
    const loginToken = selectedUser === "Rahul" ? tokenA : tokenB;

    if (ZimInstance) {
      ZimInstance.login(info, loginToken)
        .then(function () {
          setIsLoggedIn(true);
          console.log("login-success");
        })
        .catch(function (err) {
          console.error("login-error", err);
        });
    } else {
      console.error("Instance Error");
    }
  };

  const handleSendMessage = () => {
    if (!isLoggedIn) return;

    const toConversationID = selectedUser === "Rahul" ? "Ishan" : "Rahul";
    const conversationType = 0;
    const config = { priority: 1 };

    const messageTextObj = {
      type: 1,
      message: messageText,
      extendedData: " ",
    };

    ZimInstance.sendMessage(
      messageTextObj,
      toConversationID,
      conversationType,
      config
    )
      .then(function ({ message }) {
        setMessages((prevMessages) => [...prevMessages, message]);
      })
      .catch(function (err) {
        console.error("send-message-error", err);
      });

    setMessageText("");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="w-full h-[100vh] flex items-center flex-col"
      style={{
        backgroundImage: `url(${Bg})`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-white font-bold text-[30px]">Real Time Chat App</h1>

      {!isLoggedIn ? (
        <div
          className="w-[90%] max-w-[600px] h-[400px] overflow-auto p-[20px] 
          backdrop-blur shadow-2xl bg-[#00000020] mt-[30px] rounded-xl flex flex-col 
          items-center justify-center gap-[30px] border-2 border-gray-700"
        >
          <h1 className="text-[30px] font-semibold text-white">Select User</h1>
          <select
            className="px-[50px] rounded-xl py-[5px] bg-[#1f2525] text-white"
            onChange={(e) => setSelectedUser(e.target.value)}
            value={selectedUser}
          >
            <option value="Rahul">Rahul Kumar</option>
            <option value="Ishan">Ishan Gupta</option>
          </select>
          <button
            className="p-[10px] rounded-xl bg-white font-semibold cursor-pointer
            text-black w-[100px]"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      ) : (
        <div
          className="w-[90%] max-w-[800px] h-[600px] overflow-auto p-[20px] 
          backdrop-blur shadow-2xl bg-[#00000020] mt-[30px] rounded-xl flex flex-col 
          items-center gap-[30px] border-2 border-gray-700"
        >
          <h2 className="text-white text-[20px]">
            {userInfo.userName}{" "}
            <span className="text-gray-400">chatting with</span>{" "}
            {selectedUser === "Rahul" ? "Ishan" : "Rahul"}
          </h2>

          <div className="w-full h-[1px] bg-gray-800"></div>

          {/* Messages */}
          <div className="rounded-2xl w-full p-[20px] flex flex-col gap-[10px] 
            h-[400px] overflow-auto"
          >
            {messages.map((msg, i) => {
              const isOwnMessage = msg.senderUserID === userInfo.userID;
              return (
                <div
                  key={i}
                  className={`w-full flex ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-[20px] py-[10px] shadow-lg text-white max-w-[70%] break-words
                      ${
                        isOwnMessage
                          ? "bg-[#0f1010] rounded-br-0 rounded-t-2xl rounded-bl-2xl"
                          : "bg-[#1c2124] rounded-bl-0 rounded-t-2xl rounded-br-2xl"
                      }`}
                  >
                    <div>{msg.message}</div>
                    <div className="text-[13px] text-gray-400">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef}/>
          </div>

          {/* Input Box */}
          <div className="flex items-center justify-center gap-[20px] w-full h-[100px] fixed bottom-0 px-[20px]">
            <input
              type="text"
              placeholder="Type a message..."
              onChange={(e) => setMessageText(e.target.value)} value={messageText}
              className="rounded-2xl bg-grey-700
              outline-none text-white px-[20px] py-[10px] placeholder-white w-full"/>
            <button
              onClick={handleSendMessage}
              className="px-[20px] py-[10px] bg-white rounded-xl text-black font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
>>>>>>> 29ca41d65a0070360aaea1a9589145e992cf4093
