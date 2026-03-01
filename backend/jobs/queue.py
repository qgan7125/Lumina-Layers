from __future__ import annotations

import asyncio
import time
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from backend.jobs.models import JobRecord

_executor = ThreadPoolExecutor(max_workers=2)
_jobs: dict[str, JobRecord] = {}
_lock = asyncio.Lock()

JOB_TTL_SECONDS = 30 * 60  # 30 minutes


async def submit_job(fn: Callable[[], dict[str, Any]]) -> JobRecord:
    """Create a JobRecord, submit fn to the thread pool, return the record."""
    record = JobRecord()
    async with _lock:
        _jobs[record.id] = record

    loop = asyncio.get_running_loop()

    def _run() -> None:
        record.mark_running()
        try:
            result = fn()
            record.mark_done(result)
        except Exception as exc:
            record.mark_error(str(exc))

    loop.run_in_executor(_executor, _run)
    return record


async def get_job(job_id: str) -> JobRecord | None:
    async with _lock:
        return _jobs.get(job_id)


async def prune_old_jobs() -> None:
    """Remove job records older than JOB_TTL_SECONDS. Called by background task."""
    cutoff = time.time() - JOB_TTL_SECONDS
    async with _lock:
        expired = [jid for jid, r in _jobs.items() if r.created_at < cutoff]
        for jid in expired:
            del _jobs[jid]
