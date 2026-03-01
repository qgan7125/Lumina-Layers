from __future__ import annotations

import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from backend.session.store import get_session
from config import OUTPUT_DIR

router = APIRouter(prefix="/api/files", tags=["files"])


@router.get("/output/{filename}")
async def serve_output_file(filename: str) -> FileResponse:
    # Prevent path traversal
    safe_name = os.path.basename(filename)
    file_path = os.path.join(OUTPUT_DIR, safe_name)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)


@router.get("/session/{session_id}/{filename}")
async def serve_session_file(session_id: str, filename: str) -> FileResponse:
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    safe_name = os.path.basename(filename)
    file_path = os.path.join(OUTPUT_DIR, ".sessions", session_id, safe_name)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)
