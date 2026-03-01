from __future__ import annotations

import os
import uuid
from typing import Any  # used in _work() return type

from fastapi import APIRouter, HTTPException, UploadFile

from backend.adapters.extractor_adapter import (
    adapter_manual_fix_cell,
    adapter_merge_8color,
    adapter_probe_lut_cell,
    adapter_rotate_image,
    adapter_run_extraction,
)
from backend.jobs.queue import get_job, submit_job
from backend.schemas.common import JobResponse, JobStatusResponse
from backend.schemas.extractor import (
    ExtractRequest,
    ManualFixCellRequest,
    ManualFixCellResponse,
    Merge8ColorRequest,
    Merge8ColorResponse,
    ProbeCellRequest,
    ProbeCellResponse,
    RotateRequest,
    RotateResponse,
    UploadExtractorImageResponse,
)
from backend.session.store import create_session, get_session, update_session
from config import OUTPUT_DIR
from utils.lut_manager import LUTManager

router = APIRouter(prefix="/api/extractor", tags=["extractor"])


def _session_dir(session_id: str) -> str:
    path = os.path.join(OUTPUT_DIR, ".sessions", session_id)
    os.makedirs(path, exist_ok=True)
    return path


def _preview_url(session_id: str, filename: str) -> str:
    return f"/api/files/session/{session_id}/{filename}"


def _lut_path(lut_name: str) -> str:
    luts = LUTManager.get_all_lut_files()
    if lut_name not in luts:
        raise HTTPException(status_code=404, detail=f"LUT '{lut_name}' not found")
    return luts[lut_name]


@router.post("/upload", response_model=UploadExtractorImageResponse)
async def upload_extractor_image(file: UploadFile) -> UploadExtractorImageResponse:
    session_id = await create_session()
    dest_dir = _session_dir(session_id)
    filename = file.filename or f"{uuid.uuid4()}.png"
    dest_path = os.path.join(dest_dir, filename)
    content = await file.read()
    with open(dest_path, "wb") as f:
        f.write(content)
    await update_session(session_id, image_path=dest_path)
    return UploadExtractorImageResponse(session_id=session_id, image_path=dest_path)


@router.post("/rotate", response_model=RotateResponse)
async def rotate(body: RotateRequest) -> RotateResponse:
    session = await get_session(body.session_id)
    if not session or not session.get("image_path"):
        raise HTTPException(status_code=404, detail="Session or image not found")
    result = adapter_rotate_image(
        image_path=session["image_path"],
        direction=body.direction,
        session_id=body.session_id,
    )
    await update_session(body.session_id, image_path=result["image_path"])
    return RotateResponse(image_path=result["image_path"])



@router.post("/extract", response_model=JobResponse)
async def extract(body: ExtractRequest) -> JobResponse:
    req = body
    session = await get_session(req.session_id)
    if not session or not session.get("image_path"):
        raise HTTPException(status_code=404, detail="Session or image not found")
    image_path = session["image_path"]
    session_id = req.session_id

    def _work() -> dict[str, Any]:
        return adapter_run_extraction(
            image_path=image_path,
            points=req.points,
            offset_x=req.offset_x,
            offset_y=req.offset_y,
            zoom=req.zoom,
            barrel=req.barrel,
            wb=req.wb,
            bright=req.bright,
            color_mode=req.color_mode,
            session_id=session_id,
        )

    job = await submit_job(_work)
    return JobResponse(job_id=job.id)


@router.get("/job-status/{job_id}", response_model=JobStatusResponse)
async def job_status(job_id: str) -> JobStatusResponse:
    record = await get_job(job_id)
    if not record:
        raise HTTPException(status_code=404, detail="Job not found")
    result = None
    if record.result:
        r = record.result
        session_id = os.path.basename(os.path.dirname(r.get("vis_path", "")))
        result = {
            "vis_url": _preview_url(session_id, os.path.basename(r["vis_path"])),
            "preview_url": _preview_url(session_id, os.path.basename(r["preview_path"])),
            "lut_path": r["lut_path"],
            "status_text": r["status"],
        }
    return JobStatusResponse(
        job_id=job_id,
        status=record.status,
        result=result,
        error=record.error,
    )


@router.post("/probe-cell", response_model=ProbeCellResponse)
async def probe_cell(body: ProbeCellRequest) -> ProbeCellResponse:
    lut_path = _lut_path(body.lut_name)
    result = adapter_probe_lut_cell(lut_path=lut_path, x=body.x, y=body.y)
    if not result.get("hex"):
        raise HTTPException(status_code=400, detail="Could not probe cell")
    return ProbeCellResponse(hex=result["hex"], coord=result["coord"])


@router.post("/manual-fix-cell", response_model=ManualFixCellResponse)
async def manual_fix_cell(body: ManualFixCellRequest) -> ManualFixCellResponse:
    lut_path = _lut_path(body.lut_name) if body.lut_name else None
    result = adapter_manual_fix_cell(
        coord=body.coord, color_hex=body.color_hex, lut_path=lut_path
    )
    return ManualFixCellResponse(status=result["status"])


@router.post("/merge-8color", response_model=Merge8ColorResponse)
async def merge_8color(body: Merge8ColorRequest) -> Merge8ColorResponse:
    paths = [_lut_path(name) for name in body.lut_names]
    result = adapter_merge_8color(lut_paths=paths)
    return Merge8ColorResponse(filename=result["filename"])
