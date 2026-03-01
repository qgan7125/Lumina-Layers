from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Any


@dataclass
class JobRecord:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "pending"  # pending | running | done | error
    result: dict[str, Any] | None = None
    error: str | None = None
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)

    def mark_running(self) -> None:
        self.status = "running"
        self.updated_at = time.time()

    def mark_done(self, result: dict[str, Any]) -> None:
        self.status = "done"
        self.result = result
        self.updated_at = time.time()

    def mark_error(self, message: str) -> None:
        self.status = "error"
        self.error = message
        self.updated_at = time.time()
