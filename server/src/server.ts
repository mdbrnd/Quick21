import express from "express";
import { createServer } from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import RoomManager from "./room_manager";
import Room from "./room";
import { DBManager } from "./dbmanager";
import "dotenv/config";

const app = express();
const server = createServer(app);
const SERVER_PORT = 4000;
const CLIENT_PORT = 3000;
const dbManager = new DBManager();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error(
    "JWT_SECRET is not defined. Set JWT_SECRET environment variable."
  );
  process.exit(1);
}

app.use(express.json()); // Middleware to parse JSON bodies

app.post("/register", async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).send({ message: "Name and password are required." });
  }

  try {
    const alreadyExists = await dbManager.userExists(name);
    if (alreadyExists) {
      return res.status(400).send({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await dbManager.addUser(name, hashedPassword, 1000);
    res.status(201).send({ message: "User registered successfully." });
  } catch (error) {
    res.status(500).send({ message: "Failed to register user.", error: error });
  }
});

app.post("/login", async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).send({ message: "Name and password are required." });
  }

  try {
    const user = await dbManager.getUserByName(name);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const match = await bcrypt.compare(hashedPassword, user.password);
    if (match) {
      // Generate an auth token
      const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, {
        expiresIn: "14d",
      });

      res.send({
        message: "Login successful.",
        token,
        user: { id: user.id, name: user.name, balance: user.balance },
      });
    } else {
      res.status(401).send({ message: "Password is incorrect." });
    }
  } catch (error) {
    res.status(500).send({ message: "Login failed.", error: error });
  }
});

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

  socket.on("leave-room", (roomCode: string) => {
    leaveRoom(socket, roomCode);
  });

  socket.on("start-game", (roomCode: string) => {
    console.log("start game event received");
    startGame(socket, roomCode);
  });

  socket.on("place-bet", (roomCode: string, betAmount: number) => {
    let room = roomManager.getRoom(roomCode);
    if (room) {
      let updatedGameState = room.placeBet(socket.id, betAmount); //TODO: change these methods to return ClientGameState
      io.to(roomCode).emit("game-state-update", updatedGameState);
    }
  });

  socket.on("action", (roomCode: string, action) => {
    console.log("action received");
    let room = roomManager.getRoom(roomCode);
    if (room) {
      let updatedGameState = room.performAction(socket.id, action); //TODO: add round over event if last action was made
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
