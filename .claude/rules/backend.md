# Backend Rules

## Formatter

- **Black** is the sole formatter — line length 88, Python 3.10 target
- Config lives in `backend/pyproject.toml`
- Run: `cd backend && black .`
- Never manually format — always defer to Black

## File Organization

```
backend/
├── main.py          ← App init, router registration, lifespan hooks only
├── api/             ← One file per resource group; routers only, no logic
│   ├── converter.py
│   ├── calibration.py
│   ├── extractor.py
│   ├── lut.py
│   ├── settings.py
│   └── files.py
├── jobs/            ← Job queue (queue.py) and JobRecord model (models.py)
├── session/         ← In-memory session store (store.py)
├── adapters/        ← Thin wrappers isolating core/ from FastAPI concerns
└── schemas/         ← Pydantic request/response models only; no logic here
```

New files must go in the correct folder — never place logic in `main.py` or schema files.

## Route Handlers

Route handlers in `api/` must be **thin**:

```python
# ✅ correct — validate → call adapter → return schema
@router.post("/generate-preview", response_model=JobResponse)
async def generate_preview(body: GeneratePreviewRequest) -> JobResponse:
    job = await adapter.generate_preview(body)
    return JobResponse(job_id=job.id)

# ❌ wrong — business logic inside the route handler
@router.post("/generate-preview")
async def generate_preview(body: GeneratePreviewRequest):
    lut_path = lut_manager.get_lut_path(body.lut_name)
    processor = LuminaImageProcessor(lut_path, body.color_mode)
    result = processor.process_image(...)  # belongs in adapter
```

## Python Patterns

- `from __future__ import annotations` at the top of every file
- Type-annotate every function signature — no bare `Any` unless truly unavoidable
- Use Pydantic v2 models for all request bodies and responses
- All route handlers are `async def`; blocking core calls go through `run_in_executor`
- Raise `HTTPException` for client errors; let unhandled exceptions bubble to a global handler
- No mutable default arguments — use `None` + guard instead

## Dependencies

- Virtual environment: `backend/fastapi-env/`
- Activate: `source backend/fastapi-env/bin/activate`
- Install: `pip install -r backend/requirements.txt`
- Add new package: `pip install <pkg> && pip freeze > backend/requirements.txt`
