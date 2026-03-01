from __future__ import annotations

import os
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, UploadFile

from backend.adapters.converter_adapter import (
    adapter_apply_replacement,
    adapter_auto_detect_colors,
    adapter_auto_height_map,
    adapter_batch_generate,
    adapter_generate_3mf,
    adapter_generate_preview,
    adapter_highlight_color,
)
from backend.jobs.queue import get_job, submit_job
from backend.schemas.common import JobResponse, JobStatusResponse
from backend.schemas.converter import (
    ApplyReplacementRequest,
    ApplyReplacementResponse,
    AutoDetectColorsRequest,
    AutoHeightMapRequest,
    AutoHeightMapResponse,
    BatchGenerateRequest,
    Generate3mfRequest,
    GeneratePreviewRequest,
    HighlightColorRequest,
    HighlightColorResponse,
    UploadImageResponse,
)
from backend.session.store import create_session, get_session, update_session
from config import OUTPUT_DIR
from utils.lut_manager import LUTManager

router = APIRouter(prefix="/api/converter", tags=["converter"])


def _session_dir(session_id: str) -> str:
    path = os.path.join(OUTPUT_DIR, ".sessions", session_id)
    os.makedirs(path, exist_ok=True)
    return path


def _lut_path(lut_name: str) -> str:
    luts = LUTManager.get_all_lut_files()
    if lut_name not in luts:
        raise HTTPException(status_code=404, detail=f"LUT '{lut_name}' not found")
    return luts[lut_name]


def _preview_url(session_id: str, filename: str) -> str:
    return f"/api/files/session/{session_id}/{filename}"


@router.post("/upload-image", response_model=UploadImageResponse)
async def upload_image(file: UploadFile) -> UploadImageResponse:
    session_id = await create_session()
    dest_dir = _session_dir(session_id)
    filename = file.filename or f"{uuid.uuid4()}.png"
    dest_path = os.path.join(dest_dir, filename)
    content = await file.read()
    with open(dest_path, "wb") as f:
        f.write(content)
    await update_session(session_id, image_path=dest_path)
    return UploadImageResponse(
        session_id=session_id, image_path=dest_path, filename=filename
    )


@router.post("/upload-heightmap")
async def upload_heightmap(session_id: str, file: UploadFile) -> dict[str, str]:
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    dest_path = os.path.join(_session_dir(session_id), "heightmap.png")
    content = await file.read()
    with open(dest_path, "wb") as f:
        f.write(content)
    await update_session(session_id, heightmap_path=dest_path)
    return {"heightmap_path": dest_path}


@router.post("/generate-preview", response_model=JobResponse)
async def generate_preview(body: GeneratePreviewRequest) -> JobResponse:
    session = await get_session(body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    image_path = session.get("image_path")
    if not image_path:
        raise HTTPException(status_code=400, detail="No image in session")
    lut_path = _lut_path(body.lut_name)
    session_id = body.session_id

    def _work() -> dict[str, Any]:
        result = adapter_generate_preview(
            session_id=session_id,
            image_path=image_path,
            lut_path=lut_path,
            target_width_mm=body.target_width_mm,
            auto_bg=body.auto_bg,
            bg_tol=body.bg_tol,
            color_mode=body.color_mode,
            modeling_mode=body.modeling_mode,
            quantize_colors=body.quantize_colors,
            backing_color_id=body.backing_color_id,
            enable_cleanup=body.enable_cleanup,
            is_dark=body.is_dark,
        )
        # Cache is stored back into the session inside the worker
        return result

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
        if "preview_path" in r:
            preview_path = r.get("preview_path", "")
            session_id = os.path.basename(os.path.dirname(preview_path))
            result = {
                "type": "preview",
                "preview_url": _preview_url(session_id, os.path.basename(preview_path)),
                "color_palette": r.get("color_palette", []),
                "dimensions": r.get("dimensions"),
                "status_text": r.get("status", ""),
            }
        elif "filename" in r:
            result = {
                "type": "3mf",
                "file_url": f"/api/files/output/{r['filename']}",
                "filename": r["filename"],
            }
    return JobStatusResponse(
        job_id=job_id,
        status=record.status,
        result=result,
        error=record.error,
    )


@router.post("/apply-replacement", response_model=ApplyReplacementResponse)
async def apply_replacement(body: ApplyReplacementRequest) -> ApplyReplacementResponse:
    session = await get_session(body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    cache = session.get("preview_cache")
    if not cache:
        raise HTTPException(
            status_code=400, detail="No preview cache — run generate-preview first"
        )

    result, updated_cache = adapter_apply_replacement(
        cache=cache,
        color_replacements=body.color_replacements,
        session_id=body.session_id,
    )
    await update_session(body.session_id, preview_cache=updated_cache)
    preview_filename = os.path.basename(result["preview_path"])
    return ApplyReplacementResponse(
        preview_url=_preview_url(body.session_id, preview_filename),
        color_palette=result["color_palette"],
    )


@router.post("/highlight-color", response_model=HighlightColorResponse)
async def highlight_color(body: HighlightColorRequest) -> HighlightColorResponse:
    session = await get_session(body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    cache = session.get("preview_cache")
    if not cache:
        raise HTTPException(
            status_code=400, detail="No preview cache — run generate-preview first"
        )

    result = adapter_highlight_color(
        cache=cache,
        highlight_color=body.highlight_color,
        session_id=body.session_id,
    )
    preview_filename = os.path.basename(result["preview_path"])
    return HighlightColorResponse(
        preview_url=_preview_url(body.session_id, preview_filename)
    )


@router.post("/generate-3mf", response_model=JobResponse)
async def generate_3mf(body: Generate3mfRequest) -> JobResponse:
    session = await get_session(body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    image_path = session.get("image_path")
    if not image_path:
        raise HTTPException(status_code=400, detail="No image in session")
    lut_path = _lut_path(body.lut_name)
    session_id = body.session_id

    def _work() -> dict[str, Any]:
        return adapter_generate_3mf(
            session_id=session_id,
            image_path=image_path,
            lut_path=lut_path,
            target_width_mm=body.target_width_mm,
            spacer_thick=body.spacer_thick,
            structure_mode=body.structure_mode,
            auto_bg=body.auto_bg,
            bg_tol=body.bg_tol,
            color_mode=body.color_mode,
            add_loop=body.add_loop,
            loop_width=body.loop_width,
            loop_length=body.loop_length,
            loop_hole=body.loop_hole,
            loop_pos=body.loop_pos,
            modeling_mode=body.modeling_mode,
            quantize_colors=body.quantize_colors,
            color_replacements=body.color_replacements,
            backing_color_name=body.backing_color_name,
            separate_backing=body.separate_backing,
            enable_relief=body.enable_relief,
            color_height_map=body.color_height_map,
            heightmap_path=session.get("heightmap_path"),
            heightmap_max_height=body.heightmap_max_height,
            enable_cleanup=body.enable_cleanup,
            enable_outline=body.enable_outline,
            outline_width=body.outline_width,
            enable_cloisonne=body.enable_cloisonne,
            wire_width_mm=body.wire_width_mm,
            wire_height_mm=body.wire_height_mm,
            free_color_set=body.free_color_set,
            enable_coating=body.enable_coating,
            coating_height_mm=body.coating_height_mm,
        )

    job = await submit_job(_work)
    return JobResponse(job_id=job.id)


@router.post("/auto-height-map", response_model=AutoHeightMapResponse)
async def auto_height_map(body: AutoHeightMapRequest) -> AutoHeightMapResponse:
    result = adapter_auto_height_map(
        color_list=body.color_list,
        mode=body.mode,
        base_thickness=body.base_thickness,
        max_relief_height=body.max_relief_height,
    )
    return AutoHeightMapResponse(color_height_map=result["color_height_map"])


@router.post("/auto-detect-colors")
async def auto_detect_colors(body: AutoDetectColorsRequest) -> dict[str, Any]:
    session = await get_session(body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    image_path = session.get("image_path")
    if not image_path:
        raise HTTPException(status_code=400, detail="No image in session")
    return adapter_auto_detect_colors(image_path=image_path, num_colors=body.num_colors)


@router.post("/batch-generate", response_model=JobResponse)
async def batch_generate(body: BatchGenerateRequest) -> JobResponse:
    lut_path = _lut_path(body.lut_name)
    image_paths: list[str] = []
    for sid in body.session_ids:
        s = await get_session(sid)
        if s and s.get("image_path"):
            image_paths.append(s["image_path"])

    def _work() -> dict[str, Any]:
        return adapter_batch_generate(
            image_paths=image_paths,
            lut_path=lut_path,
            target_width_mm=body.target_width_mm,
            spacer_thick=body.spacer_thick,
            structure_mode=body.structure_mode,
            auto_bg=body.auto_bg,
            bg_tol=body.bg_tol,
            color_mode=body.color_mode,
            modeling_mode=body.modeling_mode,
            quantize_colors=body.quantize_colors,
            backing_color_name=body.backing_color_name,
        )

    job = await submit_job(_work)
    return JobResponse(job_id=job.id)

