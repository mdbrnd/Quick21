# Backend - Quick21 - Blackjack Game

## Overview

This is the backend for the Quick21 Blackjack game, built with Node.js (Express) and mainly socket.io. It handles user authentication, game logic, storage, and real-time communication.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- SQLite3

### Installation

1. Clone the repository (if not already done):
   ```sh
   git clone https://github.com/mdbrnd/quick21.git
   cd quick21/server
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the `server` directory and add the following:
   ```env
   JWT_SECRET=your_jwt_secret
   ```
   The JWT_SECRET is used to sign and verify JWT tokens for authentication and is recommended to be a long, random string.

4. Set up the SQLite database:
   - Ensure you have SQLite3 installed on your machine.
   - Create a db folder in the root of the project. (server/db)
   ```sh
   mkdir db
   ```
   - Create a new SQLite database file named `database.sqlite`. (server/db/database.sqlite)

5. Start the server:
   ```sh
   npm start
   ```

### Available Scripts

In the project directory, you can run:

#### `npm start`

Starts the server in development mode using `nodemon`.

#### `npm run build`

Builds the TypeScript files into JavaScript.

### API Endpoints

- `POST /register`: Register a new user.
- `POST /login`: Login an existing user.

### WebSocket Events

- `create-room`: Create a new game room.
- `join-room`: Join an existing game room.
- `leave-room`: Leave a room.
- `start-game`: Start the game in a room.
- `place-bet`: Place a bet in the current game.
- `action`: Perform an action in the game.
- `new-round`: Start a new round.

## Project Structure

- `src/`: Contains the source code for the backend.
- `db/`: Contains the SQLite database file.

## License

This project is licensed under the MIT License.