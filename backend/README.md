# Backend

FastAPI server for Lumina Studio.

## Setup

```bash
cd backend

# Create and activate virtual environment (first time only)
python3 -m venv fastapi-env
source fastapi-env/bin/activate      # Linux / macOS
# fastapi-env\Scripts\activate       # Windows

# Install dependencies
pip install -r requirements.txt
```

## Start the server

```bash
# From the repo root
source backend/fastapi-env/bin/activate
uvicorn backend.main:app --reload --port 7860
```

Or from inside the `backend/` directory:

```bash
cd backend
source fastapi-env/bin/activate
uvicorn main:app --reload --port 7860
```

Server runs at `http://localhost:7860`.
Interactive API docs at `http://localhost:7860/docs`.

## Start with the frontend (recommended)

From the repo root, `yarn dev` starts both backend and frontend together:

```bash
yarn dev
```

See [docs/main.md](../docs/main.md) for the full getting started guide.
