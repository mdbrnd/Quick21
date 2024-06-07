"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const socket_io_1 = require("socket.io");
const room_manager_1 = __importDefault(require("./room_manager"));
const dbmanager_1 = require("./database/dbmanager");
require("dotenv/config");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const SERVER_PORT = 4000;
const CLIENT_PORT = 3000;
const dbManager = new dbmanager_1.DBManager();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined. Set JWT_SECRET environment variable.");
    process.exit(1);
}
app.use(express_1.default.json()); // Middleware to parse JSON bodies
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password } = req.body;
    if (!name || !password) {
        return res.status(400).send({ message: "Name and password are required." });
    }
    try {
        const alreadyExists = yield dbManager.userExists(name);
        if (alreadyExists) {
            return res.status(400).send({ message: "User already exists." });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield dbManager.addUser(name, hashedPassword, 1000);
        res.status(201).send({ message: "User registered successfully." });
    }
    catch (error) {
        res.status(500).send({ message: "Failed to register user.", error: error });
    }
}));
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password } = req.body;
    if (!name || !password) {
        return res.status(400).send({ message: "Name and password are required." });
    }
    try {
        const user = yield dbManager.getUserByName(name);
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const match = yield bcrypt_1.default.compare(hashedPassword, user.password);
        if (match) {
            // Generate an auth token
            const token = jsonwebtoken_1.default.sign({ id: user.id, name: user.name }, JWT_SECRET, {
                expiresIn: "14d",
            });
            res.send({
                message: "Login successful.",
                token,
                user: { id: user.id, name: user.name, balance: user.balance },
            });
        }
        else {
            res.status(401).send({ message: "Password is incorrect." });
        }
    }
    catch (error) {
        res.status(500).send({ message: "Login failed.", error: error });
    }
}));
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production"
            ? false
            : `http://localhost:${CLIENT_PORT}`,
    },
});
const roomManager = new room_manager_1.default();
// TODO: make so players cant join/only spectate already started game/only on next round
function joinRoom(socket, roomCode, playerName) {
    console.log("joining room " + roomCode);
    let couldJoin = roomManager.joinRoom(roomCode, {
        socketId: socket.id,
        name: playerName,
    });
    socket.emit("join-room-response", couldJoin);
    if (couldJoin) {
        socket.join(roomCode);
        console.log("player added to room");
    }
    else {
        console.log("could not add player to room");
    }
}
// TODO: if players leaves mid game, put next turn and transfer ownership and return bet
function leaveRoom(socket, roomCode) {
    let room = roomManager.getRoom(roomCode);
    if (room) {
        room.removePlayer(socket.id);
        socket.leave(roomCode);
        socket.emit("leave-room-response", true);
        console.log("player removed from room");
        if (room.players.length === 0) {
            console.log("closing room");
            roomManager.closeRoom(roomCode);
        }
    }
    else {
        socket.emit("leave-room-response", false);
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
        let initialGameState = room.game.start().toDTO();
        io.to(roomCode).emit("game-state-update", initialGameState); // send to all players in room. socket.to would exclude the sender
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
        socket.join(createdRoom.code);
    });
    // TODO: change to emit with ack
    socket.on("join-room", (roomCode, playerName) => {
        joinRoom(socket, roomCode, playerName);
    });
    // TODO: change to emit with ack
    socket.on("leave-room", (roomCode) => {
        leaveRoom(socket, roomCode);
    });
    socket.on("start-game", (roomCode) => {
        console.log("start game event received");
        startGame(socket, roomCode);
    });
    socket.on("place-bet", (roomCode, betAmount, callback) => __awaiter(void 0, void 0, void 0, function* () {
        let room = roomManager.getRoom(roomCode);
        if (room) {
            let player = room.getPlayer(socket.id);
            if (!player) {
                return;
            }
            let user = yield dbManager.getUserByName(player.name);
            // if (!user) { //TODO: uncomment in prod
            //   return;
            // }
            let oldGameState = room.game.state.toClientGameState();
            let updatedGameState = room
                .placeBet(socket.id, betAmount, user)
                .toClientGameState();
            console.log("bet placed, game state: ", updatedGameState);
            const success = updatedGameState !== oldGameState;
            callback({ success: success });
            const updatedGameStateForEmit = updatedGameState.toDTO();
            console.log("serialized game state: ", updatedGameStateForEmit);
            io.to(roomCode).emit("game-state-update", updatedGameStateForEmit);
        }
    }));
    socket.on("action", (roomCode, action) => {
        console.log("action received");
        let room = roomManager.getRoom(roomCode);
        if (room) {
            let actionResult = room.performAction(socket.id, action);
            io.to(roomCode).emit("game-state-update", actionResult[0].toDTO());
            if (actionResult[1] !== undefined) {
                console.log("round over");
                io.to(roomCode).emit("round-over", actionResult[1].toDTO());
            }
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
