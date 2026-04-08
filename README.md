# TicTacGo Client

A premium, real-time frontend for TicTacGo, built with **Next.js** and **Nakama JS**.

## ✨ Features
- **Seamless Multiplayer**: Play against friends or random opponents.
- **Dynamic Modes**: Supports Classic and High-intensity Timed modes.
- **Rich UI**: Built with modern aesthetics, glassmorphism, and smooth animations.
- **Real-time Synchronization**: Instant state updates via WebSockets.

## 🛠️ Tech Stack
- **Next.js 15 (App Router)**: Modern React framework.
- **Nakama JS Client**: For real-time communication with the backend.
- **Tailwind CSS & Framer Motion**: For premium styling and animations.
- **Zustand**: Lightweight state management.

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- A running [TicTacGo Service](https://github.com/DevaSinha/TicTacGo-service)

### Local Setup
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Configure Environment**: Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_NAKAMA_HOST=127.0.0.1
   NEXT_PUBLIC_NAKAMA_PORT=7350
   NEXT_PUBLIC_NAKAMA_SERVER_KEY=tictactoe-server-key
   NEXT_PUBLIC_NAKAMA_USE_SSL=false
   ```
3. **Run Dev Server**:
   ```bash
   npm run dev
   ```