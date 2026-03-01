from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class JobResponse(BaseModel):
    job_id: str


class JobStatusResponse(BaseModel):
    job_id: str
    status: str  # pending | running | done | error
    result: dict[str, Any] | None = None
    error: str | None = None
