"""
Pydantic models for request/response validation.
"""

from datetime import date, datetime
from typing import Any
from pydantic import BaseModel, Field


# --- Task models ---

class TaskLocation(BaseModel):
    """Location data for a task."""
    name: str | None = None
    address: str | None = None
    lat: float | None = None
    lon: float | None = None


class TaskRow(BaseModel):
    """Task as returned from the database."""
    id: str
    created_at: datetime
    title: str
    status: str = "open"
    assigned_date: date
    position: int = 0
    notes: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    start_time: str | None = None
    end_time: str | None = None
    links: list[dict[str, Any]] = Field(default_factory=list)
    location: TaskLocation | dict[str, Any] | None = None


class TaskCreate(BaseModel):
    """Payload for creating a new task."""
    title: str
    assigned_date: date
    position: int = 0
    status: str = "open"
    notes: str | None = None
    links: list[dict[str, Any]] = Field(default_factory=list)


class TaskUpdate(BaseModel):
    """Payload for updating a task (all fields optional)."""
    title: str | None = None
    status: str | None = None
    notes: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    start_time: str | None = None
    end_time: str | None = None
    links: list[dict[str, Any]] | None = None
    location: TaskLocation | dict[str, Any] | None = None
    position: int | None = None
    assigned_date: date | None = None


# --- Response wrappers ---

class TaskResponse(BaseModel):
    """Single task response."""
    task: TaskRow


class TaskListResponse(BaseModel):
    """List of tasks response."""
    tasks: list[TaskRow]


class WeeksResponse(BaseModel):
    """Available week starts response."""
    weekStartsISO: list[str]


class OkResponse(BaseModel):
    """Simple success response."""
    ok: bool = True
