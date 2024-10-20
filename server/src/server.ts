import express from "express";
import { createServer } from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import RoomManager from "./room_manager";
import Room from "./room";
import { DBManager } from "./database/dbmanager";
import "dotenv/config";
import cors from "cors";
import path from "path";

const app = express();
const server = createServer(app);
const SERVER_PORT = process.env.PORT || 4000;
const DEV_CLIENT_PORT = 3000;
const dbManager = new DBManager();
const roomManager = new RoomManager();
const JWT_SECRET = process.env.JWT_SECRET;
const STARTING_BALANCE = 10000;

if (!JWT_SECRET) {
  console.error(
    "JWT_SECRET is not defined. Set JWT_SECRET environment variable and create .env file in the root directory if it does not yet exist. (/Quick21/.env), JWT_SECRET=<your_secret>"
  );
  process.exit(1);
}

interface JwtPayload {
  id: number;
  name: string;
}

app.use(express.json()); // Middleware to parse JSON bodies

// __dirname = server/src/server.ts for development since its using nodemon (npm run dev)
var distDir = path.join(__dirname, "../../client/build");
if (process.env.NODE_ENV === "production") {
  // __dirname = server/src/dist/server.js
  distDir = path.join(__dirname, "../../../client/build");
}
app.use(express.static(distDir));

app.get("*", (req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Routes created with help from ChatGPT
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
    await dbManager.addUser(name, hashedPassword, STARTING_BALANCE);
    res.status(201).send({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).send({ message: "Failed to register user." });
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

    const match = await bcrypt.compare(password, user.password);
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
    console.error("Login error:", error);
    res.status(500).send({ message: "Login failed." });
  }
});

app.post("/admin/add-money", async (req, res) => {
  const { token, name, amount } = req.body;

  if (!token || !name || !amount) {
    return res
      .status(400)
      .send({ message: "Token, name, and amount are required." });
  }

  // Check if types are correct
  if (typeof name !== "string" || typeof amount !== "number") {
    return res.status(400).send({ message: "Invalid types." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (decoded.name !== "admin") {
      return res
        .status(403)
        .send({ message: "Forbidden: Insufficient permissions." });
    }

    // Check if user exists
    const user = await dbManager.getUserByName(name);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    await dbManager.updateUserBalance(user.id, amount);

    res.status(200).send({ message: "Money added to user successfully." });
  } catch (error) {
    console.error("Failed to add money to user:", error);
    res.status(500).send({ message: "Failed to add money to user." });
  }
});

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? "*"
        : `http://localhost:${DEV_CLIENT_PORT}`,
  },
});

interface AuthenticatedSocket extends Socket {
  user: JwtPayload;
}

const authenticateToken = (socket: any, next: any) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error: Token not provided"));
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return next(new Error("Authentication error: Invalid token"));
    }

    // Attach the decoded token to the socket for future use
    (socket as AuthenticatedSocket).user = decoded as JwtPayload;
    next();
  });
};

// Auth middleware for all socket connections; ran once on connection, not for every request
io.use(authenticateToken);

async function leaveRoom(socket: any, roomCode: string): Promise<boolean> {
  let room = roomManager.getRoom(roomCode);

  if (room) {
    // If the player to leave was the last player and hadn't finished the round, the round is over and the info needs to be sent to the clients
    const roundOverInfo = await room.removePlayer(socket.id);

    socket.leave(roomCode);
    console.log("player removed from room");

    if (room.players.length === 0) {
      console.log("closing room");
      roomManager.closeRoom(roomCode);
    } else {
      // Send updated game state so player list is accurate
      let gameState = room.game.state.toClientGameState().toDTO();
      io.to(roomCode).emit("game-state-update", gameState);

      if (roundOverInfo) {
        console.log("round over because player left");
        io.to(roomCode).emit("round-over", roundOverInfo.toDTO());
      }
    }
    return true;
  } else {
    return false;
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

    let initialGameState = room.game.start().toDTO();
    io.to(roomCode).emit("game-state-update", initialGameState); // Send to all players in room. socket.to would exclude the sender
  }
}

io.on("connection", (socket) => {
  const authSocket = socket as AuthenticatedSocket;
  console.log("Authenticated user connected with socket id: ", authSocket.id);
  console.log("User details:", authSocket.user);

  authSocket.on("create-room", async (callback) => {
    console.log("creating room");
    let user = await dbManager.getUser(authSocket.user.id);

    if (!user) {
      console.log("user not found");
      return;
    }

    let createdRoom: Room = roomManager.createRoom({
      socketId: authSocket.id,
      name: authSocket.user.name,
      userId: authSocket.user.id as unknown as number,
    });
    console.log("room created with id: " + createdRoom.code);

    callback({
      success: true,
      roomCode: createdRoom.code,
    });

    roomManager.joinRoom(createdRoom.code, {
      socketId: authSocket.id,
      name: authSocket.user.name,
      userId: authSocket.user.id as unknown as number,
    });

    socket.join(createdRoom.code);

    let room = roomManager.getRoom(createdRoom.code);
    if (room) {
      let gameState = room.game.state.toClientGameState().toDTO();
      io.to(createdRoom.code).emit("game-state-update", gameState);
    }
  });

  authSocket.on("get-user-info", async (callback) => {
    try {
      const user = await dbManager.getUser(authSocket.user.id);
      if (user) {
        callback({
          id: user.id,
          name: user.name,
          balance: user.balance,
        });
      } else {
        callback(null);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      callback(null);
    }
  });

  authSocket.on("join-room", async (roomCode: string, callback) => {
    console.log("joining room " + roomCode);

    let [couldJoin, errorMessage] = roomManager.joinRoom(roomCode, {
      socketId: socket.id,
      name: authSocket.user.name,
      userId: authSocket.user.id as unknown as number,
    });

    callback({
      success: couldJoin,
      errorMessage: errorMessage,
    });

    if (couldJoin) {
      socket.join(roomCode);
      console.log("player added to room");
      // Update game state to show others that player is in room
      let room = roomManager.getRoom(roomCode);
      if (room) {
        let gameState = room.game.state.toClientGameState().toDTO();
        io.to(roomCode).emit("game-state-update", gameState);
      }
    } else {
      console.log("could not add player to room: " + errorMessage);
    }
  });

  authSocket.on("leave-room", async (roomCode: string, callback) => {
    const couldLeave = await leaveRoom(authSocket, roomCode);
    callback(couldLeave);
  });

  authSocket.on("start-game", (roomCode: string) => {
    console.log("start game event received");
    startGame(socket, roomCode);
  });

  authSocket.on(
    "place-bet",
    async (roomCode: string, betAmount: number, callback) => {
      let room = roomManager.getRoom(roomCode);
      if (room) {
        let player = room.getPlayer(socket.id);
        if (!player) {
          return;
        }

        let user = await dbManager.getUser(authSocket.user.id);
        if (!user) {
          return;
        }

        let oldGameState = room.game.state.toClientGameState();

        let updatedGameState = room
          .placeBet(socket.id, betAmount, user!)
          .toClientGameState();
        console.log("bet placed, game state: ", updatedGameState);

        const success = updatedGameState !== oldGameState;

        callback({ success: success });

        const updatedGameStateForEmit = updatedGameState.toDTO();

        console.log("serialized game state: ", updatedGameStateForEmit);

        io.to(roomCode).emit("game-state-update", updatedGameStateForEmit);
      }
    }
  );

  authSocket.on("action", async (roomCode: string, action) => {
    console.log("action received");
    let room = roomManager.getRoom(roomCode);
    if (room) {
      let user = await dbManager.getUser(authSocket.user.id);
      let actionResult = await room.performAction(socket.id, action, user);

      io.to(roomCode).emit("game-state-update", actionResult[0].toDTO());

      if (actionResult[1] !== undefined) {
        console.log("round over");
        io.to(roomCode).emit("round-over", actionResult[1].toDTO());
      }
    }
  });

  authSocket.on("new-round", (roomCode: string) => {
    let room = roomManager.getRoom(roomCode);
    if (room) {
      if (room.game.state.currentPhase === "RoundOver") {
        let newGameState = room.game.newRound().toClientGameState();
        io.to(roomCode).emit("game-state-update", newGameState.toDTO());
      }
    }
  });

  authSocket.on("disconnect", async () => {
    console.log("user disconnected");
    let room = roomManager.getRoomThatPlayerIsIn(socket.id);
    if (room) {
      await leaveRoom(socket, room.code);
    }
  });
});

server.listen(SERVER_PORT, () => {
  console.log(`server running at http://localhost:${SERVER_PORT}`);
});