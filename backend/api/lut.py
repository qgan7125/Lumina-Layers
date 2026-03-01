from __future__ import annotations

import os
import shutil
import uuid
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, UploadFile

from backend.adapters.converter_adapter import adapter_extract_lut_colors
from backend.jobs.queue import get_job, submit_job
from backend.schemas.common import JobResponse, JobStatusResponse
from backend.schemas.lut import (
    LutColorsResponse,
    LutEntry,
    LutListResponse,
    LutMergeRequest,
    LutUploadResponse,
)
from utils.lut_manager import LUTManager

router = APIRouter(prefix="/api/lut", tags=["lut"])


@router.get("/list", response_model=LutListResponse)
async def list_luts() -> LutListResponse:
    luts = LUTManager.get_all_lut_files()
    entries = [LutEntry(name=name, path=path) for name, path in luts.items()]
    return LutListResponse(luts=entries)


@router.post("/upload", response_model=LutUploadResponse)
async def upload_lut(file: UploadFile, custom_name: str = "") -> LutUploadResponse:
    custom_dir = os.path.join(LUTManager.LUT_PRESET_DIR, "Custom")
    os.makedirs(custom_dir, exist_ok=True)

    original_stem = Path(file.filename or "custom").stem
    ext = Path(file.filename or "custom.npy").suffix
    if ext not in (".npy", ".npz"):
        raise HTTPException(status_code=400, detail="Only .npy and .npz files are supported")

    final_name = (custom_name.strip() or original_stem) or "custom_lut"
    final_name = "".join(c for c in final_name if c.isalnum() or c in (" ", "-", "_"))
    final_name = final_name.strip() or "custom_lut"

    dest_path = os.path.join(custom_dir, f"{final_name}{ext}")
    counter = 1
    while os.path.exists(dest_path):
        dest_path = os.path.join(custom_dir, f"{final_name}_{counter}{ext}")
        counter += 1

    content = await file.read()
    with open(dest_path, "wb") as f:
        f.write(content)

    display_name = f"Custom - {Path(dest_path).stem}"
    return LutUploadResponse(name=display_name, path=dest_path)


@router.delete("/{lut_name}")
async def delete_lut(lut_name: str) -> dict[str, str]:
    success, message, _ = LUTManager.delete_lut(lut_name)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"status": message}


@router.get("/{lut_name}/colors", response_model=LutColorsResponse)
async def lut_colors(lut_name: str) -> LutColorsResponse:
    luts = LUTManager.get_all_lut_files()
    if lut_name not in luts:
        raise HTTPException(status_code=404, detail=f"LUT '{lut_name}' not found")
    colors = adapter_extract_lut_colors(luts[lut_name])
    return LutColorsResponse(colors=colors)


@router.post("/merge", response_model=JobResponse)
async def merge_luts(body: LutMergeRequest) -> JobResponse:
    luts = LUTManager.get_all_lut_files()
    primary = luts.get(body.primary_lut_name)
    secondary = luts.get(body.secondary_lut_name)
    if not primary:
        raise HTTPException(status_code=404, detail=f"LUT '{body.primary_lut_name}' not found")
    if not secondary:
        raise HTTPException(status_code=404, detail=f"LUT '{body.secondary_lut_name}' not found")
    threshold = body.dedup_threshold

    def _work() -> dict[str, Any]:
        from core.lut_merger import LUTMerger
        import numpy as np

        def _load(path: str):
            if path.endswith(".npz"):
                d = np.load(path)
                return d["rgb"], d["stacks"], LUTMerger.detect_color_mode(path)
            data = np.load(path)
            flat = data.reshape(-1, 3)
            mode = LUTMerger.detect_color_mode(path)
            # Build dummy stacks for standard LUTs (not used in merge dedup)
            stacks = np.zeros((len(flat), 5), dtype=np.int32)
            return flat, stacks, mode

        entries = [_load(primary), _load(secondary)]
        merged_rgb, merged_stacks, stats = LUTMerger.merge_luts(entries, dedup_threshold=threshold)

        out_name = f"merged_{uuid.uuid4().hex[:8]}.npz"
        from config import OUTPUT_DIR
        out_path = os.path.join(OUTPUT_DIR, out_name)
        np.savez(out_path, rgb=merged_rgb, stacks=merged_stacks)
        return {"filename": out_name, "file_path": out_path, "stats": stats}

    job = await submit_job(_work)
    return JobResponse(job_id=job.id)


@router.get("/merge-status/{job_id}", response_model=JobStatusResponse)
async def merge_status(job_id: str) -> JobStatusResponse:
    record = await get_job(job_id)
    if not record:
        raise HTTPException(status_code=404, detail="Job not found")
    result = None
    if record.result:
        r = record.result
        result = {
            "file_url": f"/api/files/output/{r['filename']}",
            "filename": r["filename"],
            "stats": r.get("stats"),
        }
    return JobStatusResponse(
        job_id=job_id,
        status=record.status,
        result=result,
        error=record.error,
    )
