# Lumina Studio

Physics-based multi-material FDM color printing tool.

Converts images and SVGs into layered 3MF models optimized for multi-filament 3D printers (Bambu Lab, Prusa XL, etc.) using a LUT-based color matching system.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Backend | Python · FastAPI · uvicorn |
| Frontend | React 18 · TypeScript · Vite |
| UI components | Material UI v6 · SCSS modules |
| Routing | TanStack Router (file-based) |
| API types | OpenAPI → `@hey-api/openapi-ts` codegen |
| 3D preview | Three.js + GLTFLoader |
| Package manager | Yarn (workspaces monorepo) |

---

## Getting Started

**Prerequisites**: Python 3.10+, Node.js 18+, Yarn

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Install JS dependencies (single lockfile at root)
yarn install

# 3. Generate TypeScript API types from the backend schema
#    (requires backend to be running — run once after install)
yarn dev &
yarn generate-api

# 4. Start everything
yarn dev
```

`yarn dev` starts both processes together:
- `[backend]` FastAPI on `http://localhost:7860`
- `[frontend]` Vite dev server on `http://localhost:5173` (proxies `/api` → `:7860`)

Open `http://localhost:5173` in your browser.

---

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start backend + frontend together |
| `yarn build` | Build frontend for production (`frontend/dist/`) |
| `yarn generate-api` | Regenerate TypeScript types from `/openapi.json` |

---

## Docs

- [Architecture overview](architecture.md) — folder structure, key decisions, migration plan
- [Backend](backend.md) — API endpoints, job queue, session management
- [Frontend](frontend.md) — component tree, routing, styling, OpenAPI codegen

---

## Project Layout

```
Lumina-Layers/
├── core/           ← Image processing, mesh generation, color matching (Python)
├── utils/          ← LUT manager, file helpers, stats
├── config.py       ← Printer config, enums, color systems
├── backend/        ← FastAPI app
├── frontend/       ← React app
├── docs/           ← This documentation
├── lut-npy预设/    ← Bundled LUT presets
└── output/         ← Runtime output (generated files, session uploads)
```
