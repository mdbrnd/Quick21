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
function joinRoom(socket, roomId, playerName) {
    console.log("joining room " + roomId);
    let couldJoin = roomManager.joinRoom(roomId, {
        socketId: socket.id,
        name: playerName,
    });
    socket.emit("join-room-response", { success: couldJoin });
    if (couldJoin) {
        socket.join(roomId);
        console.log("player added to room");
    }
    else {
        console.log("could not add player to room");
    }
}
function leaveRoom(socket, roomId) {
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
    }
    else {
        socket.emit("leave-room-response", { success: false });
    }
}
io.on("connection", (socket) => {
    console.log("a user connected with socket id: ", socket.id);
    socket.on("create-room", (playerName) => {
        console.log("creating room");
        let createdRoom = roomManager.createRoom({
            socketId: socket.id,
            name: playerName,
        });
        console.log("room created with id: " + createdRoom.id);
        roomManager.joinRoom(createdRoom.id, {
            socketId: socket.id,
            name: playerName,
        });
    });
    socket.on("join-room", (roomId, playerName) => {
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
