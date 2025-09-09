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
    "04AAAAAGjBlukADNIJGOaUrJ7UHvBh5ACwxm4ByITrwIsYN+bZC+5QVOBU2DhIoZxL7US3TG2pM4nRLyN13BuCabbdHvhO/vVF48SRo77tEjYhH4TSNtkfh+7AjZuMzTk5QKXw79BiQKEgqzWWis82X2vqrCu0PmGvgx1ATu2TdtKNZEX2sCzoB0XQVhTMuRAOQVeCuqm8W8O3jJWXkPEII4I8AvZ1x74toSW1VusPlBaa0yEiG8BOxPVwDSOM41L2T36ychkO4g4B";
  const tokenB =
    "04AAAAAGjBlw0ADLQL51x8V92YJaHowQCwETtZow0zlayFu91WI/IKMx7cAu9R28OFpG6mb0Hm3DP96/hPve99vxKulq6FiGwwQa/KU/u45zpILSrWOkBBHYeO2rYi0ON+fpt9MOHXL3quunAeXif5YDu4rdmVjNq4Eh1lUbXkBVGawi4SzJOzIzZcqBOxnKz2Yac2etOhup0FEWHZz5feh1v0QYQyUQ/xqWD8QPLVjh2HnGz+ZG00FBrfiqT01EJwEUr2cejnQMkB";

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
