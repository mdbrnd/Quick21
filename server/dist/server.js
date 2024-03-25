"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const room_manager_1 = __importDefault(require("./room_manager"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const SERVER_PORT = 4000;
const CLIENT_PORT = 3000;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production"
            ? false
            : `http://localhost:${CLIENT_PORT}`,
    },
});
const roomManager = new room_manager_1.default();
function joinRoom(socket, roomCode, playerName) {
    console.log("joining room " + roomCode);
    let couldJoin = roomManager.joinRoom(roomCode, {
        socketId: socket.id,
        name: playerName,
    });
    socket.emit("join-room-response", { success: couldJoin });
    if (couldJoin) {
        socket.join(roomCode);
        console.log("player added to room");
    }
    else {
        console.log("could not add player to room");
    }
}
function leaveRoom(socket, roomCode) {
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
    }
    else {
        socket.emit("leave-room-response", { success: false });
    }
}
function startGame(socket, roomCode) {
    let room = roomManager.getRoom(roomCode);
    if (room) {
        if (room.hasPlayer(socket.id) == false ||
            room.owner.socketId !== socket.id) {
            console.log("player not in room or not owner");
            return;
        }
        room.game.start();
        socket.to(roomCode).emit("game-started", { success: true });
    }
}
io.on("connection", (socket) => {
    console.log("a user connected with socket id: ", socket.id);
    socket.on("create-room", (playerName, callback) => {
        console.log("creating room");
        let createdRoom = roomManager.createRoom({
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
    });
    socket.on("join-room", (roomCode, playerName) => {
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
