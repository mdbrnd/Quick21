import express from "express";
import { createServer } from "http";
import { join } from "path";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const SERVER_PORT = 4000;
const CLIENT_PORT = 3000;

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : `http://localhost:${CLIENT_PORT}`,
  },
});

io.on("connection", (socket) => {
  console.log("a user connected with socket id: ", socket.id);

  socket.on("create-room", (roomName: string) => {
    console.log("creating room: ", roomName);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(SERVER_PORT, () => {
  console.log(`server running at http://localhost:${SERVER_PORT}`);
});
