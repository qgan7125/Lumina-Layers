from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class SettingsResponse(BaseModel):
    settings: dict[str, Any]


class SettingsSaveRequest(BaseModel):
    settings: dict[str, Any]


class StatsResponse(BaseModel):
    calibrations: int = 0
    extractions: int = 0
    conversions: int = 0


class SlicerInfo(BaseModel):
    id: str
    name: str
    exe: str


class SlicersResponse(BaseModel):
    slicers: list[SlicerInfo]


class OpenInSlicerRequest(BaseModel):
    file_path: str
    slicer_id: str


class OpenInSlicerResponse(BaseModel):
    status: str
