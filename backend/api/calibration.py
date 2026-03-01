from __future__ import annotations

import os
from typing import Any

from fastapi import APIRouter, HTTPException

from backend.jobs.queue import get_job, submit_job
from backend.schemas.calibration import GenerateCalibrationRequest
from backend.schemas.common import JobResponse, JobStatusResponse

router = APIRouter(prefix="/api/calibration", tags=["calibration"])


def _do_generate(mode: str, block_size_mm: float, gap_mm: float,
                 backing_color: str, page_index: int) -> dict[str, Any]:
    # Import here so gradio stub is already in sys.modules
    from core.calibration import (
        generate_8color_batch_zip,
        generate_8color_board,
        generate_bw_calibration_board,
        generate_calibration_board,
        generate_smart_board,
    )

    if mode == "smart":
        result = generate_smart_board(block_size_mm=block_size_mm, gap_mm=gap_mm)
        out_path, *_ = result if isinstance(result, tuple) else (result,)
    elif mode == "8-Color":
        result = generate_8color_board(page_index=page_index)
        out_path, *_ = result if isinstance(result, tuple) else (result,)
    elif mode == "8-Color-batch":
        out_path = generate_8color_batch_zip()
    elif mode == "BW":
        result = generate_bw_calibration_board(
            block_size_mm=block_size_mm, gap_mm=gap_mm, backing_color=backing_color
        )
        out_path, *_ = result if isinstance(result, tuple) else (result,)
    else:
        result = generate_calibration_board(
            color_mode=mode,
            block_size_mm=block_size_mm,
            gap_mm=gap_mm,
            backing_color=backing_color,
        )
        out_path, *_ = result if isinstance(result, tuple) else (result,)

    filename = os.path.basename(str(out_path))
    return {"filename": filename, "file_path": str(out_path)}


@router.post("/generate", response_model=JobResponse)
async def generate_calibration(body: GenerateCalibrationRequest) -> JobResponse:
    mode = body.mode
    block_size_mm = body.block_size_mm
    gap_mm = body.gap_mm
    backing_color = body.backing_color
    page_index = body.page_index

    def _work() -> dict[str, Any]:
        return _do_generate(mode, block_size_mm, gap_mm, backing_color, page_index)

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
        result = {
            "file_url": f"/api/files/output/{r['filename']}",
            "filename": r["filename"],
        }
    return JobStatusResponse(
        job_id=job_id,
        status=record.status,
        result=result,
        error=record.error,
    )
