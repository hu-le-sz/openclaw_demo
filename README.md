# OpenClaw Insecure Demo (intentionally vulnerable)

**WARNING:** This repo is intentionally insecure and includes outdated dependencies and vulnerable code patterns
for **security tooling evaluation/training only**. Do **not** deploy this to production or expose it to the internet.

## What this repo is designed to help you test

### 1) Discover where OpenClaw is used
- `apps/api/src/openclaw-client.js` imports `openclaw`
- `apps/api/config/openclaw.yaml` references OpenClaw configuration
- `skills/*` contains example OpenClaw “skills” content
- `docker-compose.yml` includes an `openclaw`-named service

### 2) Scan for vulnerabilities + license compliance
- `apps/api/package.json` pins several **known-vulnerable** npm packages
- `packages/copyleft-lib` is a local workspace package marked **GPL-3.0-only** to trigger license policy findings

### 3) Monitor dependencies
- Everything is pinned so you can see “upgrade path” recommendations and alerts.

## Quick start (local only)
```bash
npm install
npm -w apps/api run start
```

Server runs on http://localhost:3000

## Insecure endpoints (examples)
- `GET /run?cmd=...` (command execution)
- `GET /read?path=...` (path traversal)
- `POST /merge` (prototype pollution-style merge)
- `POST /render` (template injection / unsafe handlebars options)
- `GET /debug/env` (information disclosure)
