"use strict";
// Assuming this file is named server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
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
let activeRooms = {};
io.on("connection", (socket) => {
    console.log("a user connected with socket id: ", socket.id);
    // Fixed issue: roomName was not defined in the original snippet
    socket.on("create-room", (roomName) => {
        // Assuming roomName is passed from the client
        console.log("creating room: ", roomName);
        if (!activeRooms[roomName]) {
            // Check if room already exists
            activeRooms[roomName] = { users: {} };
            socket.join(roomName);
        }
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
        // Additional logic to handle user disconnection, like cleaning up user data or rooms, could be added here
    });
});
server.listen(SERVER_PORT, () => {
    console.log(`server running at http://localhost:${SERVER_PORT}`);
});
