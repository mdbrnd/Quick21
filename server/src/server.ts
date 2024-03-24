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

function joinRoom(socket: any, roomId: string, playerName: string) {
  console.log("joining room " + roomId);
  let couldJoin: boolean = roomManager.joinRoom(roomId, {
    socketId: socket.id,
    name: playerName,
  });

  socket.emit("join-room-response", { success: couldJoin });

  if (couldJoin) {
    socket.join(roomId);
    console.log("player added to room");
  } else {
    console.log("could not add player to room");
  }
}

function leaveRoom(socket: any, roomId: string) {
  let room = roomManager.getRoom(roomId);

  if (room) {
    room.removePlayer(socket.id);
    socket.leave(roomId);
    socket.emit("leave-room-response", { success: true });

    console.log("player removed from room");

    if (room.players.length === 0) {
      console.log("closing room");
      roomManager.closeRoom(roomId);
    }
  } else {
    socket.emit("leave-room-response", { success: false });
  }
}

io.on("connection", (socket) => {
  console.log("a user connected with socket id: ", socket.id);

  socket.on("create-room", (playerName: string) => {
    console.log("creating room");
    let createdRoom: Room = roomManager.createRoom({
      socketId: socket.id,
      name: playerName,
    });
    console.log("room created with id: " + createdRoom.id);

    roomManager.joinRoom(createdRoom.id, {
      socketId: socket.id,
      name: playerName,
    });
  });

  socket.on("join-room", (roomId: string, playerName: string) => {
    joinRoom(socket, roomId, playerName);
  });

  socket.on("leave-room", (roomId) => {
    leaveRoom(socket, roomId);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    let room = roomManager.getRoomThatPlayerIsIn(socket.id);
    if (room) {
      leaveRoom(socket, room.id);
    }
  });
});

server.listen(SERVER_PORT, () => {
  console.log(`server running at http://localhost:${SERVER_PORT}`);
});
