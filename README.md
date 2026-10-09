# Realtime Chat (Socket.io + React)

Sprint 12 Track B: bidirectional chat with usernames, typing indicators, and isolated rooms.

## Run locally
```bash
# terminal 1
cd server && npm install && npm start      # http://localhost:4000

# terminal 2
cd client && npm install && npm run dev    # http://localhost:5173
```
Open two browser windows, join with different names, and test messaging, typing indicators, and room isolation.

## Environment
- `server`: `PORT` (default 4000), `CLIENT_ORIGIN` (comma-separated allowed origins, default `http://localhost:5173`)
- `client`: `VITE_SERVER_URL` (default `http://localhost:4000`)

## Deploy
- **Server (Render/Railway):** root `server`, build `npm install`, start `npm start`, set `CLIENT_ORIGIN` to your frontend URL.
- **Client (Vercel):** root `client`, framework Vite, set `VITE_SERVER_URL` to your server URL.

## Features by phase
- **P0:** handshake logging, socket.io-client connection, send, server broadcast, render.
- **P1:** username prompt, `[Name]: text` format, typing events and indicator.
- **P2:** rooms General and Tech Support, with room-scoped broadcasts via `io.to(room)`.

## Demo script (3 min)
1. Two windows side by side, join as "Nakul" and "Asha".
2. Send messages and show the typing indicator.
3. Switch Asha to Tech Support and show General messages don't reach her.
4. Show the server logs.
