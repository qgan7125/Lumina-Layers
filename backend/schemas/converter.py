from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class UploadImageResponse(BaseModel):
    session_id: str
    image_path: str
    filename: str



class GeneratePreviewRequest(BaseModel):
    session_id: str
    lut_name: str
    target_width_mm: float = 80.0
    auto_bg: bool = True
    bg_tol: float = 30.0
    color_mode: str = "4-Color"
    modeling_mode: str = "high-fidelity"
    quantize_colors: int = Field(64, ge=8, le=256)
    backing_color_id: int = 0
    enable_cleanup: bool = True
    is_dark: bool = True


class ApplyReplacementRequest(BaseModel):
    session_id: str
    color_replacements: dict[str, str]


class ApplyReplacementResponse(BaseModel):
    preview_url: str
    color_palette: list[dict[str, Any]]


class HighlightColorRequest(BaseModel):
    session_id: str
    highlight_color: str


class HighlightColorResponse(BaseModel):
    preview_url: str


class Generate3mfRequest(BaseModel):
    session_id: str
    lut_name: str
    target_width_mm: float = 80.0
    spacer_thick: float = 1.6
    structure_mode: str = "solid"
    auto_bg: bool = True
    bg_tol: float = 30.0
    color_mode: str = "4-Color"
    add_loop: bool = False
    loop_width: float = 4.0
    loop_length: float = 8.0
    loop_hole: float = 2.5
    loop_pos: list[float] | None = None
    modeling_mode: str = "vector"
    quantize_colors: int = Field(64, ge=8, le=256)
    color_replacements: dict[str, str] = {}
    backing_color_name: str = "White"
    separate_backing: bool = False
    enable_relief: bool = False
    color_height_map: dict[str, float] = {}
    heightmap_path: str | None = None
    heightmap_max_height: float | None = None
    enable_cleanup: bool = True
    enable_outline: bool = False
    outline_width: float = 2.0
    enable_cloisonne: bool = False
    wire_width_mm: float = 0.4
    wire_height_mm: float = 0.4
    free_color_set: list[str] | None = None
    enable_coating: bool = False
    coating_height_mm: float = 0.08


class AutoHeightMapRequest(BaseModel):
    color_list: list[dict[str, Any]]
    mode: str
    base_thickness: float = 1.6
    max_relief_height: float = 2.0


class AutoHeightMapResponse(BaseModel):
    color_height_map: dict[str, float]


class AutoDetectColorsRequest(BaseModel):
    session_id: str
    num_colors: int = Field(8, ge=2, le=32)


class BatchGenerateRequest(BaseModel):
    session_ids: list[str]
    lut_name: str
    target_width_mm: float = 80.0
    spacer_thick: float = 1.6
    structure_mode: str = "solid"
    auto_bg: bool = True
    bg_tol: float = 30.0
    color_mode: str = "4-Color"
    modeling_mode: str = "vector"
    quantize_colors: int = Field(64, ge=8, le=256)
    backing_color_name: str = "White"
