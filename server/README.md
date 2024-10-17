# Backend - Quick21 - Blackjack Game

## Overview

This is the backend for the Quick21 Blackjack game, built with Node.js using Express.js and mainly Socket.IO. It handles user authentication, game logic, storage, and real-time communication. The server serves the build from the client using Node.

### Available Scripts

In the project directory, you can run:

#### `npm start`

Starts the server using `node`.

### `npm run dev`

Starts the server in development mode using `nodemon`, allowing for hot-reload.

#### `npm run build`

Builds the TypeScript files into JavaScript.

### API Endpoints

- `POST /register`: Register a new user.
- `POST /login`: Login an existing user.
- `POST /admin/add-money`: Add money to any given user, as long as you are an admin.

### WebSocket Events
The server listens for WebSocket events from the client and sends back updated information through callback, a response (that the client listen for) or a general `game-state-update` event which is emitted. Here is a list of all events that the client can call:

- `connect`: Connect to the WebSocket
- `disconnect`: Disconnect from the WebSocket
- `get-user-info`: Get the info of a given user (id, username, balance).
- `create-room`: Create a new game room.
- `join-room`: Join an existing game room.
- `leave-room`: Leave a room.
- `start-game`: Start the game in a room.
- `place-bet`: Place a bet in the current game.
- `action`: Perform an action in the game.
- `new-round`: Start a new round.

## Project Structure

- `db/`: Contains the SQLite database file.
- `src/`: Contains the source code for the backend application.
  - `database/`: Database management and operations.
  - `models/`: TypeScript interfaces and classes for game logic.
  - `game.ts`: Core game logic implementation.
  - `room.ts` & `room_manager.ts`: Manage game rooms and players.
  - `server.ts`: Main server file where are requests are handled.
- `tests/`: Contains tests for the application.