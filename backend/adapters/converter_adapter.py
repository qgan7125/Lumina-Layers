from __future__ import annotations

# ── Gradio stub ────────────────────────────────────────────────────────────────
# core/converter.py does `import gradio as gr` at module level.
# We install a no-op stub before any core import so the real Gradio package is
# never needed in the FastAPI environment.
import sys
from types import ModuleType


class _StubSelectData:
    def __init__(self, index: list[int]) -> None:
        self.index = index


class _StubProgress:
    def __call__(self, *a: object, **kw: object) -> None:
        pass

    def tqdm(self, *a: object, **kw: object):
        return iter([])


class _StubGradio(ModuleType):
    Progress = _StubProgress
    SelectData = _StubSelectData


sys.modules.setdefault("gradio", _StubGradio("gradio"))

# Also stub ui.palette_extension – update_preview_with_replacements imports it
_ui_mod = ModuleType("ui")
_pal_mod = ModuleType("ui.palette_extension")
_pal_mod.generate_palette_html = lambda *a, **kw: ""  # type: ignore[attr-defined]
_pal_mod.generate_lut_color_grid_html = lambda *a, **kw: ""  # type: ignore[attr-defined]
sys.modules.setdefault("ui", _ui_mod)
sys.modules.setdefault("ui.palette_extension", _pal_mod)

# ── Safe core imports ─────────────────────────────────────────────────────────
import os
import uuid
from typing import Any

import numpy as np
from PIL import Image

from config import OUTPUT_DIR
from core.converter import (
    extract_lut_available_colors,
    generate_auto_height_map,
    generate_final_model,
    generate_highlight_preview,
    generate_preview_cached,
    render_preview,
    update_preview_with_replacements,
)
from core.color_analyzer import ColorAnalyzer


# ── Helpers ───────────────────────────────────────────────────────────────────

def _session_dir(session_id: str) -> str:
    path = os.path.join(OUTPUT_DIR, ".sessions", session_id)
    os.makedirs(path, exist_ok=True)
    return path


def _save_image(img: Any, session_id: str, name: str) -> str:
    """Persist a PIL Image or (H,W,4) numpy array as PNG. Returns the file path."""
    path = os.path.join(_session_dir(session_id), name)
    if isinstance(img, np.ndarray):
        Image.fromarray(img.astype(np.uint8)).save(path)
    else:
        img.save(path)
    return path


# ── Public adapter API ────────────────────────────────────────────────────────

def adapter_generate_preview(
    session_id: str,
    image_path: str,
    lut_path: str,
    target_width_mm: float,
    auto_bg: bool,
    bg_tol: float,
    color_mode: str,
    modeling_mode: str,
    quantize_colors: int,
    backing_color_id: int,
    enable_cleanup: bool,
    is_dark: bool,
) -> dict[str, Any]:
    display, cache, status = generate_preview_cached(
        image_path=image_path,
        lut_path=lut_path,
        target_width_mm=target_width_mm,
        auto_bg=auto_bg,
        bg_tol=bg_tol,
        color_mode=color_mode,
        modeling_mode=modeling_mode,
        quantize_colors=quantize_colors,
        backing_color_id=backing_color_id,
        enable_cleanup=enable_cleanup,
        is_dark=is_dark,
    )
    if cache is None:
        raise RuntimeError(status)

    preview_path = _save_image(display, session_id, "preview.png")
    return {
        "preview_path": preview_path,
        "status": status,
        "color_palette": cache.get("color_palette", []),
        "dimensions": [cache.get("target_w"), cache.get("target_h")],
    }


def adapter_apply_replacement(
    cache: dict[str, Any],
    color_replacements: dict[str, str],
    session_id: str,
) -> dict[str, Any]:
    display, updated_cache, _ = update_preview_with_replacements(
        cache=cache,
        color_replacements=color_replacements,
    )
    if display is None:
        raise RuntimeError("apply_replacement returned no image")

    preview_path = _save_image(display, session_id, "preview_replaced.png")
    return {
        "preview_path": preview_path,
        "color_palette": updated_cache.get("color_palette", []),
    }, updated_cache


def adapter_highlight_color(
    cache: dict[str, Any],
    highlight_color: str,
    session_id: str,
) -> dict[str, Any]:
    display, *_ = generate_highlight_preview(
        cache=cache,
        highlight_color=highlight_color,
    )
    if display is None:
        raise RuntimeError("highlight_color returned no image")

    preview_path = _save_image(display, session_id, "preview_highlight.png")
    return {"preview_path": preview_path}


def adapter_generate_3mf(
    session_id: str,
    image_path: str,
    lut_path: str,
    target_width_mm: float,
    spacer_thick: float,
    structure_mode: str,
    auto_bg: bool,
    bg_tol: float,
    color_mode: str,
    add_loop: bool,
    loop_width: float,
    loop_length: float,
    loop_hole: float,
    loop_pos: list[float] | None,
    modeling_mode: str,
    quantize_colors: int,
    color_replacements: dict[str, str] | None,
    backing_color_name: str,
    separate_backing: bool,
    enable_relief: bool,
    color_height_map: dict[str, float] | None,
    heightmap_path: str | None,
    heightmap_max_height: float | None,
    enable_cleanup: bool,
    enable_outline: bool,
    outline_width: float,
    enable_cloisonne: bool,
    wire_width_mm: float,
    wire_height_mm: float,
    free_color_set: list[str] | None,
    enable_coating: bool,
    coating_height_mm: float,
) -> dict[str, Any]:
    result_path = generate_final_model(
        image_path=image_path,
        lut_path=lut_path,
        target_width_mm=target_width_mm,
        spacer_thick=spacer_thick,
        structure_mode=structure_mode,
        auto_bg=auto_bg,
        bg_tol=bg_tol,
        color_mode=color_mode,
        add_loop=add_loop,
        loop_width=loop_width,
        loop_length=loop_length,
        loop_hole=loop_hole,
        loop_pos=loop_pos,
        modeling_mode=modeling_mode,
        quantize_colors=quantize_colors,
        color_replacements=color_replacements or {},
        backing_color_name=backing_color_name,
        separate_backing=separate_backing,
        enable_relief=enable_relief,
        color_height_map=color_height_map or {},
        heightmap_path=heightmap_path,
        heightmap_max_height=heightmap_max_height,
        enable_cleanup=enable_cleanup,
        enable_outline=enable_outline,
        outline_width=outline_width,
        enable_cloisonne=enable_cloisonne,
        wire_width_mm=wire_width_mm,
        wire_height_mm=wire_height_mm,
        free_color_set=free_color_set,
        enable_coating=enable_coating,
        coating_height_mm=coating_height_mm,
    )
    filename = os.path.basename(result_path)
    return {"filename": filename, "file_path": result_path}


def adapter_batch_generate(
    image_paths: list[str],
    lut_path: str,
    target_width_mm: float,
    spacer_thick: float,
    structure_mode: str,
    auto_bg: bool,
    bg_tol: float,
    color_mode: str,
    modeling_mode: str,
    quantize_colors: int,
    backing_color_name: str,
) -> dict[str, Any]:
    """Re-implemented batch logic (~30 lines) — avoids calling process_batch_generation()
    which holds a gr.Progress default argument."""
    results = []
    errors = []
    for img_path in image_paths:
        try:
            result_path = generate_final_model(
                image_path=img_path,
                lut_path=lut_path,
                target_width_mm=target_width_mm,
                spacer_thick=spacer_thick,
                structure_mode=structure_mode,
                auto_bg=auto_bg,
                bg_tol=bg_tol,
                color_mode=color_mode,
                add_loop=False,
                loop_width=4,
                loop_length=8,
                loop_hole=2.5,
                loop_pos=None,
                modeling_mode=modeling_mode,
                quantize_colors=quantize_colors,
                color_replacements={},
                backing_color_name=backing_color_name,
            )
            results.append(os.path.basename(result_path))
        except Exception as exc:
            errors.append({"image": img_path, "error": str(exc)})
    return {"completed": results, "errors": errors}


def adapter_auto_height_map(
    color_list: list[dict[str, Any]],
    mode: str,
    base_thickness: float,
    max_relief_height: float,
) -> dict[str, Any]:
    result = generate_auto_height_map(color_list, mode, base_thickness, max_relief_height)
    return {"color_height_map": result}


def adapter_extract_lut_colors(lut_path: str) -> list[dict[str, Any]]:
    return extract_lut_available_colors(lut_path)


def adapter_auto_detect_colors(image_path: str, num_colors: int) -> dict[str, Any]:
    analyzer = ColorAnalyzer()
    result = analyzer.analyze(image_path, num_colors=num_colors)
    return result
