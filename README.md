# Quick21 - Blackjack Game

## Overview

Quick21 is a multiplayer web implementation of the classic Blackjack game, built with React for the frontend and Express + Socket.IO for the backend. This project is designed to provide a fast and simple experience. A live version is available at [Quick21](https://quick21.onrender.com).

## Setup

### Prerequisites

- [Git](https://git-scm.com/downloads)
- [Node.js v14 or higher](https://nodejs.org/en/download/package-manager)

### Installation

This project was tested using Windows 11 and macOS Sonoma. In order not to go beyond the scope of the project, not all packages were tested for vulnerabilities. The game is designed for larger, horizontal screens, though it can still function on smaller devices like phones with the drawback of some UI overlap.

1. Clone the repository:
   ```sh
   git clone https://github.com/mdbrnd/quick21.git
   cd quick21
   ```
2. Create a `.env` file in the root directory (the resulting path should be `quick21/.env`) and add the following:

   ```env
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

   The JWT_SECRET is used to sign and verify JWT tokens for authentication and is recommended to be a long, random string. For example: a74a38b67019bda7033e03e528f0f65b130a83a77aa92108d97b50896eb93c5c871051661b985ed313c42753a22b1dec3364a66e1da6d845d86610a5d6ac712a (usually even longer)

   The NODE_ENV variable specificies which environment the application is running in (production or development)

3. Create a `.env` file in the `client` directory (the resulting path should be `quick21/client/.env`) and add the following:
   ```env
   REACT_APP_ENV=development
   ```
   This is required as Create React App does not allow the user to modify the NODE_ENV variable, meaning we have to create our own.

### Running the Application

1. Build the files and start the server using a single command:

   ```sh
   npm run start:dev
   ```

2. Open [http://localhost:4000](http://localhost:4000) to view the application in your browser.

## Project Structure

- `client/`: Contains the React frontend application.
- `server/`: Contains the Express + socket.io backend application.

More details for the project structure can be found in the respective `README.md` files of the `client` and `server` directories.

## License

This project is licensed under the MIT License.
