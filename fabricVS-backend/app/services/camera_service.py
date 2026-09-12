import sqlite3

from fastapi import HTTPException

from app.cameras.manager import CameraManager
from app.database.connection import get_connection
from app.schemas.camera import CameraCreate, CameraUpdate


def list_cameras(machine_id: str | None = None) -> list[dict]:
    query = "SELECT * FROM cameras"
    values: tuple[str, ...] = ()
    if machine_id:
        query += " WHERE machine_id = ?"
        values = (machine_id,)
    query += " ORDER BY id"
    with get_connection() as connection:
        return [dict(row) for row in connection.execute(query, values)]


def get_camera(camera_id: str) -> dict:
    with get_connection() as connection:
        row = connection.execute("SELECT * FROM cameras WHERE id = ?", (camera_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Camera not found.")
    return dict(row)


def create_camera(payload: CameraCreate, manager: CameraManager) -> dict:
    try:
        with get_connection() as connection:
            connection.execute(
                """INSERT INTO cameras
                   (id, machine_id, name, position, device_index, resolution, fps, enabled)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (payload.id, payload.machine_id, payload.name, payload.position, payload.device_index,
                 payload.resolution, payload.fps, int(payload.enabled)),
            )
    except sqlite3.IntegrityError as error:
        raise HTTPException(status_code=409, detail="Camera ID or machine does not exist.") from error
    manager.configure(**_worker_arguments(get_camera(payload.id)))
    return get_camera(payload.id)


def update_camera(camera_id: str, payload: CameraUpdate, manager: CameraManager) -> dict:
    changes = payload.model_dump(exclude_none=True)
    if changes:
        assignments = ", ".join(f"{field} = ?" for field in changes)
        with get_connection() as connection:
            cursor = connection.execute(
                f"UPDATE cameras SET {assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (*changes.values(), camera_id)
            )
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Camera not found.")
    camera = get_camera(camera_id)
    manager.configure(**_worker_arguments(camera))
    return camera


def delete_camera(camera_id: str, manager: CameraManager) -> None:
    with get_connection() as connection:
        cursor = connection.execute("DELETE FROM cameras WHERE id = ?", (camera_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Camera not found.")
    manager.remove(camera_id)


def connect_camera(camera_id: str, manager: CameraManager) -> dict:
    camera = get_camera(camera_id)
    manager.configure(**_worker_arguments(camera))
    try:
        manager.connect(camera_id)
        _update_status(camera_id, "online", None)
    except RuntimeError as error:
        _update_status(camera_id, "offline", str(error))
    return get_camera(camera_id)


def _update_status(camera_id: str, status: str, last_error: str | None) -> None:
    with get_connection() as connection:
        connection.execute(
            "UPDATE cameras SET status = ?, last_error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (status, last_error, camera_id),
        )


def _worker_arguments(camera: dict) -> dict:
    return {
        "camera_id": camera["id"],
        "device_index": camera["device_index"],
        "resolution": camera["resolution"],
        "fps": camera["fps"],
    }
