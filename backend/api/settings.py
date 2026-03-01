from __future__ import annotations

import json
import os
import subprocess
import sys
from typing import Any

from fastapi import APIRouter, HTTPException

from backend.schemas.settings import (
    OpenInSlicerRequest,
    OpenInSlicerResponse,
    SettingsResponse,
    SettingsSaveRequest,
    SlicerInfo,
    SlicersResponse,
    StatsResponse,
)
from config import OUTPUT_DIR
from utils.stats import Stats

router = APIRouter(prefix="/api/settings", tags=["settings"])

_SETTINGS_FILE = os.path.join(OUTPUT_DIR, "user_settings.json")


def _load() -> dict[str, Any]:
    try:
        with open(_SETTINGS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _save(data: dict[str, Any]) -> None:
    with open(_SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


@router.get("", response_model=SettingsResponse)
async def get_settings() -> SettingsResponse:
    return SettingsResponse(settings=_load())


@router.post("", response_model=SettingsResponse)
async def save_settings(body: SettingsSaveRequest) -> SettingsResponse:
    current = _load()
    current.update(body.settings)
    _save(current)
    return SettingsResponse(settings=current)


@router.get("/stats", response_model=StatsResponse)
async def get_stats() -> StatsResponse:
    data = Stats.get_all()
    return StatsResponse(
        calibrations=data.get("calibrations", 0),
        extractions=data.get("extractions", 0),
        conversions=data.get("conversions", 0),
    )


@router.post("/clear-cache")
async def clear_cache() -> dict[str, Any]:
    success_count, failed = Stats.clear_cache()
    return {"cleared": success_count, "failed": failed}


@router.post("/reset-counters", response_model=StatsResponse)
async def reset_counters() -> StatsResponse:
    data = Stats.reset_all()
    return StatsResponse(**data)


# ── Slicer detection ──────────────────────────────────────────────────────────

_SLICER_CANDIDATES: list[dict[str, str]] = [
    {"id": "bambu", "name": "Bambu Studio", "exe_win": r"C:\Program Files\Bambu Studio\bambu-studio.exe"},
    {"id": "orca", "name": "OrcaSlicer", "exe_win": r"C:\Program Files\OrcaSlicer\orca-slicer.exe"},
    {"id": "prusa", "name": "PrusaSlicer", "exe_win": r"C:\Program Files\prusa3d\PrusaSlicer\prusa-slicer.exe"},
    {"id": "cura", "name": "Ultimaker Cura", "exe_win": r"C:\Program Files\Ultimaker Cura\UltiMaker-Cura.exe"},
]


def _detect_slicers() -> list[SlicerInfo]:
    settings = _load()
    custom: dict[str, str] = settings.get("custom_slicers", {})
    found: list[SlicerInfo] = []

    for c in _SLICER_CANDIDATES:
        exe = c.get("exe_win", "") if sys.platform == "win32" else ""
        if exe and os.path.isfile(exe):
            found.append(SlicerInfo(id=c["id"], name=c["name"], exe=exe))

    for sid, exe in custom.items():
        if os.path.isfile(exe) and sid not in {s.id for s in found}:
            found.append(SlicerInfo(id=sid, name=sid, exe=exe))

    return found


@router.get("/slicers", response_model=SlicersResponse)
async def get_slicers() -> SlicersResponse:
    return SlicersResponse(slicers=_detect_slicers())


@router.post("/open-in-slicer", response_model=OpenInSlicerResponse)
async def open_in_slicer(body: OpenInSlicerRequest) -> OpenInSlicerResponse:
    if not os.path.isfile(body.file_path):
        raise HTTPException(status_code=400, detail=f"File not found: {body.file_path}")

    slicers = _detect_slicers()
    for s in slicers:
        if s.id == body.slicer_id:
            try:
                subprocess.Popen([s.exe, body.file_path])
                return OpenInSlicerResponse(status=f"Opened in {s.name}")
            except Exception as exc:
                raise HTTPException(status_code=500, detail=str(exc))

    raise HTTPException(status_code=404, detail=f"Slicer '{body.slicer_id}' not found")
