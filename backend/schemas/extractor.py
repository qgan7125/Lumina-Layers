from __future__ import annotations

from pydantic import BaseModel


class UploadExtractorImageResponse(BaseModel):
    session_id: str
    image_path: str


class RotateRequest(BaseModel):
    session_id: str
    direction: str  # "left" | "right"


class RotateResponse(BaseModel):
    image_path: str



class ExtractRequest(BaseModel):
    session_id: str
    points: list[list[float]]
    offset_x: float = 0.0
    offset_y: float = 0.0
    zoom: float = 1.0
    barrel: float = 0.0
    wb: bool = True
    bright: bool = False
    color_mode: str = "4-Color"


class ProbeCellRequest(BaseModel):
    lut_name: str
    x: float
    y: float


class ProbeCellResponse(BaseModel):
    hex: str
    coord: list[int]


class ManualFixCellRequest(BaseModel):
    coord: list[int]
    color_hex: str
    lut_name: str | None = None


class ManualFixCellResponse(BaseModel):
    status: str


class Merge8ColorRequest(BaseModel):
    lut_names: list[str]


class Merge8ColorResponse(BaseModel):
    filename: str
