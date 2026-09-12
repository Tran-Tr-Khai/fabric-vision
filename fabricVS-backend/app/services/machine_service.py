import sqlite3

from fastapi import HTTPException, status

from app.database.connection import get_connection
from app.schemas.machine import MachineCreate, MachineUpdate


def list_machines() -> list[dict]:
    with get_connection() as connection:
        return [dict(row) for row in connection.execute("SELECT * FROM machines ORDER BY machine_code")]


def get_machine(machine_id: str) -> dict:
    with get_connection() as connection:
        row = connection.execute("SELECT * FROM machines WHERE id = ?", (machine_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Machine not found.")
    return dict(row)


def create_machine(payload: MachineCreate) -> dict:
    try:
        with get_connection() as connection:
            connection.execute(
                """INSERT INTO machines (id, name, machine_code, fabric, roll, operator)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (payload.id, payload.name, payload.machine_code, payload.fabric, payload.roll, payload.operator),
            )
            connection.execute("INSERT INTO capture_settings (machine_id) VALUES (?)", (payload.id,))
    except sqlite3.IntegrityError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Machine ID or code already exists.") from error
    return get_machine(payload.id)


def update_machine(machine_id: str, payload: MachineUpdate) -> dict:
    changes = payload.model_dump(exclude_none=True)
    if not changes:
        return get_machine(machine_id)
    assignments = ", ".join(f"{field} = ?" for field in changes)
    try:
        with get_connection() as connection:
            cursor = connection.execute(
                f"UPDATE machines SET {assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (*changes.values(), machine_id)
            )
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Machine not found.")
    except sqlite3.IntegrityError as error:
        raise HTTPException(status_code=409, detail="Machine code already exists.") from error
    return get_machine(machine_id)
