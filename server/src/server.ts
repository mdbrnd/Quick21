import express from "express";
import { createServer } from "http";
import { join } from "path";
import { Server } from "socket.io";
import RoomManager from "./room_manager";
import Room from "./room";
import { GameState } from "./game_state";

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

function joinRoom(socket: any, roomCode: string, playerName: string) {
  console.log("joining room " + roomCode);
  let couldJoin: boolean = roomManager.joinRoom(roomCode, {
    socketId: socket.id,
    name: playerName,
  });

  socket.emit("join-room-response", { success: couldJoin });

  if (couldJoin) {
    socket.join(roomCode);
    console.log("player added to room");
  } else {
    console.log("could not add player to room");
  }
}

function leaveRoom(socket: any, roomCode: string) {
  let room = roomManager.getRoom(roomCode);

  if (room) {
    room.removePlayer(socket.id);
    socket.leave(roomCode);
    socket.emit("leave-room-response", { success: true });

    console.log("player removed from room");

    if (room.players.length === 0) {
      console.log("closing room");
      roomManager.closeRoom(roomCode);
    }
  } else {
    socket.emit("leave-room-response", { success: false });
  }
}

function startGame(socket: any, roomCode: string) {
  let room = roomManager.getRoom(roomCode);

  if (room) {
    if (
      room.hasPlayer(socket.id) == false ||
      room.owner.socketId !== socket.id
    ) {
      console.log("player not in room or not owner");
      return;
    }

    let initialGameState = room.game.start();
    io.to(roomCode).emit("game-started", {
      initialGameState: initialGameState,
    }); // send to all players in room. socket.to would exclude the sender
  }
}

io.on("connection", (socket) => {
  console.log("a user connected with socket id: ", socket.id);

  socket.on("create-room", (playerName: string, callback) => {
    console.log("creating room");
    let createdRoom: Room = roomManager.createRoom({
      socketId: socket.id,
      name: playerName,
    });
    console.log("room created with id: " + createdRoom.code);

    callback({
      success: true,
      roomCode: createdRoom.code,
    });

    roomManager.joinRoom(createdRoom.code, {
      socketId: socket.id,
      name: playerName,
    });

    socket.join(createdRoom.code);
  });

  socket.on("join-room", (roomCode: string, playerName: string) => {
    joinRoom(socket, roomCode, playerName);
  });

  socket.on("leave-room", (roomCode) => {
    leaveRoom(socket, roomCode);
  });

  socket.on("start-game", (roomCode) => {
    console.log("start game event received");
    startGame(socket, roomCode);
  });

  socket.on("action", (roomCode, action) => {
    console.log("action received");
    let room = roomManager.getRoom(roomCode);
    if (room) {
      let updatedGameState = room.performAction(socket.id, action);
      io.to(roomCode).emit("game-state-update", updatedGameState);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    let room = roomManager.getRoomThatPlayerIsIn(socket.id);
    if (room) {
      leaveRoom(socket, room.code);
    }
  });
});

server.listen(SERVER_PORT, () => {
  console.log(`server running at http://localhost:${SERVER_PORT}`);
});
