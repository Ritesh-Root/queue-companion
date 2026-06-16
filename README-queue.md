# Queue Cure '26 — Frontend

Real-time clinic token queue. Two routes:

- `/reception` — staff controls (add patient, call next, undo, set avg time)
- `/patient` — public waiting-room display

Both pages render from the server snapshot (`queue:state`) and update live via Socket.IO.

> **Backend:** this frontend talks to the **[queue-cure-server](https://github.com/Ritesh-Root/queue-cure-server)** repo (Node + Express + Socket.IO). Start that server first.

## Run

```bash
bun install
bun dev
```

Vite dev port is **5173** — whitelist it in the backend CORS config.

## Backend URL

Talks to the **[queue-cure-server](https://github.com/Ritesh-Root/queue-cure-server)** backend over Socket.IO. Defaults to `http://localhost:3000`. Override with:

```bash
VITE_SERVER_URL=http://localhost:3000 bun dev
```

For a deployed backend, set `VITE_SERVER_URL` to its URL, and make sure the backend's
`CORS_ORIGINS` includes this app's origin.