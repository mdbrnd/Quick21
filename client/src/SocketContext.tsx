import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { UserDTO } from "./models/userDTO";

const URL: string =
  process.env.REACT_APP_ENV === "production" ||
  process.env.REACT_APP_ENV === undefined
    ? "https://quick21.onrender.com"
    : "http://localhost:4000";

interface SocketContextType {
  socket: Socket | null;
  connect: (token: string) => void;
  disconnect: () => void;
  userInfo: UserDTO | null;
  isAuthenticated: boolean; // TODO: fix weird behaviour with this (sometimes it shows false even right after changing it to true)
  refreshUserInfo: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connect: () => {},
  disconnect: () => {},
  userInfo: null,
  isAuthenticated: false,
  refreshUserInfo: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userInfo, setUserInfo] = useState<UserDTO | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const connect = (token: string) => {
    if (socket) {
      socket.close();
    }

    const newSocket = io(URL, {
      auth: { token },
    });

    newSocket.on("connect", () => {
      setSocket(newSocket);
      setIsAuthenticated(true);
      localStorage.setItem("authToken", token);

      // Fetch user info after connecting
      newSocket.emit("get-user-info", (userInfo: UserDTO) => {
        setUserInfo(userInfo);
      });
    });

    newSocket.on("disconnect", () => {
      setIsAuthenticated(false);
      setUserInfo(null);
    });
  };

  const disconnect = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }

    setIsAuthenticated(false);
    setUserInfo(null);
    localStorage.removeItem("authToken");
  };

  const refreshUserInfo = () => {
    if (socket) {
      socket.emit("get-user-info", (userInfo: any) => {
        if (userInfo) {
          setUserInfo(userInfo);
        }
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      connect(token);
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connect,
        disconnect,
        userInfo,
        isAuthenticated,
        refreshUserInfo,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
