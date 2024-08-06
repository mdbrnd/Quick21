import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const URL: string =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:4000";

interface SocketContextType {
  socket: Socket | null;
  connect: (token: string) => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connect: () => {},
  disconnect: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const connect = (token: string) => {
    if (socket) {
      socket.close();
    }

    const newSocket = io(URL, {
      auth: { token },
    });

    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
    localStorage.removeItem("authToken");
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      connect(token); // TODO: route to lobby
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
};
