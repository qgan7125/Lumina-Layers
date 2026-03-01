from __future__ import annotations

import asyncio
import os
import shutil
import time
import uuid
from typing import Any

import numpy as np

SESSION_TTL_SECONDS = 2 * 60 * 60  # 2 hours

_sessions: dict[str, dict[str, Any]] = {}
_lock = asyncio.Lock()


def _sessions_dir() -> str:
    from config import OUTPUT_DIR

    path = os.path.join(OUTPUT_DIR, ".sessions")
    os.makedirs(path, exist_ok=True)
    return path


def _session_dir(session_id: str) -> str:
    path = os.path.join(_sessions_dir(), session_id)
    os.makedirs(path, exist_ok=True)
    return path


async def create_session() -> str:
    session_id = str(uuid.uuid4())
    async with _lock:
        _sessions[session_id] = {
            "created_at": time.time(),
            "last_used": time.time(),
            "image_path": None,
            "cropped_path": None,
            "heightmap_path": None,
            "lut_path": None,
            "preview_cache": None,
        }
    return session_id


async def get_session(session_id: str) -> dict[str, Any] | None:
    async with _lock:
        session = _sessions.get(session_id)
        if session:
            session["last_used"] = time.time()
        return session


async def update_session(session_id: str, **fields: Any) -> None:
    async with _lock:
        if session_id not in _sessions:
            return
        _sessions[session_id].update(fields)
        _sessions[session_id]["last_used"] = time.time()


async def prune_old_sessions() -> None:
    """Remove sessions inactive for SESSION_TTL_SECONDS. Called by background task."""
    cutoff = time.time() - SESSION_TTL_SECONDS
    async with _lock:
        expired = [
            sid for sid, s in _sessions.items() if s["last_used"] < cutoff
        ]
        for sid in expired:
            del _sessions[sid]
            session_path = os.path.join(_sessions_dir(), sid)
            if os.path.isdir(session_path):
                shutil.rmtree(session_path, ignore_errors=True)


def get_session_sync(session_id: str) -> dict[str, Any] | None:
    """Synchronous read for use inside thread-pool workers."""
    session = _sessions.get(session_id)
    if session:
        session["last_used"] = time.time()
    return session
