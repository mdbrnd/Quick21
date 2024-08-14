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
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const SERVER_PORT = 4000;
const CLIENT_PORT = 3000;
const dbManager = new dbmanager_1.DBManager();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined. Set JWT_SECRET environment variable and create .env file in the root directory if it does not yet exist. (/server/.env), JWT_SECRET=<your_secret>");
    process.exit(1);
}
app.use(express_1.default.json()); // Middleware to parse JSON bodies
app.use((0, cors_1.default)({
    origin: "http://localhost:3000", // TODO: update in prod
    credentials: true,
}));
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
        console.error("Registration error:", error);
        res.status(500).send({ message: "Failed to register user." });
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
        const match = yield bcrypt_1.default.compare(password, user.password);
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
        console.error("Login error:", error);
        res.status(500).send({ message: "Login failed." });
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
// TODO: make so players cant join/only spectate already started game/only on next round; match game state
function joinRoom(socket, roomCode) {
    console.log("joining room " + roomCode);
    let couldJoin = roomManager.joinRoom(roomCode, {
        socketId: socket.id,
        name: socket.user.name,
        balance: socket.user.balance,
        userId: socket.user.id,
    });
    socket.emit("join-room-response", couldJoin);
    if (couldJoin) {
        socket.join(roomCode);
        console.log("player added to room");
        // Update game state to show others that player is in room
        let room = roomManager.getRoom(roomCode);
        if (room) {
            let gameState = room.game.state.toClientGameState().toDTO();
            io.to(roomCode).emit("game-state-update", gameState);
        }
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
        else {
            // Send updated game state so player list is accurate
            let gameState = room.game.state.toClientGameState().toDTO();
            io.to(roomCode).emit("game-state-update", gameState);
        }
    }
    else {
        socket.emit("leave-room-response", false);
    }
}
//TODO: somehow fetch game if user reloads page
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
const authenticateToken = (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Authentication error: Token not provided"));
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
        // Attach the decoded token to the socket for future use
        socket.user = decoded;
        next();
    });
};
// Auth middleware for all socket connections; ran once on connection, not for every request
io.use(authenticateToken);
io.on("connection", (socket) => {
    const authSocket = socket;
    console.log("Authenticated user connected with socket id: ", authSocket.id);
    console.log("User details:", authSocket.user);
    authSocket.on("create-room", (callback) => {
        console.log("creating room");
        let createdRoom = roomManager.createRoom({
            socketId: authSocket.id,
            name: authSocket.user.name,
            balance: authSocket.user.balance,
            userId: authSocket.user.id,
        });
        console.log("room created with id: " + createdRoom.code);
        callback({
            success: true,
            roomCode: createdRoom.code,
        });
        roomManager.joinRoom(createdRoom.code, {
            socketId: authSocket.id,
            name: authSocket.user.name,
            balance: authSocket.user.balance,
            userId: authSocket.user.id,
        });
        socket.join(createdRoom.code);
        let room = roomManager.getRoom(createdRoom.code);
        if (room) {
            let gameState = room.game.state.toClientGameState().toDTO();
            io.to(createdRoom.code).emit("game-state-update", gameState);
        }
    });
    authSocket.on("get-user-info", (callback) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield dbManager.getUser(authSocket.user.id);
            if (user) {
                callback({
                    id: user.id,
                    name: user.name,
                    balance: user.balance,
                });
            }
            else {
                callback(null);
            }
        }
        catch (error) {
            console.error("Error fetching user info:", error);
            callback(null);
        }
    }));
    // TODO: change to emit with ack
    authSocket.on("join-room", (roomCode) => {
        joinRoom(authSocket, roomCode);
    });
    // TODO: change to emit with ack
    authSocket.on("leave-room", (roomCode) => {
        leaveRoom(socket, roomCode);
    });
    authSocket.on("start-game", (roomCode) => {
        console.log("start game event received");
        startGame(socket, roomCode);
    });
    authSocket.on("place-bet", (roomCode, betAmount, callback) => __awaiter(void 0, void 0, void 0, function* () {
        let room = roomManager.getRoom(roomCode);
        if (room) {
            let player = room.getPlayer(socket.id);
            if (!player) {
                return;
            }
            let user = yield dbManager.getUser(authSocket.user.id);
            if (!user) {
                return;
            }
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
    authSocket.on("action", (roomCode, action) => {
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
    authSocket.on("new-round", (roomCode) => {
        let room = roomManager.getRoom(roomCode);
        if (room) {
            if (room.game.state.currentPhase === "RoundOver") {
                let newGameState = room.game.newRound().toClientGameState();
                io.to(roomCode).emit("game-state-update", newGameState.toDTO());
            }
        }
    });
    authSocket.on("disconnect", () => {
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
