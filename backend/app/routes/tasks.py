"""
Task and week endpoints.
"""

from datetime import date, timedelta
from fastapi import APIRouter, HTTPException

from app.supabase_client import get_supabase
from app.models import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    WeeksResponse,
    OkResponse,
    TaskRow,
)

router = APIRouter(tags=["tasks"])


def get_sunday_for_date(d: date) -> date:
    """Get the Sunday (week start) for a given date."""
    days_since_sunday = d.weekday() + 1  # Monday=0, so Sunday=6 -> +1 = 7, mod 7 = 0
    if d.weekday() == 6:  # Sunday
        return d
    return d - timedelta(days=(d.weekday() + 1) % 7)


def format_date_iso(d: date) -> str:
    """Format date as ISO string (YYYY-MM-DD)."""
    return d.isoformat()


# --- Week endpoints ---

@router.get("/weeks", response_model=WeeksResponse)
def get_weeks():
    """
    Get all available week starts (Sundays) that have tasks.
    Always includes the current week.
    """
    supabase = get_supabase()

    response = supabase.table("tasks").select("assigned_date").execute()

    week_starts: set[str] = set()

    # Always include current week
    today = date.today()
    current_sunday = get_sunday_for_date(today)
    week_starts.add(format_date_iso(current_sunday))

    # Add weeks from existing tasks
    for row in response.data or []:
        assigned = row.get("assigned_date")
        if assigned:
            task_date = date.fromisoformat(assigned)
            sunday = get_sunday_for_date(task_date)
            week_starts.add(format_date_iso(sunday))

    # Sort descending (most recent first)
    sorted_weeks = sorted(week_starts, reverse=True)

    return WeeksResponse(weekStartsISO=sorted_weeks)


@router.get("/weeks/{week_start_iso}/tasks", response_model=TaskListResponse)
def get_week_tasks(week_start_iso: str):
    """
    Get all tasks for a specific week.
    week_start_iso should be the Sunday date in YYYY-MM-DD format.
    """
    supabase = get_supabase()

    try:
        week_start = date.fromisoformat(week_start_iso)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    week_end = week_start + timedelta(days=6)

    response = (
        supabase.table("tasks")
        .select("*")
        .gte("assigned_date", format_date_iso(week_start))
        .lte("assigned_date", format_date_iso(week_end))
        .execute()
    )

    tasks = []
    for row in response.data or []:
        tasks.append(TaskRow(
            id=row["id"],
            created_at=row["created_at"],
            title=row["title"],
            status=row.get("status", "open"),
            assigned_date=row["assigned_date"],
            position=row.get("position", 0),
            notes=row.get("notes"),
            start_date=row.get("start_date"),
            end_date=row.get("end_date"),
            start_time=row.get("start_time"),
            end_time=row.get("end_time"),
            links=row.get("links") or [],
            location=row.get("location"),
        ))

    return TaskListResponse(tasks=tasks)


@router.delete("/weeks/{week_start_iso}/tasks", response_model=OkResponse)
def delete_week_tasks(week_start_iso: str):
    """
    Delete all tasks for a specific week (for clearCurrentWeek).
    """
    supabase = get_supabase()

    try:
        week_start = date.fromisoformat(week_start_iso)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    week_end = week_start + timedelta(days=6)

    supabase.table("tasks").delete().gte(
        "assigned_date", format_date_iso(week_start)
    ).lte(
        "assigned_date", format_date_iso(week_end)
    ).execute()

    return OkResponse()


# --- Day endpoints ---

@router.delete("/days/{assigned_date_iso}/tasks", response_model=OkResponse)
def delete_day_tasks(assigned_date_iso: str):
    """
    Delete all tasks for a specific day (for deleteAllForDay).
    """
    supabase = get_supabase()

    try:
        date.fromisoformat(assigned_date_iso)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    supabase.table("tasks").delete().eq("assigned_date", assigned_date_iso).execute()

    return OkResponse()


# --- Task CRUD endpoints ---

@router.post("/tasks", response_model=TaskResponse)
def create_task(payload: TaskCreate):
    """
    Create a new task.
    """
    supabase = get_supabase()

    insert_data = {
        "title": payload.title,
        "assigned_date": format_date_iso(payload.assigned_date),
        "position": payload.position,
        "status": payload.status,
        "notes": payload.notes or "",
        "links": payload.links,
    }

    response = supabase.table("tasks").insert(insert_data).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create task")

    row = response.data[0]
    task = TaskRow(
        id=row["id"],
        created_at=row["created_at"],
        title=row["title"],
        status=row.get("status", "open"),
        assigned_date=row["assigned_date"],
        position=row.get("position", 0),
        notes=row.get("notes"),
        start_date=row.get("start_date"),
        end_date=row.get("end_date"),
        start_time=row.get("start_time"),
        end_time=row.get("end_time"),
        links=row.get("links") or [],
        location=row.get("location"),
    )

    return TaskResponse(task=task)


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: str, payload: TaskUpdate):
    """
    Update an existing task.
    Only provided fields are updated.
    """
    supabase = get_supabase()

    # Build update dict from non-None fields
    update_data: dict = {}

    if payload.title is not None:
        update_data["title"] = payload.title
    if payload.status is not None:
        update_data["status"] = payload.status
    if payload.notes is not None:
        update_data["notes"] = payload.notes
    if payload.start_date is not None:
        update_data["start_date"] = format_date_iso(payload.start_date)
    if payload.end_date is not None:
        update_data["end_date"] = format_date_iso(payload.end_date)
    if payload.start_time is not None:
        update_data["start_time"] = payload.start_time
    if payload.end_time is not None:
        update_data["end_time"] = payload.end_time
    if payload.links is not None:
        update_data["links"] = payload.links
    if payload.location is not None:
        # Convert Pydantic model to dict if needed
        if hasattr(payload.location, "model_dump"):
            update_data["location"] = payload.location.model_dump()
        else:
            update_data["location"] = payload.location
    if payload.position is not None:
        update_data["position"] = payload.position
    if payload.assigned_date is not None:
        update_data["assigned_date"] = format_date_iso(payload.assigned_date)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    response = supabase.table("tasks").update(update_data).eq("id", task_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found")

    row = response.data[0]
    task = TaskRow(
        id=row["id"],
        created_at=row["created_at"],
        title=row["title"],
        status=row.get("status", "open"),
        assigned_date=row["assigned_date"],
        position=row.get("position", 0),
        notes=row.get("notes"),
        start_date=row.get("start_date"),
        end_date=row.get("end_date"),
        start_time=row.get("start_time"),
        end_time=row.get("end_time"),
        links=row.get("links") or [],
        location=row.get("location"),
    )

    return TaskResponse(task=task)


@router.delete("/tasks/{task_id}", response_model=OkResponse)
def delete_task(task_id: str):
    """
    Delete a task by ID.
    """
    supabase = get_supabase()

    supabase.table("tasks").delete().eq("id", task_id).execute()

    return OkResponse()
