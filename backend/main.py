from __future__ import annotations

import asyncio
import os
import sys
from contextlib import asynccontextmanager

# Allow both invocation styles:
#   from project root:  uvicorn backend.main:app
#   from backend/:      uvicorn main:app
_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi

from backend.api import calibration, converter, extractor, files, lut
from backend.api.settings import router as settings_router
from backend.jobs.queue import prune_old_jobs
from backend.session.store import prune_old_sessions


async def _background_pruner() -> None:
    """Runs every 10 minutes to evict stale sessions and job records."""
    while True:
        await asyncio.sleep(600)
        await prune_old_sessions()
        await prune_old_jobs()


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(_background_pruner())
    yield
    task.cancel()


app = FastAPI(
    title="Lumina Studio",
    version="2.0.0",
    description="Physics-based multi-material FDM color printing API",
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan,
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(converter.router)
app.include_router(calibration.router)
app.include_router(extractor.router)
app.include_router(lut.router)
app.include_router(settings_router)
app.include_router(files.router)


# ── Custom Swagger UI ─────────────────────────────────────────────────────────
@app.get("/docs", include_in_schema=False)
async def swagger_ui():
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="Lumina Studio — API Docs",
        swagger_ui_parameters={
            "persistAuthorization": True,
            "displayRequestDuration": True,
            "filter": True,
            "tryItOutEnabled": True,
        },
    )


@app.get("/openapi.json", include_in_schema=False)
async def openapi_schema():
    return get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )


@app.get("/api/health", tags=["health"])
async def health():
    return {"status": "ok"}
