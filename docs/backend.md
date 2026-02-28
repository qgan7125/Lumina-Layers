# Backend

FastAPI application in `backend/`. Wraps `core/` and `utils/` via a thin adapter layer — no core logic is re-implemented here.

---

## The Gradio Adapter Problem

`core/converter.py` contains `import gradio as gr` and uses `gr.Progress()` as a default argument, which evaluates at import time.

**Solution — zero changes to `core/converter.py`:**

`backend/adapters/converter_adapter.py` installs a stub before importing the module:

```python
# converter_adapter.py
import sys
from types import ModuleType

class _StubProgress:
    def __call__(self, *a, **kw): pass
    def tqdm(self, *a, **kw): return iter([])

class _StubGradio(ModuleType):
    Progress = _StubProgress

sys.modules.setdefault('gradio', _StubGradio('gradio'))

from core.converter import convert_image_to_3d, generate_preview_cached  # now safe
```

The adapter calls `convert_image_to_3d()` directly and never touches `process_batch_generation()` (which holds the `gr.Progress` default). Batch logic is re-implemented in the adapter (~30 lines).

---

## Session Store

**In-memory Python `dict`** — no Redis, no SQLite.

Each session is created when an image is uploaded and keyed by a UUID4 `session_id`.

```python
# backend/session/store.py
SessionData = {
  "created_at": float,
  "last_used": float,
  "image_path": str,            # uploaded image on disk
  "cropped_path": str | None,
  "heightmap_path": str | None,
  "lut_path": str | None,
  "preview_cache": {            # numpy arrays stay in RAM
    "matched_rgb":      ndarray,  # (H,W,3) uint8
    "material_matrix":  ndarray,  # (H,W,5) int32
    "mask_solid":       ndarray,  # (H,W) bool
    "preview_rgba":     ndarray,  # (H,W,4) uint8
    "color_palette":    list,
    "color_conf":       dict,
    "dimensions":       tuple,
    "pixel_scale":      float,
  } | None
}
```

- Session files written to `output/.sessions/{session_id}/`
- TTL: 2-hour inactivity — pruned by a background asyncio task
- Frontend holds `session_id` in React state + `sessionStorage` (survives page refresh)
- `replacement_map`, undo history, `color_height_map`, `free_color_set` live in Zustand on the frontend — sent to the server only at generate time

---

## Job Queue

**In-process `asyncio` + `ThreadPoolExecutor`** — no Celery, no Redis.

```
POST /api/*/  →  create JobRecord(id, status=pending)
              →  submit blocking fn to ThreadPoolExecutor(max_workers=2)
              →  return {"job_id": "..."}

Worker thread →  runs core function (K-Means, mesh gen, etc.)
              →  writes output files to disk
              →  updates JobRecord(status=done, result={...})

GET /api/*/job-status/{id}  →  read JobRecord  →  return status + file URLs
```

Frontend polls every **1000ms** using React Query's `refetchInterval`. Stops automatically on `"done"` or `"error"`. Job records older than 30 minutes are pruned by a background task.

**`max_workers=2`**: Heavy operations are CPU/memory-bound (NumPy, Shapely). More than 2 concurrent workers would thrash a desktop machine.

### Heavy operations (async job)

| Endpoint | Reason | Typical duration |
|----------|--------|-----------------|
| `POST /api/converter/generate-preview` | K-Means + CIELAB KD-Tree matching | 3–10 s |
| `POST /api/converter/generate-3mf` | Full mesh generation | 5–30 s |
| `POST /api/converter/batch-generate` | Multiple images | variable |
| `POST /api/calibration/generate` | 7776-color simulation (6-color smart board) | 5–15 s |
| `POST /api/extractor/extract` | Perspective transform + grid sampling | 2–8 s |
| `POST /api/lut/merge` | Delta-E deduplication over large LUTs | 3–10 s |

### Fast operations (sync, no job)

`apply-replacement`, `highlight-color`, crop, rotate, all LUT list/upload/delete, all settings reads/writes — all sub-100ms.

---

## API Endpoints

### Converter

| Method | Path | Mode | Core call |
|--------|------|------|-----------|
| POST | `/api/converter/upload-image` | sync | `image_preprocessor` |
| POST | `/api/converter/crop` | sync | `PIL.Image.crop` |
| POST | `/api/converter/upload-heightmap` | sync | file save |
| POST | `/api/converter/generate-preview` | **job** | `converter_adapter.generate_preview()` |
| GET  | `/api/converter/job-status/{job_id}` | sync | job store |
| POST | `/api/converter/apply-replacement` | sync | `converter.update_preview_with_replacements()` |
| POST | `/api/converter/highlight-color` | sync | `converter.generate_highlight_preview()` |
| POST | `/api/converter/generate-3mf` | **job** | `converter_adapter.convert()` |
| POST | `/api/converter/auto-height-map` | sync | `converter.generate_auto_height_map()` |
| POST | `/api/converter/auto-detect-colors` | sync | `color_analyzer.ColorAnalyzer.analyze()` |
| POST | `/api/converter/batch-generate` | **job** | `converter_adapter.batch_convert()` |

### Calibration

| Method | Path | Mode | Core call |
|--------|------|------|-----------|
| POST | `/api/calibration/generate` | **job** | `calibration.generate_*()` |
| GET  | `/api/calibration/job-status/{job_id}` | sync | job store |

### Extractor

| Method | Path | Mode | Core call |
|--------|------|------|-----------|
| POST | `/api/extractor/upload` | sync | file save |
| POST | `/api/extractor/rotate` | sync | `extractor.rotate_image()` |
| POST | `/api/extractor/mark-corner` | sync | `extractor.draw_corner_points()` |
| POST | `/api/extractor/extract` | **job** | `extractor.run_extraction()` |
| GET  | `/api/extractor/job-status/{job_id}` | sync | job store |
| POST | `/api/extractor/probe-cell` | sync | `extractor.probe_lut_cell()` |
| POST | `/api/extractor/manual-fix-cell` | sync | `extractor.manual_fix_cell()` |
| POST | `/api/extractor/merge-8color` | sync | numpy concat |

### LUT Management

| Method | Path | Mode | Core call |
|--------|------|------|-----------|
| GET    | `/api/lut/list` | sync | `lut_manager.get_all_lut_files()` |
| POST   | `/api/lut/upload` | sync | `lut_manager.save_uploaded_lut()` |
| DELETE | `/api/lut/{lut_name}` | sync | `lut_manager.delete_lut()` |
| GET    | `/api/lut/{lut_name}/colors` | sync | `converter.extract_lut_available_colors()` |
| POST   | `/api/lut/merge` | **job** | `lut_merger` |
| GET    | `/api/lut/merge-status/{job_id}` | sync | job store |

### Settings

| Method | Path | Mode | Core call |
|--------|------|------|-----------|
| GET  | `/api/settings` | sync | settings file |
| POST | `/api/settings` | sync | settings file |
| GET  | `/api/settings/stats` | sync | `stats.get_all()` |
| POST | `/api/settings/clear-cache` | sync | `stats.clear_cache()` |
| POST | `/api/settings/reset-counters` | sync | `stats.reset_all()` |
| GET  | `/api/settings/slicers` | sync | detect installed slicers |
| POST | `/api/settings/open-in-slicer` | sync | `subprocess.Popen` |
| GET  | `/api/i18n/{lang}` | sync | `i18n.I18n.TEXTS` |

### File Serving

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/files/output/{filename}` | `FileResponse` from `output/` — 3MF, GLB, NPY |
| GET | `/api/files/session/{session_id}/{filename}` | `FileResponse` with session guard — preview PNGs |

---

## Key Source References

| File | Role |
|------|------|
| [core/converter.py](../core/converter.py) | Adapter contract — `generate_preview_cached()`, `update_preview_with_replacements()`, `convert_image_to_3d()` |
| [ui/callbacks.py](../ui/callbacks.py) | Every function here becomes a FastAPI endpoint handler |
| [config.py](../config.py) | `ModelingMode`, `ColorSystem`, `BedManager` → Pydantic validators / API responses |
