from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class LutEntry(BaseModel):
    name: str
    path: str
    color_mode: str | None = None


class LutListResponse(BaseModel):
    luts: list[LutEntry]


class LutUploadResponse(BaseModel):
    name: str
    path: str


class LutColorsResponse(BaseModel):
    colors: list[dict[str, Any]]


class LutMergeRequest(BaseModel):
    primary_lut_name: str
    secondary_lut_name: str
    dedup_threshold: float = 5.0
