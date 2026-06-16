# Queue Cure '26 — Frontend

Real-time clinic token queue. Two routes:

- `/reception` — staff controls (add patient, call next, undo, set avg time)
- `/patient` — public waiting-room display

Both pages render from the server snapshot (`queue:state`) and update live via Socket.IO.

## Run

```bash
bun install
bun dev
```

Vite dev port is **5173** — whitelist it in the backend CORS config.

## Backend URL

Defaults to `http://localhost:3000`. Override with:

```bash
VITE_SERVER_URL=http://localhost:3000 bun dev
```