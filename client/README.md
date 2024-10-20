# Frontend - Quick21 - Blackjack Game

## Overview
This is the frontend for the Quick21 Blackjack game. It is built with React + TS + Socket.IO (client) and uses Tailwind CSS for styling. No important logic is computed here to make it secure. A significant portion of the user interface (UI) for this project was designed with the assistance of AI language models, specifically ChatGPT and Claude AI. These AI tools were used to generate ideas, improve layouts, and optimize the user experience.

### Available Scripts
Since the server serves the build instead of connecting to a separate client instance, running this by itself would not be of much use.

## Project Structure

- `public/`: Contains the public assets (card images, icon, etc.) and the HTML template
- `src/`: Contains the source code for the React application.
  - `models/`: TypeScript interfaces and classes for game logic.
  - `pages/`: Components for different pages/routes in the application.
  - `main/`: Core application components (`App.tsx`).
  - `SocketContext.tsx`: Handles the authentication and session management using React's context API