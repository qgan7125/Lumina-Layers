from __future__ import annotations

# Gradio stub must be installed before any core import.
# converter_adapter installs it; import that first if it hasn't been done yet.
import sys

if "gradio" not in sys.modules:
    from backend.adapters.converter_adapter import _StubGradio  # noqa: F401

import os
from typing import Any

import cv2
import numpy as np
from PIL import Image

from config import OUTPUT_DIR
from core.extractor import (
    draw_corner_points,
    manual_fix_cell,
    rotate_image,
    run_extraction,
)


def _session_dir(session_id: str) -> str:
    path = os.path.join(OUTPUT_DIR, ".sessions", session_id)
    os.makedirs(path, exist_ok=True)
    return path


def _save_ndarray(arr: np.ndarray, session_id: str, name: str) -> str:
    path = os.path.join(_session_dir(session_id), name)
    if arr.dtype != np.uint8:
        arr = arr.astype(np.uint8)
    Image.fromarray(arr).save(path)
    return path


def adapter_rotate_image(
    image_path: str,
    direction: str,
    session_id: str,
) -> dict[str, Any]:
    img = cv2.imread(image_path)
    if img is None:
        raise RuntimeError(f"Cannot read image: {image_path}")
    rotated = rotate_image(img, direction)
    out_path = os.path.join(_session_dir(session_id), "extractor_rotated.png")
    cv2.imwrite(out_path, rotated)
    return {"image_path": out_path}


def adapter_draw_corner_points(
    image_path: str,
    points: list[list[float]],
    color_mode: str,
    session_id: str,
) -> dict[str, Any]:
    img = cv2.imread(image_path)
    if img is None:
        raise RuntimeError(f"Cannot read image: {image_path}")
    result = draw_corner_points(img, points, color_mode)
    out_path = os.path.join(_session_dir(session_id), "extractor_corners.png")
    cv2.imwrite(out_path, result)
    return {"image_path": out_path}


def adapter_run_extraction(
    image_path: str,
    points: list[list[float]],
    offset_x: float,
    offset_y: float,
    zoom: float,
    barrel: float,
    wb: bool,
    bright: bool,
    color_mode: str,
    session_id: str,
) -> dict[str, Any]:
    img = cv2.imread(image_path)
    if img is None:
        raise RuntimeError(f"Cannot read image: {image_path}")

    vis, preview, lut_path, status = run_extraction(
        img, points, offset_x, offset_y, zoom, barrel, wb, bright, color_mode
    )
    if lut_path is None:
        raise RuntimeError(status)

    vis_path = _save_ndarray(vis, session_id, "extractor_vis.png")
    preview_path = _save_ndarray(preview, session_id, "extractor_preview.png")
    return {
        "vis_path": vis_path,
        "preview_path": preview_path,
        "lut_path": lut_path,
        "status": status,
    }


def adapter_probe_lut_cell(
    lut_path: str,
    x: float,
    y: float,
) -> dict[str, Any]:
    """Call probe_lut_cell with a synthetic SelectData-like object."""
    from gradio import SelectData  # uses our stub

    evt = SelectData([x, y])
    html, hex_color, coord = probe_lut_cell(lut_path, evt)
    return {"html": html, "hex": hex_color, "coord": list(coord) if coord else None}


def adapter_manual_fix_cell(
    coord: list[int],
    color_hex: str,
    lut_path: str | None,
) -> dict[str, Any]:
    preview, status = manual_fix_cell(tuple(coord), color_hex, lut_path)
    return {"status": status}


def adapter_merge_8color(
    lut_paths: list[str],
) -> dict[str, Any]:
    """Concatenate two 4-color LUT arrays into an 8-color NPY file."""
    arrays = [np.load(p) for p in lut_paths]
    merged = np.concatenate(arrays, axis=0)
    out_path = os.path.join(OUTPUT_DIR, "lumina_lut_8color_merged.npy")
    np.save(out_path, merged)
    return {"lut_path": out_path, "filename": os.path.basename(out_path)}


# Local import of probe_lut_cell (needs gradio stub already in sys.modules)
from core.extractor import probe_lut_cell  # noqa: E402
