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
io.on("connection", (socket) => {
    console.log("a user connected with socket id: ", socket.id);
    socket.on("create-room", (playerName) => {
        console.log("creating room");
        let createdRoom = roomManager.createRoom(socket.id, playerName);
        console.log("room created with id: " + createdRoom.id);
        console.log("adding player " + playerName + " to room " + createdRoom.id);
        let couldJoin = roomManager.joinRoom(createdRoom.id, socket.id, playerName);
        if (couldJoin) {
            socket.join(createdRoom.id);
            console.log("player added to room");
        }
        else {
            console.log("could not add player to room");
        }
    });
    socket.on("join-room", (roomId, playerName) => {
        console.log("joining room " + roomId);
        let couldJoin = roomManager.joinRoom(roomId, socket.id, playerName);
        if (couldJoin) {
            socket.join(roomId);
            console.log("player added to room");
        }
        else {
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
        }
        else {
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
