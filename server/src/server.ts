import express from "express";
import { createServer } from "http";
import { join } from "path";
import { Server } from "socket.io";
import RoomManager from "./room_manager";
import Room from "./room";

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

const roomManager = new RoomManager();

io.on("connection", (socket) => {
  console.log("a user connected with socket id: ", socket.id);

  socket.on("create-room", (playerName: string) => {
    console.log("creating room");
    let createdRoom: Room = roomManager.createRoom(socket.id, playerName);
    console.log("room created with id: " + createdRoom.id);

    console.log("adding player " + playerName + " to room " + createdRoom.id);
    let couldJoin: boolean = roomManager.joinRoom(createdRoom.id, socket.id, playerName);
    if (couldJoin) {
      socket.join(createdRoom.id);
      console.log("player added to room");
    } else {
      console.log("could not add player to room");
    }
  });

  socket.on("join-room", (roomId: string, playerName: string) => {
    console.log("joining room " + roomId);
    let couldJoin: boolean = roomManager.joinRoom(roomId, socket.id, playerName);
    if (couldJoin) {
      socket.join(roomId);
      console.log("player added to room");
    } else {
      console.log("could not add player to room");
    }
  });

  socket.on("leave-room", (roomId) => {
    console.log("leaving room " + roomId);
    let room = roomManager.getRoom(roomId);
    if (room) {
      room.removePlayer(socket.id);
      socket.leave(roomId);
      console.log("player " + socket.id + " removed from room " + roomId);
    } else {
      console.log("room not found");
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(SERVER_PORT, () => {
  console.log(`server running at http://localhost:${SERVER_PORT}`);
});
