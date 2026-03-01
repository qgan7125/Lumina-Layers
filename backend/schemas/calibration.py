from __future__ import annotations

from pydantic import BaseModel, Field


class GenerateCalibrationRequest(BaseModel):
    mode: str  # "4-Color" | "6-Color" | "8-Color" | "BW" | "smart"
    block_size_mm: float = 5.0
    gap_mm: float = 0.8
    backing_color: str = "White"
    page_index: int = 0
